// @ts-nocheck
import { EventDispatcher, as3is, bindMethods, int } from '@/flash/as3';
import { WaitingForAttributeError } from '@/game/bonus/errors/WaitingForAttributeError';
import { FileStream } from '@/game/bonus/FileStream';
import { WaitingForAttribute } from '@/game/bonus/states/WaitingForAttribute';
import { WaitingForClass } from '@/game/bonus/states/WaitingForClass';

export class LexicalParser extends EventDispatcher {
  static fileName = null;
  static readonly START_PARSING_CLASS = "StartParsingClass";
  static readonly END_CLASS = "EndClass";
  static readonly END_ATTRIBUTE = "EndAttribute";
  static readonly START_ARRAY = "StartArray";
  static readonly END_ARRAY = "EndArray";
  static readonly INTEGER = int(0);
  static readonly FLOAT = int(1);
  static readonly STRING = int(2);
  static readonly BOOLEAN = int(3);
  static readonly CLASS = int(4);
  static readonly ARRAY = int(5);
  static readonly CLASSARRAY = int(6);
  declare stream: any;
  declare state: any;
  constructor(text) {
          super();
         this.state = new WaitingForClass();
         this.registerListeners(this.state);
         LexicalParser.fileName = text;
      }
  registerListeners(baseState) {
         baseState.addEventListener(LexicalParser.START_PARSING_CLASS,this.eventDispatch,false,0,true);
         baseState.addEventListener(LexicalParser.END_CLASS,this.eventDispatch,false,0,true);
         baseState.addEventListener(LexicalParser.END_ATTRIBUTE,this.eventDispatch,false,0,true);
         baseState.addEventListener(LexicalParser.START_ARRAY,this.eventDispatch,false,0,true);
         baseState.addEventListener(LexicalParser.END_ARRAY,this.eventDispatch,false,0,true);
      }
  eventDispatch(event) { const __self = this;
         __self.dispatchEvent((event));
      }
  parse(text) {
         var text2 = null;
         this.stream = new FileStream(text);
         while(this.stream.hasData())
         {
            this.state = this.state.process(this.stream);
            this.registerListeners(this.state);
         }
         if(as3is(this.state, WaitingForAttribute))
         {
            throw new WaitingForAttributeError("End of input",this.stream.getLineNumber());
         }
      }
}
LexicalParser.prototype.stream = null;
LexicalParser.prototype.state = null;
bindMethods(LexicalParser);
