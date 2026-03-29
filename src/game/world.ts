/**
 * Loads game data from /1.bin (g.a(InputStream) in g.java) and /3.bin (e.aA in e.java).
 * Array sizes and read order derived from CFR decompilation; 551-byte segments match file size 10519.
 */

export const LEN = {
  bShort551: 551,
  cShort200: 200,
  vec16: 16,
  vec37: 37,
  int40: 40,
  pair54: 54,
  dShort268: 268,
  eByte1324: 1324,
  fByte746: 746,
  cByte200: 200,
  stringPool2526: 2526,
  longLines260: 260,
  /** JAR ships 10556 bytes; decompiled loop used 10546 — we size to file */
  opcodeMax: 11000,
  stringOffsets126: 126,
} as const;

/** Java g.a(int): stream 0–255 → signed byte storage */
export function streamByteToSignedByte(v: number): number {
  if (v > 127) return -((v - 127) | 0);
  return (v & 0xff) | 0;
}

/** Java g.a(byte): signed storage → 0–255 for bit tests */
export function signedByteToUnsigned(b: number): number {
  const n = b | 0;
  if (n < 0) return -n + 127;
  return n & 0xff;
}

export interface GameWorld {
  /** short[551] — first segment of 1.bin */
  b551: Int16Array;
  /** short[200] */
  c200: Int16Array;
  n16: Int16Array;
  o16: Int16Array;
  p16: Int16Array;
  q16: Int16Array;
  r16: Int16Array;
  s16: Int16Array;
  t16: Int16Array;
  u16: Int16Array;
  v37: Int16Array;
  w37: Int16Array;
  x37: Int16Array;
  y37: Int16Array;
  int40: Int32Array;
  h40: Int8Array;
  C40: Int16Array;
  i40: Int8Array;
  j40: Int8Array;
  k40: Int8Array;
  l40: Uint8Array;
  m40: Int8Array;
  n40: Uint8Array;
  g54: Uint8Array;
  B54: Int16Array;
  d268: Int16Array;
  e1324: Int8Array;
  f746: Int8Array;
  cByte200: Int8Array;
  bByte551: Int8Array;
  /** String pool for e.d() */
  stringPool2526: Int8Array;
  /** Starting indices of d-strings (first n4 entries used) */
  dStringStarts: Int16Array;
  dStringStartCount: number;
  long260: BigInt64Array;
  /** 3.bin opcodes */
  pictureOpcodes: Int8Array;
  pictureOpcodeLength: number;
}

function readU8(buf: Uint8Array, pos: { i: number }): number {
  return buf[pos.i++] & 0xff;
}

