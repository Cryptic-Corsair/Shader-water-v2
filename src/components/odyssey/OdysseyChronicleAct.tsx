import { ArrowUpRight } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import cycleLongingDawnImg from '../../assets/images/cycle_longing_dawn_1794822855506.jpg';
import cycleMasksRealityImg from '../../assets/images/cycle_masks_reality_1794822854064.jpg';
import cycleTwilightSkyImg from '../../assets/images/cycle_twilight_sky_1794822853739.jpg';
import type { SiteLang } from '../../context/LanguageContext';
import type { CycleId } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { buildCycleVolumes } from '../home/cycleVolumesData';

const CYCLE_ARTWORKS: Record<CycleId, { src: string; alt: string }> = {
  'twilight-sky': {
    src: cycleTwilightSkyImg,
    alt: 'Twilight clouds and crescent moon glowing over calm monsoon water',
  },
  'masks-reality': {
    src: cycleMasksRealityImg,
    alt: 'Matte ceramic half-mask resting beside an open poetry notebook on sandstone',
  },
  'longing-dawn': {
    src: cycleLongingDawnImg,
    alt: 'Morning dew droplets on grass beside a handmade clay teacup at dawn',
  },
};

export interface OdysseyChronicleActProps {
  lang: SiteLang;
}

export function OdysseyChronicleAct({ lang }: OdysseyChronicleActProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const volumes = useMemo(() => buildCycleVolumes(lang), [lang]);
  const copy = getUiCopy(lang).odyssey.chronicleAct;

  // Progressive scroll-scrubbed staggered parallax across the 3 poetic cycles
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const root = sectionRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>('.odyssey-chronicle-card');
      cards.forEach((card, idx) => {
        const yOffset = idx === 1 ? -32 : 24;
        gsap.fromTo(
          card,
          { y: yOffset },
          {
            y: -yOffset,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top 80%',
              end: 'bottom 20%',
              scrub: 0.75,
            },
          }
        );
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      id="odyssey-act-chronicle"
      ref={sectionRef}
      data-testid="odyssey-chronicle-act"
      aria-label="Three poetic volumes spatial chronicle"
      className="relative w-full overflow-x-clip px-6 py-28 text-[#F6F4EF] md:px-12 md:py-36"
    >
      <div className="relative z-10 mx-auto max-w-[84rem]">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase">
              {copy.eyebrow}
            </p>
            <h2
              lang={lang}
              className="font-display display-luminous mt-2 text-[clamp(2.2rem,4.3vw,3.6rem)] leading-[1.18] font-semibold"
            >
              {copy.heading}
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-[1.8] text-[#E6DFD3]/80 md:text-base">
            {copy.subheading}
          </p>
        </div>

        {/* 3 Parallax Diorama Cards */}
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-3 lg:items-stretch">
          {volumes.map((vol) => {
            const art = CYCLE_ARTWORKS[vol.id];
            return (
              <article
                key={vol.id}
                data-testid={`odyssey-cycle-card-${vol.id}`}
                className="odyssey-chronicle-card group flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/16 bg-[#0B0E17]/88"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/12 bg-[#141A24]">
                    {failedImages[vol.id] ? (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(155deg, ${vol.horizonColors[0]} 0%, ${vol.horizonColors[1]} 60%, ${vol.horizonColors[2]}80 100%)`,
                        }}
                      />
                    ) : (
                      <img
                        src={art.src}
                        alt={art.alt}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [vol.id]: true }))
                        }
                        className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(8, 10, 16, 0.1) 0%, rgba(8, 10, 16, 0.84) 100%)',
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-4">
                      <p className="text-xs font-medium text-[#DFBC91] tabular-nums">
                        <span>{vol.indexLabel}</span>
                        <span aria-hidden="true" className="mx-2 text-white/40">
                          ·
                        </span>
                        <span className="text-[#F6F4EF]/85">{vol.countLabel}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3
                      lang={lang}
                      className="font-editorial-serif text-2xl leading-[1.28] text-[#FAF6EE]"
                    >
                      {vol.name}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.75] text-[#B2C2D4]/88">
                      {vol.tagline}
                    </p>

                    <blockquote
                      lang="bn"
                      className="font-bn-verse mt-5 border-y border-white/12 py-4 text-[1.05rem] leading-[1.82] text-[#DFBC91]"
                    >
                      <span className="block">“{vol.couplet[0]}</span>
                      <span className="block">{vol.couplet[1]}”</span>
                    </blockquote>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-white/12 px-6 py-4">
                  <span className="text-xs text-[#B2C2D4]/75 tabular-nums">
                    {vol.years}
                  </span>

                  <TransitionLink
                    to={`/poems?collection=${encodeURIComponent(vol.id)}`}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#DFBC91] transition-colors hover:text-[#FAF6EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <span>{copy.openCycleCta}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </TransitionLink>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
