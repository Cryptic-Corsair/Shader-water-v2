# DESIGN_SYSTEM.md — 8-Chapter Visual Masterclass

## 1. Site Structure & Kept Components
- **Merged `/`**: Combines Home + About into an 8-chapter visual scroll exhibition (`~8500px–10000px` tall). `/about` redirects cleanly to `/#chapter-story`. `/poems` and `/poems/:slug` remain dedicated routes.
- **KEEP `<Water>` PORTRAIT:** Preserve the existing `<Water>` caustic refractive silhouette portrait component visually as-is (`minPixelRatio={1}`, `maxPixelCount={520000}`, paused `speed={0}` when off-screen). Mount it prominently in **Chapter 3**.
- **Preserve Infra:** Keep `HashRouter`, `poemsCatalog`, `poemSearch` (`MiniSearch`), `SmoothScrollProvider` (`Lenis`), and `PageTransition`. Zero Node-only imports.

## 2. Borderline Dark/Light Palette & Typography
- **Morphing Background Stages (Pure CSS layers — NO full-screen WebGL shaders):**
  - Dawn Fog (`#4C5563` ↔ `#858E9C` ↔ `#D2CCC3`)
  - Silver Water (`#3E4755` ↔ `#737F8F` ↔ `#BCC4CE`)
  - Sandstone Dusk (`#6A605A` ↔ `#A3978E` ↔ `#DFD7CD`)
  - Twilight Slate (`#343D4B` ↔ `#5F6B7E` ↔ `#A3AEBE`)
  - Balanced Mist (`#4A5362` ↔ `#818996` ↔ `#CBC5BC`)
- **Typography:** `'Syne'` (500–700, huge headlines `>= 2.75rem`), `'Cormorant'` (300–400 upright & italic for verse, subheads, quotes), `'Plus Jakarta Sans'` (400–500 for UI & bio).
- **Anti-Box Rule:** Do NOT trap every section in dark grey rounded rectangles. Let typography breathe openly against the morphing atmosphere; reserve frosted glass (`rgba(246, 243, 238, 0.68)`, `backdrop-filter: blur(22px)`) for floating navigation, active focal frames, and selective interaction drawers.
- **No Print/Prompt Leaks:** Never print prompt labels (`"Floating Collection Worlds"`, `"VOL. IV"`, `"PLATE I"`, `[10]`) on screen.

## 3. Strict GPU & Motion Contracts
- **GPU Cap:** Max 1 active WebGL canvas (`<Water>` in Ch. 3). All Canvas 2D effects MUST cap DPR at `Math.min(window.devicePixelRatio, 1.5)`, run ONLY inside viewport via `IntersectionObserver`, and pause when `document.hidden` is true or `prefers-reduced-motion: reduce`.
- **GSAP Plugins:** Register `ScrollTrigger`, `SplitText`, `Flip`, and `DrawSVGPlugin` (`import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'`). Wrap all animations in `useGSAP({ scope })`.
- **Visibility Guarantee:** NEVER leave sections starting at static CSS `opacity: 0`. Use `immediateRender: false` on `ScrollTrigger.from()` tweens.
- **Sticky Safety:** Root wrappers MUST use `overflow-x: clip` (never `overflow-x: hidden`).