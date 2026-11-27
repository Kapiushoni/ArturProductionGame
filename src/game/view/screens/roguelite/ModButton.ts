import { Sprite } from '@/flash/as3';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, TextButton, label } from '@/game/view/screens/roguelite/widgets';

/** The "MOD: ON / OFF" switch of the main menu (top left). onChange(on) after each switch. */
export class ModButton extends Sprite {
  private button: TextButton;

  constructor(private onChange: (on: boolean) => void) {
    super();
    this.button = new TextButton('', 150, 34, this.toggle, 18);
    this.addChild(this.button);
    const hint = label(rlText('modHint'), 13, COLORS.dim, 220, 'left');
    hint.x = 4;
    hint.y = 36;
    this.addChild(hint);
    this.refresh();
  }
  private toggle = () => {
    Roguelite.enabled = !Roguelite.enabled;
    this.refresh();
    this.onChange(Roguelite.enabled);
  };
  private refresh() {
    this.button.text(rlText(Roguelite.enabled ? 'modOn' : 'modOff'));
    this.button.alpha = Roguelite.enabled ? 1 : 0.8;
  }
}
