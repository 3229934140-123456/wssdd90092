import { create } from "zustand";
import type {
  EventItem,
  TimelineCard,
  ConcernItem,
  HandoffNote,
  MaterialItem,
  HandoffSection,
  EventHandoffStatus,
  HandoffStatusItem,
  UrgeMessage,
} from "@/types";
import {
  mockEvents,
  mockTimelineCards,
  mockConcerns,
  mockHandoffNotes,
  mockMaterials,
} from "@/data/mock";
import {
  getCurrentShift,
  getShiftRelation,
  STORAGE_KEY_HANDOFF,
  STORAGE_KEY_CONCERNS,
  STORAGE_KEY_HANDOFF_STATUS,
  STORAGE_KEY_MATERIALS,
} from "@/utils/shift";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // ignore
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function parseDeadline(deadline: string): Date {
  const parts = deadline.split("-");
  if (parts.length === 3) {
    return new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
      23,
      59,
      59
    );
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
}

function isMaterialOverdue(material: MaterialItem): boolean {
  if (material.status !== "pending") return false;
  const deadline = parseDeadline(material.deadline);
  const now = new Date();
  return now > deadline;
}

function generateUrgeMessage(material: MaterialItem): UrgeMessage {
  const overdue = isMaterialOverdue(material);
  const deadlineText = overdue
    ? `已于 ${material.deadline} 到期`
    : `截止日期为 ${material.deadline}`;

  const formalVersion = `【材料催办】

尊敬的${material.department}相关负责人：

您好！关于「${material.eventTitle}」事件，${material.type}尚未提交，${deadlineText}。

该材料为舆情处置和复盘工作的重要依据，请尽快安排提交。如有困难或需延期，请提前与融媒体中心值班室联系。

感谢配合！

融媒体中心值班室
${new Date().toLocaleDateString("zh-CN")}`;

  const wechatVersion = `${material.department}的老师您好～打扰啦！

关于「${material.eventTitle}」的${material.type}，${deadlineText}，麻烦帮忙尽快提交一下哦🙏

这个是舆情复盘要用的材料，辛苦啦！有问题随时联系我～`;

  return {
    id: `urge-${material.id}`,
    materialId: material.id,
    content: wechatVersion,
    formalVersion,
    wechatVersion,
    isOverdue: overdue,
  };
}

interface EventStore {
  events: EventItem[];
  timelineCards: TimelineCard[];
  concerns: ConcernItem[];
  handoffNotes: HandoffNote[];
  handoffStatuses: EventHandoffStatus[];
  materials: MaterialItem[];

  toggleConcernChecked: (concernId: string) => void;
  addHandoffNote: (
    eventId: string,
    section: HandoffSection,
    content: string,
    author: string
  ) => void;

  getEventHandoffStatus: (eventId: string) => EventHandoffStatus | undefined;
  acceptHandoff: (eventId: string, author: string) => void;
  toggleHandoffItemDone: (eventId: string, itemId: string) => void;
  addHandoffItem: (
    eventId: string,
    noteId: string,
    section: HandoffSection,
    content: string,
    author: string
  ) => void;
  getPendingHandoffItems: (eventId: string) => HandoffStatusItem[];
  getCompletedHandoffItems: (eventId: string) => HandoffStatusItem[];

  getMaterialsByEventId: (eventId: string) => MaterialItem[];
  getPendingMaterials: () => MaterialItem[];
  getCompletedMaterials: () => MaterialItem[];
  getMaterialsGroupedByEvent: () => Array<{
    eventId: string;
    eventTitle: string;
    materials: MaterialItem[];
    pendingCount: number;
  }>;
  setMaterialStatus: (
    materialId: string,
    status: MaterialItem["status"]
  ) => void;
  isMaterialOverdue: (material: MaterialItem) => boolean;
  generateUrgeMessage: (material: MaterialItem) => UrgeMessage;
  getOverdueMaterials: () => MaterialItem[];

  getShiftRelationForNote: (note: HandoffNote) => "current" | "previous" | "older";
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: mockEvents,
  timelineCards: mockTimelineCards,
  concerns: loadFromStorage<ConcernItem[]>(STORAGE_KEY_CONCERNS, mockConcerns),
  handoffNotes: loadFromStorage<HandoffNote[]>(STORAGE_KEY_HANDOFF, mockHandoffNotes),
  handoffStatuses: loadFromStorage<EventHandoffStatus[]>(STORAGE_KEY_HANDOFF_STATUS, []),
  materials: loadFromStorage<MaterialItem[]>(STORAGE_KEY_MATERIALS, mockMaterials),

  toggleConcernChecked: (concernId) =>
    set((state) => {
      const next = state.concerns.map((c) =>
        c.id === concernId ? { ...c, checked: !c.checked } : c
      );
      saveToStorage(STORAGE_KEY_CONCERNS, next);
      return { concerns: next };
    }),

  addHandoffNote: (eventId, section, content, author) =>
    set((state) => {
      const shift = getCurrentShift();
      const now = new Date();
      const createdAt = now
        .toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\//g, "-");
      const newNote: HandoffNote = {
        id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        eventId,
        section,
        content,
        author,
        createdAt,
        shiftId: shift.id,
        shiftLabel: shift.label,
      };
      const next = [...state.handoffNotes, newNote];
      saveToStorage(STORAGE_KEY_HANDOFF, next);
      return { handoffNotes: next };
    }),

