# Twin Kingdom Valley (web) — architecture

## No in-browser JVM

This project does **not** run the original J2ME JAR in the browser. There is no embedded Java SE or CLDC/MIDP emulator in the page. Game behavior is owned by a **TypeScript port** of the decompiled game logic plus the shipped binary assets (`1.bin`, `2.bin`, `3.bin`, PNG tiles).

A separate spike would be required for MIDP emulation (`RecordStore`, `Canvas`, Nokia APIs, etc.). This repository deliberately keeps **static data + ported logic** as the execution path.

## Source of truth

- Decompiled classes under `src/decompiled/` (especially `e.java`, `a.java`, `g.java`, `f.java`).
- Bytecode or `javap` when CFR output is ambiguous (as with `world.ts` loaders).
- Shipped `public/data/*.bin` and `public/assets/*.png`.

## Main modules

| Area | Role |
|------|------|
| `src/game/world.ts` | Parse `1.bin` / `3.bin` into `GameWorld`. |
| `src/jme/resumeRecord.ts` | `tkv_resume` v2 encode/decode; `applyGInitResume` / `mergeResumeToWorld`. |
| `src/jme/gameState.ts` | Mutable `a.*` room scalars (`ak`, `au`…`ax`) and `enterRoom`. |
| `src/game/navigation.ts` | Exit scan aligned with `e.j()` (mask match, `ay & 0x80` stream skip, second pass). |
| `src/jme/eDispatch.ts` | Verb classification; map of `e.k(int ae)` cases for staged porting. |
| `src/jme/fDecode.ts` / `pictureM.ts` | Picture opcode decode and raster buffer (176×220). |
| `src/game/engine.ts` | Astro/React shell: menu, save/load, transcript, picture refresh. |

## Verification

- **Unit tests:** `npm test` (Vitest) — loaders, resume round-trip, navigation, `fDecode`, dispatch map.
- **Parity with the JAR:** run the original game in a desktop J2ME emulator, record command transcripts or room checks, and compare to this port (optional golden fixtures).
- **Manual:** new game, save/load, scripted moves (N/NE/…, W/NW, UP/DOWN) and picture sanity.

## Assets

Game data files under `public/data/` may be large or licensed; ensure they are present locally for tests and dev server. Optional `public/assets/sc.png` status chrome is loaded when available; missing file is ignored.
