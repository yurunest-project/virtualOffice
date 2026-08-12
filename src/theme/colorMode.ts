import { RoomId } from "../store/roomStore";

export type ColorMode = "cool" | "warm";

export interface OfficePalette {
  floor: number;
  floorAlpha: number;
  stroke: number;
  title: string;
  titleStroke: string;
  divider: number;
  zoneStroke: number;
  characterBody: number;
  characterHead: number;
  tints: Record<RoomId, { color: number; alpha: number }>;
  zones: Record<RoomId, { color: number; alpha: number }>;
}

const COOL: OfficePalette = {
  floor: 0x22223a,
  floorAlpha: 0.9,
  stroke: 0xc5d4ee,
  title: "#eef2f8",
  titleStroke: "#2a3048",
  divider: 0xc5d4ee,
  zoneStroke: 0xe8eef8,
  characterBody: 0x7eafd4,
  characterHead: 0xffe0c8,
  tints: {
    work: { color: 0xe8f0ff, alpha: 0.08 },
    study: { color: 0xe4f2ff, alpha: 0.1 },
    break: { color: 0xe8fff4, alpha: 0.07 },
  },
  zones: {
    work: { color: 0x5b8fc7, alpha: 0.38 },
    study: { color: 0x7a8fd4, alpha: 0.36 },
    break: { color: 0x6bb89a, alpha: 0.36 },
  },
};

const WARM: OfficePalette = {
  floor: 0x4a382c,
  floorAlpha: 0.92,
  stroke: 0xf0dcc4,
  title: "#faf3ea",
  titleStroke: "#4a3428",
  divider: 0xf0dcc4,
  zoneStroke: 0xfff4e8,
  characterBody: 0xe8a87c,
  characterHead: 0xffe4cc,
  tints: {
    work: { color: 0xffe8cc, alpha: 0.12 },
    study: { color: 0xfff0d8, alpha: 0.1 },
    break: { color: 0xe8f5d8, alpha: 0.08 },
  },
  zones: {
    work: { color: 0xc4895a, alpha: 0.4 },
    study: { color: 0xd4a06a, alpha: 0.38 },
    break: { color: 0x8faf7a, alpha: 0.38 },
  },
};

export function getOfficePalette(mode: ColorMode): OfficePalette {
  return mode === "warm" ? WARM : COOL;
}

export function applyColorModeToDocument(
  mode: ColorMode,
  doc: Document = document,
): void {
  doc.documentElement.dataset.colorMode = mode;
}
