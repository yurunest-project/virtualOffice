import { useEffect, useRef, useState } from "react";
import {
  useTimeLogStore,
  formatDuration,
  formatDateLabel,
} from "../store/timeLogStore";
import { ROOMS, RoomId } from "../store/roomStore";

const TRACKED_ROOMS: RoomId[] = ["work", "study", "break"];
const HISTORY_DAYS = 365;

export function TimeHistoryPopover() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tickCount = useTimeLogStore((s) => s.tickCount);
  const getLogForDate = useTimeLogStore((s) => s.getLogForDate);
  const getRecentDates = useTimeLogStore((s) => s.getRecentDates);

  void tickCount;

  const dates = getRecentDates(HISTORY_DAYS);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="time-history-root" ref={rootRef}>
      <button
        type="button"
        className="status-history-btn"
        onClick={() => setOpen((v) => !v)}
        title="滞在履歴（1年間）"
        aria-expanded={open}
        aria-label="滞在履歴"
      >
        ⌛
      </button>
      {open && (
        <div className="time-history-popover">
          <div className="time-history-title">滞在履歴（1年間）</div>
          <div className="time-history-list">
            {dates.length === 0 ? (
              <p className="muted">記録がありません</p>
            ) : (
              dates.map((dateKey) => {
                const log = getLogForDate(dateKey);
                const hasActivity = TRACKED_ROOMS.some((room) => log[room] > 0);
                if (!hasActivity) return null;

                return (
                  <div key={dateKey} className="time-history-row">
                    <span className="time-history-date">
                      {formatDateLabel(dateKey)}
                    </span>
                    <span className="time-history-values">
                      {TRACKED_ROOMS.map((room, index) => (
                        <span key={room}>
                          {index > 0 && " · "}
                          {ROOMS[room].label} {formatDuration(log[room])}
                        </span>
                      ))}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
