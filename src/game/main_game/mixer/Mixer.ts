// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';
import { main } from '@/game/main';
import { Slot } from '@/game/main_game/item_containers/Slot';
import { MixerClock } from '@/game/main_game/mixer/MixerClock';
import { MixSlot } from '@/game/main_game/mixer/MixSlot';
import { MixStrategy } from '@/game/main_game/mixer/MixStrategy';
import { GameSounds } from '@/game/sound/GameSounds';

export class Mixer {
  declare clock: any;
  declare onMixStart: any;
  declare onMixEnd: any;
  declare slot_1: any;
  declare slot_2: any;
  declare slot_3: any;
  declare strat: any;
  constructor() {
         
         this.slot_1 = new Slot();
         this.slot_2 = new Slot();
         this.slot_3 = new MixSlot();
         this.strat = new MixStrategy();
         this.onMixEnd = new Signal();
         this.onMixStart = new Signal();
         this.loadData();
      }
  loadData() {
         var item = null;
         item = main.saveSystem.loadMixItem(1);
         if(item != null)
         {
            this.slot_1.add(item);
         }
         this.slot_1.onChange.add(this.saveSlot(1));
         item = main.saveSystem.loadMixItem(2);
         if(item != null)
         {
            this.slot_2.add(item);
         }
         this.slot_2.onChange.add(this.saveSlot(2));
         item = main.saveSystem.loadMixItem(3);
         if(item != null)
         {
            this.slot_3.add(item);
         }
         this.slot_3.onChange.add(this.saveSlot(3));
      }
  saveSlot(num) { num = uint(num);
         var i = uint(num);
         return function(slotChange)
         {
            main.saveSystem.saveMix(i,slotChange.getNewItem());
         };
      }
  canMix() {
         return !this.slot_1.isEmpty() && !this.slot_2.isEmpty() && this.slot_3.isEmpty() && this.clock == null;
      }
  startMix() {
         if(!this.canMix())
         {
            return;
         }
         this.lock();
         this.clock = new MixerClock(this.slot_1.getContent(),this.slot_2.getContent());
         this.clock.atEndMix.add(this.endMix);
         this.clock.start();
         this.onMixStart.emit();
      }
  endMix() {
         this.unlock();
         var content = this.slot_1.getContent();
         var content2 = this.slot_2.getContent();
         var mix = this.strat.getMix(content,content2);
         var item = mix.item;
         this.slot_1.remove(content);
         this.slot_2.remove(content2);
         this.slot_3.add(item);
         this.clock = null;
         this.onMixEnd.emit(mix);
         if(mix.recipe != null && mix.recipe.mustShow)
         {
            main.saveSystem.saveRecipe(mix.recipe);
         }
         main.saveSystem.savePendingItems();
         main.soundManager.playFx(GameSounds.MIX_DONE);
         if(item.getID() == "FriendlyRockJr")
         {
            main.achievementDispatcher.friendlyRockJrObtained();
         }
         main.achievementDispatcher.madeMix();
      }
  lock() {
         this.slot_1.lock();
         this.slot_2.lock();
         this.slot_3.lock();
      }
  unlock() {
         this.slot_1.unlock();
         this.slot_2.unlock();
         this.slot_3.unlock();
      }
  getSlot(num) { num = uint(num);
         return this["slot_" + num];
      }
  clear() {
         this.slot_1.clear();
         this.slot_2.clear();
         this.slot_3.clear();
         this.onMixEnd.clear();
         this.onMixEnd = null;
         this.onMixStart.clear();
         this.onMixStart = null;
         if(this.clock != null)
         {
            this.clock.stop();
         }
         this.clock = null;
      }
}
Mixer.prototype.clock = null;
Mixer.prototype.onMixStart = null;
Mixer.prototype.onMixEnd = null;
Mixer.prototype.slot_1 = null;
Mixer.prototype.slot_2 = null;
Mixer.prototype.slot_3 = null;
Mixer.prototype.strat = null;
bindMethods(Mixer);
