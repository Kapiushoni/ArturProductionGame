// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Fight } from '@/game/main_game/dungeon/Fight';

export class BossFight extends Fight {
  constructor(boss) {
          super(boss,true);
      }
}
bindMethods(BossFight);
