// @ts-nocheck
import { bindMethods, int } from '@/flash/as3';
import { BasicState } from '@/game/aplication/BasicState';
import { FSM } from '@/game/aplication/FSM';
import { main } from '@/game/main';
import { ConsumePotionStep } from '@/game/tutorial/steps/ConsumePotionStep';
import { FirstTutorialStep } from '@/game/tutorial/steps/FirstTutorialStep';
import { MixInformationStep } from '@/game/tutorial/steps/MixInformationStep';
import { MixTutorialStep } from '@/game/tutorial/steps/MixTutorialStep';
import { StatTutorialStep } from '@/game/tutorial/steps/StatTutorialStep';
import { TakeAllStep } from '@/game/tutorial/steps/TakeAllStep';

export class Tutorial {
  static readonly NEXT = "next";
  declare fsm: any;
  declare mixKnown: any;
  constructor() {
         
         this.initializeFSM();
         this.fsm.addTransition("init",(main.saveSystem.tutorialStepCompleted() + 1).toString(),Tutorial.NEXT);
         this.fsm.start();
      }
  initializeFSM() {
         var state = new BasicState("init",null,this.startTutorial);
         this.fsm = new FSM(state);
         state = new FirstTutorialStep(1,this);
         this.fsm.addState(state);
         state = new StatTutorialStep(2,this);
         this.fsm.addState(state);
         state = new ConsumePotionStep(3,this);
         this.fsm.addState(state);
         state = new TakeAllStep(4,this);
         this.fsm.addState(state);
         state = new MixInformationStep(5,this);
         this.fsm.addState(state);
         state = new MixTutorialStep(6,this);
         this.fsm.addState(state);
         state = new BasicState("7",this.endTutorial);
         this.fsm.addState(state);
         this.fsm.addTransition("1","2",Tutorial.NEXT);
         this.fsm.addTransition("2","3",Tutorial.NEXT);
         this.fsm.addTransition("3","4",Tutorial.NEXT);
         this.fsm.addTransition("4","5",Tutorial.NEXT);
         this.fsm.addTransition("5","6",Tutorial.NEXT);
         this.fsm.addTransition("6","7",Tutorial.NEXT);
      }
  startTutorial() {
         this.mixKnown = false;
         var num = int(int(main.saveSystem.tutorialStepCompleted()));
         if(num < 3)
         {
            this.lockPotions();
         }
         if(num < 5)
         {
            this.disableMix();
         }
         if(num < 6)
         {
            this.lockTrash();
         }
      }
  isMixKnown() {
         return this.mixKnown;
      }
  lockTrash() {
         main.game.getInventory().getTrash().lock();
      }
  unlockTrash() {
         main.game.getInventory().getTrash().unlock();
      }
  get mixerView() {
         return main.gameHolder.gameView.mixing;
      }
  enableMix() {
         this.mixKnown = true;
         this.mixerView.enable();
      }
  disableMix() {
         this.mixerView.disable();
      }
  lockPotions() {
         main.game.getJinn().liver.onLock.add(this.lockLiver);
         this.lockLiver();
      }
  lockLiver(flag = false) {
         if(!flag)
         {
            main.game.getJinn().liver.lock();
         }
      }
  unlockPotions() {
         main.game.getJinn().liver.onLock.remove(this.lockLiver);
         main.game.getJinn().liver.unlock();
      }
  next() {
         this.fsm.takeTransition(Tutorial.NEXT);
      }
  endTutorial() {
         this.unlockTrash();
         this.enableMix();
         main.game.getShmabledum().getLocker().unlock();
      }
  clear() {
         this.fsm.clear();
      }
}
Tutorial.prototype.fsm = null;
Tutorial.prototype.mixKnown = false;
bindMethods(Tutorial);
