import { useMemo } from "react";
import {
  BookOpenCheck,
  Clock,
  TrendingUp,
  Lightbulb,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useEventStore } from "@/store/eventStore";
import {
  CONCERN_CATEGORY_LABELS,
  HANDOFF_SECTION_LABELS,
  type ConcernCategory,
  type TimelineCard,
  type ConcernItem,
  type HandoffNote,
  type EventItem,
  type HandoffStatusItem,
} from "@/types";
import { getShiftRelation } from "@/utils/shift";
import { TIMELINE_TYPE_LABELS } from "@/types";

interface ReviewOutlineSectionProps {
  event: EventItem;
  timelineCards: TimelineCard[];
  eventId: string;
}

function generateOutline(
  event: EventItem,
  cards: TimelineCard[],
  concerns: ConcernItem[],
  handoffNotes: HandoffNote[],
  completedItems: HandoffStatusItem[],
  pendingItems: HandoffStatusItem[]
) {
  const nonPlaceholderCards = cards.filter((c) => !c.placeholder);
  const checkedConcerns = concerns.filter((c) => c.checked);

  const categoryStats: Record<ConcernCategory, number> = {
    housing: 0,
    transport: 0,
    education: 0,
    law_enforcement: 0,
    environment: 0,
    healthcare: 0,
    other: 0,
  };
  checkedConcerns.forEach((c) => {
    categoryStats[c.category] += c.count;
  });
  const sortedCats = (Object.entries(categoryStats) as [ConcernCategory, number][])
    .filter(([, n]) => n > 0)
    .sort(([, a], [, b]) => b - a);

  const totalMentions = checkedConcerns.reduce((sum, c) => sum + c.count, 0);
  const topQuestions = [...checkedConcerns]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const timelineSection = `【舆情时间线】
事件起因：${event.description}

${nonPlaceholderCards
  .map((c, i) => `${i + 1}. ${TIMELINE_TYPE_LABELS[c.type]}（${c.sourceTime || "待补充"}）
   ${c.placeholder ? "【待补充】尚未收集该环节材料" : `事件：${c.title}
   摘要：${c.summary.slice(0, 100)}${c.summary.length > 100 ? "..." : ""}`}`)
  .join("\n\n")}

传播情况：${nonPlaceholderCards.length}/4 个环节已完整，累计覆盖约 ${nonPlaceholderCards
    .reduce((sum, c) => sum + c.reachCount, 0)
    .toLocaleString()} 人次`;

  let actionSection = `【处置动作】
事件等级：${event.level === "critical" ? "特别重大" : event.level === "high" ? "重大" : event.level === "medium" ? "较重" : "一般"}
当前状态：${event.status === "monitoring" ? "监测中" : event.status === "responding" ? "处置中" : event.status === "resolved" ? "已处置" : "已复盘"}

已完成的处置措施：
`;

  const officialCard = nonPlaceholderCards.find((c) => c.type === "official");
  if (officialCard) {
    actionSection += `- ✅ 官方回应：${officialCard.title}
   发布时间：${officialCard.sourceTime}
   回应摘要：${officialCard.summary.slice(0, 120)}${officialCard.summary.length > 120 ? "..." : ""}
`;
  }

  if (completedItems.length > 0) {
    completedItems.forEach((item) => {
      actionSection += `- ✅ [${HANDOFF_SECTION_LABELS[item.section]}] ${item.content}
`;
    });
  }

  const hasContacts = handoffNotes.some((n) => n.section === "to_contact");
  if (hasContacts && completedItems.length === 0 && !officialCard) {
    actionSection += `- ✅ 部门联动：已协调相关责任部门介入处置
`;
  }

  const prevShiftNotes = handoffNotes.filter(
    (n) => getShiftRelation(n.shiftId) !== "current"
  );
  if (prevShiftNotes.length > 0) {
    actionSection += `- ✅ 值班交接：已完成 ${prevShiftNotes.length} 次信息交接，确保处置连续性
`;
  }

  if (!officialCard && completedItems.length === 0 && prevShiftNotes.length === 0) {
    actionSection += "- （请补充记录已采取的处置措施）\n";
  }

  if (pendingItems.length > 0) {
    actionSection += `
⏳ 待完成事项（需继续跟踪）：
`;
    pendingItems.forEach((item) => {
      actionSection += `- [${HANDOFF_SECTION_LABELS[item.section]}] ${item.content}
`;
    });
  }

  if (event.reviewConclusion) {
    actionSection += `
最终处置结果：
${event.reviewConclusion}`;
  }

  let lessonSection = `【经验教训】
`;

  if (sortedCats.length > 0) {
    const topCat = sortedCats[0];
    const catPct = ((topCat[1] / totalMentions) * 100).toFixed(0);
    lessonSection += `
群众关切分析：
本次舆情共归纳 ${checkedConcerns.length} 个高频问题，累计提及 ${totalMentions} 次。
群众最关注「${CONCERN_CATEGORY_LABELS[topCat[0]]}」类问题（占比 ${catPct}%）${
      sortedCats.length >= 2
        ? `，其次是「${CONCERN_CATEGORY_LABELS[sortedCats[1][0]]}」类`
        : ""
    }。

最需要回应的 3 个问题：
${topQuestions
  .map((q, i) => `${i + 1}. ${q.content}（${q.count}次提及）`)
  .join("\n")}
`;
  }

  if (pendingItems.length > 0) {
    lessonSection += `
⚠️ 遗留问题提醒：
以下事项未处理完，已保留到下一班提醒中，请交接时重点关注：
`;
    pendingItems.forEach((item) => {
      lessonSection += `- [${HANDOFF_SECTION_LABELS[item.section]}] ${item.content}
`;
    });
  }

  lessonSection += `
改进建议：
1. 舆情发现及时性：${
    nonPlaceholderCards[0]?.type === "wechat"
      ? "本次最早从微信群发现，发现及时"
      : "建议加强基层舆情监测网络，做到早发现"
  }
2. 信息公开速度：建议进一步缩短官方回应时间，把握舆论主动权
3. 内部协同机制：建议完善跨部门联动响应流程，提高处置效率
4. 后续预防措施：建议针对同类事件制定应急预案，避免次生舆情
5. 交接效率：建议提前处理本班事项，减少遗留问题转交下一班`;

  return {
    timeline: timelineSection,
    actions: actionSection,
    lessons: lessonSection,
    full: `# 「${event.title}」复盘提纲\n\n${timelineSection}\n\n${actionSection}\n\n${lessonSection}`,
  };
}

