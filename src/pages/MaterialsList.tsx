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
} from "lucide-react";
import type { MaterialItem, UrgeMessage } from "@/types";

export default function MaterialsList() {
  const navigate = useNavigate();
  const getMaterialsGroupedByEvent = useEventStore((s) => s.getMaterialsGroupedByEvent);
  const getPendingMaterials = useEventStore((s) => s.getPendingMaterials);
  const getCompletedMaterials = useEventStore((s) => s.getCompletedMaterials);
  const getOverdueMaterials = useEventStore((s) => s.getOverdueMaterials);
  const setMaterialStatus = useEventStore((s) => s.setMaterialStatus);
  const isMaterialOverdue = useEventStore((s) => s.isMaterialOverdue);
  const generateUrgeMessage = useEventStore((s) => s.generateUrgeMessage);
  const allMaterials = useEventStore((s) => s.materials);

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedUrge, setExpandedUrge] = useState<string | null>(null);
  const [copiedUrge, setCopiedUrge] = useState<string | null>(null);

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
    () => groupedMaterials.filter((g) => g.pendingCount > 0),
    [groupedMaterials]
  );
  const completedGroups = useMemo(
    () => groupedMaterials.filter((g) => g.pendingCount === 0),
    [groupedMaterials]
  );

  const stats = useMemo(
    () => ({
      total: allMaterials.length,
      pending: pendingMats.filter((m) => m.status === "pending").length,
      submitted: pendingMats.filter((m) => m.status === "submitted").length,
      overdue: overdueMats.length,
    }),
    [allMaterials.length, pendingMats, overdueMats.length]
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

  const handleCopyUrge = async (msg: UrgeMessage, type: "wechat" | "formal") => {
    try {
      const text = type === "wechat" ? msg.wechatVersion : msg.formalVersion;
      await navigator.clipboard.writeText(text);
      setCopiedUrge(`${msg.materialId}-${type}`);
      setTimeout(() => setCopiedUrge(null), 2000);
    } catch {
      // ignore
    }
  };

  const renderMaterialRow = (mat: MaterialItem, idx: number, isPending: boolean) => {
    const cfg = statusConfig[mat.status];
    const Icon = cfg.icon;
    const overdue = mat.status === "pending" && isMaterialOverdue(mat);
    const urgeMsg = mat.status === "pending" ? generateUrgeMessage(mat) : null;
    const isUrgeExpanded = expandedUrge === mat.id;

    return (
      <>
        <tr
          key={mat.id}
          className={`border-b border-slate-100 last:border-b-0 transition-colors animate-slide-up ${
            overdue ? "bg-red-50/70 hover:bg-red-50" : "hover:bg-slate-50/50"
          }`}
          style={{ animationDelay: `${idx * 40}ms` }}
        >
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              {overdue ? (
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" />
              ) : (
                <FileX className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span
                className={`text-sm font-medium ${
                  overdue ? "text-red-700" : "text-slate-800"
                }`}
              >
                {mat.type}
              </span>
              {overdue && (
                <span className="tag bg-red-100 text-red-700 border border-red-200 text-[10px]">
                  已超期
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
              {isPending && mat.status === "pending" && urgeMsg && (
                <button
                  onClick={() =>
                    setExpandedUrge(isUrgeExpanded ? null : mat.id)
                  }
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                    isUrgeExpanded
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
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
              {isPending && mat.status === "pending" && (
                <button
                  onClick={() => setMaterialStatus(mat.id, "submitted")}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  标记已提交
                </button>
              )}
              {isPending && mat.status === "submitted" && (
                <button
                  onClick={() => setMaterialStatus(mat.id, "approved")}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-success-50 text-success-700 border border-success-200 hover:bg-success-100 transition-colors"
                >
                  审核通过
                </button>
              )}
              {!isPending && (
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
                      onClick={() => handleCopyUrge(urgeMsg, "wechat")}
                      className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                        copiedUrge === `${urgeMsg.materialId}-wechat`
                          ? "bg-success-100 text-success-700"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                      }`}
                    >
                      {copiedUrge === `${urgeMsg.materialId}-wechat` ? (
                        <>
                          <Check className="w-3 h-3" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          复制
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
                      onClick={() => handleCopyUrge(urgeMsg, "formal")}
                      className={`text-xs px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                        copiedUrge === `${urgeMsg.materialId}-formal`
                          ? "bg-success-100 text-success-700"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {copiedUrge === `${urgeMsg.materialId}-formal` ? (
                        <>
                          <Check className="w-3 h-3" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          复制
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 rounded-lg p-2.5">
                    {urgeMsg.formalVersion}
                  </pre>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <PageHeader title="待补材料" subtitle="需补充材料清单" showBack />

      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-base p-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">材料总数</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="card-base p-6 animate-slide-up" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">待提交</p>
                <p className="text-3xl font-bold text-warning-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="card-base p-6 animate-slide-up" style={{ animationDelay: "160ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">待审核</p>
                <p className="text-3xl font-bold text-blue-600">{stats.submitted}</p>
              </div>
            </div>
          </div>
          <div className="card-base p-6 animate-slide-up" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">已超期</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
              </div>
            </div>
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
                请立即点击「催办」按钮生成话术，联系责任部门尽快提交。交接时请将超期材料作为重点事项转交下一班。
              </p>
            </div>
          </div>
        )}

        {pendingGroups.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning-600" />
              待补材料（按事件聚合）
            </h3>
            {pendingGroups.map((group, gIdx) => {
              const isExpanded = expandedEvent === group.eventId;
              const groupPendingMats = group.materials.filter(
                (m) => m.status === "pending"
              );
              const groupOverdueCount = groupPendingMats.filter((m) =>
                isMaterialOverdue(m)
              ).length;

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
                            : "bg-success-100"
                        }`}
                      >
                        <FileX
                          className={`w-5 h-5 ${
                            groupOverdueCount > 0
                              ? "text-red-600"
                              : group.pendingCount > 0
                              ? "text-warning-600"
                              : "text-success-600"
                          }`}
                        />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-base font-semibold text-slate-800 truncate">
                          {group.eventTitle}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span
                            className={`tag ${
                              groupOverdueCount > 0
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-warning-50 text-warning-700 border-warning-200"
                            }`}
                          >
                            {group.pendingCount} 项待补
                          </span>
                          {groupOverdueCount > 0 && (
                            <span className="tag bg-red-100 text-red-700 border-red-200">
                              {groupOverdueCount} 项超期
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
                    <div className="border-t border-slate-100 overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-600">
                              材料类型
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-600">
                              责任部门
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-600">
                              截止时间
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-600">
                              状态
                            </th>
                            <th className="text-right px-5 py-3 text-xs font-bold text-slate-600">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupPendingMats.map((mat, idx) =>
                            renderMaterialRow(mat, idx, true)
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {completedGroups.length > 0 && (
          <div>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full card-base p-5 flex items-center justify-between hover:bg-slate-50 transition-colors animate-slide-up"
            >
              <span className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-600" />
                已完成材料（{completedMats.length} 项 / {completedGroups.length} 个事件）
              </span>
              {showCompleted ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {showCompleted && (
              <div className="mt-4 space-y-4">
                {completedGroups.map((group, gIdx) => {
                  const isExpanded = expandedEvent === `completed-${group.eventId}`;
                  const groupCompletedMats = group.materials.filter(
                    (m) => m.status === "approved"
                  );

                  return (
                    <div
                      key={`completed-${group.eventId}`}
                      className="card-base overflow-hidden animate-slide-up opacity-80"
                      style={{ animationDelay: `${gIdx * 60}ms` }}
                    >
                      <button
                        onClick={() =>
                          setExpandedEvent(
                            isExpanded ? null : `completed-${group.eventId}`
                          )
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-success-600" />
                          </div>
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {group.eventTitle}
                          </p>
                          <span className="tag bg-success-50 text-success-700 border-success-200 text-[10px]">
                            {groupCompletedMats.length} 项已完成
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/events/${group.eventId}`);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-700"
                          >
                            查看
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500">
                                  材料类型
                                </th>
                                <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500">
                                  责任部门
                                </th>
                                <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500">
                                  截止时间
                                </th>
                                <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-500">
                                  状态
                                </th>
                                <th className="text-right px-5 py-2.5 text-xs font-bold text-slate-500">
                                  操作
                                </th>
                              </tr>
                            </thead>
                            <tbody className="opacity-60">
                              {groupCompletedMats.map((mat, idx) =>
                                renderMaterialRow(mat, idx, false)
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
      </main>
    </div>
  );
}
