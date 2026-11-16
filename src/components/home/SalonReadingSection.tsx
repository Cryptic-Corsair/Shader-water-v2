import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import {
  POEMS_CATALOG,
  formatReadingTime,
  getCycleLabel,
  toBanglaNumerals,
} from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import {
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import {
  buildMoodPulseBars,
  clampVelocityTimeScale,
  getFeaturedStanzaLines,
  getStageFeaturedPoems,
  wrapSlideIndex,
} from './verseStageData';

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

interface RibbonPoemItem {
  slug: string;
  firstLine: string;
}

function KineticRibbonRow({
  items,
  direction,
}: {
  items: RibbonPoemItem[];
  direction: 'left' | 'right';
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const hoveredRef = useRef(false);

  useGSAP(
    () => {
      const track = trackRef.current;
      const row = rowRef.current;
      if (!track || !row || prefersReducedMotion()) return;

      const tween = gsap.fromTo(
        track,
        { xPercent: direction === 'left' ? 0 : -50 },
        {
          xPercent: direction === 'left' ? -50 : 0,
          duration: 58,
          ease: 'none',
          repeat: -1,
        }
      );
      tweenRef.current = tween;

      const velocityPoll = ScrollTrigger.create({
        trigger: row,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          if (hoveredRef.current) return;
          const boosted = clampVelocityTimeScale(self.getVelocity());
          gsap.to(tween, {
            timeScale: boosted,
            duration: 0.25,
            overwrite: 'auto',
            onComplete: () => {
              if (!hoveredRef.current) {
                gsap.to(tween, {
                  timeScale: 1,
                  duration: 0.85,
                  ease: 'power2.out',
                });
              }
            },
          });
        },
      });

      return () => {
        velocityPoll.kill();
        tween.kill();
        tweenRef.current = null;
      };
    },
    { scope: rowRef, dependencies: [direction, items], revertOnUpdate: true }
  );

  const pauseRibbon = () => {
    hoveredRef.current = true;
    if (tweenRef.current) {
      gsap.to(tweenRef.current, {
        timeScale: 0,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  const resumeRibbon = () => {
    hoveredRef.current = false;
    if (tweenRef.current) {
      gsap.to(tweenRef.current, {
        timeScale: 1,
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  };

  return (
    <div
      ref={rowRef}
      onMouseEnter={pauseRibbon}
      onMouseLeave={resumeRibbon}
      data-testid={`verse-ribbon-${direction}`}
      className="relative w-full overflow-hidden border-y border-white/14 py-4"
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-10 will-change-transform"
      >
        {[0, 1].map((dup) => (
          <div
            key={dup}
            aria-hidden={dup === 1}
            className="flex shrink-0 items-center gap-10 pr-10"
          >
            {items.map((item, idx) => (
              <TransitionLink
                key={`${dup}-${item.slug}-${idx}`}
                to={`/poems/${item.slug}`}
                tabIndex={dup === 1 ? -1 : 0}
                lang="bn"
                className="font-bn-verse inline-flex items-center gap-10 whitespace-nowrap text-[clamp(1.15rem,1.85vw,1.45rem)] text-[#F6F4EF]/82 transition-colors hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>“{item.firstLine}”</span>
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-[#DFBC91]/60"
                />
              </TransitionLink>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SalonReadingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const readFullRef = useRef<HTMLAnchorElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).verseStage;

  const featuredPoems = useMemo(() => getStageFeaturedPoems(5), []);
  const ribbonItems = useMemo<RibbonPoemItem[]>(
    () =>
      [...POEMS_CATALOG]
        .sort((a, b) => a.order - b.order)
        .map((p) => ({ slug: p.slug, firstLine: p.firstLine })),
    []
  );
  const bottomItems = useMemo(
    () => [...ribbonItems.slice(5), ...ribbonItems.slice(0, 5)],
    [ribbonItems]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() =>
    prefersReducedMotion()
  );

  useMagnetic(prevBtnRef, 0.2);
  useMagnetic(nextBtnRef, 0.2);
  useMagnetic(readFullRef, 0.2);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () =>
      document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const total = featuredPoems.length;

  const goToIndex = useCallback(
    (nextIdx: number) => {
      setActiveIndex(wrapSlideIndex(nextIdx, total));
    },
    [total]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      goToIndex(activeIndex - 1);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      goToIndex(activeIndex + 1);
    }
  };

  const activePoem = featuredPoems[activeIndex] ?? featuredPoems[0];
  const pulseBars = buildMoodPulseBars(activePoem, 9);
  const [c0, , c2] = activePoem.moodColors;
  const stanzaLines = getFeaturedStanzaLines(activePoem.slug, 4);
  const animatePulse = inView && pageVisible && !reducedMotion;

  return (
    <section
      id="chapter-7"
      ref={sectionRef}
      data-bg-stage="3"
      data-snap-station
      aria-label="Nocturnal reading salon and kinetic verse ribbons"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative flex w-full flex-col justify-between gap-14 overflow-x-clip py-20 text-[#F6F4EF] focus:outline-none md:gap-20 md:py-28"
    >
      <KineticRibbonRow items={ribbonItems} direction="left" />

      <div className="mx-auto w-full max-w-[82rem] px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.04em] text-[#B2C2D4] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.2rem,4.2vw,3.55rem)] leading-[1.18] font-semibold">
              {copy.heading}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              ref={prevBtnRef}
              type="button"
              onClick={() => goToIndex(activeIndex - 1)}
              aria-label={copy.prevAria}
              data-testid="salon-prev-button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/24 bg-white/[0.06] text-[#F6F4EF] transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              ref={nextBtnRef}
              type="button"
              onClick={() => goToIndex(activeIndex + 1)}
              aria-label={copy.nextAria}
              data-testid="salon-next-button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/24 bg-white/[0.06] text-[#F6F4EF] transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 12-Col Nocturnal Reading Salon Split */}
        <div
          data-testid="salon-reading-stage"
          data-active-poem={activePoem.slug}
          className="mt-10 grid items-stretch gap-8 lg:grid-cols-12 lg:gap-10"
        >
          {/* Left Rail (5 cols): Interactive Featured Index */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="mb-3 text-xs font-medium text-[#DFBC91] uppercase">
                {copy.indexLabel}
              </p>
              <div
                role="tablist"
                aria-label="Select featured poem"
                className="divide-y divide-white/12 border-y border-white/14"
              >
                {featuredPoems.map((poem, idx) => {
                  const isSelected = idx === activeIndex;
                  const num = String(idx + 1).padStart(2, '0');
                  const numLabel = lang === 'bn' ? toBanglaNumerals(num) : num;

                  return (
                    <button
                      key={poem.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      data-testid={`salon-tab-${poem.slug}`}
                      onClick={() => goToIndex(idx)}
                      className={`group flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                        isSelected
                          ? 'text-[#F6F4EF]'
                          : 'text-[#F6F4EF]/62 hover:text-[#F6F4EF]/90'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-3">
                          <span
                            className={`text-xs font-medium tabular-nums ${
                              isSelected ? 'text-[#DFBC91]' : 'text-[#F6F4EF]/48'
                            }`}
                          >
                            {numLabel}
                          </span>
                          <span
                            lang="bn"
                            className="font-bn-display truncate text-lg font-semibold md:text-xl"
                          >
                            {poem.title}
                          </span>
                        </div>
                        <p className="mt-1 pl-7 text-xs text-[#F6F4EF]/64 tabular-nums">
                          <span lang="bn">{poem.dateDisplay}</span>
                          <span aria-hidden="true" className="mx-1.5">
                            ·
                          </span>
                          <span>{formatReadingTime(poem.readingSeconds, lang)}</span>
                        </p>
                      </div>

                      <span
                        aria-hidden="true"
                        className={`h-1.5 shrink-0 rounded-full transition-all duration-300 ${
                          isSelected ? 'w-7 bg-[#DFBC91]' : 'w-2 bg-white/24'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-xs text-[#F6F4EF]/65">{copy.hint}</p>
          </div>

          {/* Right Illuminated Folio Broadsheet (7 cols) */}
          <div className="lg:col-span-7">
            <div
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-white/22 p-7 shadow-[0_28px_72px_rgba(14,18,26,0.38)] backdrop-blur-[16px] md:p-10"
              style={{
                background: `radial-gradient(88% 82% at 88% 16%, ${c2}28 0%, transparent 62%), radial-gradient(78% 72% at 14% 86%, ${c0}4a 0%, transparent 65%), rgba(24, 30, 40, 0.72)`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activePoem.slug}-${lang}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.34, ease: CONTEMPLATIVE_EASE }}
                  className="flex h-full flex-col justify-between"
                >
                  <div>
                    {/* Metadata + Live Mood Spectrum Bars */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#DFBC91]">
                        <span>{getCycleLabel(activePoem.collection, lang)}</span>
                        <span aria-hidden="true">·</span>
                        <span lang="bn" className="tabular-nums">
                          {activePoem.dateDisplay}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {formatReadingTime(activePoem.readingSeconds, lang)}
                        </span>
                      </div>

                      <div
                        aria-hidden="true"
                        data-testid={`mood-pulse-${activePoem.slug}`}
                        data-pulsing={animatePulse ? 'true' : 'false'}
                        className="flex h-6 items-end gap-1"
                      >
                        {pulseBars.map((bar, barIdx) => (
                          <span
                            key={barIdx}
                            className={`w-[2.5px] origin-bottom rounded-full transition-opacity duration-300 ${
                              animatePulse
                                ? 'animate-mood-pulse opacity-90'
                                : 'opacity-45'
                            }`}
                            style={{
                              height: `${bar.heightPercent}%`,
                              backgroundColor: bar.color,
                              animationDelay: `${bar.delaySeconds}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <h3
                      lang="bn"
                      className="font-bn-display mt-6 text-[clamp(1.85rem,3.1vw,2.75rem)] leading-[1.3] font-semibold text-[#F6F4EF]"
                    >
                      {activePoem.title}
                    </h3>

                    <blockquote
                      lang="bn"
                      className="font-bn-verse mt-6 space-y-1.5 border-y border-white/14 py-6 text-[clamp(1.18rem,1.9vw,1.5rem)] leading-[1.88] text-[#F6F4EF]/94"
                    >
                      {stanzaLines.map((line, lineIdx) => (
                        <span key={lineIdx} className="block">
                          {line}
                        </span>
                      ))}
                    </blockquote>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                    <span lang="bn" className="text-xs text-[#F6F4EF]/72">
                      {activePoem.themes.join(' · ')}
                    </span>

                    <TransitionLink
                      ref={readFullRef}
                      to={`/poems/${activePoem.slug}`}
                      data-testid="salon-read-full-cta"
                      className="glass-light inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold text-[#171A21] shadow-[0_10px_28px_rgba(14,18,26,0.24)] transition-all duration-200 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                    >
                      <span>{copy.readFull}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </TransitionLink>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <KineticRibbonRow items={bottomItems} direction="right" />
    </section>
  );
}
