// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { CommentError } from '@/game/bonus/errors/CommentError';
import { MultipleLineComment } from '@/game/bonus/states/MultipleLineComment';
import { OneLineComment } from '@/game/bonus/states/OneLineComment';

export class PossibleComment extends BaseState {
  constructor(baseState) {
          super(null,null,baseState);
      }
  onMisc(text) { const __self = this;
         if(text == "*")
         {
            return new MultipleLineComment(__self.parent);
         }
         if(text == "/")
         {
            return new OneLineComment(__self.parent);
         }
         throw new CommentError(text,__self.stream.getLineNumber());
      }
}
bindMethods(PossibleComment);
