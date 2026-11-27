/** The id of an item without the "Mix_" prefix that mixed items get. */
export function removeMix(id: string): string {
  return id.search('Mix_') == 0 ? id.substring(4) : id;
}
