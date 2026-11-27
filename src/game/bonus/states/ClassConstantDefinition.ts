import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinitionError } from '@/game/bonus/errors/ClassDefinitionError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

/** A name as a value: true / false, or a reference to another block. */
export class ClassConstantDefinition extends BaseState {
  constructor(name: string) {
    super(name, '');
  }
  onLetter(char: string): BaseState {
    return this.addToValue(char);
  }
  onSpace(_char: string): BaseState {
    this.endConstantDef();
    return new WaitingForAttribute();
  }
  onDigit(char: string): BaseState {
    if (this.value == '') {
      throw new ClassDefinitionError('Class names start with letters', this.stream.getLineNumber());
    }
    return this.addToValue(char);
  }
  onMisc(char: string): BaseState {
    if (char == '}') {
      this.stream.ungetc();
      this.endConstantDef();
      return new WaitingForAttribute();
    }
    throw new ClassDefinitionError("Class names can't contain [" + char + '] character', this.stream.getLineNumber());
  }
  endConstantDef() {
    const event = new ParseEvent(LexicalParser.END_ATTRIBUTE);
    event.name = this.name;
    event.value = this.value;
    if (this.value == 'true' || this.value == 'false') {
      event.value = this.value == 'true';
    } else {
      event.valueType = LexicalParser.CLASS;
    }
    this.dispatchEvent(event);
  }
}
bindMethods(ClassConstantDefinition);
