import { Dictionary, TextFormat, bindMethods } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { DailyBonus } from '@/game/bonus/DailyBonus';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Signal } from '@/game/cb/signals/Signal';
import { Rule } from '@/game/cb/utils/Rule';
import { app } from '@/game/app';
import { GameSounds } from '@/game/sound/GameSounds';
import { Buttons } from '@/game/util/Buttons';
import { ConfirmationPopUp } from '@/game/view/screens/ConfirmationPopUp';
import { DailyBonusView } from '@/game/view/screens/DailyBonusView';
import { Roguelite } from '@/game/roguelite/Roguelite';
import { ModButton } from '@/game/view/screens/roguelite/ModButton';
import { RunOverWindow } from '@/game/view/screens/roguelite/RunOverWindow';
import { ShopWindow } from '@/game/view/screens/roguelite/ShopWindow';
import type { MouseEvent } from '@/flash/as3';

export class MainMenu extends Screen {
  static BUTTONS = ['new_game', 'continue_game', 'sound'];
  static readonly ActiveMessage = 'dailyBonusCurrent';
  static readonly NextMessage = 'dailyBonusNext';
  onNewGame: Signal = null;
  onContinueGame: Signal = null;
  currentBonus: DailyBonusView = null;
  nextBonus: DailyBonusView = null;
  constructor() {
    super();
    this.initScreen(app.swfLoader.getClass('assets.MainMenu'), this.getButtonInfo());
    this.container = 'container';
    this.initialize();
    this.initializeDailyBonus();
    this.bg.gotoAndStop(0);
  }
  getButtonInfo() {
    const dict = new Dictionary();
    const buttonGroup = ButtonGroup.get('gui');
    dict.set('new_game', buttonGroup.createButton(this.newGame, 'mouseOver', 'mouseOut'));
    dict.set('continue_game', buttonGroup.createButton(this.continueGame, 'mouseOver', 'mouseOut'));
    dict.set('sound', ButtonGroup.get('sound_gui').createButton(null, 'mouseOver', 'mouseOut'));
    return dict;
  }
  initialize() {
    const textFormat = new TextFormat();
    textFormat.size = 43;
    this.bg.container.new_game.title.title.defaultTextFormat = textFormat;
    this.bg.container.continue_game.title.title.defaultTextFormat = textFormat;
    this.bg.container.new_game.title.title.text = app.locale.get('new_game');
    this.bg.container.continue_game.title.title.text = app.locale.get('continue');
    Buttons.setButtons(this.bg.container, ['new_game', 'sound'], true);
    this.initializeMod();
    this.refreshContinue();
    this.onNewGame = new Signal();
    this.onContinueGame = new Signal();
    app.soundManager.updateSoundButton(this.bg.container.getChildByName('sound'));
    app.soundManager.playMusic(GameSounds.INTRO_MUSIC);
  }
  /** "continue" works when the current save (normal, or the roguelite run) has a game */
  refreshContinue() {
    if (app.saveSystem.hasPlayed()) {
      this.bg.container['continue_game'].gotoAndStop('idle');
      Buttons.setButtons(this.bg.container, ['continue_game'], true);
    } else {
      this.bg.container['continue_game'].gotoAndStop('locked');
      Buttons.setButtons(this.bg.container, ['continue_game'], false);
    }
  }
  /** the roguelite switch (top left); a run left in the middle of a fight is lost */
  initializeMod() {
    const button = new ModButton(
      () => {
        app.saveSystem.switched();
        this.refreshContinue();
      },
      () => {
        const shop = new ShopWindow(() => {
          this.bg.removeChild(shop);
          button.refresh();
        });
        this.bg.addChild(shop);
      },
    );
    button.x = 10;
    button.y = 8;
    this.bg.addChild(button);
    if (Roguelite.enabled && Roguelite.leftDuringFight) {
      const result = Roguelite.endRun();
      app.saveSystem.switched();
      const window = new RunOverWindow(result, () => this.bg.removeChild(window), true);
      this.bg.addChild(window);
    }
  }
  initializeDailyBonus() {
    let text = null;
    if (app.activeBonus) {
      this.currentBonus = new DailyBonusView(app.activeBonus, app.locale.get(MainMenu.ActiveMessage));
      this.bg.container.hoder_1.addChild(this.currentBonus);
    }
    let date = new Date();
    let bonusOfDate = null;
    let i = 0;
    while (i < 7) {
      date = new Date(date.time + 1000 * 60 * 60 * 24);
      bonusOfDate = DailyBonus.getBonusOfDate(date);
      if (bonusOfDate) {
        break;
      }
      i++;
    }
    if (!bonusOfDate) {
      date = DailyBonus.getNextSpecialBonusDate(new Date());
      if (date) {
        bonusOfDate = DailyBonus.getBonusOfDate(date);
      }
    }
    if (bonusOfDate) {
      text = app.locale.get(MainMenu.NextMessage, [date.getFullYear(), date.getMonth() + 1, date.getDate()]);
      this.nextBonus = new DailyBonusView(bonusOfDate, text);
      this.bg.container.hoder_2.addChild(this.nextBonus);
    }
  }
  enter(callback: Function = null) {
    this.showBonus(callback);
  }
  showBonus(callback: Function = null) {
    const next = callback;
    const rule = new Rule('start');
    if (next != null) {
      rule.completed.add(next);
    }
    if (this.currentBonus != null) {
      rule.set('current');
      this.currentBonus.enter(function () {
        rule.check('current');
      });
    }
    if (this.nextBonus != null) {
      rule.set('next');
      this.nextBonus.enter(function () {
        rule.check('next');
      });
    }
    rule.check('start');
  }
  continueGame(event: MouseEvent) {
    Buttons.setButtons(this.bg.container, MainMenu.BUTTONS, false);
    this.onContinueGame.emit();
  }
  newGame(event: MouseEvent) {
    Buttons.setButtons(this.bg.container, MainMenu.BUTTONS, false);
    if (app.saveSystem.hasPlayed()) {
      this.showConfirmationPopUp();
    } else {
      this.onNewGame.emit();
    }
  }
  showConfirmationPopUp() {
    const text = app.locale.get('new_gameConfirmation');
    const confirmationPopUp = new ConfirmationPopUp(this.bg.container, this.onNewGame.emit, this.cancelPopUp, text);
    this.bg.addChild(confirmationPopUp);
    confirmationPopUp.enter();
  }
  cancelPopUp() {
    Buttons.setButtons(this.bg.container, MainMenu.BUTTONS, true);
  }
  exit() {
    this.removeEvents();
    this.pop();
  }
  clear() {
    this.onNewGame.clear();
    this.onContinueGame.clear();
    this.onNewGame = null;
    this.onContinueGame = null;
    if (this.currentBonus != null) {
      this.currentBonus.clear();
    }
    if (this.nextBonus != null) {
      this.nextBonus.clear();
    }
    super.clear();
  }
}
bindMethods(MainMenu, ['enter', 'continueGame', 'newGame', 'cancelPopUp', 'exit', 'clear']);
