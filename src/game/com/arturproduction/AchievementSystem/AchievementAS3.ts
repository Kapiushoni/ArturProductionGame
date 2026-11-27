import { Loader, bindMethods, int } from '@/flash/as3';
import { Connection } from '@/game/com/arturproduction/connect/Connection';

/**
 * Client of the publisher's achievement module (a separate Flash movie reached through LocalConnection).
 * In the web port LocalConnection does nothing, so these calls are no-ops.
 */
export class AchievementAS3 {
  static _achievementNotificationFinished = false;
  static STATUS_CONNECTING = 0;
  static STATUS_SHOWING_ACHIEVEMENT = 1;
  static STATUS_READY = 2;
  static _uniqueVal = -1;
  _swfLoader = new Loader();
  _connectTimer: any = null;
  _connectedToModule = false;
  _xmlLoaded = false;
  _status = 0;
  _moduleConnection: Connection = null;
  _displayConnection: Connection = null;

  constructor() {
    this._moduleConnection = new Connection('fromAchieveModule', 'toAchieveModule', this, true);
  }
  sendStat(statId: string, value: number) {
    this._moduleConnection.send('updateStat', statId, int(value));
  }
  /** called by the module */
  xmlLoaded() {
    this._xmlLoaded = true;
    this._displayConnection = new Connection('fromDisplayModule', 'toDisplayModule', this, false);
  }
  /** called by the module: [title, description] */
  achievementEarned(achievement: any[]) {
    this.showAchievement(achievement[0], achievement[1]);
  }
  toString(): string {
    return '<< AchievementAS3 >>';
  }
  achievementNotificationGameLoaded() {
    this._moduleConnection.send('achievementNotificationGameLoaded');
  }
  achievementNotificationGameStarted() {
    this._moduleConnection.send('achievementNotificationGameStarted');
  }
  achievementNotificationGameEnded() {
    this._moduleConnection.send('achievementNotificationGameEnded');
  }
  achievementNotificationFinished() {
    AchievementAS3._achievementNotificationFinished = true;
  }
  /** true once after the module finished showing an achievement */
  isAchievmentNotificationFinished(): boolean {
    const finished = AchievementAS3._achievementNotificationFinished;
    AchievementAS3._achievementNotificationFinished = false;
    return finished;
  }
  showAchievement(title: string, description: string) {
    this._displayConnection.send('displayAchievement', title, description);
  }
}
bindMethods(AchievementAS3);
