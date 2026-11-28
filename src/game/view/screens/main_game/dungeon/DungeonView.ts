import { Dictionary, as3as, bindMethods } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { app } from '@/game/app';
import { JinnView } from '@/game/view/figthers/JinnView';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { GameSounds } from '@/game/sound/GameSounds';
import { Buttons } from '@/game/util/Buttons';
import { Util } from '@/game/util/Util';
import { DieAnimation } from '@/game/view/figthers/animations/DieAnimation';
import { JoyAnimation } from '@/game/view/figthers/animations/JoyAnimation';
import { BackgroundView } from '@/game/view/screens/main_game/dungeon/BackgroundView';
import { EmptyInnerView } from '@/game/view/screens/main_game/dungeon/EmptyInnerView';
import { EnterDungeonView } from '@/game/view/screens/main_game/dungeon/fight/EnterDungeonView';
import { FightView } from '@/game/view/screens/main_game/dungeon/fight/FightView';
import { LostWindow } from '@/game/view/screens/main_game/dungeon/LostWindow';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { RunOverWindow } from '@/game/view/screens/roguelite/RunOverWindow';
import { rlText } from '@/game/view/screens/roguelite/texts';
import { COLORS, label } from '@/game/view/screens/roguelite/widgets';
import { TimeLine } from '@/game/view/screens/main_game/dungeon/TimeLine';
import { WinWindow } from '@/game/view/screens/main_game/dungeon/WinWindow';
import { Pause } from '@/game/view/screens/Pause';
import type { EndDungeonWindow } from '@/game/view/screens/main_game/dungeon/EndDungeonWindow';
import type { IDungeonState } from '@/game/view/screens/main_game/states/IDungeonState';
import type { IFight } from '@/game/main_game/dungeon/IFight';
import type { Item } from '@/game/main_game/items/Item';
import type { MouseEvent } from '@/flash/as3';

