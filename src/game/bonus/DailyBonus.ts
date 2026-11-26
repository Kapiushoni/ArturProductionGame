// @ts-nocheck
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

export class DailyBonus {
  static config = null;
  static readonly specialDungeonName = "specialDungeon";
  static readonly xpBonusName = "xpPercent";
  static readonly xtraLevelName = "enemyExtraLevel";
  static readonly filterName = "filter";
  static readonly elementName = "element";
  constructor() {
         
      }
  static getBonusOfDate(date) {
         var bonusConfigOfDate = DailyBonus.getBonusConfigOfDate(date);
         if(bonusConfigOfDate)
         {
            return DailyBonus.getBonus(bonusConfigOfDate);
         }
         return null;
      }
  static getBonusConfigOfDate(date) {
         var obj = null;
         var obj2 = DailyBonus.config.get("SpecialEvents");
         var dateTimeFormatter = new DateTimeFormatter("en-US");
         dateTimeFormatter.setDateTimePattern("\'date_\'MM_dd_yyyy");
         var obj3 = obj2[dateTimeFormatter.format(date)];
         if(!obj3)
         {
            obj = DailyBonus.config.get("Weekly");
            dateTimeFormatter.setDateTimePattern("EEEE");
            obj3 = obj[dateTimeFormatter.format(date)];
         }
         return obj3;
      }
  static getBonus(obj) {
         var bonusFilter = null;
         if(obj.hasOwnProperty(DailyBonus.specialDungeonName))
         {
            return new ExtraDungeon(obj[DailyBonus.specialDungeonName],obj[DailyBonus.elementName]);
         }
         if(obj.hasOwnProperty(DailyBonus.filterName))
         {
            bonusFilter = DailyBonus.parseFilter(obj[DailyBonus.filterName]);
            if(obj.hasOwnProperty(DailyBonus.xpBonusName))
            {
               return new XpBonus(obj[DailyBonus.xpBonusName],bonusFilter);
            }
            if(obj.hasOwnProperty(DailyBonus.xtraLevelName))
            {
               return new ExtraLevelBonus(obj[DailyBonus.xtraLevelName],bonusFilter);
            }
         }
         return null;
      }
  static isConfigOfSpecialDungeon(obj, element) {
         return Boolean(obj) && obj.hasOwnProperty(DailyBonus.specialDungeonName) && Element.parseElement(obj[DailyBonus.elementName]) == element;
      }
  static getNextSpecialDungeonDate(element) {
         var key = null;
         var list = null;
         var date = new Date();
         var bonusConfigOfDate = null;
         var i = int(0);
         while(i < 7)
         {
            bonusConfigOfDate = DailyBonus.getBonusConfigOfDate(date);
            if(DailyBonus.isConfigOfSpecialDungeon(bonusConfigOfDate,element))
            {
               return date;
            }
            date = new Date(date.time + 1000 * 60 * 60 * 24);
            i++;
         }
         date = null;
         var obj = DailyBonus.config.get("SpecialEvents");
         for (key of as3keys(obj))
         {
            if(DailyBonus.isConfigOfSpecialDungeon(obj[key],element))
            {
               list = key.split("_");
               if(date == null || !DailyBonus.isAfter(list[3],list[1],list[2],date.getFullYear(),date.getMonth() + 1,date.getDate()))
               {
                  date = new Date(list[3],list[1] - 1,list[2]);
               }
            }
         }
         return date;
      }
  static parseFilter(text) {
         switch(text)
         {
            case "All":
               return new AllFilter();
            case "Ice":
               return new IceFilter();
            case "Fire":
               return new FireFilter();
            case "Normal":
               return new NormalFilter();
            default:
               return new NoneFilter();
         }
      }
  static getNextSpecialBonusDate(date) {
         var key = null;
         var list = null;
         var fullYear = int(date.getFullYear());
         var num = int(date.getMonth() + 1);
         var date2 = int(date.getDate());
         var obj = DailyBonus.config.get("SpecialEvents");
         var date3 = null;
         for (key of as3keys(obj))
         {
            list = key.split("_");
            if(DailyBonus.isAfter(list[3],list[1],list[2],fullYear,num,date2))
            {
               if(date3 == null || !DailyBonus.isAfter(list[3],list[1],list[2],date3.getFullYear(),date3.getMonth() + 1,date3.getDate()))
               {
                  date3 = new Date(list[3],list[1] - 1,list[2]);
               }
            }
         }
         return date3;
      }
  static isAfter(num, num2, num3, num4, num5, num6) { num = int(num); num2 = int(num2); num3 = int(num3); num4 = int(num4); num5 = int(num5); num6 = int(num6);
         return num > num4 || num == num4 && num2 > num5 || num == num4 && num2 == num5 && num3 > num6;
      }
}
bindMethods(DailyBonus);
