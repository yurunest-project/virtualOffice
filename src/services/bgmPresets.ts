import { RoomId } from "../store/roomStore";

export type BgmPresetId =
  | "river"
  | "cafe"
  | "rain"
  | "forest"
  | "office"
  | "wave"
  | "musicbox"
  | "lullaby"
  | "meditation"
  | "soft_piano"
  | "relaxation"
  | "nature_calm"
  | "none";

export interface BgmPresetOption {
  id: BgmPresetId;
  label: string;
  description: string;
  file?: string;
  credit: string;
}

export const BGM_PRESET_OPTIONS: BgmPresetOption[] = [
  {
    id: "river",
    label: "川のせせらぎ",
    description: "やわらかな流水",
    file: "/bgm/river.mp3",
    credit: "Mixkit",
  },
  {
    id: "wave",
    label: "波のせせらぎ",
    description: "海辺の波の音",
    file: "/bgm/wave.mp3",
    credit: "Mixkit",
  },
  {
    id: "cafe",
    label: "カフェ",
    description: "店内の話し声",
    file: "/bgm/cafe.mp3",
    credit: "Mixkit",
  },
  {
    id: "rain",
    label: "雨",
    description: "穏やかな雨音",
    file: "/bgm/rain.mp3",
    credit: "Mixkit",
  },
  {
    id: "forest",
    label: "森",
    description: "自然の環境音",
    file: "/bgm/forest.mp3",
    credit: "Mixkit",
  },
  {
    id: "office",
    label: "オフィス",
    description: "作業向けの環境音",
    file: "/bgm/office.mp3",
    credit: "Mixkit",
  },
  {
    id: "meditation",
    label: "やすらぎの瞑想",
    description: "静かで落ち着いたアンビエント",
    file: "/bgm/meditation.mp3",
    credit: "Mixkit",
  },
  {
    id: "soft_piano",
    label: "静かなピアノ",
    description: "穏やかなピアノの調べ",
    file: "/bgm/piano-calm.mp3",
    credit: "Mixkit",
  },
  {
    id: "relaxation",
    label: "リラックス",
    description: "ゆったりした休息向けの音楽",
    file: "/bgm/relaxation.mp3",
    credit: "Mixkit",
  },
  {
    id: "nature_calm",
    label: "自然の調べ",
    description: "自然を感じる穏やかな音楽",
    file: "/bgm/nature-calm.mp3",
    credit: "Mixkit",
  },
  {
    id: "musicbox",
    label: "オルゴール",
    description: "やさしいオルゴール風メロディ",
    file: "/bgm/musicbox.mp3",
    credit: "Mixkit",
  },
  {
    id: "lullaby",
    label: "オルゴール（子守歌）",
    description: "やわらかな子守歌のオルゴール",
    file: "/bgm/lullaby.mp3",
    credit: "Mixkit",
  },
  {
    id: "none",
    label: "なし",
    description: "BGM を再生しない",
    credit: "-",
  },
];

export const BGM_FILES: Record<Exclude<BgmPresetId, "none">, string> = {
  river: "/bgm/river.mp3",
  wave: "/bgm/wave.mp3",
  cafe: "/bgm/cafe.mp3",
  rain: "/bgm/rain.mp3",
  forest: "/bgm/forest.mp3",
  office: "/bgm/office.mp3",
  meditation: "/bgm/meditation.mp3",
  soft_piano: "/bgm/piano-calm.mp3",
  relaxation: "/bgm/relaxation.mp3",
  nature_calm: "/bgm/nature-calm.mp3",
  musicbox: "/bgm/musicbox.mp3",
  lullaby: "/bgm/lullaby.mp3",
};

export const DEFAULT_ROOM_BGM: Record<RoomId, BgmPresetId> = {
  work: "cafe",
  study: "river",
  break: "meditation",
};

export function getPresetFile(preset: BgmPresetId): string | null {
  if (preset === "none") return null;
  return BGM_FILES[preset] ?? null;
}

export function getPresetLabel(preset: BgmPresetId): string {
  return BGM_PRESET_OPTIONS.find((o) => o.id === preset)?.label ?? preset;
}
