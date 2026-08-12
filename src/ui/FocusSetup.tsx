import { isTauri } from "@tauri-apps/api/core";
import { useSettingsStore } from "../store/settingsStore";

interface FocusSetupProps {
  onComplete: () => void;
}

export function FocusSetup({ onComplete }: FocusSetupProps) {
  const settings = useSettingsStore();

  function dismiss() {
    settings.setWelcomeDismissed(true);
    onComplete();
  }

  return (
    <div className="setup-overlay" onClick={dismiss}>
      <div
        className="setup-panel panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="welcome-title"
      >
        <h2 id="welcome-title">Virtual Office へようこそ</h2>
        <p className="setup-lead">
          仕事場・自習室・休憩所を行き来して、作業時間とタスクを記録できます。
          データはこのブラウザにだけ保存されます。
        </p>

        <ul className="help-list">
          <li>クリック: キャラクターを移動</li>
          <li>Tab: パネルの表示切替</li>
          <li>Esc: 設定（あとからいつでも）</li>
        </ul>

        {isTauri() && (
          <p className="muted">
            macOS の集中モード連携は、Esc → 設定から後でできます。
          </p>
        )}

        <div className="panel-actions setup-actions">
          <button type="button" className="secondary" onClick={dismiss}>
            スキップ
          </button>
          <button type="button" autoFocus onClick={dismiss}>
            はじめる
          </button>
        </div>
      </div>
    </div>
  );
}
