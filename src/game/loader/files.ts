import { Dictionary, paths } from '@/flash/as3';
import { DiFile } from '@/game/bonus/DiFile';

/** Loading of the data files (public/data): plain text, lines, CSV tables and .di files. */

/** the text of a file (the same urls and post-processing as the Flash URLLoader, see paths) */
export async function loadText(uri: string): Promise<string> {
  const response = await fetch(paths.resolve(uri));
  if (!response.ok) throw new Error(response.status + ' ' + uri);
  const text = await response.text();
  const transform = paths.transform[uri];
  return transform ? transform(text) : text;
}

/** the lines of a text, without the spaces at the start (as the original TextLoader) */
export function textLines(text: string): string[] {
  return text.split('\n').map((line) => line.replace(/^([\s|\t|\n]+)?(.*)([\s|\t|\n]+)?$/gm, '$2'));
}

export async function loadLines(uri: string): Promise<string[]> {
  return textLines(await loadText(uri));
}

/**
 * A CSV table (comma separated, no quoting, empty lines skipped) as objects keyed by the first column;
 * the header row names the properties. "a.b" headers make nested objects; "null" -> null; numbers -> numbers.
 */
export function csvToObjects(lines: string[]): Dictionary {
  const table = lines.filter((line) => line != '').map((line) => line.split(','));
  const header = table[0] ?? [];
  const rows = new Dictionary();
  for (const cells of table.slice(1)) {
    const row: any = {};
    rows.set(cells[0], row);
    for (let i = 1; i < cells.length; i++) {
      const cell: any = cells[i];
      let obj = row;
      let property = header[i];
      const parts = property.split('.');
      if (parts.length > 1) {
        obj = row[parts[0]] ??= {};
        property = parts[1];
      }
      obj[property] = cell == 'null' ? null : isNaN(cell) ? cell : Number(cell);
    }
  }
  return rows;
}

export async function loadCsv(uri: string): Promise<Dictionary> {
  return csvToObjects(await loadLines(uri));
}

export async function loadDi(uri: string): Promise<DiFile> {
  return new DiFile({ name: uri, data: await loadText(uri) });
}
