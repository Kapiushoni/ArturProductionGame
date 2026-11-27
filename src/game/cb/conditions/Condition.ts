/** A condition on a clip's animation (see SmartMC). */
export interface Condition {
  complete(clip: any): boolean;
}
