import { useMemo, useState } from "react";
import {
  FileText,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  MessageCircle,
  Shield,
  Video,
  Newspaper,
  Megaphone,
  ChevronRight,
  AlertCircle,
  Download,
  Copy,
  Check,
  Sparkles,
  Presentation,
  Archive,
} from "lucide-react";
import type { EventItem, TimelineType, ReportVersion } from "@/types";
import {
  TIMELINE_TYPE_LABELS,
  CONCERN_CATEGORY_LABELS,
  HANDOFF_SECTION_LABELS,
  EVENT_LEVEL_LABELS,
  EVENT_STATUS_LABELS,
} from "@/types";
import { useEventStore } from "@/store/eventStore";

const versionConfig: Record<
  ReportVersion,
  {
    label: string;
    icon: typeof FileText;
    description: string;
    color: string;
  }
> = {
  director: {
    label: "主任汇报版",
    icon: Presentation,
    description: "精简汇报材料，3-5分钟可讲完",
    color: "from-blue-500 to-indigo-600",
  },
  internal: {
    label: "内部复盘版",
    icon: Users,
    description: "完整复盘材料，用于内部深入分析",
    color: "from-emerald-500 to-teal-600",
  },
  meeting: {
    label: "会务群纯文本",
    icon: MessageCircle,
    description: "可直接复制发会务群的纯文本",
    color: "from-purple-500 to-pink-600",
  },
  archive: {
    label: "内部留档版",
    icon: Archive,
    description: "完整留档材料，含所有处置记录",
    color: "from-slate-500 to-slate-700",
  },
};

const timelineTypeIcons: Record<TimelineType, typeof MessageCircle> = {
  wechat: MessageCircle,
  shortvideo: Video,
  media: Newspaper,
  official: Megaphone,
};

