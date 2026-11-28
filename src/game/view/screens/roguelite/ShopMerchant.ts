import { Sprite } from '@/flash/as3';
import { layer, type ShopArt } from '@/game/view/screens/roguelite/shopArt';

/** a part turning / moving around its pivot (pivot in screen pixels, relative to `origin`) */
function rig(art: ShopArt, name: string, origin: [number, number] = [0, 0]): Sprite {
  const pivot = art.layout.pivots[name];
  const s = new Sprite();
  s.addChild(layer(art, name, pivot));
  s.x = pivot[0] - origin[0];
  s.y = pivot[1] - origin[1];
  s.mouseEnabled = s.mouseChildren = false;
  return s;
}
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const ease = (from: number, to: number, k: number) => from + (to - from) * k;

/**
 * The merchant of the bone shop, alive: he breathes, his head sways and leans towards what you look at,
 * his eyes follow the mouse and blink, he clacks his jaw when he talks (a new good hovered) and laughs when you
 * buy (head bouncing, jaw chattering, eyes flaring, rubbing his hands), and drums his fingers when idle.
 * body / head (with jaw, eyes, eyelids) go behind the counter, the hands in front of it (frontParts()).
 */
export class ShopMerchant {
  readonly body: Sprite;
  readonly head: Sprite;
  readonly handLeft: Sprite;
  readonly handRight: Sprite;
  private jaw: Sprite;
  private eyes: Sprite;
  private blink: Sprite;
  private headY: number;
  private eyesAt: [number, number];
  private jawY: number;
  private handY: number;
  private handX: [number, number];
  // state
  private lookX = 0;
  private lookY = 0;
  private tilt = 0;
  private nextBlink = 2;
  private talkUntil = 0;
  private laughUntil = 0;
  private nextTap = 3;
  private glow = 1;
  private now = 0;

  constructor(art: ShopArt) {
    this.body = rig(art, 'body');
    this.head = rig(art, 'head');
    this.headY = this.head.y;
    const headPivot = art.layout.pivots.head;
    this.jaw = rig(art, 'jaw', headPivot);
    this.eyes = rig(art, 'eyes', headPivot);
    this.eyesAt = [this.eyes.x, this.eyes.y];
    this.jawY = this.jaw.y;
    this.blink = new Sprite();
    this.blink.addChild(layer(art, 'blink', headPivot));
    this.blink.visible = false;
    // inside the head: the jaw behind the skull, then the skull, the eyes and the eyelids
    this.head.addChildAt(this.jaw, 0);
    this.head.addChild(this.eyes);
    this.head.addChild(this.blink);
    this.handLeft = rig(art, 'hand_left');
    this.handRight = rig(art, 'hand_right');
    this.handY = this.handLeft.y;
    this.handX = [this.handLeft.x, this.handRight.x];
  }

  /** a good was hovered: a few words */
  talk(seconds = 0.7) {
    this.talkUntil = Math.max(this.talkUntil, this.now + seconds);
  }
  /** something was bought: a happy laugh */
  laugh() {
    this.laughUntil = this.now + 1.4;
    this.talkUntil = this.laughUntil;
    this.glow = 1.6;
  }

  /** t: seconds since the shop opened; mouse: the pointer on the screen (700 x 500) */
  update(t: number, mouse: [number, number]) {
    this.now = t;
    const laughing = t < this.laughUntil;
    const talking = t < this.talkUntil;

    // breathing: the robe swells from its bottom, the head rides on it
    const breath = Math.sin((2 * Math.PI * t) / 3.4);
    this.body.scaleY = 1 + 0.018 * breath;
    this.body.scaleX = 1 - 0.006 * breath;
    let headDy = -2 - 3 * breath;
    if (laughing) headDy -= 4 * Math.abs(Math.sin(t * 18));
    this.head.y = this.headY + headDy;

    // the head leans towards the mouse, and sways a little on its own
    const targetTilt =
      clamp((mouse[0] - 350) / 260, -1, 1) * 6 + 2.5 * Math.sin(t * 0.9) + (laughing ? 4 * Math.sin(t * 9) : 0);
    this.tilt = ease(this.tilt, targetTilt, 0.12);
    this.head.rotation = this.tilt;

    // the eyes follow the mouse inside their sockets, glow and blink
    this.lookX = ease(this.lookX, clamp((mouse[0] - 350) / 140, -1, 1) * 3.5, 0.2);
    this.lookY = ease(this.lookY, clamp((mouse[1] - 168) / 140, -1, 1) * 2.2, 0.2);
    this.eyes.x = this.eyesAt[0] + this.lookX;
    this.eyes.y = this.eyesAt[1] + this.lookY;
    this.glow = ease(this.glow, 1, 0.05);
    this.eyes.scaleX = this.eyes.scaleY = this.glow;
    this.eyes.alpha = clamp(0.8 + 0.2 * Math.sin(t * 2.3), 0, 1);
    if (t > this.nextBlink) {
      const closed = t < this.nextBlink + 0.13;
      this.blink.visible = closed;
      this.eyes.visible = !closed;
      if (!closed) this.nextBlink = t + 2 + Math.random() * 3.5 - (Math.random() < 0.25 ? 1.6 : 0); // sometimes a double blink
    }

    // the jaw: clacks while talking or laughing, now and then on its own
    let open = 0;
    if (talking) open = (laughing ? 4.5 : 3) * Math.max(0, Math.sin(t * (laughing ? 30 : 22)));
    else if (Math.sin(t * 0.7) > 0.985) open = 2 * Math.max(0, Math.sin(t * 20));
    this.jaw.y = this.jawY + open;
    this.jaw.rotation = open * 0.8;

    // the hands: rub each other while laughing, drum the counter when idle
    if (laughing) {
      const rub = Math.sin(t * 16);
      this.handLeft.x = this.handX[0] + 10 + 5 * rub;
      this.handRight.x = this.handX[1] - 10 - 5 * rub;
      this.handLeft.y = this.handRight.y = this.handY - 4;
    } else {
      this.handLeft.x = ease(this.handLeft.x, this.handX[0], 0.15);
      this.handRight.x = ease(this.handRight.x, this.handX[1], 0.15);
      let tap = 0;
      if (t > this.nextTap) {
        const k = t - this.nextTap;
        if (k < 0.8) tap = 3 * Math.abs(Math.sin(k * Math.PI * 5));
        else this.nextTap = t + 2.5 + Math.random() * 3;
      }
      this.handRight.y = ease(this.handRight.y, this.handY - tap, 0.5);
      this.handLeft.y = ease(this.handLeft.y, this.handY + 0.6 * Math.sin(t * 1.8), 0.2);
    }
  }
}
