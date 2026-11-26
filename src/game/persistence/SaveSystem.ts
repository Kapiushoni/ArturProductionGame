// @ts-nocheck
import { bindMethods, int, uint } from '@/flash/as3';
import { GameLoop } from '@/game/cb/gameloop/GameLoop';
import { main } from '@/game/main';
import { ItemFactory } from '@/game/main_game/items/ItemFactory';
import { SharedUtils } from '@/game/persistence/SharedUtils';

export class SaveSystem {
  static readonly SAVE_FILE = "cbjs";
  static readonly SOUND = "m";
  static readonly PLAYED = "p";
  static readonly LAST_PLAYED = "lp";
  static readonly CLEARED_LEVELS = "cl";
  static readonly EXPERIENCE = "xp";
  static readonly TUTORIAL = "t";
  static readonly RECIPES = "r";
  declare pendingSaves: any;
  declare _recipes: any;
  declare gameLoop: any;
  declare recipesChange: any;
  declare lastPlayed: any;
  constructor(displayObject) {
         
         this.recipesChange = false;
         this.gameLoop = new GameLoop(displayObject);
         this.pendingSaves = {};
         this.gameLoop.updated.add(this.realSavePending);
      }
  static getSaveIdForInventory(num) { num = uint(num);
         return "i" + num;
      }
  static getSaveIdForGear(num) { num = uint(num);
         return "g" + num;
      }
  static getSaveIdForMix(num) { num = uint(num);
         return "m" + num;
      }
  static getSaveIdForlevel(text) {
         return "d" + text;
      }
  hasPlayed() {
         return Boolean(SharedUtils.load(SaveSystem.SAVE_FILE,SaveSystem.PLAYED));
      }
  onFirstPlay() {
         SharedUtils.save(SaveSystem.SAVE_FILE,SaveSystem.PLAYED,true);
      }
  onTutorialComplete(num) { num = uint(num);
         SharedUtils.save(SaveSystem.SAVE_FILE,SaveSystem.TUTORIAL,num);
      }
  tutorialStepCompleted() {
         return uint(uint(SharedUtils.load(SaveSystem.SAVE_FILE,SaveSystem.TUTORIAL)));
      }
  savePendingItems() {
         this.gameLoop.start();
      }
  realSavePending(num) { num = int(num);
         this.savePending();
         this.gameLoop.stop();
      }
  savePending() {
         if(this.recipesChange)
         {
            this.pendingSaves[SaveSystem.RECIPES] = this.recipes;
            this.recipesChange = false;
         }
         SharedUtils.saveBulk(SaveSystem.SAVE_FILE,this.pendingSaves);
         this.pendingSaves = {};
      }
  saveInventorySlot(num, item) { num = uint(num);
         this.saveItem(item,SaveSystem.getSaveIdForInventory(num));
      }
  loadInventoryItem(num) { num = uint(num);
         return this.loadItem(SaveSystem.getSaveIdForInventory(num));
      }
  saveGear(num, item) { num = uint(num);
         this.saveItem(item,SaveSystem.getSaveIdForGear(num));
         this.savePendingItems();
      }
  loadGearItem(num) { num = uint(num);
         return this.loadItem(SaveSystem.getSaveIdForGear(num));
      }
  saveMix(num, item) { num = uint(num);
         this.saveItem(item,SaveSystem.getSaveIdForMix(num));
      }
  loadMixItem(num) { num = uint(num);
         return this.loadItem(SaveSystem.getSaveIdForMix(num));
      }
  saveRecipe(recipe) {
         var num = int(this.recipes.indexOf(recipe.getId()));
         if(num < 0)
         {
            this.recipes.push(recipe.getId());
            this.recipesChange = true;
         }
      }
  get recipes() {
         if(this._recipes == null)
         {
            this._recipes = SharedUtils.load(SaveSystem.SAVE_FILE,SaveSystem.RECIPES);
            if(this._recipes == null)
            {
               this._recipes = new Array();
            }
         }
         return this._recipes;
      }
  saveItem(item, text) {
         if(item == null)
         {
            this.pendingSaves[text] = null;
         }
         else
         {
            this.pendingSaves[text] = item.toObject();
         }
      }
  loadItem(text) {
         var obj = SharedUtils.load(SaveSystem.SAVE_FILE,text);
         if(obj == null)
         {
            return null;
         }
         return ItemFactory.getInstance().itemFromObject(obj);
      }
  getClearedLevels() {
         var obj = SharedUtils.load(SaveSystem.SAVE_FILE,SaveSystem.CLEARED_LEVELS);
         if(obj == null)
         {
            obj = [];
         }
         return obj;
      }
  saveClearedLevel(text) {
         var clearedLevels = this.getClearedLevels();
         if(clearedLevels.indexOf(text) < 0)
         {
            clearedLevels.push(text);
         }
         SharedUtils.save(SaveSystem.SAVE_FILE,SaveSystem.CLEARED_LEVELS,clearedLevels);
      }
  saveLastPlayed(lastPlayed) {
         this.lastPlayed = lastPlayed;
         this.pendingSaves[SaveSystem.LAST_PLAYED] = this.lastPlayed;
      }
  getLastPlayed() {
         if(this.lastPlayed == null)
         {
            this.lastPlayed = SharedUtils.load(SaveSystem.SAVE_FILE,SaveSystem.LAST_PLAYED) || "1";
         }
         return this.lastPlayed;
      }
  saveExperience(num) { num = uint(num);
         SharedUtils.save(SaveSystem.SAVE_FILE,SaveSystem.EXPERIENCE,num);
      }
  getExperience() {
         return uint(uint(SharedUtils.load(SaveSystem.SAVE_FILE,SaveSystem.EXPERIENCE)));
      }
  saveMuteState(flag) {
         SharedUtils.save(SaveSystem.SAVE_FILE,SaveSystem.SOUND,flag);
      }
  isSoundMuted() {
         return Boolean(SharedUtils.load(SaveSystem.SAVE_FILE,SaveSystem.SOUND));
      }
  reset() {
         this._recipes = null;
         this.recipesChange = false;
         this.lastPlayed = "1";
         var flag = this.isSoundMuted();
         SharedUtils.clear(SaveSystem.SAVE_FILE);
         this.pendingSaves[SaveSystem.PLAYED] = false;
         this.pendingSaves[SaveSystem.TUTORIAL] = 0;
         this.pendingSaves[SaveSystem.RECIPES] = main.config.get("InitialConfig").initialRecipes;
         this.pendingSaves[SaveSystem.SOUND] = flag;
         this.pendingSaves[SaveSystem.EXPERIENCE] = main.config.get("InitialConfig").initialExperience;
         this.pendingSaves[SaveSystem.LAST_PLAYED] = "1";
         if(!main.config.get("InitialConfig").tutorialOn)
         {
            this.pendingSaves[SaveSystem.TUTORIAL] = 6;
         }
         var value = int(main.config.get("InitialConfig").clearedLevel);
         while(value > 0)
         {
            this.saveClearedLevel(value.toString());
            value--;
         }
         var i = int(0);
         var list = main.config.get("InitialConfig").inventory;
         while(i < 12 && i < list.length)
         {
            this.saveInventorySlot(i,ItemFactory.getInstance().getItem(list[i]));
            i++;
         }
         this.savePending();
      }
}
SaveSystem.prototype.pendingSaves = null;
SaveSystem.prototype._recipes = null;
SaveSystem.prototype.gameLoop = null;
SaveSystem.prototype.recipesChange = false;
SaveSystem.prototype.lastPlayed = null;
bindMethods(SaveSystem);
