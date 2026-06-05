# 🌈 PRISM POUR — Water Sort Puzzle

**Status:** ✅ Live · Single `index.html` · Mobile-first portrait (480px) · Zero-build · GitHub Pages
**Live:** https://quangle1997.github.io/prism-pour/ · **Accent:** `#39e0c8` (teal) · **Layout:** Mobile-frame A

> Tap a tube, tap another, pour the top color across. Sort every tube to one solid color. Fewer pours = more stars. 20 handcrafted, **solver-verified** levels with a realistic tilting-pour animation and a PRISM wildcard twist.

---

## §0 Feature Status (grep map)

| Feature | Status | Where in `index.html` |
|---------|--------|-----------------------|
| Core tap-to-pour | ✅ | `tryPour()`, `commitPour()`, `canPour()` |
| Realistic tilting-pour animation | ✅ | `drawPourAnim()`, `drawStream()` |
| 20 solver-verified levels | ✅ | `const LEVELS = [...]` |
| Exact optimal pour counts | ✅ | each level's `optimal:` (from A* solver) |
| Star rating (3/2/1) | ✅ | `levelWin()` |
| Win detection (empty OR solved) | ✅ | `isWin()`, `isSolvedTube()` |
| Undo (stack) | ✅ | `undoMove()`, `S.history` + on-screen button |
| Restart level | ✅ | `restartLevel()` + on-screen button + pause menu |
| Pour counter / target in HUD | ✅ | `updateHUD()`, `#pourChip` |
| PRISM wildcard liquid | ✅ | `effMatch()`, `colorAt()` rainbow branch |
| Two-row tube layout | ✅ | `layout()` |
| Sparkle particles | ✅ | `spawnSparkle()`, `drawParticles()` |
| Solved-tube glow | ✅ | `drawTubeAt()` pulse ring |
| WebAudio synth + rising-pitch pour ladder | ✅ | `Audio.pourTick()` etc. |
| Haptics | ✅ | `haptic()` |
| localStorage stars + settings | ✅ | `Save`, `S.stars` |
| Level select w/ stars + prism badge | ✅ | `buildLevelGrid()` |
| Screenshot/dev hook | ✅ | `?shot=` parser (harmless dev aid) |

---

## §1 Market Context & Design

- **Genre:** Casual water-sort puzzle (evergreen on CrazyGames/Poki/app stores).
- **Differentiator hook:** (1) **Star rating by pour-efficiency** drives replay for 3★; (2) **PRISM** wildcard liquid (rainbow) that matches/accepts any color — an extra planning layer.
- **Theme:** Neon arcade · **Accent:** `#39e0c8` teal (unused before — confirmed in guide inventory).
- **Layout strategy:** **A — Mobile-frame** (portrait, `max-width 480px`, letterbox on desktop). One layout for all screens.

---

## §2 Core Mechanic & Rules

**Core loop (1 sentence):** _Tap a source tube then a target tube to pour the top color; pour is legal only onto an empty tube or a matching top color (with room); sort every tube to one solid color to win, in as few pours as possible._

**Rules:**
1. Tap a non-empty tube → it **lifts and glows** (selected).
2. Tap another tube → attempt pour. Tap the same tube again → deselect.
3. **A pour is legal iff:** source non-empty **and** target not full **and** (target empty **or** top colors match — see PRISM below).
4. **Amount poured:** the whole contiguous run of the same top color in the source, up to the space left in the target.
5. **Tube solved:** full (4 units) and all units one color (PRISM units count as wildcard filler).
6. **Level won:** every tube is **empty OR solved**. *(This was the v1 bug — empty tubes used to block the win.)*
7. **PRISM (🌈):** a rainbow liquid unit. It matches **any** color, so it can be poured onto anything and anything can be poured onto it — a flexible buffer. It counts as "matching" for the solved check.

**Tube capacity:** `CAP = 4`.

---

## §3 Input

| Input | Action |
|-------|--------|
| Tap / pointer on a tube | select / pour / deselect |
| On-screen **Undo** button | revert last pour |
| On-screen **Restart** button | reset current level |
| `Esc` | pause / resume |
| `U` or `Z` | undo · `R` | restart (keyboard shortcuts) |

Input is **locked during a pour animation** to prevent mid-animation state corruption.

---

## §4 Animation & Juice

