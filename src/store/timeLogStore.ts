import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoomId } from "./roomStore";

export interface DayLog {
  work: number;
  study: number;
  break: number;
}

interface TimeLogStore {
  logs: Record<string, DayLog>;
  activeRoom: RoomId;
  activeSince: number;
  sessionDate: string;
  tickCount: number;
  startSession: (room: RoomId) => void;
  switchRoom: (room: RoomId) => void;
  flush: () => void;
  tick: () => void;
  getTodaySeconds: (room: RoomId) => number;
  getLogForDate: (dateKey: string) => DayLog;
  getRecentDates: (count: number) => string[];
}

const RETENTION_DAYS = 365;

function emptyDay(): DayLog {
  return { work: 0, study: 0, break: 0 };
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function pruneOldLogs(logs: Record<string, DayLog>): Record<string, DayLog> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffKey = todayKey(cutoff);
  const pruned: Record<string, DayLog> = {};
  for (const [key, log] of Object.entries(logs)) {
    if (key >= cutoffKey) {
      pruned[key] = log;
    }
  }
  return pruned;
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes}分`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`;
}

export function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = todayKey();
  if (dateKey === today) return "今日";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === todayKey(yesterday)) return "昨日";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export const useTimeLogStore = create<TimeLogStore>()(
  persist(
    (set, get) => ({
      logs: {},
      activeRoom: "work",
      activeSince: Date.now(),
      sessionDate: todayKey(),
      tickCount: 0,

      startSession: (room) => {
        set({
          activeRoom: room,
          activeSince: Date.now(),
          sessionDate: todayKey(),
        });
      },

      switchRoom: (room) => {
        get().flush();
        set({
          activeRoom: room,
          activeSince: Date.now(),
          sessionDate: todayKey(),
        });
      },

      flush: () => {
        const { activeSince, activeRoom, sessionDate, logs } = get();
        if (!activeSince) return;

        const elapsed = Math.floor((Date.now() - activeSince) / 1000);
        if (elapsed <= 0) {
          set({ activeSince: Date.now() });
          return;
        }

        const day = logs[sessionDate] ?? emptyDay();
        set({
          logs: pruneOldLogs({
            ...logs,
            [sessionDate]: {
              ...day,
              [activeRoom]: day[activeRoom] + elapsed,
            },
          }),
          activeSince: Date.now(),
          sessionDate: todayKey(),
        });
      },

      tick: () => {
        const currentDate = todayKey();
        if (currentDate !== get().sessionDate) {
          get().flush();
        }
        set({ tickCount: get().tickCount + 1 });
      },

      getTodaySeconds: (room) => {
        const key = todayKey();
        const stored = get().logs[key]?.[room] ?? 0;
        const { activeRoom, activeSince, sessionDate } = get();
        if (activeRoom !== room || !activeSince || sessionDate !== key) {
          return stored;
        }
        return stored + Math.floor((Date.now() - activeSince) / 1000);
      },

      getLogForDate: (dateKey) => {
        const key = todayKey();
        const stored = get().logs[dateKey] ?? emptyDay();
        if (dateKey !== key) return stored;

        const { activeRoom, activeSince, sessionDate } = get();
        if (!activeSince || sessionDate !== key) return stored;

        const elapsed = Math.floor((Date.now() - activeSince) / 1000);
        return {
          ...stored,
          [activeRoom]: stored[activeRoom] + elapsed,
        };
      },

      getRecentDates: (count) => {
        const dates = new Set<string>([...Object.keys(get().logs), todayKey()]);
        return [...dates]
          .sort((a, b) => b.localeCompare(a))
          .slice(0, count);
      },
    }),
    { name: "virtual-office-time-log", merge: (persisted, current) => {
      const saved = persisted as Partial<TimeLogStore> | undefined;
      return {
        ...current,
        ...saved,
        logs: pruneOldLogs(saved?.logs ?? {}),
      };
    } },
  ),
);
