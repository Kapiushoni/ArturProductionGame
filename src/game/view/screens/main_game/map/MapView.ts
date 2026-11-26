// @ts-nocheck
import { Dictionary, MovieClip, Timer, TimerEvent, __DEFER, as3as, as3values, bindMethods, int, uint } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { Lambda } from '@/game/actions/Lambda';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Signal } from '@/game/cb/signals/Signal';
import { cbArray } from '@/game/cb/utils/cbArray';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { main } from '@/game/main';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { LegendaryLevel } from '@/game/main_game/map/LegendaryLevel';
import { Buttons } from '@/game/util/Buttons';
import { Sepializer } from '@/game/util/Sepializer';
import { Util } from '@/game/util/Util';
import { ArrowView } from '@/game/view/screens/main_game/map/ArrowView';

export class MapView extends Screen {
  static readonly NEXT_BUTTON = "pages.arrow_right";
  static readonly PREV_BUTTON = "pages.arrow_left";
  declare onToMainMenu: any;
  declare onToDungeon: any;
  declare buttonsNames: any;
  declare map: any;
  declare nextArrow: any;
  declare prevArrow: any;
  declare actual_page: any;
  lastPlayedTimer = new Timer(500,1);
  constructor(map) {super(__DEFER); const __self = this; 
         this.map = map;
         this.lastPlayedTimer.addEventListener(TimerEvent.TIMER_COMPLETE,this.refreshLastLevel);
          this.__init_Screen(main.swfLoader.getClass("assets.Map"),this.getButtonInfo());
         this.actual_page = uint(this.pageOfLevel(this.map.getMap().getLevel(main.saveSystem.getLastPlayed())));
         this.initialize();
         __self.bg.pages.gotoAndStop("page_" + this.actual_page);
         this.nextArrow = new ArrowView((Util.getSprite(__self.bg,MapView.NEXT_BUTTON)),this.nextPage);
         this.prevArrow = new ArrowView((Util.getSprite(__self.bg,MapView.PREV_BUTTON)),this.previousPage);
         this.refreshArrows(this.actual_page);
      }
  getButtonInfo() {
         var level = null;
         var buttonName = null;
         this.buttonsNames = new Array();
         var dict = new Dictionary();
         dict.set("sound", ButtonGroup.get("sound_gui").createButton(null,"mouseOver","mouseOut"));
         this.buttonsNames.push("sound");
         var buttonGroup = ButtonGroup.get("gui");
         dict.set("back", buttonGroup.createButton(this.toMainMenu,"mouseOver","mouseOut"));
         this.buttonsNames.push("back");
         for (level of as3values(this.map.getMap().getLevels()))
         {
            buttonName = this.getButtonName(level);
            dict.set(buttonName, buttonGroup.createButton(this.getGoToDungeon(level),"mouseOver","mouseOut"));
            this.buttonsNames.push(buttonName);
         }
         return dict;
      }
  getButtonName(level) {
         return "pages.page_" + this.pageOfLevel(level) + ".dungeon_" + level.getDungeonId();
      }
  pageOfLevel(level) {
         return uint(level.getArea());
      }
  getGoToDungeon(level2) { const __self = this;
         var level = level2;
         return function(event)
         {
            Buttons.setButtons(__self.bg,__self.buttonsNames,false);
            __self.onToDungeon.emit(level);
         };
      }
  initialize() { const __self = this;
         var level = null;
         var buttonName = null;
         var clip = null;
         var clip2 = null;
         var date = null;
         this.onToMainMenu = new Signal();
         this.onToDungeon = new Signal();
         main.soundManager.updateSoundButton(__self.bg.sound);
         Buttons.setButtons(__self.bg,this.buttonsNames,true);
         for (level of as3values(this.map.getMap().getLevels()))
         {
            buttonName = this.getButtonName(level);
            clip = as3as(Util.getSprite(__self.bg,buttonName), MovieClip);
            if(level.isLocked())
            {
               if(!level.isLegendary())
               {
                  clip.icon.gotoAndStop("locked");
               }
               else
               {
                  Sepializer.getInstance().sepializeDark(clip);
                  clip2 = as3as(main.swfLoader.getObject("assets.BonusMap"), MovieClip);
                  clip.addChild(clip2);
                  date = (as3as(level, LegendaryLevel)).getDate();
                  clip2.title.title.text = main.locale.get("legendaryDate",[date.getFullYear(),date.getMonth() + 1,date.getDate()]);
               }
               Buttons.setButtons(__self.bg,[buttonName],false);
            }
            else if(level.isCleared())
            {
               if(!level.isLegendary())
               {
                  clip.icon.gotoAndStop("cleared");
                  if(!level.isSpecial())
                  {
                     clip.icon.title.title.text = level.getDungeonId();
                  }
               }
               Buttons.setButtons(__self.bg,[buttonName],true);
               this.putEnemies(clip,level);
            }
            else if(level.isUnlocked())
            {
               if(!level.isLegendary())
               {
                  clip.icon.gotoAndStop("unlocked");
                  if(!level.isSpecial())
                  {
                     clip.icon.title.title.text = level.getDungeonId();
                  }
               }
               Buttons.setButtons(__self.bg,[buttonName],true);
               this.putEnemies(clip,level);
            }
            if(clip.lastLevel)
            {
               clip.lastLevel.stop();
               clip.lastLevel.visible = false;
            }
         }
      }
  putEnemies(clip, level) {
         var enemiesDataItem = null;
         var clip2 = null;
         var loc4_Item = null;
         var element = null;
         var configFor = DungeonFactory.getConfigFor(level.getDungeonId());
         var cbArray2 = new cbArray();
         for (enemiesDataItem of as3values(configFor.enemiesData))
         {
            element = CharacterFactory.getInstance().getConfig(enemiesDataItem[0]).element;
            cbArray2.pushIfNotPresent(element);
         }
         if(cbArray2.length == 1)
         {
            clip2 = as3as(main.swfLoader.getObject("assets.SkullsX3"), MovieClip);
            clip2.skull2.visible = false;
            clip2.skull3.visible = false;
         }
         else if(cbArray2.length == 2)
         {
            clip2 = as3as(main.swfLoader.getObject("assets.SkullsX2"), MovieClip);
         }
         else
         {
            if(cbArray2.length != 3)
            {
               throw new Error("WTF?!");
            }
            clip2 = as3as(main.swfLoader.getObject("assets.SkullsX3"), MovieClip);
         }
         var num = int(1);
         for (loc4_Item of as3values(cbArray2))
         {
            clip2["skull" + num].gotoAndStop(loc4_Item.type);
            num++;
         }
         clip.addChild(clip2);
      }
  updatePage(value, actual_page) { actual_page = uint(actual_page);
         this.actual_page = uint(actual_page);
         this.refreshArrows(actual_page);
      }
  nextPage() {
         this.goToPage(this.actual_page + 1);
      }
  previousPage() {
         this.goToPage(this.actual_page - 1);
      }
  goToPage(num) { num = uint(num); const __self = this;
         if(this.actual_page == num)
         {
            this.updatePage(null,num);
            return;
         }
         if(num > this.pageOfLevel(this.map.getMap().biggestUnlockedLevel()))
         {
            return;
         }
         this.hideArrows();
         var text = "page_" + this.actual_page + "/page_" + num;
         __self.bg.pages.gotoAndPlay(text);
         var smartMC = new SmartMC(__self.bg.pages);
         smartMC.trigger(new EndCurrentLabel(__self.bg.pages),new Lambda(this.updatePage,num));
      }
  hideArrows() {
         this.nextArrow.hide();
         this.prevArrow.hide();
      }
  refreshArrows(num) { num = uint(num);
         var clip = null;
         if(num + 1 <= this.pageOfLevel(this.map.getMap().biggestUnlockedLevel()))
         {
            this.nextArrow.show();
         }
         if(num != 1)
         {
            this.prevArrow.show();
         }
      }
  toMainMenu(event) {
         this.onToMainMenu.emit();
      }
  close() { const __self = this;
         __self.pop();
      }
  clear() {
         super.clear();
         this.lastPlayedTimer.stop();
         this.lastPlayedTimer.removeEventListener(TimerEvent.TIMER_COMPLETE,this.refreshLastLevel);
         this.lastPlayedTimer = null;
         this.onToDungeon.clear();
         this.onToMainMenu.clear();
         this.map = null;
      }
  refreshUnlocked(cbArray2) { const __self = this;
         var clip = null;
         var param1Item = null;
         var buttonName = null;
         for (param1Item of as3values(cbArray2))
         {
            buttonName = this.getButtonName(param1Item);
            if(param1Item.isCleared())
            {
               clip = as3as(Util.getSprite(__self.bg,buttonName), MovieClip);
               if(!param1Item.isLegendary())
               {
                  clip.icon.gotoAndStop("cleared");
                  if(!param1Item.isSpecial())
                  {
                     clip.icon.title.title.text = param1Item.getDungeonId();
                  }
               }
               Buttons.setButtons(__self.bg,[buttonName],true);
               this.putEnemies(clip,param1Item);
            }
            else if(param1Item.isUnlocked())
            {
               clip = as3as(Util.getSprite(__self.bg,buttonName), MovieClip);
               if(!param1Item.isLegendary())
               {
                  clip.icon.gotoAndStop("unlocked");
                  if(!param1Item.isSpecial())
                  {
                     clip.icon.title.title.text = param1Item.getDungeonId();
                  }
               }
               Buttons.setButtons(__self.bg,[buttonName],true);
               this.putEnemies(clip,param1Item);
            }
         }
         this.lastPlayedTimer.reset();
         this.lastPlayedTimer.start();
         this.refreshArrows(this.actual_page);
      }
  refreshLastLevel(event) { const __self = this;
         var clip = as3as(Util.getSprite(__self.bg,this.getButtonName(this.map.getMap().getLevel(main.saveSystem.getLastPlayed()))), MovieClip);
         if(clip.lastLevel)
         {
            clip.lastLevel.visible = true;
            clip.lastLevel.gotoAndPlay(1);
         }
      }
}
MapView.prototype.onToMainMenu = null;
MapView.prototype.onToDungeon = null;
MapView.prototype.buttonsNames = null;
MapView.prototype.map = null;
MapView.prototype.nextArrow = null;
MapView.prototype.prevArrow = null;
MapView.prototype.actual_page = 0;
bindMethods(MapView);
