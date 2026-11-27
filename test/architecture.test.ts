import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// The game logic must not depend on the application (main), the screens (view) or the tutorial:
// it gets what it needs through services.ts or as constructor / method arguments.
const SRC = join(__dirname, '..', 'src', 'game');
const LOGIC = ['main_game', 'bonus', 'persistence'];
const FORBIDDEN = [/from '@\/game\/main'/, /from '@\/game\/view\//, /from '@\/game\/tutorial\//];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}

describe('architecture', () => {
  it('the game logic does not import main, the views or the tutorial', () => {
    const offenders: string[] = [];
    for (const dir of LOGIC) {
      for (const file of files(join(SRC, dir))) {
        const lines = readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, i) => {
          if (/^import /.test(line) && FORBIDDEN.some((re) => re.test(line))) {
            offenders.push(`${relative(SRC, file)}:${i + 1}: ${line}`);
          }
        });
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the game logic does not work with clips (that is the views' job)", () => {
    const offenders: string[] = [];
    for (const dir of LOGIC) {
      for (const file of files(join(SRC, dir))) {
        readFileSync(file, 'utf8')
          .split('\n')
          .forEach((line, i) => {
            if (/\.(gotoAndStop|gotoAndPlay|addChild|removeChild)\(/.test(line)) {
              offenders.push(`${relative(SRC, file)}:${i + 1}: ${line.trim()}`);
            }
          });
      }
    }
    expect(offenders).toEqual([]);
  });

  it('only main imports main: the other modules use app.ts / services.ts', () => {
    const offenders = files(SRC)
      .filter((f) => !/[\\/](main|index)\.ts$/.test(f))
      .filter((f) => /^import \{[^}]*\} from '@\/game\/main';/m.test(readFileSync(f, 'utf8')))
      .map((f) => relative(SRC, f));
    expect(offenders).toEqual([]);
  });

  it('there are no import cycles (so the modules load in any order)', () => {
    // module -> the modules it imports values from ("import type" is erased, so it does not count)
    const graph = new Map<string, string[]>();
    const name = (f: string) => relative(SRC, f).split('\\').join('/').replace(/\.ts$/, '');
    for (const file of files(SRC)) {
      if (name(file) === 'index') continue;
      const deps: string[] = [];
      for (const m of readFileSync(file, 'utf8').matchAll(/^import \{([^}]*)\} from '@\/game\/([^']+)';/gm)) {
        const values = m[1].split(',').filter((s) => s.trim() && !/^\s*type\s/.test(s));
        if (values.length) deps.push(m[2]);
      }
      graph.set(name(file), deps);
    }
    const cycles: string[] = [];
    const state = new Map<string, 'visiting' | 'done'>();
    const visit = (m: string, path: string[]) => {
      if (state.get(m) === 'done') return;
      if (state.get(m) === 'visiting') {
        cycles.push([...path.slice(path.indexOf(m)), m].join(' -> '));
        return;
      }
      state.set(m, 'visiting');
      for (const d of graph.get(m) ?? []) visit(d, [...path, m]);
      state.set(m, 'done');
    };
    for (const m of graph.keys()) visit(m, []);
    expect(cycles).toEqual([]);
  });
});
