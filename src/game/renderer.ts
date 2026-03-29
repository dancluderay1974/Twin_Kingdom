const NATIVE_W = 176;
const NATIVE_H = 220;

export function drawSpriteFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  destW: number,
  destH: number,
): void {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, destW, destH);
  ctx.drawImage(img, 0, 0, NATIVE_W, NATIVE_H, 0, 0, destW, destH);
}

export function createHiDPICanvas(
  canvas: HTMLCanvasElement,
  cssW: number,
  cssH: number,
): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
