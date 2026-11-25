// Original cartoon art kit (SVG strings). All coordinates are in a 700x500 "stage" space unless noted.
export const C = {
  ink: '#2b1d14',
  skin: '#e2a774', skinShade: '#c98a59',
  tunic: '#1f8a8a', tunicShade: '#176b6b',
  sash: '#f0a03c', pants: '#2c3e5c', boot: '#6b4428',
  turban: '#f3ead8', turbanShade: '#d8ccb2', gem: '#d6334a',
  blade: '#dfe8ee', bladeShade: '#9fb3c2', hilt: '#c8922e',
  bone: '#efe4c8', boneShade: '#cbbd98',
  toby: '#4cc3b5', tobyShade: '#2f9a8e',
  robe: '#6a4c9c', robeShade: '#4f3678', hairAlch: '#5fbf6a',
  fire: '#ff8a1f', fire2: '#ffd23f', ice: '#7fd8ff', ice2: '#d9f6ff',
  keeper: '#3b3f5c', keeperShade: '#2a2d44', glow: '#7dffb2',
};
const S = (w = 3) => `stroke="${C.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export const svgDoc = (w, h, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}px" height="${h}px" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;

export const g = (x, y, s, body, extra = '') => `<g transform="translate(${x},${y}) scale(${s})" ${extra}>${body}</g>`;

/** hero "Jinn": origin at feet center, ~150 units tall at scale 1. pose: 'stand' | 'sword' | 'sad' | 'cheer' | 'sit' */
export function hero(pose = 'stand', mood = 'happy') {
  const arm = (x1, y1, x2, y2, x3, y3) => `<path d="M${x1} ${y1} Q${x2} ${y2} ${x3} ${y3}" fill="none" stroke="${C.ink}" stroke-width="15" stroke-linecap="round"/><path d="M${x1} ${y1} Q${x2} ${y2} ${x3} ${y3}" fill="none" stroke="${C.tunic}" stroke-width="10" stroke-linecap="round"/><circle cx="${x3}" cy="${y3}" r="7" fill="${C.skin}" ${S(2.5)}/>`;
  const sword = (x, y, ang) => `<g transform="translate(${x},${y}) rotate(${ang})"><path d="M-4 0 L4 0 L5 -8 L-5 -8Z" fill="${C.hilt}" ${S(2)}/><rect x="-11" y="-12" width="22" height="5" rx="2" fill="${C.hilt}" ${S(2)}/><path d="M-4 -12 C-6 -40 2 -70 16 -86 C10 -62 8 -36 4 -12Z" fill="${C.blade}" ${S(2.5)}/><path d="M0 -14 C0 -40 6 -62 13 -78" fill="none" stroke="${C.bladeShade}" stroke-width="2"/></g>`;
  const legs = pose === 'sit'
    ? `<path d="M-16 -40 L-40 -38 L-44 -8" fill="none" stroke="${C.ink}" stroke-width="17" stroke-linecap="round"/><path d="M-16 -40 L-40 -38 L-44 -8" fill="none" stroke="${C.pants}" stroke-width="12" stroke-linecap="round"/><path d="M14 -40 L38 -36 L44 -8" fill="none" stroke="${C.ink}" stroke-width="17" stroke-linecap="round"/><path d="M14 -40 L38 -36 L44 -8" fill="none" stroke="${C.pants}" stroke-width="12" stroke-linecap="round"/><ellipse cx="-48" cy="-4" rx="14" ry="7" fill="${C.boot}" ${S(2.5)}/><ellipse cx="50" cy="-4" rx="14" ry="7" fill="${C.boot}" ${S(2.5)}/>`
    : `<path d="M-12 -46 L-18 -10" stroke="${C.ink}" stroke-width="17" stroke-linecap="round"/><path d="M-12 -46 L-18 -10" stroke="${C.pants}" stroke-width="12" stroke-linecap="round"/><path d="M12 -46 L20 -10" stroke="${C.ink}" stroke-width="17" stroke-linecap="round"/><path d="M12 -46 L20 -10" stroke="${C.pants}" stroke-width="12" stroke-linecap="round"/><path d="M-30 -2 Q-30 -14 -16 -14 L-8 -12 L-8 -2Z" fill="${C.boot}" ${S(2.5)}/><path d="M32 -2 Q32 -14 18 -14 L10 -12 L10 -2Z" fill="${C.boot}" ${S(2.5)}/>`;
  const by = pose === 'sit' ? 22 : 0; // body offset when sitting
  let arms = '';
  if (pose === 'sword') arms = arm(-20, -88 + by, -40, -110 + by, -36, -136 + by) + sword(-36, -134 + by, -15) + arm(20, -88 + by, 40, -72 + by, 44, -56 + by);
  else if (pose === 'cheer') arms = arm(-20, -88 + by, -44, -104 + by, -40, -134 + by) + arm(20, -88 + by, 44, -104 + by, 40, -134 + by);
  else if (pose === 'sad') arms = arm(-20, -88 + by, -30, -70 + by, -18, -60 + by) + arm(20, -88 + by, 30, -70 + by, 18, -60 + by);
  else arms = arm(-20, -88 + by, -36, -70 + by, -34, -52 + by) + arm(20, -88 + by, 36, -70 + by, 34, -52 + by);
  const body = `<path d="M-26 ${-48 + by} Q-30 ${-100 + by} 0 ${-104 + by} Q30 ${-100 + by} 26 ${-48 + by} Z" fill="${C.tunic}" ${S()}/><path d="M-26 ${-62 + by} L26 ${-62 + by} L25 ${-50 + by} L-25 ${-50 + by}Z" fill="${C.sash}" ${S(2.5)}/><path d="M0 ${-102 + by} L0 ${-64 + by}" stroke="${C.tunicShade}" stroke-width="3"/>`;
  const eyes = mood === 'sad'
    ? `<path d="M-14 -152 q4 -4 8 0 M6 -152 q4 -4 8 0" fill="none" ${S(2.5)}/><path d="M-12 -142 q12 -6 24 0" fill="none" ${S(2.5)}/><path d="M-16 -148 q-2 8 0 10" stroke="#7cc8ff" stroke-width="3" fill="none"/>`
    : mood === 'shock'
      ? `<circle cx="-9" cy="-153" r="5" fill="#fff" ${S(2)}/><circle cx="9" cy="-153" r="5" fill="#fff" ${S(2)}/><circle cx="-9" cy="-153" r="2" fill="${C.ink}"/><circle cx="9" cy="-153" r="2" fill="${C.ink}"/><ellipse cx="0" cy="-138" rx="6" ry="7" fill="#7a2a1e" ${S(2)}/>`
      : `<circle cx="-9" cy="-153" r="3.5" fill="${C.ink}"/><circle cx="9" cy="-153" r="3.5" fill="${C.ink}"/><path d="M-11 -142 q11 10 22 0" fill="#7a2a1e" ${S(2.5)}/>`;
  const head = `<g transform="translate(0,${by})"><ellipse cx="0" cy="-146" rx="26" ry="27" fill="${C.skin}" ${S()}/><ellipse cx="-17" cy="-140" rx="6" ry="4" fill="#ee8f7a" opacity="0.6"/><ellipse cx="17" cy="-140" rx="6" ry="4" fill="#ee8f7a" opacity="0.6"/>${eyes}<path d="M-30 -158 Q-32 -192 0 -196 Q32 -192 30 -158 Q14 -168 0 -166 Q-14 -168 -30 -158Z" fill="${C.turban}" ${S()}/><path d="M-26 -170 Q0 -182 26 -170" fill="none" stroke="${C.turbanShade}" stroke-width="3"/><path d="M-24 -180 Q0 -190 24 -180" fill="none" stroke="${C.turbanShade}" stroke-width="3"/><circle cx="0" cy="-168" r="6" fill="${C.gem}" ${S(2)}/><path d="M18 -190 Q34 -206 30 -214 Q40 -198 26 -184" fill="${C.turban}" ${S(2.5)}/></g>`;
  return `<ellipse cx="0" cy="0" rx="44" ry="8" fill="#000" opacity="0.25"/>${legs}${body}${arms}${head}`;
}

/** friend "Toby": round teal creature, origin at feet, ~90 tall */
export function toby(mood = 'happy') {
  const face = mood === 'sad'
    ? `<path d="M-16 -58 q6 -5 12 0 M4 -58 q6 -5 12 0" fill="none" ${S(3)}/><path d="M-10 -40 q10 -7 20 0" fill="none" ${S(3)}/>`
    : `<ellipse cx="-12" cy="-58" rx="9" ry="11" fill="#fff" ${S(2.5)}/><ellipse cx="12" cy="-58" rx="9" ry="11" fill="#fff" ${S(2.5)}/><circle cx="-10" cy="-56" r="4.5" fill="${C.ink}"/><circle cx="14" cy="-56" r="4.5" fill="${C.ink}"/><path d="M-12 -40 q12 12 24 0" fill="#7a2a1e" ${S(2.5)}/>`;
  return `<ellipse cx="0" cy="0" rx="36" ry="7" fill="#000" opacity="0.25"/><path d="M-30 -36 Q-36 -84 0 -86 Q36 -84 30 -36 Q30 -4 0 -4 Q-30 -4 -30 -36Z" fill="${C.toby}" ${S()}/><path d="M-26 -78 L-40 -100 L-14 -86Z M26 -78 L40 -100 L14 -86Z" fill="${C.toby}" ${S()}/><ellipse cx="0" cy="-24" rx="18" ry="14" fill="#bff3ea" opacity="0.8"/><path d="M-30 -30 Q-46 -26 -42 -14 M30 -30 Q46 -26 42 -14" fill="none" stroke="${C.tobyShade}" stroke-width="7" stroke-linecap="round"/>${face}<path d="M-14 -4 L-14 0 M14 -4 L14 0" ${S(5)}/>`;
}

/** alchemist advisor: origin at feet, ~170 tall */
export function alchemist() {
  return `<ellipse cx="0" cy="0" rx="40" ry="8" fill="#000" opacity="0.25"/><path d="M-36 0 Q-30 -110 0 -116 Q30 -110 36 0Z" fill="${C.robe}" ${S()}/><path d="M0 -112 L0 0" stroke="${C.robeShade}" stroke-width="4"/><path d="M-20 -60 L20 -60" stroke="${C.sash}" stroke-width="6"/><circle cx="0" cy="-138" r="24" fill="${C.skin}" ${S()}/><path d="M-26 -140 Q-30 -176 0 -174 Q30 -176 26 -140 Q18 -160 0 -158 Q-18 -160 -26 -140Z" fill="${C.hairAlch}" ${S()}/><circle cx="0" cy="-178" r="12" fill="${C.hairAlch}" ${S()}/><circle cx="-8" cy="-140" r="3" fill="${C.ink}"/><circle cx="8" cy="-140" r="3" fill="${C.ink}"/><path d="M-12 -150 L-3 -147 M12 -150 L3 -147" ${S(2.5)}/><path d="M-6 -128 q6 5 12 0" fill="none" ${S(2.5)}/><rect x="-18" y="-148" width="13" height="10" rx="4" fill="none" ${S(2)}/><rect x="5" y="-148" width="13" height="10" rx="4" fill="none" ${S(2)}/>`;
}

/** skeleton guard. variant: normal | fire | ice. origin feet, ~150 tall */
export function skeleton(variant = 'normal', flip = false) {
  const head = variant === 'fire'
    ? `<path d="M-20 -176 Q-26 -214 -8 -226 Q-6 -206 2 -204 Q4 -232 22 -238 Q16 -212 26 -200 Q30 -186 20 -170Z" fill="${C.fire}" ${S(2.5)}/><path d="M-8 -180 Q-8 -200 4 -210 Q6 -194 14 -184Z" fill="${C.fire2}"/>`
    : variant === 'ice'
      ? `<path d="M-24 -172 L-30 -206 L-14 -184 L-6 -222 L4 -186 L16 -214 L22 -176Z" fill="${C.ice}" ${S(2.5)}/><path d="M-6 -200 L-2 -186 L6 -196Z" fill="${C.ice2}"/>`
      : `<path d="M-30 -172 Q-34 -196 -46 -204 Q-30 -204 -24 -186 M30 -172 Q34 -196 46 -204 Q30 -204 24 -186" fill="${C.boneShade}" ${S(2.5)}/><path d="M-30 -170 Q-28 -196 0 -198 Q28 -196 30 -170Z" fill="#7a6a58" ${S()}/>`;
  const bone = (d, w = 9) => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w + 5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.bone}" stroke-width="${w}" stroke-linecap="round"/>`;
  return `<g transform="scale(${flip ? -1 : 1},1)"><ellipse cx="0" cy="0" rx="40" ry="7" fill="#000" opacity="0.25"/>${bone('M-10 -60 L-16 -4')}${bone('M10 -60 L18 -4')}${bone('M0 -66 L0 -118', 8)}<path d="M-22 -112 Q0 -126 22 -112 M-20 -100 Q0 -112 20 -100 M-18 -88 Q0 -98 18 -88" fill="none" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/><path d="M-22 -112 Q0 -126 22 -112 M-20 -100 Q0 -112 20 -100 M-18 -88 Q0 -98 18 -88" fill="none" stroke="${C.bone}" stroke-width="5" stroke-linecap="round"/>${bone('M-20 -114 Q-40 -92 -36 -70')}${bone('M20 -114 Q40 -96 46 -120')}<path d="M40 -112 L66 -168" stroke="${C.ink}" stroke-width="5"/><path d="M58 -150 L76 -186 L70 -146Z" fill="#b9c3c9" ${S(2.5)}/><path d="M-24 -136 Q-30 -176 0 -178 Q30 -176 24 -136 Q22 -124 12 -122 L12 -114 L-12 -114 L-12 -122 Q-22 -124 -24 -136Z" fill="${C.bone}" ${S()}/>${head}<ellipse cx="-10" cy="-148" rx="8" ry="9" fill="${C.ink}"/><ellipse cx="10" cy="-148" rx="8" ry="9" fill="${C.ink}"/><circle cx="-9" cy="-147" r="2.5" fill="${variant === 'ice' ? C.ice : variant === 'fire' ? C.fire2 : '#ff5a4a'}"/><circle cx="11" cy="-147" r="2.5" fill="${variant === 'ice' ? C.ice : variant === 'fire' ? C.fire2 : '#ff5a4a'}"/><path d="M-4 -132 L0 -138 L4 -132Z" fill="${C.ink}"/><path d="M-10 -122 L-10 -116 M-3 -122 L-3 -116 M4 -122 L4 -116 M10 -122 L10 -116" ${S(2)}/></g>`;
}

