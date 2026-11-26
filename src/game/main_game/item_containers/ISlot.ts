// @ts-nocheck
import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';

export interface ISlot extends IDragContainer {
  get onChange(): any;
  isEmpty(): any;
  getContent(): any;
}
