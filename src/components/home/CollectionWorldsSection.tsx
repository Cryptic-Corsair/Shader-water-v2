import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { GenerativePlate } from '../art/GenerativePlate';
import { getCollectionWorlds, type CollectionWorldItem } from './versesLogic';

function CycleEditorialRow({
  world,
  index,
}: {
  world: CollectionWorldItem;
  index: number;
}) {
  const rowRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const row = rowRef.current;
      if (!row || prefersReducedMotion()) return;

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        const xOffset = index === 0 ? -16 : index === 1 ? 18 : -10;
        gsap.fromTo(
          row,
          { x: -xOffset * 0.5 },
          {
            x: xOffset,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: row,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      });

      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: rowRef, dependencies: [index] }
  );

  const asymmetricIndent =
    index === 0
      ? 'lg:pl-0 lg:pr-8'
      : index === 1
        ? 'lg:pl-12 lg:pr-0'
        : 'lg:pl-4 lg:pr-10';

  return (
    <TransitionLink
      ref={rowRef}
      to={`/poems?collection=${encodeURIComponent(world.id)}`}
      data-testid={`collection-card-${world.id}`}
      className={`group grid grid-cols-1 items-center gap-7 border-t border-white/15 py-10 transition-colors duration-300 last:border-b hover:border-[#DFBC91]/45 hover:bg-white/[0.025] md:grid-cols-12 md:gap-8 md:py-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${asymmetricIndent}`}
    >
      {/* Left: Cycle Metadata & Large Display Title (5 cols) */}
      <div className="md:col-span-5">
        <p className="text-xs font-medium text-[#F6F4EF]/72">
          <span>{world.years}</span>
          <span aria-hidden="true" className="mx-2 text-[#DFBC91]">
            ·
          </span>
          <span>{world.count}টি কবিতা</span>
        </p>

        <h3 lang="bn" className="font-bn-display mt-3 text-[clamp(1.9rem,3.3vw,3rem)] leading-[1.24] font-semibold text-[#F6F4EF] transition-colors duration-300 group-hover:text-[#DFBC91]">
          {world.name}
        </h3>

        <p lang="bn" className="font-bn-ui mt-3 max-w-sm text-sm leading-relaxed text-[#F6F4EF]/74">
          {world.tagline}
        </p>
      </div>

      {/* Center: Generative Atmospheric Artwork Plate (3 cols) */}
      <div className="md:col-span-3">
        <GenerativePlate
          collection={world.id}
          className="aspect-[16/10] w-full max-w-[16rem] md:max-w-none"
        />
      </div>

      {/* Right: Italicized Excerpt & Open Affordance (4 cols) */}
      <div className="flex flex-col justify-between gap-5 md:col-span-4 md:items-end md:text-right">
        <p className="font-editorial-serif max-w-sm text-[1.22rem] leading-[1.45] font-normal italic text-[#F6F4EF]/88">
          “{world.excerpt}”
        </p>

        <span className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] text-[#DFBC91] transition-colors group-hover:text-[#F6F4EF]">
          <span>Open Cycle</span>
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </TransitionLink>
  );
}

export function CollectionWorldsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const worlds = getCollectionWorlds();

  return (
    <section
      ref={sectionRef}
      data-snap-station
      aria-label="Three Cycles"
      className="relative w-full overflow-x-clip py-20 text-[#F6F4EF] md:py-28"
    >
      <div className="relative z-10 mx-auto max-w-[82rem] px-6 md:px-10">
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-editorial-serif display-luminous text-[clamp(2.35rem,4.4vw,3.85rem)] leading-[1.04] font-normal tracking-[-0.015em]">
              Three Cycles
            </h2>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-[#F6F4EF]/76">
            Each book inhabits its own weather, tidal pace, and light—select a
            cycle to read its works together.
          </p>
        </div>

        <div className="flex flex-col">
          {worlds.map((world, idx) => (
            <CycleEditorialRow key={world.name} world={world} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
