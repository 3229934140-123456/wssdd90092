import type { ShiftInfo } from "@/types";

export function getShiftLabel(hour: number): string {
  if (hour >= 8 && hour < 20) {
    return "白班";
  }
  return "夜班";
}

export function getCurrentShift(): ShiftInfo {
  const now = new Date();
  const dateStr = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, "-");
  const hour = now.getHours();
  const label = getShiftLabel(hour);

  let shiftDateStr = dateStr;
  if (hour < 8) {
    const yesterday = new Date(now.getTime() - 86400000);
    shiftDateStr = yesterday.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).replace(/\//g, "-");
  }

  return {
    id: `${shiftDateStr}-${label === "白班" ? "day" : "night"}`,
    label: `${shiftDateStr} ${label}`,
    startAt: now.toISOString(),
  };
}

export function isCurrentShift(shiftId: string): boolean {
  const current = getCurrentShift();
  return shiftId === current.id;
}

export function getPreviousShift(): ShiftInfo {
  const current = getCurrentShift();
  const now = new Date();
  const hour = now.getHours();

  let prevDate = new Date(now.getTime() - 86400000);
  let prevLabel = "白班";

  if (hour >= 8 && hour < 20) {
    prevDate = new Date(now.getTime() - 86400000);
    prevLabel = "夜班";
  } else {
    prevDate = now;
    prevLabel = "白班";
  }

  const dateStr = prevDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replace(/\//g, "-");

  return {
    id: `${dateStr}-${prevLabel === "白班" ? "day" : "night"}`,
    label: `${dateStr} ${prevLabel}`,
    startAt: "",
  };
}

export const STORAGE_KEY_HANDOFF = "yq-board-handoff-notes";
export const STORAGE_KEY_CONCERNS = "yq-board-concerns";
