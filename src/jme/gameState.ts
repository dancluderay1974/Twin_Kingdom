/**
 * Mutable runtime fields mirroring obfuscated class `a` (a.java).
 * Gameplay mutates `ResumeRuntime` arrays + scalars; `mergeResumeToWorld` keeps
 * `GameWorld` in sync for loaders, strings, and picture opcodes.
 */

import type { GameWorld } from "../game/world";
import {
  mergeResumeToWorld,
  type ResumeRuntime,
} from "./resumeRecord";

export class GameState {
  constructor(
    readonly world: GameWorld,
    public runtime: ResumeRuntime,
  ) {}

  /** Current room id (Java `a.ak`) */
  get ak(): number {
    return this.runtime.scalars.ak | 0;
  }

  set ak(v: number) {
    this.runtime.scalars.ak = v | 0;
  }

  get au(): number {
    return this.runtime.scalars.au | 0;
  }

  get av(): number {
    return this.runtime.scalars.av | 0;
  }

  get aw(): number {
    return this.runtime.scalars.aw | 0;
  }

  get ax(): number {
    return this.runtime.scalars.ax | 0;
  }

  set ax(v: number) {
    this.runtime.scalars.ax = v | 0;
  }

  /** Java `a.a(int n)` — load room header into au, av, aw */
  enterRoom(roomId: number): void {
    const s = this.runtime.scalars;
    const c = this.world.shortC200;
    const b = this.runtime.shortB2478;
    this.ak = roomId | 0;
    if (roomId < 0 || roomId >= c.length) return;
    let au = c[roomId] | 0;
    if (au < 0) au = (au + 65536) & 0xffff;
    s.au = au;
    if (au < 0 || au >= b.length - 1) return;
    s.av = b[au] | 0;
    s.aw = b[au + 1] | 0;
    mergeResumeToWorld(this.world, this.runtime);
  }

  /**
   * Java `a.b()` — refresh header from ak, then first exit-pack step.
   */
  roomHeaderStepB(): void {
    this.enterRoom(this.ak);
    const s = this.runtime.scalars;
    let aw = s.aw;
    aw = ((aw & 0xffff) << 16) >> 16;
    s.ai = aw;
    s.ax = (aw & 0x1f) + 2;
    s.aw = aw >> 5;
    mergeResumeToWorld(this.world, this.runtime);
  }

  /** Java `a.c()` — advance exit window without re-fetching room base */
  roomHeaderStepC(): void {
    const s = this.runtime.scalars;
    let aw = s.aw;
    aw = ((aw & 0xffff) << 16) >> 16;
    s.ax = (aw & 0x1f) + 2;
    s.aw = aw >> 5;
    mergeResumeToWorld(this.world, this.runtime);
  }

  /** Java `a.a()` — read (ay, az) pair at ax and advance ax */
  readExitPair(): { ay: number; az: number } | null {
    const s = this.runtime.scalars;
    const b = this.runtime.shortB2478;
    const au = s.au | 0;
    let ax = s.ax | 0;
    if (au + ax + 1 >= b.length) return null;
    const ay = b[au + ax] | 0;
    const az = b[au + ax + 1] | 0;
    s.ax = ax + 2;
    mergeResumeToWorld(this.world, this.runtime);
    return { ay, az };
  }

  pushToWorld(): void {
    mergeResumeToWorld(this.world, this.runtime);
  }
}

export function attachGameState(
  world: GameWorld,
  runtime: ResumeRuntime,
): GameState {
  const gs = new GameState(world, runtime);
  gs.enterRoom(gs.ak);
  return gs;
}
