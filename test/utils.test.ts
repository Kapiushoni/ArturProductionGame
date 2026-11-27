import { describe, it, expect, afterEach, vi } from 'vitest';
import { GM, randomSequence } from './helpers';

const { Signal, Rule, ProbabilisticSet, Random, CsvLoader } = GM;

afterEach(() => vi.restoreAllMocks());

describe('Signal', () => {
  it('calls listeners in order with the emitted arguments', () => {
    const s = new Signal();
    const calls: string[] = [];
    s.add((a: number, b: number) => calls.push(`first ${a} ${b}`));
    s.addAtFirst(() => calls.push('zero'));
    s.emit(1, 2);
    expect(calls).toEqual(['zero', 'first 1 2']);
  });

  it('removed listeners are not called; listeners added during emit wait for the next emit', () => {
    const s = new Signal();
    const late = vi.fn();
    const removed = vi.fn();
    s.add(() => s.add(late));
    s.add(removed);
    s.remove(removed);
    s.emit();
    expect(late).not.toHaveBeenCalled();
    expect(removed).not.toHaveBeenCalled();
    s.emit();
    expect(late).toHaveBeenCalledTimes(1);
  });
});

describe('Lambda', () => {
  it('passes the clip and its parameters, the same on every call', () => {
    const calls: any[] = [];
    const action = new GM.Lambda((...args: any[]) => calls.push(args), 'a', 'b');
    action.execute('clip1');
    action.execute('clip2');
    expect(calls).toEqual([
      ['clip1', 'a', 'b'],
      ['clip2', 'a', 'b'],
    ]);
  });
});

describe('Rule', () => {
  it('completes when every condition has been checked', () => {
    const done = vi.fn();
    const r = new Rule('a', 'b');
    r.completed.add(done);
    r.check('a');
    expect(done).not.toHaveBeenCalled();
    expect(r.reason()).toEqual(['b is false']);
    r.check('b');
    expect(done).toHaveBeenCalledTimes(1);
    expect(r.isCompleted()).toBe(true);
  });
});

describe('ProbabilisticSet', () => {
  it('picks by weight and pop() removes the picked element', () => {
    const set = new ProbabilisticSet();
    set.add('common', 3);
    set.add('rare', 1);
    randomSequence(0.8); // 0.8 * 4 = 3.2 -> past "common" (3) -> "rare"
    expect(set.getElement()).toBe('rare');
    expect(set.pop()).toBe('rare');
    expect(set.length).toBe(1);
    expect(set.totalProb).toBe(3);
    expect(set.contains('common')).toBe(true);
  });
});

describe('Random', () => {
  it('nextRange includes both ends', () => {
    randomSequence(0);
    expect(Random.nextRange(3, 6)).toBe(3);
    vi.restoreAllMocks();
    randomSequence(0.9999);
    expect(Random.nextRange(3, 6)).toBe(6);
  });
});

describe('CsvLoader', () => {
  const load = (text: string) => {
    const csv = new CsvLoader('table.csv');
    csv.load({
      get: () =>
        class {
          toString() {
            return text;
          }
        },
    });
    return csv;
  };

  it('splits lines and cells, skipping empty lines', () => {
    const csv = load('id,a,b\nx,1,2\n\ny,3,4\n');
    expect(csv.getLines()).toBe(3);
    expect(csv.getColumns()).toBe(3);
    expect(csv.get(2, 3)).toBe('2');
  });

  it('converts rows to objects: numbers, null, nested "a.b" columns', () => {
    const rows = load('id,Name,Mod.Category,Mod.Value\nsword,Sword,A,5\nnone,null,null,abc\n').convertToObjects();
    expect(rows.get('sword')).toEqual({ Name: 'Sword', Mod: { Category: 'A', Value: 5 } });
    expect(rows.get('none')).toEqual({ Name: null, Mod: { Category: null, Value: 'abc' } });
  });
});

describe('Locale', () => {
  const locale = (text: string) => {
    const l = new GM.Locale('texts.txt');
    l.load({
      get: () =>
        class {
          toString() {
            return text;
          }
        },
    });
    return l;
  };

  it('"key: text" lines; $1, $2 are replaced by the parameters; "$$1" stays literal', () => {
    const l = locale('hello: Hello $1, you have $2 items\ntime: 10:30\nprice: costs $$1');
    expect(l.get('hello', ['Finn', 3])).toBe('Hello Finn, you have 3 items');
    expect(l.get('time')).toBe('10:30');
    expect(l.get('price', [])).toBe('costs $1');
    expect(l.get('nope')).toBe('missing key [nope]');
  });
});

describe('cbArray', () => {
  it('like an AS3 Array: new cbArray(n) has n slots, otherwise holds the arguments', () => {
    expect(new GM.cbArray(3).length).toBe(3);
    expect([...new GM.cbArray('a', 'b')]).toEqual(['a', 'b']);
    expect(() => new GM.cbArray(1.5)).toThrow(RangeError);
  });

  it('helpers', () => {
    const a = GM.cbArray.createFromArray([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(a.findFirstOfField(2, 'id')).toEqual({ id: 2 });
    a.remove(2, 'id');
    expect(a.map((x: any) => x.id)).toEqual([1, 3]);
    const b = GM.cbArray.createFromArray([1, 2, 2, 3]);
    b.pushIfNotPresent(3);
    b.pushIfNotPresent(4);
    expect([...b.subtract([2, 4])]).toEqual([1, 2, 3]);
  });
});
