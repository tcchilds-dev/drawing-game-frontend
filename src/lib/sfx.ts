export type SoundEffectId =
  | "gameStart"
  | "drawingStart"
  | "timeoutMissed"
  | "correctGuess"
  | "gameEnd"
  | "leaveRoom";

type SoundEffectConfig = {
  src: string;
  volume: number;
};

// Drop your audio files in drawing-game-frontend/public/sfx/.
// Example: public/sfx/game-start.mp3 -> "/sfx/game-start.mp3"
export const MASTER_SFX_VOLUME = 0.2;

export const SFX_CONFIG: Record<SoundEffectId, SoundEffectConfig> = {
  gameStart: { src: "/sfx/game-start.mp3", volume: 0.2 },
  drawingStart: { src: "/sfx/drawing-start.mp3", volume: 0.2 },
  timeoutMissed: { src: "/sfx/timeout-missed.mp3", volume: 0.2 },
  correctGuess: { src: "/sfx/correct-guess.mp3", volume: 0.1 },
  gameEnd: { src: "/sfx/game-end.mp3", volume: 0.2 },
  leaveRoom: { src: "/sfx/leave-room.mp3", volume: 0.1 },
};

function clampVolume(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function playSfx(id: SoundEffectId): void {
  if (typeof window === "undefined") return;

  const config = SFX_CONFIG[id];
  const audio = new Audio(config.src);
  audio.volume = clampVolume(MASTER_SFX_VOLUME * config.volume);

  void audio.play().catch((error: unknown) => {
    if (import.meta.env.DEV) {
      console.debug(`SFX '${id}' could not be played`, error);
    }
  });
}
