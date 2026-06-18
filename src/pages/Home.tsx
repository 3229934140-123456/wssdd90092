import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  BookOpenCheck,
  FileX,
  Clock,
} from "lucide-react";
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
  const timeStr = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const highRiskCount = events.filter(
    (e) => e.level === "high" || e.level === "critical"
  ).length;
  const activeCount = events.filter(
    (e) => e.status === "monitoring" || e.status === "responding"
  ).length;

  const entryCards = [
    {
      key: "events",
      title: "本周事件",
      subtitle: "快速掌握本周舆情动态，3分钟讲清每件事",
      count: weeklyEvents.length,
      highlight: `其中 ${activeCount} 件处置中${
        highRiskCount > 0 ? `，${highRiskCount} 件高风险` : ""
      }`,
      icon: CalendarDays,
      gradient: "from-primary-500 via-primary-600 to-primary-800",
      path: "/events",
      delay: "0ms",
    },
    {
      key: "reviews",
      title: "重点复盘",
      subtitle: "沉淀典型事件处置经验，供例会学习参考",
      count: reviewEvents.length,
      highlight: reviewEvents.length > 0 ? "已沉淀处置经验" : "暂无复盘案例",
      icon: BookOpenCheck,
      gradient: "from-warning-400 via-warning-500 to-warning-700",
      path: "/reviews",
      delay: "100ms",
    },
    {
      key: "materials",
      title: "待补材料",
      subtitle: "跟踪各部门需补充的证据、报告、审批件",
      count: pendingMaterials.length,
      highlight:
        pendingMaterials.length > 0
          ? `${pendingMaterials.length} 项等待部门提交`
          : "材料已齐备",
      icon: FileX,
      gradient: "from-slate-500 via-slate-600 to-slate-800",
      path: "/materials",
      delay: "200ms",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-100 flex flex-col">
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/60 px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-xl shadow-primary-300/30">
            <BookOpenCheck className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              舆情复盘看板
            </h1>
            <p className="text-sm text-slate-500">县区融媒体中心 · 主任工作台</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-sm text-slate-500">{dateStr}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-primary-600" />
              <p className="text-sm font-semibold text-slate-700">{timeStr}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-sm font-bold text-primary-700">王</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{currentDuty}</p>
              <p className="text-xs text-success-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-soft" />
                值班中
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-10 py-16 max-w-[1400px] mx-auto w-full">
        <div className="mb-14 animate-fade-in text-center">
          <h2 className="text-4xl font-bold text-slate-800 tracking-tight mb-3">
            早上好，王主任
          </h2>
          <p className="text-slate-500 text-xl">
            今天共有
            <span className="font-bold text-primary-700 mx-1.5">{weeklyEvents.length}</span>
            件舆情事件，
            <span className="font-bold text-warning-600 mx-1.5">{pendingMaterials.length}</span>
            项材料待补充
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {entryCards.map((card) => (
            <button
              key={card.key}
              onClick={() => navigate(card.path)}
              className="group text-left bg-white rounded-3xl shadow-card overflow-hidden animate-slide-up transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1.5"
              style={{ animationDelay: card.delay }}
            >
              <div className={`h-3 bg-gradient-to-r ${card.gradient}`} />
              <div className="p-10">
                <div className="flex items-start justify-between mb-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-xl shadow-primary-200/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                  >
                    <card.icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                  <div
                    className={`min-w-[3.5rem] h-14 px-4 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl bg-gradient-to-br ${card.gradient}`}
                  >
                    {card.count}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-2 group-hover:text-primary-700 transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-500 text-base mb-4">{card.subtitle}</p>
                <p className="text-sm font-medium text-primary-600 mb-8">
                  {card.highlight}
                </p>
                <div className="flex items-center gap-2 text-slate-400 font-medium group-hover:text-primary-600 group-hover:gap-4 transition-all duration-300 pt-5 border-t border-slate-100">
                  <span>进入查看详情</span>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="px-10 py-5 text-center">
        <p className="text-xs text-slate-400">
          舆情复盘看板 · 县区融媒体中心内部使用
        </p>
      </footer>
    </div>
  );
}
