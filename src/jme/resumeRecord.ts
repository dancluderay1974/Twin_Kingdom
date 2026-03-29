/**
 * Binary resume record matching javax MIDP g.a(String) write order (tkv_resume).
 * See src/decompiled/g.java lines 166–277 and load 320–432.
 */

import { LEN, type GameWorld } from "../game/world";

export const RESUME_Z_LEN = 39;

/** Java g.a(int) — short value → single stream byte (see g.java ~769) */
export function encodeShortForResumeStream(s: number): number {
  let n = s | 0;
  if (n > 127) n = (n - 127) * -1;
  return n & 0xff;
}

/** Inverse of encodeShortForResumeStream / Java g.a(byte) read path */
export function decodeShortFromResumeStreamByte(u8: number): number {
  const sb = u8 > 127 ? u8 - 256 : u8;
  if (sb < 0) return -sb + 127;
  return sb;
}

/** Single-byte scalar field order in save (g.java 206–268); note U,W,V,X,Y,Z */
export const RESUME_SCALAR_KEYS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "W",
  "V",
  "X",
  "Y",
  "Z",
  "aa",
  "ab",
  "ac",
  "ad",
  "ae",
  "af",
  "ag",
  "ah",
  "ai",
  "aj",
  "ak",
  "al",
  "am",
] as const;

export type ResumeScalarKey = (typeof RESUME_SCALAR_KEYS)[number];

/** Mid-record byte fields before short[] b; tail fields after long (Java a.*) */
export type ResumeScalars = Record<ResumeScalarKey, number> & {
  at: number;
  au: number;
  av: number;
  aw: number;
  ax: number;
  ay: number;
  az: number;
  aA: number;
  aB: number;
  longA: bigint;
  an: number;
  ao: number;
  ap: number;
  aq: number;
  ar: number;
  as: number;
  slotG: number;
  slotH: number;
};

export type ResumeRuntime = {
  B54: Int16Array;
  gVerb54: Int8Array;
  shortB2478: Int16Array;
  d268: Int16Array;
  t16: Int16Array;
  u16: Int16Array;
  v37: Int16Array;
  w37: Int16Array;
  x37: Int16Array;
  y37: Int16Array;
  z39: Int16Array;
  A39: Int16Array;
  scalars: ResumeScalars;
};

function emptyScalars(): ResumeScalars {
  const o = {} as Record<ResumeScalarKey, number>;
  for (const k of RESUME_SCALAR_KEYS) o[k] = 0;
  return {
    ...o,
    at: 0,
    au: 0,
    av: 0,
    aw: 0,
    ax: 0,
    ay: 0,
    az: 0,
    aA: 0,
    aB: 0,
    longA: 0n,
    an: 0,
    ao: 0,
    ap: 0,
    aq: 0,
    ar: 0,
    as: 0,
    slotG: 0,
    slotH: 0,
  };
}

/** g.c() post-1.bin init on scalar state (a.java / g.java ~743–766) */
export function applyGInitResume(rt: ResumeRuntime): void {
  const s = rt.scalars;
  s.u = 170;
  s.v = 2;
  s.w = 0;
  s.as = 128;
  s.b = 128;
  s.d = 128;
  s.c = 128;
  s.e = 0;
  s.f = 0;
  s.g = 0;
  s.h = 0;
  s.D = 128;
  s.E = 2;
  s.ak = 1;
  s.G = 0;
  s.x = 0;
  s.y = 0;
  s.B = 0;
  s.C = 0;
  s.ar = 0;
  s.a = 0;
  s.l = 0;
  s.t = 0;
  rt.x37[0] = 1;
}

export function createResumeFromWorld(world: GameWorld): ResumeRuntime {
  const z39 = new Int16Array(RESUME_Z_LEN);
  const A39 = new Int16Array(RESUME_Z_LEN);
  return {
    B54: new Int16Array(world.B54),
    gVerb54: new Int8Array(world.gVerb54),
    shortB2478: new Int16Array(world.shortB2478),
    d268: new Int16Array(world.d268),
    t16: new Int16Array(world.t16),
    u16: new Int16Array(world.u16),
    v37: new Int16Array(world.v37),
    w37: new Int16Array(world.w37),
    x37: new Int16Array(world.x37),
    y37: new Int16Array(world.y37),
    z39,
    A39,
    scalars: emptyScalars(),
  };
}

