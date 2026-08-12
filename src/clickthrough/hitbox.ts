export interface Hitbox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const hitboxes = new Map<string, Hitbox>();

export function setHitbox(box: Hitbox): void {
  hitboxes.set(box.id, box);
}

export function removeHitbox(id: string): void {
  hitboxes.delete(id);
}

export function clearHitboxes(): void {
  hitboxes.clear();
}

export function getHitboxes(): Hitbox[] {
  return Array.from(hitboxes.values());
}

export function isInHitbox(screenX: number, screenY: number): boolean {
  // CoreGraphics returns logical screen coordinates (same as CSS pixels).
  const x = screenX;
  const y = screenY;

  for (const box of hitboxes.values()) {
    if (
      x >= box.x &&
      x <= box.x + box.width &&
      y >= box.y &&
      y <= box.y + box.height
    ) {
      return true;
    }
  }
  return false;
}

export function updateOfficeHitbox(
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  setHitbox({ id: "office-map", x, y, width, height });
}

export function updatePanelHitbox(
  id: string,
  element: HTMLElement | null,
): void {
  if (!element) {
    removeHitbox(id);
    return;
  }
  const rect = element.getBoundingClientRect();
  setHitbox({
    id,
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  });
}

export function updateElementHitbox(id: string, element: HTMLElement | null): void {
  updatePanelHitbox(id, element);
}