/** keeper of the underworld: tall hooded figure with lantern, origin feet, ~240 tall */
export function keeper() {
  return `<ellipse cx="0" cy="0" rx="50" ry="9" fill="#000" opacity="0.3"/><path d="M-44 0 Q-40 -170 0 -230 Q40 -170 44 0Z" fill="${C.keeper}" ${S()}/><path d="M-26 -150 Q0 -200 26 -150 Q26 -116 0 -112 Q-26 -116 -26 -150Z" fill="#10121c" ${S(2.5)}/><circle cx="-9" cy="-142" r="5" fill="${C.glow}"/><circle cx="9" cy="-142" r="5" fill="${C.glow}"/><path d="M30 -110 Q56 -100 60 -70" fill="none" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/><path d="M30 -110 Q56 -100 60 -70" fill="none" stroke="${C.keeperShade}" stroke-width="7" stroke-linecap="round"/><path d="M60 -72 L60 -62" ${S(3)}/><rect x="48" y="-62" width="24" height="32" rx="6" fill="#ffe08a" ${S(2.5)}/><rect x="54" y="-56" width="12" height="20" rx="3" fill="#fff6c9"/><circle cx="60" cy="-46" r="28" fill="#ffe08a" opacity="0.18"/>`;
}

/** underworld sorcerer: skeleton king, origin feet, ~200 tall */
export function sorcerer() {
  return `<ellipse cx="0" cy="0" rx="50" ry="8" fill="#000" opacity="0.3"/><path d="M-40 0 Q-36 -120 0 -140 Q36 -120 40 0Z" fill="#4a2a3e" ${S()}/><path d="M-30 -120 L0 -60 L30 -120" fill="none" stroke="#c8922e" stroke-width="5"/><path d="M-26 -150 Q-30 -196 0 -198 Q30 -196 26 -150 Q24 -134 12 -132 L12 -124 L-12 -124 L-12 -132 Q-24 -134 -26 -150Z" fill="${C.bone}" ${S()}/><path d="M-28 -190 L-22 -222 L-10 -200 L0 -230 L10 -200 L22 -222 L28 -190Z" fill="#e0b13a" ${S(2.5)}/><circle cx="0" cy="-206" r="5" fill="${C.glow}" ${S(1.5)}/><ellipse cx="-10" cy="-162" rx="8" ry="9" fill="${C.ink}"/><ellipse cx="10" cy="-162" rx="8" ry="9" fill="${C.ink}"/><circle cx="-9" cy="-161" r="3" fill="${C.glow}"/><circle cx="11" cy="-161" r="3" fill="${C.glow}"/><path d="M-10 -134 L-10 -128 M0 -134 L0 -128 M10 -134 L10 -128" ${S(2)}/><path d="M36 -110 L52 -10" stroke="${C.ink}" stroke-width="6"/><circle cx="34" cy="-120" r="12" fill="${C.glow}" ${S(2.5)}/><circle cx="34" cy="-120" r="30" fill="${C.glow}" opacity="0.15"/>`;
}

