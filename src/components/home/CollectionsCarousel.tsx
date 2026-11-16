import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import {
  EDITORIAL_EASE,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { usePageTransition } from '../PageTransition';
import {
  CYCLE_CAROUSEL_SLIDES,
  getCircularOffset,
  getSlideCycleName,
  getSlideDepthStyle,
  wrapSlideIndex,
  type CycleCarouselSlide,
} from './collectionsCarouselData';

function TidalHorizonArtwork({ slide }: { slide: CycleCarouselSlide }) {
  const [c0, c1, c2] = slide.horizonColors;
  const amp = slide.waveAmplitude;
  const p = slide.wavePhase;

  const y1 = 84 + Math.sin(p) * amp * 0.4;
  const y2 = 104 + Math.cos(p + 0.8) * amp * 0.45;
  const y3 = 124 + Math.sin(p + 1.6) * amp * 0.35;

  return (
    <div
      aria-hidden="true"
      className="relative h-32 w-full overflow-hidden rounded-[22px] border border-white/22 sm:h-40 md:h-48"
      style={{
        background: `radial-gradient(88% 82% at 24% 20%, ${c2}55 0%, transparent 62%), radial-gradient(80% 75% at 84% 78%, ${c0}ee 0%, transparent 68%), linear-gradient(155deg, ${c0} 0%, ${c1} 58%, ${c2}88 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute right-[16%] top-[16%] h-14 w-14 rounded-full md:h-18 md:w-18"
        style={{ backgroundColor: c2, opacity: 0.24 }}
      />
      <svg
        viewBox="0 0 600 180"
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-0 h-full w-full"
      >
        <line
          x1="0"
          y1="72"
          x2="600"
          y2="72"
          stroke="rgba(246, 244, 239, 0.24)"
          strokeWidth="0.75"
        />
        <path
          d={`M 0 ${y1} Q 150 ${y1 - amp}, 300 ${y1} T 600 ${y1}`}
          stroke="rgba(246, 244, 239, 0.56)"
          strokeWidth="1.15"
        />
        <path
          d={`M 0 ${y2} Q 150 ${y2 + amp * 0.85}, 300 ${y2} T 600 ${y2}`}
          stroke={c2}
          strokeOpacity="0.72"
          strokeWidth="1"
        />
        <path
          d={`M 0 ${y3} Q 150 ${y3 - amp * 0.6}, 300 ${y3} T 600 ${y3}`}
          stroke="rgba(246, 244, 239, 0.28)"
          strokeWidth="0.9"
          strokeDasharray="4 6"
        />
      </svg>
    </div>
  );
}

export function CollectionsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).carousel;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const dragStateRef = useRef({
    active: false,
    startX: 0,
    deltaX: 0,
    didDrag: false,
  });

  const { navigateWithTransition } = usePageTransition();

  useMagnetic(prevBtnRef, 0.2);
  useMagnetic(nextBtnRef, 0.2);

  useEffect(() => {
    const syncWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };
    syncWidth();
    window.addEventListener('resize', syncWidth, { passive: true });
    return () => window.removeEventListener('resize', syncWidth);
  }, []);

  const total = CYCLE_CAROUSEL_SLIDES.length;

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

      CYCLE_CAROUSEL_SLIDES.forEach((_, idx) => {
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
    { scope: stageRef, dependencies: [activeIndex, isMobile, total] }
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

    CYCLE_CAROUSEL_SLIDES.forEach((_, idx) => {
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
      CYCLE_CAROUSEL_SLIDES.forEach((_, idx) => {
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

  const handleSlideActivate = (slide: CycleCarouselSlide, idx: number) => {
    if (dragStateRef.current.didDrag) return;
    if (idx === activeIndex) {
      navigateWithTransition(
        `/poems?collection=${encodeURIComponent(slide.collectionQuery)}`,
        getSlideCycleName(slide, lang)
      );
    } else {
      goToSlide(idx);
    }
  };

  const activeSlide = CYCLE_CAROUSEL_SLIDES[activeIndex];

  return (
    <section
      id="chapter-cycles"
      ref={sectionRef}
      data-bg-stage="2"
      data-snap-station
      aria-label="Published cycles interactive carousel"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="relative flex min-h-[115svh] w-full flex-col justify-center overflow-x-clip py-24 text-[#F6F4EF] focus:outline-none md:py-32"
    >
      <div className="mx-auto w-full max-w-[82rem] px-6 md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium text-[#DFD7CD] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.25rem,4.5vw,3.9rem)] leading-[1.15] font-semibold">
              {copy.heading}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              ref={prevBtnRef}
              type="button"
              onClick={() => goToSlide(activeIndex - 1)}
              aria-label={copy.prevAria}
              data-testid="carousel-prev-button"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/[0.08] text-[#F6F4EF] backdrop-blur-[18px] transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              ref={nextBtnRef}
              type="button"
              onClick={() => goToSlide(activeIndex + 1)}
              aria-label={copy.nextAria}
              data-testid="carousel-next-button"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/[0.08] text-[#F6F4EF] backdrop-blur-[18px] transition-colors duration-200 hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Interactive Zoom-Depth Stage */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
        data-testid="cycles-carousel-stage"
        data-active-cycle={activeSlide.id}
        className="relative mt-10 h-[33rem] w-full touch-pan-y select-none overflow-hidden sm:h-[34rem] md:mt-14 md:h-[35rem]"
      >
        {CYCLE_CAROUSEL_SLIDES.map((slide, idx) => {
          const isCenter = idx === activeIndex;
          const slideName = getSlideCycleName(slide, lang);
          const slideYears = lang === 'bn' ? slide.yearsBn : slide.yearsEn;
          const slideTagline = lang === 'bn' ? slide.taglineBn : slide.taglineEn;

          return (
            <div
              key={slide.id}
              ref={(el) => {
                slideRefs.current[idx] = el;
              }}
              data-testid={`cycle-slide-${slide.id}`}
              data-active={isCenter ? 'true' : 'false'}
              className="absolute top-1/2 left-1/2 w-[min(84vw,44rem)] will-change-transform"
            >
              <button
                type="button"
                onClick={() => handleSlideActivate(slide, idx)}
                aria-label={
                  isCenter
                    ? `${copy.openCycle}: ${slideName}`
                    : `${copy.preview}: ${slideName}`
                }
                className="group block w-full cursor-pointer rounded-[30px] border border-white/26 p-6 text-left shadow-[0_28px_72px_rgba(24,20,18,0.28)] transition-colors duration-300 hover:border-[#DFBC91]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] md:p-8"
                style={{
                  background: isCenter
                    ? 'rgba(246, 243, 238, 0.14)'
                    : 'rgba(38, 44, 56, 0.42)',
                  backdropFilter: isCenter ? 'blur(14px) saturate(112%)' : 'none',
                  WebkitBackdropFilter: isCenter
                    ? 'blur(14px) saturate(112%)'
                    : 'none',
                }}
              >
                <TidalHorizonArtwork slide={slide} />

                <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-xs font-medium text-[#DFBC91] tabular-nums">
                    {slideYears}
                  </span>
                  <span className="text-xs text-[#F6F4EF]/78">
                    {slideTagline}
                  </span>
                </div>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <h3 className="font-editorial-serif text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.2] font-normal text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91]">
                    {slideName}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#DFBC91]">
                    <span>{isCenter ? copy.openCycle : copy.preview}</span>
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <p
                  lang="bn"
                  className="font-bn-verse mt-4 text-base text-[#F6F4EF]/88 md:text-[1.12rem]"
                >
                  <span className="block">“{slide.couplet[0]}</span>
                  <span className="block">{slide.couplet[1]}”</span>
                </p>
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Scrubber Dots & Active Cycle Readout */}
      <div className="mx-auto mt-8 flex w-full max-w-[82rem] flex-wrap items-center justify-between gap-4 px-6 md:px-10">
        <div
          role="tablist"
          aria-label="Select poetic cycle"
          className="flex items-center gap-2.5"
        >
          {CYCLE_CAROUSEL_SLIDES.map((slide, idx) => {
            const isSelected = idx === activeIndex;
            const slideName = getSlideCycleName(slide, lang);
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={slideName}
                data-testid={`carousel-dot-${slide.id}`}
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

        <p className="text-xs font-medium text-[#F6F4EF]/75">{copy.hint}</p>
      </div>
    </section>
  );
}
