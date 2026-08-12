import Phaser from "phaser";

const WALK_SPEED = 175;

export class Character {
  public sprite: Phaser.GameObjects.Container;
  private directionIndicator: Phaser.GameObjects.Triangle;
  private target: Phaser.Math.Vector2 | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const shadow = scene.add.ellipse(0, 14, 28, 10, 0x000000, 0.25);
    const body = scene.add.ellipse(0, 0, 24, 32, 0xff6b6b, 1);
    body.setStrokeStyle(2, 0xffffff, 0.9);

    const head = scene.add.circle(0, -18, 10, 0xffccaa, 1);
    head.setStrokeStyle(1, 0xffffff, 0.8);

    this.directionIndicator = scene.add.triangle(
      0,
      -8,
      0,
      -6,
      6,
      4,
      -6,
      4,
      0xffffff,
      0.9,
    );

    this.sprite = scene.add.container(x, y, [
      shadow,
      body,
      head,
      this.directionIndicator,
    ]);
    this.sprite.setDepth(100);
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.target = null;
  }

  walkTo(x: number, y: number): void {
    this.target = new Phaser.Math.Vector2(x, y);
  }

  isWalking(): boolean {
    return this.target !== null;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  getBounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      this.sprite.x - 20,
      this.sprite.y - 30,
      40,
      50,
    );
  }

  updateVisual(delta: number, bounds: Phaser.Geom.Rectangle): void {
    if (!this.target) return;

    const dx = this.target.x - this.sprite.x;
    const dy = this.target.y - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 3) {
      this.sprite.setPosition(this.target.x, this.target.y);
      this.target = null;
      return;
    }

    const step = WALK_SPEED * (delta / 1000);
    const ratio = Math.min(step / dist, 1);
    const newX = this.sprite.x + dx * ratio;
    const newY = this.sprite.y + dy * ratio;

    this.sprite.setPosition(
      Phaser.Math.Clamp(newX, bounds.x + 16, bounds.x + bounds.width - 16),
      Phaser.Math.Clamp(newY, bounds.y + 20, bounds.y + bounds.height - 10),
    );

    if (Math.abs(dx) > Math.abs(dy)) {
      this.directionIndicator.setRotation(dx > 0 ? Math.PI / 2 : -Math.PI / 2);
    } else {
      this.directionIndicator.setRotation(dy > 0 ? Math.PI : 0);
    }
  }
}