export function load1Bin(buffer: ArrayBuffer): GameWorld {
  const buf = new Uint8Array(buffer);
  const pos = { i: 0 };

  const b551 = new Int16Array(LEN.bShort551);
  for (let n = 0; n < LEN.bShort551; n++) {
    b551[n] = readU8(buf, pos);
  }

  const c200 = new Int16Array(LEN.cShort200);
  for (let n = 0; n < LEN.cShort200; n++) {
    const hi = readU8(buf, pos);
    const lo = readU8(buf, pos);
    c200[n] = (hi << 8) | lo;
  }

  const mk16 = () => new Int16Array(LEN.vec16);
  const n16 = mk16(),
    o16 = mk16(),
    p16 = mk16(),
    q16 = mk16(),
    r16 = mk16(),
    s16 = mk16(),
    t16 = mk16(),
    u16 = mk16();
  for (let n = 0; n < LEN.vec16; n++) {
    n16[n] = readU8(buf, pos);
    o16[n] = readU8(buf, pos);
    p16[n] = readU8(buf, pos);
    q16[n] = readU8(buf, pos);
    r16[n] = readU8(buf, pos);
    s16[n] = readU8(buf, pos);
    t16[n] = readU8(buf, pos);
    u16[n] = readU8(buf, pos);
  }

  const v37 = new Int16Array(LEN.vec37);
  const w37 = new Int16Array(LEN.vec37);
  const x37 = new Int16Array(LEN.vec37);
  const y37 = new Int16Array(LEN.vec37);
  for (let n = 0; n < LEN.vec37; n++) {
    v37[n] = readU8(buf, pos);
    w37[n] = readU8(buf, pos);
    x37[n] = readU8(buf, pos);
    y37[n] = readU8(buf, pos);
  }

  const int40 = new Int32Array(LEN.int40);
  const h40 = new Int8Array(LEN.int40);
  const C40 = new Int16Array(LEN.int40);
  const i40 = new Int8Array(LEN.int40);
  const j40 = new Int8Array(LEN.int40);
  const k40 = new Int8Array(LEN.int40);
  const l40 = new Uint8Array(LEN.int40);
  const m40 = new Int8Array(LEN.int40);
  const n40 = new Uint8Array(LEN.int40);

  for (let n = 0; n < LEN.int40; n++) {
    let v = readU8(buf, pos);
    v += readU8(buf, pos) << 8;
    v += readU8(buf, pos) << 16;
    v += readU8(buf, pos) << 24;
    int40[n] = v | 0;
    h40[n] = streamByteToSignedByte(readU8(buf, pos));
    C40[n] = readU8(buf, pos);
    i40[n] = streamByteToSignedByte(readU8(buf, pos));
    j40[n] = streamByteToSignedByte(readU8(buf, pos));
    k40[n] = streamByteToSignedByte(readU8(buf, pos));
    l40[n] = readU8(buf, pos);
    m40[n] = streamByteToSignedByte(readU8(buf, pos));
    n40[n] = readU8(buf, pos);
  }

  const g54 = new Uint8Array(LEN.pair54);
  const B54 = new Int16Array(LEN.pair54);
  for (let n = 0; n < LEN.pair54; n++) {
    g54[n] = readU8(buf, pos);
    B54[n] = readU8(buf, pos);
  }

  const d268 = new Int16Array(LEN.dShort268);
  for (let n = 0; n < LEN.dShort268; n++) {
    d268[n] = streamByteToSignedByte(readU8(buf, pos));
  }
  for (let n = 0; n < LEN.dShort268; n++) {
    const hi = readU8(buf, pos);
    const lo = readU8(buf, pos);
    d268[n] = (hi << 8) | lo;
  }

  const e1324 = new Int8Array(LEN.eByte1324);
  const f746 = new Int8Array(LEN.fByte746);
  const cByte200 = new Int8Array(LEN.cByte200);
  const bByte551 = new Int8Array(LEN.bByte551);
  const stringPool2526 = new Int8Array(LEN.stringPool2526);
  const dStringStarts = new Int16Array(LEN.stringOffsets126);
  let dStringStartCount = 0;

  const readFChunk = (target: Int8Array, markStarts: boolean): void => {
    let n4 = 0;
    for (let n3 = 0; n3 < target.length; n3++) {
      let n2 = readU8(buf, pos);
      const nibHi = (n2 & 0xf0) >> 4;
      const nibLo = (n2 & 0xf) << 4;
      n2 = nibHi | nibLo;
      if ((n2 & 0x80) > 0) {
        if (markStarts && n4 < dStringStarts.length) {
          dStringStarts[n4] = n3;
          n4++;
        }
      }
      target[n3] = streamByteToSignedByte(n2);
    }
    if (markStarts) dStringStartCount = n4;
  };

  readFChunk(e1324, false);
  readFChunk(f746, false);
  readFChunk(cByte200, false);
  readFChunk(bByte551, false);
  readFChunk(stringPool2526, true);

  const long260 = new BigInt64Array(LEN.longLines260);
  for (let i = 0; i < LEN.longLines260; i++) {
    let s = "0";
    let done = false;
    while (!done) {
      const n = readU8(buf, pos);
      const a = (n & 0xf0) >> 4;
      const b = n & 0x0f;
      if (n !== 13) {
        s += String(a);
        if (b > 0) s += String(b);
      } else {
        done = true;
      }
    }
    try {
      long260[i] = BigInt(s);
    } catch {
      long260[i] = 0n;
    }
  }

  if (pos.i !== buf.length) {
    console.warn(
      `[world] 1.bin consumed ${pos.i} of ${buf.length} bytes (expected exact match)`,
    );
  }

  return {
    b551,
    c200,
    n16,
    o16,
    p16,
    q16,
    r16,
    s16,
    t16,
    u16,
    v37,
    w37,
    x37,
    y37,
    int40,
    h40,
    C40,
    i40,
    j40,
    k40,
    l40,
    m40,
    n40,
    g54,
    B54,
    d268,
    e1324,
    f746,
    cByte200,
    bByte551,
    stringPool2526,
    dStringStarts,
    dStringStartCount,
    long260,
    pictureOpcodes: new Int8Array(LEN.opcodeMax),
    pictureOpcodeLength: 0,
  };
}

export function load3Bin(world: GameWorld, buffer: ArrayBuffer): void {
  const buf = new Uint8Array(buffer);
  if (buf.length > world.pictureOpcodes.length) {
    world.pictureOpcodes = new Int8Array(buf.length);
  }
  const out = world.pictureOpcodes;
  const n = buf.length;
  world.pictureOpcodeLength = n;
  for (let i = 0; i < n; i++) {
    out[i] = streamByteToSignedByte(buf[i]);
  }
}

/** Post-load defaults from g.c() tail (g.java ~743–766) */
export function applyGInit(world: GameWorld): void {
  void world;
  // Numeric scalars live in engine runtime state (engine.ts); world holds arrays only.
}
