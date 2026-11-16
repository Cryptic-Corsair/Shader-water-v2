import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_BIO_BEATS, AUTHOR_PROFILE } from '../../data/authorProfile';
import { toBanglaNumerals } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import {
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { useSmoothScroll } from '../SmoothScrollProvider';
import { TideContourCanvas } from '../art/TideContourCanvas';

function EngravingEmblem({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg viewBox="0 0 180 64" fill="none" className="h-14 w-40">
        <path
          d="M 8 48 Q 52 14, 94 36 T 172 22"
          stroke="rgba(223, 188, 145, 0.65)"
          strokeWidth="1.05"
        />
        <line
          x1="90"
          y1="6"
          x2="90"
          y2="58"
          stroke="rgba(246, 244, 239, 0.32)"
          strokeWidth="0.8"
          strokeDasharray="3 5"
        />
        <circle cx="90" cy="34" r="2.8" fill="#DFBC91" />
      </svg>
    );
  }
  if (index === 1) {
    return (
      <svg viewBox="0 0 180 64" fill="none" className="h-14 w-40">
        <circle
          cx="90"
          cy="32"
          r="24"
          stroke="rgba(246, 244, 239, 0.36)"
          strokeWidth="0.9"
        />
        <circle
          cx="90"
          cy="32"
          r="14"
          stroke="rgba(223, 188, 145, 0.54)"
          strokeWidth="0.8"
          strokeDasharray="2 4"
        />
        <line
          x1="90"
          y1="32"
          x2="108"
          y2="18"
          stroke="#DFBC91"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 180 64" fill="none" className="h-14 w-40">
      <path
        d="M 10 40 C 48 28, 76 52, 114 28 C 138 14, 156 22, 172 16"
        stroke="rgba(246, 244, 239, 0.56)"
        strokeWidth="1"
      />
      <path
        d="M 10 50 C 52 40, 82 58, 118 38 C 142 26, 158 34, 172 28"
        stroke="rgba(223, 188, 145, 0.48)"
        strokeWidth="0.85"
      />
    </svg>
  );
}

export function CraftNotebookSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const archiveBtnRef = useRef<HTMLAnchorElement>(null);
  const [activeBeat, setActiveBeat] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).story;
  const { scrollToElement } = useSmoothScroll();

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
        section.querySelectorAll<HTMLElement>('[data-notebook-beat]')
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

      if (!reduced) {
        const plates = Array.from(
          section.querySelectorAll<HTMLElement>('[data-notebook-motif]')
        );
        plates.forEach((plate) => {
          gsap.fromTo(
            plate,
            { scale: 0.94 },
            {
              scale: 1.03,
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
  const progressPct = Math.round(scrollProgress * 100);
  const progressDisplay =
    lang === 'bn' ? `${toBanglaNumerals(progressPct)}%` : `${progressPct}%`;

  return (
    <section
      id="chapter-story"
      ref={sectionRef}
      data-bg-stage="3"
      data-snap-station
      aria-label="Practice and notebook essays"
      className="relative w-full overflow-x-clip py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="mx-auto max-w-[82rem] px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
          {/* Left Sticky Observatory (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-[16vh]">
            <p className="text-xs font-medium tracking-[0.04em] text-[#B2C2D4] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.15rem,3.8vw,3.3rem)] leading-[1.2] font-semibold">
              {copy.heading}
            </h2>

            {/* Interactive Beat Selector */}
            <div className="mt-6 flex flex-wrap gap-2">
              {AUTHOR_BIO_BEATS.map((beat, idx) => {
                const isSelected = idx === activeBeat;
                return (
                  <button
                    key={beat.id}
                    type="button"
                    onClick={() => {
                      setActiveBeat(idx);
                      scrollToElement(`notebook-beat-${idx}`, -120);
                    }}
                    className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                      isSelected
                        ? 'bg-[#DFBC91] text-[#171A21]'
                        : 'border border-white/16 bg-white/[0.04] text-[#F6F4EF]/78 hover:text-[#F6F4EF]'
                    }`}
                  >
                    {beat.label[lang]}
                  </button>
                );
              })}
            </div>

            {/* Tidal Contour Studio Panel */}
            <div className="mt-7 rounded-[24px] border border-white/16 bg-[#1C232F]/52 p-4 backdrop-blur-[12px]">
              <TideContourCanvas
                scrollProgress={scrollProgress}
                activePhraseIndex={activeBeat}
              />

              <div className="mt-3 flex items-center justify-between border-t border-white/14 pt-3 text-xs">
                <span className="font-medium text-[#DFBC91]">
                  {currentBeat.motifTitle[lang]}
                </span>
                <span className="text-[#F6F4EF]/72 tabular-nums">
                  {copy.progressLabel} · {progressDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Right Open Broadsheet Essays (7 cols) */}
          <div className="space-y-16 lg:col-span-6 lg:col-start-7 lg:pt-4 md:space-y-24">
            {AUTHOR_BIO_BEATS.map((beat, idx) => (
              <article
                id={`notebook-beat-${idx}`}
                key={beat.id}
                data-notebook-beat={idx}
                className="space-y-6 border-t border-white/16 pt-8 first:border-t-0 first:pt-0"
              >
                <p className="text-xs font-medium text-[#DFBC91] uppercase">
                  {beat.label[lang]}
                </p>

                <p
                  className={`max-w-[60ch] text-base leading-[1.88] text-[#F6F4EF]/88 md:text-[1.08rem] ${
                    idx === 0 && lang === 'en'
                      ? 'editorial-drop-cap first-letter:float-left first-letter:mr-3.5 first-letter:mt-1 first-letter:text-[4.25rem] first-letter:leading-[0.82] first-letter:text-[#DFBC91]'
                      : ''
                  }`}
                >
                  {beat.paragraph[lang]}
                </p>

                <div className="flex flex-col gap-5 border-t border-white/14 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-editorial-serif max-w-[36ch] text-base leading-[1.7] text-[#B2C2D4] md:text-lg">
                    {beat.callout[lang]}
                  </p>
                  <div
                    data-notebook-motif
                    className="shrink-0 will-change-transform"
                  >
                    <EngravingEmblem index={idx} />
                  </div>
                </div>
              </article>
            ))}

            <p className="border-t border-white/14 pt-5 text-xs leading-[1.8] text-[#B2C2D4]/85">
              {AUTHOR_PROFILE.bioPlaceholderNote[lang]}
            </p>

            <div className="pt-2">
              <TransitionLink
                ref={archiveBtnRef}
                to="/poems"
                className="glass-light inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full px-6 py-3 text-xs font-semibold text-[#171A21] shadow-[0_12px_32px_rgba(24,28,36,0.16)] transition-all duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
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
