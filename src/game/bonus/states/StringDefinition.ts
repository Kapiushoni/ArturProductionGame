// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

export class StringDefinition extends BaseState {
  declare startSymbol: any;
  constructor(startSymbol, text) {
          super(text,"");
         this.startSymbol = startSymbol;
      }
  onMisc(text) { const __self = this;
         if(text == this.startSymbol)
         {
            __self.constantDefinition(LexicalParser.STRING,__self.value);
            return new WaitingForAttribute();
         }
         if(text == "}")
         {
            __self.stream.ungetc();
            __self.constantDefinition(LexicalParser.STRING,__self.value);
            return new WaitingForAttribute();
         }
         __self.value += text;
         return this;
      }
  onLetter(text) { const __self = this;
         __self.value += text;
         return this;
      }
  onDigit(text) { const __self = this;
         __self.value += text;
         return this;
      }
  onSpace(text) { const __self = this;
         __self.value += text;
         return this;
      }
}
StringDefinition.prototype.startSymbol = null;
bindMethods(StringDefinition);
