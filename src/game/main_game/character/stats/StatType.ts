import { bindMethods, int } from '@/flash/as3';

/** Stat ids and their codes in the data files (L, A, D, H, MH, XP, MX). */
export class StatType {
  static readonly NULL = -1;
  static readonly LUCK = 1;
  static readonly ATTACK = 2;
  static readonly DEFENSE = 3;
  static readonly HEALTH = 4;
  static readonly MAX_HP = 5;
  static readonly EXPERIENCE = 6;
  static readonly MAX_XP = 7;
  static readonly BASE_LUCK = 8;
  static readonly BASE_ATTACK = 9;
  static readonly BASE_DEFENSE = 10;
  static readonly BASE_HEALTH = 11;
  static readonly BASE_XP = 12;
  constructor() {}
  static getStatTypes(): number[] {
    return [StatType.LUCK, StatType.ATTACK, StatType.DEFENSE, StatType.HEALTH, StatType.MAX_HP];
  }
  static parse(text: string): number {
    if (text == null || text == '') {
      return StatType.NULL;
    }
    switch (text) {
      case 'L':
        return StatType.LUCK;
      case 'A':
        return StatType.ATTACK;
      case 'D':
        return StatType.DEFENSE;
      case 'H':
        return StatType.HEALTH;
      case 'MH':
        return StatType.MAX_HP;
      case 'XP':
        return StatType.EXPERIENCE;
      case 'MX':
        return StatType.MAX_XP;
      default:
        throw new Error('Parse error');
    }
  }
  static toString(type: number): string {
    switch (int(type)) {
      case StatType.LUCK:
        return 'L';
      case StatType.ATTACK:
        return 'A';
      case StatType.DEFENSE:
        return 'D';
      case StatType.HEALTH:
        return 'H';
      case StatType.MAX_HP:
        return 'MH';
      case StatType.EXPERIENCE:
        return 'XP';
      case StatType.MAX_XP:
        return 'MX';
      default:
        throw new Error('Parse error');
    }
  }
  static stringOfStat(type: number): string {
    switch (int(type)) {
      case StatType.LUCK:
        return 'Luck';
      case StatType.ATTACK:
        return 'Attack';
      case StatType.DEFENSE:
        return 'Defense';
      case StatType.HEALTH:
        return 'Health';
      case StatType.MAX_HP:
        return 'Health';
      case StatType.EXPERIENCE:
        return 'Experience';
      case StatType.MAX_XP:
        return 'Experience';
      default:
        throw new Error('Parse error');
    }
  }
  static setMcIcon(clip: any, type: number) {
    switch (int(type)) {
      case StatType.LUCK:
        clip.gotoAndStop('luck');
        break;
      case StatType.DEFENSE:
        clip.gotoAndStop('defence');
        break;
      case StatType.ATTACK:
        clip.gotoAndStop('attack');
        break;
      case StatType.HEALTH:
        clip.gotoAndStop('health');
        break;
      case StatType.MAX_HP:
        clip.gotoAndStop('max_health');
    }
  }
}
bindMethods(StatType);
