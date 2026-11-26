// @ts-nocheck
import { Dictionary, as3keys, as3values, bindMethods } from '@/flash/as3';
import { Signal } from '@/game/cb/signals/Signal';

export class Rule {
  completed = new Signal();
  rules = new Dictionary();
  constructor(... rest) {
         var restItem = null;
         
         for (restItem of as3values(rest))
         {
            this.set(restItem);
         }
      }
  isCompleted() {
         var rule = false;
         for (rule of as3values(this.rules))
         {
            if(rule === false)
            {
               return false;
            }
         }
         return true;
      }
  check(text) {
         this.rules.set(text, true);
         if(this.isCompleted())
         {
            this.completed.emit();
         }
      }
  set(text, flag = false) {
         this.rules.set(text, flag);
      }
  reason() {
         var key = null;
         var list = [];
         var flag = true;
         for (key of as3keys(this.rules))
         {
            flag = false;
            if(this.rules.get(key) !== true)
            {
               list.push(key + " is " + this.rules.get(key));
            }
         }
         if(flag)
         {
            list.push("empty!");
         }
         return list;
      }
}
bindMethods(Rule);
