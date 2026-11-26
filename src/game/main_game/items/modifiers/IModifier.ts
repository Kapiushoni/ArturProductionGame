// @ts-nocheck

export interface IModifier {
  modifyIcon(param1): any;
  modifyValue(param1, param2): any;
  affect(param1): any;
  disaffect(param1): any;
  getValue(): any;
  getCategory(): any;
  isInstant(): any;
  toObject(): any;
  clear(): any;
}
