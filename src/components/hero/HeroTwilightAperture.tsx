import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import heroApertureImg from '../../assets/images/hero_twilight_aperture_1794822853888.jpg';
import type { SiteLang } from '../../context/LanguageContext';
import { getCycleLabel } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import { TransitionLink } from '../PageTransition';
import { computeHorizonTilt, type HeroFolioItem } from './heroSpectacleData';

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

export interface HeroTwilightApertureProps {
  activeFolio: HeroFolioItem;
  lang: SiteLang;
  soundActive: boolean;
  reducedMotion: boolean;
  pointerNorm: { x: number; y: number };
}

export function HeroTwilightAperture({
  activeFolio,
  lang,
  soundActive,
  reducedMotion,
  pointerNorm,
}: HeroTwilightApertureProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const copy = getUiCopy(lang);
  const tilt = reducedMotion
    ? computeHorizonTilt(0, 0)
    : computeHorizonTilt(pointerNorm.x, pointerNorm.y);

  const cycleName = getCycleLabel(activeFolio.collection, lang);
  const dateDisplay = lang === 'bn' ? activeFolio.dateBn : activeFolio.dateEn;
  const noteDisplay = lang === 'bn' ? activeFolio.noteBn : activeFolio.noteEn;

  return (
    <motion.div
      data-testid="hero-twilight-aperture"
      initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.05, delay: 0.22, ease: CONTEMPLATIVE_EASE }}
      className="relative mx-auto w-full max-w-[18.25rem] sm:max-w-[24rem] lg:ml-auto lg:mr-0 lg:max-w-[27.5rem]"
      style={{ perspective: '1200px' }}
    >
      {/* Atmospheric Amber & Mist Halo Behind Aperture */}
      <motion.div
        aria-hidden="true"
        animate={
          reducedMotion
            ? undefined
            : {
                scale: soundActive ? [1, 1.06, 1] : [1, 1.025, 1],
                opacity: soundActive ? [0.65, 0.92, 0.65] : [0.48, 0.62, 0.48],
              }
        }
        transition={{
          duration: soundActive ? 4.4 : 8.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -inset-10 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 52% 44%, rgba(223, 188, 145, 0.26) 0%, rgba(178, 194, 212, 0.12) 48%, transparent 74%)',
        }}
      />

      {/* Orbital Celestial Astrolabe Rings Framing the Aperture */}
      <svg
        aria-hidden="true"
        viewBox="0 0 460 560"
        fill="none"
        className="pointer-events-none absolute -inset-7 h-[calc(100%+3.5rem)] w-[calc(100%+3.5rem)] overflow-visible"
      >
        <path
          d="M 24 236 A 212 212 0 0 1 398 76"
          stroke="rgba(223, 188, 145, 0.56)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M 436 336 A 212 212 0 0 1 68 488"
          stroke="rgba(246, 244, 239, 0.34)"
          strokeWidth="0.9"
          strokeDasharray="4 7"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="286"
          x2="452"
          y2="286"
          stroke="rgba(223, 188, 145, 0.24)"
          strokeWidth="0.8"
        />
        <circle cx="398" cy="76" r="3.5" fill="#DFBC91" fillOpacity="0.88" />
        <circle cx="68" cy="488" r="2.5" fill="#F6F4EF" fillOpacity="0.65" />
      </svg>

      {/* 3D Tilted Arched Monograph Glass Frame */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden rounded-t-[999px] rounded-b-[28px] border border-white/28 bg-[#222936] shadow-[0_34px_95px_rgba(14,18,26,0.52)] transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: reducedMotion
            ? undefined
            : `rotateX(${tilt.rotateXDeg}deg) rotateY(${tilt.rotateYDeg}deg)`,
        }}
      >
        {/* Bespoke Fine-Art Monsoon Window Photograph + CSS Fallback */}
        {imgFailed ? (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 60% 42%, rgba(223, 188, 145, 0.38) 0%, transparent 56%), linear-gradient(170deg, #3A4454 0%, #27303E 58%, #181D26 100%)',
            }}
          />
        ) : (
          <img
            src={heroApertureImg}
            alt="Rain-streaked twilight window overlooking a misty river and kodom blossoms"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out"
            style={{
              transform: reducedMotion
                ? 'scale(1.13)'
                : `scale(1.14) translate3d(${(-pointerNorm.x * 10).toFixed(1)}px, ${(-pointerNorm.y * 8).toFixed(1)}px, 0)`,
            }}
          />
        )}

        {/* Measured Contrast Scrim for Crisp Foreground Typography */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(23, 26, 33, 0.22) 0%, rgba(23, 26, 33, 0.08) 38%, rgba(20, 24, 32, 0.68) 72%, rgba(17, 20, 27, 0.92) 100%)',
          }}
        />

        {/* Pointer-Reactive Specular Glass Sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-75 transition-opacity duration-300"
          style={{
            background: `radial-gradient(56% 48% at ${tilt.glintPercentX}% ${tilt.glintPercentY}%, rgba(246, 244, 239, 0.2) 0%, rgba(223, 188, 145, 0.1) 38%, transparent 72%)`,
          }}
        />

        {/* Sound-Reactive Harmonic Ripple inside Glass */}
        {soundActive && !reducedMotion ? (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: [0.46, 0.12, 0.46], scale: [0.76, 1.03, 0.76] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-[18%] rounded-full border border-[#DFBC91]/45"
          />
        ) : null}

        {/* Inner Architectural Calibration Arch */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-t-[999px] rounded-b-[20px] border border-white/14"
        />

        {/* Top Coordinates Calibration */}
        <div className="pointer-events-none absolute inset-x-0 top-7 flex justify-center px-6">
          <span
            lang="bn"
            className="text-[11px] font-medium tracking-[0.04em] text-[#F6F4EF]/78 tabular-nums"
          >
            {activeFolio.coordinates}
          </span>
        </div>

        {/* Bottom Illuminated Folio Caption & Direct Reading Room Portal */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeFolio.id}-${lang}`}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: 0.22, ease: CONTEMPLATIVE_EASE }}
            >
              <p className="text-[11px] font-medium text-[#DFBC91]">
                <span>{cycleName}</span>
                <span aria-hidden="true" className="mx-2 text-[#F6F4EF]/45">
                  ·
                </span>
                <span lang={lang} className="tabular-nums text-[#F6F4EF]/85">
                  {dateDisplay}
                </span>
              </p>

              <h2
                lang="bn"
                className="font-bn-display mt-2 text-[clamp(1.55rem,2.4vw,2rem)] leading-[1.32] font-semibold text-[#F6F4EF]"
              >
                {activeFolio.titleBn}
              </h2>

              <p className="mt-1.5 text-xs leading-[1.65] text-[#F6F4EF]/78">
                {noteDisplay}
              </p>

              <div className="mt-4 border-t border-white/16 pt-3.5">
                <TransitionLink
                  to={`/poems/${activeFolio.slug}`}
                  data-testid="hero-aperture-read-link"
                  className="group inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#DFBC91] transition-colors hover:text-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <span>{copy.hero.folioRead}</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </TransitionLink>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
