import { useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { useSettingsStore } from "../store/settingsStore";
import { ROOMS, RoomId } from "../store/roomStore";
import { ambientManager } from "../services/ambientService";
import { BGM_PRESET_OPTIONS, BgmPresetId } from "../services/bgmPresets";
import {
  checkShortcutsAvailable,
  testFocusShortcut,
} from "../services/focusService";

interface SettingsPanelProps {
  onClose: () => void;
}

const ROOM_ORDER: RoomId[] = ["work", "study", "break"];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useSettingsStore();
  const [shortcutsOk, setShortcutsOk] = useState<boolean | null>(null);

  async function verifyShortcuts() {
    const ok = await checkShortcutsAvailable();
    setShortcutsOk(ok);
  }

  function handleBgmPresetChange(room: RoomId, preset: BgmPresetId) {
    settings.setRoomBgmPreset(room, preset);
    ambientManager.setRoomPreset(room, preset);
  }

  function handleBgmEnabledChange(enabled: boolean) {
    settings.setBgmEnabled(enabled);
    ambientManager.setEnabled(enabled);
  }

  return (
    <div className="settings-overlay">
      <div className="settings-panel panel">
        <div className="panel-header-row">
          <h2>設定</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <section>
          <h3>配色</h3>
          <div className="color-mode-toggle" role="group" aria-label="配色">
            <button
              type="button"
              className={settings.colorMode === "warm" ? "active" : "secondary"}
              onClick={() => settings.setColorMode("warm")}
            >
              暖色
            </button>
            <button
              type="button"
              className={settings.colorMode === "cool" ? "active" : "secondary"}
              onClick={() => settings.setColorMode("cool")}
            >
              寒色
            </button>
          </div>
          <p className="muted small">
            暖色はカフェのようなやさしい色、寒色はこれまでの落ち着いた青系です。
          </p>
        </section>

        {isTauri() && (
        <section>
          <h3>表示</h3>
          <label className="setting-row checkbox">
            <input
              type="checkbox"
              checked={settings.showOnStartup}
              onChange={(e) => settings.setShowOnStartup(e.target.checked)}
            />
            <span>起動時に表示</span>
          </label>
        </section>
        )}

        <section>
          <h3>BGM</h3>
          <label className="setting-row checkbox">
            <input
              type="checkbox"
              checked={settings.bgmEnabled}
              onChange={(e) => handleBgmEnabledChange(e.target.checked)}
            />
            <span>BGM を再生する</span>
          </label>
          <label className="setting-row">
            <span>音量</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.bgmVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                settings.setBgmVolume(v);
                ambientManager.setVolume(v);
              }}
            />
            <span>{Math.round(settings.bgmVolume * 100)}%</span>
          </label>

          <div className="bgm-room-settings">
            {ROOM_ORDER.map((room) => (
              <label key={room} className="setting-row">
                <span>{ROOMS[room].label}</span>
                <select
                  value={settings.roomBgmPresets[room] ?? "office"}
                  onChange={(e) =>
                    handleBgmPresetChange(room, e.target.value as BgmPresetId)
                  }
                >
                  {BGM_PRESET_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <p className="muted small">
            BGM ファイルは Mixkit のフリー素材です。`public/bgm/` の MP3 を差し替えるとカスタマイズできます。
          </p>
        </section>

        {isTauri() && (
        <section>
          <h3>集中モード (Shortcuts)</h3>
          <p className="muted small">
            macOS の「ショートカット」アプリで Focus ON/OFF 用のショートカットを作成してください。
          </p>
          <label className="setting-row">
            <span>Focus ON</span>
            <input
              type="text"
              value={settings.focusOnShortcut}
              onChange={(e) =>
                settings.setFocusShortcuts(e.target.value, settings.focusOffShortcut)
              }
            />
          </label>
          <label className="setting-row">
            <span>Focus OFF</span>
            <input
              type="text"
              value={settings.focusOffShortcut}
              onChange={(e) =>
                settings.setFocusShortcuts(settings.focusOnShortcut, e.target.value)
              }
            />
          </label>
          <div className="panel-actions">
            <button type="button" onClick={verifyShortcuts}>
              確認
            </button>
            <button type="button" className="secondary" onClick={() => testFocusShortcut(true)}>
              ON テスト
            </button>
            <button type="button" className="secondary" onClick={() => testFocusShortcut(false)}>
              OFF テスト
            </button>
          </div>
          {shortcutsOk !== null && (
            <p className={shortcutsOk ? "success" : "error"}>
              {shortcutsOk
                ? "shortcuts コマンドが利用可能です"
                : "shortcuts コマンドが見つかりません"}
            </p>
          )}
          <label className="setting-row checkbox">
            <input
              type="checkbox"
              checked={settings.focusSetupComplete}
              onChange={(e) => settings.setFocusSetupComplete(e.target.checked)}
            />
            <span>セットアップ完了（仕事場で Focus を自動切替）</span>
          </label>
        </section>
        )}

        <section>
          <h3>操作</h3>
          <ul className="help-list">
            <li>クリック: 移動先指定（部屋切替は即時）</li>
            <li>Tab: パネル表示切替</li>
            <li>Esc: 設定</li>
          </ul>
        </section>

        <section className="legal-links">
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
            プライバシーポリシー
          </a>
          <span aria-hidden="true"> · </span>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer">
            利用規約
          </a>
        </section>
      </div>
    </div>
  );
}
