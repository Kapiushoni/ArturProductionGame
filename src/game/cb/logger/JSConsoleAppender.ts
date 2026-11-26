// @ts-nocheck
import { ExternalInterface, bindMethods } from '@/flash/as3';
import { Appender } from '@/game/cb/logger/Appender';

export class JSConsoleAppender extends Appender {
  constructor() {
          super();
      }
  log(text) {
         if(ExternalInterface.available)
         {
            ExternalInterface.call("console.log",text);
         }
      }
}
bindMethods(JSConsoleAppender);