// ---------- scenery ----------
export function desertBg(w, h, { night = false, horizon = 0.62 } = {}) {
  const hy = h * horizon;
  const sky = night ? ['#1b1736', '#3d2f5c', '#7a4f6e'] : ['#7ec3d9', '#f2d9a0', '#f7c873'];
  const d1 = night ? '#5a3f4f' : '#e3b263', d2 = night ? '#43303f' : '#c99448', d3 = night ? '#2e2230' : '#a8763a';
  return {
    defs: `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="0.7" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>`,
    body: `<rect width="${w}" height="${h}" fill="url(#sky)"/>`
      + (night ? `<circle cx="${w * 0.8}" cy="${h * 0.2}" r="${h * 0.08}" fill="#f6efd0"/><circle cx="${w * 0.82}" cy="${h * 0.19}" r="${h * 0.075}" fill="#3d2f5c" opacity="0.25"/>`
        + Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97.3) % w}" cy="${(i * 53.7) % (hy * 0.7)}" r="${1 + (i % 3) * 0.6}" fill="#fff" opacity="${0.4 + (i % 4) * 0.15}"/>`).join('')
        : `<circle cx="${w * 0.78}" cy="${h * 0.22}" r="${h * 0.09}" fill="#fff4c2" stroke="#ffe08a" stroke-width="6"/>`)
      + `<path d="M${w * 0.08} ${hy} L${w * 0.16} ${hy - h * 0.16} L${w * 0.24} ${hy}Z" fill="${d2}" ${S(2)}/><path d="M${w * 0.2} ${hy} L${w * 0.26} ${hy - h * 0.11} L${w * 0.32} ${hy}Z" fill="${d3}" ${S(2)}/>`
      + `<path d="M0 ${hy} Q${w * 0.25} ${hy - h * 0.06} ${w * 0.5} ${hy} T${w} ${hy - h * 0.02} L${w} ${h} L0 ${h}Z" fill="${d1}" ${S(2)}/>`
      + `<path d="M0 ${hy + h * 0.12} Q${w * 0.3} ${hy + h * 0.04} ${w * 0.62} ${hy + h * 0.12} T${w} ${hy + h * 0.1} L${w} ${h} L0 ${h}Z" fill="${d2}" ${S(2)}/>`
      + `<path d="M0 ${hy + h * 0.26} Q${w * 0.4} ${hy + h * 0.18} ${w} ${hy + h * 0.27} L${w} ${h} L0 ${h}Z" fill="${d3}" ${S(2)}/>`,
  };
}

