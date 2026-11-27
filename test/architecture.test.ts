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
});
