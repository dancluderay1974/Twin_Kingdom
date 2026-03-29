import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { load1Bin } from "./world";
import {
  findExitForCompass,
  findExitForDirectionMask,
  JAVA_J_DIRECTION_MASKS,
  listSimpleExits,
  roomDescriptionText,
  verbToDirectionMask,
} from "./navigation";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function loadWorld() {
  const path = join(root, "public/data/1.bin");
  const buf = readFileSync(path);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return load1Bin(ab);
}

describe("navigation / e.j exit model", () => {
  it("maps verbs to Java a.j masks", () => {
    expect(verbToDirectionMask("n")).toBe(32);
    expect(verbToDirectionMask("ne")).toBe(16);
    expect(verbToDirectionMask("w")).toBe(40);
    expect(verbToDirectionMask("nw")).toBe(36);
    expect(verbToDirectionMask("up")).toBe(24);
    expect(verbToDirectionMask("down")).toBe(20);
  });

  it("JAVA_J matches decompiled a.j length 14", () => {
    expect(JAVA_J_DIRECTION_MASKS.length).toBe(14);
    expect(JAVA_J_DIRECTION_MASKS[0]).toBe(32);
    expect(JAVA_J_DIRECTION_MASKS[5]).toBe(1);
  });

  it("room 0 NE exit agrees with bitmask search", () => {
    const world = loadWorld();
    const neMask = JAVA_J_DIRECTION_MASKS[1]!;
    const byMask = findExitForDirectionMask(world, 0, neMask);
    const byCompass = findExitForCompass(world, 0, 1);
    expect(byMask).not.toBeNull();
    expect(byCompass).not.toBeNull();
    expect(byMask!.destRoom).toBe(byCompass!.destRoom);
  });

  it("listSimpleExits skips ay&0x80 portal-style rows", () => {
    const world = loadWorld();
    const simple = listSimpleExits(world, 0);
    for (const ex of simple) {
      expect((ex.ay & 0x80) === 0).toBe(true);
    }
  });

  it("roomDescriptionText joins all header lines (e.ak-style)", () => {
    const world = loadWorld();
    const cabin = roomDescriptionText(world, 0).toLowerCase();
    expect(cabin).toContain("inside");
    expect(cabin).toContain("cabin");
    const road = roomDescriptionText(world, 1).toLowerCase();
    expect(road).toContain("road");
  });
});
