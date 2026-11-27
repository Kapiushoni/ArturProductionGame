/** One stat modifier of an item: Modifier (a stat), HealthModifier, MaxHealthModifier, or NullModifier (none). */
export interface IModifier {
  modifyIcon(clip: any): void;
  modifyValue(textField: any, num: number): void;
  affect(stats: any): void;
  disaffect(stats: any): void;
  getValue(): number;
  getCategory(): number;
  isInstant(): boolean;
  toObject(): { Category: string | null; Value: number | null };
  clear(): void;
}