**Realistic tilting-pour animation** (`drawPourAnim`):
- **Lift** (200 ms): the source tube rises and swings toward the target, pivoting around its spout corner; rotation eases in (`easeInOut`).
- **Pour** (≈150 ms × units, min 220 ms): the tube holds at a ~57° tilt; a glowing **liquid stream** (`drawStream`, quadratic curve + droplet) flows from the spout to the target's surface; the target fills **unit-by-unit** while the source drains.
- **Return** (200 ms): the tube swings back and untilts.
- The whole thing commits to real state only at the end (`commitPour`), so Undo/animation never desync.

**Audio (WebAudio synth, no files):**
- `pourTick`: a **rising pitch ladder** — pitch climbs with each unit landed (520 Hz base × up to ~0.9 octave).
- `select` 640 Hz · `illegal` low saw 150 Hz · `solve` 784→1047→1319 Hz · `win` C-E-G-C-E arpeggio.

**Haptics:** select 6 ms · pour 8 ms/unit · illegal 30 ms · solve `[14,8,14]` · win `[20,30,20,30,50]`.

**Visual juice:** selected-tube lift + teal glow ring · per-color glossy gradient + meniscus highlight · solved-tube **pulsing** glow ring · **sparkle particles** on each solve and on level win · rainbow shimmer on PRISM units.

---

## §5 Level Structure ⭐ (the important part)

**20 handcrafted levels** live in the `LEVELS` array. Each entry:

```js
{ name:'First Drops', optimal:7, prism:false,
  tubes:[ ["#FF5A6A","#FFE45A","#FFE45A","#FF5A6A"], ["#FFE45A","#FFA500","#FFA500","#FF5A6A"],
          ["#FFA500","#FFA500","#FFE45A","#FF5A6A"], [], [] ] }
```

- `tubes`: array of tubes; each tube is an array of color hex strings **bottom→top** (`"*"` = PRISM). Empty tube = `[]`.
- `optimal`: **exact minimum pours** to solve (computed by the A* solver in `tools/gen.mjs`) → the 3★ threshold.
- `prism`: whether the level contains PRISM units.

**Invariant (must hold for every level):** each color appears a multiple of `CAP` (4) times, and the start state is solvable. Both are checked by `tools/verify.mjs`.

**Level table (as shipped):**

| # | Name | Tubes | Colors | Prism | Optimal (3★) |
|---|------|:----:|:-----:|:----:|:----:|
| 1 | First Drops | 5 | 3 | – | 7 |
| 2 | Easy Flow | 5 | 3 | – | 9 |
| 3 | Tight Trio | 4 | 3 | – | 6 |
| 4 | Four Hues | 6 | 4 | – | 12 |
| 5 | Color Mix | 6 | 4 | – | 12 |
| 6 | Packed Four | 5 | 4 | – | 9 |
| 7 | Five Alive | 7 | 5 | – | 15 |
| 8 | Spectrum | 7 | 5 | – | 16 |
| 9 | Squeeze | 6 | 5 | – | 12 |
| 10 | Prism Intro | 7 | 4+🌈 | ✅ | 15 |
| 11 | Six Shades | 8 | 6 | – | 18 |
| 12 | Rainbow | 8 | 6 | – | 18 |
| 13 | Dense Six | 7 | 6 | – | 16 |
| 14 | Prism Flow | 8 | 5+🌈 | ✅ | 17 |
| 15 | Chromatic | 8 | 6 | – | 17 |
| 16 | Seven Seas | 9 | 7 | – | 23 |
| 17 | Compact | 7 | 6 | – | 19 |
| 18 | Prism Path | 7 | 5+🌈 | ✅ | 20 |
| 19 | Prism Master | 9 | 6+🌈 | ✅ | 18 |
| 20 | Zenith | 9 | 7 | – | 21 |

**Difficulty curve:** colors 3→7, tube count 4→9, empties shrink (2→1) to tighten the puzzle, PRISM introduced at L10 and reused on L14/18/19. Layout auto-switches to **two rows** when a level has >5 tubes.

---

## §6 Difficulty Scaling

No dynamic/runtime difficulty — progression is **level-by-level only**. Later levels add colors, tubes and deeper mixing; fewer empty buffers raise the planning load. The A*-computed `optimal` keeps 3★ honest and fair per level.

---

## §7 Scoring & Progression