export function bonePile(x, y, s = 1) {
  return g(x, y, s, `<path d="M-30 0 Q0 -16 30 0Z" fill="${C.boneShade}" ${S(2)}/><path d="M-26 -8 L18 -14" stroke="${C.ink}" stroke-width="9" stroke-linecap="round"/><path d="M-26 -8 L18 -14" stroke="${C.bone}" stroke-width="5" stroke-linecap="round"/><circle cx="14" cy="-20" r="11" fill="${C.bone}" ${S(2.5)}/><circle cx="10" cy="-22" r="3" fill="${C.ink}"/><circle cx="18" cy="-22" r="3" fill="${C.ink}"/>`);
}

/** parchment-edged frame (comic panels) */
export function frame(w, h, t = 16) {
  return `<rect x="${t / 2}" y="${t / 2}" width="${w - t}" height="${h - t}" rx="${t}" fill="none" stroke="#3a2a1c" stroke-width="${t}"/><rect x="${t}" y="${t}" width="${w - 2 * t}" height="${h - 2 * t}" rx="${t * 0.7}" fill="none" stroke="#c9a462" stroke-width="3"/>`;
}

export function title(x, y, text, size = 64, color = '#ffd36a') {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Ander Hedge" font-size="${size}" fill="${color}" stroke="${C.ink}" stroke-width="${size / 7}" paint-order="stroke" letter-spacing="2">${text}</text>`;
}

