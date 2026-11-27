/** One stat modifier of an item (how it looks: see ModifierIcons): Modifier (a stat), HealthModifier, MaxHealthModifier, or NullModifier (none). */
export interface IModifier {
  affect(stats: any): void;
  disaffect(stats: any): void;
  getValue(): number;
  getCategory(): number;
  isInstant(): boolean;
  toObject(): { Category: string | null; Value: number | null };
  clear(): void;
}
