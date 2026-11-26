// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinitionError } from '@/game/bonus/errors/ClassDefinitionError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';

export class ArrayClassConstantDefinition extends BaseState {
  constructor(text, baseState = null) {
          super(text,"",baseState);
      }
  onLetter(text) { const __self = this;
         return __self.addToValue(text);
      }
  onDigit(text) { const __self = this;
         if(__self.value == "")
         {
            throw new ClassDefinitionError("Class names start with letters",__self.stream.getLineNumber());
         }
         return __self.addToValue(text);
      }
  onMisc(text) { const __self = this;
         if(text == "}")
         {
            __self.stream.ungetc();
            this.endClassDef();
            return new ArrayDefinition(__self.name,__self.parent);
         }
         if(text == ",")
         {
            this.endClassDef();
            return new ArrayDefinition(__self.name,__self.parent);
         }
         if(text == "/")
         {
            return new PossibleComment(this);
         }
         if(text == "=")
         {
            throw new ClassDefinitionError("Class names can only be formed with letters and digits",__self.stream.getLineNumber());
         }
         return null;
      }
  onSpace(text) {
         return this;
      }
  endClassDef() { const __self = this;
         var event = new ParseEvent(LexicalParser.END_ATTRIBUTE);
         event.name = __self.name;
         event.value = __self.value;
         if(__self.value == "true" || __self.value == "false")
         {
            event.valueType = LexicalParser.ARRAY;
            event.value = __self.value == "true";
         }
         else
         {
            event.valueType = LexicalParser.CLASSARRAY;
         }
         __self.dispatchEvent(event);
      }
}
bindMethods(ArrayClassConstantDefinition);
