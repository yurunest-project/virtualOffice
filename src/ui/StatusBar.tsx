import { ROOMS, RoomId } from "../store/roomStore";
import { useRoomStateStore } from "../store/roomStateStore";
import { usePomodoroStore } from "../store/pomodoroStore";
import { useSettingsStore } from "../store/settingsStore";
import { ambientManager } from "../services/ambientService";
import { moveCharacterToRoom } from "../game/createGame";
import { TimeHistoryPopover } from "./TimeHistoryPopover";
import {
  closePanelPopout,
  isPopoutSupported,
  openPanelPopout,
} from "../services/panelPopoutService";

interface StatusBarProps {
  windowActive: boolean;
}

const ROOM_ORDER: RoomId[] = ["work", "study", "break"];

export function StatusBar({ windowActive }: StatusBarProps) {
  const currentRoom = useRoomStateStore((s) => s.currentRoom);
  const setRoom = useRoomStateStore((s) => s.setRoom);
  const { phase, isRunning } = usePomodoroStore();
  const {
    bgmEnabled, setBgmEnabled,
    officeMapVisible, setOfficeMapVisible,
    panelsPopout, setPanelsPopout,
    colorMode, setColorMode,
  } = useSettingsStore();
  const room = ROOMS[currentRoom];

  function toggleBgm() {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    ambientManager.setEnabled(next);
  }

  function handleRoomChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextRoom = e.target.value as RoomId;
    if (nextRoom === currentRoom) return;
    setRoom(nextRoom);
    moveCharacterToRoom(nextRoom);
  }

  async function handlePopoutToggle() {
    if (panelsPopout) {
      closePanelPopout();
      setPanelsPopout(false);
      return;
    }

    const opened = await openPanelPopout(() => setPanelsPopout(false));
    if (opened) {
      setPanelsPopout(true);
    }
  }

  const popoutTitle = panelsPopout
    ? "パネルを元の画面に戻す"
    : isPopoutSupported()
      ? "パネルを常に最前面の小窓で開く（Chrome / Edge）"
      : "パネルを別ウィンドウで開く（Chrome / Edge 推奨）";

  return (
    <div className="status-bar">
      <select
        className="status-room-select"
        value={currentRoom}
        onChange={handleRoomChange}
        title="場所を変更"
        aria-label="場所を変更"
      >
        {ROOM_ORDER.map((roomId) => (
          <option key={roomId} value={roomId}>
            {ROOMS[roomId].label}
          </option>
        ))}
      </select>
      <span className="status-divider">·</span>
      <span className={`status-focus-state${windowActive ? " active" : ""}`}>
        {windowActive ? "操作中" : "非アクティブ"}
      </span>
      <span className="status-divider">·</span>
      <span className="status-timer">
        {isRunning
          ? phase === "work"
            ? "作業中"
            : phase === "break"
              ? "休憩中"
              : "待機中"
          : "停止中"}
      </span>
      {room.focusEnabled && (
        <>
          <span className="status-divider">·</span>
          <span className="status-focus">集中モード</span>
        </>
      )}
      <span className="status-divider">·</span>
      <TimeHistoryPopover />
      <span className="status-divider">·</span>
      <button
        type="button"
        className="status-bgm-toggle"
        onClick={() => setColorMode(colorMode === "warm" ? "cool" : "warm")}
        title="暖色と寒色を切り替え"
      >
        {colorMode === "warm" ? "暖色" : "寒色"}
      </button>
      <span className="status-divider">·</span>
      <button
        type="button"
        className="status-bgm-toggle"
        onClick={toggleBgm}
        title="BGM のオン/オフ"
      >
        BGM {bgmEnabled ? "ON" : "OFF"}
      </button>
      <span className="status-divider">·</span>
      <button
        type="button"
        className="status-map-toggle"
        onClick={() => setOfficeMapVisible(!officeMapVisible)}
        title="オフィスマップの表示/非表示"
      >
        マップ {officeMapVisible ? "ON" : "OFF"}
      </button>
      <span className="status-divider">·</span>
      <button
        type="button"
        className="status-popout-toggle"
        onClick={handlePopoutToggle}
        title={popoutTitle}
      >
        {panelsPopout ? "📌 戻す" : "↗ 最前面"}
      </button>
    </div>
  );
}
