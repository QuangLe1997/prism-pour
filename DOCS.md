# 🌈 PRISM POUR — Water Sort Puzzle

**Status:** In Development · Single `index.html` · Mobile-first portrait (480px) · Zero-build · GitHub Pages

> A meditative water-sort puzzle where players tap & pour colored liquids into matching tubes. Fewer pours = more stars. Perfect for relaxation with handcrafted levels and smooth animations.

---

## §0 Game Overview & Status

| Feature | Status | Notes |
|---------|--------|-------|
| Core mechanic (tap-to-pour) | ✅ | Canvas-based, smooth interaction |
| 20 handcrafted levels | ✅ | Levels 1–20 with increasing difficulty |
| Star rating system | ✅ | Based on pour count vs. optimal |
| Undo & Restart buttons | ✅ | Pause menu integration |
| Level select screen | ✅ | Shows stars earned per level |
| Audio (WebAudio synth) | ✅ | Select, pour, illegal, solve, level-win |
| Haptic feedback (mobile) | ✅ | Configurable in pause menu |
| localStorage persistence | ✅ | Saves stars, best record, settings |
| OG/social card | 🔄 | Pending generation (media-tools) |

---

## §1 Market Context & Design Rationale

**Research insights:**
- Water sort puzzles remain popular on casual platforms (CrazyGames, Poki).
- Players engage with puzzle games offering: clear progression, achievable difficulty ramps, instant feedback.
- Neon/teal aesthetics resonate in arcade/casual web space.

**Differentiator hook:**
- **Star rating per level** (discrete feedback for optimization) — players naturally replay for 3-star clears.
- **Smooth pour animation + satisfying SFX** — tactile, meditative gameplay.
- **Discrete levels with handcrafted difficulty** — no infinite levels; focused curated experience.

**Genre:** Casual puzzle · **Theme:** Neon arcade · **Accent color:** `#39e0c8` (teal) · **Layout:** Mobile-frame A (portrait 480px, desktop letterbox).

---

## §2 Core Mechanic

**Core loop (1 sentence):**
_Players select a tube, select a target tube, and pour the top color onto it (only onto empty or same color). Clear all tubes to one solid color = solve. Fewer pours = more stars._

**Rules:**
1. **Tap a tube** → it glows (selection).
2. **Tap another tube** → attempt pour.
3. **Pour is legal if:**
   - Source tube has liquid (not empty).
   - Target tube is not full.
   - Target is empty OR top color matches source top color.
4. **Pour amount:** All top-layer colors of the same type in source (up to space in target).
5. **Tube solved:** Single color, full (4 units).
6. **Level won:** All tubes solved.
7. **Undo:** Revert last pour (accessible during play via dev helper or in-game menu).

---

## §3 Input & Interaction

| Input | Action | Notes |
|-------|--------|-------|
| **Touch / Pointer** (canvas) | Tap tube index (1–N) to select/pour | Mobile-first |
| **Keyboard** | `Esc` = pause/resume |
| **Keyboard** | `U` = undo (dev helper) |

---

## §4 Audio & Juice

**SFX (WebAudio synth — no external files):**
- `select`: 600 Hz sine, 80 ms (tube selection glow)
- `pour`: 880→1100→1400 Hz sine rising ladder, 120 ms each (satisfying cascade)
- `illegal`: 200 Hz sine, 120 ms (feedback on failed move)
- `solve`: 1100 Hz sine, 200 ms (tube completes)
- `levelWin`: [523, 659, 784, 1046] Hz sine ladder, 150 ms each, 80 ms apart (victory chime)

**Haptic (mobile):**
- Select: 8 ms
- Pour: 10 ms
- Illegal: 30 ms
- Solve: [20, 10, 20] ms (pattern)
- Level complete: [20, 30, 20, 30, 40] ms (celebration)

**Visual juice:**
- **Tube glow:** Selected tube fills with cyan (`#39e0c8`), 0.4 opacity.
- **Liquid shadow:** Each color has glow shadow (12 px blur) matching its hue.
- **Solved glow:** Completed tube gets cyan stroke + shadow (20 px).
- **Liquid animation:** Pour is instant (could upgrade to smooth animation later).

---

