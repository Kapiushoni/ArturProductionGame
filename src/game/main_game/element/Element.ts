import { bindMethods } from '@/flash/as3';

/** Element of enemies and items: fire, ice or normal. One shared instance each (Element.fire / .ice / .normal). */
export class Element {
  private static fireElement: Element = null;
  private static iceElement: Element = null;
  private static normalElement: Element = null;
  static readonly FIRE = 'F';
  static readonly ICE = 'I';
  static readonly NORMAL = 'N';
  constructor(_lock: Lock) {}
  static get fire(): Element {
    if (!Element.fireElement) {
      Element.fireElement = new Fire();
    }
    return Element.fireElement;
  }
  static get ice(): Element {
    if (!Element.iceElement) {
      Element.iceElement = new Ice();
    }
    return Element.iceElement;
  }
  static get normal(): Element {
    if (!Element.normalElement) {
      Element.normalElement = new Normal();
    }
    return Element.normalElement;
  }
  /** "F" / "Fire", "I" / "Ice", "N" or null */
  static parseElement(text: string | null): Element {
    let code = text;
    if (code == null) {
      code = Element.NORMAL;
    } else if (code == 'Ice') {
      code = Element.ICE;
    } else if (code == 'Fire') {
      code = Element.FIRE;
    }
    switch (code) {
      case Element.FIRE:
        return Element.fire;
      case Element.ICE:
        return Element.ice;
      case Element.NORMAL:
        return Element.normal;
      default:
        throw new Error('Cant parse: ' + text);
    }
  }
  get isOfFire(): boolean {
    return false;
  }
  get isOfIce(): boolean {
    return false;
  }
  get type(): string {
    throw new Error('AbstractClass');
  }
  clear() {}
}
bindMethods(Element);

class Fire extends Element {
  constructor() {
    super(new Lock());
  }
  get isOfFire(): boolean {
    return true;
  }
  get type(): string {
    return Element.FIRE;
  }
}
bindMethods(Fire);

class Ice extends Element {
  constructor() {
    super(new Lock());
  }
  get isOfIce(): boolean {
    return true;
  }
  get type(): string {
    return Element.ICE;
  }
}
bindMethods(Ice);

class Normal extends Element {
  constructor() {
    super(new Lock());
  }
  get type(): string {
    return Element.NORMAL;
  }
}
bindMethods(Normal);

class Lock {
  constructor() {}
}
bindMethods(Lock);
