import { decodeB, decodeD } from "./strings";
import { DIRECTIONS, parseCommandLine } from "./parser";
import { load1Bin, load3Bin, type GameWorld } from "./world";
import {
  applyResumeToWorld,
  buildSaveV2,
  clearSave,
  createResumeFromWorld,
  loadSave,
  newResumeFromFreshWorld,
  writeSaveV2,
  type LoadedSave,
} from "./save";
import type { ResumeRuntime } from "../jme/resumeRecord";
import { PictureInterpreter } from "../jme/pictureM";
import { midpYield } from "../jme/enginePort";

export type GamePhase =
  | "loading"
  | "splash"
  | "menu"
  | "intro"
  | "playing"
  | "error";

export type EngineListener = (state: EngineState) => void;

export type EngineState = {
  phase: GamePhase;
  logLines: string[];
  introPage: number;
  introTotalPages: number;
  menuIndex: number;
  error?: string;
  /** Picture opcode stream loaded (for future M() renderer) */
  opcodesLoaded: boolean;
  worldLoaded: boolean;
  /** Incremented when vector picture buffer is rebuilt */
  pictureTick: number;
};

const MENU = [
  "Instructions",
  "Load Game",
  "New Game",
  "Resume",
  "Save Game",
  "Options",
  "About",
  "Exit",
] as const;

function read2BinPages(buffer: ArrayBuffer): string[][] {
  const bytes = new Uint8Array(buffer);
  const lines: string[] = [];
  let cur = "";
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if (c === 13) {
      lines.push(cur);
      cur = "";
    } else {
      cur += String.fromCharCode(c);
    }
  }
  if (cur.length) lines.push(cur);
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += 13) {
    pages.push(lines.slice(i, i + 13));
  }
  return pages.filter((p) => p.length > 0);
}

export class TwinKingdomEngine {
  world: GameWorld | null = null;
  private readonly picture = new PictureInterpreter();
  /** Mutable resume snapshot (tkv_resume); kept in sync on save */
  resume: ResumeRuntime | null = null;
  private bin1Buffer: ArrayBuffer | null = null;
  private bin3Buffer: ArrayBuffer | null = null;
  private pages2: string[][] = [];
  private listeners: EngineListener[] = [];
  private state: EngineState = {
    phase: "loading",
    logLines: [],
    introPage: 0,
    introTotalPages: 0,
    menuIndex: 0,
    opcodesLoaded: false,
    worldLoaded: false,
    pictureTick: 0,
  };

  roomIndex = 0;
  score = 0;
  /** Mirrors progress display a.H / 1250 from original */
  playerStat = 1;

  getPictureBuffer(): Int32Array | null {
    if (!this.world || !this.state.worldLoaded) return null;
    return this.picture.getBuffer();
  }

  refreshPicture(): void {
    if (!this.world) return;
    const d = this.world.d268;
    const i = Math.min(Math.max(0, this.roomIndex), d.length - 1);
    const pc = d[i] ?? 0;
    this.picture.run(this.world, pc);
    this.state.pictureTick++;
  }

  subscribe(fn: EngineListener): () => void {
    this.listeners.push(fn);
    fn(this.state);
    return () => {
      this.listeners = this.listeners.filter((x) => x !== fn);
    };
  }

  private emit(): void {
    for (const fn of this.listeners) fn({ ...this.state });
  }

  /** Append a line to the on-screen transcript */
  appendLog(line: string): void {
    this.state.logLines = [...this.state.logLines, line].slice(-200);
    this.emit();
  }

  async bootstrap(urls: {
    bin1: string;
    bin2: string;
    bin3: string;
  }): Promise<void> {
    try {
      const [r1, r2, r3] = await Promise.all([
        fetch(urls.bin1),
        fetch(urls.bin2),
        fetch(urls.bin3),
      ]);
      if (!r1.ok || !r2.ok || !r3.ok) throw new Error("Failed to load data files");
      const b1 = await r1.arrayBuffer();
      const b2 = await r2.arrayBuffer();
      const b3 = await r3.arrayBuffer();

      this.bin1Buffer = b1;
      this.bin3Buffer = b3;
      this.world = load1Bin(b1);
      this.resume = newResumeFromFreshWorld(this.world);
      load3Bin(this.world, b3);
      this.pages2 = read2BinPages(b2);
      this.state.introTotalPages = this.pages2.length;
      this.state.worldLoaded = true;
      this.state.opcodesLoaded = true;
      await midpYield(0);
      this.state.phase = "splash";
      this.emit();
    } catch (e) {
      this.state.phase = "error";
      this.state.error = e instanceof Error ? e.message : String(e);
      this.emit();
    }
  }

  /** Splash finished → main menu */
  enterMenu(): void {
    this.state.phase = "menu";
    this.state.menuIndex = 2;
    this.appendLog("");
    this.appendLog("Twin Kingdom Valley (web)");
    MENU.forEach((label, i) => this.appendLog(`  ${i + 1}. ${label}`));
    this.emit();
  }

  startIntroFrom2Bin(): void {
    if (this.pages2.length === 0) {
      this.enterPlaying();
      return;
    }
    this.state.phase = "intro";
    this.state.introPage = 0;
    this.flushIntroPage();
  }

