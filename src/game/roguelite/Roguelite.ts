import { SharedUtils } from '@/game/persistence/SharedUtils';
import { Signal } from '@/game/cb/signals/Signal';
import { RogueliteConfig as C, type UnlockId, type UpgradeId } from '@/game/roguelite/RogueliteConfig';

/**
 * The roguelite mod (switched on in the main menu): one life per run, its own save, and what is kept between runs.
 *
 * - While it is on, the game saves to Roguelite.SAVE_FILE instead of the normal save, so the two never mix.
 * - Losing a fight ends the run: the run save is wiped and the next "new game" starts from the first dungeon.
 * - Leaving a fight is not a way out: the run is marked "in a dungeon" while fighting, and a run that is
 *   still marked when the game starts (the tab was closed mid-fight) is lost.
 * - Hardcore (RogueliteConfig): stronger enemies the further the run goes, fewer potions, only a part of the
 *   health back between dungeons, rare items locked until bought.
 * - Kept between runs (META): bones (the currency), the shop's upgrades and unlocks, the number of runs,
 *   the best dungeon reached, and whether the tutorial was done.
 */
const META = 'cbjs_rl_meta';
const read = (key: string, value: any = null): any => SharedUtils.load(META, key) ?? value;
const write = (key: string, value: any) => SharedUtils.save(META, key, value);

/** what a run ended with (for the "run over" window) */
export interface RunResult {
  /** the dungeon reached on the way to the boss (1..25) */
  reached: number;
  best: number;
  newRecord: boolean;
  /** runs finished so far, this one included */
  runs: number;
  /** bones earned in this run, and all the bones now */
  bones: number;
  totalBones: number;
}

