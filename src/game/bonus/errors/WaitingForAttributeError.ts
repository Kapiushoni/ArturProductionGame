import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

/** Expected an attribute (or the end of the block). */
export class WaitingForAttributeError extends GenericError {
  constructor(char: string, line: number) {
    super(LexicalParser.fileName, 'Expected Attribute at ' + char, line);
  }
}
