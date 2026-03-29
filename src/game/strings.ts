import { signedByteToUnsigned, type GameWorld } from "./world";

/** e.d(n) — UI / system strings from 1.bin string pool */
export function decodeD(world: GameWorld, n: number): string {
  return decodeFromPool(
    world.stringPool2526,
    world.dStringStarts,
    n,
  );
}

/** e.b(n) — entity / room text from e1324 pool (offsets in e1324 via table in e — use byte run from start) */
export function decodeB(world: GameWorld, n: number): string {
  return decodeFromBytePoolRun(world.e1324, n);
}

/** e.c(n) — alternate pool f746 */
export function decodeC(world: GameWorld, n: number): string {
  return decodeFromBytePoolRun(world.f746, n);
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
    const raw = pool[m];
    decoded = signedByteToUnsigned(raw);
    out += String.fromCharCode(decoded & 0x7f);
    m++;
  } while ((decoded & 0x80) === 0);
  return out;
}

/**
 * b(n) / c(n) in original use offset tables inside the same byte arrays;
 * without full offset rebuild, scan from 0 using same 7-bit terminal encoding for low indices.
 */
function decodeFromBytePoolRun(pool: Int8Array, n: number): string {
  let i = 0;
  for (let skip = 0; skip < n; skip++) {
    if (i >= pool.length) break;
    let decoded = 0;
    do {
      decoded = signedByteToUnsigned(pool[i++]);
    } while ((decoded & 0x80) === 0 && i < pool.length);
  }
  let out = "";
  let decoded = 0;
  do {
    if (i >= pool.length) break;
    decoded = signedByteToUnsigned(pool[i++]);
    out += String.fromCharCode(decoded & 0x7f);
  } while ((decoded & 0x80) === 0);
  return out;
}
