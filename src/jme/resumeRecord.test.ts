import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { load1Bin } from "../game/world";
import { bootstrapResume, decodeResumeRecord, encodeResumeRecord } from "./resumeRecord";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("resumeRecord (tkv_resume)", () => {
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

  it("applyGInitResume sets ak to 1", () => {
    const path = join(root, "public/data/1.bin");
    const buf = readFileSync(path);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const world = load1Bin(ab);
    const rt = bootstrapResume(world);
    expect(rt.scalars.ak).toBe(1);
  });
});
