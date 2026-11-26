// @ts-nocheck
import { ColorMatrixFilter, bindMethods } from '@/flash/as3';

export class Sepializer {
  static instance = null;
  declare filter: any;
  declare filter2: any;
  constructor(singletonLock) {
         
         this.filter = new ColorMatrixFilter([0.39,0.76,0.189,0.01,0,0.35,0.686,0.168,0.01,0,0.27,0.534,0.131,0.01,-10,0,0,0,1,0]);
         this.filter2 = new ColorMatrixFilter([0.39,0.76,0.189,0.01,-80,0.35,0.686,0.168,0.01,-80,0.27,0.534,0.131,0.01,-70,0,0,0,1,0]);
      }
  static getInstance() {
         if(!Sepializer.instance)
         {
            Sepializer.instance = new Sepializer(new SingletonLock());
         }
         return Sepializer.instance;
      }
  sepialize(sprite) {
         sprite.filters = [this.filter];
      }
  sepializeDark(sprite) {
         sprite.filters = [this.filter2];
      }
  unsepialize(sprite) {
         sprite.filters = [];
      }
}
Sepializer.prototype.filter = null;
Sepializer.prototype.filter2 = null;
bindMethods(Sepializer);

class SingletonLock {
  constructor() {
      
   }
}
bindMethods(SingletonLock);
