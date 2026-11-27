import {
  Dictionary,
  MovieClip,
  Timer,
  TimerEvent,
  __DEFER,
  as3as,
  as3values,
  bindMethods,
  int,
  uint,
} from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { Lambda } from '@/game/actions/Lambda';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Signal } from '@/game/cb/signals/Signal';
import { cbArray } from '@/game/cb/utils/cbArray';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { main } from '@/game/main';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { LegendaryLevel } from '@/game/main_game/map/LegendaryLevel';
import { Buttons } from '@/game/util/Buttons';
import { Sepializer } from '@/game/util/Sepializer';
import { Util } from '@/game/util/Util';
import { ArrowView } from '@/game/view/screens/main_game/map/ArrowView';

export class MapView extends Screen {
  static readonly NEXT_BUTTON = 'pages.arrow_right';
  static readonly PREV_BUTTON = 'pages.arrow_left';
  onToMainMenu: any = null;
  onToDungeon: any = null;
  buttonsNames: any = null;
  map: any = null;
  nextArrow: any = null;
  prevArrow: any = null;
  actual_page = 0;
  lastPlayedTimer = new Timer(500, 1);
  constructor(map) {
    super(__DEFER);
    this.map = map;
    this.lastPlayedTimer.addEventListener(TimerEvent.TIMER_COMPLETE, this.refreshLastLevel);
    this.__init_Screen(main.swfLoader.getClass('assets.Map'), this.getButtonInfo());
    this.actual_page = uint(this.pageOfLevel(this.map.getMap().getLevel(main.saveSystem.getLastPlayed())));
    this.initialize();
    this.bg.pages.gotoAndStop('page_' + this.actual_page);
    this.nextArrow = new ArrowView(Util.getSprite(this.bg, MapView.NEXT_BUTTON), this.nextPage);
    this.prevArrow = new ArrowView(Util.getSprite(this.bg, MapView.PREV_BUTTON), this.previousPage);
    this.refreshArrows(this.actual_page);
  }
  getButtonInfo() {
    var level = null;
    var buttonName = null;
    this.buttonsNames = new Array();
    var dict = new Dictionary();
    dict.set('sound', ButtonGroup.get('sound_gui').createButton(null, 'mouseOver', 'mouseOut'));
    this.buttonsNames.push('sound');
    var buttonGroup = ButtonGroup.get('gui');
    dict.set('back', buttonGroup.createButton(this.toMainMenu, 'mouseOver', 'mouseOut'));
    this.buttonsNames.push('back');
    for (level of as3values(this.map.getMap().getLevels())) {
      buttonName = this.getButtonName(level);
      dict.set(buttonName, buttonGroup.createButton(this.getGoToDungeon(level), 'mouseOver', 'mouseOut'));
      this.buttonsNames.push(buttonName);
    }
    return dict;
  }
  getButtonName(level) {
    return 'pages.page_' + this.pageOfLevel(level) + '.dungeon_' + level.getDungeonId();
  }
  pageOfLevel(level) {
    return uint(level.getArea());
  }
  getGoToDungeon(level2) {
    var level = level2;
    return (event) => {
      Buttons.setButtons(this.bg, this.buttonsNames, false);
      this.onToDungeon.emit(level);
    };
  }
  initialize() {
    var level = null;
    var buttonName = null;
    var button = null;
    var eventBadge = null;
    var date = null;
    this.onToMainMenu = new Signal();
    this.onToDungeon = new Signal();
    main.soundManager.updateSoundButton(this.bg.sound);
    Buttons.setButtons(this.bg, this.buttonsNames, true);
    for (level of as3values(this.map.getMap().getLevels())) {
      buttonName = this.getButtonName(level);
      button = as3as(Util.getSprite(this.bg, buttonName), MovieClip);
      if (level.isLocked()) {
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('locked');
        } else {
          Sepializer.getInstance().sepializeDark(button);
          eventBadge = as3as(main.swfLoader.getObject('assets.BonusMap'), MovieClip);
          button.addChild(eventBadge);
          date = as3as(level, LegendaryLevel).getDate();
          eventBadge.title.title.text = main.locale.get('legendaryDate', [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate(),
          ]);
        }
        Buttons.setButtons(this.bg, [buttonName], false);
      } else if (level.isCleared()) {
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('cleared');
          if (!level.isSpecial()) {
            button.icon.title.title.text = level.getDungeonId();
          }
        }
        Buttons.setButtons(this.bg, [buttonName], true);
        this.putEnemies(button, level);
      } else if (level.isUnlocked()) {
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('unlocked');
          if (!level.isSpecial()) {
            button.icon.title.title.text = level.getDungeonId();
          }
        }
        Buttons.setButtons(this.bg, [buttonName], true);
        this.putEnemies(button, level);
      }
      if (button.lastLevel) {
        button.lastLevel.stop();
        button.lastLevel.visible = false;
      }
    }
  }
  putEnemies(button, level) {
    var enemy = null;
    var skulls = null;
    var element = null;
    var enemyElement = null;
    var config = DungeonFactory.getConfigFor(level.getDungeonId());
    var elements = new cbArray();
    for (enemy of as3values(config.enemiesData)) {
      enemyElement = CharacterFactory.getInstance().getConfig(enemy[0]).element;
      elements.pushIfNotPresent(enemyElement);
    }
    if (elements.length == 1) {
      skulls = as3as(main.swfLoader.getObject('assets.SkullsX3'), MovieClip);
      skulls.skull2.visible = false;
      skulls.skull3.visible = false;
    } else if (elements.length == 2) {
      skulls = as3as(main.swfLoader.getObject('assets.SkullsX2'), MovieClip);
    } else {
      if (elements.length != 3) {
        throw new Error('WTF?!');
      }
      skulls = as3as(main.swfLoader.getObject('assets.SkullsX3'), MovieClip);
    }
    var n = 1;
    for (element of as3values(elements)) {
      skulls['skull' + n].gotoAndStop(element.type);
      n++;
    }
    button.addChild(skulls);
  }
  updatePage(value, actual_page) {
    actual_page = uint(actual_page);
    this.actual_page = uint(actual_page);
    this.refreshArrows(actual_page);
  }
  nextPage() {
    this.goToPage(this.actual_page + 1);
  }
  previousPage() {
    this.goToPage(this.actual_page - 1);
  }
  goToPage(num) {
    num = uint(num);
    if (this.actual_page == num) {
      this.updatePage(null, num);
      return;
    }
    if (num > this.pageOfLevel(this.map.getMap().biggestUnlockedLevel())) {
      return;
    }
    this.hideArrows();
    var text = 'page_' + this.actual_page + '/page_' + num;
    this.bg.pages.gotoAndPlay(text);
    var smartMC = new SmartMC(this.bg.pages);
    smartMC.trigger(new EndCurrentLabel(this.bg.pages), new Lambda(this.updatePage, num));
  }
  hideArrows() {
    this.nextArrow.hide();
    this.prevArrow.hide();
  }
  refreshArrows(num) {
    num = uint(num);
    var clip = null;
    if (num + 1 <= this.pageOfLevel(this.map.getMap().biggestUnlockedLevel())) {
      this.nextArrow.show();
    }
    if (num != 1) {
      this.prevArrow.show();
    }
  }
  toMainMenu(event) {
    this.onToMainMenu.emit();
  }
  close() {
    this.pop();
  }
  clear() {
    super.clear();
    this.lastPlayedTimer.stop();
    this.lastPlayedTimer.removeEventListener(TimerEvent.TIMER_COMPLETE, this.refreshLastLevel);
    this.lastPlayedTimer = null;
    this.onToDungeon.clear();
    this.onToMainMenu.clear();
    this.map = null;
  }
  refreshUnlocked(levels) {
    var button = null;
    var level = null;
    var buttonName = null;
    for (level of as3values(levels)) {
      buttonName = this.getButtonName(level);
      if (level.isCleared()) {
        button = as3as(Util.getSprite(this.bg, buttonName), MovieClip);
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('cleared');
          if (!level.isSpecial()) {
            button.icon.title.title.text = level.getDungeonId();
          }
        }
        Buttons.setButtons(this.bg, [buttonName], true);
        this.putEnemies(button, level);
      } else if (level.isUnlocked()) {
        button = as3as(Util.getSprite(this.bg, buttonName), MovieClip);
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('unlocked');
          if (!level.isSpecial()) {
            button.icon.title.title.text = level.getDungeonId();
          }
        }
        Buttons.setButtons(this.bg, [buttonName], true);
        this.putEnemies(button, level);
      }
    }
    this.lastPlayedTimer.reset();
    this.lastPlayedTimer.start();
    this.refreshArrows(this.actual_page);
  }
  refreshLastLevel(event) {
    var clip = as3as(
      Util.getSprite(this.bg, this.getButtonName(this.map.getMap().getLevel(main.saveSystem.getLastPlayed()))),
      MovieClip,
    );
    if (clip.lastLevel) {
      clip.lastLevel.visible = true;
      clip.lastLevel.gotoAndPlay(1);
    }
  }
}
bindMethods(MapView);