## §5 Level Structure

**20 handcrafted levels** defined in `LEVELS` array. Each level specifies:
- `colors`: Array of color hex codes used in this level.
- `tubes`: Array of tube arrays (each tube = array of color strings, bottom to top).
- `optimal`: Target pour count for 3 stars.
- `name`: Level display name (e.g., "Tutorial 1", "Challenge").

**Tube capacity:** 4 units max.

**Difficulty progression:**
| Level | Colors | Tubes | Stacks | Theme | Optimal Pours |
|-------|--------|-------|--------|-------|---------------|
| 1–3 | 3 | 4 | Shallow (≤2 deep) | Tutorial | 3–5 |
| 4–8 | 4–5 | 5–6 | Medium (3–4 deep) | Warmup | 6–10 |
| 9–15 | 5–6 | 6–7 | Deep (3–4 full tubes) | Challenge | 11–16 |
| 16–20 | 6 | 8 | Complex (multiple full) | Mastery | 17–19 |

**How to add a new level:**
1. Open `DOCS.md` §5 and note the last level's optimal.
2. In `index.html`, find `const LEVELS = [...]`.
3. Add new object at the end:
   ```javascript
   { colors:['#FF6B9D', '#FFA500', '#00D9FF', '#39E0C8'], tubes:[['#FF6B9D','#FFA500'],['#FF6B9D'],['#FFA500'],['#00D9FF']], optimal:5, name:'My Level' },
   ```
   - Ensure `tubes` has the right capacity distribution.
   - Set `optimal` to the theoretical minimum pours to solve.
4. Test in browser: `startLevel(<index>)` from dev console.
5. Update `DOCS.md` this section + level count in overview.
6. Commit + push.

---

## §6 Difficulty Scaling

**No dynamic difficulty.** Difficulty is **level-progression only**: later levels have more colors, tubes, and deeper stacks.

**Balance tuning:**
- **Accessible:** Levels 1–5 teach the mechanic gently.
- **Ramp:** Levels 6–12 introduce complexity (more colors, tube management).
- **Expert:** Levels 13–20 are optimization puzzles (multi-pour sequences, tight packing).

---

## §7 Scoring & Progression

**Star rating per level:**
- ⭐⭐⭐ (3 stars): Pours ≤ `level.optimal`
- ⭐⭐ (2 stars): Pours ≤ `level.optimal × 1.3` (rounded up)
- ⭐ (1 star): Pours > `level.optimal × 1.3`

**Persistence:**
- **Best stars per level:** Stored in `localStorage['prismPour.stars']` as array of integers.
- **Total stars:** Sum of all earned stars (max 60).
- **Levels completed:** Count of levels with ≥1 star.

**No combo/multiplier system.** Score is implicit (star count).

---

## §8 UI Flows

### Main menu
- Game title + pitch
- "Play" button → shows "How to Play" overlay on first run, then level select on repeat
- "How to play" button → manual overlay
- Stats: levels completed, total stars

### Level select
- 4-column grid of level cards (1–20)
- Each card shows: level number + star count
- Tap card → start level
- "Back" → return to menu

### During level
- **HUD:** Level number (top-left), mute button (top-right), pause button
- **Canvas:** Tube visuals with selection highlight
- **Tap interaction:** Select → glow, tap again to pour or deselect

### Pause menu
- Resume / Restart Level / Quit to Menu
- Toggles: Music, Sound FX, Haptics

### Level complete overlay
- Star display (⭐⭐⭐)
- "Pours" stat
- "Best" stat (optimal)
- "Next Level" button (or back to menu if last level)
- "Retry" button

---

## §9 Mobile & Responsive

**Layout strategy:** Mobile-frame A (portrait 480px, letterboxed on desktop).
- Fixed width `480px`, centered, max-height 100vh.
- No responsive columns/wraps — single layout for all screens.
- Safe-area inset support for notches/home indicator.

**Touch handling:**
- `pointerdown` on canvas for tap detection.
- No tap-leak (overlay.hidden * { pointer-events:none }).
- iOS audio: `Audio.ensure()` called in gestures to unblock audio context.

---

## §10 Technical Stack

