import { EventDispatcher, bindMethods, int } from '@/flash/as3';
import { GenericError } from '@/game/bonus/errors/GenericError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import type { FileStream } from '@/game/bonus/FileStream';
// import cycle (these modules need this one at load time): resolved through the index, used only at run time
import { PossibleComment } from '@/game/index';

/**
 * A state of the .di parser. process() reads one character and returns the next state
 * (by default every character is an error; "/" may start a comment). States report what they read
 * with ParseEvents (see LexicalParser).
 */
export class BaseState extends EventDispatcher {
  protected stream: FileStream = null;
  /** name of the block / attribute being read */
  name: string;
  /** text of the value being read */
  value: any;
  /** state to return to (after a comment, or the array we are in) */
  protected parent: BaseState;

  constructor(name: string = null, value: any = null, parent: BaseState = null) {
    super();
    this.name = name;
    this.value = value;
    this.parent = parent;
  }
  onLetter(char: string): BaseState {
    this.error(char);
    return null;
  }
  onSpace(char: string): BaseState {
    this.error(char);
    return null;
  }
  onMisc(char: string): BaseState {
    if (char == '/') {
      return new PossibleComment(this);
    }
    this.error(char);
    return null;
  }
  onDigit(char: string): BaseState {
    this.error(char);
    return null;
  }
  process(stream: FileStream): BaseState {
    this.stream = stream;
    const char = stream.getc();
    const code = int(char.charCodeAt(0));
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      return this.onLetter(char);
    }
    if (code >= 48 && code <= 57) {
      return this.onDigit(char);
    }
    if (code == 10 || code == 9 || code == 13 || code == 32) {
      return this.onSpace(char);
    }
    return this.onMisc(char);
  }
  /** an attribute value has been read */
  constantDefinition(valueType: number, value: any) {
    const event = new ParseEvent(LexicalParser.END_ATTRIBUTE);
    event.name = this.name;
    event.value = value;
    event.valueType = int(valueType);
    this.dispatchEvent(event);
  }
  /** a block starts */
  classNameDefinition(name: string) {
    const event = new ParseEvent(LexicalParser.START_PARSING_CLASS);
    event.name = name;
    this.dispatchEvent(event);
  }
  addToValue(char: string): BaseState {
    this.value += char;
    return this;
  }
  addToName(char: string): BaseState {
    this.name += char;
    return this;
  }
  error(char: string) {
    throw new GenericError(
      LexicalParser.fileName,
      "Generic error. unexpected char '" + char + "'",
      this.stream.getLineNumber(),
    );
  }
}
bindMethods(BaseState);
