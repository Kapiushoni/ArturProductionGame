// @ts-nocheck
import { as3values, bindMethods, int, uint } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { Random } from '@/game/cb/utils/Random';
import { main } from '@/game/main';
import { Inventory } from '@/game/main_game/inventory/Inventory';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { BubbleGumTip } from '@/game/main_game/shmabledum/BubbleGumTip';
import { MixChecker } from '@/game/main_game/shmabledum/MixChecker';
import { ShmabledumFeeling } from '@/game/main_game/shmabledum/ShmabledumFeeling';
import { ShmabledumFeltTip } from '@/game/main_game/shmabledum/ShmabledumFeltTip';
import { SpecialMixTip } from '@/game/main_game/shmabledum/SpecialMixTip';
import { Locker } from '@/game/util/Locker';

export class ShmabledumPrincess {
  static readonly FIRE_FLAME = "FireFlame";
  static readonly ICE_BLOCK = "IceBlock";
  static elementTipShowed = false;
  static iceEnemyTipShowed = false;
  declare lostForAdvice: any;
  lostDungeons = {};
  declare onInteractionSignal: any;
  declare mixChecker: any;
  declare theLocker: any;
  constructor() {
         
         this.theLocker = new Locker();
         this.onInteractionSignal = new Signal();
         main.game.onDungeon.add(this.onDungeon);
         main.game.getMixer().onMixEnd.add(this.itemMixed);
         this.lostForAdvice = int(main.config.get("Shmabledum").losesForAdvice);
         this.initializeChecker();
      }
  getLocker() {
         return this.theLocker;
      }
  get onInteraction() {
         return this.onInteractionSignal;
      }
  selfAdvertise() {
         this.emitTip(new BubbleGumTip(main.locale.get("pbClickAdvice")));
      }
  initializeChecker() {
         var gear = main.game.getJinn().gear;
         var list = [gear.equipment_1,gear.equipment_2,gear.shield,gear.weapon,main.game.getMixer().getSlot(1),main.game.getMixer().getSlot(2)];
         var inventory = main.game.getInventory();
         var value = int(Inventory.SLOTS - 1);
         while(value >= 0)
         {
            list.push(inventory.getSlot(value));
            value--;
         }
         this.mixChecker = new MixChecker(list);
      }
  checkForMixes(list) {
         if(this.theLocker.isLocked || !main.theTutorial.isMixKnown())
         {
            return;
         }
         this.mixChecker.checkForMixes(list);
         var mix = this.mixChecker.getMix();
         if(mix != null)
         {
            this.onNewMix(mix);
         }
      }
  giveSomeTip() {
         var mix = null;
         if(this.theLocker.isLocked)
         {
            return;
         }
         if(!main.theTutorial.isMixKnown())
         {
            this.giveBasicTip();
         }
         else if(Math.random() <= 0.5 && this.mixChecker.searchForSlotsMixes([main.game.getMixer().getSlot(3)]))
         {
            mix = this.mixChecker.getMix();
            if(mix != null)
            {
               this.onNewMix(mix);
            }
            else
            {
               this.giveBasicTip();
            }
         }
         else
         {
            this.giveBasicTip();
         }
      }
  giveBasicTip() {
         var num = uint(1);
         if(!main.theTutorial.isMixKnown())
         {
            num = uint(main.config.get("Shmabledum").mixAdvices + 1);
         }
         this.emitTip(new BubbleGumTip(main.locale.get("pbAdvice" + Random.nextRange(num,main.config.get("Shmabledum").advices))));
      }
  itemMixed(mixResult) {
         if(mixResult.recipe != null)
         {
            this.emitTip(new SpecialMixTip(mixResult.item));
         }
      }
  emitTip(shmabledumInteraction) {
         if(this.theLocker.isLocked)
         {
            return;
         }
         this.onInteraction.emit(shmabledumInteraction);
      }
  onDungeon(dungeon) {
         dungeon.onWin.add(this.onWinDungeon);
         dungeon.onLose.add(this.onLoseDungeon);
         if(!ShmabledumPrincess.iceEnemyTipShowed)
         {
            dungeon.onFight.add(this.onFight);
         }
      }
  onWinDungeon() {
         var shmabledumInteraction = null;
         var dungeon = null;
         var list = null;
         var bootyItem = null;
         var mix = null;
         this.removeSubscriptions();
         this.lostDungeons = {};
         if(main.theTutorial.isMixKnown())
         {
            dungeon = main.game.getDungeon();
            list = new Array();
            for (bootyItem of as3values(dungeon.getLoot().getBooty()))
            {
               if(!bootyItem.isEmpty())
               {
                  list.push(bootyItem.getContent());
               }
            }
            shmabledumInteraction = this.getElementInteraction(list);
            if(shmabledumInteraction != null)
            {
               ShmabledumPrincess.elementTipShowed = true;
            }
            else
            {
               this.mixChecker.checkForMixes(list);
               mix = this.mixChecker.getMix();
               if(mix != null)
               {
                  shmabledumInteraction = new ShmabledumFeltTip(this.getMixPropouse(mix),ShmabledumFeeling.getJoy());
               }
            }
         }
         if(shmabledumInteraction == null)
         {
            shmabledumInteraction = ShmabledumFeeling.getJoy();
         }
         this.onInteractionSignal.emit(shmabledumInteraction);
      }
  getElementInteraction(list) {
         var id = null;
         var text = null;
         var param1Item = null;
         if(!ShmabledumPrincess.elementTipShowed)
         {
            for (param1Item of as3values(list))
            {
               id = param1Item.getID();
               if(id == ShmabledumPrincess.FIRE_FLAME)
               {
                  text = main.locale.get("pbFire");
                  break;
               }
               if(id == ShmabledumPrincess.ICE_BLOCK)
               {
                  text = main.locale.get("pbIce");
                  break;
               }
            }
         }
         if(text != null)
         {
            return new ShmabledumFeltTip(new BubbleGumTip(text,ItemFactory.getInstance().getItem(id)),ShmabledumFeeling.getJoy());
         }
         return null;
      }
  onLoseDungeon() {
         this.removeSubscriptions();
         var dungeon = main.game.getDungeon();
         if(this.lostDungeons[dungeon.getId()] != null)
         {
            this.lostDungeons[dungeon.getId()] = this.lostDungeons[dungeon.getId()] + 1;
         }
         else
         {
            this.lostDungeons[dungeon.getId()] = 1;
         }
         if(this.lostDungeons[dungeon.getId()] >= this.lostForAdvice)
         {
            this.onInteractionSignal.emit(new ShmabledumFeltTip(new BubbleGumTip(main.locale.get("pbLostSeveralTimes")),ShmabledumFeeling.getSadness()));
         }
         else
         {
            this.onInteractionSignal.emit(ShmabledumFeeling.getSadness());
         }
      }
  onFight(fight) {
         var element = fight.getEnemy().getElement();
         if(element.isOfIce && !main.game.getShmabledum().getLocker().isLocked)
         {
            ShmabledumPrincess.iceEnemyTipShowed = true;
            main.game.getDungeon().onFight.remove(this.onFight);
            this.onInteractionSignal.emit(new BubbleGumTip(main.locale.get("pbIceEnemy")));
         }
      }
  onNewMix(mixRecipe) {
         this.onInteractionSignal.emit(this.getMixPropouse(mixRecipe));
      }
  getMixPropouse(mixRecipe) {
         return new BubbleGumTip(main.locale.get("pbSpecialMix",[mixRecipe.item1.getNameToShow(),mixRecipe.item2.getNameToShow()]),mixRecipe.item1,mixRecipe.item2);
      }
  removeSubscriptions() {
         var dungeon = main.game.getDungeon();
         dungeon.onWin.remove(this.onWinDungeon);
         dungeon.onLose.remove(this.onLoseDungeon);
         if(!ShmabledumPrincess.iceEnemyTipShowed)
         {
            dungeon.onFight.remove(this.onFight);
         }
      }
  clear() {
         main.game.onDungeon.remove(this.onDungeon);
         if(main.game.getMixer() != null)
         {
            main.game.getMixer().onMixEnd.remove(this.itemMixed);
         }
         this.theLocker.clear();
         this.onInteractionSignal.clear();
         this.onInteractionSignal = null;
      }
}
ShmabledumPrincess.prototype.lostForAdvice = 0;
ShmabledumPrincess.prototype.onInteractionSignal = null;
ShmabledumPrincess.prototype.mixChecker = null;
ShmabledumPrincess.prototype.theLocker = null;
bindMethods(ShmabledumPrincess);
