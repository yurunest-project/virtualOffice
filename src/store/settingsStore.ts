import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RoomId } from "./roomStore";
import { BgmPresetId, DEFAULT_ROOM_BGM } from "../services/bgmPresets";
import { ColorMode } from "../theme/colorMode";

export interface AppSettings {
  bgmEnabled: boolean;
  bgmVolume: number;
  bgmDefaultsVersion: number;
  roomBgmPresets: Record<RoomId, BgmPresetId>;
  officeLayoutY: number;
  officeLayoutHeight: number;
  focusOnShortcut: string;
  focusOffShortcut: string;
  focusSetupComplete: boolean;
  welcomeDismissed: boolean;
  showOnStartup: boolean;
  panelsVisible: boolean;
  officeMapVisible: boolean;
  workspacePanelTab: WorkspacePanelTab;
  panelsPosition: { x: number; y: number } | null;
  panelsPopout: boolean;
  panelPopoutPosition: { x: number; y: number } | null;
  colorMode: ColorMode;
}

export type WorkspacePanelTab = "pomodoro" | "task" | "notes";

interface SettingsStore extends AppSettings {
  setBgmEnabled: (enabled: boolean) => void;
  setBgmVolume: (volume: number) => void;
  setRoomBgmPreset: (room: RoomId, preset: BgmPresetId) => void;
  setOfficeLayout: (y: number, height: number) => void;
  setFocusShortcuts: (on: string, off: string) => void;
  setFocusSetupComplete: (complete: boolean) => void;
  setWelcomeDismissed: (dismissed: boolean) => void;
  setShowOnStartup: (show: boolean) => void;
  setPanelsVisible: (visible: boolean) => void;
  setOfficeMapVisible: (visible: boolean) => void;
  setWorkspacePanelTab: (tab: WorkspacePanelTab) => void;
  setPanelsPosition: (position: { x: number; y: number } | null) => void;
  setPanelsPopout: (popout: boolean) => void;
  setPanelPopoutPosition: (position: { x: number; y: number } | null) => void;
  setColorMode: (mode: ColorMode) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      bgmEnabled: true,
      bgmVolume: 0.3,
      bgmDefaultsVersion: 5,
      roomBgmPresets: { ...DEFAULT_ROOM_BGM },
      officeLayoutY: 0.65,
      officeLayoutHeight: 0.42,
      focusOnShortcut: "VirtualOffice_WorkFocus",
      focusOffShortcut: "VirtualOffice_FocusOff",
      focusSetupComplete: false,
      welcomeDismissed: false,
      showOnStartup: true,
      panelsVisible: true,
      officeMapVisible: true,
      workspacePanelTab: "pomodoro" as WorkspacePanelTab,
      panelsPosition: null,
      panelsPopout: false,
      panelPopoutPosition: null,
      colorMode: "warm" as ColorMode,

      setBgmEnabled: (enabled) => set({ bgmEnabled: enabled }),
      setBgmVolume: (volume) => set({ bgmVolume: volume }),
      setRoomBgmPreset: (room, preset) =>
        set((state) => ({
          roomBgmPresets: { ...state.roomBgmPresets, [room]: preset },
        })),
      setOfficeLayout: (y, height) =>
        set({ officeLayoutY: y, officeLayoutHeight: height }),
      setFocusShortcuts: (on, off) =>
        set({ focusOnShortcut: on, focusOffShortcut: off }),
      setFocusSetupComplete: (complete) =>
        set({ focusSetupComplete: complete }),
      setWelcomeDismissed: (dismissed) =>
        set({ welcomeDismissed: dismissed }),
      setShowOnStartup: (show) => set({ showOnStartup: show }),
      setPanelsVisible: (visible) => set({ panelsVisible: visible }),
      setOfficeMapVisible: (visible) => set({ officeMapVisible: visible }),
      setWorkspacePanelTab: (tab) => set({ workspacePanelTab: tab }),
      setPanelsPosition: (position) => set({ panelsPosition: position }),
      setPanelsPopout: (popout) => set({ panelsPopout: popout }),
      setPanelPopoutPosition: (position) => set({ panelPopoutPosition: position }),
      setColorMode: (mode) => set({ colorMode: mode }),
    }),
    { name: "virtual-office-settings", merge: (persisted, current) => {
      const saved = persisted as Partial<AppSettings> | undefined;
      const version = saved?.bgmDefaultsVersion ?? 1;
      let roomBgmPresets = { ...DEFAULT_ROOM_BGM, ...saved?.roomBgmPresets };

      if (version < 3) {
        roomBgmPresets = {
          ...roomBgmPresets,
          study: "river",
          break: "musicbox",
        };
      }

      if (version < 4) {
        roomBgmPresets = {
          ...roomBgmPresets,
          break: "lullaby",
        };
      }

      if (version < 5) {
        roomBgmPresets = {
          ...roomBgmPresets,
          break: "meditation",
        };
      }

      return {
        ...current,
        ...saved,
        bgmDefaultsVersion: 5,
        roomBgmPresets,
        panelsPosition: saved?.panelsPosition ?? null,
        colorMode: saved?.colorMode === "cool" ? "cool" : "warm",
      };
    } },
  ),
);

export type { RoomId };
