import { useMemo } from "react";
import { CheckSquare, Square, PieChart, Tag, BarChart3 } from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import { CONCERN_CATEGORY_LABELS, type ConcernCategory } from "@/types";
import type { ConcernItem } from "@/types";

interface ConcernsSectionProps {
  eventId: string;
}

const categoryColors: Record<ConcernCategory, { bg: string; bar: string; text: string; soft: string }> = {
  housing: { bg: "bg-blue-500", bar: "bg-blue-500", text: "text-blue-700", soft: "bg-blue-50" },
  transport: { bg: "bg-purple-500", bar: "bg-purple-500", text: "text-purple-700", soft: "bg-purple-50" },
  education: { bg: "bg-amber-500", bar: "bg-amber-500", text: "text-amber-700", soft: "bg-amber-50" },
  law_enforcement: { bg: "bg-red-500", bar: "bg-red-500", text: "text-red-700", soft: "bg-red-50" },
  environment: { bg: "bg-green-500", bar: "bg-green-500", text: "text-green-700", soft: "bg-green-50" },
  healthcare: { bg: "bg-pink-500", bar: "bg-pink-500", text: "text-pink-700", soft: "bg-pink-50" },
  other: { bg: "bg-slate-500", bar: "bg-slate-500", text: "text-slate-700", soft: "bg-slate-50" },
};

export default function ConcernsSection({ eventId }: ConcernsSectionProps) {
  const allConcerns = useEventStore((s) => s.concerns);
  const toggleConcernChecked = useEventStore((s) => s.toggleConcernChecked);

  const concerns = useMemo(
    () =>
      allConcerns
        .filter((c) => c.eventId === eventId)
        .sort((a, b) => b.count - a.count),
    [allConcerns, eventId]
  );

  const categoryStats = useMemo(() => {
    const stats: Record<ConcernCategory, number> = {
      housing: 0,
      transport: 0,
      education: 0,
      law_enforcement: 0,
      environment: 0,
      healthcare: 0,
      other: 0,
    };
    concerns
      .filter((c) => c.checked)
      .forEach((c) => {
        stats[c.category] += c.count;
      });
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    return { stats, total };
  }, [concerns]);

  const checkedCount = concerns.filter((c) => c.checked).length;
  const checkedTotalMentions = concerns
    .filter((c) => c.checked)
    .reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="card-base p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-warning-500 rounded-full" />
            群众关切归纳
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            从评论中勾选高频问题，系统自动分类汇总
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-warning-50 rounded-xl border border-warning-100">
            <p className="text-2xl font-bold text-warning-600">{checkedCount}</p>
            <p className="text-xs text-slate-500">已勾选问题</p>
          </div>
          <div className="text-center px-4 py-2 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-2xl font-bold text-primary-700">{checkedTotalMentions}</p>
            <p className="text-xs text-slate-500">累计提及次数</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3 max-h-[480px] overflow-y-auto pr-2">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-primary-600" />
            高频问题清单
            <span className="text-xs font-normal text-slate-400">（点击勾选）</span>
          </p>
          {concerns.map((item: ConcernItem, index: number) => {
            const colors = categoryColors[item.category];
            return (
              <button
                key={item.id}
                onClick={() => toggleConcernChecked(item.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 animate-slide-up ${
                  item.checked
                    ? "bg-white border-primary-300 shadow-md"
                    : "bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white"
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.checked ? (
                    <CheckSquare className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`tag ${colors.soft} ${colors.text} border border-current/20`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {CONCERN_CATEGORY_LABELS[item.category]}
                    </span>
                    <span className="tag bg-red-50 text-red-600 border border-red-100 font-semibold">
                      {item.count} 次提及
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${item.checked ? "text-slate-800 font-medium" : "text-slate-600"}`}>
                    {item.content}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-primary-600" />
              关切分布（按类别）
            </p>

            {categoryStats.total === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                勾选问题后自动生成分类统计
              </p>
            ) : (
              <div className="space-y-4">
                {(Object.entries(categoryStats.stats) as [ConcernCategory, number][])
                  .filter(([, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, count], idx) => {
                    const colors = categoryColors[cat];
                    const pct = (count / categoryStats.total) * 100;
                    return (
                      <div key={cat} className="animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-sm font-medium ${colors.text}`}>
                            {CONCERN_CATEGORY_LABELS[cat]}
                          </span>
                          <span className="text-sm font-bold text-slate-700">
                            {count}次 ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full ${colors.bar} rounded-full transition-all duration-700 ease-out`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl p-5 border border-primary-200">
            <p className="text-sm font-semibold text-primary-800 flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4" />
              研判提示
            </p>
            <p className="text-sm text-primary-900/80 leading-relaxed">
              {categoryStats.total === 0
                ? "请值班人员从评论中勾选群众关心的高频问题，系统将自动汇总分类以辅助决策。"
                : `当前共归纳 ${checkedCount} 个高频问题，群众最关注「${
                    (Object.entries(categoryStats.stats) as [ConcernCategory, number][])
                      .sort(([, a], [, b]) => b - a)[0]
                      ? CONCERN_CATEGORY_LABELS[
                          (Object.entries(categoryStats.stats) as [ConcernCategory, number][]).sort(
                            ([, a], [, b]) => b - a
                          )[0][0]
                        ]
                      : "-"
                  }」类问题，建议在官方回复中重点回应。`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
