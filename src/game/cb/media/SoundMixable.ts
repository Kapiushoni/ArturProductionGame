/** A sound player (see cbSoundMixer). */
export interface SoundMixable {
  mute(): void;
  unmute(): void;
  isMuted(): boolean;
  play(name: string, start?: number, loop?: boolean, volume?: number): any;
  stop(name: string): void;
}
