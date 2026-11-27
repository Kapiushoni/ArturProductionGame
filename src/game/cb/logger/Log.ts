import { bindMethods } from '@/flash/as3';

/**
 * A named logger: log(...) writes "[name] message" to the browser console when Log.enabled is on
 * (off by default: in the original the messages went to a Flash debug console that the web does not have).
 */
export class Log {
  static enabled = false;
  private static loggers = new Map<string, Log>();

  private constructor(private name: string) {}

  /** one logger per name */
  static getLogger(name: string): Log {
    let logger = Log.loggers.get(name);
    if (!logger) Log.loggers.set(name, (logger = new Log(name)));
    return logger;
  }
  log(...parts: any[]) {
    if (Log.enabled) console.log('[' + this.name + '] ' + parts.join(''));
  }
}
bindMethods(Log);
