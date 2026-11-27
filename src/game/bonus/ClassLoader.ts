import { Dictionary, as3keys, as3values, bindMethods } from '@/flash/as3';
import { LexicalParser } from '@/game/bonus/LexicalParser';
import type { ParseEvent } from '@/game/bonus/events/ParseEvent';

/**
 * Builds plain objects from a .di file (see LexicalParser): get("Name") is the block "Name" as an object.
 * A reference to another block (attr = Other) becomes a copy of that block once it has been read.
 */
export class ClassLoader {
  /** Dictionary: block name -> object */
  private classes: any;
  private parser: LexicalParser;
  private parsingObject: any = null;
  private parsingClass: string = null;
  /** Dictionary: attribute -> { clazz, obj, attr } references still waiting for their block */
  private references: any;
  /** { clazz, attr, pos, obj } references inside arrays still waiting for their block */
  private arrayReferences: any[];
  /** arrays being read (nested arrays) */
  private parsingsArray: any[] = [];
  private arrayPos = -1;

  /** fileLoader: { name, data } */
  constructor(fileLoader: { name: string; data: any }) {
    this.parser = new LexicalParser(fileLoader.name);
    this.classes = new Dictionary();
    this.references = new Dictionary();
    this.arrayReferences = [];
    this.parser.addEventListener(LexicalParser.START_PARSING_CLASS, this.startParsingClass, false, 0, true);
    this.parser.addEventListener(LexicalParser.END_CLASS, this.endClass, false, 0, true);
    this.parser.addEventListener(LexicalParser.END_ATTRIBUTE, this.endAttribute, false, 0, true);
    this.parser.addEventListener(LexicalParser.START_ARRAY, this.startArray, false, 0, true);
    this.parser.addEventListener(LexicalParser.END_ARRAY, this.endArray, false, 0, true);
    this.parser.parse(String(fileLoader.data));
  }
  startParsingClass(event: ParseEvent) {
    this.parsingClass = event.name;
    this.parsingObject = {};
  }
  endClass(_event: ParseEvent) {
    this.classes.set(this.parsingClass, this.clone(this.parsingObject));
    // resolve the references to blocks that exist now
    const resolved = [];
    for (const reference of as3values(this.references)) {
      if (this.classes.get(reference.clazz) != undefined) {
        this.classes.get(reference.obj)[reference.attr] = this.clone(this.classes.get(reference.clazz));
        resolved.push(reference.attr);
      }
    }
    for (const attr of as3values(resolved)) {
      this.references.delete(attr);
    }
    this.completeArrayReferences();
  }
  completeArrayReferences() {
    const resolved = [];
    let last = -1;
    for (const reference of as3values(this.arrayReferences)) {
      last++;
      if (this.classes.get(reference.clazz) != undefined) {
        this.classes.get(reference.obj)[reference.attr][reference.pos] = this.clone(this.classes.get(reference.clazz));
        resolved.push(last);
      }
    }
    // forget the resolved ones (from the end, so the indexes stay valid)
    for (let i = resolved.length - 1; i >= 0; i--) {
      this.arrayReferences.splice(resolved[i], 1);
    }
  }
  endAttribute(event: ParseEvent) {
    if (event.valueType == LexicalParser.CLASS) {
      this.references.set(event.name, { clazz: event.value, obj: this.parsingClass, attr: event.name });
      this.parsingObject[event.name] = {};
    } else if (event.valueType == LexicalParser.ARRAY) {
      this.parsingsArray[this.arrayPos].push(event.value);
    } else if (event.valueType == LexicalParser.CLASSARRAY) {
      this.arrayReferences.push({
        clazz: event.value,
        attr: event.name,
        pos: this.parsingsArray[this.arrayPos].length,
        obj: this.parsingClass,
      });
      this.parsingsArray[this.arrayPos].push({});
    } else {
      this.parsingObject[event.name] = event.value;
    }
  }
  startArray(_event: ParseEvent) {
    ++this.arrayPos;
    this.parsingsArray.push([]);
  }
  endArray(event: ParseEvent) {
    if (this.arrayPos > 0) {
      this.parsingsArray[this.arrayPos - 1].push(this.clone(this.parsingsArray[this.arrayPos]));
    } else {
      this.parsingObject[event.name] = this.clone(this.parsingsArray[this.arrayPos]);
    }
    this.parsingsArray.splice(this.arrayPos, 1);
    --this.arrayPos;
  }
  /** deep copy of arrays and plain objects */
  clone(obj: any): any {
    const copy: any = Array.isArray(obj) ? [] : {};
    for (const key of as3keys(obj)) {
      copy[key] = typeof obj[key] == 'object' ? this.clone(obj[key]) : obj[key];
    }
    return copy;
  }
  get(name: string): any {
    return this.classes.get(name);
  }
  getCopy(name: string): any {
    return this.clone(this.get(name));
  }
}
bindMethods(ClassLoader);
