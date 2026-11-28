import { Sprite } from '@/flash/as3';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { RogueliteConfig, type UnlockId, type UpgradeId } from '@/game/roguelite/RogueliteConfig';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, TextButton, label } from '@/game/view/screens/roguelite/widgets';

/** The bone shop of the roguelite mod (main menu): permanent upgrades and the item groups that can drop. */
export class ShopWindow extends Sprite {
  static readonly W = 540;
  static readonly H = 440;

  constructor(private onClose: () => void) {
    super();
    this.build();
  }
  /** (re)draws everything: after a purchase the prices, levels and bones change */
  private build() {
    while (this.numChildren > 0) this.removeChildAt(0);
    this.graphics.clear();
    const W = ShopWindow.W,
      H = ShopWindow.H;
    this.graphics.beginFill(0x000000, 0.6);
    this.graphics.drawRect(0, 0, 700, 500);
    const panel = new Sprite();
    panel.graphics.lineStyle(3, COLORS.frame, 1);
    panel.graphics.beginFill(COLORS.panel, 0.97);
    panel.graphics.drawRoundRect(0, 0, W, H, 22);
    panel.x = (700 - W) / 2;
    panel.y = (500 - H) / 2;
    this.addChild(panel);
    const title = label(rlText('shopTitle'), 26, COLORS.title, W);
    title.y = 12;
    panel.addChild(title);
    const bones = label(rlText('bones', Roguelite.bones), 18, COLORS.text, W);
    bones.y = 46;
    panel.addChild(bones);

    let y = 80;
    const row = (
      name: string,
      description: string,
      state: string,
      price: number | null,
      done: string,
      buy: () => void,
    ) => {
      const n = label(name, 17, COLORS.text, 230, 'left');
      n.x = 20;
      n.y = y;
      const d = label(description, 12, COLORS.dim, 300, 'left');
      d.x = 20;
      d.y = y + 19;
      const s = label(state, 14, COLORS.dim, 80, 'right');
      s.x = W - 200;
      s.y = y + 6;
      panel.addChild(n);
      panel.addChild(d);
      panel.addChild(s);
      const canBuy = price != null && Roguelite.bones >= price;
      const button = new TextButton(
        price == null ? done : rlText('buy', price),
        92,
        30,
        () => {
          if (canBuy) {
            buy();
            this.build();
          }
        },
        16,
      );
      button.x = W - 112;
      button.y = y + 4;
      button.alpha = canBuy ? 1 : 0.45;
      button.buttonMode = canBuy;
      panel.addChild(button);
      y += 38;
    };
    for (const id of Object.keys(RogueliteConfig.upgrades) as UpgradeId[]) {
      const level = Roguelite.level(id);
      row(
        rlText('up_' + id),
        rlText('upd_' + id),
        rlText('level', level, Roguelite.maxLevel(id)),
        Roguelite.price(id),
        rlText('maxed'),
        () => Roguelite.buy(id),
      );
    }
    for (const id of Object.keys(RogueliteConfig.unlocks) as UnlockId[]) {
      const done = Roguelite.isUnlocked(id);
      row(
        rlText('un_' + id),
        rlText('und_' + id),
        '',
        done ? null : RogueliteConfig.unlocks[id].price,
        rlText('bought'),
        () => Roguelite.buy(id),
      );
    }
    const close = new TextButton(rlText('close'), 160, 36, this.onClose);
    close.x = (W - 160) / 2;
    close.y = H - 50;
    panel.addChild(close);
  }
}
