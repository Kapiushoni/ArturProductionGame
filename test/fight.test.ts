import { describe, it, expect, afterEach, vi } from 'vitest';
import { GM, fakeStats } from './helpers';

const { Fight, DamageCalculator, Damage, Signal } = GM;

/** a fighter whose attack animation ends at once: it applies the damage and calls `done` */
function fighter(name: string, health: number, isJinn = false) {
  let hp = health;
  const log: string[] = [];
  const f: any = {
    name,
    log,
    isJinn: () => isJinn,
    onHit: new Signal(),
    prepareForFight: () => {},
    stats: { ...fakeStats(), isDead: () => hp <= 0, downHP: (n: number) => (hp -= n), hp: () => hp },
    hit(target: any, damage: any, done: () => void) {
      f.onHit.emit(f, target, damage, done);
      log.push(`${name} hits ${target.name} for ${damage.hp_damage}`);
      damage.apply(target.stats);
      done();
    },
  };
  return f;
}

afterEach(() => vi.restoreAllMocks());

/** every hit does `damage` */
function fixedDamage(damage: number) {
  vi.spyOn(DamageCalculator, 'calculateDamage').mockImplementation(
    (_a: any, target: any) => new Damage(damage, true, false, target),
  );
}

describe('Fight', () => {
  it('the jinn hits first, they alternate until the enemy dies -> onWin', () => {
    fixedDamage(10);
    const jinn = fighter('jinn', 25, true);
    const enemy = fighter('enemy', 20);
    const fight = new Fight(jinn, enemy, true);
    const won = vi.fn();
    const lost = vi.fn();
    const hits = vi.fn();
    fight.onWin.add(won);
    fight.onLose.add(lost);
    fight.onHit.add(hits);
    fight.onEnter.add((start: () => void) => start()); // the view's entry animation, then the fight starts
    fight.fight();
    expect(jinn.log).toEqual(['jinn hits enemy for 10', 'jinn hits enemy for 10']);
    expect(enemy.log).toEqual(['enemy hits jinn for 10']);
    expect(won).toHaveBeenCalledTimes(1);
    expect(lost).not.toHaveBeenCalled();
    expect(hits).toHaveBeenCalledTimes(3);
    expect(fight.isFirst()).toBe(true);
  });

  it('the jinn dies -> onLose', () => {
    fixedDamage(10);
    const jinn = fighter('jinn', 10, true);
    const enemy = fighter('enemy', 100);
    const fight = new Fight(jinn, enemy);
    const lost = vi.fn();
    fight.onLose.add(lost);
    fight.onEnter.add((start: () => void) => start());
    fight.fight();
    expect(lost).toHaveBeenCalledTimes(1);
    expect(jinn.stats.hp()).toBe(0);
  });

  it('nothing happens until the view lets the fight start', () => {
    fixedDamage(10);
    const jinn = fighter('jinn', 10, true);
    const enemy = fighter('enemy', 10);
    const fight = new Fight(jinn, enemy);
    let start: () => void = () => {};
    fight.onEnter.add((s: () => void) => (start = s));
    fight.fight();
    expect(jinn.log).toEqual([]);
    start();
    expect(jinn.log).toEqual(['jinn hits enemy for 10']);
  });

  it('after deactivate() the fighters no longer report hits', () => {
    fixedDamage(1);
    const jinn = fighter('jinn', 10, true);
    const enemy = fighter('enemy', 10);
    const fight = new Fight(jinn, enemy);
    const hits = vi.fn();
    fight.fight();
    fight.onHit.add(hits);
    fight.deactivate();
    jinn.hit(enemy, new Damage(1, true, false, enemy), () => {});
    expect(hits).not.toHaveBeenCalled();
  });
});
