import { useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import {
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../lib/motion';

const THESIS_NUMERALS_BN = ['১', '২', '৩'] as const;
const THESIS_NUMERALS_EN = ['I', 'II', 'III'] as const;

export function DepthDriftSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const backPlaneRef = useRef<HTMLDivElement>(null);
  const frontPlaneRef = useRef<HTMLDivElement>(null);
  const [activeThesis, setActiveThesis] = useState(0);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).depthDrift;
  const numerals = lang === 'bn' ? THESIS_NUMERALS_BN : THESIS_NUMERALS_EN;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const backPlane = backPlaneRef.current;
      const frontPlane = frontPlaneRef.current;
      if (!section) return;

      const theses = Array.from(
        section.querySelectorAll<HTMLElement>('[data-drift-thesis]')
      );

      theses.forEach((el, idx) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 64%',
          end: 'bottom 36%',
          onEnter: () => setActiveThesis(idx),
          onEnterBack: () => setActiveThesis(idx),
        });
      });

      const reduced = prefersReducedMotion();
      if (reduced) {
        return;
      }

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        if (backPlane) {
          gsap.fromTo(
            backPlane,
            { yPercent: -8 },
            {
              yPercent: 16,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }

        if (frontPlane) {
          gsap.fromTo(
            frontPlane,
            { yPercent: 12 },
            {
              yPercent: -24,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            }
          );
        }
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const offsets = [
    'md:ml-0 md:max-w-3xl',
    'md:ml-auto md:max-w-3xl',
    'md:mx-auto md:max-w-3xl',
  ];

  return (
    <section
      id="chapter-4"
      ref={sectionRef}
      data-bg-stage="2"
      data-snap-station
      aria-label="Multi-plane poetic drift"
      className="relative flex min-h-[150svh] w-full items-center overflow-hidden py-28 text-[#F6F4EF] md:py-40"
    >
      {/* Back Plane (yPercent: +16) */}
      <div
        ref={backPlaneRef}
        aria-hidden="true"
        data-testid="drift-back-plane"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden will-change-transform"
      >
        <svg
          viewBox="0 0 1440 1200"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full opacity-30"
        >
          <path
            d="M -60 220 C 260 120, 520 340, 880 240 C 1180 155, 1320 260, 1500 180"
            stroke="rgba(223, 215, 205, 0.28)"
            strokeWidth="1"
          />
          <path
            d="M -80 560 C 240 660, 620 440, 960 580 C 1220 685, 1360 540, 1520 600"
            stroke="rgba(246, 244, 239, 0.2)"
            strokeWidth="0.9"
            strokeDasharray="4 8"
          />
          <path
            d="M -40 930 C 310 820, 680 1020, 1040 890 C 1260 810, 1380 910, 1500 860"
            stroke="rgba(223, 188, 145, 0.25)"
            strokeWidth="1"
          />
        </svg>

        <div className="mx-auto flex h-full max-w-[84rem] flex-col justify-between px-6 py-24 md:px-12">
          <span className="font-editorial-serif select-none text-[clamp(7rem,16vw,13rem)] leading-none font-light text-[#F6F4EF]/[0.11]">
            {numerals[0]}
          </span>
          <span className="font-editorial-serif self-end select-none text-[clamp(7rem,16vw,13rem)] leading-none font-light text-[#DFBC91]/[0.12]">
            {numerals[1]}
          </span>
          <span className="font-editorial-serif self-center select-none text-[clamp(7rem,16vw,13rem)] leading-none font-light text-[#F6F4EF]/[0.10]">
            {numerals[2]}
          </span>
        </div>
      </div>

      {/* Mid Plane (yPercent: 0): 3 crisp luminous poetic theses */}
      <div className="relative z-10 mx-auto w-full max-w-[78rem] px-6 md:px-10">
        <div className="mb-16 md:mb-24">
          <p className="text-xs font-medium text-[#DFD7CD] uppercase">
            {copy.eyebrow}
          </p>
        </div>

        <div className="space-y-24 md:space-y-36">
          {copy.phrases.map((phrase, idx) => {
            const isLit = activeThesis === idx;
            return (
              <div
                key={idx}
                data-drift-thesis
                data-lit={isLit ? 'true' : 'false'}
                className={`transition-opacity duration-500 ease-out ${
                  offsets[idx] ?? ''
                } ${isLit ? 'opacity-100' : 'opacity-40'}`}
              >
                <p className="mb-3 text-xs font-medium text-[#DFBC91]">
                  {phrase.label}
                </p>
                <p
                  lang="bn"
                  className="font-bn-verse text-[clamp(1.7rem,3vw,2.75rem)] leading-[1.6] font-normal text-[#F6F4EF]"
                >
                  <span className="block">{phrase.lead}</span>
                  <span className="block text-[#DFBC91]">{phrase.accent}</span>
                </p>
                <p className="mt-4 max-w-xl text-sm leading-[1.85] text-[#F6F4EF]/80 md:text-base">
                  {phrase.note}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Front Plane (yPercent: -24): Delicate floating SVG botanical sketches & whispers */}
      <div
        ref={frontPlaneRef}
        aria-hidden="true"
        data-testid="drift-front-plane"
        className="pointer-events-none absolute inset-0 z-20 hidden overflow-hidden will-change-transform md:block"
      >
        <div className="mx-auto flex h-full max-w-[84rem] flex-col justify-around px-10 py-16">
          <div className="flex flex-col items-end self-end pr-8">
            <svg viewBox="0 0 140 160" fill="none" className="h-32 w-28">
              <path
                d="M 68 152 C 66 105, 72 58, 92 14"
                stroke="rgba(246, 244, 239, 0.42)"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d="M 68 152 C 58 112, 46 74, 28 38"
                stroke="rgba(223, 188, 145, 0.48)"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
              <path
                d="M 69 92 C 88 74, 108 62, 128 56"
                stroke="rgba(246, 244, 239, 0.34)"
                strokeWidth="0.8"
              />
            </svg>
            <span className="mt-2 text-[11px] font-medium text-[#DFD7CD]/75">
              {copy.whispers[0]}
            </span>
          </div>

          <div className="flex flex-col items-start self-start pl-4">
            <svg viewBox="0 0 120 120" fill="none" className="h-24 w-24">
              <circle
                cx="60"
                cy="60"
                r="42"
                stroke="rgba(223, 188, 145, 0.38)"
                strokeWidth="0.85"
                strokeDasharray="3 6"
              />
              <line
                x1="60"
                y1="8"
                x2="60"
                y2="112"
                stroke="rgba(246, 244, 239, 0.36)"
                strokeWidth="0.85"
              />
              <circle cx="60" cy="60" r="3" fill="rgba(223, 188, 145, 0.72)" />
            </svg>
            <span className="mt-2 text-[11px] font-medium text-[#DFD7CD]/75">
              {copy.whispers[1]}
            </span>
          </div>

          <div className="flex flex-col items-end self-end pr-14">
            <svg viewBox="0 0 180 72" fill="none" className="h-16 w-40">
              <path
                d="M 8 44 Q 48 16, 92 40 T 172 32"
                stroke="rgba(246, 244, 239, 0.45)"
                strokeWidth="1"
                strokeLinecap="round"
              />
              <path
                d="M 18 58 Q 62 34, 104 52 T 168 46"
                stroke="rgba(223, 188, 145, 0.42)"
                strokeWidth="0.85"
                strokeLinecap="round"
              />
            </svg>
            <span className="mt-2 text-[11px] font-medium text-[#DFD7CD]/75">
              {copy.whispers[2]}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
