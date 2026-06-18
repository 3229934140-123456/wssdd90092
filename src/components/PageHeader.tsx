import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpenCheck } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
}

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  backPath = "/",
}: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 sticky top-0 z-10">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => navigate(backPath)}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shadow-primary-200">
              <BookOpenCheck className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-slate-800">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </button>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600">
            {location.pathname === "/"
              ? "首页看板"
              : location.pathname.startsWith("/events")
              ? "本周事件"
              : location.pathname === "/reviews"
              ? "重点复盘"
              : location.pathname === "/materials"
              ? "待补材料"
              : ""}
          </p>
        </div>
      </div>
    </header>
  );
}
