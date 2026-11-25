export class Point {
  constructor(public x = 0, public y = 0) {}
  get length() { return Math.hypot(this.x, this.y); }
  add(p: Point) { return new Point(this.x + p.x, this.y + p.y); }
  subtract(p: Point) { return new Point(this.x - p.x, this.y - p.y); }
  clone() { return new Point(this.x, this.y); }
  equals(p: Point) { return p.x === this.x && p.y === this.y; }
  offset(dx: number, dy: number) { this.x += dx; this.y += dy; }
  normalize(len: number) { const l = this.length || 1; this.x *= len / l; this.y *= len / l; }
  static distance(a: Point, b: Point) { return Math.hypot(a.x - b.x, a.y - b.y); }
  static interpolate(a: Point, b: Point, f: number) { return new Point(b.x + (a.x - b.x) * f, b.y + (a.y - b.y) * f); }
  static polar(len: number, ang: number) { return new Point(len * Math.cos(ang), len * Math.sin(ang)); }
  toString() { return `(x=${this.x}, y=${this.y})`; }
}

export class Rectangle {
  constructor(public x = 0, public y = 0, public width = 0, public height = 0) {}
  get left() { return this.x; }
  get top() { return this.y; }
  get right() { return this.x + this.width; }
  get bottom() { return this.y + this.height; }
  contains(x: number, y: number) { return x >= this.x && y >= this.y && x < this.right && y < this.bottom; }
  containsPoint(p: Point) { return this.contains(p.x, p.y); }
  intersects(r: Rectangle) { return r.x < this.right && r.right > this.x && r.y < this.bottom && r.bottom > this.y; }
  isEmpty() { return this.width <= 0 || this.height <= 0; }
  clone() { return new Rectangle(this.x, this.y, this.width, this.height); }
}

/** a b c d tx ty, Flash order */
export type M = [number, number, number, number, number, number];
export const I: M = [1, 0, 0, 1, 0, 0];
export function mul(p: M, c: M): M { // p * c (apply c then p)
  return [
    p[0] * c[0] + p[2] * c[1], p[1] * c[0] + p[3] * c[1],
    p[0] * c[2] + p[2] * c[3], p[1] * c[2] + p[3] * c[3],
    p[0] * c[4] + p[2] * c[5] + p[4], p[1] * c[4] + p[3] * c[5] + p[5],
  ];
}

export class ColorTransform {
  constructor(
    public redMultiplier = 1, public greenMultiplier = 1, public blueMultiplier = 1, public alphaMultiplier = 1,
    public redOffset = 0, public greenOffset = 0, public blueOffset = 0, public alphaOffset = 0,
  ) {}
  get color() { return ((this.redOffset & 255) << 16) | ((this.greenOffset & 255) << 8) | (this.blueOffset & 255); }
  set color(c: number) {
    this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 0;
    this.redOffset = (c >> 16) & 255; this.greenOffset = (c >> 8) & 255; this.blueOffset = c & 255;
  }
  concat(o: ColorTransform) {
    this.redOffset += o.redOffset * this.redMultiplier; this.greenOffset += o.greenOffset * this.greenMultiplier;
    this.blueOffset += o.blueOffset * this.blueMultiplier; this.alphaOffset += o.alphaOffset * this.alphaMultiplier;
    this.redMultiplier *= o.redMultiplier; this.greenMultiplier *= o.greenMultiplier;
    this.blueMultiplier *= o.blueMultiplier; this.alphaMultiplier *= o.alphaMultiplier;
  }
}
