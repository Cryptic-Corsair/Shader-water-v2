import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getUiCopy } from '../data/uiCopy';
import { TransitionLink } from '../components/PageTransition';
import { useSmoothScroll } from '../components/SmoothScrollProvider';
import { ShaderViewport } from '../components/shaders/ShaderViewport';
import {
  SHADER_EXHIBITS,
  SHADER_PALETTES,
  clampShaderUniform,
  formatUniformMetric,
  getShaderExhibitById,
  getShaderPaletteById,
} from '../components/shaders/shaderGalleryData';

export function ShadersPage() {
  const { lang } = useLanguage();
  const ui = getUiCopy(lang);
  const copy = ui.shaders;
  const { scrollToElement } = useSmoothScroll();

  const [activeId, setActiveId] = useState<string>(SHADER_EXHIBITS[0].id);
  const [paletteId, setPaletteId] = useState<string>(SHADER_PALETTES[0].id);
  const [speed, setSpeed] = useState<number>(SHADER_EXHIBITS[0].defaultSpeed);
  const [intensity, setIntensity] = useState<number>(
    SHADER_EXHIBITS[0].defaultIntensity
  );
  const [scale, setScale] = useState<number>(SHADER_EXHIBITS[0].defaultScale);
  const [paused, setPaused] = useState<boolean>(false);

  const activeExhibit = getShaderExhibitById(activeId);
  const activePalette = getShaderPaletteById(paletteId);

  useEffect(() => {
    document.title = `${copy.pageTitle} — ${ui.brand}`;
  }, [copy.pageTitle, ui.brand]);

  const selectShader = (id: string, scrollUp = false) => {
    const next = getShaderExhibitById(id);
    setActiveId(next.id);
    setSpeed(next.defaultSpeed);
    setIntensity(next.defaultIntensity);
    setScale(next.defaultScale);
    if (scrollUp) {
      scrollToElement('shader-observatory', -90);
    }
  };

  const resetCurrentDefaults = () => {
    setSpeed(activeExhibit.defaultSpeed);
    setIntensity(activeExhibit.defaultIntensity);
    setScale(activeExhibit.defaultScale);
    setPaletteId(SHADER_PALETTES[0].id);
    setPaused(false);
  };

  return (
    <div
      id="shaders-page-root"
      data-bg-stage="3"
      className="relative min-h-screen w-full overflow-x-clip px-5 pt-22 pb-20 text-[#F6F4EF] sm:px-8 md:px-12 md:pt-24 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[82rem]">
        {/* Editorial Header */}
        <div className="flex flex-col gap-4 border-b border-white/14 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase">
              {copy.eyebrow}
            </p>
            <h1
              lang={lang}
              className={`font-display display-luminous mt-1.5 max-w-3xl font-semibold ${
                lang === 'bn'
                  ? 'font-bn-display text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.24]'
                  : 'text-[clamp(2.0rem,3.6vw,3.2rem)] leading-[1.08] tracking-[-0.03em]'
              }`}
            >
              {copy.heading}
            </h1>
            <p className="mt-2 max-w-[60ch] text-sm leading-[1.65] text-[#F6F4EF]/78">
              {copy.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <TransitionLink
              to="/"
              className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full border border-white/22 bg-white/[0.06] px-4 py-2 text-xs font-medium text-[#F6F4EF] transition-colors hover:border-[#DFBC91]/70 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{copy.backHome}</span>
            </TransitionLink>
            <TransitionLink
              to="/poems"
              className="glass-light inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-5 py-2 text-xs font-semibold text-[#171A21] transition-colors hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <span>{copy.browseArchive}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </TransitionLink>
          </div>
        </div>

        {/* Primary Live Observatory Split Stage (8 + 4 Cols) */}
        <section
          id="shader-observatory"
          aria-label="Live shader observatory stage"
          className="mt-5 grid items-stretch gap-5 lg:grid-cols-12"
        >
          {/* Left 8 Columns: Interactive Canvas Stage */}
          <div className="relative flex min-h-[24rem] flex-col overflow-hidden rounded-[24px] border border-white/20 bg-[#181D26] shadow-[0_28px_80px_rgba(12,16,24,0.45)] sm:min-h-[28rem] lg:col-span-8 lg:min-h-[30rem]">
            <div
              data-testid="shader-stage-viewport"
              data-active-shader={activeExhibit.id}
              data-paused={paused ? 'true' : 'false'}
              className="relative flex-1 w-full cursor-crosshair"
            >
              <ShaderViewport
                engine={activeExhibit.engine}
                palette={activePalette}
                speed={speed}
                intensity={intensity}
                scale={scale}
                paused={paused}
                interactive
                unmountOffscreen
              />

              {/* Subtle Top Interaction Prompt + Legibility Scrim */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-4 px-5 pt-4 pb-8 text-[11px] font-medium text-[#F6F4EF]/92"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(16, 19, 26, 0.72) 0%, rgba(16, 19, 26, 0.28) 55%, transparent 100%)',
                }}
              >
                <span>{activeExhibit.techniqueLabel[lang]}</span>
                <span className="hidden sm:inline text-[#DFBC91]">
                  {copy.pointerHint}
                </span>
              </div>

              {/* Bottom Contrast Scrim + Paired Poetic Verse */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 p-6 md:p-8"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(18, 22, 30, 0.72) 48%, rgba(16, 19, 26, 0.92) 100%)',
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#DFBC91] tabular-nums">
                      <span>{activeExhibit.indexLabel[lang]}</span>
                      <span aria-hidden="true" className="mx-2 text-white/40">
                        ·
                      </span>
                      <span lang="bn">{activeExhibit.poemTitleBn}</span>
                    </p>
                    <p
                      lang="bn"
                      className="font-bn-verse mt-1.5 text-lg leading-[1.65] text-[#F6F4EF] md:text-xl"
                    >
                      “{activeExhibit.poemCoupleLineBn}”
                    </p>
                  </div>

                  <TransitionLink
                    to={`/poems/${activeExhibit.poemSlug}`}
                    data-testid="shader-stage-poem-link"
                    className="pointer-events-auto group inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#DFBC91] transition-colors hover:text-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <span>{copy.readPairedPoem}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </TransitionLink>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Chamber Selector & Live Uniform Controls */}
          <aside className="flex flex-col justify-between rounded-[24px] border border-white/18 bg-[#1B222D]/74 p-5 backdrop-blur-[16px] lg:col-span-4">
            <div>
              {/* 6-Shader Switcher Tabs */}
              <p className="text-[11px] font-medium tracking-[0.04em] text-[#B2C2D4] uppercase">
                {copy.selectorLabel}
              </p>
              <div
                role="tablist"
                aria-label="Select active shader study"
                className="mt-2.5 grid grid-cols-2 gap-1.5"
              >
                {SHADER_EXHIBITS.map((item) => {
                  const isSelected = item.id === activeExhibit.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      data-testid={`shader-tab-${item.id}`}
                      onClick={() => selectShader(item.id, false)}
                      className={`cursor-pointer truncate rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                        isSelected
                          ? 'bg-[#DFBC91] text-[#171A21]'
                          : 'border border-white/12 bg-white/[0.04] text-[#F6F4EF]/80 hover:border-white/24 hover:text-[#F6F4EF]'
                      }`}
                    >
                      <span className="tabular-nums opacity-75">
                        {item.indexLabel[lang]}
                      </span>{' '}
                      <span>{item.tabLabel[lang]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Description */}
              <div className="mt-4 border-t border-white/12 pt-3.5">
                <h2
                  lang={lang}
                  className="font-editorial-serif text-xl font-normal text-[#F6F4EF]"
                >
                  {activeExhibit.title[lang]}
                </h2>
                <p className="mt-1.5 text-xs leading-[1.6] text-[#F6F4EF]/76">
                  {activeExhibit.summary[lang]}
                </p>
              </div>

              {/* Palette Presets */}
              <div className="mt-3.5 border-t border-white/12 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#B2C2D4]">
                    {copy.paletteLabel}
                  </span>
                  <span className="text-[#DFBC91]">
                    {activePalette.name[lang]}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2.5">
                  {SHADER_PALETTES.map((p) => {
                    const isActive = p.id === activePalette.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPaletteId(p.id)}
                        aria-label={p.name[lang]}
                        aria-pressed={isActive}
                        data-testid={`palette-swatch-${p.id}`}
                        className={`h-7 w-7 cursor-pointer rounded-full border transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                          isActive
                            ? 'scale-110 border-[#F6F4EF] ring-2 ring-[#DFBC91]/70'
                            : 'border-white/25'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${p.colorA} 0%, ${p.colorB} 55%, ${p.accent} 100%)`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Real-Time Uniform Sliders */}
              <div className="mt-3.5 space-y-2.5 border-t border-white/12 pt-3">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="shader-speed-range" className="text-[#F6F4EF]/85">
                      {copy.speedLabel}
                    </label>
                    <span
                      data-testid="shader-speed-value"
                      className="font-mono text-[#DFBC91] tabular-nums"
                    >
                      {formatUniformMetric(speed, 'x', lang)}
                    </span>
                  </div>
                  <input
                    id="shader-speed-range"
                    type="range"
                    min={0.2}
                    max={2.0}
                    step={0.1}
                    value={speed}
                    onChange={(e) =>
                      setSpeed(
                        clampShaderUniform(Number(e.target.value), 0.2, 2.0, 1.0)
                      )
                    }
                    className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#DFBC91]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="shader-intensity-range" className="text-[#F6F4EF]/85">
                      {copy.intensityLabel}
                    </label>
                    <span
                      data-testid="shader-intensity-value"
                      className="font-mono text-[#DFBC91] tabular-nums"
                    >
                      {formatUniformMetric(intensity, '%', lang)}
                    </span>
                  </div>
                  <input
                    id="shader-intensity-range"
                    type="range"
                    min={0.2}
                    max={1.0}
                    step={0.05}
                    value={intensity}
                    onChange={(e) =>
                      setIntensity(
                        clampShaderUniform(Number(e.target.value), 0.2, 1.0, 0.7)
                      )
                    }
                    className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#DFBC91]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="shader-scale-range" className="text-[#F6F4EF]/85">
                      {copy.scaleLabel}
                    </label>
                    <span
                      data-testid="shader-scale-value"
                      className="font-mono text-[#DFBC91] tabular-nums"
                    >
                      {formatUniformMetric(scale, 'x', lang)}
                    </span>
                  </div>
                  <input
                    id="shader-scale-range"
                    type="range"
                    min={0.7}
                    max={1.8}
                    step={0.05}
                    value={scale}
                    onChange={(e) =>
                      setScale(
                        clampShaderUniform(Number(e.target.value), 0.7, 1.8, 1.0)
                      )
                    }
                    className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#DFBC91]"
                  />
                </div>
              </div>
            </div>

            {/* Playback & Reset Actions */}
            <div className="mt-4 flex items-center gap-2.5 border-t border-white/12 pt-3.5">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                data-testid="shader-pause-button"
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/24 bg-white/[0.06] px-4 py-2 text-xs font-medium text-[#F6F4EF] transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                {paused ? (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copy.resumeLabel}</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{copy.pauseLabel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetCurrentDefaults}
                data-testid="shader-reset-button"
                aria-label={copy.resetLabel}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-white/18 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-[#F6F4EF]/80 transition-colors hover:border-white/35 hover:text-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.resetLabel}</span>
              </button>
            </div>
          </aside>
        </section>

        {/* All Six Shaders Live 3-Column Exhibition Grid */}
        <section
          aria-label="Complete shader studies gallery"
          className="mt-16 border-t border-white/14 pt-10"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.04em] text-[#B2C2D4] uppercase">
                {copy.gridEyebrow}
              </p>
              <h2 className="font-display display-luminous mt-2 text-[clamp(1.8rem,3vw,2.6rem)] font-semibold">
                {copy.gridHeading}
              </h2>
            </div>
            <p className="text-xs text-[#F6F4EF]/68">{copy.gridHint}</p>
          </div>

          <div className="mt-8 grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SHADER_EXHIBITS.map((item) => {
              const isCurrent = item.id === activeExhibit.id;
              return (
                <article
                  key={item.id}
                  data-testid={`shader-card-${item.id}`}
                  className={`flex flex-col overflow-hidden rounded-[22px] border transition-colors duration-200 ${
                    isCurrent
                      ? 'border-[#DFBC91]/70 bg-[#1F2735]/80'
                      : 'border-white/14 bg-[#19202B]/65 hover:border-white/30'
                  }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/12">
                    <ShaderViewport
                      engine={item.engine}
                      palette={activePalette}
                      speed={item.defaultSpeed}
                      intensity={item.defaultIntensity}
                      scale={item.defaultScale}
                      paused={false}
                      interactive
                      unmountOffscreen
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <p className="text-[11px] font-medium text-[#DFBC91] tabular-nums">
                        <span>{item.indexLabel[lang]}</span>
                        <span aria-hidden="true" className="mx-2 text-white/35">
                          ·
                        </span>
                        <span className="text-[#B2C2D4]">
                          {item.techniqueLabel[lang]}
                        </span>
                      </p>

                      <h3
                        lang={lang}
                        className="font-editorial-serif mt-2 text-xl font-normal text-[#F6F4EF]"
                      >
                        {item.title[lang]}
                      </h3>

                      <p className="mt-2 text-xs leading-[1.7] text-[#F6F4EF]/75">
                        {item.summary[lang]}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/12 pt-4">
                      <span
                        lang="bn"
                        className="truncate text-xs text-[#F6F4EF]/65"
                      >
                        {item.poemTitleBn}
                      </span>

                      <button
                        type="button"
                        onClick={() => selectShader(item.id, true)}
                        data-testid={`shader-card-inspect-${item.id}`}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-white/22 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-[#DFBC91] transition-colors hover:border-[#DFBC91] hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                      >
                        <span>
                          {isCurrent ? copy.activeOnStage : copy.inspectShader}
                        </span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
