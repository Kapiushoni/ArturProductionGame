import { ExternalInterface, bindMethods } from '@/flash/as3';
import { Appender } from '@/game/cb/logger/Appender';

/** Writes to the browser console (through ExternalInterface, when available). */
export class JSConsoleAppender extends Appender {
  log(text: string) {
    if (ExternalInterface.available) {
      ExternalInterface.call('console.log', text);
    }
  }
}
bindMethods(JSConsoleAppender);
