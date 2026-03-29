/**
 * e.M(int) picture builder — raster into int32 buffer (javax drawRGB format).
 * Palette and buffer size from e.java static initializer.
 */

import type { GameWorld } from "../game/world";
import { decodeF, emptyFFields, type FFields } from "./fDecode";

export const PIC_W = 176;
export const PIC_H = 220;
export const PIC_PIXELS = PIC_W * PIC_H;

/** e.java static { c = new int[]{ ... } } */
export const PICTURE_PALETTE: Int32Array = new Int32Array([
  0, 18432, 6_965_555, 0x00_22_8b_22, 923_772, 15_588_737, 0x00_ff_80_ff, 8_900_331,
  3_093_798, 0x00_a9_a9_a9, 0x00_5c_5c_5c, 16_766_720, 13_083_171, 12_165_855,
  15_418_685,
]);

function expandOpcodeByte(sb: number): number {
  const b = sb << 24 >> 24;
  if (b < 0) return -b + 127;
  return b & 0xff;
}

function argbFromMidp(c: number): number {
  if (c === 0) return 0;
  return 0xff00_0000 | (c & 0xff_ff_ff);
}

export class PictureInterpreter {
  r = 0;
  o = -3;
  p = -3;
  q = 0;
  private readonly pixels: Int32Array;
  private readonly f: FFields;

  constructor() {
    this.pixels = new Int32Array(PIC_PIXELS);
    this.f = emptyFFields();
  }

  clear(): void {
    this.pixels.fill(0);
    this.r = 0;
    this.q = 0;
  }

  getBuffer(): Int32Array {
    return this.pixels;
  }

  private idx(x: number, y: number): number {
    return x + y * PIC_W;
  }

  private d(n: number): number {
    return (n * 9) >> (this.o + 3);
  }

  private e(n: number): number {
    let v = n;
    if (this.o > 0) v >>= this.o;
    else if (this.o < 0) v <<= -this.o;
    return Math.trunc((v * 3) / 4);
  }

  private aD(): void {
    /* MIDP repaint — no-op on web */
  }

  private staticC(
    n: number,
    n2: number,
    n3: number,
    n4: number,
    n5: number,
    n6: number,
    n7: number,
  ): void {
    let n8 = 0;
    let n9 = -n3;
    let n10 = n;
    let n11 = n2;
    switch (n4) {
      case 0:
        n11 -= n3 >> n5;
        break;
      case 1:
        n10 += (((n3 << n6) * 3 + 6) / 16) | 0;
        break;
      case 2:
        n11 += n3 >> n5;
        break;
      case 3:
        n10 -= (((n3 << n6) * 3 + 6) / 16) | 0;
    }
    const pal = PICTURE_PALETTE[n7] ?? 0;
    const px = argbFromMidp(pal);
    if (
      n10 >= 0 &&
      n10 < PIC_W &&
      n11 >= 0 &&
      n11 < 192 &&
      this.pixels[this.idx(n10, n11)] === 0
    ) {
      this.pixels[this.idx(n10, n11)] = px;
    }
    let n12 = 0;
    while (n9 !== 0) {
      const n13 = n8 + n8 + 1;
      const n14 = n9 + n9 + 1;
      const n15 = n13 + n14;
      const n16 = n12 + n13;
      const n17 = n12 + n14;
      const n18 = n12 + n15;
      let step8 = false;
      let step9 = false;
      if (Math.abs(n17) < Math.abs(n16)) {
        if (Math.abs(n17) < Math.abs(n18)) {
          step9 = true;
          n12 = n17;
        } else {
          step8 = true;
          step9 = true;
          n12 = n18;
        }
      } else if (Math.abs(n16) < Math.abs(n18)) {
        step8 = true;
        n12 = n16;
      } else {
        step9 = true;
        step8 = true;
        n12 = n18;
      }
      if (step9) n9++;
      if (step8) n8++;
      n10 = n;
      n11 = n2;
      switch (n4) {
        case 0:
          n10 += ((n8 << n6) * 3) / 16;
          n11 += n9 >> n5;
          break;
        case 1:
          n10 -= ((n9 << n6) * 3) / 16;
          n11 += n8 >> n5;
          break;
        case 2:
          n10 -= ((n8 << n6) * 3) / 16;
          n11 -= n9 >> n5;
          break;
        case 3:
          n10 += ((n9 << n6) * 3) / 16;
          n11 -= n8 >> n5;
      }
      n10 = n10 | 0;
      n11 = n11 | 0;
      if (
        n10 < 0 ||
        n10 >= PIC_W ||
        n11 < 0 ||
        n11 >= 192 ||
        this.pixels[this.idx(n10, n11)] !== 0
      ) {
        continue;
      }
      this.pixels[this.idx(n10, n11)] = px;
    }
  }