export function caveBg(w, h, { tint = '#173b3b' } = {}) {
  return {
    defs: `<radialGradient id="cave" cx="0.5" cy="0.45" r="0.75"><stop offset="0" stop-color="#2f6b62"/><stop offset="0.6" stop-color="${tint}"/><stop offset="1" stop-color="#0b1414"/></radialGradient>`,
    body: `<rect width="${w}" height="${h}" fill="url(#cave)"/>`
      + Array.from({ length: 9 }, (_, i) => { const x = (i + 0.5) * w / 9, d = h * (0.12 + (i % 3) * 0.06); return `<path d="M${x - 28} 0 L${x} ${d} L${x + 28} 0Z" fill="#0f2626" stroke="${C.ink}" stroke-width="2"/>`; }).join('')
      + `<path d="M0 ${h * 0.72} Q${w * 0.3} ${h * 0.66} ${w * 0.55} ${h * 0.72} T${w} ${h * 0.7} L${w} ${h} L0 ${h}Z" fill="#1e3a36" stroke="${C.ink}" stroke-width="2"/>`
      + `<path d="M0 ${h * 0.86} Q${w * 0.5} ${h * 0.8} ${w} ${h * 0.87} L${w} ${h} L0 ${h}Z" fill="#132826"/>`
      + Array.from({ length: 6 }, (_, i) => `<circle cx="${(i * 131) % w}" cy="${h * 0.3 + (i * 57) % (h * 0.3)}" r="${2 + i % 3}" fill="${C.glow}" opacity="0.5"/>`).join(''),
  };
}

