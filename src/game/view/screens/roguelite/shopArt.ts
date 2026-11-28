import { Assets, Texture } from 'pixi.js';
import { Shape } from '@/flash/display';

/**
 * The art of the bone shop (public/assets/shop, drawn in Blender): one PNG per layer at 2x, and shop.json with
 * where each layer goes on the 700 x 500 screen and the pivots of the animated parts.
 */
export interface ShopLayout {
  scale: number;
  layers: Record<string, { x: number; y: number; w: number; h: number }>;
  pivots: Record<string, [number, number]>;
  sign: [number, number];
  /** the dark panel on the front of the counter, for the info board */
  board: { x: number; y: number; w: number; h: number };
}
export interface ShopArt {
  layout: ShopLayout;
  textures: Record<string, Texture>;
}

const BASE = './assets/shop/';
let loading: Promise<ShopArt> | null = null;

/** loads the shop's art once (later calls get the same textures) */
export function loadShopArt(): Promise<ShopArt> {
  loading ??= (async () => {
    const layout: ShopLayout = await (await fetch(BASE + 'shop.json')).json();
    const names = Object.keys(layout.layers);
    const textures: Record<string, Texture> = {};
    await Promise.all(names.map(async (n) => (textures[n] = await Assets.load<Texture>(BASE + n + '.png'))));
    return { layout, textures };
  })();
  return loading;
}

/** a layer as a display object at its place on the screen (or offset by a pivot) */
export function layer(art: ShopArt, name: string, pivot: [number, number] = [0, 0]): Shape {
  const l = art.layout.layers[name];
  const s = 1 / art.layout.scale;
  return new Shape(art.textures[name], [s, 0, 0, s, l.x - pivot[0], l.y - pivot[1]]);
}
