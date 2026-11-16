import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from 'motion/react';
import { useAmbientSound } from '../../context/AmbientSoundContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import {
  isTouchDevice,
  prefersReducedMotion,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { useSmoothScroll } from '../SmoothScrollProvider';
import { splitHeadlineLines } from '../hero/heroAtmosphereMath';
import { HeroSpectacleCanvas } from '../hero/HeroSpectacleCanvas';
import { HeroTwilightAperture } from '../hero/HeroTwilightAperture';
import {
  formatFolioLabel,
  getHeroFolios,
  wrapFolioIndex,
} from '../hero/heroSpectacleData';

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

export function HeroCinematicSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const archiveBtnRef = useRef<HTMLAnchorElement>(null);
  const meetPoetBtnRef = useRef<HTMLButtonElement>(null);
  const pointerTargetRef = useRef({ x: 0, y: 0 });

  const { lang } = useLanguage();
  const { isPlaying: soundActive } = useAmbientSound();
  const copy = getUiCopy(lang);
  const { scrollToElement } = useSmoothScroll();

  const folios = useMemo(() => getHeroFolios(), []);
  const [activeFolioIdx, setActiveFolioIdx] = useState(0);
  const [pointerNorm, setPointerNorm] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(() =>
    prefersReducedMotion()
  );

  useMagnetic(archiveBtnRef, 0.2);
  useMagnetic(meetPoetBtnRef, 0.18);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const mistScrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.85, 1],
    [1, 0.22, 0]
  );
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -44]);

  const handlePointerMove = (event: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || isTouchDevice()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    pointerTargetRef.current = { x, y };
    setPointerNorm({ x, y });
  };

  const handlePointerLeave = () => {
    pointerTargetRef.current = { x: 0, y: 0 };
    setPointerNorm({ x: 0, y: 0 });
  };

  const activeFolio = folios[activeFolioIdx] ?? folios[0];
  const headlineLines = splitHeadlineLines(copy.hero.headline, lang);

  return (
    <section
      id="chapter-1"
      ref={sectionRef}
      data-bg-stage="0"
      data-snap-station
      data-sound-active={soundActive ? 'true' : 'false'}
      aria-label="Opening literary exhibition"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden px-5 pt-20 pb-6 text-[#F6F4EF] sm:px-6 md:px-12 md:pt-28 md:pb-10"
    >
      {/* Tactile Print Grain */}
      <div
        data-testid="hero-paper-grain"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperFiber'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperFiber)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px 180px',
        }}
      />

      {/* Volumetric Dusk Sky Wash + Monsoon Rain & Ripple Canvas */}
      <motion.div
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.85, ease: CONTEMPLATIVE_EASE }}
        style={reducedMotion ? undefined : { opacity: mistScrollOpacity }}
        className="pointer-events-none absolute inset-0 z-[2]"
      >
        <HeroSpectacleCanvas
          soundActive={soundActive}
          pointerTargetRef={pointerTargetRef}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(58% 55% at 76% 42%, rgba(223, 188, 145, 0.16) 0%, rgba(178, 194, 212, 0.08) 44%, transparent 74%), radial-gradient(48% 52% at 18% 24%, rgba(178, 194, 212, 0.08) 0%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Main 12-Column Split Stage */}
      <div className="relative z-10 mx-auto grid w-full max-w-[82rem] flex-1 items-center gap-6 py-2 md:gap-10 md:py-6 lg:grid-cols-12 lg:gap-12">
        {/* Left Editorial Column (7 cols) */}
        <motion.div
          style={reducedMotion ? undefined : { y: heroTextY }}
          className="relative z-20 will-change-transform lg:col-span-7"
        >
          <motion.p
            key={`hero-rubric-${lang}`}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: CONTEMPLATIVE_EASE }}
            className="mb-4 text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase"
          >
            {copy.collectedSubtitle}
            <span aria-hidden="true" className="mx-2 text-[#F6F4EF]/40">
              ·
            </span>
            <span className="text-[#F6F4EF]/78 tabular-nums">
              {copy.hero.subtitleRight}
            </span>
          </motion.p>

          <h1
            key={`hero-h1-${lang}`}
            lang={lang}
            className={`font-display display-luminous max-w-4xl font-semibold ${
              lang === 'bn'
                ? 'font-bn-display text-[clamp(2.3rem,4.9vw,4.35rem)] leading-[1.36]'
                : 'text-[clamp(2.55rem,5.5vw,4.9rem)] leading-[1.08] tracking-[-0.03em]'
            }`}
          >
            {headlineLines.map((line, idx) => (
              <span
                key={`${lang}-headline-${idx}`}
                className="block overflow-hidden py-[0.2em] -my-[0.2em]"
              >
                <motion.span
                  className="block will-change-transform"
                  initial={
                    reducedMotion
                      ? false
                      : { y: '100%', opacity: 0, filter: 'blur(6px)' }
                  }
                  animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.8,
                    delay: 0.16 + idx * 0.12,
                    ease: CONTEMPLATIVE_EASE,
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Expanding Horizon Rule with Celestial Crosshair */}
          <div
            aria-hidden="true"
            data-testid="hero-horizon-divider"
            className="relative my-4 flex w-full max-w-2xl items-center justify-center md:my-8"
          >
            <motion.div
              initial={reducedMotion ? false : { scaleX: 0, opacity: 0.3 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.08, ease: CONTEMPLATIVE_EASE }}
              style={{ originX: 0.5 }}
              className="h-px w-full bg-gradient-to-r from-transparent via-[#DFBC91]/75 to-transparent"
            />
            <span className="absolute flex h-4 w-4 items-center justify-center text-[#F6F4EF]/80">
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                <line x1="8" y1="1.5" x2="8" y2="14.5" stroke="currentColor" strokeWidth="1" />
                <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="rgba(223,188,145,0.9)" strokeWidth="1" />
              </svg>
            </span>
          </div>

          {/* Illuminated Bangla Stanza from Active Folio */}
          <div className="min-h-[5.25rem] md:min-h-[6.5rem]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeFolio.id}
                lang="bn"
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, y: 6, filter: 'blur(3px)' }
                }
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
                transition={{ duration: 0.24, ease: CONTEMPLATIVE_EASE }}
                className="font-bn-verse max-w-2xl text-[clamp(1.12rem,2vw,1.8rem)] leading-[1.8] text-[#F6F4EF]/95 md:leading-[1.85]"
              >
                {activeFolio.stanza.map((line, idx) => (
                  <span key={idx} className="block py-[0.06em]">
                    {line}
                  </span>
                ))}
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-7 md:gap-4">
            <TransitionLink
              ref={archiveBtnRef}
              to="/poems"
              data-testid="hero-archive-cta"
              className="glass-light inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full px-6 py-3 text-xs font-semibold text-[#171A21] shadow-[0_14px_36px_rgba(16,20,28,0.24)] transition-all duration-200 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <span>{copy.hero.ctaArchive}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </TransitionLink>

            <button
              ref={meetPoetBtnRef}
              type="button"
              onClick={() => scrollToElement('chapter-presence', -40)}
              data-testid="hero-presence-scroll-btn"
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-full border border-white/26 bg-white/[0.07] px-5 py-3 text-xs font-medium text-[#F6F4EF] backdrop-blur-[14px] transition-colors duration-200 hover:border-[#DFBC91]/75 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <span>{copy.hero.ctaMeetPoet}</span>
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </motion.div>

        {/* Right Illuminated Monsoon Window Centerpiece (5 cols) */}
        <div className="relative z-10 lg:col-span-5">
          <HeroTwilightAperture
            activeFolio={activeFolio}
            lang={lang}
            soundActive={soundActive}
            reducedMotion={reducedMotion}
            pointerNorm={pointerNorm}
          />
        </div>
      </div>

      {/* Bottom Full-Width Architectural Folio Switcher Strip */}
      <div className="relative z-20 mx-auto mt-4 flex w-full max-w-[82rem] flex-col gap-3 border-t border-white/16 pt-3 sm:mt-0 sm:flex-row sm:items-center sm:justify-between md:gap-4 md:pt-4">
        <div
          role="tablist"
          aria-label="Featured hero stanzas"
          className="flex flex-wrap items-center gap-2"
        >
          {folios.map((folio, idx) => {
            const isSelected = idx === activeFolioIdx;
            return (
              <button
                key={folio.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                data-testid={`hero-folio-tab-${idx}`}
                onClick={() => setActiveFolioIdx(wrapFolioIndex(idx, folios.length))}
                className={`cursor-pointer whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                  isSelected
                    ? 'bg-[#DFBC91] text-[#171A21]'
                    : 'bg-white/[0.06] text-[#F6F4EF]/80 hover:bg-white/[0.12] hover:text-[#F6F4EF]'
                }`}
              >
                {formatFolioLabel(folio, lang)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 text-xs text-[#F6F4EF]/75 tabular-nums sm:justify-end">
          <span>{copy.hero.editionSpan}</span>
          <span aria-hidden="true" className="text-[#DFBC91]/60">
            ·
          </span>
          <button
            type="button"
            onClick={() => scrollToElement('chapter-presence', -40)}
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[#DFBC91] transition-colors hover:text-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
          >
            <span>{copy.hero.scrollPrompt}</span>
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
