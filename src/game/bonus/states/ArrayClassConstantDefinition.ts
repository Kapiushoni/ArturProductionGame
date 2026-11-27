import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { ClassDefinitionError } from '@/game/bonus/errors/ClassDefinitionError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { ArrayDefinition } from '@/game/bonus/states/ArrayDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';

/** A name in an array: true / false, or a reference to another block. */
export class ArrayClassConstantDefinition extends BaseState {
  constructor(name: string, parent: BaseState = null) {
    super(name, '', parent);
  }
  onLetter(char: string): BaseState {
    return this.addToValue(char);
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
      this.endClassDef();
      return new ArrayDefinition(this.name, this.parent);
    }
    if (char == ',') {
      this.endClassDef();
      return new ArrayDefinition(this.name, this.parent);
    }
    if (char == '/') {
      return new PossibleComment(this);
    }
    if (char == '=') {
      throw new ClassDefinitionError(
        'Class names can only be formed with letters and digits',
        this.stream.getLineNumber(),
      );
    }
    return null;
  }
  onSpace(_char: string): BaseState {
    return this;
  }
  endClassDef() {
    const event = new ParseEvent(LexicalParser.END_ATTRIBUTE);
    event.name = this.name;
    event.value = this.value;
    if (this.value == 'true' || this.value == 'false') {
      event.valueType = LexicalParser.ARRAY;
      event.value = this.value == 'true';
    } else {
      event.valueType = LexicalParser.CLASSARRAY;
    }
    this.dispatchEvent(event);
  }
}
bindMethods(ArrayClassConstantDefinition);
