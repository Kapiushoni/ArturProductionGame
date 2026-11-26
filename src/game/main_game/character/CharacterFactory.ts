// @ts-nocheck
import { bindMethods, uint } from '@/flash/as3';
import { Boss } from '@/game/main_game/boss_dungeon/Boss';
import { CharacterConfigParser } from '@/game/main_game/character/CharacterConfigParser';
import { Enemy } from '@/game/main_game/character/Enemy';
import { Jinn } from '@/game/main_game/character/Jinn';
import { EnemyView } from '@/game/view/figthers/EnemyView';
import { JinnView } from '@/game/view/figthers/JinnView';
import { BossView } from '@/game/view/screens/main_game/boss_dungeon/BossView';

export class CharacterFactory {
  static instance = null;
  static config = null;
  constructor(singletonLock) {
         
         if(!singletonLock)
         {
            throw new Error("Static Class");
         }
      }
  static getInstance() {
         if(CharacterFactory.instance == null)
         {
            CharacterFactory.instance = new CharacterFactory(new SingletonLock());
         }
         return CharacterFactory.instance;
      }
  static setConfig(dict) {
         CharacterFactory.config = dict;
      }
  getInitialHealth() {
         return uint(uint(CharacterFactory.config.get("Jinn")["BaseHP"]));
      }
  getEnemyView(enemy) {
         return new EnemyView(enemy);
      }
  getJinnView(jinn) {
         return new JinnView(jinn);
      }
  getBossView(boss) {
         return new BossView(boss);
      }
  getBoss(num) { num = uint(num);
         var text = "boss_normal";
         return new Boss(text,this.getConfig(text),num);
      }
  getEnemy(text, num) { num = uint(num);
         if(CharacterFactory.config == null)
         {
            throw new Error("No se cuenta con el archivo de configuracion");
         }
         return new Enemy(text,this.getConfig(text),num);
      }
  getJinn() {
         return new Jinn("Jinn",this.getConfig("Jinn"));
      }
  getConfig(text) {
         return new CharacterConfigParser(CharacterFactory.config.get(text));
      }
}
bindMethods(CharacterFactory);

class SingletonLock {
  constructor() {
      
   }
}
bindMethods(SingletonLock);
