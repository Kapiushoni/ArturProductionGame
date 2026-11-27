import { Dictionary, MovieClip, Timer, TimerEvent, as3as, as3values, bindMethods, uint } from '@/flash/as3';
import { Screen } from '@/game/cb/display/Screen';
import { Lambda } from '@/game/actions/Lambda';
import { ButtonGroup } from '@/game/cb/data/ButtonGroup';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { Signal } from '@/game/cb/signals/Signal';
import { cbArray } from '@/game/cb/utils/cbArray';
import { EndCurrentLabel } from '@/game/conditions/EndCurrentLabel';
import { app } from '@/game/app';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { DungeonFactory } from '@/game/main_game/dungeon/DungeonFactory';
import { LegendaryLevel } from '@/game/main_game/map/LegendaryLevel';
import { Buttons } from '@/game/util/Buttons';
import { Sepializer } from '@/game/util/Sepializer';
import { Util } from '@/game/util/Util';
import { ArrowView } from '@/game/view/screens/main_game/map/ArrowView';
import type { Level } from '@/game/main_game/map/Level';
import type { MapState } from '@/game/view/screens/main_game/states/MapState';

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
  constructor(map: MapState) {
    super();
    this.map = map;
    this.lastPlayedTimer.addEventListener(TimerEvent.TIMER_COMPLETE, this.refreshLastLevel);
    this.initScreen(app.swfLoader.getClass('assets.Map'), this.getButtonInfo());
    this.actual_page = uint(this.pageOfLevel(this.map.map.getLevel(app.saveSystem.getLastPlayed())));
    this.initialize();
    this.bg.pages.gotoAndStop('page_' + this.actual_page);
    this.nextArrow = new ArrowView(Util.getSprite(this.bg, MapView.NEXT_BUTTON), this.nextPage);
    this.prevArrow = new ArrowView(Util.getSprite(this.bg, MapView.PREV_BUTTON), this.previousPage);
    this.refreshArrows(this.actual_page);
  }
  getButtonInfo() {
    let buttonName = null;
    this.buttonsNames = new Array();
    const dict = new Dictionary();
    dict.set('sound', ButtonGroup.get('sound_gui').createButton(null, 'mouseOver', 'mouseOut'));
    this.buttonsNames.push('sound');
    const buttonGroup = ButtonGroup.get('gui');
    dict.set('back', buttonGroup.createButton(this.toMainMenu, 'mouseOver', 'mouseOut'));
    this.buttonsNames.push('back');
    for (const level of as3values(this.map.map.levels)) {
      buttonName = this.getButtonName(level);
      dict.set(buttonName, buttonGroup.createButton(this.getGoToDungeon(level), 'mouseOver', 'mouseOut'));
      this.buttonsNames.push(buttonName);
    }
    return dict;
  }
  getButtonName(level: Level) {
    return 'pages.page_' + this.pageOfLevel(level) + '.dungeon_' + level.dungeonId;
  }
  pageOfLevel(level: Level) {
    return uint(level.getArea());
  }
  getGoToDungeon(level2: Level) {
    const level = level2;
    return (event) => {
      Buttons.setButtons(this.bg, this.buttonsNames, false);
      this.onToDungeon.emit(level);
    };
  }
  initialize() {
    let buttonName = null;
    let button = null;
    let eventBadge = null;
    let date = null;
    this.onToMainMenu = new Signal();
    this.onToDungeon = new Signal();
    app.soundManager.updateSoundButton(this.bg.sound);
    Buttons.setButtons(this.bg, this.buttonsNames, true);
    for (const level of as3values(this.map.map.levels)) {
      buttonName = this.getButtonName(level);
      button = as3as(Util.getSprite(this.bg, buttonName), MovieClip);
      if (level.isLocked()) {
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('locked');
        } else {
          Sepializer.getInstance().sepializeDark(button);
          eventBadge = as3as(app.swfLoader.getObject('assets.BonusMap'), MovieClip);
          button.addChild(eventBadge);
          date = as3as(level, LegendaryLevel).getDate();
          eventBadge.title.title.text = app.locale.get('legendaryDate', [
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
            button.icon.title.title.text = level.dungeonId;
          }
        }
        Buttons.setButtons(this.bg, [buttonName], true);
        this.putEnemies(button, level);
      } else if (level.isUnlocked()) {
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('unlocked');
          if (!level.isSpecial()) {
            button.icon.title.title.text = level.dungeonId;
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
  putEnemies(button: any, level: Level) {
    let skulls = null;
    let enemyElement = null;
    const config = DungeonFactory.getConfigFor(level.dungeonId);
    const elements = new cbArray();
    for (const enemy of as3values(config.enemiesData)) {
      enemyElement = CharacterFactory.getInstance().getConfig(enemy[0]).element;
      elements.pushIfNotPresent(enemyElement);
    }
    if (elements.length == 1) {
      skulls = as3as(app.swfLoader.getObject('assets.SkullsX3'), MovieClip);
      skulls.skull2.visible = false;
      skulls.skull3.visible = false;
    } else if (elements.length == 2) {
      skulls = as3as(app.swfLoader.getObject('assets.SkullsX2'), MovieClip);
    } else {
      if (elements.length != 3) {
        throw new Error('WTF?!');
      }
      skulls = as3as(app.swfLoader.getObject('assets.SkullsX3'), MovieClip);
    }
    let n = 1;
    for (const element of as3values(elements)) {
      skulls['skull' + n].gotoAndStop(element.type);
      n++;
    }
    button.addChild(skulls);
  }
  updatePage(value, actual_page: number) {
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
  goToPage(num: number) {
    num = uint(num);
    if (this.actual_page == num) {
      this.updatePage(null, num);
      return;
    }
    if (num > this.pageOfLevel(this.map.map.biggestUnlockedLevel())) {
      return;
    }
    this.hideArrows();
    const text = 'page_' + this.actual_page + '/page_' + num;
    this.bg.pages.gotoAndPlay(text);
    const smartMC = new SmartMC(this.bg.pages);
    smartMC.trigger(new EndCurrentLabel(this.bg.pages), new Lambda(this.updatePage, num));
  }
  hideArrows() {
    this.nextArrow.hide();
    this.prevArrow.hide();
  }
  refreshArrows(num: number) {
    num = uint(num);
    if (num + 1 <= this.pageOfLevel(this.map.map.biggestUnlockedLevel())) {
      this.nextArrow.show();
    }
    if (num != 1) {
      this.prevArrow.show();
    }
  }
  toMainMenu(event: any) {
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
  refreshUnlocked(levels: cbArray) {
    let button = null;
    let buttonName = null;
    for (const level of as3values(levels)) {
      buttonName = this.getButtonName(level);
      if (level.isCleared()) {
        button = as3as(Util.getSprite(this.bg, buttonName), MovieClip);
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('cleared');
          if (!level.isSpecial()) {
            button.icon.title.title.text = level.dungeonId;
          }
        }
        Buttons.setButtons(this.bg, [buttonName], true);
        this.putEnemies(button, level);
      } else if (level.isUnlocked()) {
        button = as3as(Util.getSprite(this.bg, buttonName), MovieClip);
        if (!level.isLegendary()) {
          button.icon.gotoAndStop('unlocked');
          if (!level.isSpecial()) {
            button.icon.title.title.text = level.dungeonId;
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
  refreshLastLevel(event: any) {
    const clip = as3as(
      Util.getSprite(this.bg, this.getButtonName(this.map.map.getLevel(app.saveSystem.getLastPlayed()))),
      MovieClip,
    );
    if (clip.lastLevel) {
      clip.lastLevel.visible = true;
      clip.lastLevel.gotoAndPlay(1);
    }
  }
}
bindMethods(MapView);
