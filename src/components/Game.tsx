import { useEffect, useRef, useState } from "react";
import {
  TwinKingdomEngine,
  type EngineState,
} from "../game/engine";
import { createHiDPICanvas, drawSpriteFrame } from "../game/renderer";
import { drawPictureBuffer } from "../jme/pictureM";
import { hasSave } from "../game/save";

const base = import.meta.env.BASE_URL;

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logScrollRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TwinKingdomEngine | null>(null);
  const [state, setState] = useState<EngineState | null>(null);
  const [input, setInput] = useState("");
  const [spImg, setSpImg] = useState<HTMLImageElement | null>(null);
  const [loImg, setLoImg] = useState<HTMLImageElement | null>(null);
  /** Optional status-bar chrome (original sc.png); ignored if missing */
  const [scImg, setScImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const eng = new TwinKingdomEngine();
    engineRef.current = eng;
    const unsub = eng.subscribe(setState);
    void eng.bootstrap({
      bin1: `${base}data/1.bin`,
      bin2: `${base}data/2.bin`,
      bin3: `${base}data/3.bin`,
    });
    return unsub;
  }, []);

  useEffect(() => {
    const sp = new Image();
    sp.decoding = "async";
    sp.src = `${base}assets/sp.png`;
    sp.onload = () => setSpImg(sp);
    const lo = new Image();
    lo.decoding = "async";
    lo.src = `${base}assets/lo.png`;
    lo.onload = () => setLoImg(lo);
    const sc = new Image();
    sc.decoding = "async";
    sc.onload = () => setScImg(sc);
    sc.onerror = () => setScImg(null);
    sc.src = `${base}assets/sc.png`;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spImg || !state) return;
    const ctx = createHiDPICanvas(canvas, 176, 220);
    if (state.phase === "playing") {
      const buf = engineRef.current?.getPictureBuffer();
      if (buf) drawPictureBuffer(ctx, buf, 0, 0);
      else drawSpriteFrame(ctx, spImg, 176, 220);
      if (scImg && scImg.naturalWidth > 0) {
        const barH = Math.min(
          220,
          Math.round((176 * scImg.naturalHeight) / scImg.naturalWidth),
        );
        ctx.drawImage(scImg, 0, 220 - barH, 176, barH);
      }
    } else if (state.phase !== "splash") {
      drawSpriteFrame(ctx, spImg, 176, 220);
    }
  }, [spImg, scImg, state?.phase, state?.pictureTick]);

  useEffect(() => {
    if (state?.phase !== "splash" || !loImg) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = createHiDPICanvas(canvas, 176, 220);
    ctx.fillStyle = "#102010";
    ctx.fillRect(0, 0, 176, 220);
    const scale = Math.min(176 / loImg.width, 160 / loImg.height);
    const w = loImg.width * scale;
    const h = loImg.height * scale;
    ctx.drawImage(loImg, (176 - w) / 2, (220 - h) / 2, w, h);
  }, [loImg, state?.phase]);

  useEffect(() => {
    if (state?.phase !== "splash") return;
    const t = window.setTimeout(() => {
      engineRef.current?.enterMenu();
    }, 2200);
    return () => clearTimeout(t);
  }, [state?.phase]);

  useEffect(() => {
    const el = logScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [state?.logLines]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eng = engineRef.current;
    if (!eng || !state) return;
    const line = input.trim();
    setInput("");

    if (state.phase === "menu") {
      const n = parseInt(line, 10);
      if (n === 1) eng.startIntroFrom2Bin();
      else if (n === 2) eng.loadGame();
      else if (n === 3) eng.newGame();
      else if (n === 4) {
        if (hasSave()) eng.resumeGame();
        else eng.appendLog("(No resume data.)");
      } else if (n === 5) eng.saveGame();
      else if (n === 6) eng.appendLog("(Options: not yet wired.)");
      else if (n === 7)
        eng.appendLog("Twin Kingdom Valley J2ME v1.21 → Web.");
      else if (n === 8) eng.appendLog("Close the tab to exit.");
      return;
    }

    if (state.phase === "intro") {
      eng.introAdvance();
      return;
    }

    if (state.phase === "playing") {
      eng.processCommand(line);
    }
  };

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "ui-monospace, monospace",
        background: "#0d1117",
        color: "#c9d1d9",
        padding: 16,
      }}
    >
      <h1 style={{ fontSize: 18, marginBottom: 8, flexShrink: 0 }}>
        Twin Kingdom Valley
      </h1>
      {state?.phase === "error" && (
        <p style={{ color: "#f85149", flexShrink: 0 }}>{state.error}</p>
      )}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          border: "2px solid #30363d",
          borderRadius: 4,
          imageRendering: "pixelated",
          flexShrink: 0,
        }}
      />
      <div
        ref={logScrollRef}
        style={{
          flex: 1,
          minHeight: 180,
          overflowY: "auto",
          marginTop: 12,
          padding: 8,
          background: "#161b22",
          borderRadius: 4,
          fontSize: 12,
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
        }}
      >
        {(state?.logLines ?? []).map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <form
        onSubmit={onSubmit}
        style={{ marginTop: 12, display: "flex", gap: 8, flexShrink: 0 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            state?.phase === "menu"
              ? "Menu 1–8 + Enter"
              : state?.phase === "intro"
                ? "Enter for next page"
                : "Command (e.g. LOOK, N, HELP)"
          }
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: 4,
            border: "1px solid #30363d",
            background: "#0d1117",
            color: "#c9d1d9",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 14px",
            borderRadius: 4,
            border: "none",
            background: "#238636",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enter
        </button>
      </form>
      <p style={{ fontSize: 11, opacity: 0.65, marginTop: 12, flexShrink: 0 }}>
        Data: <code>1.bin</code>, <code>2.bin</code>, <code>3.bin</code>,{" "}
        <code>sp.png</code>. Resume uses MIDP-compatible <code>tkv_resume</code>{" "}
        v2 in localStorage.
      </p>
    </div>
  );
}
