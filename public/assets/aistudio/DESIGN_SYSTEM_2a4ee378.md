# DESIGN_SYSTEM.md — Liminal Twilight & Frosted Atmospheric Motion

## 1. Mission & Preservation Contract
You are redesigning the visual skin, typography, shaders, and UI components of an existing React + Vite + TypeScript poetry website.
- **KEEP INTACT:** All existing multi-page routing (`HashRouter`), `poemsCatalog`, `poemSearch` (`MiniSearch`), lazy poem loading, `SmoothScrollProvider` (`Lenis` synced to `gsap.ticker`), `ScrollTrigger`, and `useGSAP` infrastructure.
- **NEVER BREAK:** Do not replace `HashRouter`, do not import Node-only libraries (`fs`, `gray-matter`, `Buffer`), and never output `// TODO` stubs.

---

## 2. Aesthetic Direction: "Liminal Twilight & Frosted Motion"
- **Theme Luminance:** Borderline between dark and light (45%–70% atmospheric mid-tones). NEVER use pitch black (`#000000`, `#0D0C0A`) and NEVER use flat sterile white (`#FFFFFF`).
- **Palette Tokens (`tokens.css`):**
  - Twilight Base Atmosphere: `#596270` blending across `#363E4B` (dusk slate), `#677180` (pewter mist), `#C8C0B6` (warm cloud pearl), and `#8E827B` (muted sandstone).
  - **Frosted Light Glass (Primary readable cards/controls):** `rgba(245, 242, 237, 0.66)`, `backdrop-filter: blur(26px) saturate(118%)`, `border: 1px solid rgba(255, 255, 255, 0.38)`, ink `#171A21`.
  - **Frosted Dusk Glass (Atmospheric overlay cards/footer):** `rgba(34, 40, 50, 0.46)`, `backdrop-filter: blur(26px)`, `border: 1px solid rgba(255, 255, 255, 0.20)`, pearl ink `#F6F4EF`.
  - **Luminous Display Ink (Directly over deeper slate backdrop):** `#F6F4EF` with subtle readability shadow (`0 1px 24px rgba(24, 28, 36, 0.25)`).
  - **Restrained Accents:** Dawn amber `#DFBC91` and cool mist `#B2C2D4`.
- **Geometry:** Soft organic radii (`24px`–`32px` cards, `999px` capsule nav/buttons/pills). NO `0px` square spreadsheet tables or rigid `1px` box cages.

---

## 3. Typography Rules (Zero Print/Typewriter Styling)
- **Google Fonts ONLY:** `'Syne'` (500, 600, 700), `'Cormorant'` (300, 400, italic), `'Plus Jakarta Sans'` (400, 500, 600).
- **Hierarchy:**
  - `'Syne'`: Sculptural modern headlines & page titles (`letter-spacing: -0.025em`).
  - `'Cormorant'` (light/italic): Poetic stanzas, kinetic verse lines, and opening lines (`line-height: 1.8` in reading rooms).
  - `'Plus Jakarta Sans'`: Clean contemporary UI labels, search bar, bio prose, and buttons.

---

## 4. Strictly Forbidden ("Print" & "AI Slop" Ban List)
- **Kill ALL Print Tropes:** NO `"VOL. IV"`, `"NO. 001"`, `"PLATE I"`, `"PRESS DISPATCH"`, `"PRINT LEDGER"`, `"4:5 SILVER PLATE"`, `IBM Plex Mono` stamps, bracketed counts (`[10]`), or broadsheet table rows.
- **Kill ALL SaaS Slop:** NO neon purple/cyan dark-mode glows, NO heavy `box-shadow` cards, NO 5-star review blocks, NO `bounce` or `elastic` eases, and NO cheesy AI poetry clichés ("tapestry", "whispers of the soul", "echoes of eternity").

---

## 5. Verified Shader & WebGL Contracts (`@paper-design/shaders-react`)
Use ONLY verified props—never invent GLSL uniforms:
- **`MeshGradient`:** `colors`, `distortion`, `swirl`, `grainMixer`, `grainOverlay`, `speed`
- **`GodRays`:** `colors`, `colorBack`, `colorBloom`, `bloom`, `intensity`, `density`, `spotty`, `midSize`, `midIntensity`, `speed`, `offsetX`, `offsetY`
- **`LiquidMetal`:** `colorBack`, `colorTint`, `shape` (`"metaballs" | "circle"`), `repetition`, `softness`, `shiftRed`, `shiftBlue`, `distortion`, `contour`, `angle`, `speed`, `scale`
- **`Water`:** `image`, `colorBack`, `colorHighlight`, `highlights`, `layering`, `edges`, `waves`, `caustic`, `size`, `speed`, `scale`

**WebGL Safety & Performance Rules:**
1. Wrap every shader in `ShaderErrorBoundary` (CSS twilight gradient fallback) and an `IntersectionObserver` setting `speed={0}` when off-screen or when `prefers-reduced-motion: reduce` is enabled.
2. **WebGL Canvas Cap:** Keep max **2–3 active WebGL canvases** per route so browsers never drop WebGL contexts. Use rich **animated CSS multi-stop gradients + frosted glass** inside collection/archive cards instead of mounting extra WebGL canvases per card.
3. Add smooth CSS edge-feather masks (`mask-image`) so background shaders blend into surrounding surfaces with zero hard rectangular seams.
4. For `<Water>` on `/about`, supply an embedded CORS-safe warm twilight portrait SVG `data:image/svg+xml` URI by default (zero external third-party CORS errors).

---

## 6. GSAP, Scroll & Layout Safety Contracts
1. **Motion Physics:** Use weighted cinematic eases ONLY (`power3.out`, `power4.out`, `expo.out`). Always wrap in `useGSAP(() => { ... }, { scope: containerRef })`.
2. **No Invisible Stuck Sections:** NEVER leave scroll-triggered sections starting at static CSS `opacity: 0`. Use `immediateRender: false` on GSAP `ScrollTrigger` `.from()` tweens so fast-scrolled sections always render reliably.
3. **SplitText v3.13+:** Always wait for `document.fonts.ready` and use `SplitText.create(el, { type: 'words, lines', mask: 'lines', autoSplit: true, onSplit(self) { ... } })`.
4. **GSAP Flip (`/poems`):** Run `Flip.getState('.poem-archive-item')` inside `contextSafe()`, update React state, and animate via `Flip.from(state, { duration: 0.55, ease: 'power3.out', stagger: 0.02, absolute: true, nested: true })` inside `requestAnimationFrame()`.
5. **Sticky Preservation:** Root layout containers (`html`, `body`, app wrappers) MUST use `overflow-x: clip`—NEVER `overflow-x: hidden`—so `position: sticky` works on the Homepage mood preview and PoemDetail marginalia.
6. **Cursor & Transition Restraint:** `CustomCursor` must be an unobtrusive `8px` soft dot (`mix-blend-mode: difference`) that softens/dims over nav text rather than obscuring letters. `PageTransition` must sweep with a frosted twilight mist veil (not black).