  private staticLine(
    n: number,
    n2: number,
    n3: number,
    n4: number,
    n5: number,
  ): void {
    let n6: number;
    let n7: number;
    let n8 = n4 - n2;
    let n9 = n3 - n;
    if (n8 < 0) {
      n8 = -n8;
      n7 = -1;
    } else {
      n7 = 1;
    }
    if (n9 < 0) {
      n9 = -n9;
      n6 = -1;
    } else {
      n6 = 1;
    }
    n8 <<= 1;
    n9 <<= 1;
    const pal = PICTURE_PALETTE[n5] ?? 0;
    const px = argbFromMidp(pal);
    if (n >= 0 && n < PIC_W && n2 >= 0 && n2 < 192) {
      this.pixels[this.idx(n, n2)] = px;
    }
    if (n9 > n8) {
      let n10 = n8 - (n9 >> 1);
      while (n !== n3) {
        if (n10 >= 0) {
          n2 += n7;
          n10 -= n9;
        }
        n10 += n8;
        n += n6;
        if (n < 0 || n >= PIC_W || n2 < 0 || n2 >= 192) continue;
        this.pixels[this.idx(n, n2)] = px;
      }
      return;
    }
    let n11 = n9 - (n8 >> 1);
    while (n2 !== n4) {
      if (n11 >= 0) {
        n += n6;
        n11 -= n8;
      }
      n11 += n9;
      n2 += n7;
      if (n < 0 || n >= PIC_W || n2 < 0 || n2 >= 192) continue;
      this.pixels[this.idx(n, n2)] = px;
    }
  }

  private aSeven(
    n: number,
    n2: number,
    n3: number,
    n4Color: number,
    n5: number,
    n6: number,
    n7: number,
  ): void {
    const n8 = this.e(n3);
    const n9 = (((n8 << n7) * 3 + 6) / 16) | 0;
    switch (n5) {
      case 0:
        n2 += n8;
        break;
      case 1:
        n -= n9;
        break;
      case 2:
        n2 -= n8;
        break;
      case 3:
        n += n9;
    }
    let dir = n5;
    let left = n6;
    while (left > 0) {
      this.staticC(n, n2, n8, dir, 0, n7, n4Color);
      dir = (dir + 1) & 3;
      left--;
    }
  }

  private bSeven(
    n: number,
    n2: number,
    n3: number,
    n4Color: number,
    n5: number,
    n6: number,
    n7: number,
  ): void {
    n3 += n3;
    const n8 = this.e(n3);
    const n9 = (((n8 << 2) * 3 + 6) / 16) | 0;
    switch (n5) {
      case 0:
        n2 += (n8 / 2) | 0;
        break;
      case 1:
        n -= n9;
        break;
      case 2:
        n2 -= (n8 / 2) | 0;
        break;
      case 3:
        n += n9;
    }
    let dir = n5;
    let left = n6;
    while (left > 0) {
      this.staticC(n, n2, n8, dir, n7, 2, n4Color);
      dir = (dir + 1) & 3;
      left--;
    }
  }

  private bThree(n: number, n2: number, n3: number): void {
    if (n >= 0 && n < PIC_W && n2 >= 0 && n2 < 192 && this.pixels[this.idx(n, n2)] === 0) {
      this.cFill(n, n2, n3);
    }
  }

  private cFill(n: number, n2: number, n3: number): void {
    const pal = PICTURE_PALETTE[n3] ?? 0;
    const px = argbFromMidp(pal);
    let n4 = n;
    do {
      this.pixels[this.idx(n, n2)] = px;
      n++;
      this.q++;
      if (this.q > 10_000) {
        this.q = 0;
        this.aD();
      }
    } while (n < PIC_W && this.pixels[this.idx(n, n2)] === 0);
    const n5 = n - 1;
    n = n4 - 1;
    while (n >= 0 && this.pixels[this.idx(n, n2)] === 0) {
      this.pixels[this.idx(n, n2)] = px;
      n4 = n--;
      this.q++;
      if (this.q > 10_000) {
        this.q = 0;
        this.aD();
      }
    }
    const bl2 = n2 > 0;
    const bl3 = n2 < 191;
    if (bl2 && bl3) {
      for (n = n4; n <= n5; n++) {
        if (this.pixels[this.idx(n, n2 - 1)] === 0) this.cFill(n, n2 - 1, n3);
        if (this.pixels[this.idx(n, n2 + 1)] === 0) this.cFill(n, n2 + 1, n3);
      }
    } else {
      for (n = n4; n <= n5; n++) {
        if (bl2 && this.pixels[this.idx(n, n2 - 1)] === 0) this.cFill(n, n2 - 1, n3);
        if (bl3 && this.pixels[this.idx(n, n2 + 1)] === 0) this.cFill(n, n2 + 1, n3);
      }
    }
  }

