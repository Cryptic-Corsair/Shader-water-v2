import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_BIO_BEATS, AUTHOR_PROFILE } from '../../data/authorProfile';
import { getUiCopy } from '../../data/uiCopy';
import {
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { TideContourCanvas } from '../art/TideContourCanvas';

function BeatMotifPlate({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 240 84" fill="none" className="h-16 w-48">
        <path
          d="M 10 62 Q 70 18, 130 46 T 230 28"
          stroke="rgba(223, 188, 145, 0.58)"
          strokeWidth="1"
        />
        <line
          x1="120"
          y1="8"
          x2="120"
          y2="76"
          stroke="rgba(246, 244, 239, 0.34)"
          strokeWidth="0.8"
          strokeDasharray="3 5"
        />
        <circle cx="120" cy="44" r="3" fill="#DFBC91" fillOpacity="0.8" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 240 84" fill="none" className="h-16 w-48">
        <circle
          cx="120"
          cy="42"
          r="30"
          stroke="rgba(246, 244, 239, 0.36)"
          strokeWidth="0.9"
        />
        <circle
          cx="120"
          cy="42"
          r="19"
          stroke="rgba(223, 188, 145, 0.5)"
          strokeWidth="0.8"
          strokeDasharray="2 5"
        />
        <line
          x1="120"
          y1="42"
          x2="142"
          y2="24"
          stroke="#DFBC91"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 84" fill="none" className="h-16 w-48">
      <path
        d="M 14 52 C 62 38, 96 66, 148 36 C 178 18, 206 28, 228 20"
        stroke="rgba(246, 244, 239, 0.52)"
        strokeWidth="1"
      />
      <path
        d="M 14 64 C 66 52, 102 74, 152 48 C 180 34, 206 42, 228 36"
        stroke="rgba(223, 188, 145, 0.45)"
        strokeWidth="0.85"
      />
    </svg>
  );
}

export function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const archiveBtnRef = useRef<HTMLAnchorElement>(null);
  const [activeBeat, setActiveBeat] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).story;

  useMagnetic(archiveBtnRef, 0.2);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduced = prefersReducedMotion();

      const progressTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 72%',
        end: 'bottom 38%',
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });

      const beatEls = Array.from(
        section.querySelectorAll<HTMLElement>('[data-story-beat]')
      );
      beatEls.forEach((beatEl, idx) => {
        ScrollTrigger.create({
          trigger: beatEl,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => setActiveBeat(idx),
          onEnterBack: () => setActiveBeat(idx),
        });
      });

      const motifPlates = Array.from(
        section.querySelectorAll<HTMLElement>('[data-story-motif]')
      );
      if (!reduced) {
        motifPlates.forEach((plate) => {
          gsap.fromTo(
            plate,
            { scale: 0.94 },
            {
              scale: 1.04,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: plate,
                start: 'top 88%',
                end: 'bottom 30%',
                scrub: 0.75,
              },
            }
          );
        });
      }

      ScrollTrigger.refresh();
      return () => {
        progressTrigger.kill();
      };
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const currentBeat = AUTHOR_BIO_BEATS[activeBeat] ?? AUTHOR_BIO_BEATS[0];

  return (
    <section
      id="chapter-story"
      ref={sectionRef}
      data-bg-stage="3"
      data-snap-station
      aria-label="Practice and notebook biography"
      className="relative min-h-[140svh] w-full overflow-x-clip py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="mx-auto max-w-[82rem] px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
          {/* Left Sticky Column: Canvas 2D Tidal Horizon & Wave Contour Sketchpad */}
          <div className="lg:col-span-5 lg:sticky lg:top-[18vh]">
            <p className="text-xs font-medium text-[#B2C2D4] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.2rem,3.9vw,3.35rem)] leading-[1.18] font-semibold">
              {copy.heading}
            </h2>

            <div className="mt-8">
              <TideContourCanvas
                scrollProgress={scrollProgress}
                activePhraseIndex={activeBeat}
              />

              <div className="mt-4 flex items-center justify-between border-t border-white/16 pt-3 text-xs">
                <span className="font-medium text-[#DFBC91]">
                  {currentBeat.label[lang]}
                </span>
                <span className="text-[#F6F4EF]/70">
                  {currentBeat.motifTitle[lang]}
                </span>
              </div>
            </div>
          </div>

          {/* Right Scrolling Column: Open Borderless Editorial Biography (3 Spacious Beats) */}
          <div className="space-y-16 lg:col-span-6 lg:col-start-7 lg:pt-6 md:space-y-24">
            {AUTHOR_BIO_BEATS.map((beat, idx) => (
              <article
                key={beat.id}
                data-story-beat={idx}
                className="space-y-7"
              >
                <p className="text-xs font-medium text-[#DFBC91] uppercase">
                  {beat.label[lang]}
                </p>

                <p
                  className={`max-w-[58ch] text-base leading-[1.86] text-[#F6F4EF]/88 md:text-[1.08rem] ${
                    idx === 0 && lang === 'en'
                      ? 'editorial-drop-cap first-letter:float-left first-letter:mr-3.5 first-letter:mt-1 first-letter:text-[4.25rem] first-letter:leading-[0.82] first-letter:text-[#DFBC91]'
                      : ''
                  }`}
                >
                  {beat.paragraph[lang]}
                </p>

                {/* Floating archival field-note callout & zoom-on-scroll SVG motif plate */}
                <div className="flex flex-col gap-5 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-editorial-serif max-w-[34ch] text-base leading-[1.7] text-[#B2C2D4] md:text-lg">
                    {beat.callout[lang]}
                  </p>
                  <div
                    data-story-motif
                    className="shrink-0 will-change-transform"
                  >
                    <BeatMotifPlate index={idx} />
                  </div>
                </div>
              </article>
            ))}

            <p className="border-t border-white/15 pt-5 text-xs leading-[1.8] text-[#B2C2D4]/85">
              {AUTHOR_PROFILE.bioPlaceholderNote[lang]}
            </p>

            <div className="pt-2">
              <TransitionLink
                ref={archiveBtnRef}
                to="/poems"
                className="glass-light inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full px-6 py-3 text-xs font-semibold text-[#171A21] shadow-[0_12px_32px_rgba(24,28,36,0.16)] transition-all duration-200 hover:bg-white/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.cta}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
