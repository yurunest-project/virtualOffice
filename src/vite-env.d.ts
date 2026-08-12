/// <reference types="vite/client" />

interface DocumentPictureInPicture {
  window: Window | null;
  requestWindow(options?: {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
  }): Promise<Window>;
  addEventListener(
    type: "enter" | "leave",
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: "enter" | "leave",
    listener: EventListener,
    options?: boolean | EventListenerOptions,
  ): void;
}

interface Window {
  documentPictureInPicture?: DocumentPictureInPicture;
}
