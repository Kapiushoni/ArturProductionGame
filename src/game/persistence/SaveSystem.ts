import { bindMethods, int, uint } from '@/flash/as3';
import { services } from '@/game/services';
import { GameLoop } from '@/game/cb/gameloop/GameLoop';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { SharedUtils } from '@/game/persistence/SharedUtils';
import type { Item } from '@/game/main_game/items/Item';
import type { DisplayObject } from '@/flash/as3';

/**
 * The game save (one SharedObject "cbjs"). Simple values are written at once; items, the last played dungeon
 * and recipes are collected in pendingSaves and written together on the next frame (savePendingItems()).
 */
export class SaveSystem {
  static readonly SAVE_FILE = 'cbjs';
  static readonly SOUND = 'm';
  static readonly PLAYED = 'p';
  static readonly LAST_PLAYED = 'lp';
  static readonly CLEARED_LEVELS = 'cl';
  static readonly EXPERIENCE = 'xp';
  static readonly TUTORIAL = 't';
  static readonly RECIPES = 'r';
  private pendingSaves: Record<string, any>;
  private _recipes: number[] = null;
  private gameLoop: GameLoop;
  private recipesChange: boolean;
  private lastPlayed: string = null;

  /** displayObject: gives the frame event used to delay the pending saves */
  constructor(displayObject: DisplayObject) {
    this.recipesChange = false;
    this.gameLoop = new GameLoop(displayObject);
    this.pendingSaves = {};
    this.gameLoop.updated.add(this.realSavePending);
  }
  static getSaveIdForInventory(slot: number): string {
    return 'i' + uint(slot);
  }
  static getSaveIdForGear(slot: number): string {
    return 'g' + uint(slot);
  }
  static getSaveIdForMix(slot: number): string {
    return 'm' + uint(slot);
  }
  hasPlayed(): boolean {
    return Boolean(SharedUtils.load(SaveSystem.SAVE_FILE, SaveSystem.PLAYED));
  }
  onFirstPlay() {
    SharedUtils.save(SaveSystem.SAVE_FILE, SaveSystem.PLAYED, true);
  }
  onTutorialComplete(step: number) {
    SharedUtils.save(SaveSystem.SAVE_FILE, SaveSystem.TUTORIAL, uint(step));
  }
  tutorialStepCompleted(): number {
    return uint(SharedUtils.load(SaveSystem.SAVE_FILE, SaveSystem.TUTORIAL));
  }
  /** writes the pending saves on the next frame */
  savePendingItems() {
    this.gameLoop.start();
  }
  realSavePending(_elapsed: number) {
    this.savePending();
    this.gameLoop.stop();
  }
  savePending() {
    if (this.recipesChange) {
      this.pendingSaves[SaveSystem.RECIPES] = this.recipes;
      this.recipesChange = false;
    }
    SharedUtils.saveBulk(SaveSystem.SAVE_FILE, this.pendingSaves);
    this.pendingSaves = {};
  }
  saveInventorySlot(slot: number, item: Item | null) {
    this.saveItem(item, SaveSystem.getSaveIdForInventory(slot));
  }
  loadInventoryItem(slot: number): Item | null {
    return this.loadItem(SaveSystem.getSaveIdForInventory(slot));
  }
  saveGear(slot: number, item: Item | null) {
    this.saveItem(item, SaveSystem.getSaveIdForGear(slot));
    this.savePendingItems();
  }
  loadGearItem(slot: number): Item | null {
    return this.loadItem(SaveSystem.getSaveIdForGear(slot));
  }
  saveMix(slot: number, item: Item | null) {
    this.saveItem(item, SaveSystem.getSaveIdForMix(slot));
  }
  loadMixItem(slot: number): Item | null {
    return this.loadItem(SaveSystem.getSaveIdForMix(slot));
  }
  /** remembers a discovered recipe (saved with the pending saves) */
  saveRecipe(recipe: { getId(): number }) {
    if (this.recipes.indexOf(recipe.getId()) < 0) {
      this.recipes.push(recipe.getId());
      this.recipesChange = true;
    }
  }
  /** ids of the discovered recipes */
  get recipes(): number[] {
    if (this._recipes == null) {
      this._recipes = SharedUtils.load(SaveSystem.SAVE_FILE, SaveSystem.RECIPES);
      if (this._recipes == null) {
        this._recipes = [];
      }
    }
    return this._recipes;
  }
  saveItem(item: Item | null, saveId: string) {
    this.pendingSaves[saveId] = item == null ? null : item.toObject();
  }
  loadItem(saveId: string): Item | null {
    const saved = SharedUtils.load(SaveSystem.SAVE_FILE, saveId);
    if (saved == null) {
      return null;
    }
    return ItemFactory.getInstance().itemFromObject(saved);
  }
  getClearedLevels(): string[] {
    return SharedUtils.load(SaveSystem.SAVE_FILE, SaveSystem.CLEARED_LEVELS) ?? [];
  }
  saveClearedLevel(level: string) {
    const cleared = this.getClearedLevels();
    if (cleared.indexOf(level) < 0) {
      cleared.push(level);
    }
    SharedUtils.save(SaveSystem.SAVE_FILE, SaveSystem.CLEARED_LEVELS, cleared);
  }
  saveLastPlayed(level: string) {
    this.lastPlayed = level;
    this.pendingSaves[SaveSystem.LAST_PLAYED] = this.lastPlayed;
  }
  getLastPlayed(): string {
    if (this.lastPlayed == null) {
      this.lastPlayed = SharedUtils.load(SaveSystem.SAVE_FILE, SaveSystem.LAST_PLAYED) || '1';
    }
    return this.lastPlayed;
  }
  saveExperience(xp: number) {
    SharedUtils.save(SaveSystem.SAVE_FILE, SaveSystem.EXPERIENCE, uint(xp));
  }
  getExperience(): number {
    return uint(SharedUtils.load(SaveSystem.SAVE_FILE, SaveSystem.EXPERIENCE));
  }
  saveMuteState(muted: boolean) {
    SharedUtils.save(SaveSystem.SAVE_FILE, SaveSystem.SOUND, muted);
  }
  isSoundMuted(): boolean {
    return Boolean(SharedUtils.load(SaveSystem.SAVE_FILE, SaveSystem.SOUND));
  }
  /** new game: clears the save (keeps the sound setting) and writes the InitialConfig values from config.di */
  reset() {
    this._recipes = null;
    this.recipesChange = false;
    this.lastPlayed = '1';
    const muted = this.isSoundMuted();
    const initial = services.config.get('InitialConfig');
    SharedUtils.clear(SaveSystem.SAVE_FILE);
    this.pendingSaves[SaveSystem.PLAYED] = false;
    this.pendingSaves[SaveSystem.TUTORIAL] = 0;
    this.pendingSaves[SaveSystem.RECIPES] = initial.initialRecipes;
    this.pendingSaves[SaveSystem.SOUND] = muted;
    this.pendingSaves[SaveSystem.EXPERIENCE] = initial.initialExperience;
    this.pendingSaves[SaveSystem.LAST_PLAYED] = '1';
    if (!initial.tutorialOn) {
      this.pendingSaves[SaveSystem.TUTORIAL] = 6;
    }
    for (let level = int(initial.clearedLevel); level > 0; level--) {
      this.saveClearedLevel(level.toString());
    }
    const inventory = initial.inventory;
    for (let i = 0; i < 12 && i < inventory.length; i++) {
      this.saveInventorySlot(i, ItemFactory.getInstance().getItem(inventory[i]));
    }
    this.savePending();
  }
}
bindMethods(SaveSystem, [
  'tutorialStepCompleted',
  'realSavePending',
  'savePending',
  'saveMix',
  'saveRecipe',
  'saveClearedLevel',
  'getExperience',
]);
