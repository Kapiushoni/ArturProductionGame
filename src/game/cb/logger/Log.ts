// @ts-nocheck
import { Dictionary, as3values, bindMethods } from '@/flash/as3';

export class Log {
  static loggers = new Dictionary();
  declare appenders: any;
  declare name: any;
  constructor(name) {
         
         this.appenders = [];
         this.name = name;
      }
  static getLogger(text) {
         if(Log.loggers.get(text) == undefined)
         {
            Log.loggers.set(text, new Log(text));
         }
         return Log.loggers.get(text);
      }
  addAppender(appender) {
         this.appenders.push(appender);
      }
  log(... rest) {
         var appender = null;
         for (appender of as3values(this.appenders))
         {
            appender.log("[" + this.name + "] " + rest.join(""));
         }
      }
}
Log.prototype.appenders = null;
Log.prototype.name = null;
bindMethods(Log);
