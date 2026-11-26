// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { WaitingForAttributeError } from '@/game/bonus/errors/WaitingForAttributeError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { AttributeDefinition } from '@/game/bonus/states/AttributeDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';
import { WaitingForClass } from '@/game/bonus/states/WaitingForClass';
import { WaitingForConstant } from '@/game/bonus/states/WaitingForConstant';

export class WaitingForAttribute extends BaseState {
  constructor(baseState = null) {
          super(null,null,baseState);
      }
  onSpace(text) {
         return this;
      }
  onMisc(text) { const __self = this;
         var event = null;
         if(text == "}")
         {
            if(__self.parent)
            {
               __self.stream.ungetc();
               return __self.parent;
            }
            event = new ParseEvent(LexicalParser.END_CLASS);
            __self.dispatchEvent(event);
            return new WaitingForClass();
         }
         if(text == ",")
         {
            return new WaitingForConstant(null,__self.parent);
         }
         if(text == "/")
         {
            return new PossibleComment(this);
         }
         throw new WaitingForAttributeError(text,__self.stream.getLineNumber());
      }
  onLetter(text) { const __self = this;
         __self.stream.ungetc();
         return new AttributeDefinition();
      }
}
bindMethods(WaitingForAttribute);
