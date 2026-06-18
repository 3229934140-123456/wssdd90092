import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  Users,
  Building2,
  Copy,
  Check,
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  Clock,
  FileWarning,
  MessageSquare,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import {
  CONCERN_CATEGORY_LABELS,
  HANDOFF_SECTION_LABELS,
  TIMELINE_TYPE_LABELS,
  type ReportVersion,
  type EventItem,
  type TimelineCard,
  type ConcernItem,
  type HandoffNote,
  type HandoffStatusItem,
} from "@/types";

interface ReviewReportSectionProps {
  event: EventItem;
  timelineCards: TimelineCard[];
  eventId: string;
}

function generateReport(
  event: EventItem,
  cards: TimelineCard[],
  concerns: ConcernItem[],
  handoffNotes: HandoffNote[],
  completedItems: HandoffStatusItem[],
  pendingItems: HandoffStatusItem[],
  version: ReportVersion
) {
  const nonPlaceholderCards = cards.filter((c) => !c.placeholder);
  const checkedConcerns = concerns.filter((c) => c.checked);

  const categoryStats: Record<string, number> = {};
  checkedConcerns.forEach((c) => {
    categoryStats[c.category] = (categoryStats[c.category] || 0) + c.count;
  });
  const sortedCats = Object.entries(categoryStats)
    .filter(([, n]) => n > 0)
    .sort(([, a], [, b]) => b - a);

  const totalMentions = checkedConcerns.reduce((sum, c) => sum + c.count, 0);
  const topQuestions = [...checkedConcerns]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const totalReach = nonPlaceholderCards
    .reduce((sum, c) => sum + c.reachCount, 0)
    .toLocaleString();

  const officialCard = nonPlaceholderCards.find((c) => c.type === "official");

  if (version === "director") {
    let report = `# 「${event.title}」舆情复盘报告（主任汇报版）\n\n`;

    report += `## 一、事件概况\n\n`;
    report += `**事件等级**：${event.level === "critical" ? "特别重大" : event.level === "high" ? "重大" : event.level === "medium" ? "较重" : "一般"}  \n`;
    report += `**当前状态**：${event.status === "monitoring" ? "监测中" : event.status === "responding" ? "处置中" : event.status === "resolved" ? "已处置" : "已复盘"}  \n`;
    report += `**事件概述**：${event.description}\n\n`;

    report += `## 二、传播过程\n\n`;
    report += `本次舆情共经历 ${nonPlaceholderCards.length}/4 个关键传播节点，累计覆盖约 ${totalReach} 人次：\n\n`;
    nonPlaceholderCards.forEach((c, i) => {
      report += `### ${i + 1}. ${TIMELINE_TYPE_LABELS[c.type]}（${c.sourceTime || "待补充"}）\n\n`;
      report += `- **事件**：${c.title}\n`;
      report += `- **摘要**：${c.summary}\n`;
      if (c.channels.length > 0) {
        report += `- **传播渠道**：${c.channels.join("、")}\n`;
      }
      report += `- **覆盖人数**：约 ${c.reachCount.toLocaleString()} 人次\n`;
      if (c.impact) {
        report += `- **主要影响**：${c.impact}\n`;
      }
      report += "\n";
    });

    const missingSteps = cards.filter((c) => c.placeholder);
    if (missingSteps.length > 0) {
      report += `> ⚠️ 以下环节材料待补充：${missingSteps.map((c) => TIMELINE_TYPE_LABELS[c.type]).join("、")}\n\n`;
    }

    report += `## 三、关键回应\n\n`;
    if (officialCard) {
      report += `**官方回应时间**：${officialCard.sourceTime}  \n`;
      report += `**回应标题**：${officialCard.title}  \n\n`;
      report += `${officialCard.summary}\n\n`;
    } else {
      report += `> 🔔 尚未发布官方回应，请尽快拟定回应口径\n\n`;
    }

    report += `## 四、群众关切\n\n`;
    if (sortedCats.length > 0) {
      report += `共归纳 ${checkedConcerns.length} 个高频问题，累计提及 ${totalMentions} 次。\n\n`;
      report += `**关切类别分布**：\n`;
      sortedCats.forEach(([cat, count]) => {
        const pct = ((count / totalMentions) * 100).toFixed(0);
        report += `- ${CONCERN_CATEGORY_LABELS[cat as keyof typeof CONCERN_CATEGORY_LABELS] || cat}：${count}次（${pct}%）\n`;
      });
      report += "\n";

      report += `**需重点回应的 3 个问题**：\n`;
      topQuestions.forEach((q, i) => {
        report += `${i + 1}. ${q.content}（${q.count}次提及）\n`;
      });
      report += "\n";
    } else {
      report += `> 尚未勾选群众关切问题，请在「群众关切」模块中勾选高频问题\n\n`;
    }

    report += `## 五、处置进展\n\n`;
    if (completedItems.length > 0) {
      report += `**已完成处置动作**：\n`;
      completedItems.forEach((item, i) => {
        report += `${i + 1}. [${HANDOFF_SECTION_LABELS[item.section]}] ${item.content} ✅\n`;
      });
      report += "\n";
    }

    if (pendingItems.length > 0) {
      report += `**待完成事项**：\n`;
      pendingItems.forEach((item, i) => {
        report += `${i + 1}. [${HANDOFF_SECTION_LABELS[item.section]}] ${item.content} ⏳\n`;
      });
      report += "\n";
    }

    if (event.reviewConclusion) {
      report += `## 六、复盘结论\n\n`;
      report += `${event.reviewConclusion}\n\n`;
      if (event.reviewer) {
        report += `> 复盘人：${event.reviewer}\n`;
      }
    }

    return report;
  } else {
    let report = `# 「${event.title}」舆情复盘报告（内部复盘版）\n\n`;

    report += `## 一、事件档案\n\n`;
    report += `| 项 | 内容 |\n| --- | --- |\n`;
    report += `| 事件等级 | ${event.level === "critical" ? "特别重大" : event.level === "high" ? "重大" : event.level === "medium" ? "较重" : "一般"} |\n`;
    report += `| 当前状态 | ${event.status === "monitoring" ? "监测中" : event.status === "responding" ? "处置中" : event.status === "resolved" ? "已处置" : "已复盘"} |\n`;
    report += `| 创建时间 | ${event.createdAt} |\n`;
    report += `| 最近更新 | ${event.updatedAt} |\n`;
    report += `| 传播节点 | ${nonPlaceholderCards.length}/4 个完整 |\n\n`;

    report += `**事件描述**：${event.description}\n\n`;

    report += `## 二、传播链路全追踪\n\n`;
    cards.forEach((c, i) => {
      report += `### ${i + 1}. ${TIMELINE_TYPE_LABELS[c.type]}\n\n`;
      if (c.placeholder) {
        report += `> ❌ **待补充**：此环节尚未收集到材料\n\n`;
      } else {
        report += `- **发生时间**：${c.sourceTime}\n`;
        report += `- **核心事件**：${c.title}\n`;
        report += `- **详细摘要**：${c.summary}\n`;
        if (c.imageNote) {
          report += `- **截图备注**：${c.imageNote}\n`;
        }
        if (c.channels.length > 0) {
          report += `- **传播渠道**：${c.channels.join("、")}\n`;
        }
        report += `- **覆盖人数**：约 ${c.reachCount.toLocaleString()} 人次\n`;
        if (c.impact) {
          report += `- **主要影响**：${c.impact}\n`;
        }
        report += "\n";
      }
    });

    report += `## 三、关键时间节点\n\n`;
    report += `| 时间 | 事件 |\n| --- | --- |\n`;
    nonPlaceholderCards.forEach((c) => {
      report += `| ${c.sourceTime || "待补充"} | ${TIMELINE_TYPE_LABELS[c.type]}：${c.title} |\n`;
    });
    report += `| ${event.createdAt} | 事件登记入库 |\n`;
    report += `| ${event.updatedAt} | 最后更新 |\n\n`;

    report += `## 四、群众关切深度分析\n\n`;
    if (checkedConcerns.length > 0) {
      report += `共收集 ${checkedConcerns.length} 个高频问题，累计 ${totalMentions} 次提及。\n\n`;
      report += `**类别分布**：\n\n`;
      report += `| 类别 | 提及次数 | 占比 |\n| --- | ---: | ---: |\n`;
      sortedCats.forEach(([cat, count]) => {
        const pct = ((count / totalMentions) * 100).toFixed(1);
        report += `| ${CONCERN_CATEGORY_LABELS[cat as keyof typeof CONCERN_CATEGORY_LABELS] || cat} | ${count} | ${pct}% |\n`;
      });
      report += "\n";

      report += `**Top 10 高频问题**：\n\n`;
      [...checkedConcerns]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .forEach((q, i) => {
          const pct = ((q.count / totalMentions) * 100).toFixed(1);
          report += `${i + 1}. ${q.content}（${q.count}次，${pct}%）\n`;
        });
      report += "\n";
    } else {
      report += `> 未勾选群众关切问题，建议在「群众关切」模块中进行勾选\n\n`;
    }

    report += `## 五、交接与处置记录\n\n`;
    if (completedItems.length > 0) {
      report += `### ✅ 已完成处置（${completedItems.length}项）\n\n`;
      completedItems.forEach((item) => {
        report += `- **[${HANDOFF_SECTION_LABELS[item.section]}]** ${item.content}\n`;
        report += `  - 记录时间：${item.createdAt}\n\n`;
      });
    }

    if (pendingItems.length > 0) {
      report += `### ⏳ 待处理事项（${pendingItems.length}项）\n\n`;
      pendingItems.forEach((item) => {
        report += `- **[${HANDOFF_SECTION_LABELS[item.section]}]** ${item.content}\n`;
        report += `  - 记录时间：${item.createdAt}\n`;
        report += `  - ⚠️ **需下一班继续跟踪**\n\n`;
      });
    }

    if (handoffNotes.length > 0) {
      report += `### 📝 完整交接记录\n\n`;
      handoffNotes.forEach((note) => {
        report += `| 时间 | 班次 | 类型 | 内容 | 记录人 |\n| --- | --- | --- | --- | --- |\n`;
        report += `| ${note.createdAt} | ${note.shiftLabel} | ${HANDOFF_SECTION_LABELS[note.section]} | ${note.content.replace(/\n/g, "<br>")} | ${note.author} |\n\n`;
      });
    }

    report += `## 六、经验教训与改进建议\n\n`;

    const discoveryTiming =
      nonPlaceholderCards[0]?.type === "wechat"
        ? "✅ 本次最早从微信群发现，基层监测网络发挥作用，发现及时"
        : "⚠️ 首次发现渠道非基层社群，建议加强村/社区级舆情监测";

    report += `### （一）发现及时性\n\n${discoveryTiming}\n\n`;

    if (officialCard) {
      const firstCardTime = nonPlaceholderCards[0]?.sourceTime;
      const officialTime = officialCard.sourceTime;
      report += `### （二）响应速度\n\n`;
      report += `- 首次曝光：${firstCardTime || "待补充"}\n`;
      report += `- 官方回应：${officialTime}\n`;
      report += `- ✅ 已发布官方回应，建议总结回应口径有效性\n\n`;
    } else {
      report += `### （二）响应速度\n\n`;
      report += `- ⚠️ 尚未发布官方回应，建议制定回应预案\n`;
      report += `- 建议建立「黄金4小时」响应机制，把握舆论主动权\n\n`;
    }

    report += `### （三）内部协同\n\n`;
    const contacts = handoffNotes.filter((n) => n.section === "to_contact");
    if (contacts.length > 0) {
      report += `- 已协调 ${contacts.length} 个部门/单位参与处置\n`;
      report += `- 建议复盘跨部门联动效率，明确各部门职责边界\n`;
      report += `- 涉及部门：${[...new Set(contacts.map((n) => n.content.split("\n")[0] || "待明确"))].join("、")}\n\n`;
    } else {
      report += `- 未记录部门协同信息，建议完善联动台账\n\n`;
    }

    report += `### （四）后续预防\n\n`;
    report += `1. **监测预警**：优化舆情监测关键词，重点关注民生类、执法类话题\n`;
    report += `2. **信息公开**：建立常态化信息发布机制，主动回应群众关切\n`;
    report += `3. **预案建设**：针对同类事件制定标准化处置预案\n`;
    report += `4. **能力培训**：定期开展舆情应对培训，提升一线处置能力\n`;
    report += `5. **复盘机制**：将本次复盘经验纳入典型案例库，组织学习\n\n`;

    if (event.reviewConclusion) {
      report += `## 七、复盘结论\n\n`;
      report += `${event.reviewConclusion}\n\n`;
      if (event.reviewer) {
        report += `> 复盘人：${event.reviewer}\n`;
      }
    }

    report += `---\n\n`;
    report += `*本报告由舆情复盘看板自动生成，生成时间：${new Date().toLocaleString("zh-CN")}*\n`;

    return report;
  }
}

