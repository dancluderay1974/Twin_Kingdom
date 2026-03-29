import { describe, expect, it } from "vitest";
import { classifyVerb, K_AE_TO_METHOD } from "./eDispatch";

describe("eDispatch", () => {
  it("classifies movement and meta verbs", () => {
    expect(classifyVerb("N")).toEqual({ kind: "move", canon: "n" });
    expect(classifyVerb("north")).toEqual({ kind: "move", canon: "n" });
    expect(classifyVerb("look")).toEqual({ kind: "meta", id: "look" });
    expect(classifyVerb("x")).toEqual({ kind: "meta", id: "look" });
    expect(classifyVerb("?")).toEqual({ kind: "meta", id: "help" });
    expect(classifyVerb("get")).toEqual({ kind: "unknown" });
  });

  it("K_AE_TO_METHOD covers ae 17..46", () => {
    for (let ae = 17; ae <= 46; ae++) {
      expect(K_AE_TO_METHOD[ae]).toBeTruthy();
    }
    expect(Object.keys(K_AE_TO_METHOD).length).toBe(30);
  });
});
