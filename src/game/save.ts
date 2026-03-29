import type { GameWorld } from "./world";

const KEY = "tkv_resume";
const SETTINGS_KEY = "tkv_settings";

export type SavePayloadV1 = {
  v: 1;
  roomIndex: number;
  score: number;
  playerStat: number;
  logSnapshot: string[];
};

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

export function loadSave(): SavePayloadV1 | null {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return null;
    const o = JSON.parse(s) as SavePayloadV1;
    if (o.v !== 1) return null;
    return o;
  } catch {
    return null;
  }
}

export function writeSave(payload: SavePayloadV1): void {
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function clearSave(): void {
  localStorage.removeItem(KEY);
}

/** Settings nibble persisted like MIDP `tkv_settings` record 1 (short) */
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

/** Full binary snapshot hook — extend when runtime mirrors full `a.*` arrays */
export function snapshotFromWorld(_world: GameWorld): ArrayBuffer {
  void _world;
  return new ArrayBuffer(0);
}
