import { invoke } from "@tauri-apps/api/core";
import { RoomId } from "../store/roomStore";
import { useSettingsStore } from "../store/settingsStore";

let lastFocusState: "on" | "off" | null = null;

export async function applyFocusForRoom(room: RoomId): Promise<void> {
  const settings = useSettingsStore.getState();
  if (!settings.focusSetupComplete) return;

  const shouldEnable = room === "work";
  const targetState = shouldEnable ? "on" : "off";

  if (lastFocusState === targetState) return;
  lastFocusState = targetState;

  const shortcutName = shouldEnable
    ? settings.focusOnShortcut
    : settings.focusOffShortcut;

  try {
    await invoke("run_shortcut", { name: shortcutName });
  } catch (error) {
    console.warn("Focus shortcut failed:", error);
  }
}

export async function checkShortcutsAvailable(): Promise<boolean> {
  try {
    return await invoke<boolean>("check_shortcuts_available");
  } catch {
    return false;
  }
}

export async function testFocusShortcut(on: boolean): Promise<void> {
  const settings = useSettingsStore.getState();
  const name = on ? settings.focusOnShortcut : settings.focusOffShortcut;
  await invoke("run_shortcut", { name });
}
