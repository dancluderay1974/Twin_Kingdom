/**
 * Loads /1.bin exactly as g.b–g.g in g.class (verified against javap for Twin-Kingdom-Valley JAR).
 */

export const LEN = {
  shortB2478: 2478,
  shortC200: 200,
  vec16: 16,
  vec37: 37,
  int40: 40,
  pairGB: 54,
  dByte200: 200,
  dShort268: 268,
  eByte1324: 1324,
  eShort260: 260,
  fByte746: 746,
  fShort127: 127,
  cByte114: 114,
  bByte551: 551,
  poolA2526: 2526,
  shortA126: 126,
  longLines260: 260,
  opcodeMax: 11000,
} as const;

export function streamByteToSignedByte(v: number): number {
  if (v > 127) return -((v - 127) | 0);
  return (v & 0xff) | 0;
}

export function signedByteToUnsigned(b: number): number {
  const n = b | 0;
  if (n < 0) return -n + 127;
  return n & 0xff;
}

/** Java g.a(int) for stream → signed storage */
export function gStreamToByte(v: number): number {
  return streamByteToSignedByte(v);
}

export interface GameWorld {
  shortB2478: Int16Array;
  shortC200: Int16Array;
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
  l40: Int8Array;
  m40: Int8Array;
  n40: Int8Array;
  gVerb54: Int8Array;
  B54: Int16Array;
  dByte200: Int8Array;
  d268: Int16Array;
  e1324: Int8Array;
  eStarts: Int16Array;
  eStartCount: number;
  f746: Int8Array;
  fStarts: Int16Array;
  fStartCount: number;
  cByte114: Int8Array;
  bByte551: Int8Array;
  poolA2526: Int8Array;
  offsetA126: Int16Array;
  offsetACount: number;
  long260: BigInt64Array;
  pictureOpcodes: Int8Array;
  pictureOpcodeLength: number;
  /** Byte offset after load1Bin (must equal buffer length) */
  bytesConsumed: number;
}

function readU8(buf: Uint8Array, pos: { i: number }): number {
  return buf[pos.i++] & 0xff;
}

export function load1Bin(buffer: ArrayBuffer): GameWorld {
  const buf = new Uint8Array(buffer);
  const pos = { i: 0 };

  const shortB2478 = new Int16Array(LEN.shortB2478);
  for (let n = 0; n < LEN.shortB2478; n++) {
    shortB2478[n] = readU8(buf, pos);
  }

  const shortC200 = new Int16Array(LEN.shortC200);
  for (let n = 0; n < LEN.shortC200; n++) {
    shortC200[n] = (readU8(buf, pos) << 8) | readU8(buf, pos);
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
  const l40 = new Int8Array(LEN.int40);
  const m40 = new Int8Array(LEN.int40);
  const n40 = new Int8Array(LEN.int40);

  for (let n = 0; n < LEN.int40; n++) {
    let v = readU8(buf, pos);
    v += readU8(buf, pos) << 8;
    v += readU8(buf, pos) << 16;
    v += readU8(buf, pos) << 24;
    int40[n] = v | 0;
    h40[n] = gStreamToByte(readU8(buf, pos));
    C40[n] = readU8(buf, pos);
    i40[n] = gStreamToByte(readU8(buf, pos));
    j40[n] = gStreamToByte(readU8(buf, pos));
    k40[n] = gStreamToByte(readU8(buf, pos));
    l40[n] = readU8(buf, pos) << 24 >> 24;
    m40[n] = gStreamToByte(readU8(buf, pos));
    n40[n] = readU8(buf, pos) << 24 >> 24;
  }

  const gVerb54 = new Int8Array(LEN.pairGB);
  const B54 = new Int16Array(LEN.pairGB);
  for (let n = 0; n < LEN.pairGB; n++) {
    gVerb54[n] = readU8(buf, pos) << 24 >> 24;
    B54[n] = readU8(buf, pos);
  }

  const dByte200 = new Int8Array(LEN.dByte200);
  for (let n = 0; n < LEN.dByte200; n++) {
    dByte200[n] = gStreamToByte(readU8(buf, pos));
  }

  const d268 = new Int16Array(LEN.dShort268);
  for (let n = 0; n < LEN.dShort268; n++) {
    d268[n] = (readU8(buf, pos) << 8) | readU8(buf, pos);
  }

  const e1324 = new Int8Array(LEN.eByte1324);
  const eStarts = new Int16Array(LEN.eShort260);
  let eStartCount = 0;
  for (let n3 = 0; n3 < LEN.eByte1324; n3++) {
    let n2 = readU8(buf, pos);
    const hi = n2 & 0x80;
    if (hi > 0 && eStartCount < LEN.eShort260) {
      eStarts[eStartCount++] = n3;
    }
    n2 = (n2 & 0x40) === 0x40 ? n2 & 0x3f : ((n2 & 0x7f) >> 1) + 65;
    e1324[n3] = gStreamToByte(n2 + hi);
  }

  const f746 = new Int8Array(LEN.fByte746);
  const fStarts = new Int16Array(LEN.fShort127);
  let fStartCount = 0;
  for (let n3 = 0; n3 < LEN.fByte746; n3++) {
    let n2 = readU8(buf, pos);
    const hi = n2 & 0x80;
    if (hi > 0 && fStartCount < LEN.fShort127) {
      fStarts[fStartCount++] = n3;
    }
    n2 = (n2 & 0x40) === 0x40 ? n2 & 0x3f : ((n2 & 0x7f) >> 1) + 65;
    f746[n3] = gStreamToByte(n2 + hi);
  }

  const cByte114 = new Int8Array(LEN.cByte114);
  for (let n3 = 0; n3 < LEN.cByte114; n3++) {
    cByte114[n3] = gStreamToByte(readU8(buf, pos));
  }

  const bByte551 = new Int8Array(LEN.bByte551);
  for (let n3 = 0; n3 < LEN.bByte551; n3++) {
    bByte551[n3] = gStreamToByte(readU8(buf, pos));
  }

  const poolA2526 = new Int8Array(LEN.poolA2526);
  const offsetA126 = new Int16Array(LEN.shortA126);
  let offsetACount = 0;
  let scratchA = 0;
  let scratchB = 0;
  for (let n3 = 0; n3 < LEN.poolA2526; n3++) {
    let n2 = readU8(buf, pos);
    scratchA = (n2 & 0xf0) >> 4;
    scratchB = (n2 & 0x0f) << 4;
    n2 = scratchA | scratchB;
    if ((n2 & 0x80) > 0 && offsetACount < LEN.shortA126) {
      offsetA126[offsetACount++] = n3;
    }
    poolA2526[n3] = gStreamToByte(n2);
  }

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

  const bytesConsumed = pos.i;

  return {
    shortB2478,
    shortC200,
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
    gVerb54,
    B54,
    dByte200,
    d268,
    e1324,
    eStarts,
    eStartCount,
    f746,
    fStarts,
    fStartCount,
    cByte114,
    bByte551,
    poolA2526,
    offsetA126,
    offsetACount,
    long260,
    pictureOpcodes: new Int8Array(LEN.opcodeMax),
    pictureOpcodeLength: 0,
    bytesConsumed,
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

export function assert1BinFullyConsumed(world: GameWorld, fileSize: number): void {
  if (world.bytesConsumed !== fileSize) {
    throw new Error(
      `1.bin: consumed ${world.bytesConsumed} bytes, file is ${fileSize}`,
    );
  }
}

