import { useMemo, useState } from "react";
import {
  CheckSquare,
  Square,
  Handshake,
  Clock,
  User,
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useEventStore } from "@/store/eventStore";
import {
  HANDOFF_SECTION_LABELS,
  type HandoffSection as HandoffSectionType,
  type HandoffStatusItem,
} from "@/types";
import { getCurrentShift, getPreviousShift } from "@/utils/shift";

interface HandoffStatusSectionProps {
  eventId: string;
}

const sectionConfig: Record<
  HandoffSectionType,
  { icon: typeof AlertTriangle; color: string; bg: string; text: string }
> = {
  unverified: {
    icon: AlertTriangle,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  to_contact: {
    icon: PhoneCall,
    color: "text-blue-700",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  confidential: {
    icon: ShieldAlert,
    color: "text-slate-700",
    bg: "bg-slate-100",
    text: "text-slate-700",
  },
};

export default function HandoffStatusSection({ eventId }: HandoffStatusSectionProps) {
  const handoffStatus = useEventStore((s) => s.getEventHandoffStatus(eventId));
  const acceptHandoff = useEventStore((s) => s.acceptHandoff);
  const toggleHandoffItemDone = useEventStore((s) => s.toggleHandoffItemDone);
  const getShiftRelationForNote = useEventStore((s) => s.getShiftRelationForNote);
  const allNotes = useEventStore((s) => s.handoffNotes);

  const [currentAuthor] = useState("王主任");
  const currentShift = useMemo(() => getCurrentShift(), []);
  const prevShift = useMemo(() => getPreviousShift(), []);

  const prevShiftNotes = useMemo(
    () =>
      allNotes.filter(
        (n) =>
          n.eventId === eventId && getShiftRelationForNote(n as any) === "previous"
      ),
    [allNotes, eventId, getShiftRelationForNote]
  );

  const hasPrevNotes = prevShiftNotes.length > 0;
  const isAccepted = handoffStatus?.accepted ?? false;

  const groupedItems = useMemo(() => {
    const groups: Record<HandoffSectionType, HandoffStatusItem[]> = {
      unverified: [],
      to_contact: [],
      confidential: [],
    };
    if (handoffStatus) {
      handoffStatus.items.forEach((item) => {
        groups[item.section].push(item);
      });
    }
    return groups;
  }, [handoffStatus]);

  const todoCount = handoffStatus?.items.length ?? 0;
  const doneCount = handoffStatus?.items.filter((i) => i.done).length ?? 0;
  const pendingCount = todoCount - doneCount;

  const handleAccept = () => {
    if (!hasPrevNotes) return;
    acceptHandoff(eventId, currentAuthor);
  };

  if (!hasPrevNotes && !isAccepted) {
    return null;
  }

  return (
    <div className="card-base p-8">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <span className="w-1.5 h-7 bg-blue-600 rounded-full" />
            交接状态
          </h3>
          <p className="text-sm text-slate-500 mt-1.5">
            确认已接手并跟踪待处理事项进度
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isAccepted && handoffStatus && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success-50 rounded-lg border border-success-100">
                <Handshake className="w-4 h-4 text-success-600" />
                <span className="text-sm font-semibold text-success-700">
                  已接手 · {handoffStatus.acceptedAt}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-700">{handoffStatus.acceptedBy}</span>
              </div>
            </>
          )}
          {todoCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="tag bg-success-50 text-success-700 border border-success-200">
                已完成 {doneCount}
              </span>
              <span className="tag bg-warning-50 text-warning-700 border border-warning-200">
                待处理 {pendingCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {!isAccepted && hasPrevNotes && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-blue-50/50 to-primary-50 border-2 border-dashed border-blue-300 animate-slide-up">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Handshake className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg mb-1">
                  上一班（{prevShift.label}）留下了 {prevShiftNotes.length} 条交接信息
                </p>
                <p className="text-sm text-slate-600">
                  请认真阅读并确认接手，系统将自动把每条信息转为待办事项供你跟踪
                </p>
              </div>
            </div>
            <button
              onClick={handleAccept}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold flex items-center gap-2 hover:brightness-105 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
            >
              <Handshake className="w-5 h-5" />
              确认已接手
            </button>
          </div>
        </div>
      )}

      {isAccepted && handoffStatus && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {(Object.keys(groupedItems) as HandoffSectionType[]).map((section, sIdx) => {
            const items = groupedItems[section];
            const cfg = sectionConfig[section];
            const Icon = cfg.icon;

            return (
              <div
                key={section}
                className={`rounded-2xl border ${cfg.bg} p-5 flex flex-col animate-slide-up`}
                style={{ animationDelay: `${sIdx * 80}ms` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center border ${
                      section === "unverified"
                        ? "border-yellow-200"
                        : section === "to_contact"
                        ? "border-blue-200"
                        : "border-slate-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${cfg.text}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${cfg.text}`}>
                      {HANDOFF_SECTION_LABELS[section]}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {items.filter((i) => i.done).length}/{items.length} 已处理
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">暂无待办</p>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => toggleHandoffItemDone(eventId, item.id)}
                        className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 ${
                          item.done
                            ? "bg-white/50 opacity-70"
                            : "bg-white shadow-sm hover:shadow-md"
                        }`}
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {item.done ? (
                            <CheckSquare className="w-5 h-5 text-success-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 group-hover:text-primary-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${
                              item.done
                                ? "text-slate-400 line-through"
                                : "text-slate-700"
                            }`}
                          >
                            {item.content}
                          </p>
                          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.createdAt}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAccepted && pendingCount > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-warning-50 border border-warning-100 flex items-start gap-3 animate-slide-in-right">
          <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning-800 mb-1">
              还有 {pendingCount} 项待处理事项
            </p>
            <p className="text-xs text-warning-700/80">
              请在当班时间内完成或转交下一班，点击左侧勾选框可标记完成
            </p>
          </div>
        </div>
      )}

      {isAccepted && pendingCount === 0 && todoCount > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-success-50 border border-success-100 flex items-start gap-3 animate-slide-in-right">
          <CheckSquare className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-success-800 mb-1">
              本班所有事项已处理完毕
            </p>
            <p className="text-xs text-success-700/80">
              请在交接时确认无误后再交给下一班次
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
