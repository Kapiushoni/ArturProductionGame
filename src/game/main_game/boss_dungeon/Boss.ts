// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Enemy } from '@/game/main_game/character/Enemy';

export class Boss extends Enemy {
  constructor(text, characterConfigData, num) {
          super(text,characterConfigData,num); num = Number(num);
      }
}
bindMethods(Boss);
