import { describe, it, expect, vi } from 'vitest';
import { GM, setConfig, dict } from './helpers';

const { Stat, HealthStat, Experience, LevelingStragegy, StatType, Enemy, Element } = GM;

describe('Stat', () => {
  it('adds to its value', () => {
    const s = new Stat(StatType.ATTACK, 10);
    s.modifyValue(5);
    s.modifyValue(-2);
    expect(s.getValue()).toBe(13);
  });
});

describe('HealthStat', () => {
  const health = (value: number, max: number) => new HealthStat(StatType.HEALTH, new Stat(StatType.MAX_HP, max), value);

  it('never goes above the max or below zero', () => {
    const h = health(50, 100);
    h.modifyValue(80);
    expect(h.getValue()).toBe(100);
    h.modifyValue(-500);
    expect(h.getValue()).toBe(0);
  });

  it('fill(percent) adds that share of the max, rounded down', () => {
    const h = health(0, 75);
    h.fill(50);
    expect(h.getValue()).toBe(37);
    h.fill(); // 100% by default
    expect(h.getValue()).toBe(75);
  });

  it('percentage is rounded up', () => {
    expect(health(1, 3).getpercentage()).toBe(34);
  });

  it('raising the max refills to the new max', () => {
    const h = health(10, 100);
    h.modifyUpperBound(20);
    expect(h.getUpperBound().getValue()).toBe(120);
    expect(h.getValue()).toBe(120);
  });
});

describe('LevelingStragegy', () => {
  // stat at level L = base * mod^(L-1); levelling adds the difference, rounded
  const strat = new LevelingStragegy({ maxHPMod: 2, attMod: 1.5, defMod: 1, luckMod: 1 });

  it('level 1 -> 3 adds base*mod^2 - base', () => {
    const s = new Stat(StatType.ATTACK, 10);
    strat.levelUp(s, 10, 1.5, 1, 3);
    expect(s.getValue()).toBe(23); // 10 + round(22.5 - 10)
  });

  it('level 2 -> 3 adds base*mod^2 - base*mod', () => {
    const s = new Stat(StatType.ATTACK, 15);
    strat.levelUp(s, 10, 1.5, 2, 3);
    expect(s.getValue()).toBe(23); // 15 + round(22.5 - 15)
  });

  it('same level changes nothing', () => {
    const s = new Stat(StatType.ATTACK, 10);
    strat.levelUp(s, 10, 1.5, 4, 4);
    expect(s.getValue()).toBe(10);
  });
});

describe('Experience', () => {
  const setup = () => {
    Experience.configuration = dict({ 1: { XP: 100 }, 2: { XP: 250 } });
    const stats = { leveling: vi.fn() };
    return { xp: new Experience(stats), stats };
  };

  it('starts at level 1', () => {
    const { xp, stats } = setup();
    expect(xp.getLevel()).toBe(1);
    expect(stats.leveling).not.toHaveBeenCalled();
  });

  it('levels up when the XP threshold is reached and reports progress inside the level', () => {
    const { xp, stats } = setup();
    xp.modifyValue(150); // total 151
    expect(xp.getLevel()).toBe(2);
    expect(stats.leveling).toHaveBeenCalledWith(2);
    expect(xp.getValue()).toBe(51); // 151 - 100
    expect(xp.getUpperBound()).toBe(150); // 250 - 100
  });

  it('levels past the table: each missing threshold is the previous one * 1.5', () => {
    const { xp, stats } = setup();
    xp.modifyValue(300); // total 301 > 250, next threshold = 375
    expect(xp.getLevel()).toBe(3);
    expect(stats.leveling).toHaveBeenLastCalledWith(3);
    expect(Experience.config.get(3).XP).toBe(375);
  });
});

describe('Enemy levelling', () => {
  it('scales every stat from its base values', () => {
    setConfig({ Leveling_Enemies: { maxHPMod: 2, attMod: 2, defMod: 1.5, luckMod: 1, xpMod: 3 } });
    const cfg = {
      baseHP: 20,
      baseAttack: 10,
      baseDefense: 4,
      baseLuck: 7,
      baseXP: 5,
      element: Element.fire,
      nameString: 'x',
    };
    const enemy = new Enemy('enemyF1', cfg, 3);
    const s = enemy.stats;
    expect(s.getLevel()).toBe(3);
    expect(s.getStat(StatType.HEALTH).getUpperBound().getValue()).toBe(80); // 20 * 2^2
    expect(s.getStat(StatType.HEALTH).getValue()).toBe(80);
    expect(s.getAttack()).toBe(40); // 10 * 2^2
    expect(s.getDefense()).toBe(9); // 4 + round(4*2.25 - 4)
    expect(s.getLuck()).toBe(7);
    expect(s.getStat(StatType.EXPERIENCE).getValue()).toBe(45); // 5 * 3^2
    expect(enemy.getElement()).toBe(Element.fire);
  });
});
