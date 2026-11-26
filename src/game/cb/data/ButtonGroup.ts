// @ts-nocheck
import { as3values, bindMethods } from '@/flash/as3';
import { ButtonInfo } from '@/game/cb/data/ButtonInfo';

export class ButtonGroup {
  static groups = [];
  declare soundMixer: any;
  declare clickSound: any;
  declare overSound: any;
  declare mouseOutFuncs: any;
  declare mouseOverFuncs: any;
  declare clickFuncs: any;
  constructor() {
         
         this.mouseOutFuncs = [];
         this.mouseOverFuncs = [];
         this.clickFuncs = [];
      }
  static get(text) {
         if(ButtonGroup.groups[text] == undefined)
         {
            ButtonGroup.groups[text] = new ButtonGroup();
         }
         return ButtonGroup.groups[text];
      }
  setSoundMixer(soundMixer) {
         this.soundMixer = soundMixer;
         return this;
      }
  setClickSound(clickSound) {
         this.clickSound = clickSound;
         return this;
      }
  setOverSound(overSound) {
         this.overSound = overSound;
         return this;
      }
  createButton(callback, value = null, value2 = null, flag = true, text = null) {
         var func = null;
         if((typeof value === "string"))
         {
            value = ButtonInfo.defaultGoto(value,flag,text);
         }
         if((typeof value2 === "string"))
         {
            value2 = ButtonInfo.defaultGoto(value2,flag,text);
         }
         func = this.createFunc(callback,this.clickSound,this.clickFuncs);
         var func2 = this.createFunc(value,this.overSound,this.mouseOverFuncs);
         var func3 = this.createFunc(value2,null,this.mouseOutFuncs);
         return new ButtonInfo(func,func2,func3,flag,text);
      }
  addMouseOver(callback) {
         this.mouseOverFuncs.push(callback);
         return this;
      }
  addMouseOut(callback) {
         this.mouseOutFuncs.push(callback);
         return this;
      }
  addClick(callback) {
         this.clickFuncs.push(callback);
         return this;
      }
  createFunc(callback, text, list2) { const __self = this;
         var o = null;
         var oList = null;
         var cb = callback;
         var sound = text;
         var list = list2;
         oList = [];
         if(cb != null)
         {
            oList.push(cb);
         }
         if(sound)
         {
            oList.push(function(event)
            {
               __self.soundMixer.play(sound);
            });
         }
         oList = list.concat(oList);
         o = function(event2)
         {
            var oListItem = null;
            for (oListItem of as3values(oList))
            {
               oListItem(event2);
            }
         };
         return o;
      }
}
ButtonGroup.prototype.soundMixer = null;
ButtonGroup.prototype.clickSound = null;
ButtonGroup.prototype.overSound = null;
ButtonGroup.prototype.mouseOutFuncs = null;
ButtonGroup.prototype.mouseOverFuncs = null;
ButtonGroup.prototype.clickFuncs = null;
bindMethods(ButtonGroup);
