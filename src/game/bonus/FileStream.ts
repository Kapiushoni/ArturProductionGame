import { bindMethods, int } from '@/flash/as3';

/** Reads a text one character at a time, counting lines. */
export class FileStream {
  private file: string;
  private pos = 0;
  private line = 1;

  constructor(file: string) {
    this.file = file;
  }
  hasData(): boolean {
    return this.file.charAt(this.pos) != '';
  }
  getLineNumber(): number {
    return int(this.line);
  }
  getc(): string {
    const char = this.file.charAt(this.pos);
    ++this.pos;
    if (char == '\n') {
      ++this.line;
    }
    return char;
  }
  /** steps back one character */
  ungetc() {
    --this.pos;
    if (this.file.charAt(this.pos) == '\n') {
      --this.line;
    }
    if (this.pos < 0) {
      this.pos = 0;
    }
  }
}
bindMethods(FileStream);
