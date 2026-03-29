/**
 * Room exits from 1.bin shortB2478 / shortC200 (see a.a / e.j / a.j masks).
 * Matches e.j(): (ay & 0x3F) vs a.ah, with ay&0x80 stream skip; second pass uses
 * (aB | ah) == aB where aB = ay & 0x3F.
 */

import type { GameWorld } from "./world";
import { decodeB } from "./strings";

export type ParsedExit = {
  /** Raw ay word from room stream */
  ay: number;
  /** Destination room id (simple exits only) */
  destRoom: number;
  /** Which compass slots 0–5 this exit advertises (N…SW bit scan) */
  compassSlots: number[];
};

/** Java `a.j` — direction bitmask per verb slot 0..13 (decompiled a.java static {}) */
export const JAVA_J_DIRECTION_MASKS: readonly number[] = [
  32, 16, 8, 4, 2, 1, 40, 36, 40, 36, 24, 20, 24, 20,
];

/** Map movement verbs to the same masks the J2ME parser ORs into `a.ah` */
export function verbToDirectionMask(verb: string): number | undefined {
  const v = verb.toLowerCase();
  const m: Record<string, number> = {
    n: 32,
    north: 32,
    ne: 16,
    e: 8,
    east: 8,
    se: 4,
    s: 2,
    south: 2,
    sw: 1,
    w: 40,
    west: 40,
    nw: 36,
    northw: 36,
    up: 24,
    u: 24,
    down: 20,
    d: 20,
  };
  return m[v];
}

/** @deprecated prefer verbToDirectionMask — kept for tests */
export const VERB_TO_COMPASS: Record<string, number | undefined> = {
  n: 0,
  north: 0,
  ne: 1,
  e: 2,
  east: 2,
  se: 3,
  s: 4,
  south: 4,
  sw: 5,
  w: 6,
  west: 6,
  nw: 7,
  northw: 7,
  up: 8,
  down: 9,
};

function ayToCompassSlots(ayRaw: number): number[] {
  let ay = ayRaw;
  if (ay < 0) ay += 65536;
  ay &= 0xffff;
  const out: number[] = [];
  let ab = (ay << 2) & 0xff;
  for (let n2 = 0; n2 < 6; n2++) {
    const hi = (ab & 0x80) === 0x80;
    ab = (ab << 1) & 0xff;
    if (hi) out.push(n2);
  }
  return out;
}

type ExitHeader = {
  au: number;
  /** Signed room header word at b[au+1] (Java `ai` after a.b()) */
  ai: number;
  axStart: number;
  groupCount: number;
};

function readExitHeader(world: GameWorld, roomId: number): ExitHeader | null {
  const b = world.shortB2478;
  const au = roomAu(world, roomId);
  if (au == null || au + 1 >= b.length) return null;
  const ai = (b[au + 1] << 16) >> 16;
  const lineCount = ai & 0x1f;
  const axStart = lineCount + 2;
  const groupCount = ai >> 5;
  return { au, ai, axStart, groupCount };
}

/**
 * Scan exit pairs like e.j() first loop: exact (ay&0x3F)==(ah&0x3F), skip extra cell if ay&0x80.
 */
function scanExitPass(
  b: Int16Array,
  au: number,
  axStart: number,
  groupCount: number,
  ah: number,
  secondPass: boolean,
): { destRoom: number; ay: number; az: number } | null {
  let ax = axStart;
  let aw = groupCount;
  const ah6 = ah & 0x3f;
  while (aw > 0) {
    aw--;
    if (au + ax + 1 >= b.length) break;
    const ay = b[au + ax] | 0;
    const az = b[au + ax + 1] | 0;
    ax += 2;
    const ayLow = ay & 0x3f;
    let match = false;
    if (!secondPass) {
      match = ayLow === ah6;
    } else {
      match = ((ayLow | ah6) | 0) === (ayLow | 0);
    }
    if (match) {
      return { destRoom: az | 0, ay, az };
    }
    if ((ay & 0x80) !== 0) {
      ax += 1;
    }
  }
  return null;
}

export type DirectionExit = {
  destRoom: number;
  ay: number;
  az: number;
};

/**
 * Find a legal move for bitmask `ah` (Java `a.ah`), mirroring e.j() exit scan.
 */
