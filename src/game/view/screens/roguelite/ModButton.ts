import { Sprite } from '@/flash/as3';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, TextButton, label } from '@/game/view/screens/roguelite/widgets';
import type { Label } from '@/game/view/screens/roguelite/widgets';

/**
 * The roguelite corner of the main menu (top left): the "MOD: ON / OFF" switch, and while the mod is on,
 * the bones. onChange(on) after each switch. (The shop is on the map and after a run.)
 */
export class ModButton extends Sprite {
  private button: TextButton;
  private bones: Label;

  constructor(private onChange: (on: boolean) => void) {
    super();
    this.button = new TextButton('', 160, 44, this.toggle, 18);
    this.addChild(this.button);
    const hint = label(rlText('modHint'), 13, COLORS.dim, 220, 'left');
    hint.x = 4;
    hint.y = 46;
    this.addChild(hint);
    this.bones = label('', 15, COLORS.title, 220, 'left');
    this.bones.x = 4;
    this.bones.y = 62;
    this.addChild(this.bones);
    this.refresh();
  }
  private toggle = () => {
    Roguelite.enabled = !Roguelite.enabled;
    this.refresh();
    this.onChange(Roguelite.enabled);
  };
  /** the texts and what is shown (also after a purchase in the shop) */
  refresh() {
    const on = Roguelite.enabled;
    this.button.text(rlText(on ? 'modOn' : 'modOff'));
    this.bones.visible = on;
    this.bones.text = rlText('bones', Roguelite.bones);
  }
}
