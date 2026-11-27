import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { WaitingForConstantError } from '@/game/bonus/errors/WaitingForConstantError';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';
import { ClassConstantDefinition } from '@/game/bonus/states/ClassConstantDefinition';
import { ConstantDefinition } from '@/game/bonus/states/ConstantDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';
import { StringDefinition } from '@/game/bonus/states/StringDefinition';

/** After "=": a number, "string", {array}, or a name (another block / true / false). */
export class WaitingForConstant extends BaseState {
  constructor(name: string, parent: BaseState = null) {
    super(name, null, parent);
  }
  onDigit(_char: string): BaseState {
    this.stream.ungetc();
    return new ConstantDefinition(this.name);
  }
  onSpace(_char: string): BaseState {
    return this;
  }
  onMisc(char: string): BaseState {
    if (char == '"' || char == "'") {
      return new StringDefinition(char, this.name);
    }
    if (char == '{') {
      this.dispatchEvent(new ParseEvent(LexicalParser.START_ARRAY));
      return new ArrayDefinition(this.name, this.parent);
    }
    if (char == '-') {
      this.stream.ungetc();
      return new ConstantDefinition(this.name);
    }
    if (char == '/') {
      return new PossibleComment(this);
    }
    throw new WaitingForConstantError(LexicalParser.fileName, "got a '" + char + "'", this.stream.getLineNumber());
  }
  onLetter(_char: string): BaseState {
    this.stream.ungetc();
    return new ClassConstantDefinition(this.name);
  }
}
bindMethods(WaitingForConstant);