export class DungeonView extends Screen {
  dungeon: IDungeonState = null;
  jinnView: JinnView = null;
  timeLine: TimeLine = null;
  innerView: any = null;
  windowShowing: EndDungeonWindow = null;
  constructor(dungeon: IDungeonState) {
    super();
    this.dungeon = dungeon;
    dungeon.getDungeon().onFight.add(this.onFight);
    this.innerView = new EmptyInnerView(this.soundTrack);
    this.initScreen(BackgroundView, this.getButtonInfo());
    app.game.getJinn().onPotionConsumition.add(this.potionConsumition);
    this.background.jinnHud.changeFighter(app.game.getJinn());
    this.initialize();
    this.timeLine = new TimeLine(this);
    this.addChild(this.timeLine);
  }
  get background() {
    return as3as(this.bg, BackgroundView);
  }
  getButtonInfo() {
    const dict = new Dictionary();
    dict.set('information.pause', ButtonGroup.get('gui').createButton(this.pause, 'mouseOver', 'mouseOut'));
    return dict;
  }
  initialize() {
    Buttons.setButtons(this.background.information, ['pause'], true);
    this.background.init(DungeonFactory.getConfigFor(this.dungeon.getDungeon().getId()));
    this.playMusic();
    this.jinnView = new JinnView(app.game.getJinn());
    this.dungeon.getDungeon().onLose.add(this.dungeonLost);
    this.dungeon.getDungeon().onWin.add(this.dungeonWon);
    this.start();
  }
  playMusic() {
    app.soundManager.playMusic(this.soundTrack);
  }
  start() {
    this.innerView.clear();
    this.innerView = new EnterDungeonView(this.jinnView, this.background, this.dungeon.getDungeon().startFight);
  }
  potionConsumition(item: Item) {
    if (app.game.getJinn().stats.isDead()) {
      this.suddenDeath();
    }
  }
  suddenDeath() {
    this.innerView.pause();
    const dieAnimation = new DieAnimation();
    this.jinnView.animate(dieAnimation);
    dieAnimation.atFinish.add(Util.removeParams(this.dungeon.getDungeon().suddenDeath));
  }
  pauseFight() {
    if (this.windowShowing != null) {
      this.windowShowing.pause();
    }
    this.innerView.pause();
  }
  resumeFight() {
    if (this.windowShowing != null) {
      this.windowShowing.resume();
    }
    this.innerView.resume();
  }
  pause(event: MouseEvent) {
    if (app.game.getJinn().stats.isDead()) {
      return;
    }
    this.innerView.pause();
    const pause = new Pause(this.getDungeonLevel());
    pause.onLevelSelect.add(this.onLevelSelect);
    pause.onCancel.add(this.resume);
    pause.onReplay.add(this.onReplay);
    this.dungeon.pauseHolder.addChild(pause);
    pause.enter();
  }
  getDungeonLevel() {
    return app.game.map.getLevel(this.dungeon.getDungeon().getId());
  }
  resume() {
    this.playMusic();
    this.innerView.resume();
  }
  onLevelSelect() {
    this.dungeon.onToMap.emit();
  }
  onReplay() {
    this.gotoDungeonId(this.dungeon.getDungeon().getId());
  }
  gotoDungeonId(text: string) {
    const level = app.game.map.getLevel(text);
    this.dungeon.onToDungeon.emit(level);
  }
  onFight(fight: IFight) {
    this.innerView.clear();
    this.innerView = new FightView(fight, this.jinnView, this.background);
  }
  getStats() {
    return this.dungeon.getDungeon().getStats();
  }
  getLoot() {
    return this.dungeon.getDungeon().getLoot();
  }
  get soundTrack(): string {
    if (this.dungeon.getDungeon().getLevel().getArea() < 3) {
      return GameSounds.COMBAT_MUSIC;
    }
    return GameSounds.COMBAT_MUSIC2;
  }
  stopMusic() {
    app.soundManager.stopMusic(this.soundTrack);
  }
  dungeonLost() {
    this.stopMusic();
    Buttons.setButtons(this.background.information, ['pause'], false);
    if (Roguelite.enabled) {
      this.runOver();
      return;
    }
    const lostWindow = new LostWindow(this.getStats());
    this.showFinishWindow(lostWindow);
  }
  /** roguelite: "+N bones" at the top of the screen for a few seconds */
  showBones(bones: number) {
    const text = label(rlText('gotBones', bones), 26, COLORS.title, 700);
    text.y = 8;
    app.tutorialHolder.addChild(text);
    setTimeout(() => text.parent?.removeChild(text), 3500);
  }
  /** roguelite: one life, the run is over */
  runOver() {
    const result = Roguelite.endRun();
    app.saveSystem.switched();
    // above the whole game screen (the pause layer is under the inventory): the veil also blocks the game
    const holder = app.tutorialHolder;
    const window = new RunOverWindow(result, () => {
      holder.removeChild(window);
      this.dungeon.onToMainMenu.emit();
    });
    holder.addChild(window);
  }
  dungeonWon() {
    this.stopMusic();
    if (Roguelite.enabled) this.showBones(this.dungeon.getDungeon().bones);
    Buttons.setButtons(this.background.information, ['pause'], false);
    const joy = new JoyAnimation();
    this.jinnView.animate(joy);
    const winWindow = this.makeWinWindow();
    joy.atFinish.add((fighterAnimation) => {
      this.showFinishWindow(winWindow);
    });
  }
  makeWinWindow() {
    let callback = null;
    const nextLevel = app.game.map.getNextLevel(this.dungeon.getDungeon().getLevel());
    if (nextLevel != null && nextLevel.getArea() == this.dungeon.getDungeon().getLevel().getArea()) {
      callback = Util.l(this.dungeon.onToDungeon.emit, nextLevel);
    }
    return new WinWindow(this.getLoot(), this.getStats(), callback);
  }
  showFinishWindow(windowShowing: EndDungeonWindow) {
    this.windowShowing = windowShowing;
    windowShowing.onReplay.add(this.onReplay);
    windowShowing.onBackToMap.add(this.onLevelSelect);
    windowShowing.putIn(this.dungeon.pauseHolder);
    windowShowing.enter(this.endEnterFinishWindow);
  }
  endEnterFinishWindow() {
    if (this.jinnView) {
      this.jinnView.clear();
      this.jinnView = null;
    }
    this.innerView.clear();
    this.innerView = new EmptyInnerView(this.soundTrack);
    this.background.pauseScroll();
  }
  close() {
    app.game.getJinn().onPotionConsumition.remove(this.potionConsumition);
    this.innerView.clear();
    this.background.clear();
    this.pop();
    if (this.jinnView) {
      this.jinnView.clear();
      this.jinnView = null;
    }
    this.timeLine.clear();
    this.dungeon = null;
  }
}
bindMethods(DungeonView, [
  'start',
  'potionConsumition',
  'suddenDeath',
  'pause',
  'resume',
  'onLevelSelect',
  'onReplay',
  'onFight',
  'dungeonLost',
  'dungeonWon',
  'endEnterFinishWindow',
  'close',
]);
