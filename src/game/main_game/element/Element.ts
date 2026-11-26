// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class Element {
  static fireElement = null;
  static iceElement = null;
  static normalElement = null;
  static readonly FIRE = "F";
  static readonly ICE = "I";
  static readonly NORMAL = "N";
  constructor(lock) {
         
      }
  static get fire() {
         if(!Element.fireElement)
         {
            Element.fireElement = new Fire();
         }
         return Element.fireElement;
      }
  static get ice() {
         if(!Element.iceElement)
         {
            Element.iceElement = new Ice();
         }
         return Element.iceElement;
      }
  static get normal() {
         if(!Element.normalElement)
         {
            Element.normalElement = new Normal();
         }
         return Element.normalElement;
      }
  static parseElement(text) {
         var text2 = text;
         if(text2 == null)
         {
            text2 = Element.NORMAL;
         }
         else if(text2 == "Ice")
         {
            text2 = Element.ICE;
         }
         else if(text2 == "Fire")
         {
            text2 = Element.FIRE;
         }
         switch(text2)
         {
            case Element.FIRE:
               return Element.fire;
            case Element.ICE:
               return Element.ice;
            case Element.NORMAL:
               return Element.normal;
            default:
               throw new Error("Cant parse: " + text);
         }
      }
  get isOfFire() {
         return false;
      }
  get isOfIce() {
         return false;
      }
  get type() {
         throw new Error("AbstractClass");
      }
  clear() {
      }
}
bindMethods(Element);

class Fire extends Element {
  constructor() {
       super(new Lock());
   }
  get isOfFire() {
      return true;
   }
  get type() {
      return Element.FIRE;
   }
}
bindMethods(Fire);

class Ice extends Element {
  constructor() {
       super(new Lock());
   }
  get isOfIce() {
      return true;
   }
  get type() {
      return Element.ICE;
   }
}
bindMethods(Ice);

class Normal extends Element {
  constructor() {
       super(new Lock());
   }
  get type() {
      return Element.NORMAL;
   }
}
bindMethods(Normal);

class Lock {
  constructor() {
      
   }
}
bindMethods(Lock);
