// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class SaveError extends Error {
  constructor(value = "", value2 = 0) {
          super(value,value2);
      }
}
bindMethods(SaveError);
