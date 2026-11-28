import { Event, GlowFilter, MouseEvent, Point, Sprite } from '@/flash/as3';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { RogueliteConfig, type UnlockId, type UpgradeId } from '@/game/roguelite/RogueliteConfig';
import { Stage } from '@/flash/display';
import { ShopMerchant } from '@/game/view/screens/roguelite/ShopMerchant';
import { layer, loadShopArt, type ShopArt } from '@/game/view/screens/roguelite/shopArt';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, Label, TextButton, label } from '@/game/view/screens/roguelite/widgets';

/** what is for sale: the layer of the art, and the upgrade or the unlock it sells */
const GOODS: { art: string; id: UpgradeId | UnlockId; unlock: boolean }[] = [
  ...(Object.keys(RogueliteConfig.upgrades) as UpgradeId[]).map((id) => ({ art: 'item_' + id, id, unlock: false })),
  ...(Object.keys(RogueliteConfig.unlocks) as UnlockId[]).map((id) => ({ art: 'item_' + id, id, unlock: true })),
];
type Good = (typeof GOODS)[number];

/**
 * The bone shop of the roguelite mod (main menu): the merchant's shop drawn in Blender (public/assets/shop).
 * The goods on the shelves are the upgrades and unlocks: hover one to read it on the counter, click to pick it,
 * then "Buy". The merchant is alive (ShopMerchant), the candle flickers, the legendary chest sparkles.
 */
export class ShopScreen extends Sprite {
  private art: ShopArt;
  private merchant: ShopMerchant = null;
  private lastHover: Good = null;
  private flame = new Sprite();
  private light: Sprite = null;
  private sparkles = new Sprite();
  private items = new Map<Good, Sprite>();
  private tags = new Map<Good, Label>();
  private bones: Label;
  private board = new Sprite();
  private selected: Good = null;
  private shown: Good = null;
  private t0 = Date.now();

  constructor(private onClose: () => void) {
    super();
    // until the art is there: a dark veil that already takes the clicks
    this.graphics.beginFill(0x000000, 0.75);
    this.graphics.drawRect(0, 0, 700, 500);
    loadShopArt().then((art) => {
      this.art = art;
      this.build();
    });
  }

  private build() {
    const art = this.art;
    this.addChild(layer(art, 'back'));
    for (const good of GOODS) {
      const item = new Sprite();
      item.addChild(layer(art, good.art));
      item.buttonMode = true;
      item.addEventListener(MouseEvent.ROLL_OVER, () => this.hover(good, true));
      item.addEventListener(MouseEvent.ROLL_OUT, () => this.hover(good, false));
      item.addEventListener(MouseEvent.CLICK, () => this.pick(good));
      this.items.set(good, item);
      this.addChild(item);
    }
    // the chest's sparkles turn around their centre
    const sp = art.layout.pivots.sparkles;
    this.sparkles.addChild(layer(art, 'sparkles', sp));
    this.sparkles.x = sp[0];
    this.sparkles.y = sp[1];
    this.sparkles.mouseEnabled = this.sparkles.mouseChildren = false;
    this.addChild(this.sparkles);
    // the merchant behind the counter, his hands on it
    this.merchant = new ShopMerchant(art);
    this.addChild(this.merchant.body);
    this.addChild(this.merchant.head);
    // the counter, the sign and the barrel: drawn over the goods' row, but the mouse goes through to the goods
    this.overlay('front');
    this.addChild(this.merchant.handLeft);
    this.addChild(this.merchant.handRight);
    // the flame flickers from its base
    const fp = art.layout.pivots.flame;
    this.flame.addChild(layer(art, 'flame', fp));
    this.flame.x = fp[0];
    this.flame.y = fp[1];
    this.flame.mouseEnabled = this.flame.mouseChildren = false;
    this.addChild(this.flame);
    this.light = this.overlay('light');
    this.overlay('vignette');

    // texts: the sign, the price tags, the bones, the board
    const [sx, sy] = art.layout.sign;
    const sign = new Label(rlText('shopSign'), 28, 0x3a2410, 240, 'center', 'middle');
    sign.x = sx - 120;
    sign.y = sy;
    this.addChild(sign);
    for (const good of GOODS) {
      const l = art.layout.layers[good.art];
      const tag = label('', 13, COLORS.title, 110);
      tag.x = l.x + l.w / 2 - 55;
      tag.y = l.y + l.h - 2;
      this.tags.set(good, tag);
      this.addChild(tag);
    }
    this.bones = label('', 17, COLORS.title, 220, 'left');
    this.bones.x = 12;
    this.bones.y = 470;
    this.addChild(this.bones);
    const leave = new TextButton(rlText('leave'), 100, 30, () => this.close(), 16);
    leave.x = 590;
    leave.y = 462;
    this.addChild(leave);
    this.addChild(this.board);
    this.refresh();
    this.addEventListener(Event.ENTER_FRAME, this.animate);
  }

