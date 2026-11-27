import { bindMethods, int } from '@/flash/as3';
import { Connection } from '@/game/com/arturproduction/connect/Connection';

/**
 * Client of the publisher's achievement module (a separate Flash movie reached through LocalConnection).
 * In the web port LocalConnection does nothing, so these calls are no-ops.
 */
export class AchievementAS3 {
  _connectTimer: any = null;
  _moduleConnection: Connection = null;

  constructor() {
    this._moduleConnection = new Connection('fromAchieveModule', 'toAchieveModule', this, true);
  }
  sendStat(statId: string, value: number) {
    this._moduleConnection.send('updateStat', statId, int(value));
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
}
bindMethods(AchievementAS3);
