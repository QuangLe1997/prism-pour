# 🌈 PRISM POUR

**Water Sort Puzzle** · A meditative puzzle game where you tap & pour colored liquids into matching tubes. Fewer pours = more stars.

> Part of **[QUANG ARCADE](https://quangle1997.github.io/arcade/)** — a curated collection of neon arcade web games.

## Play Now

🎮 **[Play PRISM POUR](https://quangle1997.github.io/prism-pour/)**

## Game Overview

- **20 handcrafted levels** ranging from relaxing tutorials to brain-bending challenges.
- **Star ratings** — solve each level in fewer pours for 3-star clears.
- **Smooth animations & satisfying sound design** — meditative gameplay with instant feedback.
- **Undo & Restart** — no penalty, just solve it your way.
- **Progressive difficulty** — gradually introduce complexity (more colors, tubes, stacks).

## How to Play

1. **Tap a tube** to select it (it glows teal).
2. **Tap another tube** to pour the top liquid into it.
3. **Rules:**
   - Only pour onto an empty tube or one with the same color on top.
   - A tube is solved when it's one solid color, completely full.
   - Clear all tubes to win the level.
4. **Tips:**
   - Fewer pours = more stars (optimize your solution!).
   - Use "Undo" to revert a move.
   - Use "Restart Level" to reset if you get stuck.

## Features

- ✅ 20 levels with increasing difficulty
- ✅ Star-based progression system
- ✅ WebAudio synth (no external audio files)
- ✅ Haptic feedback (mobile)
- ✅ localStorage persistence
- ✅ Level select screen
- ✅ Pause menu with settings (music/SFX/haptics)
- ✅ Mobile-first portrait layout (optimized for 390×844)
- ✅ Single `index.html` — zero build, zero dependencies

## Technical

- **Tech:** Pure vanilla HTML5 + Canvas 2D + WebAudio + localStorage
- **Build:** None — single self-contained file
- **Deploy:** GitHub Pages (automatic from `main` branch)
- **Browser support:** All modern browsers (Chrome, Firefox, Safari, Edge)

## Documentation

- **[DOCS.md](DOCS.md)** — Complete game design, mechanics, levels, balance, how-to recipes.

## Development

Clone or pull this repo:
```bash
git clone https://github.com/QuangLe1997/prism-pour.git
cd prism-pour
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

No build step needed. Edit `index.html`, reload, and play.

### Dev helpers (console)
```javascript
_S.mode              // Current mode (menu, playing, paused, levelcomplete)
_startLevel(2)       // Start level 3 (0-indexed)
_S.tubes             // Current tube state
window._S.pours      // Current pour count
```

## Credits

Built with ♥ using Claude Code · Part of the [QUANG ARCADE](https://github.com/QuangLe1997/arcade) game family.

**License:** MIT

---

**Feedback?** Report issues or ideas at https://github.com/QuangLe1997/prism-pour/issues