  /** a layer drawn over the others that does not take the mouse */
  private overlay(name: string): Sprite {
    const s = new Sprite();
    s.addChild(layer(this.art, name));
    s.mouseEnabled = s.mouseChildren = false;
    this.addChild(s);
    return s;
  }
  /** prices, levels, bones and the board after a purchase */
  private refresh() {
    this.bones.text = rlText('bones', Roguelite.bones);
    for (const good of GOODS) {
      const price = this.price(good);
      const tag = this.tags.get(good);
      tag.text = price == null ? rlText(good.unlock ? 'bought' : 'maxed') : rlText('price', price);
      this.items.get(good).alpha = price != null && Roguelite.bones < price ? 0.75 : 1;
    }
    this.showBoard(this.shown ?? this.selected);
  }
  private price(good: Good): number | null {
    if (good.unlock)
      return Roguelite.isUnlocked(good.id as UnlockId) ? null : RogueliteConfig.unlocks[good.id as UnlockId].price;
    return Roguelite.price(good.id as UpgradeId);
  }

  private hover(good: Good, over: boolean) {
    this.items.get(good).filters = over || good == this.selected ? [new GlowFilter(0xffe08a, 1, 10, 10, 2)] : [];
    this.shown = over ? good : null;
    this.showBoard(over ? good : this.selected);
    if (over && good != this.lastHover) {
      this.lastHover = good;
      this.merchant.talk();
    }
  }
  private pick(good: Good) {
    if (this.selected) this.items.get(this.selected).filters = [];
    this.selected = good;
    this.items.get(good).filters = [new GlowFilter(0xffe08a, 1, 10, 10, 2)];
    this.showBoard(good);
  }

  /** the info board: name, description, level, and the buy button of the picked good */
  private showBoard(good: Good) {
    while (this.board.numChildren > 0) this.board.removeChildAt(0);
    const { x, y, w } = this.art.layout.board;
    const text = (t: string, size: number, color: number, dy: number) => {
      const l = label(t, size, color, w);
      l.x = x;
      l.y = y + dy;
      this.board.addChild(l);
    };
    if (good == null) {
      text(rlText('pick'), 16, COLORS.text, 40);
      return;
    }
    const prefix = good.unlock ? 'un' : 'up';
    text(rlText(prefix + '_' + good.id), 19, COLORS.title, 6);
    text(rlText(prefix + 'd_' + good.id), 13, COLORS.text, 31);
    if (!good.unlock) {
      const id = good.id as UpgradeId;
      text(rlText('level', Roguelite.level(id), Roguelite.maxLevel(id)), 13, COLORS.dim, 49);
    }
    const price = this.price(good);
    if (price == null) {
      text(rlText(good.unlock ? 'bought' : 'maxed'), 18, COLORS.title, 70);
      return;
    }
    const can = Roguelite.bones >= price;
    if (good != this.selected) {
      text(rlText('price', price), 16, can ? COLORS.title : COLORS.dim, 70);
      return;
    }
    const buy = new TextButton(
      can ? rlText('buyFor', price) : rlText('notEnough'),
      170,
      30,
      () => {
        if (can && Roguelite.buy(good.id)) {
          this.merchant.laugh();
          this.refresh();
        }
      },
      15,
    );
    buy.x = x + (w - 170) / 2;
    buy.y = y + 66;
    buy.alpha = can ? 1 : 0.55;
    buy.buttonMode = can;
    this.board.addChild(buy);
  }

  /** the merchant lives, the flame flickers, the sparkles turn and pulse */
  private animate = () => {
    const t = (Date.now() - this.t0) / 1000;
    const mouse = this.globalToLocal(new Point(Stage.mx, Stage.my));
    this.merchant.update(t, [mouse.x, mouse.y]);
    this.flame.scaleY = 1 + 0.12 * Math.sin(t * 13) + 0.06 * Math.sin(t * 31);
    this.flame.scaleX = 1 + 0.06 * Math.sin(t * 17);
    if (this.light) this.light.alpha = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7);
    this.sparkles.rotation = (t * 15) % 360;
    const s = 1 + 0.08 * Math.sin(t * 3);
    this.sparkles.scaleX = this.sparkles.scaleY = s;
    this.sparkles.alpha = 0.7 + 0.3 * Math.sin(t * 5);
  };

  private close() {
    this.removeEventListener(Event.ENTER_FRAME, this.animate);
    this.onClose();
  }
}
