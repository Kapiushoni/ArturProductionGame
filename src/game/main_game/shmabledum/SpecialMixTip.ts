// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BubbleGumTip } from '@/game/main_game/shmabledum/BubbleGumTip';
import { main } from '@/game/main';

export class SpecialMixTip extends BubbleGumTip {
  constructor(item) {
          super(main.locale.get("pbSpecialMixEnd",[item.getNameToShow()]),item);
      }
}
bindMethods(SpecialMixTip);
