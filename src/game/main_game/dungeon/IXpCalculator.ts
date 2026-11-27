/** Experience earned in a dungeon (see XpCalculator). */
export interface IXpCalculator {
  getXp(defeated: any[]): number;
  getMixXp(mixes: number, jinn: any): number;
  getCriticalXp(criticalHits: number, jinn: any): number;
}
