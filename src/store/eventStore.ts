import { create } from "zustand";
import type {
  EventItem,
  TimelineCard,
  ConcernItem,
  HandoffNote,
  MaterialItem,
  HandoffSection,
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
  STORAGE_KEY_HANDOFF,
  STORAGE_KEY_CONCERNS,
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
  materials: MaterialItem[];

  toggleConcernChecked: (concernId: string) => void;
  addHandoffNote: (
    eventId: string,
    section: HandoffSection,
    content: string,
    author: string
  ) => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: mockEvents,
  timelineCards: mockTimelineCards,
  concerns: loadFromStorage<ConcernItem[]>(STORAGE_KEY_CONCERNS, mockConcerns),
  handoffNotes: loadFromStorage<HandoffNote[]>(STORAGE_KEY_HANDOFF, mockHandoffNotes),
  materials: mockMaterials,

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
      const next = [
        ...state.handoffNotes,
        {
          id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          eventId,
          section,
          content,
          author,
          createdAt,
          shiftId: shift.id,
          shiftLabel: shift.label,
        },
      ];
      saveToStorage(STORAGE_KEY_HANDOFF, next);
      return { handoffNotes: next };
    }),
}));
