/** Loads a named resource and calls back when done (see PostLoader, SoundResourceLoader). */
export interface ResourceLoader {
  load(resource: string, onLoaded: Function): void;
}
