// @ts-nocheck
import { Dictionary, as3keys, as3values, bindMethods, int } from '@/flash/as3';
import { LexicalParser } from '@/game/bonus/LexicalParser';

export class ClassLoader {
  declare classes: any;
  declare parser: any;
  declare parsingObject: any;
  declare parsingClass: any;
  declare references: any;
  declare arrayReferences: any;
  parsingsArray = new Array();
  arrayPos = int(-1);
  constructor(fileLoader) {
         
         this.parser = new LexicalParser(fileLoader.name);
         this.classes = new Dictionary();
         this.references = new Dictionary();
         this.arrayReferences = new Array();
         this.parser.addEventListener(LexicalParser.START_PARSING_CLASS,this.startParsingClass,false,0,true);
         this.parser.addEventListener(LexicalParser.END_CLASS,this.endClass,false,0,true);
         this.parser.addEventListener(LexicalParser.END_ATTRIBUTE,this.endAttribute,false,0,true);
         this.parser.addEventListener(LexicalParser.START_ARRAY,this.startArray,false,0,true);
         this.parser.addEventListener(LexicalParser.END_ARRAY,this.endArray,false,0,true);
         this.parser.parse(String(fileLoader.data));
      }
  startParsingClass(event) {
         this.parsingClass = event.name;
         this.parsingObject = new Object();
      }
  endClass(event) {
         var reference = null;
         var loc2_Item = null;
         this.classes.set(this.parsingClass, this.clone(this.parsingObject));
         var list = [];
         for (reference of as3values(this.references))
         {
            if(this.classes.get(reference.clazz) != undefined)
            {
               this.classes.get(reference.obj)[reference.attr] = this.clone(this.classes.get(reference.clazz));
               list.push(reference.attr);
            }
         }
         for (loc2_Item of as3values(list))
         {
            this.references.delete(loc2_Item);
         }
         this.completeArrayReferences();
      }
  completeArrayReferences() {
         var arrayReference = null;
         var loc1_Item = int(0);
         var list = [];
         var num = int(-1);
         for (arrayReference of as3values(this.arrayReferences))
         {
            num++;
            if(this.classes.get(arrayReference.clazz) != undefined)
            {
               this.classes.get(arrayReference.obj)[arrayReference.attr][arrayReference.pos] = this.clone(this.classes.get(arrayReference.clazz));
               list.push(num);
            }
         }
         for (loc1_Item of as3values(list))
         {
            this.arrayReferences.splice(num,1);
         }
      }
  endAttribute(event) {
         if(event.valueType == LexicalParser.CLASS)
         {
            this.references.set(event.name, {
               "clazz":event.value,
               "obj":this.parsingClass,
               "attr":event.name
            });
            this.parsingObject[event.name] = new Object();
         }
         else if(event.valueType == LexicalParser.ARRAY)
         {
            this.parsingsArray[this.arrayPos].push(event.value);
         }
         else if(event.valueType == LexicalParser.CLASSARRAY)
         {
            this.arrayReferences.push({
               "clazz":event.value,
               "attr":event.name,
               "pos":this.parsingsArray[this.arrayPos].length,
               "obj":this.parsingClass
            });
            this.parsingsArray[this.arrayPos].push(new Object());
         }
         else
         {
            this.parsingObject[event.name] = event.value;
         }
      }
  startArray(event) {
         ++this.arrayPos;
         this.parsingsArray.push(new Array());
      }
  endArray(event) {
         if(this.arrayPos > 0)
         {
            this.parsingsArray[this.arrayPos - 1].push(this.clone(this.parsingsArray[this.arrayPos]));
         }
         else
         {
            this.parsingObject[event.name] = this.clone(this.parsingsArray[this.arrayPos]);
         }
         this.parsingsArray.splice(this.arrayPos,1);
         --this.arrayPos;
      }
  clone(obj) {
         var obj2 = null;
         var key = null;
         if(Array.isArray(obj))
         {
            obj2 = new Array();
         }
         else
         {
            obj2 = new Object();
         }
         for (key of as3keys(obj))
         {
            if(typeof obj[key] == "object")
            {
               obj2[key] = this.clone(obj[key]);
            }
            else
            {
               obj2[key] = obj[key];
            }
         }
         return obj2;
      }
  get(text) {
         return this.classes.get(text);
      }
  getCopy(text) {
         return this.clone(this.get(text));
      }
}
ClassLoader.prototype.classes = null;
ClassLoader.prototype.parser = null;
ClassLoader.prototype.parsingObject = null;
ClassLoader.prototype.parsingClass = null;
ClassLoader.prototype.references = null;
ClassLoader.prototype.arrayReferences = null;
bindMethods(ClassLoader);
