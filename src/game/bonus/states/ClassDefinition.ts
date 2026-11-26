// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinitionError } from '@/game/bonus/errors/ClassDefinitionError';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';
import { WaitingForEndClass } from '@/game/bonus/states/WaitingForEndClass';

export class ClassDefinition extends BaseState {
  constructor() {
          super("");
      }
  onLetter(text) { const __self = this;
         return __self.addToName(text);
      }
  onDigit(text) { const __self = this;
         if(__self.name == "")
         {
            throw new ClassDefinitionError("Class names start with letters",__self.stream.getLineNumber());
         }
         return __self.addToName(text);
      }
  onSpace(text) { const __self = this;
         __self.classNameDefinition(__self.name);
         return new WaitingForEndClass();
      }
  onMisc(text) { const __self = this;
         if(text == "{")
         {
            __self.classNameDefinition(__self.name);
            return new WaitingForAttribute();
         }
         if(text == "_")
         {
            return this.onLetter(text);
         }
         throw new ClassDefinitionError("Class names can\'t contain [" + text + "] character",__self.stream.getLineNumber());
      }
}
bindMethods(ClassDefinition);
