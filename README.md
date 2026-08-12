# Virtual Office

ブラウザ上で動く、一人用バーチャルオフィスアプリです。

## 機能

- キャラクターをクリックで移動
- 3 つの部屋: 仕事場 / 自習室 / 休憩所
- 部屋ごとの BGM・画面ティント・ポモドーロプリセット
- タスク管理・メモ（ブラウザでは localStorage、デスクトップ版では SQLite）
- macOS Focus モード連携（デスクトップ版 / Shortcuts 経由）

## 起動方法（ブラウザ）

```bash
npm install
npm run dev
```

`http://localhost:1420` がブラウザで **1 タブだけ** 開きます。

> **注意:** `npm run tauri dev` や `npm run desktop` は別のデスクトップウィンドウが開くため、通常は使わないでください。

## 操作

| キー | 動作 |
|------|------|
| クリック | 移動先指定 |
| Tab | パネル表示切替 |
| Esc | 設定 |

## BGM

Mixkit のフリー素材を使用。`public/bgm/` の MP3 を差し替え可能（Esc → 設定）。

## デスクトップ版（任意）

```bash
npm run desktop
```

Tauri ネイティブウィンドウ + トレイメニュー。Focus 連携はこちらのみ。

```bash
npm run tauri build
```

## Focus 連携（デスクトップ版）

1. macOS「ショートカット」で `VirtualOffice_WorkFocus` / `VirtualOffice_FocusOff` を作成
2. Esc → 設定 で「セットアップ完了」を有効化

## Web 公開（Vercel）

ブラウザ版は静的サイトとして公開できます。タスク・メモ・時間記録は **localStorage にのみ保存** され、サーバー DB やログインは不要です。

### デプロイ手順

1. このプロジェクトを **専用の GitHub リポジトリ** に push（ホームディレクトリ全体ではなく `virtualOffice` のみ）
2. [Vercel](https://vercel.com) → Add New Project → リポジトリを Import
3. ビルド設定:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy

`vercel.json` で SPA フォールバックを設定済み。法務ページは `/privacy.html` と `/terms.html`（Esc → 設定からもリンク）。

### 環境変数

現状、API キー等の環境変数は **不要** です（`.env.example` 参照）。
