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

interface EventStore {
  events: EventItem[];
  timelineCards: TimelineCard[];
  concerns: ConcernItem[];
  handoffNotes: HandoffNote[];
  materials: MaterialItem[];

  getEventById: (id: string) => EventItem | undefined;
  getTimelineByEventId: (eventId: string) => TimelineCard[];
  getConcernsByEventId: (eventId: string) => ConcernItem[];
  getHandoffNotesByEventId: (eventId: string) => HandoffNote[];
  toggleConcernChecked: (concernId: string) => void;
  addHandoffNote: (
    eventId: string,
    section: HandoffSection,
    content: string,
    author: string
  ) => void;
  getWeeklyEvents: () => EventItem[];
  getReviewEvents: () => EventItem[];
  getPendingMaterials: () => MaterialItem[];
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: mockEvents,
  timelineCards: mockTimelineCards,
  concerns: mockConcerns,
  handoffNotes: mockHandoffNotes,
  materials: mockMaterials,

  getEventById: (id) => get().events.find((e) => e.id === id),

  getTimelineByEventId: (eventId) =>
    get()
      .timelineCards.filter((t) => t.eventId === eventId)
      .sort((a, b) => a.order - b.order),

  getConcernsByEventId: (eventId) =>
    get()
      .concerns.filter((c) => c.eventId === eventId)
      .sort((a, b) => b.count - a.count),

  getHandoffNotesByEventId: (eventId) =>
    get()
      .handoffNotes.filter((h) => h.eventId === eventId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),

  toggleConcernChecked: (concernId) =>
    set((state) => ({
      concerns: state.concerns.map((c) =>
        c.id === concernId ? { ...c, checked: !c.checked } : c
      ),
    })),

  addHandoffNote: (eventId, section, content, author) =>
    set((state) => ({
      handoffNotes: [
        ...state.handoffNotes,
        {
          id: `h-${Date.now()}`,
          eventId,
          section,
          content,
          author,
          createdAt: new Date()
            .toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
            .replace(/\//g, "-"),
        },
      ],
    })),

  getWeeklyEvents: () => get().events,

  getReviewEvents: () => get().events.filter((e) => e.isReview || e.status === "reviewed"),

  getPendingMaterials: () => get().materials.filter((m) => m.status !== "approved"),
}));
