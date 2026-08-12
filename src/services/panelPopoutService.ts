const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 540;

export type PopoutMode = "pip" | "popup";

let popoutWindow: Window | null = null;
let popoutRoot: HTMLElement | null = null;
let popoutMode: PopoutMode | null = null;
let onCloseCallback: (() => void) | null = null;

function setupPopoutDocument(targetWindow: Window): HTMLElement {
  targetWindow.document.title = "Virtual Office — パネル";
  if (targetWindow.document.documentElement) {
    targetWindow.document.documentElement.lang = "ja";
    targetWindow.document.documentElement.dataset.colorMode =
      document.documentElement.dataset.colorMode || "warm";
  }

  const sheets = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  );
  for (const sheet of sheets) {
    targetWindow.document.head.appendChild(sheet.cloneNode(true));
  }

  const style = targetWindow.document.createElement("style");
  style.textContent = `
    html, body {
      margin: 0;
      padding: 8px;
      background: var(--bg-deep, #241c18);
      color: var(--text, #faf3ea);
      font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP",
        system-ui, -apple-system, "Segoe UI", sans-serif;
      user-select: none;
      overflow-x: hidden;
    }
    .panels-container {
      position: static !important;
      left: auto !important;
      top: auto !important;
      right: auto !important;
      max-width: 100% !important;
      z-index: auto !important;
    }
    .panels-drag-handle { display: none !important; }
    .panel { max-width: 100%; }
    .panels-container input,
    .panels-container textarea {
      user-select: text;
      -webkit-user-select: text;
    }
  `;
  targetWindow.document.head.appendChild(style);

  const root = targetWindow.document.createElement("div");
  root.id = "popout-root";
  targetWindow.document.body.appendChild(root);

  popoutWindow = targetWindow;
  popoutRoot = root;
  return root;
}

function notifyClosed(): void {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.documentPictureInPicture?.removeEventListener("leave", notifyClosed);

  const callback = onCloseCallback;
  popoutWindow = null;
  popoutRoot = null;
  popoutMode = null;
  onCloseCallback = null;
  callback?.();
}

function handlePopoutClosed(): void {
  notifyClosed();
}

function handleVisibilityChange() {
  if (
    popoutMode === "popup" &&
    popoutWindow &&
    !popoutWindow.closed &&
    document.hidden
  ) {
    popoutWindow.focus();
  }
}

export function getPopoutRoot(): HTMLElement | null {
  if (popoutWindow?.closed) {
    popoutRoot = null;
    popoutWindow = null;
    return null;
  }
  return popoutRoot;
}

export function getPopoutMode(): PopoutMode | null {
  return popoutMode;
}

export function isPopoutSupported(): boolean {
  return Boolean(window.documentPictureInPicture?.requestWindow);
}

/**
 * ユーザークリック直後に呼ぶこと（PiP API の要件）
 */
export async function openPanelPopout(onClose: () => void): Promise<boolean> {
  if (popoutWindow && !popoutWindow.closed) {
    return true;
  }

  onCloseCallback = onClose;

  const docPiP = window.documentPictureInPicture;
  if (docPiP?.requestWindow) {
    try {
      const pipWindow = await docPiP.requestWindow({
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
      });

      setupPopoutDocument(pipWindow);
      popoutMode = "pip";

      pipWindow.addEventListener("pagehide", handlePopoutClosed);
      docPiP.addEventListener("leave", notifyClosed);
      return true;
    } catch (error) {
      console.warn("Document PiP failed, falling back to popup:", error);
    }
  }

  const left = Math.round(window.screenX + window.outerWidth);
  const top = window.screenY;
  const popup = window.open(
    "",
    "virtual-office-panels",
    `width=${PANEL_WIDTH},height=${PANEL_HEIGHT},left=${left},top=${top},resizable=yes,scrollbars=yes`,
  );

  if (!popup) {
    onCloseCallback = null;
    return false;
  }

  setupPopoutDocument(popup);
  popoutMode = "popup";

  popup.addEventListener("beforeunload", handlePopoutClosed);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  return true;
}

export function closePanelPopout(): void {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.documentPictureInPicture?.removeEventListener("leave", notifyClosed);

  if (popoutWindow && !popoutWindow.closed) {
    onCloseCallback = null;
    popoutWindow.close();
  }

  popoutWindow = null;
  popoutRoot = null;
  popoutMode = null;
}
