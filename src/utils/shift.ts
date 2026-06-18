import type { ShiftInfo, ShiftRelation } from "@/types";

export function getShiftLabel(hour: number): "白班" | "夜班" {
  if (hour >= 8 && hour < 20) {
    return "白班";
  }
  return "夜班";
}

export function getShiftType(hour: number): "day" | "night" {
  if (hour >= 8 && hour < 20) {
    return "day";
  }
  return "night";
}

function formatDateStr(d: Date): string {
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, "-");
}

function getShiftDate(now: Date): { date: Date; type: "day" | "night"; label: "白班" | "夜班" } {
  const hour = now.getHours();
  const type = getShiftType(hour);
  const label = getShiftLabel(hour);

  if (hour < 8) {
    const yesterday = new Date(now.getTime() - 86400000);
    return { date: yesterday, type: "night", label: "夜班" };
  }

  return { date: now, type, label };
}

export function buildShiftFromDate(date: Date, type: "day" | "night"): ShiftInfo {
  const dateStr = formatDateStr(date);
  const label = type === "day" ? "白班" : "夜班";
  const hour = type === "day" ? 8 : 20;
  const startAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0).toISOString();
  return {
    id: `${dateStr}-${type}`,
    label: `${dateStr} ${label}`,
    dateStr,
    shiftType: type,
    startAt,
  };
}

export function getCurrentShift(now?: Date): ShiftInfo {
  const refNow = now ?? new Date();
  const { date, type } = getShiftDate(refNow);
  return buildShiftFromDate(date, type);
}

export function getPreviousShift(now?: Date): ShiftInfo {
  const refNow = now ?? new Date();
  const current = getCurrentShift(refNow);

  if (current.shiftType === "day") {
    const yesterday = new Date(current.dateStr.replace(/-/g, "/"));
    const d = new Date(yesterday.getTime() - 86400000);
    return buildShiftFromDate(d, "night");
  } else {
    const d = new Date(current.dateStr.replace(/-/g, "/"));
    return buildShiftFromDate(d, "day");
  }
}

export function getShiftById(shiftId: string): ShiftInfo | null {
  try {
    const parts = shiftId.split("-");
    if (parts.length < 4) return null;
    const typePart = parts[parts.length - 1];
    const dateStr = parts.slice(0, parts.length - 1).join("-");
    const type = typePart === "day" ? "day" : "night";
    const d = new Date(dateStr.replace(/-/g, "/"));
    if (isNaN(d.getTime())) return null;
    return buildShiftFromDate(d, type);
  } catch {
    return null;
  }
}

export function getShiftRelation(shiftId: string, now?: Date): ShiftRelation {
  const current = getCurrentShift(now);
  if (shiftId === current.id) return "current";

  const previous = getPreviousShift(now);
  if (shiftId === previous.id) return "previous";

  return "older";
}

export function formatShiftLabel(shiftId: string): string {
  const s = getShiftById(shiftId);
  return s ? s.label : shiftId;
}

export const STORAGE_KEY_HANDOFF = "yq-board-handoff-notes";
export const STORAGE_KEY_CONCERNS = "yq-board-concerns";
export const STORAGE_KEY_HANDOFF_STATUS = "yq-board-handoff-status";
export const STORAGE_KEY_MATERIALS = "yq-board-materials";
