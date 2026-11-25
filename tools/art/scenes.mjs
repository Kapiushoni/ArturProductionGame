// Scenes replacing third-party art. Each returns { w, h, defs, body } in its own unit space.
import { C, g, hero, toby, alchemist, skeleton, keeper, sorcerer, desertBg, bonePile, frame, title, caveBg, labBg, bannerFrame, backpackBarrel } from './kit.mjs';

const W = 700, H = 500;
const panel = (bg, body) => ({ w: W, h: H, defs: bg.defs, body: bg.body + body + frame(W, H, 14) });
const portal = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r * 0.7}" ry="${r}" fill="#2a0f3a" stroke="${C.ink}" stroke-width="4"/>` + [0.85, 0.65, 0.45].map((k, i) => `<ellipse cx="${x}" cy="${y}" rx="${r * 0.7 * k}" ry="${r * k}" fill="none" stroke="${['#b23cff', '#ff5ad1', '#7dffb2'][i]}" stroke-width="6" opacity="0.85"/>`).join('');
const bottle = (x, y, s = 1) => g(x, y, s, `<path d="M-10 0 Q-14 -24 -6 -30 L-6 -42 L6 -42 L6 -30 Q14 -24 10 0Z" fill="#7fd8ff" stroke="${C.ink}" stroke-width="3"/><rect x="-7" y="-50" width="14" height="9" fill="#8a5a2e" stroke="${C.ink}" stroke-width="2"/><path d="M-6 -16 Q0 -10 6 -16" stroke="#fff" stroke-width="2" fill="none"/>`);
const cloakedStranger = () => `<ellipse cx="0" cy="0" rx="44" ry="8" fill="#000" opacity="0.25"/><path d="M-40 0 Q-34 -140 0 -176 Q34 -140 40 0Z" fill="#5a3a58" stroke="${C.ink}" stroke-width="3"/><path d="M-24 -120 Q0 -170 24 -120 Q22 -96 0 -92 Q-22 -96 -24 -120Z" fill="#170c16" stroke="${C.ink}" stroke-width="2.5"/><circle cx="-8" cy="-114" r="4" fill="${C.glow}"/><circle cx="8" cy="-114" r="4" fill="${C.glow}"/><path d="M-10 -100 Q0 -94 10 -100" fill="none" stroke="${C.bone}" stroke-width="3"/>`;
const tomb = (x, y, s = 1) => g(x, y, s, `<path d="M-20 0 L-20 -40 Q0 -60 20 -40 L20 0Z" fill="#6f6a6a" stroke="${C.ink}" stroke-width="3"/><path d="M-8 -34 L8 -34 M0 -42 L0 -20" stroke="${C.ink}" stroke-width="3"/>`);
const swordStuck = (x, y, ang = 8) => g(x, y, 1, `<g transform="rotate(${ang})"><path d="M-3 0 L-4 -60 L0 -70 L4 -60 L3 0Z" fill="${C.blade}" stroke="${C.ink}" stroke-width="2.5"/><rect x="-12" y="-64" width="24" height="5" fill="${C.hilt}" stroke="${C.ink}" stroke-width="2"/><rect x="-3" y="-80" width="6" height="16" fill="#6b4428" stroke="${C.ink}" stroke-width="2"/></g>`);
const sparkle = (x, y, r, c = '#fff6c9') => `<path d="M${x} ${y - r} L${x + r * 0.25} ${y - r * 0.25} L${x + r} ${y} L${x + r * 0.25} ${y + r * 0.25} L${x} ${y + r} L${x - r * 0.25} ${y + r * 0.25} L${x - r} ${y} L${x - r * 0.25} ${y - r * 0.25}Z" fill="${c}"/>`;
const crystalBox = (x, y, s, inner) => g(x, y, s, `${inner}<path d="M-70 0 L-70 -210 L70 -210 L70 0Z" fill="#9fe7ff" opacity="0.35" stroke="#e8fbff" stroke-width="4"/><path d="M-70 -210 L-40 -236 L100 -236 L70 -210 M70 0 L100 -26 L100 -236" fill="#c8f3ff" opacity="0.3" stroke="#e8fbff" stroke-width="4"/><path d="M-50 -190 L-20 -150 M40 -60 L60 -30" stroke="#fff" stroke-width="5" opacity="0.7"/>`);

