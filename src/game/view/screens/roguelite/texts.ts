import { lang, type Lang } from '@/port/i18n';

/** Texts of the roguelite mod (in code: the game texts in locale.txt stay as they are). */
const TEXTS: Record<Lang, Record<string, string>> = {
  ru: {
    modOn: 'МОД: ВКЛ',
    modOff: 'МОД: ВЫКЛ',
    modHint: 'Роглайт: одна жизнь',
    runOver: 'ЗАБЕГ ОКОНЧЕН',
    reached: 'Вы дошли до подземелья $1',
    best: 'Лучший результат: $1',
    record: 'Новый рекорд!',
    runs: 'Забегов: $1',
    leftFight: 'Бой был брошен: забег засчитан как проигранный',
    toMenu: 'В главное меню',
    ok: 'OK',
  },
  en: {
    modOn: 'MOD: ON',
    modOff: 'MOD: OFF',
    modHint: 'Roguelite: one life',
    runOver: 'RUN OVER',
    reached: 'You reached dungeon $1',
    best: 'Best: $1',
    record: 'New record!',
    runs: 'Runs: $1',
    leftFight: 'The fight was abandoned: the run is lost',
    toMenu: 'Main menu',
    ok: 'OK',
  },
  uk: {
    modOn: 'МОД: УВІМК',
    modOff: 'МОД: ВИМК',
    modHint: 'Роґлайт: одне життя',
    runOver: 'ЗАБІГ ЗАВЕРШЕНО',
    reached: 'Ви дійшли до підземелля $1',
    best: 'Найкращий результат: $1',
    record: 'Новий рекорд!',
    runs: 'Забігів: $1',
    leftFight: 'Бій було покинуто: забіг програно',
    toMenu: 'Головне меню',
    ok: 'OK',
  },
};

/** a text of the mod, $1, $2 ... replaced by the parameters */
export function rlText(key: string, ...params: (string | number)[]): string {
  const text = TEXTS[lang][key] ?? TEXTS.en[key] ?? key;
  return text.replace(/\$(\d)/g, (_, n) => String(params[Number(n) - 1] ?? ''));
}
