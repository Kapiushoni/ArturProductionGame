// @ts-nocheck
import { bindMethods } from '@/flash/as3';

export class NoneFilter {
  constructor() {
         
      }
  doesApply(element) {
         return false;
      }
  getIcons() {
         return [];
      }
}
bindMethods(NoneFilter);
