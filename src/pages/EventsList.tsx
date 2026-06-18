import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEventStore } from "@/store/eventStore";
import { EVENT_LEVEL_LABELS, EVENT_STATUS_LABELS } from "@/types";
import PageHeader from "@/components/PageHeader";
import { Clock, AlertTriangle, TrendingUp, ArrowRight, FileX } from "lucide-react";

export default function EventsList() {
  const navigate = useNavigate();
  const events = useEventStore((s) => s.events);
  const materials = useEventStore((s) => s.materials);
  const getMaterialsByEventId = useEventStore((s) => s.getMaterialsByEventId);
  const allMaterials = useEventStore((s) => s.materials);

  const levelColors: Record<string, string> = {
    low: "bg-success-500",
    medium: "bg-yellow-400",
    high: "bg-warning-500",
    critical: "bg-red-500",
  };

  const statusColors: Record<string, string> = {
    monitoring: "bg-blue-50 text-blue-700 border-blue-200",
    responding: "bg-warning-50 text-warning-700 border-warning-200",
    resolved: "bg-success-50 text-success-700 border-success-200",
    reviewed: "bg-slate-50 text-slate-600 border-slate-200",
  };

  const stats = useMemo(() => {
    const totalPending = materials.filter((m) => m.status === "pending").length;
    return {
      total: events.length,
      high: events.filter((e) => e.level === "high" || e.level === "critical").length,
      responding: events.filter((e) => e.status === "monitoring" || e.status === "responding").length,
      pendingMaterials: totalPending,
    };
  }, [events, materials]);

  const getEventPendingCount = useCallback(
    (eventId: string) => {
      const eventMats = getMaterialsByEventId(eventId);
      return eventMats.filter((m) => m.status === "pending").length;
    },
    [getMaterialsByEventId, allMaterials]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100">
      <PageHeader title="本周事件" subtitle="本周舆情动态总览" showBack />

      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-base p-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <p className="text-sm text-slate-500">本周事件总数</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="card-base p-6 animate-slide-up" style={{ animationDelay: "80ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">高风险事件</p>
                <p className="text-3xl font-bold text-warning-600">{stats.high}</p>
              </div>
            </div>
          </div>
          <div className="card-base p-6 animate-slide-up" style={{ animationDelay: "160ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">处置中/监测中</p>
                <p className="text-3xl font-bold text-blue-600">{stats.responding}</p>
              </div>
            </div>
          </div>
          <div className="card-base p-6 animate-slide-up" style={{ animationDelay: "240ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <FileX className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">待补材料</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingMaterials}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {events.map((event, index) => {
            const pendingCount = getEventPendingCount(event.id);
            return (
              <button
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="w-full card-base p-6 text-left flex items-center gap-5 group animate-slide-up"
                style={{ animationDelay: `${(index + 2) * 60}ms` }}
              >
                <div className={`w-1.5 h-20 rounded-full ${levelColors[event.level]} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                      {event.title}
                    </h3>
                    <span
                      className={`tag border ${levelColors[event.level]} text-white`}
                    >
                      {EVENT_LEVEL_LABELS[event.level]}
                    </span>
                    <span className={`tag border ${statusColors[event.status]}`}>
                      {EVENT_STATUS_LABELS[event.status]}
                    </span>
                    {pendingCount > 0 && (
                      <span className="tag border bg-orange-50 text-orange-700 border-orange-200">
                        <FileX className="w-3 h-3 mr-1" />
                        缺 {pendingCount} 项材料
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>创建：{event.createdAt}</span>
                    <span>更新：{event.updatedAt}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-all">
                  <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
