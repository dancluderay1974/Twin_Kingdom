import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { decodeD } from "./strings";
import { assert1BinFullyConsumed, load1Bin } from "./world";
import { bootstrapResume, decodeResumeRecord, encodeResumeRecord } from "../jme/resumeRecord";

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

describe("resume record", () => {
  it("round-trips after bootstrap", () => {
    const path = join(root, "public/data/1.bin");
    const buf = readFileSync(path);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const world = load1Bin(ab);
    const rt = bootstrapResume(world);
    const enc = encodeResumeRecord(rt);
    const dec = decodeResumeRecord(enc);
    const enc2 = encodeResumeRecord(dec);
    expect(enc2.length).toBe(enc.length);
    for (let i = 0; i < enc.length; i++) {
      expect(enc2[i]).toBe(enc[i]);
    }
  });
});
