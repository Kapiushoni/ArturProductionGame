/** Something items can be dragged from / dropped into (slots, trash, ...). */
export interface IDragContainer {
  remove(item: any): void;
  add(item: any): void;
  /** moves `item` here from `from` (swapping with the current content when allowed) */
  moveFrom(item: any, from: IDragContainer): void;
  canSwap(other: IDragContainer): boolean;
  itsCompatible(item: any, from: IDragContainer): boolean;
  canMoveFrom(item: any, from: IDragContainer): boolean;
  /** the item that can be dragged out of here, or null */
  getContainToDrag(): any;
  clear(): void;
}
