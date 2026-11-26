// @ts-nocheck
import { SharedObject, as3keys, bindMethods, getQualifiedClassName } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';

export class SharedUtils {
  static readonly logger = Log.getLogger(getQualifiedClassName(SharedUtils));
  constructor() {
         
      }
  static load(text, text2) {
         var so = null;
         var cookie = text;
         var property = text2;
         try
         {
            so = SharedObject.getLocal(cookie);
            return so.data[property];
         }
         catch(e)
         {
            SharedUtils.logger.log(e.toString());
         }
         return null;
      }
  static saveBulk(text, obj) {
         var so = null;
         var save = false;
         var property = null;
         var value = undefined;
         var cookie = text;
         var toSave = obj;
         try
         {
            so = SharedObject.getLocal(cookie);
            save = false;
            for (property of as3keys(toSave))
            {
               save = true;
               value = toSave[property];
               so.data[property] = value;
            }
            if(save)
            {
               so.flush();
            }
            return true;
         }
         catch(e)
         {
            SharedUtils.logger.log(e.toString());
         }
         return false;
      }
  static save(text, text2, value2) {
         var so = null;
         var cookie = text;
         var property = text2;
         var value = value2;
         try
         {
            so = SharedObject.getLocal(cookie);
            so.data[property] = value;
            so.flush();
            return true;
         }
         catch(e)
         {
            SharedUtils.logger.log(e.toString());
         }
         return false;
      }
  static clear(text) {
         var so = null;
         var cookie = text;
         try
         {
            so = SharedObject.getLocal(cookie);
            so.clear();
            return true;
         }
         catch(e)
         {
            SharedUtils.logger.log(e.toString());
         }
         return false;
      }
}
bindMethods(SharedUtils);
