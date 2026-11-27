import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GM, setConfig, dict, itemConfig } from './helpers';

const {
  Dungeon,
  DungeonConfigParser,
  ProbabilisticSet,
  CharacterFactory,
  ItemFactory,
  Signal,
  Map,
  DungeonFactory,
  DailyBonus,
} = GM;

/** a row of dungeons.csv */
const ROW = {
  enemy1: 'e1:1',
  enemy2: 'e2:2',
  enemy3: 'null',
  lootDrop1: 'potA:1',
  lootDrop2: 'null',
  layer1: 'sky;hills',
  layer2: 'trees',
  layer3: 'grass',
};
const character = (name: string) => ({
  BaseHP: 10,
  BaseAttack: 5,
  BaseDefense: 1,
  BaseLuck: 1,
  BaseXP: 3,
  Element: 'N',
  NameString: name,
});

function fakeJinn() {
  return {
    onHit: new Signal(),
    prepareForFight: () => {},
    gear: { lock: vi.fn(), unlock: vi.fn(), equipment_1: { isEmpty: () => false } },
    liver: { lock: vi.fn(), unlock: vi.fn(), clearBuffs: vi.fn() },
  };
}

let jinn: any;
let game: any;
beforeEach(() => {
  setConfig({ Leveling_Enemies: { maxHPMod: 1, attMod: 1, defMod: 1, luckMod: 1, xpMod: 2 } });
  CharacterFactory.setConfig(dict({ e1: character('e1'), e2: character('e2') }));
  ItemFactory.setConfig(dict({ potA: itemConfig(), potB: itemConfig() }));
  jinn = fakeJinn();
  game = { getJinn: () => jinn, getMixer: () => ({ onMixEnd: new Signal() }) };
  GM.services.saveSystem = { savePendingItems: vi.fn(), saveClearedLevel: vi.fn() };
  GM.services.achievements = {
    endLastDungeon: vi.fn(),
    finishFirstPage: vi.fn(),
    unequippedDungeonCompleted: vi.fn(),
  };
});
afterEach(() => vi.restoreAllMocks());

describe('DungeonConfigParser', () => {
  it('reads enemies and loot until the first "null", and the background layers', () => {
    const c = new DungeonConfigParser(ROW);
    expect(c.enemiesData).toEqual([
      ['e1', '1'],
      ['e2', '2'],
    ]);
    expect(c.lootData).toEqual([['potA', '1']]);
    expect(c.backgroundsData).toEqual([['sky', 'hills'], ['trees'], ['grass']]);
  });
});

describe('Dungeon', () => {
  const level = () => ({ id: '3', getDungeonId: () => '3', clear: vi.fn() });
  const firstLoot = () => {
    const set = new ProbabilisticSet();
    set.add('potB', 1);
    return set;
  };

  it('one fight per enemy, at its level; only the first fight is marked first', () => {
    const d = new Dungeon(level(), new DungeonConfigParser(ROW), new ProbabilisticSet(), game);
    expect(d.enemies.map((e: any) => e.getName())).toEqual(['e1', 'e2']);
    expect(d.enemies.map((e: any) => e.stats.getLevel())).toEqual([1, 2]);
    expect(d.currentFight.first).toBe(true);
  });

  it('loot: first-time loot first, then the dungeon loot; an exhausted loot list leaves the slot empty', () => {
    const d = new Dungeon(level(), new DungeonConfigParser(ROW), firstLoot(), game);
    const ids = d
      .getLoot()
      .getBooty()
      .map((s: any) => (s.isEmpty() ? null : s.getContent().id));
    expect(ids).toEqual(['potB', 'potA', null]);
  });

  it('winning every fight clears the dungeon and gives the jinn its gear back', () => {
    const lvl = level();
    const d = new Dungeon(lvl, new DungeonConfigParser(ROW), new ProbabilisticSet(), game);
    // the view: plays the exit animation of a fight, then continues
    d.onFight.add((fight: any) => fight.onExit.add((next: () => void) => next()));
    const won = vi.fn();
    d.onWin.add(won);
    d.enter();
    expect(jinn.gear.lock).toHaveBeenCalled();
    expect(jinn.liver.unlock).toHaveBeenCalled();
    d.startFight();
    d.wonFight(); // first enemy -> next fight starts
    expect(won).not.toHaveBeenCalled();
    expect(d.currentFight.getEnemy().getName()).toBe('e2');
    d.wonFight(); // last enemy
    expect(won).toHaveBeenCalledTimes(1);
    expect(lvl.clear).toHaveBeenCalled();
    expect(GM.services.saveSystem.saveClearedLevel).toHaveBeenCalledWith('3');
    expect(jinn.gear.unlock).toHaveBeenCalled();
    expect(jinn.liver.clearBuffs).toHaveBeenCalled();
    expect(d.getDefeated().map((e: any) => e.getName())).toEqual(['e1', 'e2']);
  });

  it('losing: onLose, and only the beaten enemies count', () => {
    const d = new Dungeon(level(), new DungeonConfigParser(ROW), new ProbabilisticSet(), game);
    d.onFight.add((fight: any) => fight.onExit.add((next: () => void) => next()));
    const lost = vi.fn();
    d.onLose.add(lost);
    d.enter();
    d.startFight();
    d.wonFight();
    d.lostFight();
    expect(lost).toHaveBeenCalledTimes(1);
    expect(d.getDefeated().map((e: any) => e.getName())).toEqual(['e1']);
    expect(GM.services.saveSystem.saveClearedLevel).not.toHaveBeenCalled();
  });
});

describe('Map', () => {
  const ids = Array.from({ length: 32 }, (_, i) => String(i + 1));
  const makeMap = (cleared: string[]) => {
    DungeonFactory.setConfig(dict(Object.fromEntries(ids.map((id) => [id, {}]))));
    vi.spyOn(DailyBonus, 'getNextSpecialDungeonDate').mockReturnValue(null);
    GM.services.saveSystem = { getClearedLevels: () => cleared };
    return new Map();
  };

  it('a new game: only dungeon 1 is open (and the legendary ones)', () => {
    const map = makeMap([]);
    expect(map.getLevel('1').isUnlocked()).toBe(true);
    expect(map.getLevel('2').isLocked()).toBe(true);
    expect(map.getLevel('31').isUnlocked()).toBe(true);
    expect(map.getLevel('31').isLegendary()).toBe(true);
    expect(map.getLevel('26').isSpecial()).toBe(true);
  });

  it('cleared levels open the next ones, including side dungeons', () => {
    const map = makeMap(['1', '2', '3', '4']);
    expect(map.getLevel('4').isCleared()).toBe(true);
    expect(map.getLevel('5').isUnlocked()).toBe(true);
    expect(map.getLevel('26').isUnlocked()).toBe(true); // branch from 4
    expect(map.getLevel('6').isLocked()).toBe(true);
    expect(map.biggestUnlockedLevel().dungeonId).toBe('5');
    expect(map.getNextLevel(map.getLevel('1')).dungeonId).toBe('2');
  });

  it('map pages', () => {
    const map = makeMap([]);
    expect([1, 8, 9, 16, 17, 25].map((i) => map.getLevel(String(i)).getArea())).toEqual([1, 1, 2, 2, 3, 3]);
    expect(map.getLevel('27').getArea()).toBe(2);
  });
});