export function syncWorldToResume(world: GameWorld, rt: ResumeRuntime): void {
  rt.B54.set(world.B54);
  rt.gVerb54.set(world.gVerb54);
  rt.shortB2478.set(world.shortB2478);
  rt.d268.set(world.d268);
  rt.t16.set(world.t16);
  rt.u16.set(world.u16);
  rt.v37.set(world.v37);
  rt.w37.set(world.w37);
  rt.x37.set(world.x37);
  rt.y37.set(world.y37);
}

export function mergeResumeToWorld(world: GameWorld, rt: ResumeRuntime): void {
  world.B54.set(rt.B54);
  world.gVerb54.set(rt.gVerb54);
  world.shortB2478.set(rt.shortB2478);
  world.d268.set(rt.d268);
  world.t16.set(rt.t16);
  world.u16.set(rt.u16);
  world.v37.set(rt.v37);
  world.w37.set(rt.w37);
  world.x37.set(rt.x37);
  world.y37.set(rt.y37);
}

export function bootstrapResume(world: GameWorld): ResumeRuntime {
  const rt = createResumeFromWorld(world);
  applyGInitResume(rt);
  mergeResumeToWorld(world, rt);
  return rt;
}

class GrowBuf {
  u8: Uint8Array;
  i = 0;
  constructor(cap = 6144) {
    this.u8 = new Uint8Array(cap);
  }
  ensure(n: number): void {
    if (this.i + n <= this.u8.length) return;
    const next = new Uint8Array(Math.max(this.u8.length * 2, this.i + n));
    next.set(this.u8);
    this.u8 = next;
  }
  wU8(v: number): void {
    this.ensure(1);
    this.u8[this.i++] = v & 0xff;
  }
  wI16BE(v: number): void {
    this.ensure(2);
    new DataView(this.u8.buffer).setInt16(this.i, v, false);
    this.i += 2;
  }
  wI64BE(l: bigint): void {
    this.ensure(8);
    new DataView(this.u8.buffer).setBigInt64(this.i, l, false);
    this.i += 8;
  }
  slice(): Uint8Array {
    return this.u8.subarray(0, this.i);
  }
}

function readU8(buf: Uint8Array, pos: { i: number }): number {
  return buf[pos.i++] & 0xff;
}

function readI16BE(buf: Uint8Array, pos: { i: number }): number {
  const hi = buf[pos.i++] & 0xff;
  const lo = buf[pos.i++] & 0xff;
  const v = (hi << 8) | lo;
  return (v << 16) >> 16;
}

function readI64BE(buf: Uint8Array, pos: { i: number }): bigint {
  const v = new DataView(buf.buffer, buf.byteOffset + pos.i, 8).getBigInt64(
    0,
    false,
  );
  pos.i += 8;
  return v;
}

export function encodeResumeRecord(rt: ResumeRuntime): Uint8Array {
  const b = new GrowBuf();
  for (let n = 0; n < LEN.pairGB; n++) b.wU8(rt.B54[n] & 0xff);
  for (let n = 0; n < LEN.pairGB; n++) b.wU8(rt.gVerb54[n] & 0xff);

  const s = rt.scalars;
  b.wU8(s.av);
  b.wU8(s.aw);
  b.wU8(s.ax);
  b.wU8(s.ay);
  b.wU8(s.az);
  b.wU8(s.aA);
  b.wU8(s.aB);
  b.wU8(s.au);
  b.wU8(s.at);

  for (let n = 0; n < LEN.shortB2478; n++) b.wI16BE(rt.shortB2478[n]);
  for (let n = 0; n < LEN.dShort268; n++)
    b.wU8(encodeShortForResumeStream(rt.d268[n]));
  for (let n = 0; n < LEN.vec16; n++) {
    b.wU8(rt.t16[n] & 0xff);
    b.wU8(rt.u16[n] & 0xff);
  }
  for (let n = 0; n < LEN.vec37; n++) {
    b.wU8(rt.v37[n] & 0xff);
    b.wU8(rt.x37[n] & 0xff);
    b.wU8(rt.w37[n] & 0xff);
    b.wU8(rt.y37[n] & 0xff);
  }
  for (let n = 0; n < RESUME_Z_LEN; n++) {
    b.wI16BE(rt.z39[n]);
    b.wU8(rt.A39[n] & 0xff);
  }

  for (const k of RESUME_SCALAR_KEYS) b.wU8(s[k]);
  b.wI64BE(s.longA);
  b.wU8(s.an);
  b.wU8(s.ao);
  b.wU8(s.ap);
  b.wU8(s.aq);
  b.wU8(s.ar);
  b.wU8(s.as);
  b.wU8(s.slotG);
  b.wU8(s.slotH);

  return b.slice();
}

