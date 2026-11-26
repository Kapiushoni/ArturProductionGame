// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class PackedResources {
  constructor() {
         
      }
  get(text) {
         do
         {
            text = text.replace("/","_");
         }
         while(text.indexOf("/") >= 0);
         do
         {
            text = text.replace(".","_");
         }
         while(text.indexOf(".") >= 0);
         return this[text];
      }
}
bindMethods(PackedResources);
