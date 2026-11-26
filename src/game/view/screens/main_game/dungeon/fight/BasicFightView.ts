// @ts-nocheck
import { Dictionary, MovieClip, Timer, TimerEvent, __DEFER, as3as, as3values, bindMethods } from '@/flash/as3';
import { Functor } from '@/game/cb/actions/Functor';
import { EndAnimation } from '@/game/cb/conditions/EndAnimation';
import { SmartMC } from '@/game/cb/display/SmartMC';
import { main } from '@/game/main';
import { Util } from '@/game/util/Util';
import { FighterView } from '@/game/view/figthers/FighterView';

export class BasicFightView {
  declare bg: any;
  declare fight: any;
  declare enemy: any;
  declare views: any;
  declare timer: any;
  constructor(...__a) { if (__a[0] !== __DEFER) this.__init_BasicFightView(...__a); }
  __init_BasicFightView(fight, bg, ... rest) {
         
         this.fight = fight;
         this.bg = bg;
         this.views = new Dictionary();
         this.initializeViews(rest);
         this.initialize();
      }
  getFightConfig() {
         return main.config.get("FightConfig");
      }
  initializeViews(list) {
         throw new Error("Must implement");
      }
  initialize() {
         this.fight.onHit.add(this.onHit);
         this.fight.onEnter.add(this.enter);
         this.fight.onExit.add(this.leave);
         this.fight.onWin.add(this.won);
         this.fight.onLose.add(this.lose);
      }
  won() {
         throw new Error("Must implement");
      }
  lose() {
         throw new Error("Must implement");
      }
  countdown(callback) { const __self = this;
         var next = callback;
         this.bg.enemyHud.changeFighter(this.enemy);
         this.timer = new Timer(100,this.getFightConfig().countdown * 10);
         this.timer.addEventListener(TimerEvent.TIMER_COMPLETE,function(event)
         {
            __self.removeTimer();
            next();
         });
         this.timer.start();
      }
  enter(callback) {
         this.countdown(callback);
      }
  leave(callback) {
         this.bg.enemyHud.changeFighter(null);
         callback();
      }
  onHit(fighter, fighter2, damage2, callback) { const __self = this;
         var hitter = fighter;
         var reciver = fighter2;
         var damage = damage2;
         var atEnd = callback;
         this.timer = new Timer(100,this.getFightConfig().cooldown * 10);
         this.timer.addEventListener(TimerEvent.TIMER_COMPLETE,function(event)
         {
            __self.removeTimer();
            __self.views.get(hitter).onHit(__self.views.get(reciver),damage,atEnd,Util.l(__self.showFeedback,hitter,reciver,damage));
         });
         this.timer.start();
      }
  showFeedback(fighter, fighter2, damage2) {
         var hitterView = null;
         var jinnFeedbacks = null;
         var enemyFeedbacks = null;
         var number = null;
         var smart_mc = null;
         var fFeedback = null;
         var eFeedback = null;
         var hitter = fighter;
         var reciver = fighter2;
         var damage = damage2;
         number = as3as(main.swfLoader.getObject("assets.numberHealth2"), MovieClip);
         number.container.title.title.text = damage.stringValue();
         hitterView = as3as(this.views.get(reciver), FighterView);
         number.x = hitterView.x;
         number.y = hitterView.y;
         if(hitter.isJinn())
         {
            number.scaleX = -1;
            number.container.title.scaleX = -1;
            jinnFeedbacks = damage.getHitterFeedback();
            enemyFeedbacks = damage.getDefenderFeedback();
         }
         else
         {
            number.x -= 50;
            enemyFeedbacks = damage.getHitterFeedback();
            jinnFeedbacks = damage.getDefenderFeedback();
         }
         number.gotoAndPlay(1);
         this.bg.arena.addChild(number);
         smart_mc = new SmartMC(number);
         smart_mc.trigger(new EndAnimation(),Functor.wrap(function()
         {
            smart_mc.clear();
            number.stop();
            number.parent.removeChild(number);
         }));
         for (fFeedback of as3values(jinnFeedbacks))
         {
            this.bg.addJinnFeddback(fFeedback);
         }
         for (eFeedback of as3values(enemyFeedbacks))
         {
            this.bg.addEnemyFeddback(eFeedback);
         }
      }
  removeTimer() {
         if(this.timer != null)
         {
            this.timer.stop();
         }
         this.timer = null;
      }
  pause() {
         var view = null;
         if(this.timer != null)
         {
            this.timer.stop();
         }
         this.bg.pauseScroll();
         for (view of as3values(this.views))
         {
            view.pause();
         }
      }
  resume() {
         var view = null;
         if(this.timer != null)
         {
            this.timer.start();
         }
         this.bg.resumeScroll();
         for (view of as3values(this.views))
         {
            view.resume();
         }
      }
  clear() {
         this.removeTimer();
         this.bg = null;
         this.views = null;
         this.enemy = null;
      }
}
BasicFightView.prototype.bg = null;
BasicFightView.prototype.fight = null;
BasicFightView.prototype.enemy = null;
BasicFightView.prototype.views = null;
BasicFightView.prototype.timer = null;
bindMethods(BasicFightView);
