import { ColorMatrixFilter, bindMethods } from '@/flash/as3';

/** Sepia filters (locked / unavailable things on the map). Singleton. */
export class Sepializer {
  static instance: Sepializer = null;
  private filter: any;
  private filter2: any;

  constructor(_lock: SingletonLock) {
    // prettier-ignore
    this.filter = new ColorMatrixFilter([
      0.39, 0.76, 0.189, 0.01, 0,
      0.35, 0.686, 0.168, 0.01, 0,
      0.27, 0.534, 0.131, 0.01, -10,
      0, 0, 0, 1, 0,
    ]);
    // prettier-ignore
    this.filter2 = new ColorMatrixFilter([
      0.39, 0.76, 0.189, 0.01, -80,
      0.35, 0.686, 0.168, 0.01, -80,
      0.27, 0.534, 0.131, 0.01, -70,
      0, 0, 0, 1, 0,
    ]);
  }
  static getInstance(): Sepializer {
    if (!Sepializer.instance) {
      Sepializer.instance = new Sepializer(new SingletonLock());
    }
    return Sepializer.instance;
  }
  sepialize(sprite: any) {
    sprite.filters = [this.filter];
  }
  /** a darker sepia */
  sepializeDark(sprite: any) {
    sprite.filters = [this.filter2];
  }
  unsepialize(sprite: any) {
    sprite.filters = [];
  }
}
bindMethods(Sepializer);

class SingletonLock {}
