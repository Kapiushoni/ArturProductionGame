// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

export class WaitingForEndClassError extends GenericError {
  constructor(text, num) {
          super(LexicalParser.fileName,"Expected { but Found " + text,num); num = int(num);
      }
}
bindMethods(WaitingForEndClassError);
