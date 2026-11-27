import { MovieClip, as3as, as3values, bindMethods, uint } from '@/flash/as3';
import { Tween } from '@/game/cb/utils/Tween';
import { app } from '@/game/app';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { LegendaryLevel } from '@/game/main_game/map/LegendaryLevel';
import { Util } from '@/game/util/Util';
import type { DungeonView } from '@/game/view/screens/main_game/dungeon/DungeonView';
import type { Enemy } from '@/game/main_game/character/Enemy';
import type { IFight } from '@/game/main_game/dungeon/IFight';
import type { Level } from '@/game/main_game/map/Level';

export class TimeLine extends MovieClip {
  static readonly jinnStart = 74;
  declare dungeonView: any;
  declare jinn: any;
  declare scale: any;
  declare fight: any;
  declare distance: any;
  declare skulls: any;
  alphalize = false;
  constructor(dungeonView: DungeonView) {
    super();
    this.skulls = new Array();
    this.dungeonView = dungeonView;
    this.fight = 0;
    this.distance = 0;
    this.jinn = as3as(app.swfLoader.getObject('assets.TimeLineJinn'), MovieClip);
    this.initialize();
  }
  static get positionX() {
    return Number(app.config.get('TimelineConfig')['x']);
  }
  static get positionY() {
    return Number(app.config.get('TimelineConfig')['y']);
  }
  initialize() {
    let step = null;
    const dungeon = this.dungeonView.dungeon.getDungeon();
    dungeon.onFight.add(this.nextFight);
    const enemyList = dungeon.enemies;
    this.y = TimeLine.positionY;
    const clip = as3as(app.swfLoader.getObject('assets.TimeLine'), MovieClip);
    this.setLevel(clip, dungeon.getLevel());
    this.x = TimeLine.positionX - clip.width / 2;
    clip.x = clip.width / 2;
    this.addChild(clip);
    const width = clip.width - 80;
    this.dungeonView.background.onMove.add(this.move);
    this.distance = width / enemyList.length;
    const stepsDistance = Dungeon.DungeonConfig['lenght_step'] * Dungeon.DungeonConfig['steps_to_find_enemy'];
    this.scale = this.distance / stepsDistance;
    let i = 0;
    while (i < enemyList.length) {
      step = this.newStep(enemyList[i]);
      step.x = this.positionOfFight(i + 1);
      this.addChild(step);
      this.skulls.push(step);
      i++;
    }
    this.addChild(this.jinn);
    this.jinn.x = TimeLine.jinnStart;
    dungeon.onWin.add(Util.l(this.removeSkull, this.skulls[this.skulls.length - 1]));
  }
  setLevel(clip: any, level: Level) {
    if (level.isLegendary()) {
      clip.level.gotoAndStop(as3as(level, LegendaryLevel).element.type);
    } else if (level.isSpecial()) {
      clip.level.gotoAndStop('special');
    } else {
      clip.level.gotoAndStop('level');
      clip.level.text.text = level.dungeonId;
    }
  }
  nextFight(fight: IFight) {
    this.alphalize = true;
    if (this.fight != 0) {
      this.jinn.x = this.positionOfFight(this.fight);
    }
    this.fight = Number(this.fight + 1);
  }
  positionOfFight(num: number) {
    num = uint(num);
    return Number(num * this.distance + 40);
  }
  move(num: number) {
    num = Number(num);
    if (this.alphalize && this.fight > 1) {
      this.removeSkull(this.skulls[this.fight - 2]);
      this.alphalize = false;
    }
    this.jinn.x = Math.min(this.jinn.x + num * this.scale, this.positionOfFight(this.fight));
  }
  removeSkull(clip: any) {
    Tween.to(
      clip,
      800,
      {
        rotation: 1080,
        y: 108,
      },
      Util.l(this.removeChild, clip),
    );
  }
  newStep(enemy: Enemy) {
    let cls = null;
    const element = enemy.getElement();
    if (element.isOfFire) {
      cls = app.swfLoader.getClass('assets.MapSkullFire');
    } else if (element.isOfIce) {
      cls = app.swfLoader.getClass('assets.MapSkullIce');
    } else {
      cls = app.swfLoader.getClass('assets.MapSkullNormal');
    }
    return new cls();
  }
  clear() {
    for (const skull of as3values(this.skulls)) {
      Tween.killTweensOf(skull);
    }
    if (this.parent != null) {
      this.parent.removeChild(this);
    }
  }
}
// Defaults on the prototype, not field initializers: the MovieClip constructor runs first and may set them (named children of the clip),
// and an initializer (run after the base constructor) would overwrite them.
TimeLine.prototype.dungeonView = null;
TimeLine.prototype.jinn = null;
TimeLine.prototype.scale = NaN;
TimeLine.prototype.fight = NaN;
TimeLine.prototype.distance = NaN;
TimeLine.prototype.skulls = null;
bindMethods(TimeLine);
