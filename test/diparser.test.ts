import { describe, it, expect } from 'vitest';
import { GM } from './helpers';

const { ClassLoader } = GM;

/** parses a .di text (the format of config.di / dailyBonus.di) */
const parse = (text: string) => new ClassLoader({ name: 'test.di', data: text });

const SAMPLE = `
// a one-line comment
Config {
  count = 3
  ratio = 0.5
  neg = -2
  title = "Hello world"
  single = 'single quoted'
  on = true
  off = false
  child = Other
  list = { 1, 2.5, "x", -3 }
  /* a comment
     on several lines */
  names = { "a", "b" }
  refs = { Other, true }
}

Other {
  v = 7
}
`;

describe('.di parser (ClassLoader)', () => {
  const loader = parse(SAMPLE);
  const config = loader.get('Config');

  it('numbers, strings, booleans', () => {
    expect(config.count).toBe(3);
    expect(config.ratio).toBe(0.5);
    expect(config.neg).toBe(-2);
    expect(config.title).toBe('Hello world');
    expect(config.single).toBe('single quoted');
    expect(config.on).toBe(true);
    expect(config.off).toBe(false);
  });

  it('a reference to another block is replaced by a copy of it (even if it comes later)', () => {
    expect(config.child).toEqual({ v: 7 });
    expect(loader.get('Other')).toEqual({ v: 7 });
  });

  it('arrays of numbers, strings, references and booleans', () => {
    expect(config.list).toEqual([1, 2.5, 'x', -3]);
    expect(config.names).toEqual(['a', 'b']);
    expect(config.refs).toEqual([{ v: 7 }, true]);
  });

  it('several references inside arrays, to blocks declared later', () => {
    const l = parse('A { list = { B, 1, C, B } }\nB { v = 1 }\nC { v = 2 }');
    expect(l.get('A').list).toEqual([{ v: 1 }, 1, { v: 2 }, { v: 1 }]);
  });

  it('getCopy() returns an independent copy', () => {
    const copy = loader.getCopy('Config');
    copy.list.push(99);
    expect(loader.get('Config').list).toHaveLength(4);
  });

  it('a value right before "}" is still read', () => {
    expect(parse('A {\n x = 5}').get('A')).toEqual({ x: 5 });
    expect(parse('A{ s = "q"}').get('A')).toEqual({ s: 'q' });
  });

  it('syntax errors are reported with the file name and line', () => {
    expect(() => parse('A {\n x = 1\n 2bad = 3\n}')).toThrow(/test\.di:3/);
    expect(() => parse('A {\n x = 1\n')).toThrow();
  });
});
