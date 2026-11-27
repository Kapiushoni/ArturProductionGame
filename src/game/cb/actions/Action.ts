/** Something done to a clip (e.g. when its animation reaches a condition, see SmartMC). */
export interface Action {
  execute(clip: any): void;
}
