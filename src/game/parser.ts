export type ParsedCommand = {
  raw: string;
  verb: string;
  rest: string;
  tokens: string[];
};

/** Normalize J2ME-style input (trim, collapse spaces, uppercase verb) */
export function parseCommandLine(input: string): ParsedCommand {
  const raw = input.trim();
  const tokens = raw
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const verb = tokens[0] ?? "";
  const rest = tokens.slice(1).join(" ");
  return { raw, verb, rest, tokens };
}

/** Direction synonyms matching the original command set */
export const DIRECTIONS: Record<string, string> = {
  n: "n",
  north: "n",
  s: "s",
  south: "s",
  e: "e",
  east: "e",
  w: "w",
  west: "w",
  ne: "ne",
  nw: "nw",
  se: "se",
  sw: "sw",
  up: "up",
  down: "down",
  u: "up",
  d: "down",
};
