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
  UrgeRecord,
  OverdueLevel,
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
  STORAGE_KEY_URGE_RECORDS,
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
  const match = deadline.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?/);
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    const hour = match[4] ? parseInt(match[4]) : 23;
    const minute = match[5] ? parseInt(match[5]) : 59;
    return new Date(year, month, day, hour, minute, 59);
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

function getOverdueLevel(material: MaterialItem): OverdueLevel {
  if (!isMaterialOverdue(material)) return "none";
  const deadline = parseDeadline(material.deadline);
  const now = new Date();
  const diffHours = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60);
  if (diffHours >= 48) return "critical";
  if (diffHours >= 24) return "serious";
  return "mild";
}

function getOverdueDays(material: MaterialItem): number {
  if (!isMaterialOverdue(material)) return 0;
  const deadline = parseDeadline(material.deadline);
  const now = new Date();
  return Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
}

function generateUrgeMessage(
  material: MaterialItem,
  eventUrl?: string
): UrgeMessage {
  const overdue = isMaterialOverdue(material);
  const overdueDays = getOverdueDays(material);
  const level = getOverdueLevel(material);

  let deadlineText = `截止日期为 ${material.deadline}`;
  let urgencyPrefix = "";
  if (overdue) {
    if (level === "critical") {
      deadlineText = `已于 ${material.deadline} 到期，超期 ${overdueDays} 天`;
      urgencyPrefix = "【紧急】";
    } else if (level === "serious") {
      deadlineText = `已于 ${material.deadline} 到期，超期 ${overdueDays} 天`;
      urgencyPrefix = "【重要】";
    } else {
      deadlineText = `已于 ${material.deadline} 到期`;
      urgencyPrefix = "【提醒】";
    }
  }

  const linkText = eventUrl ? `\n事件详情链接：${eventUrl}` : "";

  const formalVersion = `${urgencyPrefix}【材料催办函】

尊敬的${material.department}相关负责人：

您好！
关于「${material.eventTitle}」事件的【${material.type}】材料，${deadlineText}。

该材料为舆情处置和复盘工作的重要依据，请贵部门尽快安排提交。如有困难或需延期，请提前与融媒体中心值班室联系沟通。

材料要求：${material.type}
责任部门：${material.department}
截止时间：${material.deadline}${linkText}

感谢配合与支持！

融媒体中心值班室
${new Date().toLocaleDateString("zh-CN")}`;

  const wechatVersion = `${urgencyPrefix}${material.department}的老师您好～打扰啦！

关于「${material.eventTitle}」的【${material.type}】，${deadlineText}，麻烦帮忙尽快提交一下哦🙏

📋 材料名称：${material.type}
🏢 责任部门：${material.department}
⏰ 截止时间：${material.deadline}${linkText}

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
  urgeRecords: UrgeRecord[];

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
    submittedCount: number;
    approvedCount: number;
  }>;
  setMaterialStatus: (
    materialId: string,
    status: MaterialItem["status"]
  ) => void;
  isMaterialOverdue: (material: MaterialItem) => boolean;
  getOverdueLevel: (material: MaterialItem) => OverdueLevel;
  getOverdueDays: (material: MaterialItem) => number;
  generateUrgeMessage: (material: MaterialItem, eventUrl?: string) => UrgeMessage;
  getOverdueMaterials: () => MaterialItem[];

  addUrgeRecord: (record: Omit<UrgeRecord, "id" | "createdAt">) => void;
  getUrgeRecordsByMaterial: (materialId: string) => UrgeRecord[];
  getUrgeRecordsByEvent: (eventId: string) => UrgeRecord[];

  getShiftRelationForNote: (note: HandoffNote) => "current" | "previous" | "older";
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: mockEvents,
  timelineCards: mockTimelineCards,
  concerns: loadFromStorage<ConcernItem[]>(STORAGE_KEY_CONCERNS, mockConcerns),
  handoffNotes: loadFromStorage<HandoffNote[]>(STORAGE_KEY_HANDOFF, mockHandoffNotes),
  handoffStatuses: loadFromStorage<EventHandoffStatus[]>(STORAGE_KEY_HANDOFF_STATUS, []),
  materials: loadFromStorage<MaterialItem[]>(STORAGE_KEY_MATERIALS, mockMaterials),
  urgeRecords: loadFromStorage<UrgeRecord[]>(STORAGE_KEY_URGE_RECORDS, []),

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

      const allNotesForEvent = state.handoffNotes.filter(
        (n) => n.eventId === eventId
      );

      const allStatusesForEvent = state.handoffStatuses.filter(
        (s) => s.eventId === eventId
      );
      const processedNoteIds = new Set<string>();
      allStatusesForEvent.forEach((s) => {
        s.items.forEach((i) => processedNoteIds.add(i.noteId));
      });

      let carriedItems: HandoffStatusItem[] = [];
      allStatusesForEvent.forEach((s) => {
        s.items.forEach((i) => {
          if (!i.done) {
            const alreadyCarried = carriedItems.find(
              (c) => c.noteId === i.noteId
            );
            if (!alreadyCarried) {
              carriedItems.push({
                ...i,
                id: `hs-carry-${Date.now()}-${i.noteId}`,
              });
            }
          }
        });
      });

      const newItemsFromNotes: HandoffStatusItem[] = allNotesForEvent
        .filter((n) => !processedNoteIds.has(n.id))
        .map((n) => ({
          id: `hs-${Date.now()}-${n.id}`,
          eventId,
          noteId: n.id,
          section: n.section,
          content: n.content,
          done: false,
          createdAt: n.createdAt,
        }));

      const carriedNoteIds = new Set(carriedItems.map((i) => i.noteId));
      const filteredNewItems = newItemsFromNotes.filter(
        (i) => !carriedNoteIds.has(i.noteId)
      );

      const items = [...carriedItems, ...filteredNewItems];

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

    const allStatusesForEvent = get().handoffStatuses.filter(
      (s) => s.eventId === eventId
    );
    const completedNoteIds = new Set<string>();
    allStatusesForEvent.forEach((s) => {
      s.items.forEach((i) => {
        if (i.done) completedNoteIds.add(i.noteId);
      });
    });

    const statusItemNoteIds = new Set(
      status?.items.map((i) => i.noteId) || []
    );
    const fromNotes: HandoffStatusItem[] = notes
      .filter((n) => !statusItemNoteIds.has(n.id) && !completedNoteIds.has(n.id))
      .map((n) => ({
        id: `hs-pending-${n.id}`,
        eventId: n.eventId,
        noteId: n.id,
        section: n.section,
        content: n.content,
        done: false,
        createdAt: n.createdAt,
      }));

    let carriedFromPrevious: HandoffStatusItem[] = [];
    allStatusesForEvent.forEach((s) => {
      if (s.shiftId !== getCurrentShift().id) {
        s.items.forEach((i) => {
          if (!i.done && !completedNoteIds.has(i.noteId)) {
            const alreadyCarried = carriedFromPrevious.find(
              (c) => c.noteId === i.noteId
            );
            if (!alreadyCarried) {
              carriedFromPrevious.push({
                ...i,
                id: `hs-carry-pending-${i.noteId}`,
              });
            }
          }
        });
      }
    });

    const fromStatus = status?.items.filter((i) => !i.done) || [];
    const fromStatusNoteIds = new Set(fromStatus.map((i) => i.noteId));
    const carriedNoteIds = new Set(carriedFromPrevious.map((i) => i.noteId));

    const filteredFromNotes = fromNotes.filter(
      (n) => !fromStatusNoteIds.has(n.noteId) && !carriedNoteIds.has(n.noteId)
    );
    const filteredCarried = carriedFromPrevious.filter(
      (c) => !fromStatusNoteIds.has(c.noteId)
    );

    return [...filteredCarried, ...filteredFromNotes, ...fromStatus];
  },

  getCompletedHandoffItems: (eventId) => {
    const allStatuses = get().handoffStatuses.filter(
      (s) => s.eventId === eventId
    );
    const completed: HandoffStatusItem[] = [];
    const seenNoteIds = new Set<string>();
    allStatuses.forEach((s) => {
      s.items.forEach((i) => {
        if (i.done && !seenNoteIds.has(i.noteId)) {
          completed.push(i);
          seenNoteIds.add(i.noteId);
        }
      });
    });
    return completed;
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
        submittedCount: number;
        approvedCount: number;
      }
    >();

    allMaterials.forEach((m) => {
      if (!eventMap.has(m.eventId)) {
        eventMap.set(m.eventId, {
          eventId: m.eventId,
          eventTitle: m.eventTitle,
          materials: [],
          pendingCount: 0,
          submittedCount: 0,
          approvedCount: 0,
        });
      }
      const group = eventMap.get(m.eventId)!;
      group.materials.push(m);
      if (m.status === "pending") group.pendingCount++;
      else if (m.status === "submitted") group.submittedCount++;
      else if (m.status === "approved") group.approvedCount++;
    });

    return Array.from(eventMap.values()).sort((a, b) => {
      if (b.pendingCount !== a.pendingCount) return b.pendingCount - a.pendingCount;
      return b.submittedCount - a.submittedCount;
    });
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

  getOverdueLevel,

  getOverdueDays,

  generateUrgeMessage,

  getOverdueMaterials: () =>
    get().materials.filter((m) => m.status === "pending" && isMaterialOverdue(m)),

  addUrgeRecord: (record) =>
    set((state) => {
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
      const newRecord: UrgeRecord = {
        ...record,
        id: `ur-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt,
      };
      const next = [...state.urgeRecords, newRecord];
      saveToStorage(STORAGE_KEY_URGE_RECORDS, next);
      return { urgeRecords: next };
    }),

  getUrgeRecordsByMaterial: (materialId) =>
    get().urgeRecords.filter((r) => r.materialId === materialId),

  getUrgeRecordsByEvent: (eventId) =>
    get().urgeRecords.filter((r) => r.eventId === eventId),

  getShiftRelationForNote: (note) => getShiftRelation(note.shiftId),
}));