| Component | Tech | Notes |
|-----------|------|-------|
| **View** | Single `index.html` | No framework, no build |
| **Canvas** | 2D Canvas API | `getContext('2d')` |
| **Audio** | WebAudio synth | Oscillators + gain envelope |
| **Input** | Touch + Pointer events | Mobile + desktop |
| **Storage** | localStorage (JSON) | Namespace: `prismPour.*` |
| **Fonts** | Google Fonts (Orbitron, Space Grotesk) | CDN preconnect |
| **Deploy** | GitHub Pages | Branch `main`, folder `/` |

---

## §11 Browser Compatibility

- **Desktop:** Chrome, Firefox, Safari, Edge (all modern versions)
- **Mobile:** iOS Safari 14+, Chrome Android, Samsung Internet
- **Required:** ES6 modules (`type="module"`), Canvas 2D, WebAudio, localStorage

---

## §12 Performance Budget

- **Target FPS:** 60 desktop, 30+ mobile.
- **DPR cap:** `Math.min(devicePixelRatio, 2)` to prevent over-rendering.
- **Memory:** Single array of tubes + history stack (minimal).
- **Bundle:** Single HTML file (self-contained, no external JS deps).

---

## §13 Accessibility

- **Colorblind support:** Consider adding pattern fills in future (e.g., diagonal lines on tubes).
- **Haptics toggle:** On/off in pause menu.
- **Audio toggle:** Mute button + SFX/Music toggles.
- **Font sizing:** `clamp()` for responsive typography.

---

## §14 Balance Numbers (Single Source of Truth)

**Constants & tuning:**

```javascript
const TUBE_CAPACITY = 4;           // Liquid units per tube
const LEVELS = [20 items];         // See §5
```

**Star thresholds (computed in levelWin):**
```javascript
const stars = pours <= optimal ? 3 : pours <= ceil(optimal*1.3) ? 2 : 1;
```

**Audio frequencies (Hz):**
- Select: 600
- Pour: 880, 1100, 1400
- Illegal: 200
- Solve: 1100
- Win: 523, 659, 784, 1046 (G4, E4, G4, C5 pentatonic-ish)

**Haptic timing (ms):**
- Tap: 8–10
- Illegal: 30
- Solve: [20,10,20]
- Win: [20,30,20,30,40]

---

## §15 How-To Recipes

### Add a new level
1. In `index.html`, find `const LEVELS = [...]`.
2. Append new level object with `colors`, `tubes`, `optimal`, `name`.
3. Test: navigate to that level in browser, play to verify solvability.
4. Update `DOCS.md` §5 & §6 level table.
5. Commit + push.

### Adjust star thresholds
1. Edit `levelWin()` function, line with star computation.
2. Update `DOCS.md` §7 threshold table.
3. Test: play a level, check stars earned.
4. Commit.

### Change tube capacity
1. Change `TUBE_CAPACITY` constant.
2. Update all existing levels (careful!).
3. Update `DOCS.md` §5, §7.
4. Verify solvability of all levels.
5. Commit.

### Add new audio SFX
1. Edit `Audio.sfx(id)` object.
2. Add new case with `this.note(freq, duration, type, gain)` calls.
3. Call `Audio.sfx('newId')` from game logic where desired.
4. Update `DOCS.md` §4.
5. Commit.

### Customize colors
1. Edit level `colors` array or `--accent` in `<style>`.
2. Update level `tubes` to use new hex codes.
3. Test in browser (visual check).
4. Commit.

---

## §16 History & Updates

| Date | Version | Change |
|------|---------|--------|
| 2026-06-04 | 1.0 | Initial release: 20 levels, star system, audio, haptic, level select. |

---

## §17 Known Limitations & Future Ideas

**Current:**
- Liquid pour is instant (no smooth animation).
- No undo button in main UI (only dev console or pause menu).
- No infinite/endless mode.

**Future (post-release):**
- Smooth pour animation (liquid flows).
- Leaderboard (local top-10 all-time).
- Daily challenges.
- Prism tube mechanic (accepts any color).
- Touch-and-drag pour gesture.

---

**Last updated:** 2026-06-04 · **Players:** 1 (single-player) · **Playtime:** 15–30 min per playthrough · **Audience:** Casual, all ages.
