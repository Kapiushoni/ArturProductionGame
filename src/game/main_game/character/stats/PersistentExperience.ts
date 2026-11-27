import { services } from '@/game/services';
import { Experience } from '@/game/main_game/character/stats/Experience';

/** The jinn's experience: loaded from the save and saved on every change once persistence has started. */
export class PersistentExperience extends Experience {
  private persist = false;

  startPersistence() {
    this.value = services.saveSystem.getExperience();
    this.refreshLevel();
    this.persist = true;
  }
  modifyValue(amount: number) {
    amount = Number(amount);
    super.modifyValue(amount);
    if (amount != 0 && this.persist) {
      services.saveSystem.saveExperience(this.value);
    }
  }
}
