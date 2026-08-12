import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createGame, destroyGame, getGame, handleScreenClick } from "./game/createGame";
import { updatePanelHitbox } from "./clickthrough/hitbox";
import { useSettingsStore } from "./store/settingsStore";
import { useRoomStateStore } from "./store/roomStateStore";
import { useTimeLogStore } from "./store/timeLogStore";
import { ambientManager } from "./services/ambientService";
import { WorkspacePanel } from "./ui/WorkspacePanel";
import { PanelPopout } from "./ui/PanelPopout";
import { PomodoroPanel } from "./ui/PomodoroPanel";
import { TaskPanel } from "./ui/TaskPanel";
import { NotesPanel } from "./ui/NotesPanel";
import { StatusBar } from "./ui/StatusBar";
import { DailyStatsPanel } from "./ui/DailyStatsPanel";
import { SettingsPanel } from "./ui/SettingsPanel";
import { FocusSetup } from "./ui/FocusSetup";
import "./App.css";

const INTERACTIVE_SELECTOR =
  ".panels-container, .panels-drag-handle, .panel, .status-bar, .daily-stats-panel, .time-history-popover, .setup-overlay, .settings-overlay, button, input, textarea, select, .hint-bar";

function shouldIgnoreClick(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
}

function App() {
  const gameRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const windowActiveRef = useRef(document.hasFocus());
  const suppressAvatarClickUntil = useRef(0);

  const [showSettings, setShowSettings] = useState(false);
  const [showSetup, setShowSetup] = useState(
    () => !useSettingsStore.getState().welcomeDismissed,
  );
  const [windowActive, setWindowActive] = useState(document.hasFocus());

  const settings = useSettingsStore();
  const currentRoom = useRoomStateStore((s) => s.currentRoom);
  const officeMapVisible = settings.officeMapVisible;
  const forceInteractive = showSetup || showSettings;
  const movementEnabled = windowActive && !forceInteractive && officeMapVisible;

  useEffect(() => {
    if (!gameRef.current) return;

    let cancelled = false;

    const initGame = () => {
      if (cancelled || !gameRef.current) return;
      if (window.innerWidth < 100 || window.innerHeight < 100) {
        requestAnimationFrame(initGame);
        return;
      }

      createGame(gameRef.current, {
        layoutY: 0.04,
        layoutHeight: 0.92,
      });
      ambientManager.setRoom("work");
    };

    initGame();

    return () => {
      cancelled = true;
      destroyGame();
      ambientManager.destroy();
    };
  }, []);

  useEffect(() => {
    const room = useRoomStateStore.getState().currentRoom;
    useTimeLogStore.getState().startSession(room);

    const interval = window.setInterval(() => {
      useTimeLogStore.getState().tick();
    }, 1000);

    const onBeforeUnload = () => {
      useTimeLogStore.getState().flush();
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("beforeunload", onBeforeUnload);
      useTimeLogStore.getState().flush();
    };
  }, []);

  useEffect(() => {
    const game = getGame();
    if (!game) return;
    if (officeMapVisible) {
      game.scene.resume("VirtualOfficeScene");
    } else {
      game.scene.pause("VirtualOfficeScene");
    }
  }, [officeMapVisible]);

  useEffect(() => {
    ambientManager.setVolume(settings.bgmVolume);
  }, [settings.bgmVolume]);

  useEffect(() => {
    if (settings.bgmEnabled) {
      ambientManager.refresh();
    } else {
      ambientManager.setEnabled(false);
    }
  }, [settings.bgmEnabled]);

  useEffect(() => {
    const setActive = (active: boolean) => {
      windowActiveRef.current = active;
      setWindowActive(active);
    };

    const onFocus = () => setActive(true);
    const onBlur = () => setActive(false);

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    setActive(document.hasFocus());

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    updatePanelHitbox("panels", panelsRef.current);
    updatePanelHitbox("status-bar", statusRef.current);

    const panelEl = panelsRef.current;
    if (!panelEl) return;

    const syncHitbox = () => updatePanelHitbox("panels", panelEl);
    const observer = new ResizeObserver(syncHitbox);
    observer.observe(panelEl);
    window.addEventListener("scroll", syncHitbox, true);
    window.addEventListener("resize", syncHitbox);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncHitbox, true);
      window.removeEventListener("resize", syncHitbox);
    };
  }, [settings.panelsVisible, currentRoom, showSetup, showSettings, settings.panelsPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!windowActiveRef.current) return;
      if (e.key === "Tab") {
        e.preventDefault();
        settings.setPanelsVisible(!settings.panelsVisible);
      }
      if (e.key === "Escape") {
        setShowSettings((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings.panelsVisible, settings.setPanelsVisible]);

  function onAppClick(e: React.MouseEvent<HTMLDivElement>) {
    if (Date.now() < suppressAvatarClickUntil.current) return;
    if (!windowActiveRef.current || forceInteractive) return;
    if (shouldIgnoreClick(e.target)) return;
    ambientManager.resumeAfterUserGesture();
    handleScreenClick(e.clientX, e.clientY);
  }

  const onPanelDragEnd = useCallback(() => {
    suppressAvatarClickUntil.current = Date.now() + 400;
  }, []);

  return (
    <div
      className={`app-root${movementEnabled ? "" : " app-root-inactive"}`}
      style={
        {
          "--office-height": officeMapVisible
            ? `${settings.officeLayoutHeight * 100}vh`
            : "0vh",
        } as CSSProperties
      }
      onClick={onAppClick}
    >
      <div className="workspace-backdrop" aria-hidden="true" />

      {showSetup && (
        <FocusSetup onComplete={() => setShowSetup(false)} />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}

      <div ref={statusRef}>
        <StatusBar windowActive={windowActive} />
      </div>

      <DailyStatsPanel />

      {settings.panelsVisible && !settings.panelsPopout && (
        <WorkspacePanel
          containerRef={panelsRef}
          onDragEnd={onPanelDragEnd}
        />
      )}

      {settings.panelsPopout && (
        <PanelPopout onClose={() => settings.setPanelsPopout(false)}>
          <PomodoroPanel />
          <TaskPanel />
          <NotesPanel />
        </PanelPopout>
      )}

      <div
        ref={gameRef}
        className={`game-container${officeMapVisible ? "" : " game-container-hidden"}`}
      />

      <div className="hint-bar">
        {movementEnabled
          ? "クリックで移動 · Tab: パネル · Esc: 設定"
          : !officeMapVisible
            ? "ステータスバーから場所変更 · Tab: パネル · Esc: 設定"
            : "タブが非アクティブ · BGM/モードは継続"}
      </div>
    </div>
  );
}

export default App;
