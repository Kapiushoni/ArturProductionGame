import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayClassConstantDefinition } from '@/game/bonus/states/ArrayClassConstantDefinition';
import { ArrayConstantDefinition } from '@/game/bonus/states/ArrayConstantDefinition';
import { ArrayStringDefinition } from '@/game/bonus/states/ArrayStringDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

/** Inside {array}: waits for the next element or "}". */
export class ArrayDefinition extends BaseState {
  constructor(name: string, parent: BaseState = null) {
    super(name, '', parent);
  }
  onMisc(char: string): BaseState {
    if (char == '}') {
      const event = new ParseEvent(LexicalParser.END_ARRAY);
      event.name = this.name;
      event.value = this.value;
      event.valueType = LexicalParser.ARRAY;
      this.dispatchEvent(event);
      return new WaitingForAttribute(this.parent);
    }
    if (char == '{') {
      this.dispatchEvent(new ParseEvent(LexicalParser.START_ARRAY));
      return new ArrayDefinition(this.name, this);
    }
    if (char == '"' || char == "'") {
      return new ArrayStringDefinition(char, this.name, this.parent);
    }
    if (char == '-' && this.value == '') {
      return this.onDigit(char);
    }
    if (char == '/') {
      return new PossibleComment(this);
    }
    return null;
  }
  onLetter(_char: string): BaseState {
    this.stream.ungetc();
    return new ArrayClassConstantDefinition(this.name, this.parent);
  }
  onDigit(_char: string): BaseState {
    this.stream.ungetc();
    return new ArrayConstantDefinition(this.name, this.parent);
  }
  onSpace(_char: string): BaseState {
    return this;
  }
}
bindMethods(ArrayDefinition);
