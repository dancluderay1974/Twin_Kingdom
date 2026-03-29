/**
 * Staged port of `e` command routing: token classification and `e.k(int ae)` map.
 * Full `k` callees are not all implemented; movement uses `navigation` + `GameState`.
 */

import { DIRECTIONS } from "../game/parser";

export type VerbBucket =
  | { kind: "move"; canon: string }
  | { kind: "meta"; id: "look" | "score" | "help" | "inventory" | "quit" }
  | { kind: "unknown" };

/** Map first token to movement / UI meta / unknown (object verbs → unknown until k() is ported). */
export function classifyVerb(verb: string): VerbBucket {
  const v = verb.toLowerCase();
  const dir = DIRECTIONS[v];
  if (dir) return { kind: "move", canon: dir };
  switch (v) {
    case "look":
    case "l":
    case "examine":
    case "x":
      return { kind: "meta", id: "look" };
    case "score":
      return { kind: "meta", id: "score" };
    case "help":
    case "?":
      return { kind: "meta", id: "help" };
    case "inventory":
    case "i":
      return { kind: "meta", id: "inventory" };
    case "quit":
    case "exit":
      return { kind: "meta", id: "quit" };
    default:
      return { kind: "unknown" };
  }
}

/**
 * Java `e.k(int n)` switch (n - 17) method names — ae runs 17..46 inclusive.
 * Use for tests and incremental porting.
 */
export const K_AE_TO_METHOD: Record<number, string> = {
  17: "D",
  18: "C",
  19: "C",
  20: "M",
  21: "M",
  22: "M",
  23: "L",
  24: "L",
  25: "J",
  26: "J",
  27: "K",
  28: "ae",
  29: "Y",
  30: "T",
  31: "T",
  32: "af",
  33: "ag",
  34: "A",
  35: "P",
  36: "S",
  37: "V",
  38: "V",
  39: "ay",
  40: "ay",
  41: "O",
  42: "O",
  43: "x",
  44: "G",
  45: "N",
  46: "z",
};
