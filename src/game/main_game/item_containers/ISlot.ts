import type { IDragContainer } from '@/game/drag_and_drop/IDragContainer';
import type { Signal } from '@/game/cb/signals/Signal';

export interface ISlot extends IDragContainer {
  get onChange(): Signal;
  isEmpty(): boolean;
  getContent(): any;
}
