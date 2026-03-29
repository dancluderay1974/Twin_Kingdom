import { signedByteToUnsigned, type GameWorld } from "./world";

/** e.d(n) — UI strings from pool a:[B] with a:[S] start indices */
export function decodeD(world: GameWorld, n: number): string {
  return decodeFromPool(world.poolA2526, world.offsetA126, n);
}

/** e.b(n) — strings from e:[B] with e:[S] starts */
export function decodeB(world: GameWorld, n: number): string {
  return decodeFromPool(world.e1324, world.eStarts, n);
}

/** e.c(n) — strings from f:[B] with f:[S] starts */
export function decodeC(world: GameWorld, n: number): string {
  return decodeFromPool(world.f746, world.fStarts, n);
}

function decodeFromPool(
  pool: Int8Array,
  starts: Int16Array,
  index: number,
): string {
  let m = 0;
  if (index > 0) {
    m = starts[index - 1] + 1;
  }
  let out = "";
  let decoded = 0;
  do {
    if (m >= pool.length) break;
    const raw = pool[m];
    decoded = signedByteToUnsigned(raw);
    out += String.fromCharCode(decoded & 0x7f);
    m++;
  } while ((decoded & 0x80) === 0);
  return out;
}