const timelineColors: Record<TimelineType, { icon: string; bg: string; border: string; dot: string }> = {
  wechat: {
    icon: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  shortvideo: {
    icon: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    dot: "bg-pink-500",
  },
  media: {
    icon: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  official: {
    icon: "text-primary-600",
    bg: "bg-primary-50",
    border: "border-primary-200",
    dot: "bg-primary-500",
  },
};

interface ReviewReportSectionProps {
  event: EventItem;
}

export default function ReviewReportSection({
  event,
}: ReviewReportSectionProps) {
  const allTimelineCards = useEventStore((s) => s.timelineCards);
  const allConcerns = useEventStore((s) => s.concerns);
  const getPendingHandoffItems = useEventStore((s) => s.getPendingHandoffItems);
  const getCompletedHandoffItems = useEventStore(
    (s) => s.getCompletedHandoffItems
  );
  const getMaterialsByEventId = useEventStore((s) => s.getMaterialsByEventId);
  const allMaterials = useEventStore((s) => s.materials);
  const isMaterialOverdue = useEventStore((s) => s.isMaterialOverdue);
  const getUrgeRecordsByEvent = useEventStore((s) => s.getUrgeRecordsByEvent);
  const allUrgeRecords = useEventStore((s) => s.urgeRecords);

  const [version, setVersion] = useState<ReportVersion>("director");
  const [copied, setCopied] = useState(false);

  const timelineCards = useMemo(() => {
    const existing = allTimelineCards.filter((t) => t.eventId === event.id);
    const allTypes: TimelineType[] = ["wechat", "shortvideo", "media", "official"];
    const existingTypes = new Set(existing.map((t) => t.type));
    const placeholders: typeof existing = allTypes
      .filter((t) => !existingTypes.has(t))
      .map((t, idx) => ({
        id: `placeholder-${t}`,
        eventId: event.id,
        type: t,
        title: `${TIMELINE_TYPE_LABELS[t]}材料待补充`,
        summary: "暂无该环节材料，待补充后可完善传播链路分析",
        imageNote: "",
        impact: "",
        reachCount: 0,
        channels: [],
        order: existing.length + idx + 1,
        sourceTime: "",
        placeholder: true,
      }));
    return [...existing, ...placeholders].sort((a, b) => a.order - b.order);
  }, [allTimelineCards, event.id]);

  const concerns = useMemo(
    () => allConcerns.filter((c) => c.eventId === event.id && c.checked),
    [allConcerns, event.id]
  );

  const pendingHandoff = useMemo(
    () => getPendingHandoffItems(event.id),
    [getPendingHandoffItems, event.id, allConcerns, allMaterials, allUrgeRecords]
  );

  const completedHandoff = useMemo(
    () => getCompletedHandoffItems(event.id),
    [getCompletedHandoffItems, event.id, allConcerns, allMaterials, allUrgeRecords]
  );

  const materials = useMemo(
    () => getMaterialsByEventId(event.id),
    [getMaterialsByEventId, event.id, allMaterials]
  );

  const urgeRecords = useMemo(
    () => getUrgeRecordsByEvent(event.id),
    [getUrgeRecordsByEvent, event.id, allUrgeRecords]
  );

  const categoryStats = useMemo(() => {
    const stats = new Map<string, { count: number; items: typeof concerns }>();
    concerns.forEach((c) => {
      if (!stats.has(c.category)) {
        stats.set(c.category, { count: 0, items: [] });
      }
      const s = stats.get(c.category)!;
      s.count += c.count;
      s.items.push(c);
    });
    return Array.from(stats.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [concerns]);

  const topConcerns = useMemo(
    () => [...concerns].sort((a, b) => b.count - a.count).slice(0, 3),
    [concerns]
  );

  const generatePlainText = (ver: "meeting" | "archive"): string => {
    const lines: string[] = [];
    const now = new Date().toLocaleDateString("zh-CN");

    if (ver === "meeting") {
      lines.push(`【舆情复盘汇报】${event.title}`);
      lines.push(`汇报时间：${now}`);
      lines.push(`事件级别：${EVENT_LEVEL_LABELS[event.level]}`);
      lines.push(`当前状态：${EVENT_STATUS_LABELS[event.status]}`);
      lines.push("");
      lines.push("=== 一、事件概况 ===");
      lines.push(event.description);
      lines.push("");
      lines.push("=== 二、传播过程 ===");
      timelineCards.forEach((t, idx) => {
        const tag = t.placeholder ? "【待补充】" : "";
        lines.push(`${idx + 1}. ${TIMELINE_TYPE_LABELS[t.type]} ${tag}`);
        if (!t.placeholder) {
          lines.push(`   ${t.title}`);
          lines.push(`   ${t.summary}`);
        } else {
          lines.push(`   该环节材料待补充`);
        }
      });
      lines.push("");
      lines.push("=== 三、群众关切TOP3 ===");
      if (topConcerns.length === 0) {
        lines.push("暂无已勾选的群众关切");
      } else {
        topConcerns.forEach((c, idx) => {
          lines.push(`${idx + 1}. ${c.content}（${c.count}条）`);
        });
      }
      lines.push("");
      lines.push("=== 四、处置进展 ===");
      const pendingMats = materials.filter((m) => m.status === "pending");
      const submittedMats = materials.filter((m) => m.status === "submitted");
      const approvedMats = materials.filter((m) => m.status === "approved");
      lines.push(`材料：待提交${pendingMats.length}项 / 待审核${submittedMats.length}项 / 已完成${approvedMats.length}项`);
      lines.push(`交接：已完成${completedHandoff.length}项 / 待处理${pendingHandoff.length}项`);
      lines.push("");
      if (pendingHandoff.length > 0) {
        lines.push("=== 五、待办事项（需关注） ===");
        pendingHandoff.forEach((h, idx) => {
          lines.push(`${idx + 1}. [${HANDOFF_SECTION_LABELS[h.section]}] ${h.content}`);
        });
      }
    } else {
      lines.push(`【舆情复盘留档】${event.title}`);
      lines.push(`归档时间：${now}`);
      lines.push(`事件ID：${event.id}`);
      lines.push(`事件级别：${EVENT_LEVEL_LABELS[event.level]}`);
      lines.push(`当前状态：${EVENT_STATUS_LABELS[event.status]}`);
      lines.push(`创建时间：${event.createdAt}`);
      lines.push(`更新时间：${event.updatedAt}`);
      lines.push("");
      lines.push("=== 一、事件详情 ===");
      lines.push(event.description);
      if (event.reviewConclusion) {
        lines.push("");
        lines.push("复盘结论：");
        lines.push(event.reviewConclusion);
      }
      lines.push("");
      lines.push("=== 二、完整传播链路 ===");
      timelineCards.forEach((t, idx) => {
        const tag = t.placeholder ? "【材料待补充】" : "";
        lines.push(`${idx + 1}. ${TIMELINE_TYPE_LABELS[t.type]} ${tag}`);
        if (!t.placeholder) {
          lines.push(`   标题：${t.title}`);
          lines.push(`   时间：${t.sourceTime}`);
          lines.push(`   摘要：${t.summary}`);
          if (t.imageNote) lines.push(`   备注：${t.imageNote}`);
          if (t.impact) lines.push(`   影响：${t.impact}`);
          if (t.reachCount > 0) lines.push(`   触达：${t.reachCount}人`);
          if (t.channels.length > 0) lines.push(`   渠道：${t.channels.join("、")}`);
        }
        lines.push("");
      });
      lines.push("=== 三、群众关切完整列表 ===");
      if (categoryStats.length === 0) {
        lines.push("暂无已勾选的群众关切");
      } else {
        categoryStats.forEach(([cat, s]) => {
          lines.push(`【${CONCERN_CATEGORY_LABELS[cat]}】共${s.count}条`);
          s.items.forEach((c) => {
            lines.push(`  - ${c.content}（${c.count}条）`);
          });
          lines.push("");
        });
      }
      lines.push("=== 四、材料台账 ===");
      lines.push(`材料总数：${materials.length}项`);
      const pendingMats = materials.filter((m) => m.status === "pending");
      const submittedMats = materials.filter((m) => m.status === "submitted");
      const approvedMats = materials.filter((m) => m.status === "approved");
      lines.push(`  待提交：${pendingMats.length}项`);
      lines.push(`  待审核：${submittedMats.length}项`);
      lines.push(`  已完成：${approvedMats.length}项`);
      if (materials.length > 0) {
        lines.push("");
        materials.forEach((m, idx) => {
          const overdue = m.status === "pending" && isMaterialOverdue(m);
          const statusLabel = m.status === "pending" ? "待提交" : m.status === "submitted" ? "待审核" : "已完成";
          lines.push(`${idx + 1}. [${statusLabel}${overdue ? " · 已超期" : ""}] ${m.type}`);
          lines.push(`   责任部门：${m.department}`);
          lines.push(`   截止时间：${m.deadline}`);
        });
      }
      if (urgeRecords.length > 0) {
        lines.push("");
        lines.push(`催办记录：共${urgeRecords.length}次`);
        urgeRecords.slice(-10).forEach((r, idx) => {
          const typeLabel = r.type === "wechat" ? "微信版" : "正式版";
          lines.push(`  ${idx + 1}. [${typeLabel}] ${r.createdAt} · ${r.operator}`);
        });
      }
      lines.push("");
      lines.push("=== 五、交接处置完整记录 ===");
      lines.push(`已完成：${completedHandoff.length}项`);
      if (completedHandoff.length > 0) {
        completedHandoff.forEach((h, idx) => {
          lines.push(`${idx + 1}. ✅ [${HANDOFF_SECTION_LABELS[h.section]}] ${h.content}`);
        });
      }
      lines.push("");
      lines.push(`待处理：${pendingHandoff.length}项`);
      if (pendingHandoff.length > 0) {
        pendingHandoff.forEach((h, idx) => {
          lines.push(`${idx + 1}. ⏳ [${HANDOFF_SECTION_LABELS[h.section]}] ${h.content}`);
        });
      }
    }

    lines.push("");
    lines.push("—— 舆情复盘看板自动生成 ——");
    return lines.join("\n");
  };

  const handleExport = async () => {
    if (version === "meeting" || version === "archive") {
      const text = generatePlainText(version);
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  const VerIcon = versionConfig[version].icon;

  return (
    <div className="card-base p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-amber-600 rounded-full" />
            复盘汇报材料
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            一键生成可直接使用的会议稿，支持多版本切换
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(version === "meeting" || version === "archive") && (
            <button
              onClick={handleExport}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                copied
                  ? "bg-success-100 text-success-700 border border-success-200"
                  : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/25"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制到剪贴板
                </>
              ) : (
                <>
                  {version === "meeting" ? (
                    <Copy className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {version === "meeting" ? "复制会务群文本" : "复制留档文本"}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-slate-100 rounded-2xl">
        {Object.entries(versionConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const isActive = version === (key as ReportVersion);
          return (
            <button
              key={key}
              onClick={() => setVersion(key as ReportVersion)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-white text-slate-800 shadow-md"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "" : "opacity-60"}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div
        className={`p-1 rounded-2xl bg-gradient-to-br ${versionConfig[version].color} shadow-sm`}
      >
        <div className="bg-white rounded-xl p-6">
          {(version === "meeting" || version === "archive") ? (
            <div className="space-y-0">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${versionConfig[version].color} flex items-center justify-center`}
                  >
                    <VerIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {versionConfig[version].label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {versionConfig[version].description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    copied
                      ? "bg-success-100 text-success-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      一键复制
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/50 rounded-xl p-5 max-h-[600px] overflow-y-auto">
                {generatePlainText(version)}
              </pre>
            </div>
          ) : version === "director" ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  事件概况
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="tag bg-primary-50 text-primary-700 border-primary-200">
                    {EVENT_LEVEL_LABELS[event.level]}舆情
                  </span>
                  <span className="tag bg-slate-100 text-slate-700 border-slate-200">
                    {EVENT_STATUS_LABELS[event.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-100">
                  {event.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  传播过程（4步链路）
                </h4>
                <div className="relative pl-4">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-200" />
                  {timelineCards.map((t, idx) => {
                    const Icon = timelineTypeIcons[t.type];
                    const colors = timelineColors[t.type];
                    return (
                      <div
                        key={t.id}
                        className="relative pb-5 last:pb-0 animate-slide-up"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        <div
                          className={`absolute -left-0.5 top-1 w-4 h-4 rounded-full ${colors.dot} border-2 border-white shadow-sm`}
                        />
                        <div className="ml-6">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-xs font-bold ${colors.icon}`}
                            >
                              {TIMELINE_TYPE_LABELS[t.type]}
                            </span>
                            {t.placeholder && (
                              <span className="tag bg-slate-100 text-slate-500 border-slate-200 text-[10px]">
                                材料待补充
                              </span>
                            )}
                          </div>
                          {!t.placeholder ? (
                            <>
                              <p className="text-sm font-semibold text-slate-800">
                                {t.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                {t.summary}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              暂无该环节材料，待补充后完善
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {topConcerns.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    群众关切（最需回应的TOP3）
                  </h4>
                  <div className="space-y-2">
                    {topConcerns.map((c, idx) => (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 animate-slide-up"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">
                            {c.content}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {CONCERN_CATEGORY_LABELS[c.category]} · 约{c.count}条评论提及
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(pendingHandoff.length > 0 || completedHandoff.length > 0) && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    处置与交接进展
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-success-50 border border-success-100">
                      <p className="text-2xl font-bold text-success-700">
                        {completedHandoff.length}
                      </p>
                      <p className="text-xs text-success-600">已完成事项</p>
                    </div>
                    <div className="p-3 rounded-xl bg-warning-50 border border-warning-100">
                      <p className="text-2xl font-bold text-warning-700">
                        {pendingHandoff.length}
                      </p>
                      <p className="text-xs text-warning-600">待处理事项</p>
                    </div>
                  </div>
                  {pendingHandoff.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-600">
                        ⏳ 待处理（需下一班关注）：
                      </p>
                      {pendingHandoff.slice(0, 3).map((h) => (
                        <div
                          key={h.id}
                          className="flex items-start gap-2 p-2 rounded-lg bg-warning-50 border border-warning-100"
                        >
                          <Clock className="w-3.5 h-3.5 text-warning-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <span className="font-semibold text-warning-700">
                              [{HANDOFF_SECTION_LABELS[h.section]}]
                            </span>
                            <span className="text-slate-700 ml-1">{h.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {event.reviewConclusion && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                    复盘结论
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-success-50 rounded-xl p-4 border border-success-100">
                    {event.reviewConclusion}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
                  <p className="text-xs text-primary-600 mb-1">事件级别</p>
                  <p className="text-lg font-bold text-primary-700">
                    {EVENT_LEVEL_LABELS[event.level]}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-600 mb-1">处置状态</p>
                  <p className="text-lg font-bold text-blue-700">
                    {EVENT_STATUS_LABELS[event.status]}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs text-purple-600 mb-1">群众关切</p>
                  <p className="text-lg font-bold text-purple-700">
                    {concerns.length}项
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs text-amber-600 mb-1">待办事项</p>
                  <p className="text-lg font-bold text-amber-700">
                    {pendingHandoff.length}项
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  事件档案
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td className="px-4 py-2.5 text-slate-500 w-28">事件标题</td>
                        <td className="px-4 py-2.5 text-slate-800 font-medium">
                          {event.title}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="px-4 py-2.5 text-slate-500">事件描述</td>
                        <td className="px-4 py-2.5 text-slate-700">
                          {event.description}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td className="px-4 py-2.5 text-slate-500">创建时间</td>
                        <td className="px-4 py-2.5 text-slate-700">
                          {event.createdAt}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-slate-500">更新时间</td>
                        <td className="px-4 py-2.5 text-slate-700">
                          {event.updatedAt}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  传播链路全追踪（含待补充环节）
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                          环节
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                          时间
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                          标题/摘要
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                          触达
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {timelineCards.map((t, idx) => {
                        const Icon = timelineTypeIcons[t.type];
                        const colors = timelineColors[t.type];
                        return (
                          <tr
                            key={t.id}
                            className="border-b border-slate-100 last:border-b-0 animate-slide-up"
                            style={{ animationDelay: `${idx * 50}ms` }}
                          >
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 font-semibold ${colors.icon}`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                {TIMELINE_TYPE_LABELS[t.type]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-xs">
                              {t.placeholder ? "-" : t.sourceTime}
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              {t.placeholder ? (
                                <span className="text-slate-400 italic text-xs">
                                  材料待补充
                                </span>
                              ) : (
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {t.title}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                    {t.summary}
                                  </p>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-xs">
                              {t.placeholder || t.reachCount === 0
                                ? "-"
                                : `${t.reachCount}人`}
                            </td>
                            <td className="px-4 py-3">
                              {t.placeholder ? (
                                <span className="tag bg-slate-100 text-slate-500 border-slate-200 text-[10px]">
                                  待补充
                                </span>
                              ) : (
                                <span className="tag bg-success-50 text-success-700 border-success-200 text-[10px]">
                                  已收集
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {categoryStats.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    群众关切分类统计
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryStats.map(([cat, s], idx) => (
                      <div
                        key={cat}
                        className="p-4 rounded-xl bg-purple-50 border border-purple-100 animate-slide-up"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-purple-700">
                            {CONCERN_CATEGORY_LABELS[cat]}
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {s.count}条
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {s.items.slice(0, 5).map((c) => (
                            <li
                              key={c.id}
                              className="text-xs text-slate-600 flex items-center gap-1.5"
                            >
                              <ChevronRight className="w-3 h-3 text-purple-400" />
                              {c.content}
                              <span className="text-slate-400">（{c.count}）</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {materials.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-500" />
                    材料台账详情
                  </h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                            材料
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                            责任部门
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                            截止时间
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                            状态
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {materials.map((m, idx) => {
                          const overdue =
                            m.status === "pending" && isMaterialOverdue(m);
                          const statusMap = {
                            pending: { label: "待提交", color: "warning" },
                            submitted: { label: "待审核", color: "blue" },
                            approved: { label: "已完成", color: "success" },
                          };
                          const st = statusMap[m.status];
                          return (
                            <tr
                              key={m.id}
                              className="border-b border-slate-100 last:border-b-0 animate-slide-up"
                              style={{ animationDelay: `${idx * 40}ms` }}
                            >
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {m.type}
                                {overdue && (
                                  <AlertCircle className="w-3.5 h-3.5 text-red-500 ml-1.5 inline animate-pulse" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {m.department}
                              </td>
                              <td
                                className={`px-4 py-3 ${
                                  overdue ? "text-red-600 font-semibold" : "text-slate-600"
                                }`}
                              >
                                {m.deadline}
                                {overdue && "（已超期）"}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`tag text-[10px] bg-${st.color}-50 text-${st.color}-700 border-${st.color}-200`}
                                >
                                  {st.label}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {(pendingHandoff.length > 0 || completedHandoff.length > 0) && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    完整交接处置记录
                  </h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 w-20">
                            状态
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 w-28">
                            类别
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">
                            内容
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...completedHandoff, ...pendingHandoff].map((h, idx) => (
                          <tr
                            key={h.id}
                            className={`border-b border-slate-100 last:border-b-0 animate-slide-up ${
                              h.done ? "bg-success-50/50" : "bg-warning-50/50"
                            }`}
                            style={{ animationDelay: `${idx * 40}ms` }}
                          >
                            <td className="px-4 py-3">
                              {h.done ? (
                                <span className="tag bg-success-100 text-success-700 border-success-200 text-[10px] flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  已完成
                                </span>
                              ) : (
                                <span className="tag bg-warning-100 text-warning-700 border-warning-200 text-[10px] flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  待处理
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-semibold text-slate-600">
                                [{HANDOFF_SECTION_LABELS[h.section]}]
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {h.content}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pendingHandoff.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-800 mb-1">
                        💡 下一班提醒
                      </p>
                      <p className="text-xs text-amber-700">
                        以上 {pendingHandoff.length} 项待处理事项将自动保留到下一班交接清单中，处理进度实时同步，刷新后仍然有效。
                      </p>
                    </div>
                  )}
                </div>
              )}

              {event.reviewConclusion && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                    经验教训与复盘结论
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-success-50 rounded-xl p-4 border border-success-100">
                    {event.reviewConclusion}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
