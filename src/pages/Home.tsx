import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, BookOpenCheck, FileX } from "lucide-react";
import { useEventStore } from "@/store/eventStore";

export default function Home() {
  const navigate = useNavigate();
  const events = useEventStore((s) => s.events);
  const materials = useEventStore((s) => s.materials);

  const weeklyEvents = events;
  const reviewEvents = useMemo(
    () => events.filter((e) => e.isReview || e.status === "reviewed"),
    [events]
  );
  const pendingMaterials = useMemo(
    () => materials.filter((m) => m.status !== "approved"),
    [materials]
  );

  const currentDuty = "王主任";
  const now = new Date();
  const dateStr = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const entryCards = [
    {
      key: "events",
      title: "本周事件",
      subtitle: "本周舆情动态总览",
      count: weeklyEvents.length,
      icon: CalendarDays,
      gradient: "from-primary-600 to-primary-800",
      bgPattern: "bg-primary-50",
      path: "/events",
      delay: "0ms",
    },
    {
      key: "reviews",
      title: "重点复盘",
      subtitle: "典型事件深度复盘",
      count: reviewEvents.length,
      icon: BookOpenCheck,
      gradient: "from-warning-500 to-warning-700",
      bgPattern: "bg-warning-50",
      path: "/reviews",
      delay: "80ms",
    },
    {
      key: "materials",
      title: "待补材料",
      subtitle: "需补充材料清单",
      count: pendingMaterials.length,
      icon: FileX,
      gradient: "from-slate-500 to-slate-700",
      bgPattern: "bg-slate-50",
      path: "/materials",
      delay: "160ms",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-slate-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shadow-primary-200">
            <BookOpenCheck className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              舆情复盘看板
            </h1>
            <p className="text-sm text-slate-500">县区融媒体中心 · 主任工作台</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">{dateStr}</p>
            <p className="text-xs text-slate-500">
              当前值班：<span className="font-medium text-primary-700">{currentDuty}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="px-8 py-10 max-w-[1400px] mx-auto">
        <div className="mb-10 animate-fade-in">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
            早上好，王主任
          </h2>
          <p className="text-slate-500 text-lg">
            今天共有 <span className="font-semibold text-primary-700">{weeklyEvents.length}</span> 件舆情事件需要关注，
            <span className="font-semibold text-warning-600"> {pendingMaterials.length}</span> 项材料待补充。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {entryCards.map((card) => (
            <button
              key={card.key}
              onClick={() => navigate(card.path)}
              className="group text-left card-base overflow-hidden animate-slide-up"
              style={{ animationDelay: card.delay }}
            >
              <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />
              <div className={`p-8 ${card.bgPattern} bg-opacity-30`}>
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-primary-200/50 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  {card.count > 0 && (
                    <span
                      className={`min-w-[2.5rem] h-10 px-3 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md bg-gradient-to-br ${card.gradient} animate-pulse-soft`}
                    >
                      {card.count}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-primary-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-500">{card.subtitle}</p>
                <div className="mt-6 flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all duration-300">
                  <span>进入查看</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-base p-6 animate-slide-up" style={{ animationDelay: "240ms" }}>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-600 rounded-full" />
              最新舆情速览
            </h3>
            <div className="space-y-3">
              {weeklyEvents.slice(0, 3).map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => navigate(`/events/${evt.id}`)}
                  className="w-full text-left p-4 rounded-xl bg-slate-50 hover:bg-primary-50 transition-colors flex items-start gap-3 group"
                >
                  <span
                    className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      evt.level === "critical"
                        ? "bg-red-500"
                        : evt.level === "high"
                        ? "bg-warning-500"
                        : evt.level === "medium"
                        ? "bg-yellow-400"
                        : "bg-success-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 group-hover:text-primary-700 truncate">
                      {evt.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {evt.createdAt} ·{" "}
                      {evt.status === "monitoring"
                        ? "监测中"
                        : evt.status === "responding"
                        ? "处置中"
                        : evt.status === "resolved"
                        ? "已处置"
                        : "已复盘"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card-base p-6 animate-slide-up" style={{ animationDelay: "320ms" }}>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-warning-500 rounded-full" />
              待办提醒
            </h3>
            <div className="space-y-3">
              {pendingMaterials.slice(0, 3).map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-xl bg-warning-50 border border-warning-100 flex items-start gap-3"
                >
                  <FileX className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 text-sm">
                      【{mat.type}】{mat.eventTitle}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {mat.department} · 截止 {mat.deadline}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
