import { bindMethods } from '@/flash/as3';
import { BaseState } from '@/game/bonus/states/BaseState';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';

/** A quoted string, until the same quote (or "}"). */
export class StringDefinition extends BaseState {
  private startSymbol: string;

  constructor(startSymbol: string, name: string) {
    super(name, '');
    this.startSymbol = startSymbol;
  }
  onMisc(char: string): BaseState {
    if (char == this.startSymbol) {
      this.constantDefinition(LexicalParser.STRING, this.value);
      return new WaitingForAttribute();
    }
    if (char == '}') {
      this.stream.ungetc();
      this.constantDefinition(LexicalParser.STRING, this.value);
      return new WaitingForAttribute();
    }
    return this.addToValue(char);
  }
  onLetter(char: string): BaseState {
    return this.addToValue(char);
  }
  onDigit(char: string): BaseState {
    return this.addToValue(char);
  }
  onSpace(char: string): BaseState {
    return this.addToValue(char);
  }
}
bindMethods(StringDefinition);
