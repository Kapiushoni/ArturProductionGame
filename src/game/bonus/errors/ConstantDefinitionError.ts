// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

export class ConstantDefinitionError extends GenericError {
  constructor(text, num) {
          super(LexicalParser.fileName,text,num); num = int(num);
      }
}
bindMethods(ConstantDefinitionError);
