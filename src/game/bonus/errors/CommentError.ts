// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

export class CommentError extends GenericError {
  constructor(text, num) {
          super(LexicalParser.fileName,"Expected \'/\' or \'*\' to start comment, but got" + text + ".",num); num = int(num);
      }
}
bindMethods(CommentError);
