export type RoomId = "work" | "study" | "break";

export interface RoomConfig {
  id: RoomId;
  name: string;
  label: string;
  pomodoroWork: number;
  pomodoroBreak: number;
  focusEnabled: boolean;
  showTasks: boolean;
  ambientType: "work" | "study" | "break";
  tintColor: number;
  tintAlpha: number;
}

export const ROOMS: Record<RoomId, RoomConfig> = {
  work: {
    id: "work",
    name: "work",
    label: "仕事場",
    pomodoroWork: 25,
    pomodoroBreak: 5,
    focusEnabled: true,
    showTasks: true,
    ambientType: "work",
    tintColor: 0xfff5e6,
    tintAlpha: 0.08,
  },
  study: {
    id: "study",
    name: "study",
    label: "自習室",
    pomodoroWork: 50,
    pomodoroBreak: 10,
    focusEnabled: false,
    showTasks: true,
    ambientType: "study",
    tintColor: 0xe8f4ff,
    tintAlpha: 0.1,
  },
  break: {
    id: "break",
    name: "break",
    label: "休憩所",
    pomodoroWork: 5,
    pomodoroBreak: 15,
    focusEnabled: false,
    showTasks: false,
    ambientType: "break",
    tintColor: 0xe8ffe8,
    tintAlpha: 0.06,
  },
};

export interface OfficeLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_OFFICE_LAYOUT: OfficeLayout = {
  x: 0,
  y: 0.65,
  width: 1,
  height: 0.35,
};
