import { useMemo, useState } from "react";
import {
  FileX,
  Clock,
  CheckCircle2,
  Send,
  AlertTriangle,
  FileCheck,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BellRing,
  MessageSquare,
  FileText,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import { useNavigate } from "react-router-dom";
import type { MaterialItem, UrgeMessage } from "@/types";

interface EventMaterialsSectionProps {
  eventId: string;
  eventTitle: string;
}

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

export default function EventMaterialsSection({
  eventId,
  eventTitle,
}: EventMaterialsSectionProps) {
  const navigate = useNavigate();
  const getMaterialsByEventId = useEventStore((s) => s.getMaterialsByEventId);
  const setMaterialStatus = useEventStore((s) => s.setMaterialStatus);
  const isMaterialOverdue = useEventStore((s) => s.isMaterialOverdue);
  const generateUrgeMessage = useEventStore((s) => s.generateUrgeMessage);
  const allMaterials = useEventStore((s) => s.materials);

  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [copiedUrge, setCopiedUrge] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const materials = useMemo(
    () => getMaterialsByEventId(eventId),
    [getMaterialsByEventId, eventId, allMaterials]
  );

  const pendingMaterials = useMemo(
    () => materials.filter((m) => m.status === "pending"),
    [materials]
  );
  const completedMaterials = useMemo(
    () => materials.filter((m) => m.status !== "pending"),
    [materials]
  );

  const pendingCount = pendingMaterials.length;
  const submittedCount = materials.filter((m) => m.status === "submitted").length;
  const overdueCount = pendingMaterials.filter((m) => isMaterialOverdue(m)).length;

  if (materials.length === 0) {
    return null;
  }

  const handleStatusChange = (
    id: string,
    status: "pending" | "submitted" | "approved"
  ) => {
    setMaterialStatus(id, status);
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

  const renderMaterialRow = (mat: MaterialItem, idx: number) => {
    const cfg = statusConfig[mat.status];
    const Icon = cfg.icon;
    const overdue = mat.status === "pending" && isMaterialOverdue(mat);
    const urgeMsg = mat.status === "pending" ? generateUrgeMessage(mat) : null;
    const isExpanded = expandedMaterial === mat.id;

    return (
      <>
        <tr
          key={mat.id}
          className={`border-b border-slate-100 last:border-b-0 transition-colors animate-slide-up ${
            overdue ? "bg-red-50/70 hover:bg-red-50" : "hover:bg-slate-50/50"
          }`}
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <td className="px-5 py-4">
            <div className="flex items-center gap-2.5">
              {overdue ? (
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
              ) : (
                <FileX className="w-4 h-4 text-slate-400" />
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
          <td className="px-5 py-4 text-sm text-slate-700">{mat.department}</td>
          <td className="px-5 py-4">
            <span
              className={`text-sm ${
                overdue ? "text-red-600 font-semibold" : "text-slate-600"
              }`}
            >
              {mat.deadline}
            </span>
          </td>
          <td className="px-5 py-4">
            <span
              className={`tag gap-1 ${cfg.bg} ${cfg.color} border ${cfg.border}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
          </td>
          <td className="px-5 py-4 text-right">
            <div className="flex items-center justify-end gap-2">
              {mat.status === "pending" && urgeMsg && (
                <button
                  onClick={() =>
                    setExpandedMaterial(isExpanded ? null : mat.id)
                  }
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                    isExpanded
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                  }`}
                >
                  <BellRing className="w-3 h-3" />
                  催办
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              )}
              {mat.status === "pending" && (
                <button
                  onClick={() => handleStatusChange(mat.id, "submitted")}
                  className="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  标记已提交
                </button>
              )}
              {mat.status === "submitted" && (
                <button
                  onClick={() => handleStatusChange(mat.id, "approved")}
                  className="px-3 py-1.5 text-xs rounded-lg bg-success-50 text-success-700 border border-success-200 hover:bg-success-100 transition-colors"
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
        {isExpanded && urgeMsg && (
          <tr className="bg-orange-50/50 border-b border-orange-100">
            <td colSpan={5} className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-4 border border-orange-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-orange-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      微信版话术
                    </p>
                    <button
                      onClick={() => handleCopyUrge(urgeMsg, "wechat")}
                      className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
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
                  <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-orange-50/50 rounded-lg p-3">
                    {urgeMsg.wechatVersion}
                  </pre>
                </div>
                <div className="rounded-xl bg-white p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      正式版话术
                    </p>
                    <button
                      onClick={() => handleCopyUrge(urgeMsg, "formal")}
                      className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
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
                  <pre className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 rounded-lg p-3">
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
    <div className="card-base p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-purple-600 rounded-full" />
            待补材料
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            本事件还需补充的材料及进度跟踪，缺材料可一键生成催办话术
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {overdueCount > 0 && (
            <span className="tag bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle className="w-3 h-3 mr-1" />
              超期 {overdueCount} 项
            </span>
          )}
          {pendingCount > 0 && (
            <span className="tag bg-warning-50 text-warning-700 border border-warning-200">
              待提交 {pendingCount}
            </span>
          )}
          {submittedCount > 0 && (
            <span className="tag bg-blue-50 text-blue-700 border border-blue-200">
              待审核 {submittedCount}
            </span>
          )}
          {completedMaterials.length > 0 && (
            <span className="tag bg-success-50 text-success-700 border border-success-200">
              已完成 {completedMaterials.length}
            </span>
          )}
          <button
            onClick={() => navigate("/materials")}
            className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
          >
            <FileCheck className="w-4 h-4" />
            查看全部
          </button>
        </div>
      </div>

      {pendingMaterials.length > 0 && (
        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-sm font-bold text-slate-700">
                  材料类型
                </th>
                <th className="text-left px-5 py-3 text-sm font-bold text-slate-700">
                  责任部门
                </th>
                <th className="text-left px-5 py-3 text-sm font-bold text-slate-700">
                  截止时间
                </th>
                <th className="text-left px-5 py-3 text-sm font-bold text-slate-700">
                  状态
                </th>
                <th className="text-right px-5 py-3 text-sm font-bold text-slate-700">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingMaterials.map((mat, idx) => renderMaterialRow(mat, idx))}
            </tbody>
          </table>
        </div>
      )}

      {completedMaterials.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success-600" />
              已完成材料（{completedMaterials.length} 项）
            </span>
            {showCompleted ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
          {showCompleted && (
            <div className="overflow-x-auto mt-2 rounded-xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-sm font-bold text-slate-600">
                      材料类型
                    </th>
                    <th className="text-left px-5 py-3 text-sm font-bold text-slate-600">
                      责任部门
                    </th>
                    <th className="text-left px-5 py-3 text-sm font-bold text-slate-600">
                      截止时间
                    </th>
                    <th className="text-left px-5 py-3 text-sm font-bold text-slate-600">
                      状态
                    </th>
                    <th className="text-right px-5 py-3 text-sm font-bold text-slate-600">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="opacity-70">
                  {completedMaterials.map((mat, idx) => renderMaterialRow(mat, idx))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {overdueCount > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-slide-in-right">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 mb-1">
              有 {overdueCount} 项材料已超期！
            </p>
            <p className="text-xs text-red-700/80">
              请立即点击「催办」按钮生成话术，联系责任部门尽快提交。交接时请将超期材料作为重点事项转交下一班。
            </p>
          </div>
        </div>
      )}

      {pendingCount > 0 && overdueCount === 0 && (
        <div className="mt-5 p-4 rounded-xl bg-warning-50 border border-warning-100 flex items-start gap-3 animate-slide-in-right">
          <Clock className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning-800 mb-1">
              还有 {pendingCount} 项材料等待部门提交
            </p>
            <p className="text-xs text-warning-700/80">
              点击「催办」可一键生成催办话术，复制后直接发送给责任部门。材料补齐后，首页和事件列表的待补材料数量将自动更新。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
