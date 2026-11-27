import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

/** Expected "{" after a block name. */
export class WaitingForEndClassError extends GenericError {
  constructor(char: string, line: number) {
    super(LexicalParser.fileName, 'Expected { but Found ' + char, line);
  }
}
