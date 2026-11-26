// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinitionError } from '@/game/bonus/errors/ClassDefinitionError';
import { WaitingForConstant } from '@/game/bonus/states/WaitingForConstant';

export class AttributeDefinition extends BaseState {
  constructor() {
          super("");
      }
  onLetter(text) { const __self = this;
         return __self.addToName(text);
      }
  onSpace(text) {
         return this;
      }
  onMisc(text) { const __self = this;
         if(text == "=")
         {
            return new WaitingForConstant(__self.name);
         }
         if(text == "_")
         {
            return __self.addToName(text);
         }
         throw new ClassDefinitionError("Variable names can\'t contain [" + text + "] character",__self.stream.getLineNumber());
      }
  onDigit(text) { const __self = this;
         if(__self.name == "")
         {
            throw new ClassDefinitionError("Variable names start with letters",__self.stream.getLineNumber());
         }
         return __self.addToName(text);
      }
}
bindMethods(AttributeDefinition);
