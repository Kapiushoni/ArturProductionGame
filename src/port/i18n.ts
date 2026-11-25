// Language selection: browser language by default, user choice persisted. The game loads "locale.txt",
// which is redirected to data/locale_<lang>.txt (see paths.resolve in flash/as3.ts).
import { Sprite, MovieClip } from '@/flash/display';
import { TextField, TextFormat } from '@/flash/text';
import { MouseEvent } from '@/flash/events';

export const LANGS = ['en', 'ru', 'uk'] as const;
export type Lang = (typeof LANGS)[number];
const KEY = 'jinn.lang';

export function detectLang(): Lang {
  const saved = localStorage.getItem(KEY) as Lang | null;
  if (saved && (LANGS as readonly string[]).includes(saved)) return saved;
  for (const l of navigator.languages ?? [navigator.language]) {
    const c = l.toLowerCase().slice(0, 2);
    if (c === 'uk') return 'uk';
    if (c === 'ru' || c === 'be' || c === 'kk') return 'ru';
    if (c === 'en') return 'en';
  }
  return 'en';
}

export const lang: Lang = detectLang();
document.documentElement.lang = lang;

export function setLang(l: Lang) {
  localStorage.setItem(KEY, l);
  location.reload();
}

const LABEL: Record<Lang, string> = { en: 'EN', ru: 'RU', uk: 'UA' };

/** small round button that cycles EN -> RU -> UA (shown on the main menu) */
export class LangButton extends Sprite {
  constructor() {
    super();
    const g = this.graphics;
    g.lineStyle(2, 0xc9b27a, 1);
    g.beginFill(0x1f2b2e, 0.92);
    g.drawRoundRect(0, 0, 54, 34, 12);
    const t = new TextField();
    t.width = 54; t.height = 30; t.y = 6;
    const f = new TextFormat('Ander Hedge', 20, 0xf2dea5); f.align = 'center';
    t.defaultTextFormat = f; t.text = LABEL[lang];
    t.mouseEnabled = false;
    this.addChild(t);
    this.buttonMode = true;
    this.addEventListener(MouseEvent.CLICK, () => setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]));
    this.addEventListener(MouseEvent.ROLL_OVER, () => { this.alpha = 0.85; });
    this.addEventListener(MouseEvent.ROLL_OUT, () => { this.alpha = 1; });
  }
}
void MovieClip;
