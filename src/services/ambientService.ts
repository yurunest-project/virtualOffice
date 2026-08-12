import { useSettingsStore } from "../store/settingsStore";
import { RoomId } from "../store/roomStore";
import {
  BgmPresetId,
  DEFAULT_ROOM_BGM,
  getPresetFile,
} from "./bgmPresets";

class AmbientManager {
  private audio: HTMLAudioElement | null = null;
  private currentRoom: RoomId | null = null;
  private currentPreset: BgmPresetId | null = null;
  private onEnded: (() => void) | null = null;
  private onTimeUpdate: (() => void) | null = null;
  private watchdogId: ReturnType<typeof setInterval> | null = null;

  private syncVolume(): void {
    if (!this.audio) return;
    const { bgmEnabled, bgmVolume } = useSettingsStore.getState();
    this.audio.volume = bgmVolume;
    if (bgmEnabled) {
      void this.audio.play().catch(() => {
        // autoplay may be blocked until user interaction
      });
    } else {
      this.audio.pause();
    }
  }

  setVolume(volume: number): void {
    useSettingsStore.getState().setBgmVolume(volume);
    this.syncVolume();
  }

  setEnabled(enabled: boolean): void {
    useSettingsStore.getState().setBgmEnabled(enabled);
    if (enabled && this.currentRoom) {
      this.playRoom(this.currentRoom, true);
    } else {
      this.syncVolume();
    }
  }

  setRoomPreset(room: RoomId, preset: BgmPresetId): void {
    useSettingsStore.getState().setRoomBgmPreset(room, preset);
    if (this.currentRoom === room) {
      this.playRoom(room, true);
    }
  }

  setRoom(room: RoomId): void {
    this.currentRoom = room;
    this.playRoom(room, false);
  }

  refresh(): void {
    if (this.currentRoom) {
      this.playRoom(this.currentRoom, true);
    }
  }

  resumeAfterUserGesture(): void {
    this.syncVolume();
  }

  private playRoom(room: RoomId, force: boolean): void {
    const settings = useSettingsStore.getState();
    const preset =
      settings.roomBgmPresets[room] ?? DEFAULT_ROOM_BGM[room] ?? "office";

    if (!force && this.currentRoom === room && this.currentPreset === preset) {
      this.syncVolume();
      return;
    }

    this.currentPreset = preset;

    if (!settings.bgmEnabled || preset === "none") {
      this.stopAudio();
      return;
    }

    const file = getPresetFile(preset);
    if (!file) {
      this.stopAudio();
      return;
    }

    const currentSrc = this.audio?.getAttribute("src") ?? "";
    if (!force && currentSrc.endsWith(file)) {
      this.syncVolume();
      return;
    }

    this.startAudio(file);
  }

  private startAudio(file: string): void {
    this.stopAudio();

    const audio = new Audio(file);
    audio.preload = "auto";
    audio.loop = true;
    this.audio = audio;
    this.bindLoopGuards(audio);
    this.syncVolume();
  }

  private bindLoopGuards(audio: HTMLAudioElement): void {
    this.clearLoopGuards();

    const restartFromStart = () => {
      if (this.audio !== audio) return;
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    };

    this.onEnded = () => restartFromStart();
    this.onTimeUpdate = () => {
      if (this.audio !== audio || !Number.isFinite(audio.duration)) return;
      if (audio.duration > 0 && audio.duration - audio.currentTime < 0.12) {
        restartFromStart();
      }
    };

    audio.addEventListener("ended", this.onEnded);
    audio.addEventListener("timeupdate", this.onTimeUpdate);

    this.watchdogId = setInterval(() => {
      if (this.audio !== audio) return;
      const { bgmEnabled } = useSettingsStore.getState();
      if (!bgmEnabled) return;
      if (audio.paused && audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        void audio.play().catch(() => {});
      }
    }, 2500);
  }

  private clearLoopGuards(): void {
    if (this.audio) {
      if (this.onEnded) {
        this.audio.removeEventListener("ended", this.onEnded);
      }
      if (this.onTimeUpdate) {
        this.audio.removeEventListener("timeupdate", this.onTimeUpdate);
      }
    }
    if (this.watchdogId) {
      clearInterval(this.watchdogId);
      this.watchdogId = null;
    }
    this.onEnded = null;
    this.onTimeUpdate = null;
  }

  private stopAudio(): void {
    this.clearLoopGuards();
    if (!this.audio) return;
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.audio = null;
  }

  destroy(): void {
    this.stopAudio();
    this.currentRoom = null;
    this.currentPreset = null;
  }
}

export const ambientManager = new AmbientManager();