export default function ReviewOutlineSection({
  event,
  timelineCards,
  eventId,
}: ReviewOutlineSectionProps) {
  const allConcerns = useEventStore((s) => s.concerns);
  const allHandoffNotes = useEventStore((s) => s.handoffNotes);
  const getCompletedHandoffItems = useEventStore((s) => s.getCompletedHandoffItems);
  const getPendingHandoffItems = useEventStore((s) => s.getPendingHandoffItems);
  const allHandoffStatuses = useEventStore((s) => s.handoffStatuses);

  const concerns = useMemo(
    () => allConcerns.filter((c) => c.eventId === eventId),
    [allConcerns, eventId]
  );
  const handoffNotes = useMemo(
    () => allHandoffNotes.filter((n) => n.eventId === eventId),
    [allHandoffNotes, eventId]
  );
  const completedItems = useMemo(
    () => getCompletedHandoffItems(eventId),
    [getCompletedHandoffItems, eventId, allHandoffStatuses]
  );
  const pendingItems = useMemo(
    () => getPendingHandoffItems(eventId),
    [getPendingHandoffItems, eventId, allHandoffStatuses]
  );

  const outline = useMemo(
    () =>
      generateOutline(
        event,
        timelineCards,
        concerns,
        handoffNotes,
        completedItems,
        pendingItems
      ),
    [event, timelineCards, concerns, handoffNotes, completedItems, pendingItems]
  );

  const [activeTab, setActiveTab] = useState<"timeline" | "actions" | "lessons">(
    "timeline"
  );
  const [copied, setCopied] = useState(false);

  const tabs = [
    { key: "timeline", label: "时间线", icon: Clock },
    { key: "actions", label: "处置动作", icon: TrendingUp },
    { key: "lessons", label: "经验教训", icon: Lightbulb },
  ] as const;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outline.full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="card-base p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-warning-500 rounded-full" />
            复盘提纲
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            系统自动整理，与交接状态联动，主任开会可直接按三段式汇报
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {completedItems.length > 0 && (
            <span className="tag bg-success-50 text-success-700 border border-success-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              已完成 {completedItems.length} 项
            </span>
          )}
          {pendingItems.length > 0 && (
            <span className="tag bg-warning-50 text-warning-700 border border-warning-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              待处理 {pendingItems.length} 项
            </span>
          )}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              copied
                ? "bg-success-100 text-success-700"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制全部
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-1 mb-5 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200 min-h-[320px]">
        <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
          {activeTab === "timeline" && outline.timeline}
          {activeTab === "actions" && outline.actions}
          {activeTab === "lessons" && outline.lessons}
        </pre>
      </div>

      {pendingItems.length > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-warning-50 to-orange-50 border border-warning-100 flex items-start gap-3 animate-slide-in-right">
          <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning-800 mb-1">
              {pendingItems.length} 项待处理事项已联动到提纲
            </p>
            <p className="text-xs text-warning-700/80">
              这些事项已在「处置动作」中标注为待完成，在「经验教训」中作为遗留问题提醒。未处理完的会自动保留到下一班交接提醒中，刷新后处理结果仍然有效。
            </p>
          </div>
        </div>
      )}

      {completedItems.length > 0 && pendingItems.length === 0 && (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-success-50 to-green-50 border border-success-100 flex items-start gap-3 animate-slide-in-right">
          <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-success-800 mb-1">
              本班 {completedItems.length} 项事项已全部处理完毕
            </p>
            <p className="text-xs text-success-700/80">
              所有已处理事项已在「处置动作」中标注为✅已完成，可直接用于复盘汇报。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
