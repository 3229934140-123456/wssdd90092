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

  getMaterialsByEventId: (eventId: string) => MaterialItem[];
  setMaterialStatus: (
    materialId: string,
    status: MaterialItem["status"]
  ) => void;

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

  getMaterialsByEventId: (eventId) =>
    get().materials.filter((m) => m.eventId === eventId),

  setMaterialStatus: (materialId, status) =>
    set((state) => {
      const next = state.materials.map((m) =>
        m.id === materialId ? { ...m, status } : m
      );
      saveToStorage(STORAGE_KEY_MATERIALS, next);
      return { materials: next };
    }),

  getShiftRelationForNote: (note) => getShiftRelation(note.shiftId),
}));
