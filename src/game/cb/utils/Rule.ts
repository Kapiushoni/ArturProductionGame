import { Dictionary, as3values, bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

/** A set of named conditions: `completed` is emitted when all of them have been checked. */
export class Rule {
  completed = new Signal();
  private rules: any = new Dictionary(); // name -> checked

  constructor(...names: string[]) {
    for (const name of as3values(names)) {
      this.set(name);
    }
  }
  isCompleted(): boolean {
    for (const checked of as3values(this.rules)) {
      if (checked === false) {
        return false;
      }
    }
    return true;
  }
  check(name: string) {
    this.rules.set(name, true);
    if (this.isCompleted()) {
      this.completed.emit();
    }
  }
  set(name: string, checked = false) {
    this.rules.set(name, checked);
  }
}
bindMethods(Rule);
