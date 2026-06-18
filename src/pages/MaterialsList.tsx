import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventStore } from "@/store/eventStore";
import PageHeader from "@/components/PageHeader";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
  FileX,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  BellRing,
  MessageSquare,
  FileText,
  History,
  Layers,
  XCircle,
} from "lucide-react";
import type { MaterialItem, UrgeMessage, OverdueLevel } from "@/types";

const OVERDUE_LEVEL_CONFIG: Record<OverdueLevel, { label: string; color: string; bg: string; border: string }> = {
  none: { label: "", color: "", bg: "", border: "" },
  mild: { label: "超期1天内", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  serious: { label: "超期1-2天", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  critical: { label: "超期2天以上", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

export default function MaterialsList() {
  const navigate = useNavigate();
  const getMaterialsGroupedByEvent = useEventStore((s) => s.getMaterialsGroupedByEvent);
  const getPendingMaterials = useEventStore((s) => s.getPendingMaterials);
  const getCompletedMaterials = useEventStore((s) => s.getCompletedMaterials);
  const getOverdueMaterials = useEventStore((s) => s.getOverdueMaterials);
  const setMaterialStatus = useEventStore((s) => s.setMaterialStatus);
  const isMaterialOverdue = useEventStore((s) => s.isMaterialOverdue);
  const getOverdueLevel = useEventStore((s) => s.getOverdueLevel);
  const getOverdueDays = useEventStore((s) => s.getOverdueDays);
  const generateUrgeMessage = useEventStore((s) => s.generateUrgeMessage);
  const addUrgeRecord = useEventStore((s) => s.addUrgeRecord);
  const getUrgeRecordsByMaterial = useEventStore((s) => s.getUrgeRecordsByMaterial);
  const allMaterials = useEventStore((s) => s.materials);
  const allUrgeRecords = useEventStore((s) => s.urgeRecords);

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [expandedUrge, setExpandedUrge] = useState<string | null>(null);
  const [copiedUrge, setCopiedUrge] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grouped" | "pipeline">("grouped");

  const groupedMaterials = useMemo(
    () => getMaterialsGroupedByEvent(),
    [getMaterialsGroupedByEvent, allMaterials]
  );
  const pendingMats = useMemo(
    () => getPendingMaterials(),
    [getPendingMaterials, allMaterials]
  );
  const completedMats = useMemo(
    () => getCompletedMaterials(),
    [getCompletedMaterials, allMaterials]
  );
  const overdueMats = useMemo(
    () => getOverdueMaterials(),
    [getOverdueMaterials, allMaterials]
  );

  const pendingGroups = useMemo(
    () => groupedMaterials.filter((g) => g.pendingCount > 0 || g.submittedCount > 0),
    [groupedMaterials]
  );
  const completedGroups = useMemo(
    () => groupedMaterials.filter((g) => g.pendingCount === 0 && g.submittedCount === 0),
    [groupedMaterials]
  );

  const stats = useMemo(
    () => ({
      total: allMaterials.length,
      pending: pendingMats.length,
      submitted: allMaterials.filter((m) => m.status === "submitted").length,
      approved: allMaterials.filter((m) => m.status === "approved").length,
      overdue: overdueMats.length,
    }),
    [allMaterials, pendingMats.length, overdueMats.length]
  );

  const statusConfig: Record<
    "pending" | "submitted" | "approved",
    { label: string; icon: typeof Clock; color: string; border: string; bg: string }
  > = {
    pending: {
      label: "待提交",
      icon: Clock,
      color: "text-warning-600",
      border: "border-warning-200",
      bg: "bg-warning-50",
    },
    submitted: {
      label: "待审核",
      icon: Send,
      color: "text-blue-600",
      border: "border-blue-200",
      bg: "bg-blue-50",
    },
    approved: {
      label: "已审核",
      icon: CheckCircle2,
      color: "text-success-600",
      border: "border-success-200",
      bg: "bg-success-50",
    },
  };

  const handleCopyUrge = async (
    msg: UrgeMessage,
    type: "wechat" | "formal",
    material: MaterialItem
  ) => {
    try {
      const text = type === "wechat" ? msg.wechatVersion : msg.formalVersion;
      await navigator.clipboard.writeText(text);
      setCopiedUrge(`${material.id}-${type}`);
      addUrgeRecord({
        materialId: material.id,
        eventId: material.eventId,
        type,
        content: text,
        operator: "值班人",
      });
      setTimeout(() => setCopiedUrge(null), 2000);
    } catch {
      // ignore
    }
  };

  const renderMaterialRow = (mat: MaterialItem, idx: number) => {
    const cfg = statusConfig[mat.status];
    const Icon = cfg.icon;
    const overdue = mat.status === "pending" && isMaterialOverdue(mat);
    const overdueLevel = getOverdueLevel(mat);
    const overdueDays = getOverdueDays(mat);
    const urgeMsg = mat.status === "pending" ? generateUrgeMessage(mat, `${window.location.origin}/events/${mat.eventId}`) : null;
    const isUrgeExpanded = expandedUrge === mat.id;
    const urgeRecords = getUrgeRecordsByMaterial(mat.id);
    const levelCfg = OVERDUE_LEVEL_CONFIG[overdueLevel];

    let rowBgClass = "hover:bg-slate-50/50";
    if (overdue) {
      if (overdueLevel === "critical") rowBgClass = "bg-red-100/60 hover:bg-red-100";
      else if (overdueLevel === "serious") rowBgClass = "bg-orange-50/70 hover:bg-orange-100";
      else rowBgClass = "bg-yellow-50/70 hover:bg-yellow-100";
    }

    return (
      <>
        <tr
          key={mat.id}
          className={`border-b border-slate-100 last:border-b-0 transition-colors animate-slide-up ${rowBgClass}`}
          style={{ animationDelay: `${idx * 40}ms` }}
        >
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              {overdue ? (
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 animate-pulse ${overdueLevel === "critical" ? "text-red-600" : overdueLevel === "serious" ? "text-orange-500" : "text-yellow-500"}`} />
              ) : (
                <FileX className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span
                className={`text-sm font-medium ${
                  overdue ? "text-slate-800" : "text-slate-800"
                }`}
              >
                {mat.type}
              </span>
              {overdue && (
                <span className={`tag text-[10px] ${levelCfg.bg} ${levelCfg.color} border ${levelCfg.border}`}>
                  {overdueDays > 0 ? `超期${overdueDays}天` : "已超期"}
                </span>
              )}
            </div>
          </td>
          <td className="px-5 py-3.5 text-sm text-slate-700">{mat.department}</td>
          <td className="px-5 py-3.5">
            <span
              className={`text-sm ${
                overdue ? "text-red-600 font-semibold" : "text-slate-600"
              }`}
            >
              {mat.deadline}
            </span>
          </td>
          <td className="px-5 py-3.5">
            <span
              className={`tag gap-1 ${cfg.bg} ${cfg.color} border ${cfg.border}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
          </td>
          <td className="px-5 py-3.5 text-right">
            <div className="flex items-center justify-end gap-2 flex-wrap">
              {mat.status === "pending" && urgeRecords.length > 0 && (
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <History className="w-3 h-3" />
                  催办{urgeRecords.length}次
                </span>
              )}
              {mat.status === "pending" && urgeMsg && (
                <button
                  onClick={() =>
                    setExpandedUrge(isUrgeExpanded ? null : mat.id)
                  }
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                    isUrgeExpanded
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : overdue
                      ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                      : "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                  }`}
                >
                  <BellRing className="w-3 h-3" />
                  催办
                  {isUrgeExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
              {mat.status === "pending" && (
                <button
                  onClick={() => setMaterialStatus(mat.id, "submitted")}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  标记已提交
                </button>
              )}
              {mat.status === "submitted" && (
                <button
                  onClick={() => setMaterialStatus(mat.id, "approved")}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-success-50 text-success-700 border border-success-200 hover:bg-success-100 transition-colors"
                >
                  审核通过
                </button>
              )}
              {mat.status === "approved" && (
                <span className="text-xs text-success-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  已完成
                </span>
              )}
            </div>
          </td>
        </tr>
        {isUrgeExpanded && urgeMsg && (
          <tr className="bg-orange-50/50 border-b border-orange-100">
            <td colSpan={5} className="px-5 py-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-white p-3 border border-orange-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      微信版话术
                    </p>
                    <button
                      onClick={() => handleCopyUrge(urgeMsg, "wechat", mat)}
                      className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                        copiedUrge === `${mat.id}-wechat`
                          ? "bg-success-100 text-success-700"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      }`}
                    >
                      {copiedUrge === `${mat.id}-wechat` ? (
                        <>
                          <Check className="w-3 h-3" />
                          已复制并记录
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          复制并记录
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-orange-50/50 rounded-lg p-2.5">
                    {urgeMsg.wechatVersion}
                  </pre>
                </div>
                <div className="rounded-xl bg-white p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      正式版话术
                    </p>
                    <button
                      onClick={() => handleCopyUrge(urgeMsg, "formal", mat)}
                      className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                        copiedUrge === `${mat.id}-formal`
                          ? "bg-success-100 text-success-700"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {copiedUrge === `${mat.id}-formal` ? (
                        <>
                          <Check className="w-3 h-3" />
                          已复制并记录
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          复制并记录
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 rounded-lg p-2.5">
                    {urgeMsg.formalVersion}
                  </pre>
                </div>
              </div>
              {urgeRecords.length > 0 && (
                <div className="mt-3 p-2.5 rounded-lg bg-white border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    催办记录（{urgeRecords.length}次）
                  </p>
                  <div className="space-y-1">
                    {urgeRecords.slice(-3).reverse().map((r) => (
                      <div key={r.id} className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span className={`tag ${r.type === "wechat" ? "bg-green-50 text-green-600 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"} text-[9px]`}>
                          {r.type === "wechat" ? "微信" : "正式"}
                        </span>
                        <span>{r.createdAt}</span>
                        <span>·</span>
                        <span>{r.operator}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </td>
          </tr>
        )}
      </>
    );
  };

  const PipelineView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        { key: "pending", label: "待提交", icon: Clock, color: "warning", count: stats.pending, mats: allMaterials.filter((m) => m.status === "pending") },
        { key: "submitted", label: "待审核", icon: Send, color: "blue", count: stats.submitted, mats: allMaterials.filter((m) => m.status === "submitted") },
        { key: "approved", label: "已审核", icon: CheckCircle2, color: "success", count: stats.approved, mats: allMaterials.filter((m) => m.status === "approved") },
      ].map((col, colIdx) => {
        const Icon = col.icon;
        const colorMap: Record<string, string> = {
          warning: "from-warning-400 to-warning-600",
          blue: "from-blue-400 to-blue-600",
          success: "from-success-400 to-success-600",
        };
        return (
          <div key={col.key} className="card-base p-5 animate-slide-up" style={{ animationDelay: `${colIdx * 80}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[col.color]} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{col.label}</p>
                  <p className="text-xs text-slate-500">共 {col.count} 项</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {col.mats.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {col.key === "pending" && <XCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />}
                  {col.key === "submitted" && <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />}
                  {col.key === "approved" && <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />}
                  暂无{col.label}材料
                </div>
              ) : (
                col.mats.map((mat, idx) => {
                  const overdue = mat.status === "pending" && isMaterialOverdue(mat);
                  const overdueLevel = getOverdueLevel(mat);
                  const overdueDays = getOverdueDays(mat);
                  return (
                    <div
                      key={mat.id}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        overdue
                          ? overdueLevel === "critical"
                            ? "bg-red-50 border-red-200 hover:border-red-300"
                            : overdueLevel === "serious"
                            ? "bg-orange-50 border-orange-200 hover:border-orange-300"
                            : "bg-yellow-50 border-yellow-200 hover:border-yellow-300"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
                      }`}
                      onClick={() => navigate(`/events/${mat.eventId}`)}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-2">{mat.type}</p>
                        {overdue && (
                          <span className={`tag text-[9px] flex-shrink-0 ${OVERDUE_LEVEL_CONFIG[overdueLevel].bg} ${OVERDUE_LEVEL_CONFIG[overdueLevel].color} border ${OVERDUE_LEVEL_CONFIG[overdueLevel].border}`}>
                            {overdueDays > 0 ? `超${overdueDays}天` : "超期"}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mb-1">{mat.department}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>⏰ {mat.deadline}</span>
                        <span className="text-primary-600">查看 →</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">📌 {mat.eventTitle}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <PageHeader title="待补材料" subtitle="材料台账 · 闭环管理" showBack />

      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
            <div className="card-base p-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">材料总数</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="card-base p-4 animate-slide-up" style={{ animationDelay: "60ms" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">待提交</p>
                  <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="card-base p-4 animate-slide-up" style={{ animationDelay: "120ms" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">待审核</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
                </div>
              </div>
            </div>
            <div className="card-base p-4 animate-slide-up" style={{ animationDelay: "180ms" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">已审核</p>
                  <p className="text-2xl font-bold text-success-600">{stats.approved}</p>
                </div>
              </div>
            </div>
            <div className="card-base p-4 animate-slide-up" style={{ animationDelay: "240ms" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">已超期</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode("grouped")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grouped"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Layers className="w-4 h-4" />
              按事件聚合
            </button>
            <button
              onClick={() => setViewMode("pipeline")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                viewMode === "pipeline"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              材料闭环视图
            </button>
          </div>
        </div>

        {stats.overdue > 0 && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex items-start gap-4 animate-slide-in-right">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-base font-bold text-red-800 mb-1">
                ⚠️ 有 {stats.overdue} 项材料已超期！
              </p>
              <p className="text-sm text-red-700/80">
                涉及事件：
                {overdueMats
                  .reduce(
                    (acc, m) =>
                      acc.includes(m.eventTitle) ? acc : [...acc, m.eventTitle],
                    [] as string[]
                  )
                  .join("、")}
              </p>
              <p className="text-xs text-red-600/70 mt-1.5">
                请立即点击「催办」按钮生成话术，联系责任部门尽快提交。复制催办话术时会自动留下催办记录，交接时可查看催办历史。
              </p>
            </div>
          </div>
        )}

        {viewMode === "pipeline" ? (
          <PipelineView />
        ) : (
          <>
            {pendingGroups.length > 0 && (
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning-600" />
                  进行中（按事件聚合）
                </h3>
                {pendingGroups.map((group, gIdx) => {
                  const isExpanded = expandedEvent === group.eventId;
                  const pendingList = group.materials.filter((m) => m.status === "pending");
                  const submittedList = group.materials.filter((m) => m.status === "submitted");
                  const approvedList = group.materials.filter((m) => m.status === "approved");
                  const groupOverdueCount = pendingList.filter((m) => isMaterialOverdue(m)).length;

                  return (
                    <div
                      key={group.eventId}
                      className="card-base overflow-hidden animate-slide-up"
                      style={{ animationDelay: `${gIdx * 80}ms` }}
                    >
                      <button
                        onClick={() =>
                          setExpandedEvent(isExpanded ? null : group.eventId)
                        }
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              groupOverdueCount > 0
                                ? "bg-red-100"
                                : group.pendingCount > 0
                                ? "bg-warning-100"
                                : "bg-blue-100"
                            }`}
                          >
                            <FileX
                              className={`w-5 h-5 ${
                                groupOverdueCount > 0
                                  ? "text-red-600"
                                  : group.pendingCount > 0
                                  ? "text-warning-600"
                                  : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-base font-semibold text-slate-800 truncate">
                              {group.eventTitle}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                              {group.pendingCount > 0 && (
                                <span className="tag bg-warning-50 text-warning-700 border-warning-200">
                                  待提交 {group.pendingCount}
                                </span>
                              )}
                              {group.submittedCount > 0 && (
                                <span className="tag bg-blue-50 text-blue-700 border-blue-200">
                                  待审核 {group.submittedCount}
                                </span>
                              )}
                              {group.approvedCount > 0 && (
                                <span className="tag bg-success-50 text-success-700 border-success-200">
                                  已完成 {group.approvedCount}
                                </span>
                              )}
                              {groupOverdueCount > 0 && (
                                <span className="tag bg-red-100 text-red-700 border-red-200">
                                  超期 {groupOverdueCount}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/${group.eventId}`);
                            }}
                            className="text-xs text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors"
                          >
                            查看事件
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                          {pendingList.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-warning-700 mb-2 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                待提交（{pendingList.length}项）
                              </p>
                              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-600">材料类型</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-600">责任部门</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-600">截止时间</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-600">状态</th>
                                      <th className="text-right px-5 py-2.5 text-xs font-bold text-slate-600">操作</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pendingList.map((mat, idx) => renderMaterialRow(mat, idx))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {submittedList.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5">
                                <Send className="w-3.5 h-3.5" />
                                待审核（{submittedList.length}项）
                              </p>
                              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-600">材料类型</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-600">责任部门</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-600">截止时间</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-600">状态</th>
                                      <th className="text-right px-5 py-2.5 text-xs font-bold text-slate-600">操作</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {submittedList.map((mat, idx) => renderMaterialRow(mat, idx))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {approvedList.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-success-700 mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                已完成（{approvedList.length}项）
                              </p>
                              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white opacity-75">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500">材料类型</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500">责任部门</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500">截止时间</th>
                                      <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500">状态</th>
                                      <th className="text-right px-5 py-2.5 text-xs font-bold text-slate-500">操作</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {approvedList.map((mat, idx) => renderMaterialRow(mat, idx))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {completedGroups.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-600" />
                    已完成归档（{completedGroups.length} 个事件 / {completedMats.length} 项材料）
                  </h3>
                </div>
                <div className="space-y-2">
                  {completedGroups.map((group, gIdx) => (
                    <div
                      key={group.eventId}
                      className="card-base overflow-hidden animate-slide-up opacity-85"
                      style={{ animationDelay: `${gIdx * 40}ms` }}
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-success-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {group.eventTitle}
                            </p>
                            <p className="text-xs text-slate-500">
                              {group.approvedCount} 项材料已全部审核完成
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/events/${group.eventId}`)}
                          className="text-xs text-slate-500 hover:text-primary-600 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          查看详情
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingGroups.length === 0 && completedGroups.length === 0 && (
              <div className="card-base p-16 text-center">
                <CheckCircle2 className="w-16 h-16 text-success-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">材料已全部补齐</h3>
                <p className="text-slate-500">
                  暂无待补材料，所有事件的材料都已收集完毕
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
