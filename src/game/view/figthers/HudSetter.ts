import { bindMethods } from '@/flash/as3';
import { main } from '@/game/main';
import type { Fighter } from '@/game/main_game/character/Fighter';
import type { Stats } from '@/game/main_game/character/stats/Stats';

export class HudSetter {
  constructor() {}
  setNameAndLevel(clip: any, fighter: Fighter) {
    clip.player_name.title.text = fighter.getNameToShow();
    clip.level.title.text = main.locale.get('enemy_level', [fighter.stats.getLevel()]);
  }
  setHud(clip: any, stats: Stats = null) {
    if (stats == null) {
      clip.player_name.title.text = '';
      clip.level.title.text = '';
    }
  }
}
bindMethods(HudSetter);
