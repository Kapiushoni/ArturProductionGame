import { Dictionary, bindMethods, int, uint } from '@/flash/as3';
import { AnimatedScreen } from '@/game/view/screens/AnimatedScreen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Signal } from '@/game/cb/signals/Signal';
import { Tween } from '@/game/cb/utils/Tween';
import { app } from '@/game/app';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { LevelUp } from '@/game/view/popUp/LevelUp';
import type { DungeonStats } from '@/game/main_game/dungeon/DungeonStats';
import type { DisplayObjectContainer } from '@/flash/as3';
import type { MouseEvent } from '@/flash/as3';

export class LostWindow extends AnimatedScreen {
  onReplay: Signal = null;
  onBackToMap: Signal = null;
  experience = 0;
  stats: DungeonStats = null;
  constructor(stats: DungeonStats) {
    super();
    this.initAnimatedScreen(app.swfLoader.getClass('assets.LevelLose'), this.getButtonInfo());
    this.stats = stats;
    this.onReplay = new Signal();
    this.onBackToMap = new Signal();
    this.initialize();
  }
  putIn(displayObjectContainer: DisplayObjectContainer) {
    displayObjectContainer.addChild(this);
  }
  pause() {}
  resume() {}
  initialize() {
    this.bg.total.total_xp.numbers.gotoAndStop(1);
    this.bg.total.total.title.text = app.locale.get('lose_combat', [this.stats.level.getName()]);
    this.xp = 0;
  }
  get xp() {
    return int(this.experience);
  }
  set xp(value: number) {
    value = int(value);
    this.experience = int(value);
    this.bg.total.total_xp.numbers.title.text = app.locale.get('lose_xp_amount', [this.experience]);
  }
  enter(callback: Function = null) {
    super.enter(Util.l(this.showStats, callback));
    Buttons.setButtons(this.bg, ['replay', 'level_select'], true);
  }
  showStats(callback: Function = null) {
    const end = callback;
    if (end != null) {
      end();
    }
    Tween.to(this, 1000, { xp: this.stats.getCombatExperience() }, () => {
      this.bg.total.total_xp.numbers.gotoAndPlay(1);
      this.giveXp();
    });
  }
  giveXp() {
    const stats = app.game.getJinn().stats;
    const level = uint(stats.getLevel());
    stats.addXP(this.stats.getCombatExperience());
    if (level < stats.getLevel()) {
      new LevelUp();
    }
  }
  getButtonInfo() {
    const dict = new Dictionary();
    const buttonGroup = ButtonGroup.get('gui');
    dict.set('replay', buttonGroup.createButton(this.replay, 'mouseOver', 'mouseOut'));
    dict.set('level_select', buttonGroup.createButton(this.back, 'mouseOver', 'mouseOut'));
    return dict;
  }
  replay(event: MouseEvent) {
    this.emitAndLeave(this.onReplay);
  }
  back(event: MouseEvent) {
    this.emitAndLeave(this.onBackToMap);
  }
  emitAndLeave(signal2: Signal) {
    const signal = signal2;
    this.killTweens();
    Buttons.setButtons(this.bg, ['replay', 'level_select'], false);
    signal.emit();
    this.leave(() => {
      this.exit();
    });
  }
  killTweens() {
    if (Tween.isTweening(this)) {
      Tween.killTweensOf(this);
      this.giveXp();
    }
  }
  exit() {
    this.onBackToMap.clear();
    this.onReplay.clear();
    this.stats = null;
    this.removeEvents();
    this.pop();
  }
}
bindMethods(LostWindow, ['pause', 'resume', 'enter', 'showStats', 'giveXp', 'replay', 'back', 'emitAndLeave', 'exit']);
