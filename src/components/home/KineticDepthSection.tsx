import { useRef, useState } from 'react';
import {
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../lib/motion';
import { TideContourCanvas } from '../art/TideContourCanvas';
import { KINETIC_DEPTH_PHRASES } from './versesLogic';

export function KineticDepthSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const effectiveActive = hoveredIndex ?? activeIndex;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const reduced = prefersReducedMotion();

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top 72%',
        end: 'bottom 35%',
        onUpdate(self) {
          setScrollProgress(self.progress);
          const nextIdx = Math.min(
            KINETIC_DEPTH_PHRASES.length - 1,
            Math.max(
              0,
              Math.floor(self.progress * KINETIC_DEPTH_PHRASES.length)
            )
          );
          setActiveIndex(nextIdx);
        },
      });

      if (!reduced) {
        const layers = Array.from(
          section.querySelectorAll<HTMLElement>('[data-depth-layer]')
        );
        layers.forEach((layer, idx) => {
          gsap.fromTo(
            layer,
            { y: 18 },
            {
              y: idx === 1 ? -8 : -4,
              ease: 'none',
              immediateRender: false,
              scrollTrigger: {
                trigger: layer,
                start: 'top 92%',
                end: 'bottom 35%',
                scrub: 0.7,
              },
            }
          );
        });
      }

      ScrollTrigger.refresh();

      return () => {
        trigger.kill();
      };
    },
    { scope: sectionRef }
  );

  const staggers = ['lg:pl-0', 'lg:pl-10', 'lg:pl-4'];

  return (
    <section
      ref={sectionRef}
      id="kinetic-depth-anchor"
      data-snap-station
      aria-label="Interactive poetic stage"
      className="relative flex min-h-[82svh] w-full flex-col justify-center overflow-x-clip py-20 text-[#F6F4EF] md:py-28"
    >
      <div className="relative z-10 mx-auto w-full max-w-[82rem] px-6 md:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left (7 cols): Crisp Staggered Cormorant Lines with Scroll Illumination */}
          <div className="space-y-10 lg:col-span-7 md:space-y-12">
            {KINETIC_DEPTH_PHRASES.map((phrase, idx) => {
              const isActive = effectiveActive === idx;

              return (
                <button
                  key={phrase.id}
                  type="button"
                  data-depth-layer
                  data-active={isActive ? 'true' : 'false'}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(idx)}
                  onBlur={() => setHoveredIndex(null)}
                  onClick={() => setActiveIndex(idx)}
                  className={`block w-full cursor-pointer border-0 bg-transparent text-left transition-opacity duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    staggers[idx] ?? ''
                  } ${isActive ? 'opacity-100' : 'opacity-35 hover:opacity-70'}`}
                >
                  <p className="font-editorial-serif text-[clamp(1.7rem,3vw,2.7rem)] leading-[1.2] font-normal tracking-[-0.015em] text-[#F6F4EF]">
                    {phrase.lead}{' '}
                    <span className="italic text-[#DFBC91]">
                      {phrase.accent}
                    </span>
                  </p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#F6F4EF]/82">
                    {phrase.note}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right (5 cols): Live Generative Horizon & Tide-Wave Contour Drawing */}
          <div className="lg:col-span-5">
            <div className="relative">
              <TideContourCanvas
                scrollProgress={scrollProgress}
                activePhraseIndex={effectiveActive}
              />
              <div className="mt-3 flex items-center justify-between text-xs text-[#F6F4EF]/65">
                <span>Tidal horizon contour</span>
                <span className="text-[#DFBC91]">
                  Stanza 0{effectiveActive + 1} / 0{KINETIC_DEPTH_PHRASES.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
