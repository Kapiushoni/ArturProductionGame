import { Sprite } from '@/flash/as3';
import { Tween } from '@/game/cb/utils/Tween';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, GamePanel, label } from '@/game/view/screens/roguelite/widgets';
import type { Label } from '@/game/view/screens/roguelite/widgets';

/**
 * The roguelite run's bones at the top of the game screen ("Bones this run: N"), and a "+N" that rises
 * and fades every time bones are earned (an enemy beaten, a dungeon cleared). Does not take the mouse.
 */
export class RunHud extends Sprite {
  static readonly W = 250;
  private total: Label;

  constructor() {
    super();
    this.mouseEnabled = false;
    this.mouseChildren = false;
    this.addChild(new GamePanel(RunHud.W, 34, 0.45));
    this.x = (700 - RunHud.W) / 2;
    this.y = 3;
    this.total = label('', 15, COLORS.title, RunHud.W);
    this.total.y = 8;
    this.addChild(this.total);
    this.update(0, Roguelite.runBones);
    Roguelite.onEarn.add(this.update);
  }
  private update = (added: number, runBones: number) => {
    this.total.text = rlText('runBones', runBones);
    if (added > 0) this.pop(added);
  };
  /** "+N" under the counter, rising and fading */
  private pop(added: number) {
    const text = label(rlText('gotBones', added), 22, COLORS.title, RunHud.W);
    text.y = 34;
    this.addChild(text);
    Tween.to(text, 1600, { y: 54, alpha: 0 }, () => text.parent?.removeChild(text));
  }
  clear() {
    Roguelite.onEarn.remove(this.update);
    this.parent?.removeChild(this);
  }
}
