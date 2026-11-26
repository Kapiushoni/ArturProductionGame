// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { main } from '@/game/main';

export class HudSetter {
  constructor() {
         
      }
  setNameAndLevel(clip, fighter) {
         clip.player_name.title.text = fighter.getNameToShow();
         clip.level.title.text = main.locale.get("enemy_level",[fighter.stats.getLevel()]);
      }
  setHud(clip, stats = null) {
         if(stats == null)
         {
            clip.player_name.title.text = "";
            clip.level.title.text = "";
         }
      }
}
bindMethods(HudSetter);
