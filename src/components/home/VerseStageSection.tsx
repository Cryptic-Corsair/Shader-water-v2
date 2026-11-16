import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatReadingTime, getCycleLabel } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import {
  EDITORIAL_EASE,
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { getRibbonFragments } from './versesLogic';
import {
  buildMoodPulseBars,
  clampVelocityTimeScale,
  getCircularOffset,
  getFeaturedStanzaLines,
  getSlideDepthStyle,
  getStageFeaturedPoems,
  wrapSlideIndex,
} from './verseStageData';

interface KineticRibbonRowProps {
  fragments: string[];
  direction: 'left' | 'right';
  velocityRef: { current: number };
}

function KineticRibbonRow({
  fragments,
  direction,
  velocityRef,
}: KineticRibbonRowProps) {
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
          duration: 54,
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
          velocityRef.current = self.getVelocity();
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
    { scope: rowRef, dependencies: [direction, fragments], revertOnUpdate: true }
  );

  const handleMouseEnter = () => {
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

  const handleMouseLeave = () => {
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
            {fragments.map((line, idx) => (
              <span
                key={`${dup}-${idx}`}
                lang="bn"
                className="font-bn-verse inline-flex items-center gap-10 whitespace-nowrap text-[clamp(1.15rem,1.9vw,1.5rem)] text-[#F6F4EF]/82 transition-colors hover:text-[#DFBC91]"
              >
                <span>“{line}”</span>
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-[#DFBC91]/60"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface FeaturedReadButtonProps {
  slug: string;
  title: string;
  label: string;
  isCenter: boolean;
}

function FeaturedReadButton({
  slug,
  title,
  label,
  isCenter,
}: FeaturedReadButtonProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(linkRef, 0.2);

  return (
    <TransitionLink
      ref={linkRef}
      to={`/poems/${slug}`}
      tabIndex={isCenter ? 0 : -1}
      onClick={(e) => e.stopPropagation()}
      className="glass-light inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold text-[#171A21] shadow-[0_10px_28px_rgba(24,28,36,0.18)] transition-all duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
      aria-label={`${label}: ${title}`}
    >
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
    </TransitionLink>
  );
}

export function VerseStageSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const velocityRef = useRef(0);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).verseStage;

  const featuredPoems = useMemo(() => getStageFeaturedPoems(5), []);
  const ribbonFragments = useMemo(() => getRibbonFragments(), []);
  const bottomFragments = useMemo(
    () => [...ribbonFragments.slice(5), ...ribbonFragments.slice(0, 5)],
    [ribbonFragments]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() =>
    prefersReducedMotion()
  );

  const dragStateRef = useRef({
    active: false,
    startX: 0,
    deltaX: 0,
    didDrag: false,
  });

  useMagnetic(prevBtnRef, 0.2);
  useMagnetic(nextBtnRef, 0.2);

  useEffect(() => {
    const syncWidth = () => setIsMobile(window.innerWidth < 768);
    syncWidth();
    window.addEventListener('resize', syncWidth, { passive: true });
    return () => window.removeEventListener('resize', syncWidth);
  }, []);

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

  const goToSlide = useCallback(
    (nextIndex: number) => {
      setActiveIndex(wrapSlideIndex(nextIndex, total));
    },
    [total]
  );

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const spacingPercent = isMobile ? 96 : 86;

      featuredPoems.forEach((_, idx) => {
        const el = slideRefs.current[idx];
        if (!el) return;

        const offset = getCircularOffset(idx, activeIndex, total);
        const depth = getSlideDepthStyle(offset);
        const isFar = Math.abs(offset) > 1.25;
        const targetX = isFar
          ? (offset >= 0 ? 1 : -1) * spacingPercent * 1.8
          : offset * spacingPercent;

        gsap.to(el, {
          xPercent: -50 + targetX,
          yPercent: -50,
          scale: depth.scale,
          opacity: isFar ? 0 : depth.opacity,
          zIndex: depth.zIndex,
          duration: reduced ? 0.01 : 0.68,
          ease: EDITORIAL_EASE,
          overwrite: 'auto',
        });
      });
    },
    {
      scope: stageRef,
      dependencies: [activeIndex, isMobile, total, featuredPoems],
      revertOnUpdate: true,
    }
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      deltaX: 0,
      didDrag: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag.active) return;

    const dx = event.clientX - drag.startX;
    drag.deltaX = dx;
    if (Math.abs(dx) > 8) {
      drag.didDrag = true;
    }

    const stageWidth = stageRef.current?.clientWidth || 720;
    const dragPercent = Math.max(-24, Math.min(24, (dx / stageWidth) * 100));
    const spacingPercent = isMobile ? 96 : 86;

    featuredPoems.forEach((_, idx) => {
      const el = slideRefs.current[idx];
      if (!el) return;
      const offset = getCircularOffset(idx, activeIndex, total);
      const isFar = Math.abs(offset) > 1.25;
      const baseX = isFar
        ? (offset >= 0 ? 1 : -1) * spacingPercent * 1.8
        : offset * spacingPercent;
      gsap.set(el, { xPercent: -50 + baseX + dragPercent, yPercent: -50 });
    });
  };

  const handlePointerEnd = () => {
    const drag = dragStateRef.current;
    if (!drag.active) return;
    drag.active = false;

    const threshold = 48;
    if (drag.deltaX <= -threshold) {
      goToSlide(activeIndex + 1);
    } else if (drag.deltaX >= threshold) {
      goToSlide(activeIndex - 1);
    } else {
      const reduced = prefersReducedMotion();
      const spacingPercent = isMobile ? 96 : 86;
      featuredPoems.forEach((_, idx) => {
        const el = slideRefs.current[idx];
        if (!el) return;
        const offset = getCircularOffset(idx, activeIndex, total);
        const depth = getSlideDepthStyle(offset);
        const isFar = Math.abs(offset) > 1.25;
        const targetX = isFar
          ? (offset >= 0 ? 1 : -1) * spacingPercent * 1.8
          : offset * spacingPercent;
        gsap.to(el, {
          xPercent: -50 + targetX,
          yPercent: -50,
          scale: depth.scale,
          opacity: isFar ? 0 : depth.opacity,
          duration: reduced ? 0.01 : 0.45,
          ease: EDITORIAL_EASE,
        });
      });
    }

    window.setTimeout(() => {
      dragStateRef.current.didDrag = false;
      dragStateRef.current.deltaX = 0;
    }, 60);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(activeIndex + 1);
    }
  };

  const activePoem = featuredPoems[activeIndex];
  const animatePulse = inView && pageVisible && !reducedMotion;

  return (
    <section
      id="chapter-7"
      ref={sectionRef}
      data-bg-stage="3"
      data-snap-station
      aria-label="Kinetic verse ribbons and featured poems"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative flex min-h-[115svh] w-full flex-col justify-between gap-12 overflow-x-clip py-20 text-[#F6F4EF] focus:outline-none md:gap-16 md:py-28"
    >
      {/* Top Kinetic Verse Ribbon (Drifts Left) */}
      <KineticRibbonRow
        fragments={ribbonFragments}
        direction="left"
        velocityRef={velocityRef}
      />

      {/* Center Featured Poems Stage */}
      <div className="w-full py-2">
        <div className="mx-auto flex w-full max-w-[82rem] flex-col gap-5 px-6 md:flex-row md:items-end md:justify-between md:px-10">
          <div>
            <p className="text-xs font-medium text-[#B2C2D4] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.15] font-semibold">
              {copy.heading}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              ref={prevBtnRef}
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              aria-label={copy.prevAria}
              data-testid="featured-prev-button"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/[0.08] text-[#F6F4EF] backdrop-blur-[18px] transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              ref={nextBtnRef}
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              aria-label={copy.nextAria}
              data-testid="featured-next-button"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/[0.08] text-[#F6F4EF] backdrop-blur-[18px] transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Horizontal Interactive Excerpt Stage */}
        <div
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onPointerLeave={handlePointerEnd}
          data-testid="featured-poems-stage"
          data-active-poem={activePoem?.slug}
          className="relative mt-8 h-[31rem] w-full touch-pan-y select-none overflow-hidden sm:h-[32rem] md:mt-10 md:h-[33rem]"
        >
          {featuredPoems.map((poem, idx) => {
            const isCenter = idx === activeIndex;
            const pulseBars = buildMoodPulseBars(poem, 9);
            const [c0, c1, c2] = poem.moodColors;
            const stanzaLines = getFeaturedStanzaLines(poem.slug, 3);

            return (
              <div
                key={poem.id}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                data-testid={`featured-slide-${poem.slug}`}
                data-active={isCenter ? 'true' : 'false'}
                className="absolute top-1/2 left-1/2 w-[min(86vw,44rem)] will-change-transform"
              >
                <div
                  role="group"
                  aria-label={`${poem.title} excerpt`}
                  onClick={() => {
                    if (!dragStateRef.current.didDrag && !isCenter) {
                      goToSlide(idx);
                    }
                  }}
                  className={`relative overflow-hidden rounded-[30px] border p-6 shadow-[0_26px_68px_rgba(20,24,32,0.3)] transition-colors duration-300 md:p-9 ${
                    isCenter
                      ? 'border-white/30'
                      : 'cursor-pointer border-white/18 hover:border-white/32'
                  }`}
                  style={{
                    background: isCenter
                      ? `radial-gradient(88% 82% at 88% 18%, ${c2}2a 0%, transparent 62%), radial-gradient(78% 72% at 14% 85%, ${c0}48 0%, transparent 65%), rgba(246, 243, 238, 0.13)`
                      : `linear-gradient(155deg, ${c0}52 0%, ${c1}44 100%)`,
                    backdropFilter: isCenter ? 'blur(14px) saturate(112%)' : 'none',
                    WebkitBackdropFilter: isCenter
                      ? 'blur(14px) saturate(112%)'
                      : 'none',
                  }}
                >
                  {/* Header Metadata + Live Mood Pulse Bars */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#DFBC91]">
                      <span>{getCycleLabel(poem.collection, lang)}</span>
                      <span aria-hidden="true">·</span>
                      <span lang="bn" className="tabular-nums">
                        {poem.dateDisplay}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{formatReadingTime(poem.readingSeconds, lang)}</span>
                    </div>

                    <div
                      aria-hidden="true"
                      data-testid={`mood-pulse-${poem.slug}`}
                      data-pulsing={animatePulse && isCenter ? 'true' : 'false'}
                      className="flex h-6 items-end gap-1"
                    >
                      {pulseBars.map((bar, barIdx) => (
                        <span
                          key={barIdx}
                          className={`w-[2.5px] origin-bottom rounded-full transition-opacity duration-300 ${
                            animatePulse && isCenter
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

                  {/* Poems strictly stay in Bangla */}
                  <h3
                    lang="bn"
                    className="font-bn-display mt-5 text-[clamp(1.8rem,3vw,2.65rem)] leading-[1.3] font-semibold text-[#F6F4EF]"
                  >
                    {poem.title}
                  </h3>

                  <blockquote
                    lang="bn"
                    className="font-bn-verse mt-4 space-y-1 border-l border-[#DFBC91]/50 pl-4 text-base leading-[1.85] text-[#F6F4EF]/92 md:text-[1.14rem]"
                  >
                    {stanzaLines.map((line, lineIdx) => (
                      <span key={lineIdx} className="block">
                        {line}
                      </span>
                    ))}
                  </blockquote>

                  <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/16 pt-5">
                    <span lang="bn" className="text-xs text-[#F6F4EF]/72">
                      {poem.themes.join(' · ')}
                    </span>

                    <FeaturedReadButton
                      slug={poem.slug}
                      title={poem.title}
                      label={copy.readFull}
                      isCenter={isCenter}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Dots & Controls Readout */}
        <div className="mx-auto mt-6 flex w-full max-w-[82rem] flex-wrap items-center justify-between gap-4 px-6 md:px-10">
          <div
            role="tablist"
            aria-label="Select featured poem"
            className="flex items-center gap-2.5"
          >
            {featuredPoems.map((poem, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={poem.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={poem.title}
                  data-testid={`featured-dot-${poem.slug}`}
                  onClick={() => goToSlide(idx)}
                  className={`h-2.5 cursor-pointer rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    isSelected
                      ? 'w-9 bg-[#DFBC91]'
                      : 'w-2.5 bg-white/35 hover:bg-white/65'
                  }`}
                />
              );
            })}
          </div>

          <p className="text-xs font-medium text-[#F6F4EF]/70">{copy.hint}</p>
        </div>
      </div>

      {/* Bottom Opposing Kinetic Verse Ribbon (Drifts Right) */}
      <KineticRibbonRow
        fragments={bottomFragments}
        direction="right"
        velocityRef={velocityRef}
      />
    </section>
  );
}