export function labBg(w, h) {
  const shelf = (y) => `<rect x="${w * 0.06}" y="${y}" width="${w * 0.4}" height="10" fill="#6b4a2e" stroke="${C.ink}" stroke-width="2"/>`
    + [0, 1, 2, 3, 4].map((i) => { const x = w * 0.08 + i * w * 0.075, c = ['#5fbf6a', '#d6334a', '#4c8fd6', '#f0a03c', '#a35fd6'][i]; return `<path d="M${x} ${y} L${x} ${y - 22} Q${x + 12} ${y - 30} ${x + 24} ${y - 22} L${x + 24} ${y}Z" fill="${c}" stroke="${C.ink}" stroke-width="2"/><rect x="${x + 8}" y="${y - 34}" width="8" height="8" fill="#ccc" stroke="${C.ink}" stroke-width="1.5"/>`; }).join('');
  return {
    defs: `<linearGradient id="lab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2f55"/><stop offset="1" stop-color="#5a4775"/></linearGradient>`,
    body: `<rect width="${w}" height="${h}" fill="url(#lab)"/><rect x="0" y="${h * 0.74}" width="${w}" height="${h * 0.26}" fill="#3a2b2b" stroke="${C.ink}" stroke-width="2"/>`
      + shelf(h * 0.3) + shelf(h * 0.55)
      + `<rect x="${w * 0.62}" y="${h * 0.12}" width="${w * 0.22}" height="${h * 0.3}" rx="8" fill="#9fd3e6" stroke="${C.ink}" stroke-width="3"/><path d="M${w * 0.73} ${h * 0.12} L${w * 0.73} ${h * 0.42} M${w * 0.62} ${h * 0.27} L${w * 0.84} ${h * 0.27}" stroke="${C.ink}" stroke-width="3"/>`
      + `<path d="M${w * 0.58} ${h * 0.74} L${w * 0.6} ${h * 0.56} L${w * 0.88} ${h * 0.56} L${w * 0.9} ${h * 0.74}Z" fill="#7a5a3a" stroke="${C.ink}" stroke-width="3"/><circle cx="${w * 0.7}" cy="${h * 0.5}" r="${h * 0.06}" fill="#5fbf6a" stroke="${C.ink}" stroke-width="3"/><path d="M${w * 0.69} ${h * 0.44} L${w * 0.69} ${h * 0.38} L${w * 0.71} ${h * 0.38} L${w * 0.71} ${h * 0.44}" fill="#5fbf6a" stroke="${C.ink}" stroke-width="2"/>`,
  };
}

/** tattered window banner frame (used by win/lose/boss windows): dark border + parchment inner fade on the right */
export function bannerFrame(w, h) {
  return `<rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="14" fill="none" stroke="#1d1510" stroke-width="12"/><rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="10" fill="none" stroke="#b08a52" stroke-width="3"/>`;
}

export function backpackBarrel(x, y, s = 1) {
  return g(x, y, s, `<rect x="-22" y="-60" width="44" height="60" rx="10" fill="#8a5a2e" stroke="${C.ink}" stroke-width="3"/><path d="M-22 -44 L22 -44 M-22 -16 L22 -16" stroke="#c8922e" stroke-width="5"/><path d="M-22 -44 L22 -44 M-22 -16 L22 -16" stroke="${C.ink}" stroke-width="1.5"/><ellipse cx="0" cy="-60" rx="22" ry="7" fill="#a8743e" stroke="${C.ink}" stroke-width="3"/><circle cx="0" cy="-66" r="5" fill="#5fbf6a" stroke="${C.ink}" stroke-width="2"/>`);
}

export function speechSpace() { return ''; }
