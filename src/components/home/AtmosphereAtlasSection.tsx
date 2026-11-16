import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Compass, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAtmosphere } from '../../context/AtmosphereContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatReadingTime, getCycleLabel } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import {
  ScrollTrigger,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { SectionShaderBackdrop } from '../shaders/SectionShaderBackdrop';
import { AtlasAtmosphereCanvas } from './AtlasAtmosphereCanvas';
import {
  ATMOSPHERE_REALMS,
  getRealmLocalizedFields,
  mapProgressToRealmIndex,
  resolveRealmPoemMeta,
} from './atmosphereAtlasData';

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

export function AtmosphereAtlasSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).story;
  const { setAtlasOverride } = useAtmosphere();

  const [activeIndex, setActiveIndex] = useState(0);
  const [syncMode, setSyncMode] = useState<'scroll' | 'manual'>('scroll');
  const [isInViewport, setIsInViewport] = useState(false);

  const syncModeRef = useRef<'scroll' | 'manual'>(syncMode);
  syncModeRef.current = syncMode;

  const reducedMotion = prefersReducedMotion();
  useMagnetic(ctaRef, 0.2);

  const activeRealm = ATMOSPHERE_REALMS[activeIndex] ?? ATMOSPHERE_REALMS[0];
  const realmFields = useMemo(
    () => getRealmLocalizedFields(activeRealm, lang),
    [activeRealm, lang]
  );
  const linkedPoem = useMemo(
    () => resolveRealmPoemMeta(activeRealm),
    [activeRealm]
  );

  // Track section viewport presence cleanly and drive scroll-synced realm shifts
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 62%',
        end: 'bottom 38%',
        onEnter: () => setIsInViewport(true),
        onEnterBack: () => setIsInViewport(true),
        onLeave: () => setIsInViewport(false),
        onLeaveBack: () => {
          setIsInViewport(false);
          setSyncMode('scroll');
        },
        onUpdate: (self) => {
          if (syncModeRef.current === 'scroll') {
            const nextIdx = mapProgressToRealmIndex(
              self.progress,
              ATMOSPHERE_REALMS.length
            );
            setActiveIndex(nextIdx);
          }
        },
      });

      ScrollTrigger.refresh();
      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef, dependencies: [], revertOnUpdate: false }
  );

  // Sync active atmosphere tint to global backdrop ONLY while section is active in viewport
  useEffect(() => {
    if (!isInViewport) {
      setAtlasOverride(null);
      return;
    }

    setAtlasOverride({
      realmId: activeRealm.id,
      realmName: realmFields.title,
      backgroundImage: activeRealm.palette.backdropGradient,
      veilTint: activeRealm.palette.veilTint,
      waterColorBack: activeRealm.palette.waterColorBack,
      waterColorHighlight: activeRealm.palette.waterColorHighlight,
      accentHex: activeRealm.palette.accentHex,
    });
  }, [isInViewport, activeRealm, realmFields.title, setAtlasOverride]);

  // Clear override cleanly on unmount
  useEffect(() => () => setAtlasOverride(null), [setAtlasOverride]);

  const handleSelectRealm = (idx: number) => {
    setSyncMode('manual');
    setActiveIndex(idx);
    setIsInViewport(true);
  };

  const handleResumeScrollSync = () => {
    setSyncMode('scroll');
  };

  // Celestial arc geometry driven by active realm's sun/moon progress
  const orbAngle = Math.PI * (0.14 + activeRealm.palette.orbProgress * 0.72);
  const orbCx = 180 - Math.cos(orbAngle) * 132;
  const orbCy = 152 - Math.sin(orbAngle) * 112;

  return (
    <section
      id="chapter-story"
      ref={sectionRef}
      data-snap-station
      data-active-realm={activeRealm.id}
      data-sync-mode={syncMode}
      aria-label="Interactive atmosphere atlas"
      className="relative w-full overflow-x-clip py-24 text-[#F6F4EF] md:py-36"
    >
      {/* Edge-Feathered Local Atmospheric Aura + Domain-Warped Silk Shader + Dynamic Canvas Mist */}
      <div
        aria-hidden="true"
        className="shader-feather-y pointer-events-none absolute inset-0 z-0"
      >
        <SectionShaderBackdrop
          sectionKey="atlas"
          feather={false}
          paletteOverride={{
            id: activeRealm.id,
            name: { bn: activeRealm.titleBn, en: activeRealm.titleEn },
            colorA: '#161C26',
            colorB: activeRealm.palette.waterColorBack,
            colorC: activeRealm.palette.mistHex,
            accent: activeRealm.palette.accentHex,
          }}
        />
        {ATMOSPHERE_REALMS.map((realm, idx) => (
          <div
            key={realm.id}
            className="absolute inset-0"
            style={{
              backgroundImage: realm.palette.veilTint,
              opacity: idx === activeIndex ? 1 : 0,
              transition: reducedMotion
                ? 'none'
                : 'opacity 850ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        ))}
        <AtlasAtmosphereCanvas
          accentHex={activeRealm.palette.accentHex}
          mistHex={activeRealm.palette.mistHex}
          realmIndex={activeIndex}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[82rem] px-6 md:px-10">
        {/* Top Header + Scroll/Manual Mode Control */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p
              className="text-xs font-medium tracking-[0.04em] uppercase transition-colors duration-500"
              style={{ color: activeRealm.palette.accentHex }}
            >
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.2rem,4.3vw,3.6rem)] leading-[1.18] font-semibold">
              {copy.heading}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-[1.8] text-[#F6F4EF]/80 md:text-base">
              {copy.subheading}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {syncMode === 'manual' ? (
              <button
                type="button"
                onClick={handleResumeScrollSync}
                data-testid="atlas-resume-scroll"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-full border border-white/24 bg-white/[0.08] px-4 py-2 text-xs font-medium text-[#F6F4EF] backdrop-blur-[12px] transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.resumeScroll}</span>
              </button>
            ) : (
              <div
                data-testid="atlas-scroll-sync-status"
                className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-[#F6F4EF]/78"
              >
                <Compass
                  className="h-3.5 w-3.5"
                  style={{ color: activeRealm.palette.accentHex }}
                  aria-hidden="true"
                />
                <span>{copy.followScroll}</span>
              </div>
            )}
          </div>
        </div>

        {/* 12-Col Interactive Atmosphere Atlas Stage */}
        <div className="mt-10 grid items-stretch gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Rail (5 cols): Clickable Mood Realms */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="mb-3 text-xs font-medium text-[#F6F4EF]/70 uppercase">
                {copy.realmsLabel}
              </p>

              <div
                role="tablist"
                aria-label={copy.realmsLabel}
                className="space-y-2.5"
              >
                {ATMOSPHERE_REALMS.map((realm, idx) => {
                  const isActive = idx === activeIndex;
                  const fields = getRealmLocalizedFields(realm, lang);

                  return (
                    <button
                      key={realm.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      data-testid={`atlas-realm-${realm.id}`}
                      onClick={() => handleSelectRealm(idx)}
                      className={`group flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                        isActive
                          ? 'border-white/32 bg-[#141923]/76 shadow-[0_14px_34px_rgba(10,14,22,0.34)] backdrop-blur-[16px]'
                          : 'border-white/12 bg-[#141923]/34 hover:border-white/24 hover:bg-[#141923]/56'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2.5">
                          <span
                            className="text-xs font-semibold tabular-nums transition-colors"
                            style={{
                              color: isActive
                                ? realm.palette.accentHex
                                : 'rgba(246, 244, 239, 0.48)',
                            }}
                          >
                            {fields.indexLabel}
                          </span>
                          <span
                            lang={lang}
                            className={`font-bn-display truncate text-base font-semibold md:text-lg ${
                              isActive ? 'text-[#F6F4EF]' : 'text-[#F6F4EF]/78'
                            }`}
                          >
                            {fields.title}
                          </span>
                        </div>
                        <p className="mt-1 pl-6 text-xs text-[#F6F4EF]/64">
                          {fields.season}
                        </p>
                      </div>

                      {/* Subtle Chromatic Swatch Emblem (Static Palette Indicator, not pulsing dot) */}
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 rounded-full border border-white/25 transition-transform duration-200 group-hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, ${realm.palette.swatchPair[0]} 0%, ${realm.palette.swatchPair[1]} 100%)`,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-xs text-[#F6F4EF]/68">
              {copy.progressLabel} · {realmFields.season}
            </p>
          </div>

          {/* Right Stage (7 cols): Shifting Illuminated Horizon & Verse Sanctuary */}
          <div className="lg:col-span-7">
            <div
              data-testid="atlas-illuminated-stage"
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/20 p-7 shadow-[0_28px_80px_rgba(10,14,22,0.4)] backdrop-blur-[18px] transition-colors duration-700 md:p-10"
              style={{
                background: `radial-gradient(88% 76% at 86% 18%, ${activeRealm.palette.accentHex}26 0%, transparent 62%), rgba(18, 23, 32, 0.72)`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeRealm.id}-${lang}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: CONTEMPLATIVE_EASE }}
                  className="flex h-full flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Season Metadata + Dynamic Celestial Horizon Dial */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className="text-xs font-medium"
                          style={{ color: activeRealm.palette.accentHex }}
                        >
                          <span>{getCycleLabel(activeRealm.cycleId, lang)}</span>
                          <span aria-hidden="true" className="mx-2 text-white/35">
                            ·
                          </span>
                          <span className="text-[#F6F4EF]/78">
                            {realmFields.season}
                          </span>
                        </p>

                        <h3
                          lang={lang}
                          className="font-bn-display mt-3 text-[clamp(1.75rem,2.9vw,2.45rem)] leading-[1.3] font-semibold text-[#F6F4EF]"
                        >
                          {realmFields.title}
                        </h3>
                      </div>

                      {/* Horizon Celestial Arc SVG */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 360 176"
                        fill="none"
                        className="hidden h-20 w-40 shrink-0 sm:block"
                      >
                        <path
                          d="M 28 152 A 152 128 0 0 1 332 152"
                          stroke="rgba(246, 244, 239, 0.2)"
                          strokeWidth="1"
                          strokeDasharray="3 6"
                        />
                        <line
                          x1="14"
                          y1="152"
                          x2="346"
                          y2="152"
                          stroke={activeRealm.palette.accentHex}
                          strokeOpacity="0.45"
                          strokeWidth="1"
                        />
                        <circle
                          cx={orbCx}
                          cy={orbCy}
                          r="13"
                          fill={activeRealm.palette.accentHex}
                          fillOpacity="0.22"
                        />
                        <circle
                          cx={orbCx}
                          cy={orbCy}
                          r="5"
                          fill={activeRealm.palette.accentHex}
                        />
                      </svg>
                    </div>

                    <p className="mt-3 max-w-[58ch] text-sm leading-[1.82] text-[#F6F4EF]/82 md:text-base">
                      {realmFields.description}
                    </p>

                    {/* Verbatim Bangla Stanza Window */}
                    <blockquote
                      lang="bn"
                      className="font-bn-verse my-7 space-y-1.5 border-y border-white/14 py-6 text-[clamp(1.18rem,1.85vw,1.5rem)] leading-[1.86] text-[#F6F4EF]/95"
                    >
                      {activeRealm.verseLines.map((line, lineIdx) => (
                        <span key={lineIdx} className="block">
                          {line}
                        </span>
                      ))}
                    </blockquote>
                  </div>

                  {/* Bottom Meta + Direct Poem CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-xs text-[#F6F4EF]/76">
                      <span
                        lang="bn"
                        className="font-semibold text-[#F6F4EF]"
                      >
                        {linkedPoem.title}
                      </span>
                      <span aria-hidden="true" className="mx-2 text-white/35">
                        ·
                      </span>
                      <span>
                        {formatReadingTime(linkedPoem.readingSeconds, lang)}
                      </span>
                      <span aria-hidden="true" className="mx-2 text-white/35">
                        ·
                      </span>
                      <span>{realmFields.motifs.join(' · ')}</span>
                    </div>

                    <TransitionLink
                      ref={ctaRef}
                      to={`/poems/${activeRealm.poemSlug}`}
                      data-testid="atlas-read-poem-cta"
                      className="glass-light inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold text-[#171A21] shadow-[0_12px_28px_rgba(10,14,22,0.28)] transition-all duration-200 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                    >
                      <span>{copy.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </TransitionLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
