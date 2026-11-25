// Flash Player (release) swallows uncaught errors in event handlers/frame scripts and keeps running.
const seen = new Map<string, number>();
export function reportError(where: string, e: any) {
  const key = String(e?.message ?? e);
  const n = (seen.get(key) ?? 0) + 1; seen.set(key, n);
  if (n <= 3) console.error(`[as3 ${where}] ` + String(e?.stack ?? e).split('\n').slice(0, 6).join(' <- '));
}
export function safeCall(where: string, fn: () => void) {
  try { fn(); } catch (e) { reportError(where, e); }
}
