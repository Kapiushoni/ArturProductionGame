import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { WaitingForAttributeError } from '@/game/bonus/errors/WaitingForAttributeError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { AttributeDefinition } from '@/game/bonus/states/AttributeDefinition';
import { PossibleComment } from '@/game/bonus/states/PossibleComment';
import { WaitingForClass } from '@/game/bonus/states/WaitingForClass';
import { WaitingForConstant } from '@/game/bonus/states/WaitingForConstant';

/** Inside a block: waits for an attribute name or "}" (inside an array: returns to it). */
export class WaitingForAttribute extends BaseState {
  constructor(parent: BaseState = null) {
    super(null, null, parent);
  }
  onSpace(_char: string): BaseState {
    return this;
  }
  onMisc(char: string): BaseState {
    if (char == '}') {
      if (this.parent) {
        this.stream.ungetc();
        return this.parent;
      }
      this.dispatchEvent(new ParseEvent(LexicalParser.END_CLASS));
      return new WaitingForClass();
    }
    if (char == ',') {
      return new WaitingForConstant(null, this.parent);
    }
    if (char == '/') {
      return new PossibleComment(this);
    }
    throw new WaitingForAttributeError(char, this.stream.getLineNumber());
  }
  onLetter(_char: string): BaseState {
    this.stream.ungetc();
    return new AttributeDefinition();
  }
}
bindMethods(WaitingForAttribute);
