import { Sprite } from '@/flash/as3';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, TextButton, label } from '@/game/view/screens/roguelite/widgets';
import type { TextField } from '@/flash/as3';

/**
 * The roguelite corner of the main menu (top left): the "MOD: ON / OFF" switch, and while the mod is on,
 * the bones and the shop. onChange(on) after each switch, onShop() to open the shop.
 */
export class ModButton extends Sprite {
  private button: TextButton;
  private shop: TextButton;
  private bones: TextField;

  constructor(
    private onChange: (on: boolean) => void,
    private onShop: () => void,
  ) {
    super();
    this.button = new TextButton('', 150, 34, this.toggle, 18);
    this.addChild(this.button);
    this.shop = new TextButton(rlText('shop'), 110, 34, () => this.onShop(), 18);
    this.shop.x = 158;
    this.addChild(this.shop);
    const hint = label(rlText('modHint'), 13, COLORS.dim, 220, 'left');
    hint.x = 4;
    hint.y = 36;
    this.addChild(hint);
    this.bones = label('', 15, COLORS.title, 220, 'left');
    this.bones.x = 4;
    this.bones.y = 52;
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
    this.button.alpha = on ? 1 : 0.8;
    this.shop.visible = on;
    this.bones.visible = on;
    this.bones.text = rlText('bones', Roguelite.bones);
  }
}
