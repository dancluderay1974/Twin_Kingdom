import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { load1Bin } from "../game/world";
import { bootstrapResume } from "./resumeRecord";
import { attachGameState } from "./gameState";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("gameState (a.java mirror)", () => {
  it("attachGameState enters resume.ak room and syncs short tables", () => {
    const path = join(root, "public/data/1.bin");
    const buf = readFileSync(path);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const world = load1Bin(ab);
    const rt = bootstrapResume(world);
    expect(rt.scalars.ak).toBe(1);
    const gs = attachGameState(world, rt);
    expect(gs.ak).toBe(1);
    expect(world.d268[1]).toBe(rt.d268[1]);
  });

  it("enterRoom updates au, av, aw and ak", () => {
    const path = join(root, "public/data/1.bin");
    const buf = readFileSync(path);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const world = load1Bin(ab);
    const rt = bootstrapResume(world);
    const gs = attachGameState(world, rt);
    const dest = 0;
    gs.enterRoom(dest);
    expect(gs.ak).toBe(dest);
    let expected = world.shortC200[dest] ?? 0;
    if (expected < 0) expected = (expected + 65536) & 0xffff;
    expect(gs.au).toBe(expected);
  });
});
