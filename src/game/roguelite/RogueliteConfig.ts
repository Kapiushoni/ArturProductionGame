/** All the balance numbers of the roguelite mod (hardcore). */
export const RogueliteConfig = {
  // ---- hardcore
  /** enemies are this many levels higher from the first dungeon ... (1 made the first dungeon unwinnable:
   *  a level 2 enemy kills the starting jinn in 3 hits and needs 5) */
  enemyLevelBase: 0,
  /** ... and one more every this many dungeons on the way to the boss */
  enemyLevelEvery: 5,
  /** potions (consumables) drop this much less often */
  potionDropFactor: 0.5,
  /** health healed between dungeons, % of the max (the normal game heals fully) */
  healBetween: 30,

  // ---- variety: every run's dungeons differ a little (main path 1..24, not in the tutorial run)
  variety: {
    /** chance that an enemy gets another element (normal / ice / fire: same stats, other strengths) */
    elementChance: 0.5,
    /** from this dungeon an enemy's level may change by one of these */
    levelJitterFrom: 4,
    levelJitter: [-1, 0, 0, 1],
    /** from this dungeon an enemy may be of the other kind (enemy1 one level up <-> enemy2 one level down) */
    swapFrom: 12,
    swapChance: 0.25,
    /** loot: the items of the dungeons this many steps before and after also drop, at this part of their weight */
    lootNeighbours: 2,
    neighbourWeight: 0.5,
    /** swords and shields also drop as their fire / ice versions, at this part of their weight each */
    elementalGearWeight: 0.35,
    /** first-time loot: drawn from the first-time loot of the dungeons this many steps around */
    firstLootNeighbours: 2,
  },

  // ---- bones
  /** per enemy beaten: base + level / perLevel, +elemental for fire / ice enemies */
  bonesPerEnemy: 1,
  bonesPerEnemyLevel: 4,
  bonesElemental: 1,
  bonesBoss: 30,
  /** per dungeon cleared: base + reached / perReached */
  bonesPerDungeon: 2,
  bonesPerReached: 3,

  // ---- the shop: permanent upgrades, price of each level
  upgrades: {
    tough: { prices: [15, 30, 60, 100, 160], hpPercent: 10 },
    eye: { prices: [12, 25, 50, 90, 140], luck: 3 },
    armor: { prices: [12, 25, 50, 90, 140], defense: 2 },
    stock: {
      prices: [20, 50, 100],
      items: [
        ['HPPotionSmall'],
        ['HPPotionSmall', 'HPPotionSmall'],
        ['HPPotionSmall', 'HPPotionSmall', 'HPPotionMedium'],
      ],
    },
    greed: { prices: [25, 60, 120], percent: 20 },
  },
  /** item groups that do not drop until they are unlocked in the shop */
  unlocks: {
    rareGear: {
      price: 80,
      items: [
        'SwordMedium',
        'SwordMediumFire',
        'SwordMediumIce',
        'ShieldMedium',
        'ShieldMediumFire',
        'ShieldMediumIce',
      ],
    },
    rareJewels: {
      price: 80,
      items: [
        'MaxHPRing2',
        'DefRing2',
        'AttRing2',
        'LuckRing2',
        'MaxHPPendant',
        'DefPendant',
        'AttPendant',
        'LuckPendant',
      ],
    },
    legendary: {
      price: 250,
      items: [
        'SwordHeavy',
        'SwordHeavyFire',
        'SwordHeavyIce',
        'ShieldHeavy',
        'ShieldHeavyFire',
        'ShieldHeavyIce',
        'MaxHPPendant2',
        'DefPendant2',
        'AttPendant2',
        'LuckPendant2',
        'LegendarySword',
        'BattleGuitar',
        'FourLeafClover',
        'ManlyBeard',
      ],
    },
  },
};

export type UpgradeId = keyof typeof RogueliteConfig.upgrades;
export type UnlockId = keyof typeof RogueliteConfig.unlocks;
