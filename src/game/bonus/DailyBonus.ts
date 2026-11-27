import { DateTimeFormatter, as3keys, bindMethods, int } from '@/flash/as3';
import { ExtraDungeon } from '@/game/bonus/ExtraDungeon';
import { ExtraLevelBonus } from '@/game/bonus/ExtraLevelBonus';
import { AllFilter } from '@/game/bonus/filter/AllFilter';
import { FireFilter } from '@/game/bonus/filter/FireFilter';
import { IceFilter } from '@/game/bonus/filter/IceFilter';
import { NoneFilter } from '@/game/bonus/filter/NoneFilter';
import { NormalFilter } from '@/game/bonus/filter/NormalFilter';
import { XpBonus } from '@/game/bonus/XpBonus';
import { Element } from '@/game/main_game/element/Element';
import type { IBonusFilter } from '@/game/bonus/filter/IBonusFilter';
import type { IDailyBonus } from '@/game/bonus/IDailyBonus';

/**
 * The bonus of a day, from dailyBonus.di (DailyBonus.config, a DiFile):
 * - SpecialEvents: { date_MM_dd_yyyy: bonus } for special days (checked first);
 * - Weekly: { Monday: bonus, ... }.
 * A bonus is { specialDungeon, element } or { filter, xpPercent } or { filter, enemyExtraLevel }.
 */
export class DailyBonus {
  static config: any = null;
  static readonly specialDungeonName = 'specialDungeon';
  static readonly xpBonusName = 'xpPercent';
  static readonly xtraLevelName = 'enemyExtraLevel';
  static readonly filterName = 'filter';
  static readonly elementName = 'element';

  static getBonusOfDate(date: Date): IDailyBonus | null {
    const config = DailyBonus.getBonusConfigOfDate(date);
    return config ? DailyBonus.getBonus(config) : null;
  }
  static getBonusConfigOfDate(date: Date): any {
    const formatter = new DateTimeFormatter('en-US');
    formatter.setDateTimePattern("'date_'MM_dd_yyyy");
    let config = DailyBonus.config.get('SpecialEvents')[formatter.format(date)];
    if (!config) {
      formatter.setDateTimePattern('EEEE'); // weekday name
      config = DailyBonus.config.get('Weekly')[formatter.format(date)];
    }
    return config;
  }
  static getBonus(config: any): IDailyBonus | null {
    if (config.hasOwnProperty(DailyBonus.specialDungeonName)) {
      return new ExtraDungeon(config[DailyBonus.specialDungeonName], config[DailyBonus.elementName]);
    }
    if (config.hasOwnProperty(DailyBonus.filterName)) {
      const filter = DailyBonus.parseFilter(config[DailyBonus.filterName]);
      if (config.hasOwnProperty(DailyBonus.xpBonusName)) {
        return new XpBonus(config[DailyBonus.xpBonusName], filter);
      }
      if (config.hasOwnProperty(DailyBonus.xtraLevelName)) {
        return new ExtraLevelBonus(config[DailyBonus.xtraLevelName], filter);
      }
    }
    return null;
  }
  static isConfigOfSpecialDungeon(config: any, element: Element): boolean {
    return (
      Boolean(config) &&
      config.hasOwnProperty(DailyBonus.specialDungeonName) &&
      Element.parseElement(config[DailyBonus.elementName]) == element
    );
  }
  /** the next day (within a week, else the earliest special event) with the legendary dungeon of `element` */
  static getNextSpecialDungeonDate(element: Element): Date | null {
    let date = new Date();
    for (let i = 0; i < 7; i++) {
      if (DailyBonus.isConfigOfSpecialDungeon(DailyBonus.getBonusConfigOfDate(date), element)) {
        return date;
      }
      date = new Date((date as any).time + 1000 * 60 * 60 * 24);
    }
    date = null;
    const events = DailyBonus.config.get('SpecialEvents');
    for (const key of as3keys(events)) {
      if (DailyBonus.isConfigOfSpecialDungeon(events[key], element)) {
        const [, month, day, year] = key.split('_'); // date_MM_dd_yyyy
        if (
          date == null ||
          !DailyBonus.isAfter(year, month, day, date.getFullYear(), date.getMonth() + 1, date.getDate())
        ) {
          date = new Date(year, month - 1, day);
        }
      }
    }
    return date;
  }
  static parseFilter(name: string): IBonusFilter {
    switch (name) {
      case 'All':
        return new AllFilter();
      case 'Ice':
        return new IceFilter();
      case 'Fire':
        return new FireFilter();
      case 'Normal':
        return new NormalFilter();
      default:
        return new NoneFilter();
    }
  }
  /** the first special event after `date` */
  static getNextSpecialBonusDate(date: Date): Date | null {
    const year = int(date.getFullYear());
    const month = int(date.getMonth() + 1);
    const day = int(date.getDate());
    let next: Date = null;
    for (const key of as3keys(DailyBonus.config.get('SpecialEvents'))) {
      const [, m, d, y] = key.split('_'); // date_MM_dd_yyyy
      if (DailyBonus.isAfter(y, m, d, year, month, day)) {
        if (next == null || !DailyBonus.isAfter(y, m, d, next.getFullYear(), next.getMonth() + 1, next.getDate())) {
          next = new Date(y, m - 1, d);
        }
      }
    }
    return next;
  }
  /** is year/month/day after year2/month2/day2? (values can be strings) */
  static isAfter(year: any, month: any, day: any, year2: any, month2: any, day2: any): boolean {
    [year, month, day, year2, month2, day2] = [year, month, day, year2, month2, day2].map(int);
    return year > year2 || (year == year2 && month > month2) || (year == year2 && month == month2 && day > day2);
  }
}
bindMethods(DailyBonus);
