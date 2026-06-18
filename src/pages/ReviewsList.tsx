import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEventStore } from "@/store/eventStore";
import PageHeader from "@/components/PageHeader";
import { CheckCircle2, Circle, ArrowRight, User } from "lucide-react";

export default function ReviewsList() {
  const navigate = useNavigate();
  const allEvents = useEventStore((s) => s.events);
  const events = useMemo(
    () => allEvents.filter((e) => e.isReview || e.status === "reviewed"),
    [allEvents]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-warning-50/30 to-slate-100">
      <PageHeader title="重点复盘" subtitle="典型事件深度复盘" showBack />

      <main className="px-8 py-8 max-w-[1400px] mx-auto">
        <div className="mb-8 card-base p-6 animate-slide-up">
          <h3 className="text-lg font-bold text-slate-800 mb-3">复盘说明</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            重点复盘板块用于沉淀典型舆情事件的处置经验。每个已复盘事件包含完整的舆情时间线、群众关切归纳和处置经验总结，
            供例会学习和新同事培训参考。
          </p>
        </div>

        <div className="space-y-4">
          {events.map((event, index) => (
            <button
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="w-full card-base p-6 text-left group animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warning-500 to-warning-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-warning-200">
                  {event.status === "reviewed" ? (
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  ) : (
                    <Circle className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-700 transition-colors">
                      {event.title}
                    </h3>
                    <span
                      className={`tag border ${
                        event.status === "reviewed"
                          ? "bg-success-50 text-success-700 border-success-200"
                          : "bg-warning-50 text-warning-700 border-warning-200"
                      }`}
                    >
                      {event.status === "reviewed" ? "复盘完成" : "待复盘"}
                    </span>
                  </div>

                  {event.reviewConclusion && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1 font-medium">复盘结论</p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {event.reviewConclusion}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-5 text-xs text-slate-500">
                    {event.reviewer && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        复盘人：{event.reviewer}
                      </span>
                    )}
                    <span>更新：{event.updatedAt}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-warning-50 group-hover:bg-warning-100 flex items-center justify-center transition-all">
                  <ArrowRight className="w-5 h-5 text-warning-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
