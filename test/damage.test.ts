import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GM, setConfig, randomSequence, fakeStats } from './helpers';

const { DamageCalculator, Damage, Enemy, Jinn, Element, StatType } = GM;

// Math.random is called in this order: 1) evade roll, 2) critical roll (only when the jinn attacks with a weapon),
// 3) attack variance.
const DAMAGE_CONFIG = {
  VariableAttackPercentage: '10:20', // damage is -10%..+20% around attack - defense
  CriticalMultiplier: 2,
  EvadeFactor: 1,
  CriticalFactor: 1,
  MinimumCritical: 5,
  MinimumEvade: 5,
  LuckCap: 50,
  NvsF_defence: 1,
  NvsN_defence: 1,
  FvsI_attack: 1.5,
  NvsI_attack: 1,
  IvsI_attack: 1,
};

function enemy(stats: any, element = Element.fire) {
  const e = Object.create(Enemy.prototype);
  e.stats = stats;
  e.element = element;
  return e;
}
function jinn(stats: any, { weapon = null as any, shield = null as any } = {}) {
  const j = Object.create(Jinn.prototype);
  j.stats = stats;
  j.gear = {
    weapon: { isEmpty: () => !weapon, getContent: () => weapon && { getElement: () => weapon } },
    shield: { getContent: () => shield && { getElement: () => shield } },
  };
  return j;
}

beforeEach(() => setConfig({ Damage: DAMAGE_CONFIG }));
afterEach(() => vi.restoreAllMocks());

describe('DamageCalculator', () => {
  it('enemy hits the jinn: (attack - defense), -10%, then + up to 30% * random', () => {
    randomSequence(0.99, 0.5); // no evade (equal luck), variance 0.5
    const d = DamageCalculator.calculateDamage(enemy(fakeStats({ attack: 30 })), jinn(fakeStats({ defense: 10 })));
    // 20 -> 18 -> 18 + 18 * 0.15 = 20.7
    expect(d.hp_damage).toBe(21);
    expect(d.doesHeHit()).toBe(true);
    expect(d.isCritical()).toBe(false);
    expect(d.elementBonus).toBe(null);
  });

  it('a luckier defender can evade: no damage', () => {
    randomSequence(0.3); // evade chance = max(5%, min(50%, 1 - 10/20)) = 50%
    const d = DamageCalculator.calculateDamage(
      enemy(fakeStats({ attack: 30, luck: 10 })),
      jinn(fakeStats({ defense: 10, luck: 20 })),
    );
    expect(d.hp_damage).toBe(0);
    expect(d.doesHeHit()).toBe(false);
  });

  it('jinn with a fire weapon against an ice enemy: element bonus and a critical hit', () => {
    randomSequence(0.9, 0.1, 0); // no evade, critical (chance 50%), minimum variance
    const d = DamageCalculator.calculateDamage(
      jinn(fakeStats({ attack: 30, luck: 20 }), { weapon: Element.fire }),
      enemy(fakeStats({ defense: 10, luck: 10 }), Element.ice),
    );
    // (30 - 10) * 1.5 = 30 -> 27 -> critical x2
    expect(d.hp_damage).toBe(54);
    expect(d.isCritical()).toBe(true);
    expect(d.elementBonus.value).toBe(1.5);
    expect(d.elementBonus.element).toBe(Element.fire);
  });

  it('jinn without a weapon never crits', () => {
    randomSequence(0.9, 0);
    const d = DamageCalculator.calculateDamage(
      jinn(fakeStats({ attack: 30, luck: 99 })),
      enemy(fakeStats({ defense: 10 }), Element.ice),
    );
    expect(d.isCritical()).toBe(false);
    expect(d.hp_damage).toBe(18);
  });

  it('a hit always does at least 1 damage', () => {
    randomSequence(0.99, 0);
    const d = DamageCalculator.calculateDamage(enemy(fakeStats({ attack: 5 })), jinn(fakeStats({ defense: 50 })));
    expect(d.hp_damage).toBe(1);
  });
});

describe('Damage', () => {
  it('kills when the damage is at least the remaining health', () => {
    const target = { stats: fakeStats({ health: 10 }) };
    expect(new Damage(10, true, false, target).doesHeDie()).toBe(true);
    expect(new Damage(9, true, false, target).doesHeDie()).toBe(false);
    expect(new Damage(50, false, false, target).doesHeDie()).toBe(false); // evaded
  });

  it('apply() takes the damage from the stats', () => {
    const stats = { downHP: vi.fn() };
    new Damage(7, true, false, null).apply(stats);
    expect(stats.downHP).toHaveBeenCalledWith(7);
  });
});

describe('Element / StatType parsing', () => {
  it('parses element names and codes', () => {
    expect(Element.parseElement('Fire')).toBe(Element.fire);
    expect(Element.parseElement('I')).toBe(Element.ice);
    expect(Element.parseElement(null)).toBe(Element.normal);
    expect(() => Element.parseElement('Wind')).toThrow();
  });

  it('stat codes round-trip', () => {
    for (const code of ['L', 'A', 'D', 'H', 'MH', 'XP', 'MX'])
      expect(StatType.toString(StatType.parse(code))).toBe(code);
    expect(StatType.parse('')).toBe(StatType.NULL);
  });
});
