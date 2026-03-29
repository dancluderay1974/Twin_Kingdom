import { describe, expect, it } from "vitest";
import { decodeF, emptyFFields } from "./fDecode";

describe("fDecode vs f.class control words", () => {
  it("decodeF(0, *) yields cmd 6 idle path (javap cross-check)", () => {
    const o = emptyFFields();
    decodeF(0, 0, o);
    expect(o.cmd).toBe(6);
    expect(o.h).toBe(1);
  });

  it("decodeF(16, 0) selects cmd 7 branch (n === 16)", () => {
    const o = emptyFFields();
    decodeF(16, 0, o);
    expect(o.cmd).toBe(7);
    expect(o.h).toBe(1);
  });

  it("decodeF(1, 0) uses n&3===1 vector branch (cmd 0 family)", () => {
    const o = emptyFFields();
    decodeF(1, 0, o);
    expect(o.cmd).toBe(0);
    expect(o.h).toBe(2);
  });
});
