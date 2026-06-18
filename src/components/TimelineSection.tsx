import { useState } from "react";
import {
  MessageCircle,
  Video,
  Newspaper,
  Megaphone,
  ChevronDown,
  ChevronUp,
  Users,
  Share2,
  Clock,
  FileImage,
} from "lucide-react";
import type { TimelineCard as TimelineCardType } from "@/types";
import { TIMELINE_TYPE_LABELS } from "@/types";

interface TimelineSectionProps {
  cards: TimelineCardType[];
}

const typeConfig = {
  wechat: {
    icon: MessageCircle,
    gradient: "from-green-500 to-green-700",
    lightBg: "bg-green-50",
    border: "border-green-200",
    textColor: "text-green-700",
  },
  shortvideo: {
    icon: Video,
    gradient: "from-pink-500 to-pink-700",
    lightBg: "bg-pink-50",
    border: "border-pink-200",
    textColor: "text-pink-700",
  },
  media: {
    icon: Newspaper,
    gradient: "from-blue-500 to-blue-700",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-700",
  },
  official: {
    icon: Megaphone,
    gradient: "from-primary-600 to-primary-800",
    lightBg: "bg-primary-50",
    border: "border-primary-200",
    textColor: "text-primary-700",
  },
};

export default function TimelineSection({ cards }: TimelineSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(cards[0]?.id ?? null);

  return (
    <div className="card-base p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <span className="w-1.5 h-7 bg-primary-600 rounded-full" />
        舆情传播时间线
        <span className="text-sm font-normal text-slate-500">
          点击卡片展开详情
        </span>
      </h3>

      <div className="relative">
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-400 via-pink-400 via-blue-400 to-primary-500 rounded-full" />

        <div className="space-y-5">
          {cards.map((card, index) => {
            const cfg = typeConfig[card.type];
            const Icon = cfg.icon;
            const isExpanded = expandedId === card.id;

            return (
              <div key={card.id} className="relative pl-16">
                <div
                  className={`absolute left-0 top-5 w-12 h-12 rounded-full bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg ring-4 ring-white z-10`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`absolute left-[22px] top-[52px] text-xs font-bold text-slate-400 transform -translate-x-1/2`}
                >
                  #{index + 1}
                </div>

                <div
                  className={`card-base border ${cfg.border} overflow-hidden animate-slide-up`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : card.id)
                    }
                    className={`w-full p-5 text-left ${cfg.lightBg} flex items-center justify-between gap-4 hover:brightness-95 transition-all`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <span className={`tag bg-white/60 ${cfg.textColor} font-semibold`}>
                          {TIMELINE_TYPE_LABELS[card.type]}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {card.sourceTime}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">
                        {card.title}
                      </h4>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-full bg-white/80 flex items-center justify-center transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    </div>
                  </button>

                  {isExpanded && (
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
                            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                              {card.impact}
                            </p>
                          </div>
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
