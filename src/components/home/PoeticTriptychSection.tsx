import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import {
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { useSmoothScroll } from '../SmoothScrollProvider';

const WAVE_PATHS = [
  'M 0 68 C 72 28, 150 96, 224 54 C 290 18, 344 74, 400 44',
  'M 0 54 C 86 92, 148 16, 226 60 C 296 98, 352 32, 400 58',
  'M 0 46 C 78 24, 156 86, 228 48 C 296 16, 354 68, 400 36',
] as const;

export function PoeticTriptychSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeMovement, setActiveMovement] = useState(0);
  const { lang } = useLanguage();
  const copy = getUiCopy(lang).depthDrift;
  const { scrollToElement } = useSmoothScroll();

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const items = Array.from(
        section.querySelectorAll<HTMLElement>('[data-triptych-item]')
      );

      items.forEach((el, idx) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 38%',
          onEnter: () => setActiveMovement(idx),
          onEnterBack: () => setActiveMovement(idx),
        });
      });

      if (!prefersReducedMotion()) {
        items.forEach((el) => {
          gsap.fromTo(
            el,
            { y: 18, opacity: 0.72 },
            {
              y: 0,
              opacity: 1,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: el,
                start: 'top 86%',
                end: 'top 48%',
                scrub: 0.6,
              },
            }
          );
        });
      }

      ScrollTrigger.refresh();
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const activePhrase = copy.phrases[activeMovement] ?? copy.phrases[0];

  return (
    <section
      id="chapter-4"
      ref={sectionRef}
      data-bg-stage="2"
      data-snap-station
      aria-label="Poetic triptych and cadence"
      className="relative w-full overflow-x-clip py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="mx-auto max-w-[82rem] px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
          {/* Sticky Left Cadence Instrument (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-[18vh]">
            <p className="text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase">
              {copy.eyebrow}
            </p>
            <h2
              lang="bn"
              className="font-bn-display display-luminous mt-3 text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.28] font-semibold"
            >
              {lang === 'bn'
                ? 'তিনটি কাব্যিক মুহূর্ত'
                : 'Three Poetic Movements'}
            </h2>

            {/* Interactive Movement Selector List */}
            <div className="mt-8 border-t border-white/14">
              {copy.phrases.map((phrase, idx) => {
                const isActive = idx === activeMovement;
                return (
                  <button
                    key={idx}
                    type="button"
                    data-testid={`triptych-nav-${idx}`}
                    onClick={() => {
                      setActiveMovement(idx);
                      scrollToElement(`triptych-act-${idx}`, -120);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between gap-4 border-b border-white/14 py-4 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                      isActive
                        ? 'text-[#F6F4EF]'
                        : 'text-[#F6F4EF]/58 hover:text-[#F6F4EF]/88'
                    }`}
                  >
                    <span className="text-xs font-medium tabular-nums">
                      {phrase.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                        isActive ? 'bg-[#DFBC91] w-8' : 'bg-white/22 w-3'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Bespoke SVG Horizon Waveform Visual */}
            <div className="mt-8 rounded-2xl border border-white/14 bg-[#1E2531]/42 p-5 backdrop-blur-[12px]">
              <svg
                aria-hidden="true"
                viewBox="0 0 400 100"
                fill="none"
                className="h-20 w-full"
              >
                <line
                  x1="0"
                  y1="52"
                  x2="400"
                  y2="52"
                  stroke="rgba(246, 244, 239, 0.14)"
                  strokeWidth="0.75"
                  strokeDasharray="3 6"
                />
                <path
                  d={WAVE_PATHS[activeMovement] ?? WAVE_PATHS[0]}
                  stroke="#DFBC91"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  style={{ transition: 'd 420ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
                <circle
                  cx={110 + activeMovement * 95}
                  cy={52}
                  r="4"
                  fill="#DFBC91"
                />
              </svg>
              <p className="mt-2 text-xs text-[#B2C2D4] tabular-nums">
                {copy.whispers[activeMovement] ?? copy.whispers[0]}
              </p>
              <p className="mt-1 text-xs leading-[1.65] text-[#F6F4EF]/76">
                {activePhrase.note}
              </p>
            </div>
          </div>

          {/* Right Open Broadsheet Triptych (7 cols) */}
          <div className="space-y-16 lg:col-span-7 md:space-y-24">
            {copy.phrases.map((phrase, idx) => {
              const isLit = activeMovement === idx;
              const slug = copy.movementSlugs[idx] ?? 'mukhosher-antarale';

              return (
                <article
                  id={`triptych-act-${idx}`}
                  key={idx}
                  data-triptych-item
                  data-testid={`triptych-act-${idx}`}
                  data-lit={isLit ? 'true' : 'false'}
                  className={`border-t border-white/18 pt-8 transition-opacity duration-500 ${
                    isLit ? 'opacity-100' : 'opacity-65'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-medium text-[#DFBC91] tabular-nums">
                      {phrase.label}
                    </span>
                    <span className="text-xs text-[#B2C2D4]/85">
                      {copy.whispers[idx]}
                    </span>
                  </div>

                  <blockquote
                    lang="bn"
                    className="font-bn-verse mt-6 text-[clamp(1.65rem,2.85vw,2.55rem)] leading-[1.68] font-normal text-[#F6F4EF]"
                  >
                    <span className="block">{phrase.lead}</span>
                    <span className="mt-1 block text-[#DFBC91]">
                      {phrase.accent}
                    </span>
                  </blockquote>

                  <p className="mt-6 max-w-[58ch] text-sm leading-[1.85] text-[#F6F4EF]/82 md:text-base">
                    {phrase.note}
                  </p>

                  <div className="mt-6">
                    <TransitionLink
                      to={`/poems/${slug}`}
                      className="group inline-flex items-center gap-2 text-xs font-semibold text-[#DFBC91] transition-colors hover:text-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                    >
                      <span>{copy.readMovement}</span>
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </TransitionLink>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
