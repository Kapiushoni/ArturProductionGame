// @ts-nocheck
import { Loader, bindMethods, int } from '@/flash/as3';
import { Connection } from '@/game/com/arturproduction/connect/Connection';

export class AchievementAS3 {
  static _achievementNotificationFinished = false;
  static STATUS_CONNECTING = int(0);
  static STATUS_SHOWING_ACHIEVEMENT = int(1);
  static STATUS_READY = int(2);
  static _uniqueVal = int(-1);
  _swfLoader = new Loader();
  declare _connectTimer: any;
  declare _connectedToModule: any;
  _xmlLoaded = false;
  declare _status: any;
  declare _moduleConnection: any;
  declare _displayConnection: any;
  constructor() {
         
         this._moduleConnection = new Connection("fromAchieveModule","toAchieveModule",this,true);
      }
  sendStat(text, num) { num = int(num);
         this._moduleConnection.send("updateStat",text,num);
      }
  xmlLoaded() {
         this._xmlLoaded = true;
         this._displayConnection = new Connection("fromDisplayModule","toDisplayModule",this,false);
      }
  achievementEarned(list) {
         this.showAchievement(list[0],list[1]);
      }
  toString() {
         return "<< AchievementAS3 >>";
      }
  achievementNotificationGameLoaded() {
         this._moduleConnection.send("achievementNotificationGameLoaded");
      }
  achievementNotificationGameStarted() {
         this._moduleConnection.send("achievementNotificationGameStarted");
      }
  achievementNotificationGameEnded() {
         this._moduleConnection.send("achievementNotificationGameEnded");
      }
  achievementNotificationFinished() {
         AchievementAS3._achievementNotificationFinished = true;
      }
  isAchievmentNotificationFinished() {
         var flag = AchievementAS3._achievementNotificationFinished;
         AchievementAS3._achievementNotificationFinished = false;
         return flag;
      }
  showAchievement(text, text2) {
         this._displayConnection.send("displayAchievement",text,text2);
      }
}
AchievementAS3.prototype._connectTimer = null;
AchievementAS3.prototype._connectedToModule = false;
AchievementAS3.prototype._status = 0;
AchievementAS3.prototype._moduleConnection = null;
AchievementAS3.prototype._displayConnection = null;
bindMethods(AchievementAS3);