const cage = (x, y, s, inner) => g(x, y, s, `<path d="M0 -150 L0 -110" stroke="#5a4632" stroke-width="5"/><path d="M-50 -110 Q0 -150 50 -110 L50 10 L-50 10Z" fill="#00000033"/>${inner}<path d="M-50 -110 Q0 -150 50 -110" fill="none" stroke="${C.ink}" stroke-width="9"/><path d="M-50 -110 Q0 -150 50 -110" fill="none" stroke="#b08a52" stroke-width="5"/>${[-50, -25, 0, 25, 50].map((x) => `<path d="M${x} ${x === 0 ? -128 : x === 25 || x === -25 ? -124 : -110} L${x} 10" stroke="${C.ink}" stroke-width="8"/><path d="M${x} ${x === 0 ? -128 : x === 25 || x === -25 ? -124 : -110} L${x} 10" stroke="#b08a52" stroke-width="4"/>`).join('')}<rect x="-58" y="6" width="116" height="12" rx="4" fill="#8a6a3e" stroke="${C.ink}" stroke-width="3"/>`);

export const scenes = {
  // main menu background with the game logo (700x500)
  menu() {
    const w = 700, h = 500;
    const bg = desertBg(w, h, { night: true, horizon: 0.58 });
    const body = bg.body
      + cage(598, 178, 0.68, g(0, 0, 0.8, toby('sad')))
      + g(215, 300, 0.62, skeleton('normal'))
      + g(118, 392, 0.95, skeleton('fire', true))
      + g(600, 412, 0.88, skeleton('ice'))
      + g(350, 368, 1.02, hero('sword'))
      + bonePile(250, 470, 1.1) + bonePile(470, 478, 0.9)
      + title(350, 84, 'DESERT', 92, '#ffcf5a')
      + title(350, 128, 'OF  DOOM', 50, '#ff9a4a');
    return { w, h, defs: bg.defs, body };
  },

  // ---------- intro (pages 1..4) ----------
  intro1() { // DESERT OF DOOM — the friends trudge through the heat (title box sits at the top)
    const bg = desertBg(W, H, { horizon: 0.55 });
    return panel(bg, bonePile(560, 430, 1.2) + bonePile(130, 470, 0.9)
      + g(300, 400, 1.0, hero('stand')) + g(430, 405, 1.0, toby('sad'))
      + `<path d="M340 205 q6 -10 2 -18 M420 300 q6 -10 2 -18" stroke="#fff" stroke-width="3" opacity="0.8" fill="none"/>`);
  },
  intro2() { // a cloaked stranger offers a bottle of "water"
    const bg = desertBg(W, H, { horizon: 0.55 });
    return panel(bg, g(500, 420, 1.15, cloakedStranger()) + bottle(430, 300, 1.2)
      + `<path d="M470 292 Q450 290 440 300" stroke="#5a3a58" stroke-width="14" stroke-linecap="round" fill="none"/>`
      + g(320, 425, 1.05, toby('happy')) + g(150, 430, 0.95, hero('stand', 'shock')));
  },
  intro3() { // the stranger drags Toby into a portal
    const bg = desertBg(W, H, { horizon: 0.55 });
    return panel(bg, portal(520, 270, 150)
      + g(520, 400, 1.15, cloakedStranger())
      + g(400, 300, 0.95, `<g transform="rotate(-18)">${toby('sad')}</g>`)
      + `<path d="M460 250 Q430 240 412 262" stroke="#5a3a58" stroke-width="14" stroke-linecap="round" fill="none"/>`
      + g(170, 440, 1.0, hero('cheer', 'shock')));
  },
  intro4() { // the alchemist hands the hero a lab backpack
    const bg = labBg(W, H);
    return panel(bg, g(470, 440, 1.25, alchemist()) + backpackBarrel(380, 330, 1.3)
      + `<path d="M440 300 Q410 296 398 300" stroke="${C.robe}" stroke-width="14" stroke-linecap="round" fill="none"/>`
      + g(220, 450, 1.15, hero('stand')) + sparkle(380, 220, 14) + sparkle(345, 255, 9));
  },

  // ---------- outro (pages 1..5) ----------
  outro1() { // hero finds Toby in the underworld
    const bg = caveBg(W, H);
    return panel(bg, g(250, 420, 1.2, hero('cheer')) + g(430, 425, 1.15, toby('happy')) + sparkle(340, 170, 12, '#7dffb2'));
  },
  outro2() { // the Keeper restores Toby's memory with a glowing touch
    const bg = caveBg(W, H);
    return panel(bg, g(470, 440, 1.15, keeper()) + g(300, 430, 1.15, toby('happy'))
      + `<circle cx="300" cy="300" r="46" fill="${C.glow}" opacity="0.25"/>` + sparkle(300, 290, 18, '#d9ffe9') + sparkle(330, 260, 10, '#d9ffe9')
      + g(120, 440, 0.9, hero('stand')));
  },
  outro3() { // the sorcerer locked in a crystal prison
    const bg = caveBg(W, H, { tint: '#2a1f3b' });
    return panel(bg, crystalBox(380, 430, 1.25, g(0, 0, 0.95, sorcerer())) + g(150, 440, 0.95, keeper()));
  },
  outro4() { // goodbye, Keeper — the friends head home
    const bg = caveBg(W, H);
    return panel(bg, `<path d="M520 110 Q560 70 620 110 L620 360 L520 360Z" fill="#f7e7b0" opacity="0.85" stroke="${C.ink}" stroke-width="3"/>`
      + g(560, 440, 0.95, keeper()) + g(260, 430, 1.1, hero('cheer')) + g(380, 435, 1.05, toby('happy')));
  },
  outro5() { // THE END
    const rays = Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2, b = a + Math.PI / 18; return `<path d="M350 300 L${350 + Math.cos(a) * 700} ${300 + Math.sin(a) * 700} L${350 + Math.cos(b) * 700} ${300 + Math.sin(b) * 700}Z" fill="${i % 2 ? '#5fd3c3' : '#8ee6d8'}"/>`; }).join('');
    return { w: W, h: H, defs: '', body: `<rect width="${W}" height="${H}" fill="#8ee6d8"/>${rays}` + g(300, 470, 1.4, hero('cheer')) + g(430, 470, 1.3, toby('happy'))
      + title(350, 110, 'THE END', 96, '#ffd36a') + sparkle(150, 220, 16) + sparkle(560, 240, 12) + frame(W, H, 14) };
  },

  // ---------- window banners (700x262) ----------
  pauseBanner() { // hero resting among graves (left), empty parchment on the right for text
    const w = 700, h = 262; const bg = desertBg(w, h, { night: true, horizon: 0.5 });
    return { w, h, defs: bg.defs + `<linearGradient id="fade" x1="0" x2="1"><stop offset="0.35" stop-color="#e9d6a8" stop-opacity="0"/><stop offset="0.6" stop-color="#e9d6a8" stop-opacity="0.95"/></linearGradient>`,
      body: bg.body + tomb(70, 230, 1) + tomb(250, 222, 0.8) + swordStuck(40, 240) + g(160, 238, 0.95, hero('sit', 'sad')) + `<rect width="${w}" height="${h}" fill="url(#fade)"/>` + bannerFrame(w, h) };
  },
  winBanner() { // hero raises his sword in triumph
    const w = 700, h = 262; const bg = desertBg(w, h, { horizon: 0.6 });
    return { w, h, defs: bg.defs + `<linearGradient id="fade" x1="0" x2="1"><stop offset="0.35" stop-color="#e9d6a8" stop-opacity="0"/><stop offset="0.6" stop-color="#e9d6a8" stop-opacity="0.95"/></linearGradient>`,
      body: bg.body + bonePile(60, 250, 0.9) + g(170, 250, 0.95, hero('sword')) + sparkle(110, 50, 12) + `<rect width="${w}" height="${h}" fill="url(#fade)"/>` + bannerFrame(w, h) };
  },
  loseBanner() { // Toby still caged, the sorcerer looms
    const w = 700, h = 262; const bg = caveBg(w, h, { tint: '#2a1f3b' });
    return { w, h, defs: bg.defs + `<linearGradient id="fade" x1="0" x2="1"><stop offset="0.4" stop-color="#e9d6a8" stop-opacity="0"/><stop offset="0.65" stop-color="#e9d6a8" stop-opacity="0.95"/></linearGradient>`,
      body: bg.body + g(300, 270, 1.05, sorcerer()) + g(110, 236, 0.9, `<path d="M-50 -110 Q0 -150 50 -110 L50 10 L-50 10Z" fill="#00000044"/>${toby('sad')}${[-50, -25, 0, 25, 50].map((x) => `<path d="M${x} -118 L${x} 10" stroke="#b08a52" stroke-width="5"/>`).join('')}`)
        + `<rect width="${w}" height="${h}" fill="url(#fade)"/>` + bannerFrame(w, h) };
  },
  heroPortrait() { // full-figure hero shown in the inventory (transparent background)
    const w = 176, h = 325;
    return { w, h, defs: '', body: g(88, 318, 1.45, hero('stand')) };
  },
  labPopup() { // background of the alchemist's tips window
    const w = 600, h = 310; const bg = labBg(w, h);
    return { w, h, defs: bg.defs, body: bg.body };
  },
};
