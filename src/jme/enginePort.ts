/**
 * Async timing hook for the J2ME `Thread.yield()` / timer cadence from e.java.
 * Full `e.run` → `b(int)` → `g()` → `k()` port lives primarily in e.java (~3k lines)
 * and is staged here so the web host can yield to the browser between chunks.
 */
export async function midpYield(ms = 0): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
