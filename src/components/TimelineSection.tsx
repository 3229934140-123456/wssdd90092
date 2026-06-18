import { useState } from "react";
import {
  MessageCircle,
  Video,
  Newspaper,
  Megaphone,
  ChevronDown,
  Users,
  Share2,
  Clock,
  FileImage,
  FilePlus,
} from "lucide-react";
import type { TimelineCard as TimelineCardType, TimelineType } from "@/types";
import { TIMELINE_TYPE_LABELS } from "@/types";

interface TimelineSectionProps {
  cards: TimelineCardType[];
}

const TIMELINE_ORDER: TimelineType[] = ["wechat", "shortvideo", "media", "official"];

const typeConfig: Record<
  TimelineType,
  {
    icon: typeof MessageCircle;
    gradient: string;
    lightBg: string;
    border: string;
    textColor: string;
    placeholder: string;
  }
> = {
  wechat: {
    icon: MessageCircle,
    gradient: "from-green-500 to-green-700",
    lightBg: "bg-green-50",
    border: "border-green-200",
    textColor: "text-green-700",
    placeholder: "暂未收集到微信群相关爆料",
  },
  shortvideo: {
    icon: Video,
    gradient: "from-pink-500 to-pink-700",
    lightBg: "bg-pink-50",
    border: "border-pink-200",
    textColor: "text-pink-700",
    placeholder: "暂未监测到短视频平台相关转发",
  },
  media: {
    icon: Newspaper,
    gradient: "from-blue-500 to-blue-700",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-700",
    placeholder: "暂未收到上级媒体相关报道",
  },
  official: {
    icon: Megaphone,
    gradient: "from-primary-600 to-primary-800",
    lightBg: "bg-primary-50",
    border: "border-primary-200",
    textColor: "text-primary-700",
    placeholder: "官方尚未发布正式回复",
  },
};

export default function TimelineSection({ cards }: TimelineSectionProps) {
  const cardsByType = new Map(cards.map((c) => [c.type, c]));
  const [expandedType, setExpandedType] = useState<TimelineType | null>(
    cards.length > 0 ? cards[0].type : null
  );

  const displayCards: TimelineCardType[] = TIMELINE_ORDER.map((type, idx) => {
    const existing = cardsByType.get(type);
    if (existing) return existing;
    return {
      id: `placeholder-${type}`,
      eventId: "",
      type,
      title: "待补充材料",
      summary: "",
      imageNote: "",
      impact: "",
      reachCount: 0,
      channels: [],
      order: idx + 1,
      sourceTime: "",
      placeholder: true,
    };
  });

  const completedCount = cards.length;

  return (
    <div className="card-base p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-primary-600 rounded-full" />
            舆情传播时间线
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            按微信群爆料 → 短视频转发 → 上级媒体报道 → 官方回复四步梳理，完整呈现舆情脉络
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex -space-x-1">
            {TIMELINE_ORDER.map((type, idx) => {
              const has = cardsByType.has(type);
              const cfg = typeConfig[type];
              return (
                <div
                  key={type}
                  className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                    has ? `bg-gradient-to-br ${cfg.gradient}` : "bg-slate-200"
                  }`}
                >
                  {has && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {completedCount}/4 已补充
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-400 via-pink-400 via-blue-400 to-primary-500 rounded-full" />

        <div className="space-y-5">
          {displayCards.map((card, index) => {
            const cfg = typeConfig[card.type];
            const Icon = cfg.icon;
            const isExpanded = expandedType === card.type;
            const isPlaceholder = !!card.placeholder;

            return (
              <div key={card.id} className="relative pl-16">
                <div
                  className={`absolute left-0 top-5 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white z-10 transition-all ${
                    isPlaceholder
                      ? "bg-slate-200"
                      : `bg-gradient-to-br ${cfg.gradient}`
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isPlaceholder ? "text-slate-400" : "text-white"}`}
                  />
                </div>
                <div
                  className={`absolute left-[22px] top-[52px] text-xs font-bold transform -translate-x-1/2 ${
                    isPlaceholder ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  #{index + 1}
                </div>

                <div
                  className={`card-base overflow-hidden animate-slide-up ${
                    isPlaceholder ? "border-2 border-dashed border-slate-200" : cfg.border
                  }`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <button
                    onClick={() =>
                      setExpandedType(isExpanded ? null : card.type)
                    }
                    className={`w-full p-5 text-left flex items-center justify-between gap-4 transition-all ${
                      isPlaceholder
                        ? "bg-slate-50 hover:bg-slate-100/70"
                        : `${cfg.lightBg} hover:brightness-95`
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span
                          className={`tag font-semibold ${
                            isPlaceholder
                              ? "bg-slate-200 text-slate-500"
                              : `bg-white/60 ${cfg.textColor}`
                          }`}
                        >
                          {TIMELINE_TYPE_LABELS[card.type]}
                        </span>
                        {!isPlaceholder && card.sourceTime && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {card.sourceTime}
                          </span>
                        )}
                        {isPlaceholder && (
                          <span className="tag bg-warning-50 text-warning-600 border border-warning-200 gap-1">
                            <FilePlus className="w-3 h-3" />
                            待补充
                          </span>
                        )}
                      </div>
                      <h4
                        className={`font-bold text-base ${
                          isPlaceholder ? "text-slate-400" : "text-slate-800"
                        }`}
                      >
                        {isPlaceholder ? cfg.placeholder : card.title}
                      </h4>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                        isPlaceholder
                          ? "bg-slate-200/60"
                          : "bg-white/80"
                      } ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 ${
                          isPlaceholder ? "text-slate-400" : "text-slate-600"
                        }`}
                      />
                    </div>
                  </button>

                  {isExpanded && !isPlaceholder && (
                    <div className="p-5 bg-white border-t border-slate-100 animate-slide-in-right">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                              <Newspaper className="w-4 h-4 text-primary-700" />
                            </div>
                            <h5 className="font-semibold text-slate-800">原文摘要</h5>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
                            {card.summary}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center">
                              <FileImage className="w-4 h-4 text-warning-600" />
                            </div>
                            <h5 className="font-semibold text-slate-800">截图备注</h5>
                          </div>
                          <div className="bg-gradient-to-br from-warning-50 to-warning-100/50 rounded-lg p-4 border border-warning-200 min-h-[120px]">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                              {card.imageNote}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
                              <Users className="w-4 h-4 text-success-600" />
                            </div>
                            <h5 className="font-semibold text-slate-800">影响范围</h5>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between bg-success-50 rounded-lg px-4 py-3 border border-success-200">
                              <span className="text-sm text-slate-600">覆盖人数</span>
                              <span className="font-bold text-success-700 text-lg">
                                {card.reachCount.toLocaleString()}
                              </span>
                            </div>
                            {card.channels.length > 0 && (
                              <div className="flex items-start gap-2">
                                <Share2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-wrap gap-1.5">
                                  {card.channels.map((ch, i) => (
                                    <span
                                      key={i}
                                      className="tag bg-slate-100 text-slate-600 text-[11px]"
                                    >
                                      {ch}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {card.impact && (
                              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                                {card.impact}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isExpanded && isPlaceholder && (
                    <div className="p-6 bg-slate-50/80 border-t border-dashed border-slate-200 animate-slide-in-right">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center flex-shrink-0">
                          <FilePlus className="w-5 h-5 text-warning-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-700">
                            该环节暂无材料
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {cfg.placeholder}，请值班人员补充收集相关截图、链接和影响范围描述
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
