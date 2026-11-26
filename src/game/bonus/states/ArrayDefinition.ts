// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayClassConstantDefinition } from '@/game/bonus/states/ArrayClassConstantDefinition';
import { ArrayConstantDefinition } from '@/game/bonus/states/ArrayConstantDefinition';
import { ArrayStringDefinition } from '@/game/bonus/states/ArrayStringDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

export class ArrayDefinition extends BaseState {
  constructor(text, baseState = null) {
          super(text,"",baseState);
      }
  onMisc(text) { const __self = this;
         var event = null;
         if(text == "}")
         {
            event = new ParseEvent(LexicalParser.END_ARRAY);
            event.name = __self.name;
            event.value = __self.value;
            event.valueType = LexicalParser.ARRAY;
            __self.dispatchEvent(event);
            return new WaitingForAttribute(__self.parent);
         }
         if(text == "{")
         {
            __self.dispatchEvent(new ParseEvent(LexicalParser.START_ARRAY));
            return new ArrayDefinition(__self.name,this);
         }
         if(text == "\"" || text == "\'")
         {
            return new ArrayStringDefinition(text,__self.name,__self.parent);
         }
         if(text == "-" && __self.value == "")
         {
            return this.onDigit(text);
         }
         if(text == "/")
         {
            return new PossibleComment(this);
         }
         return null;
      }
  onLetter(text) { const __self = this;
         __self.stream.ungetc();
         return new ArrayClassConstantDefinition(__self.name,__self.parent);
      }
  onDigit(text) { const __self = this;
         __self.stream.ungetc();
         return new ArrayConstantDefinition(__self.name,__self.parent);
      }
  onSpace(text) {
         return this;
      }
}
bindMethods(ArrayDefinition);
