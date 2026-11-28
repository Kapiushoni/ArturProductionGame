import { Sprite } from '@/flash/as3';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, TextButton, label } from '@/game/view/screens/roguelite/widgets';
import type { RunResult } from '@/game/roguelite/Roguelite';

/** "Run over": where the run ended, the best result, and the way back to the main menu. */
export class RunOverWindow extends Sprite {
  static readonly W = 380;
  static readonly H = 280;

  /** abandoned: the game was closed during a fight (shown in the main menu, with an OK button) */
  constructor(result: RunResult, onMenu: () => void, abandoned = false) {
    super();
    const W = RunOverWindow.W,
      H = RunOverWindow.H;
    // dark veil over the whole screen (it also takes the clicks off the game below)
    this.graphics.beginFill(0x000000, 0.6);
    this.graphics.drawRect(0, 0, 700, 500);
    const panel = new Sprite();
    panel.graphics.lineStyle(3, COLORS.frame, 1);
    panel.graphics.beginFill(COLORS.panel, 0.97);
    panel.graphics.drawRoundRect(0, 0, W, H, 22);
    panel.x = (700 - W) / 2;
    panel.y = (500 - H) / 2;
    this.addChild(panel);
    let y = 18;
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
    const button = new TextButton(rlText(abandoned ? 'ok' : 'toMenu'), 200, 40, () => {
      button.mouseEnabled = false;
      onMenu();
    });
    button.x = (W - 200) / 2;
    button.y = H - 58;
    panel.addChild(button);
  }
}
