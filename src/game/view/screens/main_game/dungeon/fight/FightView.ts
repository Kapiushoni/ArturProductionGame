// @ts-nocheck
import { __DEFER, as3as, bindMethods } from '@/flash/as3';
import { BasicFightView } from '@/game/view/screens/main_game/dungeon/fight/BasicFightView';
import { main } from '@/game/main';
import { CharacterFactory } from '@/game/main_game/character/CharacterFactory';
import { Dungeon } from '@/game/main_game/dungeon/Dungeon';
import { IdleAnimation } from '@/game/view/figthers/animations/IdleAnimation';
import { RunAnimation } from '@/game/view/figthers/animations/RunAnimation';
import { FighterView } from '@/game/view/figthers/FighterView';
import { JinnView } from '@/game/view/figthers/JinnView';

export class FightView extends BasicFightView {
  constructor(fight, fighterView, backgroundView) {super(__DEFER); 
          this.__init_BasicFightView(fight,backgroundView,fighterView);
      }
  initializeViews(list) { const __self = this;
         var jinnView = list[0];
         __self.views.set(main.game.getJinn(), jinnView);
         __self.views.set(__self.fight.getEnemy(), CharacterFactory.getInstance().getEnemyView(__self.fight.getEnemy()));
      }
  get jinnView() { const __self = this;
         return as3as(__self.views.get(main.game.getJinn()), JinnView);
      }
  initialize() { const __self = this;
         __self.enemy = __self.fight.getEnemy();
         var fighterView = __self.views.get(__self.enemy);
         fighterView.putIn(__self.bg.arena);
         fighterView.y = Dungeon.DungeonConfig["height_fighters"];
         fighterView.x = Dungeon.DungeonConfig["position_enemy"] + Dungeon.DungeonConfig["lenght_step"] * Dungeon.DungeonConfig["steps_to_find_enemy"];
         fighterView.x += Dungeon.DungeonConfig["end_lenght_step"];
         if(!__self.fight.isFirst())
         {
            fighterView.x += Dungeon.DungeonConfig["start_lenght_step"];
         }
         fighterView.animate(new IdleAnimation());
         super.initialize();
      }
  won() {
         main.game.getDungeon().wonFight();
      }
  lose() {
         main.game.getDungeon().lostFight();
      }
  moveEnemy(num) { num = Number(num); const __self = this;
         __self.views.get(__self.enemy).x -= num;
      }
  enter(callback2) { const __self = this;
         var callback = callback2;
         var steps = Number(Number(Dungeon.DungeonConfig["steps_to_find_enemy"]));
         var walk = new RunAnimation(steps,!__self.fight.isFirst());
         this.jinnView.animate(walk);
         walk.getAtFinish().add(function(fighterAnimation)
         {
            __self.atEndEnter(callback);
         });
         __self.bg.onMove.add(this.moveEnemy);
         __self.bg.beginScroll();
      }
  atEndEnter(callback) { const __self = this;
         __self.bg.endScroll();
         __self.bg.onMove.remove(this.moveEnemy);
         super.enter(callback);
      }
  clear() { const __self = this;
         (as3as(__self.views.get(__self.enemy), FighterView)).clear();
         super.clear();
      }
}
bindMethods(FightView);
