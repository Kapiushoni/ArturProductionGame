import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GM } from './helpers';

const { DailyBonus, DiFile, XpBonus, ExtraLevelBonus, ExtraDungeon, Element, AllFilter, NoneFilter } = GM;

/** a dailyBonus.di of our own */
const DI = `
SpecialEvents {
  date_12_25_2030 = Xmas
  date_06_01_2030 = IceDay
}
Xmas { filter = "Fire" xpPercent = 200 }
IceDay { specialDungeon = "31" element = "I" }
Weekly {
  Monday = MonBonus
}
MonBonus { filter = "Ice" enemyExtraLevel = 2 }
`;

beforeEach(() => {
  DailyBonus.config = new DiFile({ name: 'dailyBonus.di', data: DI });
});

describe('DailyBonus', () => {
  it('a special day: its bonus (here: double XP for fire enemies)', () => {
    const bonus = DailyBonus.getBonusOfDate(new Date(2030, 11, 25));
    expect(bonus).toBeInstanceOf(XpBonus);
    const withXp = (xp: number, element: any) => ({
      getElement: () => element,
      stats: { getStat: () => ({ getValue: () => xp }) },
    });
    // fire: 10 * 2; ice: unchanged
    expect(bonus.getXp([withXp(10, Element.fire), withXp(7, Element.ice)])).toBe(27);
  });

  it('a special dungeon day', () => {
    const bonus = DailyBonus.getBonusOfDate(new Date(2030, 5, 1));
    expect(bonus).toBeInstanceOf(ExtraDungeon);
    expect(bonus.getElement()).toBe(Element.ice);
  });

  it('otherwise the weekday bonus (2030-01-07 is a Monday); no bonus on other days', () => {
    const monday = DailyBonus.getBonusOfDate(new Date(2030, 0, 7));
    expect(monday).toBeInstanceOf(ExtraLevelBonus);
    const leveling = { setExtraLevel: vi.fn() };
    monday.apply({ element: Element.fire }, leveling);
    expect(leveling.setExtraLevel).not.toHaveBeenCalled();
    monday.apply({ element: Element.ice }, leveling);
    expect(leveling.setExtraLevel).toHaveBeenCalledWith(2);
    expect(DailyBonus.getBonusOfDate(new Date(2030, 0, 8))).toBe(null);
  });

  it('the next special event after a date', () => {
    const next = DailyBonus.getNextSpecialBonusDate(new Date(2030, 0, 1));
    expect([next.getFullYear(), next.getMonth() + 1, next.getDate()]).toEqual([2030, 6, 1]);
    const after = DailyBonus.getNextSpecialBonusDate(new Date(2030, 5, 1));
    expect([after.getMonth() + 1, after.getDate()]).toEqual([12, 25]);
    expect(DailyBonus.getNextSpecialBonusDate(new Date(2031, 0, 1))).toBe(null);
  });

  it('isAfter compares year, then month, then day (strings work too)', () => {
    expect(DailyBonus.isAfter('2030', '06', '01', 2030, 5, 31)).toBe(true);
    expect(DailyBonus.isAfter(2030, 6, 1, 2030, 6, 1)).toBe(false);
    expect(DailyBonus.isAfter(2029, 12, 31, 2030, 1, 1)).toBe(false);
  });

  it('filters', () => {
    expect(DailyBonus.parseFilter('All')).toBeInstanceOf(AllFilter);
    expect(DailyBonus.parseFilter('???')).toBeInstanceOf(NoneFilter);
    expect(DailyBonus.parseFilter('Normal').doesApply(Element.normal)).toBe(true);
    expect(DailyBonus.parseFilter('Normal').doesApply(Element.fire)).toBe(false);
    expect(DailyBonus.parseFilter('Fire').doesApply(Element.fire)).toBe(true);
  });
});
