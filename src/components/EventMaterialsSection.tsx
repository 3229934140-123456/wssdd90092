import { useMemo } from "react";
import {
  FileX,
  Clock,
  CheckCircle2,
  Send,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import { useNavigate } from "react-router-dom";

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
  const allMaterials = useEventStore((s) => s.materials);

  const materials = useMemo(
    () => getMaterialsByEventId(eventId),
    [getMaterialsByEventId, eventId, allMaterials]
  );

  const pendingCount = materials.filter((m) => m.status === "pending").length;
  const submittedCount = materials.filter((m) => m.status === "submitted").length;

  if (materials.length === 0) {
    return null;
  }

  const handleStatusChange = (
    id: string,
    status: "pending" | "submitted" | "approved"
  ) => {
    setMaterialStatus(id, status);
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
            本事件还需补充的材料及进度跟踪
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
          <button
            onClick={() => navigate("/materials")}
            className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
          >
            <FileCheck className="w-4 h-4" />
            查看全部
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
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
            {materials.map((mat, idx) => {
              const cfg = statusConfig[mat.status];
              const Icon = cfg.icon;
              return (
                <tr
                  key={mat.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <FileX className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-800">
                        {mat.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{mat.department}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{mat.deadline}</td>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {pendingCount > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-warning-50 border border-warning-100 flex items-start gap-3 animate-slide-in-right">
          <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning-800 mb-1">
              还有 {pendingCount} 项材料等待部门提交
            </p>
            <p className="text-xs text-warning-700/80">
              相关材料补齐后，首页和事件列表的待补材料数量将自动更新
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
