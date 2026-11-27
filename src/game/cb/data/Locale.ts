import { Dictionary, URLRequest, as3values, bindMethods, int } from '@/flash/as3';
import { TextLoader } from '@/game/cb/data/TextLoader';

/**
 * Texts of the game (locale.txt): one "key: text" per line.
 * get(key, [a, b]) replaces $1, $2 ... with the parameters ($$1 gives a literal "$1").
 */
export class Locale extends TextLoader {
  /** Dictionary: key -> text */
  private locale: any = null;

  load(packedResources: any = null) {
    if (packedResources) {
      const cls = packedResources.get(this.uri);
      this.removeListeners();
      this.loader = null;
      this.createLocale(new cls());
      this.loaded.emit(this);
      return;
    }
    this.loader.load(new URLRequest(this.uri));
  }
  createLocale(text: any) {
    this.locale = new Dictionary();
    this.data = String(text).split('\n');
    for (const line of as3values(this.data)) {
      const parts = line.split(':');
      const key = parts.shift();
      this.locale.set(key, parts.join(':').replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm, '$2'));
    }
  }
  loaderCompleteHandler(_event: any) {
    this.createLocale(this.loader.data);
    this.loaded.emit(this);
  }
  get(key: string, params: any[] = null): string {
    if (this.locale.get(key) == undefined) {
      return 'missing key [' + key + ']';
    }
    if (params == null) {
      return this.locale.get(key);
    }
    return this.locale.get(key).replace(/\$+\d+/g, (match: string) => {
      if (match.substr(0, 2) == '$$') {
        return match.substr(1);
      }
      return params[int(match.substr(1)) - 1];
    });
  }
}
bindMethods(Locale);