export default function ReviewReportSection({
  event,
  timelineCards,
  eventId,
}: ReviewReportSectionProps) {
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

  const [version, setVersion] = useState<ReportVersion>("director");
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () =>
      generateReport(
        event,
        timelineCards,
        concerns,
        handoffNotes,
        completedItems,
        pendingItems,
        version
      ),
    [event, timelineCards, concerns, handoffNotes, completedItems, pendingItems, version]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
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
            <span className="w-1.5 h-7 bg-gradient-to-b from-warning-500 to-orange-500 rounded-full" />
            复盘报告
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            双版本完整复盘材料，一键复制直接使用
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setVersion("director")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                version === "director"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Users className="w-4 h-4" />
              主任汇报版
            </button>
            <button
              onClick={() => setVersion("internal")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                version === "internal"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Building2 className="w-4 h-4" />
              内部复盘版
            </button>
          </div>
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
                复制全文
              </>
            )}
          </button>
        </div>
      </div>

      {version === "director" ? (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-100 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800 mb-1">
              主任汇报版
            </p>
            <p className="text-xs text-blue-700/80">
              精简版汇报材料，突出关键数据和处置成效，适合向上级领导汇报（3-5分钟讲清）
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 flex items-start gap-3">
          <BookOpenCheck className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 mb-1">
              内部复盘版
            </p>
            <p className="text-xs text-slate-700/80">
              完整版复盘材料，包含完整时间线、交接记录、经验教训分析，适合内部复盘会使用
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-600">
            传播节点：{timelineCards.filter((c) => !c.placeholder).length}/4
          </span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-slate-600">
            未核实信息：{pendingItems.filter((i) => i.section === "unverified").length} 项待核实
          </span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-slate-600">
            需联系部门：{pendingItems.filter((i) => i.section === "to_contact").length} 个待联系
          </span>
        </div>
        <div className="h-4 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-600">
            敏感信息：{pendingItems.filter((i) => i.section === "confidential").length} 项内部掌握
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 max-h-[600px] overflow-y-auto">
        <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
          {report}
        </pre>
      </div>

      {pendingItems.length > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-warning-50 to-orange-50 border border-warning-200 flex items-start gap-3 animate-slide-in-right">
          <FileWarning className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning-800 mb-1">
              还有 {pendingItems.length} 项待处理事项
            </p>
            <p className="text-xs text-warning-700/80">
              请在交接时确认这些事项，未处理完的会自动保留到下一班提醒中
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
