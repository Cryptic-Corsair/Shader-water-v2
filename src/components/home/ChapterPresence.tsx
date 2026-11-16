import { Fragment, useRef } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_PROFILE } from '../../data/authorProfile';
import { getCycleLabel, getCollections } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import {
  DrawSVGPlugin,
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { useSmoothScroll } from '../SmoothScrollProvider';
import { TwilightPortrait } from '../about/TwilightPortrait';

export function ChapterPresence() {
  const sectionRef = useRef<HTMLElement>(null);
  const portraitZoomRef = useRef<HTMLDivElement>(null);
  const compassArcOuterRef = useRef<SVGPathElement>(null);
  const compassArcInnerRef = useRef<SVGPathElement>(null);
  const compassMeridianRef = useRef<SVGLineElement>(null);
  const archiveCtaRef = useRef<HTMLAnchorElement>(null);
  const continueBtnRef = useRef<HTMLButtonElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang);
  const { scrollToElement } = useSmoothScroll();

  useMagnetic(archiveCtaRef, 0.2);
  useMagnetic(continueBtnRef, 0.18);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const portraitZoom = portraitZoomRef.current;
      const arcOuter = compassArcOuterRef.current;
      const arcInner = compassArcInnerRef.current;
      const meridian = compassMeridianRef.current;

      if (!section) return;
      const reduced = prefersReducedMotion();

      void DrawSVGPlugin;

      if (!reduced) {
        const mm = gsap.matchMedia();

        mm.add('(min-width: 768px)', () => {
          if (portraitZoom) {
            gsap.fromTo(
              portraitZoom,
              { scale: 0.88 },
              {
                scale: 1,
                ease: 'none',
                immediateRender: false,
                scrollTrigger: {
                  trigger: section,
                  start: 'top 82%',
                  end: 'center center',
                  scrub: 0.85,
                },
              }
            );
          }
        });

        const compassPaths = [arcOuter, arcInner, meridian].filter(
          (el): el is SVGPathElement | SVGLineElement => el !== null
        );

        if (compassPaths.length > 0) {
          gsap.fromTo(
            compassPaths,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              stagger: 0.12,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: 'top 78%',
                end: 'center 42%',
                scrub: 0.75,
              },
            }
          );
        }

        ScrollTrigger.refresh();
        return () => mm.revert();
      }
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const cycleIds = getCollections();

  return (
    <section
      id="chapter-presence"
      ref={sectionRef}
      data-bg-stage="1"
      data-snap-station
      aria-label={`Presence — ${AUTHOR_PROFILE.name[lang]}`}
      className="relative flex min-h-[125svh] w-full items-center overflow-x-clip py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[82rem] px-6 md:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left (5 cols): Kept <Water> Portrait framed by dynamic SVG compass arcs */}
          <div className="relative mx-auto w-full max-w-[26rem] lg:col-span-5 lg:max-w-none">
            <svg
              aria-hidden="true"
              viewBox="0 0 560 660"
              fill="none"
              className="pointer-events-none absolute -inset-8 h-[calc(100%+4rem)] w-[calc(100%+4rem)] overflow-visible md:-inset-12 md:h-[calc(100%+6rem)] md:w-[calc(100%+6rem)]"
            >
              <path
                ref={compassArcOuterRef}
                d="M 18 220 A 268 268 0 0 1 468 58"
                stroke="rgba(223, 188, 145, 0.72)"
                strokeWidth="1.15"
                strokeLinecap="round"
              />
              <path
                ref={compassArcInnerRef}
                d="M 542 430 A 268 268 0 0 1 92 602"
                stroke="rgba(246, 244, 239, 0.48)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray="4 7"
              />
              <line
                ref={compassMeridianRef}
                x1="-12"
                y1="330"
                x2="572"
                y2="330"
                stroke="rgba(223, 188, 145, 0.34)"
                strokeWidth="0.85"
              />
              <circle cx="468" cy="58" r="3" fill="#DFBC91" fillOpacity="0.82" />
              <circle cx="92" cy="602" r="2.5" fill="#F6F4EF" fillOpacity="0.65" />
            </svg>

            <div ref={portraitZoomRef} className="relative z-10 will-change-transform">
              <TwilightPortrait caption={AUTHOR_PROFILE.portraitCaption[lang]} />
            </div>
          </div>

          {/* Right (6 cols, offset 1 col): Open borderless typography */}
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="text-xs font-medium text-[#DFBC91] uppercase">
              {copy.presence.eyebrow}
            </p>

            <h2
              className={`font-display display-luminous mt-4 font-semibold ${
                lang === 'bn'
                  ? 'font-bn-display text-[clamp(2.45rem,4.6vw,4.1rem)] leading-[1.2]'
                  : 'text-[clamp(2.5rem,5vw,4.35rem)] leading-[1.08] tracking-[-0.025em]'
              }`}
            >
              {AUTHOR_PROFILE.name[lang]}
            </h2>

            <p className="font-editorial-serif mt-4 text-[clamp(1.45rem,2.4vw,2.2rem)] leading-[1.45] font-light text-[#F6F4EF]/94">
              {AUTHOR_PROFILE.headline[lang]}
            </p>

            <p className="mt-7 max-w-[54ch] text-base leading-[1.85] text-[#F6F4EF]/84 md:text-[1.05rem]">
              {AUTHOR_PROFILE.statement[lang]}
            </p>

            <div
              aria-hidden="true"
              className="my-9 h-px w-full max-w-lg bg-gradient-to-r from-white/30 via-white/12 to-transparent"
            />

            <p className="text-xs font-medium text-[#F6F4EF]/76">
              {cycleIds.map((id, idx) => (
                <Fragment key={id}>
                  {idx > 0 ? (
                    <span className="mx-2 text-[#DFBC91]">·</span>
                  ) : null}
                  <span>{getCycleLabel(id, lang)}</span>
                </Fragment>
              ))}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <TransitionLink
                ref={archiveCtaRef}
                to="/poems"
                className="glass-light inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full px-6 py-3 text-xs font-semibold text-[#171A21] shadow-[0_12px_32px_rgba(24,28,36,0.16)] transition-all duration-200 hover:bg-white/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.presence.ctaArchive}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </TransitionLink>

              <button
                ref={continueBtnRef}
                type="button"
                onClick={() => scrollToElement('chapter-4', -40)}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-full border border-white/24 bg-white/[0.06] px-5 py-3 text-xs font-medium text-[#F6F4EF] backdrop-blur-[16px] transition-colors duration-200 hover:border-[#DFBC91]/70 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.presence.ctaContinue}</span>
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
