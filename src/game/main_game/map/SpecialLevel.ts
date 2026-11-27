import { bindMethods } from '@/flash/as3';
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
    if (this.getDungeonId() == '26') {
      return 1;
    }
    if (this.getDungeonId() == '27') {
      return 2;
    }
    return 3;
  }
}
bindMethods(SpecialLevel);