  getEventHandoffStatus: (eventId) => {
    const currentShift = getCurrentShift();
    return get().handoffStatuses.find(
      (s) => s.eventId === eventId && s.shiftId === currentShift.id
    );
  },

  acceptHandoff: (eventId, author) =>
    set((state) => {
      const currentShift = getCurrentShift();
      const now = new Date();
      const acceptedAt = now
        .toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\//g, "-");

      const prevShiftNotes = state.handoffNotes.filter(
        (n) =>
          n.eventId === eventId &&
          getShiftRelation(n.shiftId) === "previous"
      );

      const items: HandoffStatusItem[] = prevShiftNotes.map((n) => ({
        id: `hs-${Date.now()}-${n.id}`,
        eventId,
        noteId: n.id,
        section: n.section,
        content: n.content,
        done: false,
        createdAt: n.createdAt,
      }));

      const newStatus: EventHandoffStatus = {
        eventId,
        shiftId: currentShift.id,
        accepted: true,
        acceptedAt,
        acceptedBy: author,
        items,
      };

      const next = [
        ...state.handoffStatuses.filter(
          (s) => !(s.eventId === eventId && s.shiftId === currentShift.id)
        ),
        newStatus,
      ];

      saveToStorage(STORAGE_KEY_HANDOFF_STATUS, next);
      return { handoffStatuses: next };
    }),

  toggleHandoffItemDone: (eventId, itemId) =>
    set((state) => {
      const currentShift = getCurrentShift();
      const next = state.handoffStatuses.map((s) => {
        if (s.eventId === eventId && s.shiftId === currentShift.id) {
          return {
            ...s,
            items: s.items.map((i) =>
              i.id === itemId ? { ...i, done: !i.done } : i
            ),
          };
        }
        return s;
      });
      saveToStorage(STORAGE_KEY_HANDOFF_STATUS, next);
      return { handoffStatuses: next };
    }),

  addHandoffItem: (eventId, noteId, section, content, author) =>
    set((state) => {
      const currentShift = getCurrentShift();
      const now = new Date();
      const createdAt = now
        .toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\//g, "-");

      const newItem: HandoffStatusItem = {
        id: `hs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        eventId,
        noteId,
        section,
        content,
        done: false,
        createdAt,
      };

      const existingIdx = state.handoffStatuses.findIndex(
        (s) => s.eventId === eventId && s.shiftId === currentShift.id
      );

      let next;
      if (existingIdx >= 0) {
        next = state.handoffStatuses.map((s, idx) => {
          if (idx === existingIdx) {
            return { ...s, items: [...s.items, newItem] };
          }
          return s;
        });
      } else {
        next = [
          ...state.handoffStatuses,
          {
            eventId,
            shiftId: currentShift.id,
            accepted: true,
            acceptedAt: createdAt,
            acceptedBy: author,
            items: [newItem],
          },
        ];
      }

      saveToStorage(STORAGE_KEY_HANDOFF_STATUS, next);
      return { handoffStatuses: next };
    }),

  getPendingHandoffItems: (eventId) => {
    const status = get().getEventHandoffStatus(eventId);
    const notes = get().handoffNotes.filter((n) => n.eventId === eventId);
    
    const statusItemIds = new Set(status?.items.map((i) => i.noteId) || []);
    const fromNotes: HandoffStatusItem[] = notes
      .filter((n) => !statusItemIds.has(n.id))
      .map((n) => ({
        id: `hs-pending-${n.id}`,
        eventId: n.eventId,
        noteId: n.id,
        section: n.section,
        content: n.content,
        done: false,
        createdAt: n.createdAt,
      }));
    
    const fromStatus = status?.items.filter((i) => !i.done) || [];
    return [...fromNotes, ...fromStatus];
  },

  getCompletedHandoffItems: (eventId) => {
    const status = get().getEventHandoffStatus(eventId);
    if (!status) return [];
    return status.items.filter((i) => i.done);
  },

  getMaterialsByEventId: (eventId) =>
    get().materials.filter((m) => m.eventId === eventId),

  getPendingMaterials: () =>
    get().materials.filter((m) => m.status === "pending"),

  getCompletedMaterials: () =>
    get().materials.filter((m) => m.status !== "pending"),

  getMaterialsGroupedByEvent: () => {
    const allMaterials = get().materials;
    const eventMap = new Map<
      string,
      {
        eventId: string;
        eventTitle: string;
        materials: MaterialItem[];
        pendingCount: number;
      }
    >();

    allMaterials.forEach((m) => {
      if (!eventMap.has(m.eventId)) {
        eventMap.set(m.eventId, {
          eventId: m.eventId,
          eventTitle: m.eventTitle,
          materials: [],
          pendingCount: 0,
        });
      }
      const group = eventMap.get(m.eventId)!;
      group.materials.push(m);
      if (m.status === "pending") {
        group.pendingCount++;
      }
    });

    return Array.from(eventMap.values()).sort((a, b) => b.pendingCount - a.pendingCount);
  },

  setMaterialStatus: (materialId, status) =>
    set((state) => {
      const next = state.materials.map((m) =>
        m.id === materialId ? { ...m, status } : m
      );
      saveToStorage(STORAGE_KEY_MATERIALS, next);
      return { materials: next };
    }),

  isMaterialOverdue,

  generateUrgeMessage,

  getOverdueMaterials: () =>
    get().materials.filter((m) => m.status === "pending" && isMaterialOverdue(m)),

  getShiftRelationForNote: (note) => getShiftRelation(note.shiftId),
}));
