import { Sprite } from '@/flash/as3';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, GamePanel, TextButton, label } from '@/game/view/screens/roguelite/widgets';
import type { RunResult } from '@/game/roguelite/Roguelite';

/** "Run over": where the run ended, the best result, and the way back to the main menu. */
export class RunOverWindow extends Sprite {
  static readonly W = 420;
  static readonly H = 300;

  /** abandoned: the game was closed during a fight (shown in the main menu, with an OK button) */
  constructor(result: RunResult, onMenu: () => void, abandoned = false, onShop: () => void = null) {
    super();
    const W = RunOverWindow.W,
      H = RunOverWindow.H;
    // dark veil over the whole screen (it also takes the clicks off the game below)
    this.graphics.beginFill(0x000000, 0.6);
    this.graphics.drawRect(0, 0, 700, 500);
    const panel = new Sprite();
    panel.addChild(new GamePanel(W, H));
    panel.x = (700 - W) / 2;
    panel.y = (500 - H) / 2;
    this.addChild(panel);
    let y = 26;
    const line = (text: string, size: number, color: number = COLORS.text, gap = 8) => {
      const t = label(text, size, color, W);
      t.y = y;
      panel.addChild(t);
      y += size + gap;
    };
    line(rlText('runOver'), 30, COLORS.title, 14);
    if (abandoned) line(rlText('leftFight'), 13, COLORS.dim, 10);
    line(rlText('reached', result.reached), 20);
    line(
      result.newRecord ? rlText('record') : rlText('best', result.best),
      18,
      result.newRecord ? COLORS.title : COLORS.text,
    );
    line(rlText('runBones', result.bones) + '   ·   ' + rlText('bones', result.totalBones), 16, COLORS.title);
    line(rlText('runs', result.runs), 16, COLORS.dim);
    const button = new TextButton(rlText(abandoned ? 'ok' : 'newRun'), onShop ? 180 : 210, 48, () => {
      button.mouseEnabled = false;
      onMenu();
    });
    button.x = (W - 210) / 2;
    button.y = H - 74;
    panel.addChild(button);
    if (onShop) {
      // two buttons side by side: the shop, then the new run
      const shop = new TextButton(rlText('shop'), 160, 48, onShop);
      shop.x = W / 2 - 175;
      shop.y = H - 74;
      button.x = W / 2 + 5;
      panel.addChild(shop);
    }
  }
}
