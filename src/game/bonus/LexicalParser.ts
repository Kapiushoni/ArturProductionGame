import { EventDispatcher, as3is, bindMethods } from '@/flash/as3';
import { WaitingForAttributeError } from '@/game/bonus/errors/WaitingForAttributeError';
import { FileStream } from '@/game/bonus/FileStream';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';
import { WaitingForClass } from '@/game/bonus/states/WaitingForClass';
import type { BaseState } from '@/game/bonus/states/BaseState';

/**
 * Parser of the .di format (config.di, dailyBonus.di):
 *   Name { attr = 12  f = 1.5  s = "text"  b = true  ref = OtherBlock  list = { 1, "a", Other, { 2 } } }
 * with // and /* *\/ comments. A state machine (bonus/states): each state reads one character and returns
 * the next state. Results come out as ParseEvents (see ClassLoader, which builds the objects).
 */
export class LexicalParser extends EventDispatcher {
  /** for error messages */
  static fileName: string = null;
  static readonly START_PARSING_CLASS = 'StartParsingClass';
  static readonly END_CLASS = 'EndClass';
  static readonly END_ATTRIBUTE = 'EndAttribute';
  static readonly START_ARRAY = 'StartArray';
  static readonly END_ARRAY = 'EndArray';
  static readonly INTEGER = 0;
  static readonly FLOAT = 1;
  static readonly STRING = 2;
  static readonly BOOLEAN = 3;
  static readonly CLASS = 4;
  static readonly ARRAY = 5;
  static readonly CLASSARRAY = 6;
  private stream: FileStream = null;
  private state: BaseState;

  constructor(fileName: string) {
    super();
    this.state = new WaitingForClass();
    this.registerListeners(this.state);
    LexicalParser.fileName = fileName;
  }
  /** forwards the events of a state */
  registerListeners(state: BaseState) {
    for (const type of [
      LexicalParser.START_PARSING_CLASS,
      LexicalParser.END_CLASS,
      LexicalParser.END_ATTRIBUTE,
      LexicalParser.START_ARRAY,
      LexicalParser.END_ARRAY,
    ]) {
      state.addEventListener(type, this.eventDispatch, false, 0, true);
    }
  }
  eventDispatch(event: any) {
    this.dispatchEvent(event);
  }
  parse(text: string) {
    this.stream = new FileStream(text);
    while (this.stream.hasData()) {
      this.state = this.state.process(this.stream);
      this.registerListeners(this.state);
    }
    if (as3is(this.state, WaitingForAttribute)) {
      throw new WaitingForAttributeError('End of input', this.stream.getLineNumber());
    }
  }
}
bindMethods(LexicalParser);
