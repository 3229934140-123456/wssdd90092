import { useMemo } from "react";
import {
  CheckSquare,
  Square,
  PieChart,
  Tag,
  FileText,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import { CONCERN_CATEGORY_LABELS, type ConcernCategory } from "@/types";
import type { ConcernItem } from "@/types";

interface ConcernsSectionProps {
  eventId: string;
}

const categoryColors: Record<
  ConcernCategory,
  { bg: string; bar: string; text: string; soft: string; ring: string }
> = {
  housing: {
    bg: "bg-blue-500",
    bar: "bg-blue-500",
    text: "text-blue-700",
    soft: "bg-blue-50",
    ring: "ring-blue-200",
  },
  transport: {
    bg: "bg-purple-500",
    bar: "bg-purple-500",
    text: "text-purple-700",
    soft: "bg-purple-50",
    ring: "ring-purple-200",
  },
  education: {
    bg: "bg-amber-500",
    bar: "bg-amber-500",
    text: "text-amber-700",
    soft: "bg-amber-50",
    ring: "ring-amber-200",
  },
  law_enforcement: {
    bg: "bg-red-500",
    bar: "bg-red-500",
    text: "text-red-700",
    soft: "bg-red-50",
    ring: "ring-red-200",
  },
  environment: {
    bg: "bg-green-500",
    bar: "bg-green-500",
    text: "text-green-700",
    soft: "bg-green-50",
    ring: "ring-green-200",
  },
  healthcare: {
    bg: "bg-pink-500",
    bar: "bg-pink-500",
    text: "text-pink-700",
    soft: "bg-pink-50",
    ring: "ring-pink-200",
  },
  other: {
    bg: "bg-slate-500",
    bar: "bg-slate-500",
    text: "text-slate-700",
    soft: "bg-slate-50",
    ring: "ring-slate-200",
  },
};

function generateSummary(
  checkedList: ConcernItem[],
  categoryStats: Record<ConcernCategory, number>,
  totalMentions: number
): string {
  if (checkedList.length === 0) {
    return "请值班人员从评论中勾选群众关心的高频问题，系统将自动生成会议可直接使用的关切摘要。";
  }

  const sortedCats = (Object.entries(categoryStats) as [ConcernCategory, number][])
    .filter(([, n]) => n > 0)
    .sort(([, a], [, b]) => b - a);

  const topCat = sortedCats[0];
  const topQuestions = [...checkedList].sort((a, b) => b.count - a.count).slice(0, 3);

  let summary = `经梳理，本次舆情共归纳出 ${checkedList.length} 个群众高频问题，累计提及 ${totalMentions} 次。`;

  if (topCat) {
    const catName = CONCERN_CATEGORY_LABELS[topCat[0]];
    const catPct = ((topCat[1] / totalMentions) * 100).toFixed(0);
    summary += ` 其中「${catName}」类问题最为集中，占比 ${catPct}%，`;

    if (sortedCats.length >= 2) {
      const second = sortedCats[1];
      summary += `其次是「${CONCERN_CATEGORY_LABELS[second[0]]}」类，`;
    }
    summary += "是官方回应中必须正面回答的核心关切。";
  }

  if (topQuestions.length > 0) {
    summary += ` 具体来看，群众最关心的前三个问题依次是：`;
    topQuestions.forEach((q, i) => {
      summary += `（${i + 1}）${q.content.replace(/[？?。.]$/, "")}（${q.count}次提及）`;
      summary += i < topQuestions.length - 1 ? "；" : "。";
    });
    summary += " 建议在后续处置和官方发声中，优先围绕上述问题给出明确答复。";
  }

  return summary;
}

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

  const checkedConcerns = useMemo(
    () => concerns.filter((c) => c.checked).sort((a, b) => b.count - a.count),
    [concerns]
  );
  const top3 = checkedConcerns.slice(0, 3);
  const checkedCount = checkedConcerns.length;
  const checkedTotalMentions = checkedConcerns.reduce((sum, c) => sum + c.count, 0);

  const summary = useMemo(
    () => generateSummary(checkedConcerns, categoryStats.stats, checkedTotalMentions),
    [checkedConcerns, categoryStats.stats, checkedTotalMentions]
  );

  const sortedCats = useMemo(
    () =>
      (Object.entries(categoryStats.stats) as [ConcernCategory, number][])
        .filter(([, n]) => n > 0)
        .sort(([, a], [, b]) => b - a),
    [categoryStats.stats]
  );

  return (
    <div className="card-base p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-warning-500 rounded-full" />
            群众关切归纳
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            从评论中勾选高频问题，系统自动分类汇总并生成会议摘要
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-warning-50 rounded-xl border border-warning-100">
            <p className="text-2xl font-bold text-warning-600">{checkedCount}</p>
            <p className="text-xs text-slate-500">已勾选问题</p>
          </div>
          <div className="text-center px-4 py-2 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-2xl font-bold text-primary-700">
              {checkedTotalMentions.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">累计提及次数</p>
          </div>
        </div>
      </div>

      {top3.length > 0 && (
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-warning-50 via-orange-50 to-amber-50 border border-warning-200 animate-slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="font-bold text-warning-800 text-base">
                最需回应的 Top 3 问题
              </p>
              <p className="text-xs text-warning-600">
                建议在官方回复和处置方案中优先回应
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((q, idx) => {
              const colors = categoryColors[q.category];
              const rankBg =
                idx === 0
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                  : idx === 1
                  ? "bg-gradient-to-br from-slate-300 to-slate-500"
                  : "bg-gradient-to-br from-orange-400 to-orange-600";
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl bg-white border ${colors.ring} ring-2 shadow-sm animate-slide-up`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-7 h-7 rounded-lg ${rankBg} flex items-center justify-center shadow-md`}
                    >
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                    <span
                      className={`tag ${colors.soft} ${colors.text} border border-current/20 text-[11px]`}
                    >
                      {CONCERN_CATEGORY_LABELS[q.category]}
                    </span>
                    <span className="tag bg-red-50 text-red-600 border border-red-100 font-semibold text-[11px]">
                      {q.count} 次
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    {q.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3 max-h-[480px] overflow-y-auto pr-2">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-primary-600" />
            高频问题清单
            <span className="text-xs font-normal text-slate-400">（点击勾选或取消）</span>
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
                    <span
                      className={`tag ${colors.soft} ${colors.text} border border-current/20`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {CONCERN_CATEGORY_LABELS[item.category]}
                    </span>
                    <span className="tag bg-red-50 text-red-600 border border-red-100 font-semibold">
                      {item.count} 次提及
                    </span>
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      item.checked ? "text-slate-800 font-medium" : "text-slate-600"
                    }`}
                  >
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
                {sortedCats.map(([cat, count], idx) => {
                  const colors = categoryColors[cat];
                  const pct = (count / categoryStats.total) * 100;
                  return (
                    <div
                      key={cat}
                      className="animate-slide-up"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
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
              <FileText className="w-4 h-4" />
              会议关切摘要
            </p>
            {checkedCount === 0 ? (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-primary-900/70 leading-relaxed">
                  {summary}
                </p>
              </div>
            ) : (
              <div className="bg-white/70 rounded-xl p-4 border border-primary-100">
                <p className="text-sm text-primary-900/90 leading-relaxed">
                  {summary}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
