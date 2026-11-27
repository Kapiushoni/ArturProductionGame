import { bindMethods, int } from '@/flash/as3';
import { loadText } from '@/game/loader/files';

/**
 * Texts of the game (locale.txt): one "key: text" per line.
 * get(key, [a, b]) replaces $1, $2 ... with the parameters ($$1 gives a literal "$1").
 */
export class Locale {
  /** key -> text */
  private texts = new Map<string, string>();

  constructor(text: string) {
    for (const line of text.split('\n')) {
      const parts = line.split(':');
      const key = parts.shift();
      this.texts.set(key, parts.join(':').replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm, '$2'));
    }
  }
  static async load(uri: string): Promise<Locale> {
    return new Locale(await loadText(uri));
  }
  get(key: string, params: any[] = null): string {
    const text = this.texts.get(key);
    if (text == undefined) {
      return 'missing key [' + key + ']';
    }
    if (params == null) {
      return text;
    }
    return text.replace(/\$+\d+/g, (match: string) => {
      if (match.substr(0, 2) == '$$') {
        return match.substr(1);
      }
      return params[int(match.substr(1)) - 1];
    });
  }
}
bindMethods(Locale);
