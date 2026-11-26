// @ts-nocheck
import { bindMethods } from '@/flash/as3';
import { Appender } from '@/game/cb/logger/Appender';
import { JSConsoleAppender } from '@/game/cb/logger/JSConsoleAppender';
import { Log } from '@/game/cb/logger/Log';
import { AchievementAS3 } from '@/game/com/arturproduction/AchievementSystem/AchievementAS3';

export class AchievementDispatcher {
  static readonly FriendlyJR = "200";
  static readonly FirstMap = "201";
  static readonly Mix = "202";
  static readonly FinalLevel = "203";
  static readonly Unequipped = "204";
  declare achievementSystem: any;
  constructor() {
         
         this.logger().addAppender(new Appender());
         this.logger().addAppender(new JSConsoleAppender());
         this.achievementSystem = new AchievementAS3();
      }
  logger() {
         return Log.getLogger("achievement");
      }
  gameLoaded() {
         this.achievementSystem.achievementNotificationGameLoaded();
         this.logger().log("game loaded");
      }
  gamePlayed() {
         this.achievementSystem.achievementNotificationGameStarted();
         this.logger().log("game played");
      }
  gameWon() {
         this.achievementSystem.achievementNotificationGameEnded();
         this.logger().log("game ended");
      }
  madeMix() {
         this.achievementSystem.sendStat(AchievementDispatcher.Mix,1);
         this.logger().log("Mix made");
      }
  finishFirstPage() {
         this.achievementSystem.sendStat(AchievementDispatcher.FirstMap,1);
         this.logger().log("Dungeon 8 cleared");
      }
  unequippedDungeonCompleted(level) {
         this.achievementSystem.sendStat(AchievementDispatcher.Unequipped,1);
         this.logger().log("Clear 10 different dungeons without equipment");
      }
  friendlyRockJrObtained() {
         this.achievementSystem.sendStat(AchievementDispatcher.FriendlyJR,1);
         this.logger().log("FriendlyRockJr created");
      }
  endLastDungeon() {
         this.achievementSystem.sendStat(AchievementDispatcher.FinalLevel,1);
         this.logger().log("Last dungeon cleared");
      }
}
AchievementDispatcher.prototype.achievementSystem = null;
bindMethods(AchievementDispatcher);
