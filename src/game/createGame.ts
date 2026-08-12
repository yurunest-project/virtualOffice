import Phaser from "phaser";
import { VirtualOfficeScene, OfficeLayoutConfig } from "./VirtualOfficeScene";
import { RoomId } from "../store/roomStore";
import { setHitbox, removeHitbox } from "../clickthrough/hitbox";

let game: Phaser.Game | null = null;
let resizeHandler: (() => void) | null = null;
let gameParent: HTMLElement | null = null;

function applyCanvasTransparency(gameInstance: Phaser.Game): void {
  const canvas = gameInstance.canvas;
  if (!canvas) return;
  canvas.style.background = "transparent";
  canvas.style.pointerEvents = "none";
}

function getContainerOffset(): { x: number; y: number } {
  if (!gameParent) return { x: 0, y: 0 };
  const rect = gameParent.getBoundingClientRect();
  return { x: rect.left, y: rect.top };
}

function getScene(): VirtualOfficeScene | null {
  if (!game) return null;
  return game.scene.getScene("VirtualOfficeScene") as VirtualOfficeScene | null;
}

export function createGame(
  parent: HTMLElement,
  layoutConfig: OfficeLayoutConfig,
): Phaser.Game {
  if (game) {
    destroyGame();
  }

  gameParent = parent;
  const scene = new VirtualOfficeScene();
  scene.setLayoutConfig(layoutConfig);
  scene.setContainerOffsetProvider(getContainerOffset);

  const width = Math.max(parent.clientWidth, 320);
  const height = Math.max(parent.clientHeight, 180);

  game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width,
    height,
    transparent: true,
    backgroundColor: "#00000000",
    render: {
      transparent: true,
      antialias: true,
      premultipliedAlpha: false,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER,
    },
    scene: [scene],
  });

  applyCanvasTransparency(game);

  scene.setOnCharacterMove((bounds) => {
    const offset = getContainerOffset();
    setHitbox({
      id: "character",
      x: offset.x + bounds.x,
      y: offset.y + bounds.y,
      width: bounds.width,
      height: bounds.height,
    });
  });

  resizeHandler = () => {
    if (game && gameParent) {
      game.scale.resize(
        Math.max(gameParent.clientWidth, 320),
        Math.max(gameParent.clientHeight, 180),
      );
      applyCanvasTransparency(game);
    }
  };
  window.addEventListener("resize", resizeHandler);

  return game;
}

export function moveCharacterToRoom(room: RoomId): void {
  getScene()?.goToRoom(room);
}

export function handleScreenClick(screenX: number, screenY: number): void {
  getScene()?.handleScreenClick(
    screenX - getContainerOffset().x,
    screenY - getContainerOffset().y,
  );
}

export function updateGameLayout(layoutConfig: OfficeLayoutConfig): void {
  if (!game) return;
  const scene = getScene();
  if (!scene?.scene) return;
  scene.setLayoutConfig(layoutConfig);
  scene.scene.restart();
}

export function refreshOfficeTheme(): void {
  getScene()?.applyColorMode();
}

export function destroyGame(): void {
  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }
  if (game) {
    removeHitbox("character");
    removeHitbox("office-map");
    game.destroy(true);
    game = null;
  }
  gameParent = null;
}

export function getGame(): Phaser.Game | null {
  return game;
}
