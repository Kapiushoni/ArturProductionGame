import { Dictionary, as3values, bindMethods, int } from '@/flash/as3';
import { TextLoader } from '@/game/cb/data/TextLoader';
import { cbArray } from '@/game/cb/utils/cbArray';

/**
 * A CSV file (comma separated, no quoting). After loading, `data` is the rows as arrays of cells
 * (empty lines skipped). get(row, column) is 1-based.
 */
export class CsvLoader extends TextLoader {
  constructor(uri: string) {
    super(uri);
    this.loaded.addAtFirst(this.verifyData);
  }
  /** runs once, before the other loaded listeners: lines -> rows */
  verifyData(_loader: TextLoader) {
    this.loaded.remove(this.verifyData);
    const rows = [];
    for (const line of as3values(this.data)) {
      if (line != '') {
        rows.push(line.split(','));
      }
    }
    this.data = cbArray.createFromArray(rows);
  }
  getLines(): number {
    return int(this.data.length);
  }
  /** a row, or a cell (1-based) */
  get(row: number, column = -1): any {
    row = int(row);
    column = int(column);
    if (column == -1) {
      return this.data[row - 1];
    }
    return this.data[row - 1][column - 1];
  }
  getColumns(): number {
    return int(this.data[0].length);
  }
  /**
   * The rows as objects, keyed by the first column; the header row names the properties.
   * "a.b" headers make nested objects; "null" -> null; numbers -> numbers.
   */
  convertToObjects(): any {
    const header = [];
    const rows: any = new Dictionary();
    for (let j = 0; j < this.data.length; j++) {
      let id = '';
      for (let i = 0; i < this.data[j].length; i++) {
        const cell = this.data[j][i];
        if (j == 0) {
          header[i] = cell;
        } else if (i == 0) {
          id = cell;
          rows.set(id, {});
        } else {
          let obj = rows.get(id);
          let property = header[i];
          const parts = property.split('.');
          if (parts.length > 1) {
            if (obj[parts[0]] == null) {
              obj[parts[0]] = {};
            }
            obj = obj[parts[0]];
            property = parts[1];
          }
          if (cell == 'null') {
            obj[property] = null;
          } else if (isNaN(cell)) {
            obj[property] = cell;
          } else {
            obj[property] = Number(cell);
          }
        }
      }
    }
    return rows;
  }
}
bindMethods(CsvLoader);
