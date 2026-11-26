// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';

export class WaitingForEndArrayStringDefinition extends BaseState {
  constructor(text, text2, baseState = null) {
          super(text,text2,baseState);
      }
  onMisc(text) { const __self = this;
         if(text == ",")
         {
            __self.constantDefinition(LexicalParser.ARRAY,__self.value);
            return new ArrayDefinition(__self.name,__self.parent);
         }
         if(text == "}")
         {
            __self.stream.ungetc();
            __self.constantDefinition(LexicalParser.ARRAY,__self.value);
            return new ArrayDefinition(__self.name,__self.parent);
         }
         return this;
      }
  onSpace(text) {
         return this;
      }
}
bindMethods(WaitingForEndArrayStringDefinition);
