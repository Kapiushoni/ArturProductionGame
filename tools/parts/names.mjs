// Human-readable names for character parts, picked by looking at them (tools/parts/catalog.mjs numbers
// duplicates: arm, arm-2, arm-3...). Parts not listed here are named automatically from where they are used
// (effects -> effects/<animation>/frame, items and interface -> their game class).
// Format: module -> { name: [shape ids] }.

export const FOLDERS = {
  jinn: 'hero', boss: 'boss',
  enemy1_normal: 'skeleton-guard', enemy1_fire: 'skeleton-guard-fire', enemy1_ice: 'skeleton-guard-ice',
  enemy2_normal: 'skeleton-sentry', enemy2_fire: 'skeleton-sentry-fire', enemy2_ice: 'skeleton-sentry-ice', enemy2_snow: 'skeleton-sentry-snow',
  items: 'items', screens: 'interface', backgrounds: 'backgrounds', combat_fx: 'battle-effects', loading: 'loading-screen', tutorials: 'tutorials',
};

export const NAMES = {
  jinn: {
    'body/shadow': [1], 'body/barrel': [9], 'body/face': [13, 181], 'body/fist': [145], 'body/flash': [235], 'body/sparkle': [468],
    'body/torso': [11, 139, 179, 203, 207, 211, 219, 223, 225, 227, 492],
    'body/arm': [3, 17, 23, 25, 127, 129, 133, 137, 141, 143, 149, 151, 153, 185, 205, 209, 215, 217, 221, 233, 239, 241, 466, 494, 498],
    'body/leg': [7, 21, 27, 131, 176], 'body/foot': [5, 19, 135, 231, 237, 464, 496],
    'body/hand-holding-sword': [251, 303, 308, 314, 333, 385, 419],
    // facial expressions of the original hero (empty in the replacement art)
    'body/face-angry': [15], 'body/mouth-scream': [147, 421], 'body/mouth-shout': [183], 'body/punch-effect': [201],
    'body/angry-face-effect': [213], 'body/mouth-open': [229],
    'shield/wooden': [29], 'shield/center': [30, 32], 'shield/shine': [38, 51, 78, 88], 'shield/fire-flame': [41, 42, 43, 44],
    'shield/fire-flame-big': [71, 72, 73, 74], 'shield/dark': [47], 'shield/knob': [48], 'shield/knob-fire': [50],
    'shield/ice': [54], 'shield/frost': [55], 'shield/ice-gem': [56], 'shield/ice-plate': [70], 'shield/ice-crystals': [81, 118],
    'shield/armored': [60], 'shield/armored-fire': [77], 'shield/sparkle': [89, 90],
    'shield/skull-shield': [96], 'shield/skull': [97], 'shield/skull-shield-fire': [111], 'shield/skull-fire': [112], 'shield/skull-ice': [119],
    'shield/gem': [35, 61, 62, 63, 64, 65, 66, 100, 101, 103, 104, 105, 106], 'shield/gem-glow': [33], 'shield/gem-ice': [82, 83, 84, 85, 86],
    'shield/gem-pair': [99, 107], 'shield/gem-pair-fire': [114], 'shield/gem-pair-ice': [121], 'jewel/gem': [267],
    'sword/handle': [244, 252, 264, 272, 278, 284, 292, 304, 320, 343, 359], 'sword/pommel': [249, 262, 355],
    'sword/blade': [245, 260, 275, 297, 305, 315, 366, 371], 'sword/blade-fire': [281, 340], 'sword/blade-ice': [265, 288, 309, 310, 349],
    'sword/blade-glow': [367], 'sword/guard': [273, 279, 321, 344, 361], 'sword/guard-ice': [285, 351], 'sword/gem': [293, 294, 325, 326, 327, 328, 329, 330, 353],
    'sword/shine': [246, 270, 287, 290, 298, 301, 312, 318, 341, 356, 369, 372, 390, 407], 'sword/ornament': [316, 323, 346],
    'sword/fire-flame': [253, 254, 255, 256, 257, 334, 335, 336, 337], 'sword/glow': [363], 'sword/orb': [376],
    'battle-guitar/tip': [386], 'battle-guitar/frill': [388, 394], 'battle-guitar/blade': [389, 395], 'battle-guitar/body': [398, 401],
    'battle-guitar/head': [399], 'battle-guitar/knob': [402, 412], 'battle-guitar/strings': [404, 416], 'battle-guitar/neck': [406],
    'battle-guitar/pickup': [410], 'battle-guitar/bridge': [414],
  },
  enemy1_normal: {
    'body/shadow': [1], 'body/bone': [3, 5, 13, 15], 'body/bone-curved': [38, 109, 111], 'body/spine': [19], 'body/ribs': [23],
    'body/hip-skirt': [24], 'body/hand': [9, 107], 'body/hand-open': [11], 'body/fist': [29], 'body/boot': [40], 'body/skull': [42],
    'body/eye-mask': [21], 'body/eye': [49], 'body/mouth': [51], 'body/eyes-closed': [53, 58, 101], 'body/mouth-open': [56],
    'armor/shoulder-pad': [27, 31], 'armor/cape': [16], 'armor/helmet': [45], 'armor/helmet-horn': [43], 'armor/helmet-rim': [46],
    'weapon/sword': [7], 'weapon/shield': [33], 'weapon/shield-back': [34], 'weapon/shield-broken': [36],
    'attack-trail/frame': [104, 105, 106, 113, 114, 115, 116, 117, 118, 119],
  },
  enemy1_fire: {
    'body/shadow': [1], 'body/bone': [3, 5, 25, 27, 31], 'body/bone-curved': [48, 122, 124], 'body/ribs': [19], 'body/hand': [21, 120],
    'body/hand-open': [23], 'body/fist': [39], 'body/boot': [50], 'body/skull': [57], 'body/eye-mask': [33], 'body/eye': [59],
    'body/mouth': [61], 'body/eyes-closed': [63, 90, 95], 'body/mouth-open': [93], 'body/flame-hair': [52, 53, 54, 55],
    'armor/chest': [35], 'weapon/sword': [8], 'weapon/sword-blade': [17], 'weapon/sword-flame': [10, 11, 12, 13, 14],
    'weapon/shield-dark': [7], 'weapon/lava-shield': [28, 37, 41], 'weapon/shield-wooden': [43], 'weapon/gem': [44], 'body/smoke': [46],
    'attack-trail/frame': [114, 115, 116, 117, 118, 126, 127, 128, 129, 130, 131, 132, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144,
      146, 147, 148, 149, 150, 151, 152, 153, 154, 156, 157, 159, 162, 164, 166, 167, 168, 169, 170, 171, 172],
  },
  enemy1_ice: {
    'body/shadow': [1], 'body/bone': [10, 24, 26, 28], 'body/bone-curved': [42, 111, 113], 'body/ribs': [18], 'body/hand': [20, 109],
    'body/hand-open': [22], 'body/boot': [44], 'body/skull': [46], 'body/eye-mask': [30], 'body/eye': [48], 'body/mouth': [50],
    'body/eyes-closed': [52, 57, 97], 'body/mouth-open': [55], 'body/icicle': [3], 'body/shine': [5],
    'armor/chest': [32], 'weapon/sword': [12], 'weapon/crystal-blade': [14], 'weapon/spear': [34, 38], 'weapon/ice-shield': [36], 'weapon/ice-block': [40], 'effects/attack/glow': [105],
    'attack-trail/frame': [101, 102, 103, 104, 107, 115, 116, 117, 118, 119, 120, 121],
  },
  enemy2_normal: {
    'body/shadow': [1], 'body/leg-bone': [3], 'body/spiked-bone': [5], 'body/hand': [7], 'body/bone': [9, 11, 45], 'body/bone-curved': [13, 111],
    'body/pelvis': [15], 'body/torso': [22], 'body/fist': [32, 97], 'body/skull-helmet': [38], 'body/mouth': [20], 'body/eye': [40],
    'body/eye-socket': [42], 'body/eye-angry': [94], 'body/whiskers': [30], 'body/sparkle': [28],
    'armor/helmet': [17], 'armor/chest': [34], 'armor/bracer': [36], 'weapon/mace': [19], 'weapon/string': [23], 'weapon/shield': [24],
    'weapon/shield-back': [26], 'weapon/dagger': [46], 'weapon/ball': [50],
    'attack-trail/frame': [101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
  },
  enemy2_fire: {
    'body/shadow': [1], 'body/leg-bone': [3], 'body/hand': [7], 'body/bone': [9, 11, 43], 'body/bone-curved': [13, 104], 'body/eye-mask': [15],
    'body/fist': [32], 'body/skull': [38], 'body/flame': [17, 18, 19, 20], 'body/glow': [22, 95], 'body/sparks': [30],
    'armor/hat-spike': [5], 'armor/chest': [34], 'armor/bracer': [36], 'armor/helmet': [44], 'weapon/spear': [24], 'weapon/cone': [26],
    'weapon/lava-shield': [28], 'weapon/blade': [40],
    'attack-trail/frame': [89, 90, 91, 92, 93, 97, 98, 99, 100, 101, 102, 103],
  },
  enemy2_ice: {
    'body/shadow': [1], 'body/leg-ice': [3, 9], 'body/hand-ice': [7], 'body/icicle': [5, 15, 54], 'body/shine': [11], 'body/bone': [30],
    'body/hand': [32], 'body/ribs': [34], 'body/bone-curved': [36, 110], 'body/skull': [42], 'body/skull-ice': [50], 'body/eye': [44],
    'body/mouth': [46], 'body/eyes-closed': [48], 'body/eye-mask': [19, 60], 'body/fist': [117], 'body/lightning': [51],
    'armor/bracer': [17], 'armor/boot': [21], 'armor/chest': [27], 'armor/shoulder': [56], 'weapon/axe': [23],
    'body/ice-chunk': [29, 38, 41], 'body/cloud': [59],
    'attack-trail/frame': [97, 98, 99, 100, 101, 103, 104, 105, 106, 107, 108, 109],
  },
  screens: {
    'decor/dashed-line': [6], 'decor/thin-line': [46], 'decor/ink-scribble': [9, 718, 721, 724, 727], 'decor/equals-sign': [63], 'decor/plus-sign': [64],
    'panels/parchment-strip': [7, 275, 300, 317], 'panels/parchment': [47, 508, 520], 'panels/dark-panel': [261],
    'frames/octagon': [53, 496], 'frames/octagon-ornate': [503], 'frames/rectangle': [86, 527], 'frames/slots': [486],
    'wood/plank': [344], 'wood/board': [345], 'wood/edges': [526], 'wood/plank-vertical': [563],
    'map/page': [667, 744, 747], 'map/chalk-circle': [669, 672, 675, 678, 681, 684, 687, 690, 693, 696, 699, 702, 705, 708, 711, 714],
    'map/checkmark': [733], 'map/lock': [737],
    // hero stats panel (bottom left of the map/battle screen)
    'stats-panel/hero-figure': [561], 'stats-panel/parchment': [509], 'stats-panel/frame': [528], 'stats-panel/level-bar': [557],
    // banners on top of the pause / dungeon cleared / defeat windows
    'pause/banner': [114], 'level-win/banner': [262], 'level-lose/banner': [295],
    // main menu
    'main-menu/background': [231], 'main-menu/dark-backdrop': [227], 'main-menu/frame': [228],
    // inventory, lab and mixer
    'inventory/panel': [346], 'lab/background': [368], 'mix-effect/orb': [369], 'mix-effect/glow': [371],
    'mix-effect/sparks': [373, 374, 375], 'mixer/panel': [487], 'mixer/arrow': [506],
    'stats-panel/xp-bar-background': [549], 'stats-panel/xp-bar-fill': [551], 'stats-panel/xp-bar-frame': [552], 'stats-panel/xp-bar-mask': [555],
    'screen-border': [564],
    // faces of the original characters (empty in the replacement art)
    'arrow-button/face-eyes': [196], 'arrow-button/face-mouth': [197],
    'lab/princess-crown': [391, 392, 422, 423, 436, 437], 'lab/princess-eyebrow': [414], 'lab/princess-mouth': [439, 441, 443, 445, 447, 449],
    'lab/princess-eyes': [477, 480, 483], 'lab/princess-eyebrow-thin': [484],
    // story scenes, in story order
    'intro/scene-1-desert': [576], 'intro/scene-2-water': [573], 'intro/scene-3-portal': [570], 'intro/scene-4-lab': [567],
    'intro/speech-bubble': [578, 582, 586, 590, 594], 'intro/title-bar': [598], 'intro/dim-overlay': [608],
    'outro/scene-1-reunion': [173], 'outro/scene-2-memory': [164], 'outro/scene-3-keeper-and-sorcerer': [155], 'outro/scene-4-farewell': [149],
    'outro/scene-5-the-end': [146], 'outro/black-screen': [142, 143], 'outro/speech-bubble': [151, 157, 160, 166, 169, 175, 208],
  },
  loading: {
    'scene/board': [1, 7], 'scene/skull-half': [4, 16], 'scene/cage-dark': [19], 'scene/cage': [43], 'scene/rope-stick': [46],
    'scene/axe': [49], 'scene/black-oval': [36], 'scene/rope': [52], 'scene/stick': [55], 'scene/round-shield': [58],
  },
  enemy2_snow: {
    'body/shadow': [1], 'body/leg-ice': [3, 9], 'body/hand-ice': [7], 'body/icicle': [5, 15, 46], 'body/shine': [11], 'body/bone-curved': [17, 111],
    'body/eye-mask': [19], 'body/snowball': [31], 'body/snowman-head': [36], 'body/carrot-nose': [42], 'body/fist': [94],
    'body/snow-cap': [38, 41, 44, 52, 53, 54], 'body/snow-patch': [51], 'armor/boot': [21], 'armor/chest': [27], 'armor/shoulder': [48],
    'armor/hat': [32], 'armor/hat-block': [39], 'weapon/axe': [23], 'weapon/staff': [29],
    'attack-trail/frame': [98, 99, 100, 101, 102, 104, 105, 106, 107, 108, 109, 110],
  },
  boss: {
    'body/smoke': [1], 'body/robe-fold': [2, 5, 15, 55, 139], 'body/bone-segment': [8, 10, 132, 134, 142, 144, 149, 151, 156, 158, 160, 163, 165, 177],
    'body/horn': [12, 107, 146, 153, 187], 'body/pillar': [18], 'body/ghost-flame': [20, 21, 22, 23], 'body/orb-glow': [27],
    'body/wing': [32, 36, 38, 43, 45, 47], 'effects/hurt/glow': [205], 'effects/hurt/ring': [207], 'body/claw': [34, 49], 'body/cape-tatter': [40], 'body/smoke-column': [42, 233], 'body/dust': [51, 116, 136, 235],
    'body/stone-block': [53, 98], 'body/slab': [58], 'body/arm-bone': [60, 62, 250], 'body/tail': [64], 'body/bone': [66, 68, 70, 72, 103, 128, 216],
    'body/mask': [74], 'body/bone-curved': [76, 78], 'body/spine': [80], 'body/jaw': [82, 243], 'body/bracer': [83, 85, 87, 105],
    'body/pelvis': [91, 245], 'body/antlers': [92], 'body/gem': [94], 'body/eyebrows': [96], 'body/streak': [100, 170], 'body/skull': [109],
    'body/claw-tip': [110], 'body/skull-outline': [112], 'body/hood': [113], 'body/smoke-wisp': [115], 'body/eyes': [118, 226],
    'body/magic-slash': [119, 122, 125, 129, 227], 'body/hand': [124, 218, 248], 'body/eye': [171, 173], 'body/spike': [253],
  },
};
