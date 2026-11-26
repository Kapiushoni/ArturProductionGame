// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { main } from '@/game/main';

export class BonusIcon {
  static readonly Kill = "Kill";
  declare type: any;
  declare title: any;
  declare label: any;
  constructor(constructorLock, type, title = null, label = "1") {
         
         this.type = type;
         this.title = title;
         this.label = label;
      }
  static getFire() {
         return new BonusIcon(new ConstructorLock(),"Fire");
      }
  static getIce() {
         return new BonusIcon(new ConstructorLock(),"Ice");
      }
  static getNormal() {
         return new BonusIcon(new ConstructorLock(),"Normal");
      }
  static getXpIcon() {
         return new BonusIcon(new ConstructorLock(),"XpIcon",main.locale.get("dailyXp"));
      }
  static getExtraDungeon(text) {
         return new BonusIcon(new ConstructorLock(),"Dungeon" + text);
      }
  static getLevelIcon(flag) {
         return new BonusIcon(new ConstructorLock(),"LevelIcon",main.locale.get("dailyLvl"),flag ? "up" : "down");
      }
  addToHolder(displayObjectContainer, text = "") {
         var cls = main.swfLoader.getClass("assets." + text + this.type);
         var clip = new cls();
         if(this.title != null)
         {
            clip.title.title.text = this.title;
         }
         clip.gotoAndStop(this.label);
         displayObjectContainer.addChild(clip);
      }
}
BonusIcon.prototype.type = null;
BonusIcon.prototype.title = null;
BonusIcon.prototype.label = null;
bindMethods(BonusIcon);

class ConstructorLock {
  constructor() {
      
   }
}
bindMethods(ConstructorLock);
