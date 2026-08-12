import Phaser from "phaser";
import { Character } from "./Character";
import { ZONES, getZoneAtPoint, getZoneCenter } from "./zones";
import { RoomId, ROOMS } from "../store/roomStore";
import { useRoomStateStore } from "../store/roomStateStore";
import { updateOfficeHitbox } from "../clickthrough/hitbox";

export interface OfficeLayoutConfig {
  layoutY: number;
  layoutHeight: number;
}

export class VirtualOfficeScene extends Phaser.Scene {
  private character!: Character;
  private officeBounds!: Phaser.Geom.Rectangle;
  private tintOverlay!: Phaser.GameObjects.Rectangle;
  private layoutConfig: OfficeLayoutConfig = { layoutY: 0.04, layoutHeight: 0.92 };
  private currentZone: RoomId = "work";
  private onCharacterMove?: (bounds: Phaser.Geom.Rectangle) => void;
  private getContainerOffset?: () => { x: number; y: number };

  constructor() {
    super({ key: "VirtualOfficeScene" });
  }

  setLayoutConfig(config: OfficeLayoutConfig): void {
    this.layoutConfig = config;
  }

  setOnCharacterMove(callback: (bounds: Phaser.Geom.Rectangle) => void): void {
    this.onCharacterMove = callback;
  }

  setContainerOffsetProvider(provider: () => { x: number; y: number }): void {
    this.getContainerOffset = provider;
  }

  create(): void {
    this.rebuildOffice();
  }

  goToRoom(room: RoomId): void {
    if (!this.character || !this.officeBounds) return;

    this.currentZone = room;
    this.applyRoomTint(room);

    const center = getZoneCenter(
      room,
      this.officeBounds.x,
      this.officeBounds.y,
      this.officeBounds.width,
      this.officeBounds.height,
    );
    const destination = this.clampToWalkArea(center.x, center.y);
    this.character.walkTo(destination.x, destination.y);
  }

  handleScreenClick(localX: number, localY: number): void {
    if (!this.character || !this.officeBounds) return;

    const projected = this.projectToOffice(localX, localY);
    const destination = this.clampToWalkArea(projected.x, projected.y);

    const zone = getZoneAtPoint(
      ZONES,
      this.officeBounds.x,
      this.officeBounds.y,
      this.officeBounds.width,
      this.officeBounds.height,
      projected.x,
      projected.y,
    );

    if (zone && zone !== this.currentZone) {
      this.currentZone = zone;
      useRoomStateStore.getState().setRoom(zone);
      this.applyRoomTint(zone);
    }

    this.character.walkTo(destination.x, destination.y);
  }

  private projectToOffice(x: number, y: number): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Phaser.Math.Clamp(
        x,
        this.officeBounds.x,
        this.officeBounds.x + this.officeBounds.width,
      ),
      Phaser.Math.Clamp(
        y,
        this.officeBounds.y,
        this.officeBounds.y + this.officeBounds.height,
      ),
    );
  }

  private clampToWalkArea(x: number, y: number): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Phaser.Math.Clamp(
        x,
        this.officeBounds.x + 16,
        this.officeBounds.x + this.officeBounds.width - 16,
      ),
      Phaser.Math.Clamp(
        y,
        this.officeBounds.y + 20,
        this.officeBounds.y + this.officeBounds.height - 10,
      ),
    );
  }

  private rebuildOffice(): void {
    const { width, height } = this.scale;

    this.children.removeAll(true);

    const officeY = height * this.layoutConfig.layoutY;
    const officeHeight = height * this.layoutConfig.layoutHeight;
    const officeX = width * 0.05;
    const officeWidth = width * 0.9;

    this.officeBounds = new Phaser.Geom.Rectangle(
      officeX,
      officeY,
      officeWidth,
      officeHeight,
    );

    updateOfficeHitbox(
      (this.getContainerOffset?.().x ?? 0) + officeX,
      (this.getContainerOffset?.().y ?? 0) + officeY,
      officeWidth,
      officeHeight,
    );

    const bgPanel = this.add.rectangle(
      officeX + officeWidth / 2,
      officeY + officeHeight / 2,
      officeWidth,
      officeHeight,
      0x1a1a2e,
      0.88,
    );
    bgPanel.setStrokeStyle(3, 0xffffff, 0.45);

    this.add
      .text(officeX + officeWidth / 2, officeY + 12, "Virtual Office", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0);

    for (const zone of ZONES) {
      const zx = officeX + zone.x * officeWidth;
      const zy = officeY + zone.y * officeHeight;
      const zw = zone.width * officeWidth;
      const zh = zone.height * officeHeight;

      this.add
        .rectangle(zx + zw / 2, zy + zh / 2, zw - 8, zh - 8, zone.color, zone.alpha)
        .setStrokeStyle(1, 0xffffff, 0.3);

      this.add
        .text(zx + zw / 2, zy + 16, zone.label, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5, 0);
    }

    const divider1X = officeX + 0.335 * officeWidth;
    const divider2X = officeX + 0.665 * officeWidth;
    this.add.line(
      0,
      0,
      divider1X,
      officeY + 10,
      divider1X,
      officeY + officeHeight - 10,
      0xffffff,
      0.15,
    );
    this.add.line(
      0,
      0,
      divider2X,
      officeY + 10,
      divider2X,
      officeY + officeHeight - 10,
      0xffffff,
      0.15,
    );

    this.tintOverlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      ROOMS.work.tintColor,
      ROOMS.work.tintAlpha,
    );
    this.tintOverlay.setDepth(-1);

    const startX = officeX + officeWidth * 0.16;
    const startY = officeY + officeHeight * 0.5;
    this.character = new Character(this, startX, startY);
    this.currentZone = "work";
  }

  update(_time: number, delta: number): void {
    if (!this.character || !this.officeBounds) return;

    this.character.updateVisual(delta, this.officeBounds);

    if (this.onCharacterMove) {
      this.onCharacterMove(this.character.getBounds());
    }
  }

  private applyRoomTint(room: RoomId): void {
    const config = ROOMS[room];
    this.tintOverlay.setFillStyle(config.tintColor, config.tintAlpha);
  }
}
