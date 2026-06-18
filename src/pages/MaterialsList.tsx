import { useEventStore } from "@/store/eventStore";
import PageHeader from "@/components/PageHeader";
import { Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";

export default function MaterialsList() {
  const materials = useEventStore((s) => s.materials);

  const statusConfig = {
    pending: {
      label: "待提交",
      icon: Clock,
      color: "bg-warning-50 text-warning-700 border-warning-200",
      iconBg: "bg-warning-100",
      iconColor: "text-warning-600",
    },
    submitted: {
      label: "待审核",
      icon: Send,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    approved: {
      label: "已审核",
      icon: CheckCircle2,
      color: "bg-success-50 text-success-700 border-success-200",
      iconBg: "bg-success-100",
      iconColor: "text-success-600",
    },
  };

  const stats = {
    total: materials.length,
    pending: materials.filter((m) => m.status === "pending").length,
    submitted: materials.filter((m) => m.status === "submitted").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <PageHeader title="待补材料" subtitle="需补充材料清单" showBack />

      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        <div className="card-base overflow-hidden animate-slide-up" style={{ animationDelay: "240ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">事件</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">材料类型</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">责任部门</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">截止时间</th>
                  <th className="text-left px-6 py-4 text-sm font-bold text-slate-700">状态</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, index) => {
                  const cfg = statusConfig[mat.status];
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={mat.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
                      style={{ animationDelay: `${(index + 3) * 50}ms` }}
                    >
                      <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                        {mat.eventTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{mat.type}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{mat.department}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{mat.deadline}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`tag border ${cfg.color} gap-1.5`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
