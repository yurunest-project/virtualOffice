import { RoomId } from "../store/roomStore";

export interface ZoneDefinition {
  id: RoomId;
  label: string;
  color: number;
  alpha: number;
  // Normalized coordinates within office area (0-1)
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ZONES: ZoneDefinition[] = [
  {
    id: "work",
    label: "仕事場",
    color: 0x4a90d9,
    alpha: 0.55,
    x: 0.02,
    y: 0.15,
    width: 0.3,
    height: 0.75,
  },
  {
    id: "study",
    label: "自習室",
    color: 0x7b68ee,
    alpha: 0.55,
    x: 0.35,
    y: 0.15,
    width: 0.3,
    height: 0.75,
  },
  {
    id: "break",
    label: "休憩所",
    color: 0x50c878,
    alpha: 0.55,
    x: 0.68,
    y: 0.15,
    width: 0.3,
    height: 0.75,
  },
];

export function getZoneCenter(
  zoneId: RoomId,
  officeX: number,
  officeY: number,
  officeWidth: number,
  officeHeight: number,
): { x: number; y: number } {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone) {
    return {
      x: officeX + officeWidth / 2,
      y: officeY + officeHeight / 2,
    };
  }
  return {
    x: officeX + (zone.x + zone.width / 2) * officeWidth,
    y: officeY + (zone.y + zone.height / 2) * officeHeight,
  };
}

export function getZoneAtPoint(
  zones: ZoneDefinition[],
  officeX: number,
  officeY: number,
  officeWidth: number,
  officeHeight: number,
  pointX: number,
  pointY: number,
): RoomId | null {
  const localX = (pointX - officeX) / officeWidth;
  const localY = (pointY - officeY) / officeHeight;

  if (localX < 0 || localX > 1 || localY < 0 || localY > 1) {
    return null;
  }

  for (const zone of zones) {
    if (
      localX >= zone.x &&
      localX <= zone.x + zone.width &&
      localY >= zone.y &&
      localY <= zone.y + zone.height
    ) {
      return zone.id;
    }
  }
  return null;
}
