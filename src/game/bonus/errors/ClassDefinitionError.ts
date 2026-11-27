import { GenericError } from '@/game/bonus/errors/GenericError';
import { LexicalParser } from '@/game/bonus/LexicalParser';

/** Bad block or attribute name. */
export class ClassDefinitionError extends GenericError {
  constructor(message: string, line: number) {
    super(LexicalParser.fileName, message, line);
  }
}
