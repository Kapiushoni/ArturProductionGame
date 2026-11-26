// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';

export class StatType {
  static readonly NULL = int(-1);
  static readonly LUCK = int(1);
  static readonly ATTACK = int(2);
  static readonly DEFENSE = int(3);
  static readonly HEALTH = int(4);
  static readonly MAX_HP = int(5);
  static readonly EXPERIENCE = int(6);
  static readonly MAX_XP = int(7);
  static readonly BASE_LUCK = int(8);
  static readonly BASE_ATTACK = int(9);
  static readonly BASE_DEFENSE = int(10);
  static readonly BASE_HEALTH = int(11);
  static readonly BASE_XP = int(12);
  constructor() {
         
      }
  static getStatTypes() {
         return [StatType.LUCK,StatType.ATTACK,StatType.DEFENSE,StatType.HEALTH,StatType.MAX_HP];
      }
  static parse(text) {
         if(text == null || text == "")
         {
            return int(StatType.NULL);
         }
         switch(text)
         {
            case "L":
               return int(StatType.LUCK);
            case "A":
               return int(StatType.ATTACK);
            case "D":
               return int(StatType.DEFENSE);
            case "H":
               return int(StatType.HEALTH);
            case "MH":
               return int(StatType.MAX_HP);
            case "XP":
               return int(StatType.EXPERIENCE);
            case "MX":
               return int(StatType.MAX_XP);
            default:
               throw new Error("Parse error");
         }
      }
  static toString(num) { num = int(num);
         switch(num)
         {
            case StatType.LUCK:
               return "L";
            case StatType.ATTACK:
               return "A";
            case StatType.DEFENSE:
               return "D";
            case StatType.HEALTH:
               return "H";
            case StatType.MAX_HP:
               return "MH";
            case StatType.EXPERIENCE:
               return "XP";
            case StatType.MAX_XP:
               return "MX";
            default:
               throw new Error("Parse error");
         }
      }
  static stringOfStat(num) { num = int(num);
         switch(num)
         {
            case StatType.LUCK:
               return "Luck";
            case StatType.ATTACK:
               return "Attack";
            case StatType.DEFENSE:
               return "Defense";
            case StatType.HEALTH:
               return "Health";
            case StatType.MAX_HP:
               return "Health";
            case StatType.EXPERIENCE:
               return "Experience";
            case StatType.MAX_XP:
               return "Experience";
            default:
               throw new Error("Parse error");
         }
      }
  static setMcIcon(clip, num) { num = int(num);
         switch(num)
         {
            case StatType.LUCK:
               clip.gotoAndStop("luck");
               break;
            case StatType.DEFENSE:
               clip.gotoAndStop("defence");
               break;
            case StatType.ATTACK:
               clip.gotoAndStop("attack");
               break;
            case StatType.HEALTH:
               clip.gotoAndStop("health");
               break;
            case StatType.MAX_HP:
               clip.gotoAndStop("max_health");
         }
      }
}
bindMethods(StatType);
