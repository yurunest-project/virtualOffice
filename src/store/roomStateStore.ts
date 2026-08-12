import { create } from "zustand";
import { RoomId, ROOMS } from "./roomStore";
import { usePomodoroStore } from "./pomodoroStore";
import { useTimeLogStore } from "./timeLogStore";
import { applyFocusForRoom } from "../services/focusService";
import { ambientManager } from "../services/ambientService";

interface RoomStateStore {
  currentRoom: RoomId;
  previousRoom: RoomId | null;
  setRoom: (room: RoomId) => void;
}

export const useRoomStateStore = create<RoomStateStore>((set, get) => ({
  currentRoom: "work",
  previousRoom: null,

  setRoom: (room) => {
    const prev = get().currentRoom;
    if (prev === room) return;

    useTimeLogStore.getState().switchRoom(room);

    const config = ROOMS[room];
    usePomodoroStore.getState().setPreset(config.pomodoroWork, config.pomodoroBreak);
    ambientManager.setRoom(room);
    applyFocusForRoom(room);

    set({ currentRoom: room, previousRoom: prev });
  },
}));
