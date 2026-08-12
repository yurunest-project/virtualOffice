import { useSettingsStore } from "../store/settingsStore";
import { checkShortcutsAvailable } from "../services/focusService";

interface FocusSetupProps {
  onComplete: () => void;
}

export function FocusSetup({ onComplete }: FocusSetupProps) {
  const settings = useSettingsStore();

  async function handleComplete() {
    const available = await checkShortcutsAvailable();
    if (available) {
      settings.setFocusSetupComplete(true);
    }
    settings.setWelcomeDismissed(true);
    onComplete();
  }

  function handleSkip() {
    settings.setWelcomeDismissed(true);
    onComplete();
  }

  return (
    <div className="setup-overlay">
      <div className="setup-panel panel">
        <h2>Virtual Office へようこそ</h2>
        <p>
          デスクトップ上に半透明のバーチャルオフィスが表示されます。
          キャラクターを移動して、仕事場・自習室・休憩所を行き来しましょう。
        </p>

        <div className="setup-section">
          <h3>初回セットアップ: 集中モード連携</h3>
          <p className="muted">
            仕事場に入ると macOS の Focus モードを ON にできます（任意）。
            以下のショートカットを「ショートカット」アプリで作成してください。
          </p>
          <div className="setup-shortcuts">
            <div>
              <strong>{settings.focusOnShortcut}</strong>
              <span>Work Focus を ON</span>
            </div>
            <div>
              <strong>{settings.focusOffShortcut}</strong>
              <span>Focus を OFF</span>
            </div>
          </div>
          <ol>
            <li>ショートカットアプリ → 新規ショートカット</li>
            <li>「Set Focus」アクションを追加</li>
            <li>上記の名前で保存</li>
          </ol>
        </div>

        <div className="setup-section">
          <h3>操作について</h3>
          <p className="muted">
            Virtual Office のウィンドウ（またはブラウザタブ）内をクリックしてキャラクターを移動します。
            別のアプリやタブに切り替えても BGM と部屋モードは継続します。
          </p>
        </div>

        <div className="panel-actions setup-actions">
          <button type="button" onClick={handleComplete}>
            セットアップ完了
          </button>
          <button type="button" className="secondary" onClick={handleSkip}>
            スキップ（後で設定）
          </button>
        </div>
      </div>
    </div>
  );
}
