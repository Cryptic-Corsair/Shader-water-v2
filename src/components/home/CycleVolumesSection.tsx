import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import cycleLongingDawnImg from '../../assets/images/cycle_longing_dawn_1794822855506.jpg';
import cycleMasksRealityImg from '../../assets/images/cycle_masks_reality_1794822854064.jpg';
import cycleTwilightSkyImg from '../../assets/images/cycle_twilight_sky_1794822853739.jpg';
import { useLanguage } from '../../context/LanguageContext';
import { formatReadingTime, type CycleId } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import { prefersReducedMotion, useMagnetic } from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { wrapSlideIndex } from './collectionsCarouselData';
import { buildCycleVolumes } from './cycleVolumesData';

const VOLUME_IMAGES: Record<CycleId, { src: string; alt: string }> = {
  'twilight-sky': {
    src: cycleTwilightSkyImg,
    alt: 'Twilight clouds and crescent moon glowing over calm monsoon water',
  },
  'masks-reality': {
    src: cycleMasksRealityImg,
    alt: 'Matte ceramic half-mask resting beside an open poetry notebook on sandstone',
  },
  'longing-dawn': {
    src: cycleLongingDawnImg,
    alt: 'Morning dew droplets on grass beside a handmade clay teacup at dawn',
  },
};

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