export function findExitForDirectionMask(
  world: GameWorld,
  roomId: number,
  ah: number,
): DirectionExit | null {
  const h = readExitHeader(world, roomId);
  if (!h || h.groupCount < 1) return null;
  const { au, ai, axStart, groupCount } = h;
  const b = world.shortB2478;
  const c = world.shortC200;

  let hit = scanExitPass(b, au, axStart, groupCount, ah, false);
  if (!hit) {
    const lineCount = ai & 0x1f;
    const axSecond = lineCount + 2;
    const gcSecond = ai >> 5;
    hit = scanExitPass(b, au, axSecond, gcSecond, ah, true);
  }
  if (!hit) return null;
  if (hit.destRoom < 0 || hit.destRoom >= c.length) return null;
  return hit;
}

/**
 * List simple exits (ay without high bit — portals / specials skipped for transcript hints).
 */
export function listSimpleExits(world: GameWorld, roomId: number): ParsedExit[] {
  const h = readExitHeader(world, roomId);
  if (!h || h.groupCount < 1) return [];
  const b = world.shortB2478;
  const c = world.shortC200;
  const { au, axStart, groupCount } = h;

  let ax = axStart;
  let aw = groupCount;
  const out: ParsedExit[] = [];
  while (aw > 0) {
    aw--;
    if (au + ax + 1 >= b.length) break;
    const ay = b[au + ax] | 0;
    const az = b[au + ax + 1] | 0;
    ax += 2;

    if ((ay & 0x80) !== 0) {
      ax += 1;
      continue;
    }

    const dest = az | 0;
    if (dest >= 0 && dest < c.length) {
      out.push({
        ay: ay | 0,
        destRoom: dest,
        compassSlots: ayToCompassSlots(ay),
      });
    }
  }
  return out;
}

/**
 * Pick an exit for compass slot 0–5 (N … SW) using bitmask match.
 */
export function findExitForCompass(
  world: GameWorld,
  roomId: number,
  compassSlot: number,
): ParsedExit | null {
  if (compassSlot < 0 || compassSlot > 5) return null;
  const mask = JAVA_J_DIRECTION_MASKS[compassSlot];
  if (mask === undefined) return null;
  const hit = findExitForDirectionMask(world, roomId, mask);
  if (!hit) return null;
  return {
    ay: hit.ay,
    destRoom: hit.destRoom,
    compassSlots: ayToCompassSlots(hit.ay),
  };
}

/** Java `c[roomId]` as unsigned index into `b` (matches `gameState.enterRoom`). */
function roomAu(world: GameWorld, roomId: number): number | null {
  const c = world.shortC200;
  if (roomId < 0 || roomId >= c.length) return null;
  let au = c[roomId] | 0;
  if (au < 0) au = (au + 65536) & 0xffff;
  if (au + 2 >= world.shortB2478.length) return null;
  return au;
}

/**
 * Full room prose: `e.ak()` prints `lineCount` strings from `b[au+2..]` via `e.b` (decodeB).
 * Previously we only decoded the first id, so the player saw one token ("ON") instead of a sentence.
 */
export function roomDescriptionText(world: GameWorld, roomId: number): string {
  const b = world.shortB2478;
  const au = roomAu(world, roomId);
  if (au == null) return "";
  const w1 = (b[au + 1] << 16) >> 16;
  const lineCount = w1 & 0x1f;
  if (lineCount <= 0) return "";
  const parts: string[] = [];
  for (let i = 0; i < lineCount; i++) {
    const idx = au + 2 + i;
    if (idx >= b.length) break;
    const sid = b[idx] | 0;
    try {
      const s = decodeB(world, sid);
      if (s) parts.push(s);
    } catch {
      /* skip bad index */
    }
  }
  const raw = parts.join(" ").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** First room description string id after header, or null */
export function firstRoomDescriptionStringId(
  world: GameWorld,
  roomId: number,
): number | null {
  const b = world.shortB2478;
  const au = roomAu(world, roomId);
  if (au == null) return null;
  const ai = (b[au + 1] << 16) >> 16;
  const lineCount = ai & 0x1f;
  if (lineCount <= 0) return null;
  return b[au + 2] | 0;
}

export function exitsCompassHint(world: GameWorld, roomId: number): string {
  const labels: string[] = [];
  const order: { label: string; mask: number }[] = [
    { label: "N", mask: 32 },
    { label: "NE", mask: 16 },
    { label: "E", mask: 8 },
    { label: "SE", mask: 4 },
    { label: "S", mask: 2 },
    { label: "SW", mask: 1 },
    { label: "W", mask: 40 },
    { label: "NW", mask: 36 },
    { label: "UP", mask: 24 },
    { label: "DOWN", mask: 20 },
  ];
  const seen = new Set<string>();
  for (const { label, mask } of order) {
    if (findExitForDirectionMask(world, roomId, mask) && !seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  if (labels.length === 0) return "";
  return `From here you can go: ${labels.join(", ")}.`;
}
