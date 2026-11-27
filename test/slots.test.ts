import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GM, dict, itemConfig } from './helpers';

const { Slot, WeaponSlot, ShieldSlot, OneTimeSlot, Trash, ItemFactory } = GM;

const item = (id: string) => ItemFactory.getInstance().getItem(id);

beforeEach(() => {
  ItemFactory.setConfig(
    dict({
      sword: itemConfig({ Category: 'W', FirstModifier: { Category: 'A', Value: 5 } }),
      shield: itemConfig({ Category: 'S', FirstModifier: { Category: 'D', Value: 3 } }),
      potion: itemConfig({ Category: 'C', FirstModifier: { Category: 'H', Value: 10 } }),
    }),
  );
  GM.services.saveSystem = { savePendingItems: vi.fn() };
  GM.services.sound = { playFx: vi.fn() };
});

describe('Slot', () => {
  it('reports every change with the old and the new item', () => {
    const slot = new Slot();
    const changes: any[] = [];
    slot.onChange.add((c: any) => changes.push([c.getOldItem()?.getID() ?? null, c.getNewItem()?.getID() ?? null]));
    const sword = item('sword');
    slot.add(sword);
    slot.add(sword); // same item: no change
    slot.remove(sword);
    expect(changes).toEqual([
      [null, 'sword'],
      ['sword', null],
    ]);
    expect(slot.isEmpty()).toBe(true);
  });

  it('moving onto a full slot swaps the two items', () => {
    const a = new Slot();
    const b = new Slot();
    const sword = item('sword');
    const potion = item('potion');
    a.add(sword);
    b.add(potion);
    expect(b.canMoveFrom(sword, a)).toBe(true);
    b.moveFrom(sword, a);
    expect(b.getContent()).toBe(sword);
    expect(a.getContent()).toBe(potion);
  });

  it('typed slots only accept their kind of item', () => {
    const from = new Slot();
    const potion = item('potion');
    from.add(potion);
    expect(new WeaponSlot().canMoveFrom(potion, from)).toBe(false);
    expect(new WeaponSlot().canMoveFrom(item('sword'), from)).toBe(true);
    expect(new ShieldSlot().canMoveFrom(item('sword'), from)).toBe(false);
  });

  it('no swap when the other item does not fit here', () => {
    const weapon = new WeaponSlot();
    const bag = new Slot();
    const sword = item('sword');
    weapon.add(sword);
    bag.add(item('potion'));
    // the sword could go into the bag, but the potion can't go into the weapon slot
    expect(bag.canMoveFrom(sword, weapon)).toBe(false);
  });

  it('a locked slot gives nothing to drag and accepts nothing', () => {
    const slot = new Slot();
    const sword = item('sword');
    slot.add(sword);
    slot.lock();
    expect(slot.getContainToDrag()).toBe(null);
    expect(new Slot().canMoveFrom(sword, slot)).toBe(true);
    const locked = new Slot();
    locked.lock();
    expect(locked.canMoveFrom(sword, slot)).toBe(false);
  });
});

describe('loot and trash', () => {
  it('a loot slot can be emptied but not filled', () => {
    const loot = new OneTimeSlot(item('potion'));
    const bag = new Slot();
    expect(loot.canMoveFrom(item('sword'), bag)).toBe(false);
    bag.moveFrom(loot.getContent(), loot);
    expect(loot.isEmpty()).toBe(true);
    expect(bag.getContent().getID()).toBe('potion');
  });

  it('the trash destroys what is dropped in it', () => {
    const trash = new Trash();
    const thrown = vi.fn();
    trash.onThrow.add(thrown);
    const bag = new Slot();
    const sword = item('sword');
    bag.add(sword);
    trash.moveFrom(sword, bag);
    expect(bag.isEmpty()).toBe(true);
    expect(thrown).toHaveBeenCalledWith(sword);
    trash.lock();
    expect(trash.canMoveFrom(sword, bag)).toBe(false);
  });
});
