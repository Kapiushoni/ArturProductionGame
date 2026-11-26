// @ts-nocheck
import { EventDispatcher, bindMethods, int } from '@/flash/as3';
import { GenericError } from '@/game/bonus/errors/GenericError';
import { ParseEvent } from '@/game/bonus/events/ParseEvent';
import { LexicalParser } from '@/game/bonus/LexicalParser';
// import cycle (these modules need this one at load time): resolved through the index, used only at run time
import { PossibleComment } from '@/game/index';

export class BaseState extends EventDispatcher {
  declare stream: any;
  declare name: any;
  declare value: any;
  declare parent: any;
  constructor(name = null, value = null, parent = null) {
          super();
         this.name = name;
         this.value = value;
         this.parent = parent;
      }
  onLetter(text) {
         this.error(text);
         return null;
      }
  onSpace(text) {
         this.error(text);
         return null;
      }
  onMisc(text) {
         if(text == "/")
         {
            return new PossibleComment(this);
         }
         this.error(text);
         return null;
      }
  onDigit(text) {
         this.error(text);
         return null;
      }
  process(stream) {
         this.stream = stream;
         var text = stream.getc();
         var num = int(text.charCodeAt(0));
         if(num >= 65 && num <= 90 || num >= 97 && num <= 122)
         {
            return this.onLetter(text);
         }
         if(num >= 48 && num <= 57)
         {
            return this.onDigit(text);
         }
         if(num == 10 || num == 9 || num == 13 || num == 32)
         {
            return this.onSpace(text);
         }
         return this.onMisc(text);
      }
  constantDefinition(num, obj) { num = int(num); const __self = this;
         var event = new ParseEvent(LexicalParser.END_ATTRIBUTE);
         event.name = this.name;
         event.value = obj;
         event.valueType = num;
         __self.dispatchEvent(event);
      }
  classNameDefinition(text) { const __self = this;
         var event = new ParseEvent(LexicalParser.START_PARSING_CLASS);
         event.name = text;
         __self.dispatchEvent(event);
      }
  addToValue(text) {
         this.value += text;
         return this;
      }
  addToName(text) {
         this.name += text;
         return this;
      }
  error(text) {
         throw new GenericError(LexicalParser.fileName,"Generic error. unexpected char \'" + text + "\'",this.stream.getLineNumber());
      }
}
BaseState.prototype.stream = null;
BaseState.prototype.name = null;
BaseState.prototype.value = null;
BaseState.prototype.parent = null;
bindMethods(BaseState);
