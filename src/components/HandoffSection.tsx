import { useMemo, useState } from "react";
import {
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  Plus,
  User,
  Clock,
  Moon,
  Sun,
  ArrowRightLeft,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import { HANDOFF_SECTION_LABELS, type HandoffSection as HandoffSectionType } from "@/types";
import { getCurrentShift, getPreviousShift } from "@/utils/shift";

interface HandoffSectionProps {
  eventId: string;
}

const sectionConfig: Record<
  HandoffSectionType,
  {
    icon: typeof AlertTriangle;
    gradient: string;
    soft: string;
    border: string;
    text: string;
    iconBg: string;
    placeholder: string;
  }
> = {
  unverified: {
    icon: AlertTriangle,
    gradient: "from-yellow-500 to-yellow-600",
    soft: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    iconBg: "bg-yellow-100",
    placeholder: "请输入尚未核实的信息、网友传闻等...",
  },
  to_contact: {
    icon: PhoneCall,
    gradient: "from-blue-500 to-blue-600",
    soft: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    iconBg: "bg-blue-100",
    placeholder: "请输入需联系的部门、联系人、电话等...",
  },
  confidential: {
    icon: ShieldAlert,
    gradient: "from-slate-600 to-slate-700",
    soft: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-700",
    iconBg: "bg-slate-200",
    placeholder: "请输入内部掌握、不宜对外公开的敏感信息...",
  },
};

const sectionOrder: HandoffSectionType[] = ["unverified", "to_contact", "confidential"];

export default function HandoffSection({ eventId }: HandoffSectionProps) {
  const allNotes = useEventStore((s) => s.handoffNotes);
  const addHandoffNote = useEventStore((s) => s.addHandoffNote);

  const currentShift = useMemo(() => getCurrentShift(), []);
  const prevShift = useMemo(() => getPreviousShift(), []);

  const notes = useMemo(
    () =>
      allNotes
        .filter((h) => h.eventId === eventId)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [allNotes, eventId]
  );

  const [draftBySection, setDraftBySection] = useState<Record<HandoffSectionType, string>>({
    unverified: "",
    to_contact: "",
    confidential: "",
  });
  const [currentAuthor] = useState("王主任");

  const handleSubmit = (section: HandoffSectionType) => {
    const content = draftBySection[section].trim();
    if (!content) return;
    addHandoffNote(eventId, section, content, currentAuthor);
    setDraftBySection((prev) => ({ ...prev, [section]: "" }));
  };

  const getSectionNotes = (section: HandoffSectionType) =>
    notes.filter((n) => n.section === section);

  const currentShiftCount = notes.filter((n) => n.shiftId === currentShift.id).length;
  const prevShiftCount = notes.filter((n) => n.shiftId === prevShift.id).length;
  const olderCount = notes.filter(
    (n) => n.shiftId !== currentShift.id && n.shiftId !== prevShift.id
  ).length;

  const ShiftBadge = ({
    shiftId,
    shiftLabel,
  }: {
    shiftId: string;
    shiftLabel: string;
  }) => {
    if (shiftId === currentShift.id) {
      return (
        <span className="tag gap-1 bg-primary-100 text-primary-700 border border-primary-200">
          <Sun className="w-3 h-3" />
          当前班次
        </span>
      );
    }
    if (shiftId === prevShift.id) {
      return (
        <span className="tag gap-1 bg-warning-100 text-warning-700 border border-warning-200">
          <Moon className="w-3 h-3" />
          上一班
        </span>
      );
    }
    return (
      <span className="tag bg-slate-100 text-slate-500 border border-slate-200 text-[10px]">
        {shiftLabel}
      </span>
    );
  };

  return (
    <div className="card-base p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-slate-600 rounded-full" />
            交接备注
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            结构化记录交接信息，上一班写清楚，下一班接明白
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-100">
            <Sun className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-slate-700">
              当前：<span className="font-semibold text-primary-700">{currentShift.label}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="tag bg-primary-100 text-primary-700 border border-primary-200">
              当前班 {currentShiftCount}
            </span>
            <span className="tag bg-warning-100 text-warning-700 border border-warning-200">
              上一班 {prevShiftCount}
            </span>
            {olderCount > 0 && (
              <span className="tag bg-slate-100 text-slate-500 border border-slate-200">
                历史 {olderCount}
              </span>
            )}
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4" />
            <span className="font-semibold text-slate-700">{currentAuthor}</span>
          </div>
        </div>
      </div>

      {notes.some((n) => n.shiftId === prevShift.id) && (
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-warning-50 via-warning-50/70 to-amber-50 border border-warning-200 animate-slide-up">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-warning-600" />
            </div>
            <div>
              <p className="font-bold text-warning-800 text-base">
                上一班交接提醒 · {prevShift.label}
              </p>
              <p className="text-xs text-warning-600">
                以下为上一班次留下的交接信息，请重点关注
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sectionOrder.map((section) => {
              const prevNotes = notes.filter(
                (n) => n.section === section && n.shiftId === prevShift.id
              );
              if (prevNotes.length === 0) return null;
              const cfg = sectionConfig[section];
              const Icon = cfg.icon;
              return (
                <div
                  key={section}
                  className={`p-3 rounded-xl bg-white/70 border ${cfg.border}`}
                >
                  <p className={`text-xs font-semibold ${cfg.text} flex items-center gap-1.5 mb-2`}>
                    <Icon className="w-3.5 h-3.5" />
                    {HANDOFF_SECTION_LABELS[section]} · {prevNotes.length}条
                  </p>
                  <div className="space-y-1.5">
                    {prevNotes.map((n) => (
                      <p
                        key={n.id}
                        className="text-xs text-slate-700 leading-relaxed whitespace-pre-line line-clamp-3"
                      >
                        {n.content}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {sectionOrder.map((section, sIdx) => {
          const cfg = sectionConfig[section];
          const Icon = cfg.icon;
          const sectionNotes = getSectionNotes(section);

          return (
            <div
              key={section}
              className={`${cfg.soft} rounded-2xl border ${cfg.border} p-5 flex flex-col animate-slide-up`}
              style={{ animationDelay: `${sIdx * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${cfg.text}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${cfg.text}`}>
                    {HANDOFF_SECTION_LABELS[section]}
                  </h4>
                  <p className="text-xs text-slate-500">{sectionNotes.length} 条记录</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
                {sectionNotes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-3">
                      <Icon className={`w-6 h-6 ${cfg.text} opacity-40`} />
                    </div>
                    <p className="text-sm text-slate-400">暂无记录</p>
                    <p className="text-xs text-slate-400 mt-1">
                      请在下方输入并添加备注
                    </p>
                  </div>
                ) : (
                  sectionNotes.map((note, idx) => (
                    <div
                      key={note.id}
                      className={`rounded-xl p-4 shadow-sm border transition-all animate-slide-up ${
                        note.shiftId === currentShift.id
                          ? "bg-white border-white/80"
                          : note.shiftId === prevShift.id
                          ? "bg-warning-50/50 border-warning-200"
                          : "bg-white/60 border-white/60"
                      }`}
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                        <ShiftBadge shiftId={note.shiftId} shiftLabel={note.shiftLabel} />
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/60">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {note.author}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {note.createdAt}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <textarea
                  value={draftBySection[section]}
                  onChange={(e) =>
                    setDraftBySection((prev) => ({
                      ...prev,
                      [section]: e.target.value,
                    }))
                  }
                  placeholder={cfg.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                />
                <button
                  onClick={() => handleSubmit(section)}
                  disabled={!draftBySection[section].trim()}
                  className={`w-full py-2.5 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r ${cfg.gradient} hover:brightness-105 active:scale-[0.98] shadow-md`}
                >
                  <Plus className="w-4 h-4" />
                  添加到当前班次
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
