import { bindMethods } from '@/flash/as3';

/** Where a Log writes (this one: nowhere). */
export class Appender {
  log(_text: string) {}
}
bindMethods(Appender);
