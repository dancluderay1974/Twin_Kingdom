# Twin Kingdom Valley J2ME — binary format (reverse-engineered)

Source: decompiled `g.java` (`g.a(InputStream)` chain) and `e.java` (`aA()` for `/3.bin`).

## `/1.bin` — world bootstrap (`g.c()` after JAR load)

Read order:

1. **`g.b`**: `short[]` length **551** — one byte per element, `(short)read()`.
2. **`g.b` cont.**: `short[]` length **200** — big-endian 16-bit per element (`read()<<8 | read()`).

3. **`g.c`**: sixteen `short[16]` arrays (`n`…`u`): 8×16 = 128 bytes (alternating one byte per short).
4. **`g.c` cont.**: four `short[37]` (`v`,`w`,`x`,`y`): 4×37 = 148 bytes.

5. **`g.d`**: `int[40]` — for each index: 4 bytes little-endian int, then bytes for auxiliary columns (see `g.java`; includes masked bytes via `g.a(int)`).

6. **`g.d` cont.**: **54** pairs of `(byte, short)` — `byte[54]` + `short[54]` (`g` verb map + `B` slots in original).

7. **`g.e`**: `short[268]` as raw byte then **overwrite** with BE `short` pairs (268×2 bytes).

8. **`g.f`**: sequential single-byte masked writes into `byte[1324]`, `byte[746]`, `byte[200]`, `byte[551]`, `byte[2526]` (string pool for `e.d()`), with side effects on index tables.

9. **`g.g`**: **260** newline-terminated decimal ASCII lines → `long[260]`.

Total consumed bytes must equal `1.bin` size (**10519**). Length **551** (not 2478) is required for the `g.b` / `g.f` segments to match file size.

## `/2.bin` — intro / help screens

CR-separated lines; UI reads **13** lines per “page” (`e.a(InputStream)`).

## `/3.bin` — picture opcodes

**10556** bytes in this JAR (decompiled loop referenced 10546 — use file length). Each stream byte `n` is stored as Java `byte` via:

- if `n > 127` → `(byte)-((n - 127))`
- else `(byte)n`

Used by `e.M(int)` with `f.a()` to interpret drawing ops (original uses `javax.microedition.lcdui.Graphics`).

## String pool `e.d(index)`

- **Byte pool** length **2526** (from `1.bin` via `g.f`).
- **Offset table** length **126** (`short` indices marking string starts; `e.d(n)` starts at `offset[n-1]+1` when `n>0`).
- Characters: decoded byte `b` → int `v = b < 0 ? -b + 127 : b`; emit `(char)(v & 0x7F)`; last char has `v & 0x80` set.

Similar helpers `e.b` / `e.c` use pools `e` (1324) / `f` (746) and tables built in `g.f`.
