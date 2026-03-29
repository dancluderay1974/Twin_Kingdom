/**
 * Placeholder for emulator-captured command → log golden checks.
 * Extend `SMOKE_COMMANDS` (or add JSON fixtures) when you have MicroEmu traces.
 */

import { describe, expect, it } from "vitest";
import { classifyVerb } from "../jme/eDispatch";

const SMOKE_COMMANDS = ["north", "n", "look", "score", "help", "?"] as const;

describe("golden transcript (smoke)", () => {
  it("classifies a minimal walkthrough token list", () => {
    for (const cmd of SMOKE_COMMANDS) {
      const b = classifyVerb(cmd);
      expect(b.kind === "unknown").toBe(false);
    }
  });
});
