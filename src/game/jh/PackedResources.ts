import { bindMethods } from '@/flash/as3';

/** Resources embedded as properties: get("data/items.csv") -> this.data_items_csv. */
export class PackedResources {
  get(path: string): any {
    return (this as any)[path.replace(/[/.]/g, '_')];
  }
}
bindMethods(PackedResources);
