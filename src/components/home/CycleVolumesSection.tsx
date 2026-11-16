import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Layers } from 'lucide-react';
import cycleLongingDawnImg from '../../assets/images/cycle_longing_dawn_1794822855506.jpg';
import cycleMasksRealityImg from '../../assets/images/cycle_masks_reality_1794822854064.jpg';
import cycleTwilightSkyImg from '../../assets/images/cycle_twilight_sky_1794822853739.jpg';
import { useLanguage } from '../../context/LanguageContext';
import { toBanglaNumerals, type CycleId } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import { TransitionLink } from '../PageTransition';
import { CyclePoemDrawer } from './CyclePoemDrawer';
import { buildCycleVolumes } from './cycleVolumesData';

const VOLUME_IMAGES: Record<CycleId, { src: string; alt: string }> = {
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

export function CycleVolumesSection() {
  const { lang } = useLanguage();
  const copy = getUiCopy(lang).carousel;

  const volumes = useMemo(() => buildCycleVolumes(lang), [lang]);
  const [drawerCycleId, setDrawerCycleId] = useState<CycleId | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const activeVolume = useMemo(
    () => volumes.find((v) => v.id === drawerCycleId) ?? null,
    [volumes, drawerCycleId]
  );

  const activeArtwork = activeVolume
    ? VOLUME_IMAGES[activeVolume.id]
    : VOLUME_IMAGES['twilight-sky'];

  const handleOpenDrawer = (
    cycleId: CycleId,
    triggerEl: HTMLButtonElement | null
  ) => {
    lastTriggerRef.current = triggerEl;
    setDrawerCycleId(cycleId);
  };

  const handleCloseDrawer = useCallback(() => {
    setDrawerCycleId(null);
    window.requestAnimationFrame(() => {
      lastTriggerRef.current?.focus();
    });
  }, []);

  const handleStepCycle = useCallback(
    (delta: -1 | 1) => {
      if (!drawerCycleId) return;
      const idx = volumes.findIndex((v) => v.id === drawerCycleId);
      if (idx === -1) return;
      const nextIdx = (idx + delta + volumes.length) % volumes.length;
      setDrawerCycleId(volumes[nextIdx].id);
    },
    [drawerCycleId, volumes]
  );

  return (
    <section
      id="chapter-cycles"
      data-bg-stage="2"
      data-snap-station
      aria-label="Three poetic volumes showcase"
      className="relative w-full overflow-x-clip py-24 text-[#F6F4EF] md:py-32"
    >
      <div className="mx-auto max-w-[82rem] px-6 md:px-10">
        {/* Editorial Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.2rem,4.4vw,3.75rem)] leading-[1.18] font-semibold">
              {copy.heading}
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-[1.8] text-[#F6F4EF]/78 md:text-base">
            {copy.subheading}
          </p>
        </div>

        {/* Side-by-Side 3-Column Equal-Height Poetic Cycle Cards */}
        <div
          data-testid="cycles-side-by-side-grid"
          className="mt-10 grid grid-cols-1 gap-6 md:mt-12 lg:grid-cols-3 lg:items-stretch"
        >
          {volumes.map((vol) => {
            const artwork = VOLUME_IMAGES[vol.id];
            const amp = vol.waveAmplitude;
            const waveY = 66 + Math.sin(vol.wavePhase) * amp * 0.35;
            const countNum =
              lang === 'bn'
                ? toBanglaNumerals(vol.poems.length)
                : String(vol.poems.length);
            const isDrawerActive = drawerCycleId === vol.id;

            return (
              <article
                key={vol.id}
                data-testid={`cycle-card-${vol.id}`}
                className={`group flex flex-col justify-between overflow-hidden rounded-[24px] border bg-[#19202B]/72 shadow-[0_24px_64px_rgba(12,16,24,0.34)] backdrop-blur-[16px] transition-all duration-200 hover:-translate-y-1 ${
                  isDrawerActive
                    ? 'border-[#DFBC91]/70'
                    : 'border-white/18 hover:border-white/32'
                }`}
              >
                <div>
                  {/* Aspect-Matched Atmospheric Plate */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-white/12 bg-[#232B38]">
                    {failedImages[vol.id] ? (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(155deg, ${vol.horizonColors[0]} 0%, ${vol.horizonColors[1]} 58%, ${vol.horizonColors[2]}88 100%)`,
                        }}
                      />
                    ) : (
                      <img
                        src={artwork.src}
                        alt={artwork.alt}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [vol.id]: true,
                          }))
                        }
                        className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      />
                    )}

                    {/* Contrast Scrim & Subtle SVG Wave */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(18, 22, 30, 0.14) 0%, rgba(18, 22, 30, 0.12) 48%, rgba(18, 22, 30, 0.86) 100%)',
                      }}
                    />

                    <svg
                      aria-hidden="true"
                      viewBox="0 0 420 100"
                      preserveAspectRatio="none"
                      fill="none"
                      className="pointer-events-none absolute inset-x-0 bottom-4 h-16 w-full opacity-65"
                    >
                      <path
                        d={`M 0 ${waveY} Q 105 ${waveY - amp}, 210 ${waveY} T 420 ${waveY}`}
                        stroke="#DFBC91"
                        strokeOpacity="0.62"
                        strokeWidth="1.2"
                      />
                    </svg>

                    {/* Clean Unboxed Plate Caption */}
                    <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-4">
                      <p className="text-xs font-medium text-[#DFBC91] tabular-nums">
                        <span>
                          {copy.volumeLabel} {vol.indexLabel}
                        </span>
                        <span aria-hidden="true" className="mx-2 text-white/40">
                          ·
                        </span>
                        <span className="text-[#F6F4EF]/85">
                          {vol.countLabel}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3
                      lang={lang}
                      className="font-editorial-serif text-[clamp(1.5rem,2.1vw,1.85rem)] leading-[1.3] font-normal text-[#F6F4EF]"
                    >
                      {vol.name}
                    </h3>

                    <p className="mt-2 text-sm leading-[1.75] text-[#F6F4EF]/76">
                      {vol.tagline}
                    </p>

                    <blockquote
                      lang="bn"
                      className="font-bn-verse mt-5 border-y border-white/12 py-4 text-[1.06rem] leading-[1.82] text-[#DFBC91]"
                    >
                      <span className="block">“{vol.couplet[0]}</span>
                      <span className="block">{vol.couplet[1]}”</span>
                    </blockquote>

                    <p className="mt-4 text-xs text-[#B2C2D4]/80 tabular-nums">
                      {vol.years}
                    </p>
                  </div>
                </div>

                {/* Clear Card Actions */}
                <div className="flex items-center justify-between gap-3 border-t border-white/12 bg-white/[0.02] px-6 py-4">
                  <button
                    type="button"
                    onClick={(e) => handleOpenDrawer(vol.id, e.currentTarget)}
                    data-testid={`open-cycle-drawer-${vol.id}`}
                    className="glass-light inline-flex cursor-pointer items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-[#171A21] shadow-[0_8px_22px_rgba(12,16,24,0.24)] transition-all duration-200 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {copy.preview} · {countNum}
                    </span>
                  </button>

                  <TransitionLink
                    to={`/poems?collection=${encodeURIComponent(vol.id)}`}
                    data-testid={`open-cycle-archive-${vol.id}`}
                    className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-xs font-semibold text-[#F6F4EF]/82 transition-colors hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <span>{copy.openCycle}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </TransitionLink>
                </div>
              </article>
            );
          })}
        </div>

        {/* Section Bottom Archive Link */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-5 text-xs text-[#F6F4EF]/68">
          <span>{copy.hint}</span>
          <TransitionLink
            to="/poems"
            className="inline-flex items-center gap-1.5 font-semibold text-[#DFBC91] transition-colors hover:text-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
          >
            <span>{copy.exploreArchiveCycle}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </TransitionLink>
        </div>
      </div>

      {/* Instant Slide-Over Poem Drawer */}
      <CyclePoemDrawer
        volume={activeVolume}
        artworkSrc={activeArtwork.src}
        artworkAlt={activeArtwork.alt}
        lang={lang}
        onClose={handleCloseDrawer}
        onStepCycle={handleStepCycle}
      />
    </section>
  );
}