export function decodeResumeRecord(buf: Uint8Array): ResumeRuntime {
  const pos = { i: 0 };
  const B54 = new Int16Array(LEN.pairGB);
  const gVerb54 = new Int8Array(LEN.pairGB);
  for (let n = 0; n < LEN.pairGB; n++) B54[n] = readU8(buf, pos);
  for (let n = 0; n < LEN.pairGB; n++)
    gVerb54[n] = readU8(buf, pos) << 24 >> 24;

  const scalars = emptyScalars();
  scalars.av = readU8(buf, pos);
  scalars.aw = readU8(buf, pos);
  scalars.ax = readU8(buf, pos);
  scalars.ay = readU8(buf, pos);
  scalars.az = readU8(buf, pos);
  scalars.aA = readU8(buf, pos);
  scalars.aB = readU8(buf, pos);
  scalars.au = readU8(buf, pos);
  scalars.at = readU8(buf, pos);

  const shortB2478 = new Int16Array(LEN.shortB2478);
  for (let n = 0; n < LEN.shortB2478; n++)
    shortB2478[n] = readI16BE(buf, pos);
  const d268 = new Int16Array(LEN.dShort268);
  for (let n = 0; n < LEN.dShort268; n++)
    d268[n] = decodeShortFromResumeStreamByte(readU8(buf, pos));

  const t16 = new Int16Array(LEN.vec16);
  const u16 = new Int16Array(LEN.vec16);
  for (let n = 0; n < LEN.vec16; n++) {
    t16[n] = readU8(buf, pos);
    u16[n] = readU8(buf, pos);
  }
  const v37 = new Int16Array(LEN.vec37);
  const x37 = new Int16Array(LEN.vec37);
  const w37 = new Int16Array(LEN.vec37);
  const y37 = new Int16Array(LEN.vec37);
  for (let n = 0; n < LEN.vec37; n++) {
    v37[n] = readU8(buf, pos);
    x37[n] = readU8(buf, pos);
    w37[n] = readU8(buf, pos);
    y37[n] = readU8(buf, pos);
  }
  const z39 = new Int16Array(RESUME_Z_LEN);
  const A39 = new Int16Array(RESUME_Z_LEN);
  for (let n = 0; n < RESUME_Z_LEN; n++) {
    z39[n] = readI16BE(buf, pos);
    A39[n] = readU8(buf, pos);
  }

  for (const k of RESUME_SCALAR_KEYS) scalars[k] = readU8(buf, pos);
  scalars.longA = readI64BE(buf, pos);
  scalars.an = readU8(buf, pos);
  scalars.ao = readU8(buf, pos);
  scalars.ap = readU8(buf, pos);
  scalars.aq = readU8(buf, pos);
  scalars.ar = readU8(buf, pos);
  scalars.as = readU8(buf, pos);
  scalars.slotG = readU8(buf, pos);
  scalars.slotH = readU8(buf, pos);

  if (pos.i !== buf.length) {
    throw new Error(
      `resume record: decoded ${pos.i} bytes, buffer is ${buf.length}`,
    );
  }

  return {
    B54,
    gVerb54,
    shortB2478,
    d268,
    t16,
    u16,
    v37,
    w37,
    x37,
    y37,
    z39,
    A39,
    scalars,
  };
}

export function assertResumeRecordRoundTrip(rt: ResumeRuntime): void {
  const enc = encodeResumeRecord(rt);
  const dec = decodeResumeRecord(enc);
  const enc2 = encodeResumeRecord(dec);
  if (enc.length !== enc2.length) {
    throw new Error("resume round-trip length mismatch");
  }
  for (let i = 0; i < enc.length; i++) {
    if (enc[i] !== enc2[i]) throw new Error(`resume mismatch at ${i}`);
  }
}
