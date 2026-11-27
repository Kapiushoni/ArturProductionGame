import { Dictionary, as3values, bindMethods } from '@/flash/as3';
import type { Appender } from '@/game/cb/logger/Appender';

/** A named logger: "[name] message" to each of its appenders. One per name (Log.getLogger). */
export class Log {
  static loggers: any = new Dictionary();
  private appenders: Appender[];
  private name: string;

  constructor(name: string) {
    this.appenders = [];
    this.name = name;
  }
  static getLogger(name: string): Log {
    if (Log.loggers.get(name) == undefined) {
      Log.loggers.set(name, new Log(name));
    }
    return Log.loggers.get(name);
  }
  addAppender(appender: Appender) {
    this.appenders.push(appender);
  }
  log(...parts: any[]) {
    for (const appender of as3values(this.appenders)) {
      appender.log('[' + this.name + '] ' + parts.join(''));
    }
  }
}
bindMethods(Log);
