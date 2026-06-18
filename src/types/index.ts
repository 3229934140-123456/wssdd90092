export type EventLevel = "low" | "medium" | "high" | "critical";
export type EventStatus = "monitoring" | "responding" | "resolved" | "reviewed";
export type TimelineType = "wechat" | "shortvideo" | "media" | "official";
export type ConcernCategory =
  | "housing"
  | "transport"
  | "education"
  | "law_enforcement"
  | "environment"
  | "healthcare"
  | "other";
export type HandoffSection = "unverified" | "to_contact" | "confidential";

export interface EventItem {
  id: string;
  title: string;
  level: EventLevel;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  description: string;
  isReview?: boolean;
  reviewConclusion?: string;
  reviewer?: string;
}

export interface TimelineCard {
  id: string;
  eventId: string;
  type: TimelineType;
  title: string;
  summary: string;
  imageNote: string;
  impact: string;
  reachCount: number;
  channels: string[];
  order: number;
  sourceTime: string;
  placeholder?: boolean;
}

export interface ConcernItem {
  id: string;
  eventId: string;
  content: string;
  category: ConcernCategory;
  checked: boolean;
  count: number;
}

export interface HandoffNote {
  id: string;
  eventId: string;
  section: HandoffSection;
  content: string;
  author: string;
  createdAt: string;
  shiftId: string;
  shiftLabel: string;
}

export interface ShiftInfo {
  id: string;
  label: string;
  startAt: string;
}

export interface MaterialItem {
  id: string;
  eventId: string;
  eventTitle: string;
  type: string;
  department: string;
  deadline: string;
  status: "pending" | "submitted" | "approved";
}

export const CONCERN_CATEGORY_LABELS: Record<ConcernCategory, string> = {
  housing: "住房",
  transport: "交通",
  education: "教育",
  law_enforcement: "执法态度",
  environment: "环境",
  healthcare: "医疗",
  other: "其他",
};

export const EVENT_LEVEL_LABELS: Record<EventLevel, string> = {
  low: "一般",
  medium: "较重",
  high: "重大",
  critical: "特别重大",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  monitoring: "监测中",
  responding: "处置中",
  resolved: "已处置",
  reviewed: "已复盘",
};

export const TIMELINE_TYPE_LABELS: Record<TimelineType, string> = {
  wechat: "微信群爆料",
  shortvideo: "短视频平台转发",
  media: "上级媒体报道",
  official: "官方回复",
};

export const HANDOFF_SECTION_LABELS: Record<HandoffSection, string> = {
  unverified: "未核实信息",
  to_contact: "需联系部门",
  confidential: "不宜公开内容",
};
