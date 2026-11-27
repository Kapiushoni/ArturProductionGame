import { MovieClip, as3as, bindMethods, int } from '@/flash/as3';
import { GameLoop } from '@/game/cb/gameloop/GameLoop';
import { Signal } from '@/game/cb/signals/Signal';
import { app } from '@/game/app';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { AnimatedHudView } from '@/game/view/figthers/AnimatedHudView';
import { HudSetter } from '@/game/view/figthers/HudSetter';
import { HudSetterWithStats } from '@/game/view/figthers/HudSetterWithStats';
import { HudView } from '@/game/view/figthers/HudView';
import { BackgroundSet } from '@/game/view/screens/main_game/dungeon/BackgroundSet';
import { FightFeedback } from '@/game/view/screens/main_game/dungeon/fight/FightFeedback';
import type { DungeonConfigData } from '@/game/main_game/dungeon/DungeonConfigData';

export class BackgroundView extends MovieClip {
  declare layer1: any;
  declare layer2: any;
  declare layer3: any;
  declare information: any;
  declare arena: any;
  declare mist1: any;
  declare mist2: any;
  declare backgrounds1: any;
  declare backgrounds2: any;
  declare backgrounds3: any;
  declare paused: any;
  declare scrolling: any;
  declare gameLoop: any;
  declare onMove: any;
  declare enemyHudView: any;
  declare jinnHudView: any;
  declare jinnFeedback: any;
  declare enemyFeedback: any;
  constructor() {
    super();
    this.onMove = new Signal();
    this.enemyHudView = new AnimatedHudView(app.swfLoader.getClass('assets.EnemyBar'), new HudSetterWithStats());
    this.jinnHudView = new HudView(app.swfLoader.getClass('assets.JinnBar'), new HudSetter());
    this.setLayers();
    this.setPauseButton();
    this.paused = false;
    this.scrolling = false;
    this.gameLoop = new GameLoop(this);
    this.gameLoop.updated.add(this.scroll);
    this.enemyHudView.initialize(this.information);
    this.jinnHudView.initialize(this.information);
    this.jinnFeedback = new FightFeedback();
    this.enemyFeedback = new FightFeedback();
  }
  static get VELOCITY1() {
    return int(Dungeon.DungeonConfig['layer1_pps']);
  }
  static get ARENA_VELOCITY() {
    return int(Dungeon.DungeonConfig['layer2_pps']);
  }
  static get VELOCITY3() {
    return int(Dungeon.DungeonConfig['layer3_pps']);
  }
  static get MIST_VELOCITY() {
    return int(Dungeon.DungeonConfig['mist_pps']);
  }
  static get PIXEL_OVERLAP() {
    return 1;
  }
  static get MIST_OVERLAP() {
    return 130;
  }
  get enemyHud() {
    return this.enemyHudView;
  }
  get jinnHud() {
    return this.jinnHudView;
  }
  setLayers() {
    let clip = new MovieClip();
    this.addChild(clip);
    this.layer3 = clip;
    const cls = app.swfLoader.getClass('assets.Mist');
    this.mist1 = new cls();
    this.mist2 = new cls();
    this.addChild(this.mist1);
    this.addChild(this.mist2);
    this.mist2.x = this.mist1.x + this.mist1.width - BackgroundView.MIST_OVERLAP;
    clip = new MovieClip();
    this.addChild(clip);
    this.layer2 = clip;
    clip = new MovieClip();
    this.addChild(clip);
    this.arena = clip;
    clip = new MovieClip();
    this.addChild(clip);
    this.layer1 = clip;
    this.information = new MovieClip();
    this.addChild(this.information);
  }
  init(dungeonConfigData: DungeonConfigData) {
    this.backgrounds1 = new BackgroundSet(dungeonConfigData.backgroundsData[0]);
    this.backgrounds2 = new BackgroundSet(dungeonConfigData.backgroundsData[1]);
    this.backgrounds3 = new BackgroundSet(dungeonConfigData.backgroundsData[2]);
    this.setBackground(this.layer1, this.backgrounds1);
    this.setBackground(this.layer2, this.backgrounds2);
    this.setBackground(this.layer3, this.backgrounds3);
    this.jinnFeedback.showIn(this.information);
    this.jinnFeedback.x = 0;
    this.jinnFeedback.y = 210;
    this.enemyFeedback.showIn(this.information);
    this.enemyFeedback.x = 700;
    this.enemyFeedback.y = 210;
    this.gameLoop.start();
  }
  setPauseButton() {
    const clip = as3as(app.swfLoader.getObject('assets.ButtonPause'), MovieClip);
    this.information.addChild(clip);
    this.information.pause = clip;
    clip.x = Dungeon.DungeonConfig['pause_btn_x'];
    clip.y = Dungeon.DungeonConfig['pause_btn_y'];
  }
  addJinnFeddback(clip: any) {
    this.jinnFeedback.addFeedback(clip);
  }
  addEnemyFeddback(clip: any) {
    this.enemyFeedback.addFeedback(clip);
    clip.scaleX = -1;
    clip.number_heathl_parts_blocked.title.scaleX = -1;
  }
  setBackground(clip: any, backgroundSet: BackgroundSet) {
    const background = backgroundSet.getBackground();
    clip.addChild(background);
    clip['1'] = background;
    this.checkLayer(clip, backgroundSet);
  }
  checkLayer(clip: any, backgroundSet: BackgroundSet) {
    let background = null;
    if (clip['1'].x < -clip['1'].width) {
      clip.removeChild(clip['1']);
      clip['1'] = clip['2'];
      clip['2'] = null;
    }
    if (clip['2'] == null && clip['1'].x + clip['1'].width <= 750) {
      background = backgroundSet.getBackground();
      clip.addChild(background);
      clip['2'] = background;
      background.x = clip['1'].x + clip['1'].width - BackgroundView.PIXEL_OVERLAP;
    }
  }
  clear() {
    this.jinnFeedback.clear();
    this.jinnFeedback = null;
    this.enemyFeedback.clear();
    this.enemyFeedback = null;
    this.jinnHudView.clear();
    this.enemyHudView.clear();
    this.gameLoop.stop();
    this.onMove.clear();
    this.backgrounds1 = null;
    this.backgrounds2 = null;
    this.backgrounds3 = null;
  }
  beginScroll() {
    this.scrolling = true;
  }
  endScroll() {
    this.scrolling = false;
  }
  pauseScroll() {
    this.paused = true;
    this.jinnFeedback.pause();
    this.enemyFeedback.pause();
    this.gameLoop.stop();
  }
  resumeScroll() {
    this.paused = false;
    this.jinnFeedback.resume();
    this.enemyFeedback.resume();
    this.gameLoop.start();
  }
  scroll(num: number) {
    num = int(num);
    let MIST_VELOCITY = NaN;
    let VELOCITY1 = NaN;
    let ARENA_VELOCITY = NaN;
    let VELOCITY3 = NaN;
    if (!this.paused) {
      MIST_VELOCITY = Number(BackgroundView.MIST_VELOCITY);
      this.scrollMist(MIST_VELOCITY);
      if (this.scrolling) {
        VELOCITY1 = Number(BackgroundView.VELOCITY1);
        ARENA_VELOCITY = Number(BackgroundView.ARENA_VELOCITY);
        VELOCITY3 = Number(BackgroundView.VELOCITY3);
        this.layer1['1'].x -= VELOCITY1;
        if (this.layer1['2'] != null) {
          this.layer1['2'].x -= VELOCITY1;
        }
        this.layer2['1'].x -= ARENA_VELOCITY;
        if (this.layer2['2'] != null) {
          this.layer2['2'].x -= ARENA_VELOCITY;
        }
        this.layer3['1'].x -= VELOCITY3;
        if (this.layer3['2'] != null) {
          this.layer3['2'].x -= VELOCITY3;
        }
        this.checkLayer(this.layer1, this.backgrounds1);
        this.checkLayer(this.layer2, this.backgrounds2);
        this.checkLayer(this.layer3, this.backgrounds3);
        this.scrollMist(ARENA_VELOCITY);
        this.onMove.emit(ARENA_VELOCITY);
      }
    }
  }
  scrollMist(num: number) {
    num = Number(num);
    this.mist1.x -= num;
    this.mist2.x -= num;
    if (this.mist1.x < -this.mist1.width) {
      this.mist1.x = this.mist2.x;
      this.mist2.x = this.mist1.x + this.mist1.width - BackgroundView.PIXEL_OVERLAP;
    }
  }
}
// Defaults on the prototype, not field initializers: the MovieClip constructor already puts the named children of the clip (layer1, arena, ...) into these properties,
// and an initializer (run after the base constructor) would overwrite them.
BackgroundView.prototype.layer1 = null;
BackgroundView.prototype.layer2 = null;
BackgroundView.prototype.layer3 = null;
BackgroundView.prototype.information = null;
BackgroundView.prototype.arena = null;
BackgroundView.prototype.mist1 = null;
BackgroundView.prototype.mist2 = null;
BackgroundView.prototype.backgrounds1 = null;
BackgroundView.prototype.backgrounds2 = null;
BackgroundView.prototype.backgrounds3 = null;
BackgroundView.prototype.paused = false;
BackgroundView.prototype.scrolling = false;
BackgroundView.prototype.gameLoop = null;
BackgroundView.prototype.onMove = null;
BackgroundView.prototype.enemyHudView = null;
BackgroundView.prototype.jinnHudView = null;
BackgroundView.prototype.jinnFeedback = null;
BackgroundView.prototype.enemyFeedback = null;
bindMethods(BackgroundView);
