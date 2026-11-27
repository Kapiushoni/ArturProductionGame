/** throws when the condition is false */
export function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}
