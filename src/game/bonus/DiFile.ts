/**
 * Parser of the .di format (config.di, dailyBonus.di):
 *
 *   // comment, /* comment *\/
 *   Name {
 *     int = 12  float = 1.5  text = "a b" (or 'a b')  flag = true
 *     ref = Other                      a copy of the block Other (it may come later in the file)
 *     list = { 1, "a", Other, { 2 } }  numbers, strings, booleans, references, arrays
 *   }
 *
 * parseDi(text, fileName) returns block name -> plain object. Syntax errors throw "file:line: message.".
 */
export function parseDi(text: string, fileName: string): Map<string, any> {
  const builder = new Builder();
  new Lexer(text, fileName, builder).file();
  return builder.blocks;
}

/** How the values are put together (the order matters for references, see resolve()). */
class Builder {
  readonly blocks = new Map<string, any>();
  private block: any = null;
  private blockName: string = null;
  /** attribute name -> reference still waiting for its block (one per attribute name, as in the original) */
  private references = new Map<string, { target: string; block: string; attr: string }>();
  /** references inside arrays still waiting for their block */
  private arrayReferences: { target: string; block: string; attr: string; pos: number }[] = [];
  /** arrays being read (nested arrays) */
  private arrays: any[][] = [];

  startBlock(name: string) {
    this.blockName = name;
    this.block = {};
  }
  endBlock() {
    this.blocks.set(this.blockName, clone(this.block));
    this.resolve();
  }
  value(name: string, value: any) {
    if (this.arrays.length) this.arrays[this.arrays.length - 1].push(value);
    else this.block[name] = value;
  }
  reference(name: string, target: string) {
    if (this.arrays.length) {
      const array = this.arrays[this.arrays.length - 1];
      this.arrayReferences.push({ target, block: this.blockName, attr: name, pos: array.length });
      array.push({});
    } else {
      this.references.set(name, { target, block: this.blockName, attr: name });
      this.block[name] = {};
    }
  }
  startArray() {
    this.arrays.push([]);
  }
  endArray(name: string) {
    const array = clone(this.arrays.pop());
    if (this.arrays.length) this.arrays[this.arrays.length - 1].push(array);
    else this.block[name] = array;
  }
  /** every reference whose block exists now gets a copy of it */
  private resolve() {
    for (const [attr, r] of [...this.references]) {
      if (this.blocks.has(r.target)) {
        this.blocks.get(r.block)[r.attr] = clone(this.blocks.get(r.target));
        this.references.delete(attr);
      }
    }
    this.arrayReferences = this.arrayReferences.filter((r) => {
      if (!this.blocks.has(r.target)) return true;
      this.blocks.get(r.block)[r.attr][r.pos] = clone(this.blocks.get(r.target));
      return false;
    });
  }
}

const clone = (v: any): any => (v !== null && typeof v == 'object' ? structuredClone(v) : v);

const NAME_START = /[A-Za-z_]/;
const NAME = /[A-Za-z0-9_]/;
const NUMBER = /[-0-9.]/;

class Lexer {
  private pos = 0;
  private line = 1;

  constructor(
    private text: string,
    private fileName: string,
    private out: Builder,
  ) {}

  file() {
    for (this.skip(); this.pos < this.text.length; this.skip()) {
      this.out.startBlock(this.name('block name'));
      this.skip();
      this.expect('{');
      for (this.skip(); this.peek() != '}'; this.skip()) {
        if (this.pos >= this.text.length) this.error('end of input inside block');
        const attr = this.name('attribute name');
        this.skip();
        this.expect('=');
        this.skip();
        this.value(attr);
      }
      this.pos++;
      this.out.endBlock();
    }
  }

  /** a value of an attribute or an array element */
  private value(attr: string) {
    const c = this.peek();
    if (c == '{') {
      this.pos++;
      this.out.startArray();
      for (this.skip(); this.peek() != '}'; this.skip()) {
        this.value(attr);
        this.skip();
        if (this.peek() == ',') this.pos++;
        else if (this.peek() != '}') this.error(`expected "," or "}", got "${this.peek()}"`);
      }
      this.pos++;
      this.out.endArray(attr);
    } else if (c == '"' || c == "'") {
      const end = this.text.indexOf(c, this.pos + 1);
      if (end < 0) this.error('unterminated string');
      const s = this.text.slice(this.pos + 1, end);
      this.line += s.split('\n').length - 1;
      this.pos = end + 1;
      this.out.value(attr, s);
    } else if (NUMBER.test(c)) {
      const start = this.pos;
      while (NUMBER.test(this.peek())) this.pos++;
      const s = this.text.slice(start, this.pos);
      if (!/^-?\d*(\.\d*)?$/.test(s)) this.error(`bad number "${s}"`);
      this.out.value(attr, s.includes('.') ? Number(s) : Number(s) | 0);
    } else if (NAME_START.test(c)) {
      const name = this.name('value');
      if (name == 'true' || name == 'false') this.out.value(attr, name == 'true');
      else this.out.reference(attr, name);
    } else {
      this.error(c ? `unexpected "${c}"` : 'end of input, expected a value');
    }
  }

  private name(what: string): string {
    if (!NAME_START.test(this.peek())) this.error(`expected a ${what}, got "${this.peek()}"`);
    const start = this.pos;
    while (NAME.test(this.peek())) this.pos++;
    return this.text.slice(start, this.pos);
  }

  /** skips spaces and comments */
  private skip() {
    for (;;) {
      const c = this.peek();
      if (c == '\n') this.line++;
      if (c == ' ' || c == '\t' || c == '\r' || c == '\n') this.pos++;
      else if (this.text.startsWith('//', this.pos)) {
        const end = this.text.indexOf('\n', this.pos);
        this.pos = end < 0 ? this.text.length : end;
      } else if (this.text.startsWith('/*', this.pos)) {
        const end = this.text.indexOf('*/', this.pos + 2);
        if (end < 0) this.error('unterminated comment');
        this.line += this.text.slice(this.pos, end).split('\n').length - 1;
        this.pos = end + 2;
      } else return;
    }
  }

  private expect(c: string) {
    if (this.peek() != c) this.error(`expected "${c}", got "${this.peek() || 'end of input'}"`);
    this.pos++;
  }

  private peek(): string {
    return this.text.charAt(this.pos);
  }

  private error(message: string): never {
    throw new Error(`${this.fileName}:${this.line}: ${message}.`);
  }
}

/** A parsed .di file: get("Name") is the block "Name" as a plain object. */
export class DiFile {
  private blocks: Map<string, any>;

  /** file: { name, data } (a FileLoader, or a text for the tests) */
  constructor(file: { name: string; data: any }) {
    this.blocks = parseDi(String(file.data), file.name);
  }
  get(name: string): any {
    return this.blocks.get(name);
  }
}
