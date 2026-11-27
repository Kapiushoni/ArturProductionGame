import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

/** A "/" that does not start a comment. */
export class CommentError extends GenericError {
  constructor(char: string, line: number) {
    super(LexicalParser.fileName, "Expected '/' or '*' to start comment, but got" + char + '.', line);
  }
}
