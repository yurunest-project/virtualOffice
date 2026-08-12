import { create } from "zustand";
import { sendNotification } from "@tauri-apps/plugin-notification";

async function notify(title: string, body: string): Promise<void> {
  try {
    await sendNotification({ title, body });
  } catch {
    // notifications may be unavailable outside Tauri
  }
}

export type PomodoroPhase = "work" | "break" | "idle";

interface PomodoroStore {
  phase: PomodoroPhase;
  remainingSeconds: number;
  workMinutes: number;
  breakMinutes: number;
  isRunning: boolean;
  completedSessions: number;

  setPreset: (workMinutes: number, breakMinutes: number) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  switchPhase: () => void;
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  phase: "idle",
  remainingSeconds: 25 * 60,
  workMinutes: 25,
  breakMinutes: 5,
  isRunning: false,
  completedSessions: 0,

  setPreset: (workMinutes, breakMinutes) => {
    set({
      workMinutes,
      breakMinutes,
      phase: "idle",
      remainingSeconds: workMinutes * 60,
      isRunning: false,
    });
  },

  start: () => {
    const { phase, workMinutes, remainingSeconds } = get();
    if (phase === "idle") {
      set({ phase: "work", remainingSeconds: workMinutes * 60, isRunning: true });
    } else if (remainingSeconds <= 0) {
      set({
        phase: "work",
        remainingSeconds: workMinutes * 60,
        isRunning: true,
      });
    } else {
      set({ isRunning: true });
    }
  },

  pause: () => set({ isRunning: false }),

  reset: () => {
    const { workMinutes } = get();
    set({
      phase: "idle",
      remainingSeconds: workMinutes * 60,
      isRunning: false,
    });
  },

  tick: () => {
    const { isRunning, remainingSeconds } = get();
    if (!isRunning || remainingSeconds <= 0) return;

    const next = remainingSeconds - 1;
    if (next <= 0) {
      get().switchPhase();
    } else {
      set({ remainingSeconds: next });
    }
  },

  switchPhase: () => {
    const { phase, workMinutes, breakMinutes, completedSessions } = get();
    if (phase === "work" || phase === "idle") {
      void notify("Virtual Office", "休憩の時間です");
      set({
        phase: "break",
        remainingSeconds: breakMinutes * 60,
        isRunning: true,
        completedSessions: completedSessions + 1,
      });
    } else {
      void notify("Virtual Office", "作業を再開しましょう");
      set({
        phase: "work",
        remainingSeconds: workMinutes * 60,
        isRunning: true,
      });
    }
  },
}));

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
