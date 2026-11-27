import { int } from '@/flash/as3';
import { Random } from '@/game/cb/utils/Random';

/** Names of the game sounds (see the .snd lists) and which lists to load for each part of the game. */
export class GameSounds {
  static readonly soundsToLoad = [
    'mapSounds.snd',
    'combatSounds0.snd',
    'combatSounds1.snd',
    'combatSounds2.snd',
    'combatSounds3.snd',
  ];
  static readonly variations = ['_a', '_b', '_c', '_d', '_e', '_f', '_g'];
  static readonly MOUSE_OVER = 'mouse_over';
  static readonly POP_UP = 'pop_up';
  static readonly BUTTON_CLICK = 'button_click';
  static readonly ITEM_CLICK = 'item_click';
  static readonly MIX_CLICK = 'mix_click';
  static readonly ITEM_DROP_OK = 'item_drop_ok';
  static readonly ITEM_DROP_FAIL = 'item_drop_back';
  static readonly MIX_DONE = 'mix_done';
  static readonly ITEM_TRASH = 'item_trash';
  static readonly CONSUMABLE = 'consumable';
  static readonly INTRO_MUSIC = 'intro_music';
  static readonly MAP_MUSIC = 'map_music';
  static readonly COMBAT_MUSIC = 'combat_music';
  static readonly COMBAT_MUSIC2 = 'combat_music2';
  static readonly BOSS_MUSIC = 'boss_music';
  static readonly FIST_ATTACK = 'fist_attack';
  static readonly SWORD_ATTACK = 'sword_attack';
  static readonly FIRE_ATTACK = 'fire_attack';
  static readonly ICE_ATTACK = 'ice_attack';
  static readonly SHIELD_BLOCK = 'shield_block';
  static readonly SHIELD_BLOCK_ICE = 'shield_block_ice';
  static readonly SHIELD_BLOCK_FIRE = 'shield_block_fire';
  static readonly FIST_BLOCK = 'fist_block';
  static readonly FINN_LOSE = 'jinn_lose';
  static readonly DUNGEON_COMPLETED = 'dungeon_completed';
  static readonly ENEMY2_ATTACK = 'enemy2_attack';
  static readonly ENEMY2_ATTACK_ICE = 'enemy2_attack_ice';
  static readonly ENEMY2_ATTACK_FIRE = 'enemy2_attack_fire';
  static readonly CRITICAL = 'critical';
  static readonly CRITICAL_SHIELD = 'critical_shield';
  static readonly LEVEL_UP = 'level_up';
  static readonly WIN_MUSIC = 'youwin_music';
  static readonly TRANSITION_IN = 'transition_open';
  static readonly TRANSITION_OUT = 'transition_close';
  static readonly BOSS_ATTACK = 'boss_attack';
  static readonly BOSS_LOSE = 'boss_die';
  static readonly SMOKE = 'loot';
  static readonly SORCERER_ATTACK = 'sorcerer_attack';
  static readonly AX_ATTACK = 'ax_attack';
  static get mapSounds() {
    return [GameSounds.soundsToLoad[0]];
  }
  static get combatSounds() {
    return GameSounds.soundsToLoad.slice(1, 4);
  }
  static get combatSoundsBasic() {
    return GameSounds.soundsToLoad.slice(1, 3);
  }
  static get bossSounds() {
    return GameSounds.soundsToLoad.slice(1);
  }
  /** a random variation suffix (for sounds with several versions) */
  static getVariation(count: number): string {
    const num = int(count);
    return GameSounds.variations[Random.nextInt(num - 1)];
  }
  static get FINN_HURT() {
    return 'jinn_hurt' + GameSounds.getVariation(3);
  }
  static get ENEMY1_HURT() {
    return 'enemy1_hurt' + GameSounds.getVariation(2);
  }
  static get ENEMY1_LOSE() {
    return 'enemy1_lose' + GameSounds.getVariation(2);
  }
  static get ENEMY2_HURT() {
    return 'enemy2_hurt' + GameSounds.getVariation(2);
  }
  static get ENEMY2_LOSE() {
    return 'enemy2_lose' + GameSounds.getVariation(2);
  }
  static get BOSS_HURT() {
    return 'boss_hurt' + GameSounds.getVariation(2);
  }
}
