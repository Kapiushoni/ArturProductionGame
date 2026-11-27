import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';

/** After a string in an array: waits for "," or "}". */
export class WaitingForEndArrayStringDefinition extends BaseState {
  constructor(name: string, value: string, parent: BaseState = null) {
    super(name, value, parent);
  }
  onMisc(char: string): BaseState {
    if (char == ',') {
      this.constantDefinition(LexicalParser.ARRAY, this.value);
      return new ArrayDefinition(this.name, this.parent);
    }
    if (char == '}') {
      this.stream.ungetc();
      this.constantDefinition(LexicalParser.ARRAY, this.value);
      return new ArrayDefinition(this.name, this.parent);
    }
    return this;
  }
  onSpace(_char: string): BaseState {
    return this;
  }
}
bindMethods(WaitingForEndArrayStringDefinition);
