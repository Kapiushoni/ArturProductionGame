// @ts-nocheck
import { Dictionary, __DEFER, as3as, bindMethods } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { main } from '@/game/main';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
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
import { TimeLine } from '@/game/view/screens/main_game/dungeon/TimeLine';
import { WinWindow } from '@/game/view/screens/main_game/dungeon/WinWindow';
import { Pause } from '@/game/view/screens/Pause';

export class DungeonView extends Screen {
  declare dungeon: any;
  declare jinnView: any;
  declare timeLine: any;
  declare innerView: any;
  declare windowShowing: any;
  constructor(dungeon) {super(__DEFER); const __self = this; 
         this.dungeon = dungeon;
         dungeon.getDungeon().onFight.add(this.onFight);
         this.innerView = new EmptyInnerView(this.soundTrack);
          this.__init_Screen(BackgroundView,this.getButtonInfo());
         main.game.getJinn().onPotionConsumition.add(this.potionConsumition);
         this.background.jinnHud.changeFighter(main.game.getJinn());
         this.initialize();
         this.timeLine = new TimeLine(this);
         __self.addChild(this.timeLine);
      }
  get background() {
         return as3as(this.bg, BackgroundView);
      }
  getButtonInfo() {
         var dict = new Dictionary();
         dict.set("information.pause", ButtonGroup.get("gui").createButton(this.pause,"mouseOver","mouseOut"));
         return dict;
      }
  initialize() {
         Buttons.setButtons(this.background.information,["pause"],true);
         this.background.init(DungeonFactory.getConfigFor(this.dungeon.getDungeon().getId()));
         this.playMusic();
         this.jinnView = CharacterFactory.getInstance().getJinnView(main.game.getJinn());
         this.dungeon.getDungeon().onLose.add(this.dungeonLost);
         this.dungeon.getDungeon().onWin.add(this.dungeonWon);
         this.start();
      }
  playMusic() {
         main.soundManager.playMusic(this.soundTrack);
      }
  start() {
         this.innerView.clear();
         this.innerView = new EnterDungeonView(this.jinnView,this.background,this.dungeon.getDungeon().startFight);
      }
  potionConsumition(item) {
         if(main.game.getJinn().stats.isDead())
         {
            this.suddenDeath();
         }
      }
  suddenDeath() {
         this.innerView.pause();
         var dieAnimation = new DieAnimation();
         this.jinnView.animate(dieAnimation);
         dieAnimation.getAtFinish().add(Util.removeParams(this.dungeon.getDungeon().suddenDeath));
      }
  pauseFight() {
         if(this.windowShowing != null)
         {
            this.windowShowing.pause();
         }
         this.innerView.pause();
      }
  resumeFight() {
         if(this.windowShowing != null)
         {
            this.windowShowing.resume();
         }
         this.innerView.resume();
      }
  pause(event) {
         if(main.game.getJinn().stats.isDead())
         {
            return;
         }
         this.innerView.pause();
         var pause = new Pause(this.getDungeonLevel());
         pause.onLevelSelect.add(this.onLevelSelect);
         pause.onCancel.add(this.resume);
         pause.onReplay.add(this.onReplay);
         this.dungeon.pauseHolder.addChild(pause);
         pause.enter();
      }
  getDungeonLevel() {
         return main.game.getMap().getLevel(this.dungeon.getDungeon().getId());
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
  gotoDungeonId(text) {
         var level = main.game.getMap().getLevel(text);
         this.dungeon.onToDungeon.emit(level);
      }
  onFight(fight) {
         this.innerView.clear();
         this.innerView = new FightView(fight,this.jinnView,this.background);
      }
  getStats() {
         return this.dungeon.getDungeon().getStats();
      }
  getLoot() {
         return this.dungeon.getDungeon().getLoot();
      }
  get soundTrack() {
         if(this.dungeon.getDungeon().getLevel().getArea() < 3)
         {
            return GameSounds.COMBAT_MUSIC;
         }
         return GameSounds.COMBAT_MUSIC2;
      }
  stopMusic() {
         main.soundManager.stopMusic(this.soundTrack);
      }
  dungeonLost() {
         this.stopMusic();
         Buttons.setButtons(this.background.information,["pause"],false);
         var lostWindow = new LostWindow(this.getStats());
         this.showFinishWindow(lostWindow);
      }
  dungeonWon() { const __self = this;
         var joy = null;
         var winWindow = null;
         this.stopMusic();
         Buttons.setButtons(this.background.information,["pause"],false);
         joy = new JoyAnimation();
         this.jinnView.animate(joy);
         winWindow = this.makeWinWindow();
         joy.getAtFinish().add(function(fighterAnimation)
         {
            __self.showFinishWindow(winWindow);
         });
      }
  makeWinWindow() {
         var callback = null;
         var nextLevel = main.game.getMap().getNextLevel(this.dungeon.getDungeon().getLevel());
         if(nextLevel != null && nextLevel.getArea() == this.dungeon.getDungeon().getLevel().getArea())
         {
            callback = Util.l(this.dungeon.onToDungeon.emit,nextLevel);
         }
         return new WinWindow(this.getLoot(),this.getStats(),callback);
      }
  showFinishWindow(windowShowing) {
         this.windowShowing = windowShowing;
         windowShowing.getOnReplay().add(this.onReplay);
         windowShowing.getOnBackToMap().add(this.onLevelSelect);
         windowShowing.putIn(this.dungeon.pauseHolder);
         windowShowing.enter(this.endEnterFinishWindow);
      }
  endEnterFinishWindow() {
         if(this.jinnView)
         {
            this.jinnView.clear();
            this.jinnView = null;
         }
         this.innerView.clear();
         this.innerView = new EmptyInnerView(this.soundTrack);
         this.background.pauseScroll();
      }
  close() { const __self = this;
         main.game.getJinn().onPotionConsumition.remove(this.potionConsumition);
         this.innerView.clear();
         this.background.clear();
         __self.pop();
         if(this.jinnView)
         {
            this.jinnView.clear();
            this.jinnView = null;
         }
         this.timeLine.clear();
         this.dungeon = null;
      }
}
DungeonView.prototype.dungeon = null;
DungeonView.prototype.jinnView = null;
DungeonView.prototype.timeLine = null;
DungeonView.prototype.innerView = null;
DungeonView.prototype.windowShowing = null;
bindMethods(DungeonView);
