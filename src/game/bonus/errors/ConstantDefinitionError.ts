import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

/** Bad number. */
export class ConstantDefinitionError extends GenericError {
  constructor(message: string, line: number) {
    super(LexicalParser.fileName, message, line);
  }
}
