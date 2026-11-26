// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

export class WaitingForAttributeError extends GenericError {
  constructor(text, num) {
          super(LexicalParser.fileName,"Expected Attribute at " + text,num); num = int(num);
      }
}
bindMethods(WaitingForAttributeError);
