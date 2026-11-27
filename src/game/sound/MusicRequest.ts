import { bindMethods } from '@/flash/as3';

/** A music to play: name, start time (ms) and volume (-1: its own). */
export class MusicRequest {
  private soundName: string;
  startTime: number;
  volume: number;

  constructor(soundName: string, startTime: number, volume: number) {
    this.soundName = soundName;
    this.startTime = Number(startTime);
    this.volume = Number(volume);
  }
  equal(other: MusicRequest): boolean {
    return this.soundName == other.getName() && this.startTime == other.startTime && this.volume == other.volume;
  }
  getName(): string {
    return this.soundName;
  }
}
bindMethods(MusicRequest, ['equal']);
