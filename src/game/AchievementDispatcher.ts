import { bindMethods } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';
import type { Level } from '@/game/main_game/map/Level';

/**
 * The game events that count for achievements (services.achievements). The original sent them to the
 * publisher's Flash achievement module; on the web they are only logged ("[achievement] ..."), so this is
 * the place to plug real achievements in.
 */
export class AchievementDispatcher {
  private readonly log = Log.getLogger('achievement');

  gameLoaded() {
    this.log.log('game loaded');
  }
  gamePlayed() {
    this.log.log('game played');
  }
  gameWon() {
    this.log.log('game ended');
  }
  madeMix() {
    this.log.log('Mix made');
  }
  finishFirstPage() {
    this.log.log('Dungeon 8 cleared');
  }
  unequippedDungeonCompleted(_level: Level) {
    this.log.log('Clear 10 different dungeons without equipment');
  }
  friendlyRockJrObtained() {
    this.log.log('FriendlyRockJr created');
  }
  endLastDungeon() {
    this.log.log('Last dungeon cleared');
  }
}
bindMethods(AchievementDispatcher, ['gameLoaded', 'madeMix']);
