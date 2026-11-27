import { services } from '@/game/services';
import { Level } from '@/game/main_game/map/Level';

/** The side dungeons 26-30 (branches of the main path). */
export class SpecialLevel extends Level {
  isSpecial(): boolean {
    return true;
  }
  getName(): string {
    return services.texts.get('specialDungeonName');
  }
  getArea(): number {
    if (this.dungeonId == '26') {
      return 1;
    }
    if (this.dungeonId == '27') {
      return 2;
    }
    return 3;
  }
}