  /** Run picture bytecode from PC `start` (Java e.M(int)) */
  run(world: GameWorld, start: number, maxOps = 500_000): void {
    this.clear();
    const op = world.pictureOpcodes;
    const olen = world.pictureOpcodeLength;
    const dTab = world.d268;
    if (olen === 0 || start < 0 || start >= olen) return;

    const nArray = new Int32Array(100);
    let n2 = 0;
    let n3 = 0;
    let n4 = 0;
    let n5 = 88;
    let n6 = 95;
    this.o = this.p;
    let n7 = 0;
    let n8 = 0;
    let n9 = 0;
    let n10 = 0;
    let n11 = 0;
    let n12 = 0;
    let n13 = 0;
    let n14 = 4;
    let n = start;
    const W = 2;
    let ops = 0;

    while (ops++ < maxOps) {
      const n15 = expandOpcodeByte(op[n]);
      const n16 = n < olen - 1 ? expandOpcodeByte(op[n + 1]) : 0;
      decodeF(n15, n16, this.f);
      n += this.f.h;

      switch (this.f.cmd) {
        case 9: {
          if (n2 >= 100) continue;
          const n17 = this.o + this.f.fg;
          if (n17 >= n14 - W) continue;
          nArray[n2++] = n;
          nArray[n2++] = this.o;
          nArray[n2++] = n5;
          nArray[n2++] = n6;
          nArray[n2++] = n3;
          nArray[n2++] = n4;
          const jump = dTab[this.f.fd] ?? 0;
          if (jump < 0 || jump >= olen) return;
          n = jump;
          this.o += this.f.fg;
          n5 += n8;
          n6 += n9;
          n3 = 0;
          n4 = 0;
          n8 = 0;
          n9 = 0;
          break;
        }
        case 6: {
          if (n2 >= 6) {
            n4 = nArray[--n2];
            n3 = nArray[--n2];
            n6 = nArray[--n2];
            n5 = nArray[--n2];
            this.o = nArray[--n2];
            n = nArray[--n2];
            n8 = this.d(n3);
            n9 = this.e(n4);
            break;
          }
          this.aD();
          return;
        }
        case 3: {
          const xx = n8 + n5;
          const yy = n9 + n6;
          const relColor = this.f.rel ? 1 : 0;
          switch (this.f.fg) {
            case 0:
              this.bSeven(xx, yy, this.f.fd, relColor, this.f.fe, this.f.ff, 1);
              break;
            case 1:
              this.aSeven(xx, yy, this.f.fd, relColor, this.f.fe, this.f.ff, 2);
              break;
            case 2:
              this.aSeven(xx, yy, this.f.fd, relColor, this.f.fe, this.f.ff, 1);
              break;
            default:
              this.aSeven(xx, yy, this.f.fd, relColor, this.f.fe, this.f.ff, 0);
          }
          break;
        }
        case 2: {
          if (this.f.rel) {
            n3 += this.f.fb;
            n4 += this.f.fc;
          } else {
            n3 = this.f.fb;
            n4 = this.f.fc;
          }
          n8 = this.d(n3);
          n9 = this.e(n4);
          this.r++;
          this.bThree(n8 + n5, n9 + n6, this.f.pen);
          if (this.r !== 4) break;
          this.aD();
          this.r = 0;
          break;
        }
        case 7: {
          nArray[n2++] = n7;
          nArray[n2++] = n;
          n7 = 0;
          break;
        }
        case 8: {
          if (n7++ < this.f.fd) {
            n = nArray[n2 - 1];
            break;
          }
          n2--;
          n7 = nArray[--n2];
          break;
        }
        case 0: {
          if (this.f.rel) {
            n3 += this.f.fb;
            n4 += this.f.fc;
          } else {
            n3 = this.f.fb;
            n4 = this.f.fc;
          }
          n8 = this.d(n3);
          n9 = this.e(n4);
          break;
        }
        case 1: {
          if (this.f.rel) {
            n10 = n3 + this.f.fb;
            n11 = n4 + this.f.fc;
          } else {
            n10 = this.f.fb;
            n11 = this.f.fc;
          }
          n12 = this.d(n10);
          n13 = this.e(n11);
          this.staticLine(
            n8 + n5,
            n9 + n6,
            n12 + n5,
            n13 + n6,
            this.f.pen,
          );
          n3 = n10;
          n4 = n11;
          n8 = n12;
          n9 = n13;
          break;
        }
        case 5:
          break;
        case 4:
          n14 = this.f.fi;
          break;
        default:
          break;
      }
    }
  }
}

export function drawPictureBuffer(
  ctx: CanvasRenderingContext2D,
  buffer: Int32Array,
  dx: number,
  dy: number,
): void {
  const img = new ImageData(PIC_W, PIC_H);
  const data = img.data;
  for (let i = 0; i < PIC_PIXELS; i++) {
    const p = buffer[i];
    const j = i * 4;
    data[j] = (p >> 16) & 0xff;
    data[j + 1] = (p >> 8) & 0xff;
    data[j + 2] = p & 0xff;
    data[j + 3] = (p >>> 24) & 0xff;
  }
  ctx.putImageData(img, dx, dy);
}
