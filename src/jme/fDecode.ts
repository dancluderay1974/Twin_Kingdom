/**
 * Opcode interpretation from f.b (Twin Kingdom Valley f.class).
 * `cmd` drives e.M(int) switch; `pen` is ((n & 0x70) >> 4) + 1 from inner f.a.
 */

export type FFields = {
  h: number;
  /** Switch key in picture interpreter (Java static byte a on f) */
  cmd: number;
  rel: boolean;
  fb: number;
  fc: number;
  fd: number;
  fe: number;
  ff: number;
  fg: number;
  fi: number;
  pen: number;
};

export function emptyFFields(): FFields {
  return {
    h: 1,
    cmd: 0,
    rel: false,
    fb: 0,
    fc: 0,
    fd: 0,
    fe: 0,
    ff: 0,
    fg: 0,
    fi: 0,
    pen: 0,
  };
}

function innerA(n: number, n2: number, o: FFields): void {
  o.pen = (((n & 0x70) >> 4) + 1) & 0xff;
  let n3 = (n & 8) !== 0 ? -16 : 0;
  const n4 = (n2 & 0xf) | n3;
  n3 = (n & 0x80) !== 0 ? -16 : 0;
  const n5 = ((n2 & 0xf0) >> 4) | n3;
  o.fc = -n4;
  o.fb = n5;
  o.rel = (n & 4) !== 0;
}

export function decodeF(n: number, n2: number, o: FFields): void {
  const z = emptyFFields();
  Object.assign(o, z);
  if (n === 0) {
    o.cmd = 6;
    o.h = 1;
    return;
  }
  const n3 = n & 3;
  switch (n3) {
    case 1: {
      o.cmd = 0;
      innerA(n, n2, o);
      let pen = o.pen;
      if (pen !== 1) {
        if (pen === 2) {
          pen = pen + 7;
          o.cmd = 1;
        } else {
          pen = pen + 6;
          o.cmd = 2;
        }
      }
      o.pen = pen & 0xff;
      o.h = 2;
      break;
    }
    case 2: {
      o.cmd = 1;
      innerA(n, n2, o);
      o.h = 2;
      break;
    }
    case 3: {
      o.cmd = 2;
      innerA(n, n2, o);
      o.h = 2;
      break;
    }
    default: {
      if ((n & 4) !== 0) {
        o.pen = (((n & 0x70) >> 4) + 1) & 0xff;
        let n4 = n & 0x80;
        let n5 = n & 8;
        n4 |= n5 << 3;
        let n6 = n2 & 0xf0;
        n6 >>= 4;
        o.fd = n6 & 0xf;
        o.ff = (n2 & 3) + 1;
        o.fe = (n2 & 0xc) >> 2;
        o.cmd = 3;
        o.fg = (n4 >> 6) & 3;
        o.h = 2;
        break;
      }
      if ((n & 8) !== 0) {
        o.cmd = 8;
        const n7 = n & 0xf0;
        o.fd = (n7 >> 4) & 0xf;
        o.h = 1;
        break;
      }
      if ((n & 0x80) !== 0) {
        o.cmd = 9;
        o.fg = (n & 0x70) >> 4;
        o.fd = n2;
        o.h = 2;
        break;
      }
      if (n === 16) {
        o.cmd = 7;
        o.h = 1;
        break;
      }
      o.cmd = 4;
      o.fi = (n & 0x70) >> 4;
      o.h = 1;
    }
  }
}
