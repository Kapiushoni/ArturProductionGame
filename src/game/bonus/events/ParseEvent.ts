import { Event, bindMethods } from '@/flash/as3';

/** What the .di parser read: a block start / end, an attribute (name, value, valueType), an array start / end. */
export class ParseEvent extends Event {
  name: string = null;
  value: any = null;
  /** LexicalParser.INTEGER / FLOAT / STRING / BOOLEAN / CLASS / ARRAY / CLASSARRAY */
  valueType = 0;

  constructor(type: string) {
    super(type);
  }
  clone(): ParseEvent {
    const event = new ParseEvent(this.type);
    event.name = this.name;
    event.value = this.value;
    event.valueType = this.valueType;
    return event;
  }
}
bindMethods(ParseEvent);
