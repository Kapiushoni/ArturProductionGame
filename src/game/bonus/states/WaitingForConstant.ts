// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { WaitingForConstantError } from '@/game/bonus/errors/WaitingForConstantError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';
import { ClassConstantDefinition } from '@/game/bonus/states/ClassConstantDefinition';
import { ConstantDefinition } from '@/game/bonus/states/ConstantDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';
import { StringDefinition } from '@/game/bonus/states/StringDefinition';

export class WaitingForConstant extends BaseState {
  constructor(text, baseState = null) {
          super(text,null,baseState);
      }
  onDigit(text) { const __self = this;
         __self.stream.ungetc();
         return new ConstantDefinition(__self.name);
      }
  onSpace(text) {
         return this;
      }
  onMisc(text) { const __self = this;
         if(text == "\"" || text == "\'")
         {
            return new StringDefinition(text,__self.name);
         }
         if(text == "{")
         {
            __self.dispatchEvent(new ParseEvent(LexicalParser.START_ARRAY));
            return new ArrayDefinition(__self.name,__self.parent);
         }
         if(text == "-")
         {
            __self.stream.ungetc();
            return new ConstantDefinition(__self.name);
         }
         if(text == "/")
         {
            return new PossibleComment(this);
         }
         throw new WaitingForConstantError(LexicalParser.fileName,"got a \'" + text + "\'",__self.stream.getLineNumber());
      }
  onLetter(text) { const __self = this;
         __self.stream.ungetc();
         return new ClassConstantDefinition(__self.name);
      }
}
bindMethods(WaitingForConstant);