export function CycleVolumesSection() {
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const openCycleRef = useRef<HTMLAnchorElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).carousel;

  const volumes = useMemo(() => buildCycleVolumes(lang), [lang]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const reducedMotion = prefersReducedMotion();

  useMagnetic(prevBtnRef, 0.2);
  useMagnetic(nextBtnRef, 0.2);
  useMagnetic(openCycleRef, 0.2);

  const activeVolume = volumes[activeIndex] ?? volumes[0];
  const activeArtwork = VOLUME_IMAGES[activeVolume.id];

  const goToIndex = (nextIdx: number) => {
    setActiveIndex(wrapSlideIndex(nextIdx, volumes.length));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToIndex(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToIndex(activeIndex + 1);
    }
  };

  const amp = activeVolume.waveAmplitude;
  const phase = activeVolume.wavePhase;
  const waveY = 82 + Math.sin(phase) * amp * 0.4;

  return (
    <section
      id="chapter-cycles"
      data-bg-stage="2"
      data-snap-station
      aria-label="Three poetic volumes showcase"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative w-full overflow-x-clip py-24 text-[#F6F4EF] focus:outline-none md:py-32"
    >
      <div className="mx-auto max-w-[82rem] px-6 md:px-10">
        {/* Section Header + Segmented Volume Switcher */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.04em] text-[#DFD7CD] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.2rem,4.4vw,3.75rem)] leading-[1.18] font-semibold">
              {copy.heading}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Select poetic volume"
              className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/16 bg-[#1C222D]/55 p-1 backdrop-blur-[12px]"
            >
              {volumes.map((vol, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={vol.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    data-testid={`volume-tab-${vol.id}`}
                    onClick={() => goToIndex(idx)}
                    className={`cursor-pointer whitespace-nowrap shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                      isSelected
                        ? 'bg-[#DFBC91] text-[#171A21]'
                        : 'text-[#F6F4EF]/78 hover:text-[#F6F4EF]'
                    }`}
                  >
                    <span className="tabular-nums">{vol.indexLabel}</span>
                    <span aria-hidden="true" className="mx-1.5 opacity-60">
                      ·
                    </span>
                    <span>{vol.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                ref={prevBtnRef}
                type="button"
                onClick={() => goToIndex(activeIndex - 1)}
                aria-label={copy.prevAria}
                data-testid="volume-prev-button"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/22 bg-white/[0.06] text-[#F6F4EF] transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                ref={nextBtnRef}
                type="button"
                onClick={() => goToIndex(activeIndex + 1)}
                aria-label={copy.nextAria}
                data-testid="volume-next-button"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/22 bg-white/[0.06] text-[#F6F4EF] transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Balanced Monograph Spread */}
        <div
          data-testid="volume-monograph-stage"
          data-active-volume={activeVolume.id}
          className="mt-10 overflow-hidden rounded-[28px] border border-white/20 bg-[#1B222D]/64 shadow-[0_28px_80px_rgba(14,18,26,0.38)] backdrop-blur-[16px] md:mt-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeVolume.id}-${lang}`}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.36, ease: CONTEMPLATIVE_EASE }}
              className="grid items-stretch lg:grid-cols-12"
            >
              {/* Left (5 cols): Bespoke Atmospheric Photograph + Tidal Wave Overlay */}
              <div className="relative min-h-[19rem] overflow-hidden border-b border-white/14 lg:col-span-5 lg:min-h-[31rem] lg:border-r lg:border-b-0">
                {failedImages[activeVolume.id] ? (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(155deg, ${activeVolume.horizonColors[0]} 0%, ${activeVolume.horizonColors[1]} 58%, ${activeVolume.horizonColors[2]}77 100%)`,
                    }}
                  />
                ) : (
                  <img
                    src={activeArtwork.src}
                    alt={activeArtwork.alt}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({
                        ...prev,
                        [activeVolume.id]: true,
                      }))
                    }
                    className="h-full w-full object-cover object-center lg:absolute lg:inset-0"
                  />
                )}

                {/* Scrim & Animated Horizon Wave Overlay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(20, 24, 32, 0.25) 0%, rgba(20, 24, 32, 0.14) 45%, rgba(18, 22, 30, 0.85) 100%)',
                  }}
                />

                <svg
                  aria-hidden="true"
                  viewBox="0 0 600 140"
                  preserveAspectRatio="none"
                  fill="none"
                  className="pointer-events-none absolute inset-x-0 bottom-14 h-24 w-full opacity-70"
                >
                  <path
                    d={`M 0 ${waveY} Q 150 ${waveY - amp}, 300 ${waveY} T 600 ${waveY}`}
                    stroke="#DFBC91"
                    strokeOpacity="0.65"
                    strokeWidth="1.2"
                  />
                  <path
                    d={`M 0 ${waveY + 18} Q 150 ${waveY + 18 + amp * 0.75}, 300 ${waveY + 18} T 600 ${waveY + 18}`}
                    stroke="#F6F4EF"
                    strokeOpacity="0.34"
                    strokeWidth="0.9"
                  />
                </svg>

                <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
                  <p className="text-xs font-medium text-[#DFBC91] tabular-nums">
                    <span>
                      {copy.volumeLabel} {activeVolume.indexLabel}
                    </span>
                    <span aria-hidden="true" className="mx-2 text-white/40">
                      ·
                    </span>
                    <span className="text-[#F6F4EF]/85">
                      {activeVolume.countLabel}
                    </span>
                    <span aria-hidden="true" className="mx-2 text-white/40">
                      ·
                    </span>
                    <span className="text-[#F6F4EF]/75">
                      {activeVolume.years}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right (7 cols): Editorial Monograph Details & Interactive Volume Contents */}
              <div className="flex flex-col justify-between p-6 md:p-10 lg:col-span-7">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-4">
                    <h3
                      lang={lang}
                      className="font-editorial-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.25] font-normal text-[#F6F4EF]"
                    >
                      {activeVolume.name}
                    </h3>
                  </div>

                  <p className="mt-3 max-w-[56ch] text-sm leading-[1.8] text-[#F6F4EF]/80 md:text-base">
                    {activeVolume.tagline}
                  </p>

                  {/* Open Broadsheet Pull Quote (1px top/bottom rules, zero thick left border) */}
                  <blockquote
                    lang="bn"
                    className="font-bn-verse my-7 border-y border-white/14 py-5 text-[clamp(1.18rem,1.85vw,1.5rem)] leading-[1.8] text-[#DFBC91]"
                  >
                    <span className="block">“{activeVolume.couplet[0]}</span>
                    <span className="block">{activeVolume.couplet[1]}”</span>
                  </blockquote>

                  {/* Interactive Table of Contents for this Volume */}
                  <div>
                    <p className="mb-3 text-xs font-medium text-[#B2C2D4] uppercase">
                      {copy.contentsLabel}
                    </p>
                    <ul className="divide-y divide-white/10 border-t border-white/10">
                      {activeVolume.poems.map((poem) => (
                        <li key={poem.id}>
                          <TransitionLink
                            to={`/poems/${poem.slug}`}
                            className="group flex items-center justify-between gap-4 py-2.5 text-sm transition-colors hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                          >
                            <span
                              lang="bn"
                              className="font-bn-display truncate font-medium text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91]"
                            >
                              {poem.title}
                            </span>
                            <span className="flex shrink-0 items-center gap-2 text-xs text-[#F6F4EF]/65 tabular-nums">
                              <span lang="bn">{poem.dateDisplay}</span>
                              <span aria-hidden="true">·</span>
                              <span>
                                {formatReadingTime(poem.readingSeconds, lang)}
                              </span>
                              <ArrowUpRight
                                className="h-3.5 w-3.5 text-[#DFBC91] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                aria-hidden="true"
                              />
                            </span>
                          </TransitionLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/14 pt-5">
                  <span className="text-xs text-[#F6F4EF]/68">
                    {activeVolume.years}
                  </span>

                  <TransitionLink
                    ref={openCycleRef}
                    to={`/poems?collection=${encodeURIComponent(activeVolume.id)}`}
                    data-testid="open-active-volume-cta"
                    className="glass-light inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold text-[#171A21] shadow-[0_10px_28px_rgba(14,18,26,0.25)] transition-all duration-200 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <span>{copy.openCycle}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </TransitionLink>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
