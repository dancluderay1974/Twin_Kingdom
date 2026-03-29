import type { GameWorld } from "./world";
import {
  bootstrapResume,
  createResumeFromWorld,
  decodeResumeRecord,
  encodeResumeRecord,
  mergeResumeToWorld,
  syncWorldToResume,
  type ResumeRuntime,
} from "../jme/resumeRecord";

const KEY = "tkv_resume";
const SETTINGS_KEY = "tkv_settings";

export type SavePayloadV1 = {
  v: 1;
  roomIndex: number;
  score: number;
  playerStat: number;
  logSnapshot: string[];
};

export type SavePayloadV2 = {
  v: 2;
  roomIndex: number;
  score: number;
  playerStat: number;
  logSnapshot: string[];
  /** Raw tkv_resume record bytes (g.java DataOutputStream order) */
  resume: string;
};

export type LoadedSave =
  | { version: 1; payload: SavePayloadV1 }
  | { version: 2; payload: SavePayloadV2 };

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export function loadSave(): LoadedSave | null {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const o = JSON.parse(s) as SavePayloadV1 | SavePayloadV2;
    if (o.v === 1) return { version: 1, payload: o };
    if (o.v === 2 && typeof o.resume === "string") {
      return { version: 2, payload: o };
    }
    return null;
  } catch {
    return null;
  }
}

export function writeSaveV1(payload: SavePayloadV1): void {
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function writeSaveV2(payload: SavePayloadV2): void {
  localStorage.setItem(KEY, JSON.stringify(payload));
}

/** @deprecated use writeSaveV1 / writeSaveV2 */
export function writeSave(payload: SavePayloadV1): void {
  writeSaveV1(payload);
}

export function clearSave(): void {
  localStorage.removeItem(KEY);
}

export function readSettingsByte(): number {
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    if (!s) return 0;
    return JSON.parse(s).b ?? 0;
  } catch {
    return 0;
  }
}

export function writeSettingsByte(b: number): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ b }));
}

export function encodeResumeToBase64(rt: ResumeRuntime): string {
  return bytesToBase64(encodeResumeRecord(rt));
}

export function decodeResumeFromBase64(b64: string): ResumeRuntime {
  return decodeResumeRecord(base64ToBytes(b64));
}

export function buildSaveV2(
  world: GameWorld,
  resume: ResumeRuntime,
  meta: {
    roomIndex: number;
    score: number;
    playerStat: number;
    logSnapshot: string[];
  },
): SavePayloadV2 {
  syncWorldToResume(world, resume);
  return {
    v: 2,
    roomIndex: meta.roomIndex,
    score: meta.score,
    playerStat: meta.playerStat,
    logSnapshot: meta.logSnapshot,
    resume: encodeResumeToBase64(resume),
  };
}

export function applyResumeToWorld(world: GameWorld, b64: string): ResumeRuntime {
  const rt = decodeResumeFromBase64(b64);
  mergeResumeToWorld(world, rt);
  return rt;
}

export function newResumeFromFreshWorld(world: GameWorld): ResumeRuntime {
  return bootstrapResume(world);
}

export { createResumeFromWorld, syncWorldToResume };
