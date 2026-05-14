# Legacy Code Archive

This directory contains legacy code from the original p5.js implementation that has been refactored into the modern React application.

## Files

### `sketch.js` (Original p5.js implementation)

**Status:** ❌ DEPRECATED - Not used in current application

**Why it exists:**
- Original p5.js sketch-based implementation
- Maintained for reference purposes during React migration
- Shows how the app was structured before React refactoring

**What replaced it:**
- `src/utils/useP5Sketch.js` - React hook for p5 integration
- `src/components/P5Sketch.jsx` - React component wrapper
- Modern event handling via React state instead of p5 global functions

**Migration notes:**
- Global variables (BPM, lcm, backgroundColor, etc.) → Moved to `src/config.js`
- p5 setup/draw functions → Moved to `useP5Sketch` hook
- Event listeners → Moved to React onClick handlers and useEffect hooks
- Direct DOM manipulation → Moved to React state management
- Inline CSS generation → Moved to separate stylesheets

**Key patterns that were refactored:**

| Original (p5.js) | Modern (React) |
|---|---|
| `let BPM = 120` | `const BPM = 120` in config.js |
| `window.onload` + `addEventListener` | `useEffect` hooks |
| `document.querySelector().style` | React state + CSS |
| `createSelect()` | React components |
| Global `pizza`, `pizza2` variables | React refs and state |
| Direct canvas manipulation | p5 via useP5Sketch hook |

**If you need to:**
- Reference old implementation patterns: See this file
- Migrate more p5.js sketches: Use `useP5Sketch.js` as a template
- Remove this code: Delete the `legacy/` directory

---

### `control_text.js` (Original p5.js control label rendering)

**Status:** ❌ DEPRECATED - Not used in current application

**Why it exists:**
- Rendered slider value labels (slices, teeth, rotation, step ratio) directly onto the p5 canvas using `p.text()`
- Was imported in `App.jsx` as a side-effect import with no active callers; `showControlText` was commented out in `draw.js`

**What replaced it:**
- Will be replaced by SVG `<text>` elements rendered by the React/D3 pizza face component

---

**Last Updated:** May 14, 2026
