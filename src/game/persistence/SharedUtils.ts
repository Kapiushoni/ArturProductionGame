import { SharedObject, as3keys, bindMethods, getQualifiedClassName } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';

/** Read/write of saved values (a SharedObject "cookie" = one localStorage entry); errors are logged, not thrown. */
export class SharedUtils {
  static readonly logger = Log.getLogger(getQualifiedClassName(SharedUtils));

  static load(cookie: string, property: string): any {
    try {
      return SharedObject.getLocal(cookie).data[property];
    } catch (e) {
      SharedUtils.logger.log(e.toString());
    }
    return null;
  }
  /** saves several properties at once (writes only if there is something to save) */
  static saveBulk(cookie: string, values: Record<string, any>): boolean {
    try {
      const so = SharedObject.getLocal(cookie);
      let changed = false;
      for (const property of as3keys(values)) {
        changed = true;
        so.data[property] = values[property];
      }
      if (changed) {
        so.flush();
      }
      return true;
    } catch (e) {
      SharedUtils.logger.log(e.toString());
    }
    return false;
  }
  static save(cookie: string, property: string, value: any): boolean {
    try {
      const so = SharedObject.getLocal(cookie);
      so.data[property] = value;
      so.flush();
      return true;
    } catch (e) {
      SharedUtils.logger.log(e.toString());
    }
    return false;
  }
  static clear(cookie: string): boolean {
    try {
      SharedObject.getLocal(cookie).clear();
      return true;
    } catch (e) {
      SharedUtils.logger.log(e.toString());
    }
    return false;
  }
}
bindMethods(SharedUtils);
