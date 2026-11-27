import { bindMethods } from '@/flash/as3';
import { Log } from '@/game/cb/logger/Log';
import { Signal } from '@/game/cb/signals/Signal';

/**
 * Loads resources one after another in the background, after the game has started (the sound lists).
 * onLoad before each resource and at the end; isLoaded(resource) says if it is done (a resource that is
 * not in the list counts as loaded once the loading has started).
 */
export class PostLoader {
  static readonly log = Log.getLogger('PostLoader');
  readonly onLoad = new Signal();
  private started = false;
  private loaded = new Set<string>();

  constructor(
    private resources: string[],
    private loadOne: (resource: string) => Promise<void>,
  ) {}
  isLoaded(resource: string): boolean {
    return this.resources.includes(resource) ? this.loaded.has(resource) : this.started;
  }
  async start() {
    if (this.started) return;
    this.started = true;
    for (const resource of this.resources) {
      this.onLoad.emit();
      await this.loadOne(resource);
      this.loaded.add(resource);
      PostLoader.log.log('Loaded: ' + resource);
    }
    this.onLoad.emit();
  }
}
bindMethods(PostLoader);
