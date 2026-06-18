import { useMemo, useState } from "react";
import {
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  Plus,
  Send,
  User,
  Clock,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import { HANDOFF_SECTION_LABELS, type HandoffSection as HandoffSectionType } from "@/types";

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
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <User className="w-4 h-4" />
          当前操作人：<span className="font-semibold text-slate-700">{currentAuthor}</span>
        </div>
      </div>

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
                <div>
                  <h4 className={`font-bold ${cfg.text}`}>
                    {HANDOFF_SECTION_LABELS[section]}
                  </h4>
                  <p className="text-xs text-slate-500">{sectionNotes.length} 条记录</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 mb-4 max-h-[260px] overflow-y-auto pr-1">
                {sectionNotes.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">
                    暂无记录
                  </p>
                ) : (
                  sectionNotes.map((note, idx) => (
                    <div
                      key={note.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-white/80 animate-slide-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
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
                  className={`w-full py-2.5 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r ${cfg.gradient} hover:brightness-105 active:scale-[0.98]`}
                >
                  <Plus className="w-4 h-4" />
                  添加备注
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