  private flushIntroPage(): void {
    const p = this.pages2[this.state.introPage];
    if (!p) return;
    this.appendLog("");
    p.forEach((line) => this.appendLog(line));
    this.emit();
  }

  introAdvance(): void {
    if (this.state.introPage + 1 < this.pages2.length) {
      this.state.introPage++;
      this.flushIntroPage();
    } else {
      this.enterPlaying();
    }
  }

  enterPlaying(): void {
    this.state.phase = "playing";
    if (!this.world) return;
    try {
      this.appendLog(decodeD(this.world, 0));
      this.appendLog(decodeD(this.world, 1));
      this.appendLog("");
      this.appendLog(
        decodeD(this.world, 53) || "You stand in Twin Kingdom Valley.",
      );
      this.appendLog(
        "Type HELP for commands, or N S E W to move (demo traversal).",
      );
    } catch {
      this.appendLog("Welcome to Twin Kingdom Valley.");
    }
    this.refreshPicture();
    this.emit();
  }

  newGame(): void {
    clearSave();
    if (this.bin1Buffer) {
      this.world = load1Bin(this.bin1Buffer);
      this.resume = newResumeFromFreshWorld(this.world);
      if (this.bin3Buffer) load3Bin(this.world, this.bin3Buffer);
    }
    this.roomIndex = 0;
    this.score = 0;
    this.playerStat = 1;
    this.state.logLines = [];
    this.startIntroFrom2Bin();
  }

  resumeGame(): void {
    const s = loadSave();
    if (s) this.applyLoadedSave(s);
    this.enterPlaying();
  }

  saveGame(): void {
    if (!this.world || !this.resume) {
      this.appendLog("(World not ready.)");
      return;
    }
    const payload = buildSaveV2(this.world, this.resume, {
      roomIndex: this.roomIndex,
      score: this.score,
      playerStat: this.playerStat,
      logSnapshot: this.state.logLines.slice(-40),
    });
    writeSaveV2(payload);
    this.appendLog("(Game saved — Twin Kingdom resume record v2.)");
  }

  loadGame(): void {
    const s = loadSave();
    if (!s) {
      this.appendLog("(No saved game found.)");
      return;
    }
    this.applyLoadedSave(s);
    this.appendLog("(Loaded save.)");
    this.enterPlaying();
  }

  private applyLoadedSave(loaded: LoadedSave): void {
    if (!this.world) return;
    const p = loaded.payload;
    this.roomIndex = p.roomIndex;
    this.score = p.score;
    this.playerStat = p.playerStat;
    if (p.logSnapshot?.length) {
      this.state.logLines = [...p.logSnapshot];
    }
    if (loaded.version === 2 && "resume" in p) {
      this.resume = applyResumeToWorld(this.world, p.resume);
    } else {
      this.resume = createResumeFromWorld(this.world);
    }
  }

  processCommand(input: string): void {
    if (this.state.phase !== "playing" || !this.world) return;
    const { verb, tokens } = parseCommandLine(input);
    if (!verb) return;
    this.appendLog(`> ${input.trim()}`);

    const dir = DIRECTIONS[verb];
    if (dir) {
      this.moveDirection(dir);
      return;
    }

    switch (verb) {
      case "look":
      case "l":
        this.doLook();
        break;
      case "score":
        this.appendLog(` ${this.playerStat}/${1250}`);
        break;
      case "help":
      case "?":
        this.doHelp();
        break;
      case "inventory":
      case "i":
        this.appendLog("You are carrying nothing of note.");
        break;
      case "quit":
      case "exit":
        this.appendLog("Use the menu to exit — or close the tab.");
        break;
      default:
        this.appendLog(
          this.world
            ? decodeD(this.world, 53)
            : "I don't understand that yet.",
        );
    }
    void tokens;
    this.emit();
  }

  private moveDirection(d: string): void {
    if (!this.world) return;
    this.roomIndex = (this.roomIndex + d.length + 3) % 200;
    try {
      const desc = decodeB(this.world, this.roomIndex % 80);
      this.appendLog(`(${d.toUpperCase()})`);
      this.appendLog(desc || "You wander the valley…");
    } catch {
      this.appendLog("You can't go that way.");
    }
    this.score = Math.min(1250, this.score + 1);
    this.playerStat = Math.min(1250, this.playerStat + 2);
    this.refreshPicture();
    this.emit();
  }

  private doLook(): void {
    if (!this.world) return;
    try {
      this.appendLog(decodeB(this.world, this.roomIndex % 80));
    } catch {
      this.appendLog("You see nothing special.");
    }
    this.emit();
  }

  private doHelp(): void {
    if (!this.world) return;
    try {
      [22, 23, 24, 25, 26, 27, 28, 29, 30, 31].forEach((i) => {
        try {
          const s = decodeD(this.world!, i);
          if (s) this.appendLog(s);
        } catch {
          /* skip */
        }
      });
    } catch {
      this.appendLog("N S E W NE NW SE SW UP DOWN — LOOK SCORE INVENTORY HELP");
    }
    this.emit();
  }
}
