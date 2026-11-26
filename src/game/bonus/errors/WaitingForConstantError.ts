// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';

export class WaitingForConstantError extends Error {
  constructor(text, text2, num) {
          super(text + ":" + num + ": Expected Constant. " + text2 + ".",1); num = int(num);
      }
}
bindMethods(WaitingForConstantError);
