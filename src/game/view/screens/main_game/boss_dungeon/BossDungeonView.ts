import { as3as, bindMethods } from '@/flash/as3';
import { DungeonView } from '@/game/view/screens/main_game/dungeon/DungeonView';
import { Boss } from '@/game/main_game/boss_dungeon/Boss';
import { BossFight } from '@/game/main_game/boss_dungeon/BossFight';
import { BossView } from '@/game/view/screens/main_game/boss_dungeon/BossView';
import { GameSounds } from '@/game/sound/GameSounds';
import { BossDungeonState } from '@/game/view/screens/main_game/boss_dungeon/BossDungeonState';
import { BossFightView } from '@/game/view/screens/main_game/boss_dungeon/BossFightView';
import { EnterBossDungeon } from '@/game/view/screens/main_game/boss_dungeon/EnterBossDungeon';
import { WinBossDungeonWindow } from '@/game/view/screens/main_game/boss_dungeon/WinBossDungeonWindow';
import type { IDungeonState } from '@/game/view/screens/main_game/states/IDungeonState';
import type { IFight } from '@/game/main_game/dungeon/IFight';

export class BossDungeonView extends DungeonView {
  declare bossView: any;
  won = false;
  constructor(dungeonState: IDungeonState) {
    super(dungeonState);
    this.timeLine.clear();
  }
  initialize() {
    this.bossView = new BossView(as3as(this.dungeon.getDungeon().currentFight.getEnemy(), Boss));
    super.initialize();
  }
  start() {
    this.innerView.clear();
    this.innerView = new EnterBossDungeon(this, this.dungeon.getDungeon().startFight);
  }
  playMusic() {
    this.innerView.playMusic();
  }
  stopMusic() {
    this.innerView.stopMusic();
  }
  makeWinWindow() {
    this.won = true;
    return new WinBossDungeonWindow(
      this.getLoot(),
      this.getStats(),
      this.dungeon.getDungeon().getLevel().isCleared(),
      this.onToOutro,
    );
  }
  onToOutro() {
    as3as(this.dungeon, BossDungeonState).onToOutro.emit();
  }
  onFight(fight: IFight) {
    this.innerView.clear();
    this.innerView = new BossFightView(this, as3as(this.dungeon.getDungeon().currentFight, BossFight));
  }
  endEnterFinishWindow() {
    super.endEnterFinishWindow();
    if (this.bossView) {
      this.bossView.clear();
      this.bossView = null;
    }
  }
  get soundTrack() {
    return GameSounds.BOSS_MUSIC;
  }
  clear() {
    super.clear();
    if (this.bossView) {
      this.bossView.clear();
      this.bossView = null;
    }
  }
}
// Defaults on the prototype, not field initializers: the DungeonView constructor calls initialize(), which sets bossView,
// and an initializer (run after the base constructor) would overwrite them.
BossDungeonView.prototype.bossView = null;
bindMethods(BossDungeonView);
