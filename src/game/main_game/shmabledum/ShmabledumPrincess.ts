import { as3values, bindMethods, int, uint } from '@/flash/as3';
import { services } from '@/game/services';
import { Signal } from '@/game/cb/signals/Signal';
import { Random } from '@/game/cb/utils/Random';
import { Inventory } from '@/game/main_game/inventory/Inventory';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { BubbleGumTip } from '@/game/main_game/shmabledum/BubbleGumTip';
import { MixChecker } from '@/game/main_game/shmabledum/MixChecker';
import { ShmabledumFeeling } from '@/game/main_game/shmabledum/ShmabledumFeeling';
import { ShmabledumFeltTip } from '@/game/main_game/shmabledum/ShmabledumFeltTip';
import { SpecialMixTip } from '@/game/main_game/shmabledum/SpecialMixTip';
import { Locker } from '@/game/util/Locker';
import type { Item } from '@/game/main_game/items/Item';
import type { Game } from '@/game/main_game/Game';
import type { MixRecipe } from '@/game/main_game/shmabledum/MixRecipe';
import type { MixResult } from '@/game/main_game/mixer/MixResult';
import type { ShmabledumInteraction } from '@/game/main_game/shmabledum/ShmabledumInteraction';
import type { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import type { Fight } from '@/game/main_game/dungeon/Fight';

/**
 * The shmabledum (helper princess): reacts to won / lost dungeons, proposes special mixes and gives tips.
 * Everything it does goes out through onInteraction(ShmabledumInteraction); the view plays it.
 * Config: the "Shmabledum" section of config.di (losesForAdvice, delayAdvice, advices, mixAdvices).
 */
export class ShmabledumPrincess {
  static readonly FIRE_FLAME = 'FireFlame';
  static readonly ICE_BLOCK = 'IceBlock';
  /** one-time tips (for the whole session) */
  static elementTipShowed = false;
  static iceEnemyTipShowed = false;
  /** after this many losses in the same dungeon, a tip */
  private lostForAdvice: number;
  /** dungeon id -> losses since the last win */
  private lostDungeons: Record<string, number> = {};
  private onInteractionSignal: Signal;
  private mixChecker: MixChecker;
  private theLocker: Locker;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.theLocker = new Locker();
    this.onInteractionSignal = new Signal();
    this.game.onDungeon.add(this.onDungeon);
    this.game.getMixer().onMixEnd.add(this.itemMixed);
    this.lostForAdvice = int(services.config.get('Shmabledum').losesForAdvice);
    this.initializeChecker();
  }
  /** while locked (e.g. during the tutorial), it says nothing */
  getLocker(): Locker {
    return this.theLocker;
  }
  get onInteraction(): Signal {
    return this.onInteractionSignal;
  }
  /** "click me for advice" */
  selfAdvertise() {
    this.emitTip(new BubbleGumTip(services.texts.get('pbClickAdvice')));
  }
  initializeChecker() {
    const gear = this.game.getJinn().gear;
    const mixer = this.game.getMixer();
    const slots = [gear.equipment_1, gear.equipment_2, gear.shield, gear.weapon, mixer.getSlot(1), mixer.getSlot(2)];
    const inventory = this.game.getInventory();
    for (let i = int(Inventory.SLOTS - 1); i >= 0; i--) {
      slots.push(inventory.getSlot(i));
    }
    this.mixChecker = new MixChecker(slots);
  }
  /** proposes a mix with these (new) items, if there is one */
  checkForMixes(items: Item[]) {
    if (this.theLocker.isLocked || !services.tutorial.isMixKnown()) {
      return;
    }
    this.mixChecker.checkForMixes(items);
    const mix = this.mixChecker.getMix();
    if (mix != null) {
      this.onNewMix(mix);
    }
  }
  /** the player clicked the shmabledum: half of the time a mix proposal (if any), otherwise a general tip */
  giveSomeTip() {
    if (this.theLocker.isLocked) {
      return;
    }
    if (!services.tutorial.isMixKnown()) {
      this.giveBasicTip();
    } else if (Math.random() <= 0.5 && this.mixChecker.searchForSlotsMixes([this.game.getMixer().getSlot(3)])) {
      const mix = this.mixChecker.getMix();
      if (mix != null) {
        this.onNewMix(mix);
      } else {
        this.giveBasicTip();
      }
    } else {
      this.giveBasicTip();
    }
  }
  /** a random tip pbAdvice<N>; the first mixAdvices tips are about mixing, skipped while mixing is unknown */
  giveBasicTip() {
    let first = 1;
    if (!services.tutorial.isMixKnown()) {
      first = uint(services.config.get('Shmabledum').mixAdvices + 1);
    }
    const n = Random.nextRange(first, services.config.get('Shmabledum').advices);
    this.emitTip(new BubbleGumTip(services.texts.get('pbAdvice' + n)));
  }
  itemMixed(result: MixResult) {
    if (result.recipe != null) {
      this.emitTip(new SpecialMixTip(result.item));
    }
  }
  emitTip(interaction: ShmabledumInteraction) {
    if (this.theLocker.isLocked) {
      return;
    }
    this.onInteraction.emit(interaction);
  }
  onDungeon(dungeon: Dungeon) {
    dungeon.onWin.add(this.onWinDungeon);
    dungeon.onLose.add(this.onLoseDungeon);
    if (!ShmabledumPrincess.iceEnemyTipShowed) {
      dungeon.onFight.add(this.onFight);
    }
  }
  /** joy; plus a tip about the loot (fire / ice element items, or a mix with it) */
  onWinDungeon() {
    let interaction: ShmabledumInteraction = null;
    this.removeSubscriptions();
    this.lostDungeons = {};
    if (services.tutorial.isMixKnown()) {
      const loot = [];
      for (const slot of as3values(this.game.getDungeon().getLoot().getBooty())) {
        if (!slot.isEmpty()) {
          loot.push(slot.getContent());
        }
      }
      interaction = this.getElementInteraction(loot);
      if (interaction != null) {
        ShmabledumPrincess.elementTipShowed = true;
      } else {
        this.mixChecker.checkForMixes(loot);
        const mix = this.mixChecker.getMix();
        if (mix != null) {
          interaction = new ShmabledumFeltTip(this.getMixPropouse(mix), ShmabledumFeeling.getJoy());
        }
      }
    }
    if (interaction == null) {
      interaction = ShmabledumFeeling.getJoy();
    }
    this.onInteractionSignal.emit(interaction);
  }
  /** the first time a FireFlame / IceBlock drops: explains elements */
  getElementInteraction(items: Item[]): ShmabledumInteraction | null {
    let id: string = null;
    let text: string = null;
    if (!ShmabledumPrincess.elementTipShowed) {
      for (const item of as3values(items)) {
        id = item.id;
        if (id == ShmabledumPrincess.FIRE_FLAME) {
          text = services.texts.get('pbFire');
          break;
        }
        if (id == ShmabledumPrincess.ICE_BLOCK) {
          text = services.texts.get('pbIce');
          break;
        }
      }
    }
    if (text != null) {
      const tip = new BubbleGumTip(text, ItemFactory.getInstance().getItem(id));
      return new ShmabledumFeltTip(tip, ShmabledumFeeling.getJoy());
    }
    return null;
  }
  /** sadness; after losesForAdvice losses in the same dungeon, a tip too */
  onLoseDungeon() {
    this.removeSubscriptions();
    const id = this.game.getDungeon().getId();
    this.lostDungeons[id] = this.lostDungeons[id] != null ? this.lostDungeons[id] + 1 : 1;
    if (this.lostDungeons[id] >= this.lostForAdvice) {
      const tip = new BubbleGumTip(services.texts.get('pbLostSeveralTimes'));
      this.onInteractionSignal.emit(new ShmabledumFeltTip(tip, ShmabledumFeeling.getSadness()));
    } else {
      this.onInteractionSignal.emit(ShmabledumFeeling.getSadness());
    }
  }
  /** the first ice enemy: a tip */
  onFight(fight: Fight) {
    const element = fight.getEnemy().getElement();
    if (element.isOfIce && !this.getLocker().isLocked) {
      ShmabledumPrincess.iceEnemyTipShowed = true;
      this.game.getDungeon().onFight.remove(this.onFight);
      this.onInteractionSignal.emit(new BubbleGumTip(services.texts.get('pbIceEnemy')));
    }
  }
  onNewMix(recipe: MixRecipe) {
    this.onInteractionSignal.emit(this.getMixPropouse(recipe));
  }
  /** "mix <item1> with <item2>!" */
  getMixPropouse(recipe: MixRecipe): BubbleGumTip {
    const text = services.texts.get('pbSpecialMix', [recipe.item1.getNameToShow(), recipe.item2.getNameToShow()]);
    return new BubbleGumTip(text, recipe.item1, recipe.item2);
  }
  removeSubscriptions() {
    const dungeon = this.game.getDungeon();
    dungeon.onWin.remove(this.onWinDungeon);
    dungeon.onLose.remove(this.onLoseDungeon);
    if (!ShmabledumPrincess.iceEnemyTipShowed) {
      dungeon.onFight.remove(this.onFight);
    }
  }
  clear() {
    this.game.onDungeon.remove(this.onDungeon);
    if (this.game.getMixer() != null) {
      this.game.getMixer().onMixEnd.remove(this.itemMixed);
    }
    this.theLocker.clear();
    this.onInteractionSignal.clear();
    this.onInteractionSignal = null;
  }
}
bindMethods(ShmabledumPrincess);
