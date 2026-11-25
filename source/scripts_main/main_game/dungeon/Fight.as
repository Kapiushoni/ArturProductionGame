package main_game.dungeon
{
   import cb.signals.Signal;
   import main_game.character.Enemy;
   import main_game.character.Jinn;
   
   public class Fight implements IFight
   {
      
      protected var jinn:Jinn;
      
      protected var enemy:Enemy;
      
      public var theOnEnter:Signal;
      
      public var theOnExit:Signal;
      
      public var theOnHit:Signal;
      
      public var theOnLose:Signal;
      
      public var theOnWin:Signal;
      
      private var first:Boolean;
      
      public function Fight(param1:Enemy, param2:Boolean = false)
      {
         super();
         this.first = param2;
         this.jinn = main.game.getJinn();
         this.enemy = param1;
         this.theOnHit = new Signal();
         this.theOnLose = new Signal();
         this.theOnWin = new Signal();
         this.theOnEnter = new Signal();
         this.theOnExit = new Signal();
      }
      
      public function get onEnter() : Signal
      {
         return this.theOnEnter;
      }
      
      public function get onExit() : Signal
      {
         return this.theOnExit;
      }
      
      public function get onHit() : Signal
      {
         return this.theOnHit;
      }
      
      public function get onLose() : Signal
      {
         return this.theOnLose;
      }
      
      public function get onWin() : Signal
      {
         return this.theOnWin;
      }
      
      public function getEnemy() : Enemy
      {
         return this.enemy;
      }
      
      protected function enter(param1:Function) : void
      {
         this.onEnter.emit(param1);
      }
      
      public function leave(param1:Function) : void
      {
         this.onExit.emit(param1);
      }
      
      public function fight() : void
      {
         this.jinn.prepareForFight(this);
         this.enemy.prepareForFight(this);
         this.jinn.onHit.add(this.atHit);
         this.enemy.onHit.add(this.atHit);
         this.enter(this.start);
      }
      
      protected function atHit(... rest) : void
      {
         this.onHit.emit.apply(this.onHit,rest);
      }
      
      public function start() : void
      {
         this.makeJinnHit();
      }
      
      public function suddenDeath() : void
      {
         this.jinn.onHit.remove(this.atHit);
         this.enemy.onHit.remove(this.atHit);
         this.onLose.emit();
      }
      
      protected function makeJinnHit() : void
      {
         var damage:Damage = null;
         damage = DamageCalculator.calculateDamage(this.jinn,this.enemy);
         this.jinn.hit(this.enemy,damage,function():void
         {
            endJinnHit(damage);
         });
      }
      
      protected function endJinnHit(param1:Damage) : void
      {
         if(!this.enemy.stats.isDead())
         {
            this.makeEnemyHit();
         }
         else
         {
            this.onWin.emit();
         }
      }
      
      protected function endEnemyHit(param1:Damage) : void
      {
         if(!this.jinn.stats.isDead())
         {
            this.makeJinnHit();
         }
         else
         {
            this.onLose.emit();
         }
      }
      
      protected function makeEnemyHit() : void
      {
         var damage:Damage = null;
         damage = DamageCalculator.calculateDamage(this.enemy,this.jinn);
         this.enemy.hit(this.jinn,damage,function():void
         {
            endEnemyHit(damage);
         });
      }
      
      public function deactivate() : void
      {
         this.onLose.clear();
         this.onWin.clear();
         this.onHit.clear();
         this.onEnter.clear();
         this.onExit.clear();
         this.jinn.onHit.remove(this.atHit);
         this.enemy.onHit.remove(this.atHit);
      }
      
      public function clear() : void
      {
         this.enemy = null;
         this.jinn = null;
         this.theOnLose = null;
         this.theOnWin = null;
         this.theOnHit = null;
         this.theOnEnter = null;
         this.theOnExit = null;
      }
      
      public function isFirst() : Boolean
      {
         return this.first;
      }
   }
}

