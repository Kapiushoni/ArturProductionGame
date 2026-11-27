import { Dictionary, TextFormat, bindMethods } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { DailyBonus } from '@/game/bonus/DailyBonus';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { Signal } from '@/game/cb/signals/Signal';
import { Rule } from '@/game/cb/utils/Rule';
import { main } from '@/game/main';
import { GameSounds } from '@/game/sound/GameSounds';
import { Buttons } from '@/game/util/Buttons';
import { ConfirmationPopUp } from '@/game/view/screens/ConfirmationPopUp';
import { DailyBonusView } from '@/game/view/screens/DailyBonusView';

export class MainMenu extends Screen {
  static BUTTONS = ['new_game', 'continue_game', 'sound'];
  static readonly ActiveMessage = 'dailyBonusCurrent';
  static readonly NextMessage = 'dailyBonusNext';
  onNewGame: any = null;
  onContinueGame: any = null;
  currentBonus: any = null;
  nextBonus: any = null;
  constructor() {
    super();
    this.initScreen(main.swfLoader.getClass('assets.MainMenu'), this.getButtonInfo());
    this.container = 'container';
    this.initialize();
    this.initializeDailyBonus();
    this.bg.gotoAndStop(0);
  }
  getButtonInfo() {
    var dict = new Dictionary();
    var buttonGroup = ButtonGroup.get('gui');
    dict.set('new_game', buttonGroup.createButton(this.newGame, 'mouseOver', 'mouseOut'));
    dict.set('continue_game', buttonGroup.createButton(this.continueGame, 'mouseOver', 'mouseOut'));
    dict.set('sound', ButtonGroup.get('sound_gui').createButton(null, 'mouseOver', 'mouseOut'));
    return dict;
  }
  initialize() {
    var textFormat = new TextFormat();
    textFormat.size = 43;
    this.bg.container.new_game.title.title.defaultTextFormat = textFormat;
    this.bg.container.continue_game.title.title.defaultTextFormat = textFormat;
    this.bg.container.new_game.title.title.text = main.locale.get('new_game');
    this.bg.container.continue_game.title.title.text = main.locale.get('continue');
    Buttons.setButtons(this.bg.container, ['new_game', 'sound'], true);
    if (main.saveSystem.hasPlayed()) {
      this.bg.container['continue_game'].gotoAndStop('idle');
      Buttons.setButtons(this.bg.container, ['continue_game'], true);
    } else {
      this.bg.container['continue_game'].gotoAndStop('locked');
      Buttons.setButtons(this.bg.container, ['continue_game'], false);
    }
    this.onNewGame = new Signal();
    this.onContinueGame = new Signal();
    main.soundManager.updateSoundButton(this.bg.container.getChildByName('sound'));
    main.soundManager.playMusic(GameSounds.INTRO_MUSIC);
  }
  initializeDailyBonus() {
    var text = null;
    if (main.activeBonus) {
      this.currentBonus = new DailyBonusView(main.activeBonus, main.locale.get(MainMenu.ActiveMessage));
      this.bg.container.hoder_1.addChild(this.currentBonus);
    }
    var date = new Date();
    var bonusOfDate = null;
    var i = 0;
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
      text = main.locale.get(MainMenu.NextMessage, [date.getFullYear(), date.getMonth() + 1, date.getDate()]);
      this.nextBonus = new DailyBonusView(bonusOfDate, text);
      this.bg.container.hoder_2.addChild(this.nextBonus);
    }
  }
  enter(callback: Function = null) {
    this.showBonus(callback);
  }
  showBonus(callback: Function = null) {
    var rule = null;
    var next = callback;
    rule = new Rule('start');
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
  continueGame(event: any) {
    Buttons.setButtons(this.bg.container, MainMenu.BUTTONS, false);
    this.onContinueGame.emit();
  }
  newGame(event: any) {
    Buttons.setButtons(this.bg.container, MainMenu.BUTTONS, false);
    if (main.saveSystem.hasPlayed()) {
      this.showConfirmationPopUp();
    } else {
      this.onNewGame.emit();
    }
  }
  showConfirmationPopUp() {
    var text = main.locale.get('new_gameConfirmation');
    var confirmationPopUp = new ConfirmationPopUp(this.bg.container, this.onNewGame.emit, this.cancelPopUp, text);
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
bindMethods(MainMenu);
