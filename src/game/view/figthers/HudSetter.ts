import { app } from '@/game/app';
import type { Fighter } from '@/game/main_game/character/Fighter';
import type { Stats } from '@/game/main_game/character/stats/Stats';
import type { MovieClip } from '@/flash/as3';

export class HudSetter {
  constructor() {}
  setNameAndLevel(clip: MovieClip, fighter: Fighter) {
    clip.player_name.title.text = fighter.getNameToShow();
    clip.level.title.text = app.locale.get('enemy_level', [fighter.stats.getLevel()]);
  }
  setHud(clip: MovieClip, stats: Stats = null) {
    if (stats == null) {
      clip.player_name.title.text = '';
      clip.level.title.text = '';
    }
  }
}
