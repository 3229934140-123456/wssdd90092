import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEventStore } from "@/store/eventStore";
import { EVENT_LEVEL_LABELS, EVENT_STATUS_LABELS } from "@/types";
import PageHeader from "@/components/PageHeader";
import TimelineSection from "@/components/TimelineSection";
import ConcernsSection from "@/components/ConcernsSection";
import HandoffSection from "@/components/HandoffSection";
import HandoffStatusSection from "@/components/HandoffStatusSection";
import EventMaterialsSection from "@/components/EventMaterialsSection";
import ReviewOutlineSection from "@/components/ReviewOutlineSection";
import ReviewReportSection from "@/components/ReviewReportSection";
import {
  AlertTriangle,
  Clock,
  Calendar,
  ArrowRight,
  FileText,
  BookOpenCheck,
  User,
  AlertCircle,
} from "lucide-react";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const events = useEventStore((s) => s.events);
  const allTimelineCards = useEventStore((s) => s.timelineCards);
  const getMaterialsByEventId = useEventStore((s) => s.getMaterialsByEventId);
  const isMaterialOverdue = useEventStore((s) => s.isMaterialOverdue);
  const getOverdueMaterials = useEventStore((s) => s.getOverdueMaterials);
  const allMaterials = useEventStore((s) => s.materials);

  const event = useMemo(
    () => events.find((e) => e.id === id),
    [events, id]
  );
  const timelineCards = useMemo(
    () =>
      allTimelineCards
        .filter((t) => t.eventId === id)
        .sort((a, b) => a.order - b.order),
    [allTimelineCards, id]
  );
  const materials = useMemo(
    () => getMaterialsByEventId(id || ""),
    [getMaterialsByEventId, id, allMaterials]
  );

  const pendingMats = useMemo(
    () => materials.filter((m) => m.status === "pending"),
    [materials]
  );
  const overdueCount = useMemo(
    () => pendingMats.filter((m) => isMaterialOverdue(m)).length,
    [pendingMats, isMaterialOverdue]
  );

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <PageHeader title="事件详情" showBack backPath="/events" />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-warning-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">事件不存在</h2>
            <button
              onClick={() => navigate("/events")}
              className="btn-primary inline-flex items-center gap-2"
            >
              返回事件列表
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const levelConfig: Record<string, { color: string; bg: string; border: string }> = {
    low: { color: "text-success-700", bg: "bg-success-50", border: "border-success-200" },
    medium: { color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
    high: { color: "text-warning-700", bg: "bg-warning-50", border: "border-warning-200" },
    critical: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  };

  const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
    monitoring: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    responding: { color: "text-warning-700", bg: "bg-warning-50", border: "border-warning-200" },
    resolved: { color: "text-success-700", bg: "bg-success-50", border: "border-success-200" },
    reviewed: { color: "text-slate-700", bg: "bg-slate-100", border: "border-slate-300" },
  };

  const levelCfg = levelConfig[event.level];
  const statusCfg = statusConfig[event.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-100 pb-16">
      <PageHeader
        title="事件详情"
        subtitle="舆情复盘与交接记录"
        showBack
        backPath="/events"
      />

      <main className="px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {overdueCount > 0 && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex items-start gap-4 animate-slide-in-right">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <p className="text-base font-bold text-red-800 mb-1">
                ⚠️ 本事件有 {overdueCount} 项材料已超期！
              </p>
              <p className="text-sm text-red-700/80">
                请立即前往「待补材料」板块催办责任部门尽快提交。交接时请将超期材料作为重点事项转交下一班。
              </p>
            </div>
          </div>
        )}

        <div className="card-base p-8 animate-fade-in">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span
                  className={`tag border ${levelCfg.bg} ${levelCfg.color} ${levelCfg.border} text-sm font-semibold`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {EVENT_LEVEL_LABELS[event.level]}
                </span>
                <span
                  className={`tag border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} text-sm font-semibold`}
                >
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {EVENT_STATUS_LABELS[event.status]}
                </span>
                {event.isReview && (
                  <span className="tag border bg-warning-50 text-warning-700 border-warning-200 text-sm font-semibold">
                    <BookOpenCheck className="w-3.5 h-3.5 mr-1" />
                    重点复盘
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
                {event.title}
              </h2>
              <p className="text-slate-600 leading-relaxed text-base max-w-3xl">
                {event.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5 text-primary-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500">创建时间</p>
                <p className="text-sm font-semibold text-slate-700">{event.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-success-100 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-success-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">最近更新</p>
                <p className="text-sm font-semibold text-slate-700">{event.updatedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">传播节点</p>
                <p className="text-sm font-semibold text-slate-700">{timelineCards.filter((c) => !c.placeholder).length}/4 个</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <User className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">值班跟踪</p>
                <p className="text-sm font-semibold text-slate-700">王主任</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${overdueCount > 0 ? "bg-red-100" : "bg-orange-100"}`}>
                <FileText className={`w-4.5 h-4.5 ${overdueCount > 0 ? "text-red-600" : "text-orange-600"}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500">待补材料</p>
                <p className={`text-sm font-semibold ${overdueCount > 0 ? "text-red-700" : "text-slate-700"}`}>
                  {pendingMats.length} 项
                  {overdueCount > 0 && <span className="text-xs ml-1">({overdueCount}项超期)</span>}
                </p>
              </div>
            </div>
          </div>

          {event.reviewConclusion && (
            <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-warning-50 to-warning-100/30 border border-warning-200">
              <p className="text-xs font-bold text-warning-700 mb-2 flex items-center gap-1.5">
                <BookOpenCheck className="w-4 h-4" />
                复盘结论
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{event.reviewConclusion}</p>
              {event.reviewer && (
                <p className="text-xs text-slate-500 mt-2">— {event.reviewer}</p>
              )}
            </div>
          )}
        </div>

        <TimelineSection cards={timelineCards.length > 0 ? timelineCards : []} />

        <HandoffStatusSection eventId={event.id} />

        <ConcernsSection eventId={event.id} />

        <HandoffSection eventId={event.id} />

        <EventMaterialsSection eventId={event.id} eventTitle={event.title} />

        {event.isReview && (
          <>
            <ReviewOutlineSection
              event={event}
              timelineCards={timelineCards}
              eventId={event.id}
            />
            <ReviewReportSection event={event} />
          </>
        )}
      </main>
    </div>
  );
}
