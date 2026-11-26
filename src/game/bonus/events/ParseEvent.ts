// @ts-nocheck
import { Event, bindMethods } from '@/flash/as3';

export class ParseEvent extends Event {
  declare name: any;
  declare value: any;
  declare valueType: any;
  constructor(text) {
          super(text);
      }
  clone() {
         var event = new ParseEvent(type);
         event.name = this.name;
         event.value = this.value;
         event.valueType = this.valueType;
         return event;
      }
}
ParseEvent.prototype.name = null;
ParseEvent.prototype.value = null;
ParseEvent.prototype.valueType = 0;
bindMethods(ParseEvent);