export const Roguelite = {
  SAVE_FILE: 'cbjs_rl',
  /** onEarn(bones added, bones of the run so far) */
  onEarn: new Signal(),

  /** the mod is on (switched in the main menu, kept between sessions) */
  get enabled(): boolean {
    return read('on', false) === true;
  },
  set enabled(on: boolean) {
    write('on', on);
  },
  get runs(): number {
    return read('runs', 0);
  },
  get best(): number {
    return read('best', 0);
  },
  /** the tutorial is played in the first run only */
  get tutorialDone(): boolean {
    return read('tutorial', false) === true;
  },
  tutorialCompleted() {
    write('tutorial', true);
  },

  // ---------------- the run
  /** a new run starts (the save has just been reset) */
  startRun() {
    // the upgrades bought during a run count from the next one: the run keeps the levels it started with
    write('runUp', Object.fromEntries(Object.keys(C.upgrades).map((id) => [id, this.level(id as UpgradeId)])));
    write('runBones', 0);
    write('hp', null);
    write('inDungeon', false);
    write('at', 1);
  },
  /** a fight starts in this dungeon: until it is won, closing the game loses the run */
  enterDungeon(reached: number) {
    write('inDungeon', true);
    write('at', reached);
  },
  leaveDungeon() {
    write('inDungeon', false);
  },
  /** the dungeon on the way to the boss the run is in (1..25) */
  get reached(): number {
    return read('at', 1);
  },
  /** the game was closed during a fight */
  get leftDuringFight(): boolean {
    return read('inDungeon', false) === true;
  },
  /** the jinn's health between dungeons (it is not refilled in the mod), null at the start of a run */
  get health(): number | null {
    return read('hp', null);
  },
  set health(hp: number | null) {
    write('hp', hp);
  },
  /** the run is over (lost): wipes the run save and records the result */
  endRun(reached: number = read('at', 1)): RunResult {
    const best = Math.max(this.best, reached);
    const result: RunResult = {
      reached,
      best,
      newRecord: reached > this.best,
      runs: this.runs + 1,
      bones: read('runBones', 0),
      totalBones: this.bones,
    };
    write('runs', result.runs);
    write('best', best);
    write('inDungeon', false);
    write('hp', null);
    SharedUtils.clear(Roguelite.SAVE_FILE);
    return result;
  },

  // ---------------- hardcore
  /** extra levels of the enemies in the current dungeon */
  enemyExtraLevel(): number {
    return C.enemyLevelBase + Math.floor((this.reached - 1) / C.enemyLevelEvery);
  },
  /** the weight of an item in a dungeon's loot: potions are rarer, locked items do not drop */
  lootWeight(itemId: string | null, weight: number, category: string | null): number {
    if (itemId == null) return weight;
    if (this.isLocked(itemId)) return 0;
    return category == 'C' ? weight * C.potionDropFactor : weight;
  },
  /** the item belongs to a group not unlocked yet in the shop */
  isLocked(itemId: string): boolean {
    for (const [id, group] of Object.entries(C.unlocks)) {
      if (group.items.includes(itemId) && !this.isUnlocked(id as UnlockId)) return true;
    }
    return false;
  },

  // ---------------- bones
  get bones(): number {
    return read('bones', 0);
  },
  /** bones earned in the current run */
  get runBones(): number {
    return read('runBones', 0);
  },
  /** bones earned (with the "greed" upgrade); returns how many were added */
  earn(amount: number): number {
    const bones = Math.round(amount * (1 + (this.runLevel('greed') * C.upgrades.greed.percent) / 100));
    write('bones', this.bones + bones);
    write('runBones', this.runBones + bones);
    this.onEarn.emit(bones, this.runBones);
    return bones;
  },
  /** bones for an enemy beaten */
  bonesForEnemy(level: number, elemental: boolean, boss: boolean): number {
    if (boss) return C.bonesBoss;
    return C.bonesPerEnemy + Math.floor(level / C.bonesPerEnemyLevel) + (elemental ? C.bonesElemental : 0);
  },
  /** bones for a dungeon cleared */
  bonesForDungeon(reached: number): number {
    return C.bonesPerDungeon + Math.floor(reached / C.bonesPerReached);
  },

  // ---------------- the shop
  level(upgrade: UpgradeId): number {
    return read('up_' + upgrade, 0);
  },
  /** the level the current run plays with (bought before it started) */
  runLevel(upgrade: UpgradeId): number {
    return read('runUp', null)?.[upgrade] ?? this.level(upgrade);
  },
  maxLevel(upgrade: UpgradeId): number {
    return C.upgrades[upgrade].prices.length;
  },
  /** price of the next level, or null at the max */
  price(upgrade: UpgradeId): number | null {
    return C.upgrades[upgrade].prices[this.level(upgrade)] ?? null;
  },
  isUnlocked(group: UnlockId): boolean {
    return read('un_' + group, false) === true;
  },
  /** buys the next level of an upgrade, or an unlock; false when there are not enough bones */
  buy(what: UpgradeId | UnlockId): boolean {
    const isUnlock = what in C.unlocks;
    const price = isUnlock
      ? this.isUnlocked(what as UnlockId)
        ? null
        : C.unlocks[what as UnlockId].price
      : this.price(what as UpgradeId);
    if (price == null || this.bones < price) return false;
    write('bones', this.bones - price);
    if (isUnlock) write('un_' + what, true);
    else write('up_' + what, this.level(what as UpgradeId) + 1);
    return true;
  },
  /** the jinn's row of characters.csv with the upgrades */
  jinnRow(row: any): any {
    return {
      ...row,
      BaseHP: Math.round(Number(row.BaseHP) * (1 + (this.runLevel('tough') * C.upgrades.tough.hpPercent) / 100)),
      BaseLuck: Number(row.BaseLuck) + this.runLevel('eye') * C.upgrades.eye.luck,
      BaseDefense: Number(row.BaseDefense) + this.runLevel('armor') * C.upgrades.armor.defense,
    };
  },
  /** the items a run starts with ("stock" upgrade) */
  startItems(): string[] {
    const level = this.level('stock');
    return level > 0 ? C.upgrades.stock.items[level - 1] : [];
  },
};
