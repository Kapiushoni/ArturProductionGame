// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';

export class GenericError extends Error {
  constructor(text, text2, num) {
          super(text + ":" + num + ": " + text2 + ".",1); num = int(num);
      }
}
bindMethods(GenericError);
