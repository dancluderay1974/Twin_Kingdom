import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { decodeD } from "./strings";
import { assert1BinFullyConsumed, load1Bin } from "./world";
import { findExitForCompass, listSimpleExits } from "./navigation";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("1.bin loader", () => {
  it("consumes the entire file", () => {
    const path = join(root, "public/data/1.bin");
    const buf = readFileSync(path);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const world = load1Bin(ab);
    assert1BinFullyConsumed(world, buf.length);
  });

  it("decodeD(0) returns text", () => {
    const path = join(root, "public/data/1.bin");
    const buf = readFileSync(path);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const world = load1Bin(ab);
    const s = decodeD(world, 0);
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("navigation", () => {
  it("room 0 has a NE exit to room 1", () => {
    const path = join(root, "public/data/1.bin");
    const buf = readFileSync(path);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const world = load1Bin(ab);
    const exits = listSimpleExits(world, 0);
    expect(exits.length).toBeGreaterThan(0);
    const ne = findExitForCompass(world, 0, 1);
    expect(ne).not.toBeNull();
    expect(ne!.destRoom).toBe(1);
    expect(findExitForCompass(world, 0, 0)).toBeNull();
  });
});