**Stars per level (`levelWin`):**
- ⭐⭐⭐ — `pours <= optimal`
- ⭐⭐ — `pours <= ceil(optimal * 1.3)`
- ⭐ — otherwise

**Persistence:** best stars per level in `localStorage['prismPour.stars']` (array of ints). Menu shows levels-solved and total stars (max `20 × 3 = 60`). No combo/score number — the star count *is* the score.

---

## §8 UI Flows

Menu → (first run: How-to) → **Level Select** (grid of 20, stars + 🌈 prism badge) → **Gameplay** → **Level Complete** (stars, your pours, 3★ target, Next/Retry). In-game: top-left Level+name chip, top-right pour-counter chip + mute + pause; bottom **Undo / Restart** bar. **Pause** menu: Resume / Restart / Quit + Music/SFX/Haptics toggles.

---

## §9 Mobile & Responsive

Mobile-frame A: fixed `min(100vw,480px)`, `100dvh`, centered, safe-area insets. Single layout for phone + desktop (desktop = centered phone with letterbox). Touch via `pointerdown`; generous hit padding; overlays use `pointer-events:none` when hidden (no tap-leak); audio context resumed inside the first gesture (iOS-safe).

---

## §10 Tech

Pure vanilla HTML5 + Canvas 2D + WebAudio + localStorage. No framework, no bundler, single self-contained `index.html`. Google Fonts (Orbitron + Space Grotesk) the only external resource. DPR capped at 2.

---

## §14 Balance Numbers (single source of truth)

```js
const CAP = 4;          // units per tube
const PRISM = '*';      // wildcard liquid
// star thresholds (levelWin): 3★ pours<=optimal · 2★ pours<=ceil(optimal*1.3) · else 1★
// animation timing: lift 200ms · pour max(220, units*150)ms · return 200ms
// audio: pour base 520Hz climbing ~0.9 octave; solve 784/1047/1319; win C4 E4 G4 C5 E5
```
All level data + `optimal` values live in `LEVELS`. **Do not** hardcode balance elsewhere.

---

## §15 How-To Recipes

### Add / edit a level (make this trivial)
1. **Author it solvably.** The safe way is to let the generator do it: edit the `PLAN` array in `tools/gen.mjs` (set `colors`, `empties`, optional `prism:true`), then:
   ```bash
   node tools/gen.mjs 2>/dev/null   # prints a fresh, solvable LEVELS array with exact optimal
   ```
   Paste the new entry/array into `const LEVELS` in `index.html`.
2. **Or hand-write** a level object `{name, optimal, prism, tubes}` — but you **must** keep the invariant: every color appears a multiple of 4 times.
3. **Verify** before shipping:
   ```bash
   node tools/verify.mjs            # asserts solvable + win-detect + optimal exact + color counts
   ```
   It replays the A* solution through the real game logic and prints `PASS/FAIL` per level.
4. Update the table in **§5** + the count in §0/README. Commit code + DOCS together.

### Change star strictness
Edit the threshold in `levelWin()` and the formula in §7 + §14. Re-verify.

### Add a color
Append a hex to the generator `PALETTE` (and use it in levels). Keep contrast high; update §5.

### Tune the pour animation
Edit the `lift / pour / ret` ms in `tryPour()` (stored on `S.anim`) and the easing in `drawPourAnim()`. Keep input locked while `S.anim` is set.

---

## §16 History

| Date | Ver | Change |
|------|-----|--------|
| 2026-06-04 | 1.0 | Initial 20-level build (UI, audio, level select). |
| 2026-06-04 | **1.1** | **Critical:** rebuilt all 20 levels via A* generator (v1 levels were unsolvable); **fixed win detection** (empty-or-solved). Added realistic **tilting-pour animation** + liquid stream, rising-pitch pour SFX, on-screen **Undo/Restart**, pour counter, **PRISM** wildcard mechanic, two-row layout, sparkle particles. Added `tools/gen.mjs` + `tools/verify.mjs`. |

---

## §17 Known Limitations & Ideas

- Liquid stays axis-aligned to the tube during tilt (no separate gravity-leveled surface) — reads well with the stream + motion; a true leveled surface is a future polish.
- Local-only progress (no cloud sync) — intentional for a casual single-player puzzle.
- Future: smooth inter-level transitions, daily challenge, more PRISM variants, hint button.

---

**Last updated:** 2026-06-04 (v1.1) · single-player · ~20–30 min full run · all ages.
