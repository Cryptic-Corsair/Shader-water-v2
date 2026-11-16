import { useId } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';

export interface HeroTwilightSculptureProps {
  soundActive: boolean;
  reducedMotion: boolean;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

export function HeroTwilightSculpture({
  soundActive,
  reducedMotion,
  pointerX,
  pointerY,
}: HeroTwilightSculptureProps) {
  const uid = useId().replace(/:/g, '');
  const filterId = `twilight-rain-glass-${uid}`;
  const blurSoftId = `twilight-soft-blur-${uid}`;
  const skyGradId = `twilight-sky-${uid}`;
  const sunSmearId = `twilight-sun-smear-${uid}`;
  const cloudGlowId = `twilight-cloud-glow-${uid}`;
  const waterGlowId = `twilight-water-glow-${uid}`;
  const waterDeepId = `twilight-water-deep-${uid}`;
  const clipPaneId = `twilight-pane-clip-${uid}`;

  // Separate depth plane offsets for refractive light sheen & sculptural tilt
  const sheenX = useTransform(pointerX, [-0.5, 0.5], ['-18%', '18%']);
  const sheenY = useTransform(pointerY, [-0.5, 0.5], ['-14%', '14%']);
  const innerDriftX = useTransform(pointerX, [-0.5, 0.5], [10, -10]);
  const innerDriftY = useTransform(pointerY, [-0.5, 0.5], [8, -8]);

  return (
    <motion.div
      data-testid="hero-twilight-sculpture"
      aria-hidden="true"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.3, delay: 0.25, ease: CONTEMPLATIVE_EASE }}
      className="relative mx-auto w-full max-w-[20.5rem] select-none sm:max-w-[23.5rem] lg:max-w-[26.5rem]"
    >
      {/* Ambient feathered dusk aura behind sculpture */}
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                scale: soundActive ? [1, 1.07, 1] : [1, 1.025, 1],
                opacity: soundActive ? [0.6, 0.9, 0.6] : [0.46, 0.58, 0.46],
              }
        }
        transition={{
          duration: soundActive ? 4.2 : 8.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="pointer-events-none absolute -inset-12 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 52% 48%, rgba(223, 188, 145, 0.24) 0%, rgba(178, 194, 212, 0.12) 45%, transparent 72%)',
        }}
      />

      {/* Slow contemplative breathing float wrapper — arched twilight glass window */}
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                y: [0, -7, 0],
              }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[999px] rounded-b-[110px] border border-white/24 shadow-[0_32px_90px_rgba(20,25,34,0.34)] will-change-transform"
        style={{
          background:
            'linear-gradient(168deg, rgba(246, 244, 239, 0.12) 0%, rgba(178, 194, 212, 0.08) 46%, rgba(44, 51, 63, 0.36) 100%)',
        }}
      >
        {/* Refracted Liquid Ink & Twilight Horizon SVG */}
        <div
          className="absolute -inset-2 will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <svg
            viewBox="0 0 400 500"
            fill="none"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <clipPath id={clipPaneId}>
                <path d="M 0 200 C 0 89.54 89.54 0 200 0 C 310.46 0 400 89.54 400 200 L 400 390 C 400 450.75 350.75 500 290 500 L 110 500 C 49.25 500 0 450.75 0 390 Z" />
              </clipPath>

              {/* Soft optical blur for organic mist & sunset washes (zero hard ellipses) */}
              <filter id={blurSoftId} x="-25%" y="-25%" width="150%" height="150%">
                <feGaussianBlur stdDeviation="20" />
              </filter>

              {/* Rain-rippled liquid glass refraction filter applied ONLY to horizon light/ink wash */}
              <filter
                id={filterId}
                x="-6%"
                y="-6%"
                width="112%"
                height="112%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.015 0.042"
                  numOctaves="1"
                  seed="23"
                  result="rainNoise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="rainNoise"
                  scale={soundActive ? '18' : '11'}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>

              <linearGradient id={skyGradId} x1="0.15" y1="0" x2="0.85" y2="1">
                <stop offset="0%" stopColor="#465060" stopOpacity="0.85" />
                <stop offset="46%" stopColor="#5C6676" stopOpacity="0.62" />
                <stop offset="68%" stopColor="#7C7778" stopOpacity="0.54" />
                <stop offset="100%" stopColor="#2B323E" stopOpacity="0.94" />
              </linearGradient>

              <radialGradient id={cloudGlowId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EFEAE2" stopOpacity="0.34" />
                <stop offset="48%" stopColor="#C6BEB4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#5A6372" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={sunSmearId} cx="52%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F3DEC2" stopOpacity="0.85" />
                <stop offset="32%" stopColor="#DFBC91" stopOpacity="0.52" />
                <stop offset="65%" stopColor="#B48172" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#4C5563" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={waterGlowId} cx="50%" cy="45%" r="50%">
                <stop offset="0%" stopColor="#DFBC91" stopOpacity="0.56" />
                <stop offset="48%" stopColor="#B88774" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#2C333F" stopOpacity="0" />
              </radialGradient>

              <linearGradient id={waterDeepId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2C333F" stopOpacity="0.72" />
                <stop offset="100%" stopColor="#1D222B" stopOpacity="0.92" />
              </linearGradient>
            </defs>

            <g clipPath={`url(#${clipPaneId})`}>
              {/* Base Dusk Sky & Horizon Atmosphere */}
              <rect x="0" y="0" width="400" height="500" fill={`url(#${skyGradId})`} />

              {/* Soft Feathered Cloud Drift (blurred radial washes, zero hard ovals) */}
              <g filter={`url(#${blurSoftId})`}>
                <ellipse cx="230" cy="142" rx="145" ry="86" fill={`url(#${cloudGlowId})`} />
                <ellipse cx="145" cy="198" rx="125" ry="64" fill="#B2C2D4" fillOpacity="0.16" />
              </g>

              {/* Refracted Liquid-Ink Horizon & Blood-Sunset Water Smear */}
              <g filter={`url(#${filterId})`}>
                {/* Setting dusk sun bleed behind monsoon cloud */}
                <ellipse cx="222" cy="278" rx="135" ry="96" fill={`url(#${sunSmearId})`} />

                {/* Distant soft monsoon bank */}
                <path
                  d="M -20 314 Q 95 298 205 310 T 420 302 L 420 520 L -20 520 Z"
                  fill={`url(#${waterDeepId})`}
                />

                {/* Shimmering vertical water reflection */}
                <ellipse cx="218" cy="348" rx="88" ry="26" fill={`url(#${waterGlowId})`} />
                <ellipse cx="218" cy="396" rx="52" ry="44" fill={`url(#${waterGlowId})`} opacity="0.55" />
              </g>

              {/* Crisp Concentric Raindrop Ripples on Water Surface */}
              <g>
                <ellipse
                  cx="216"
                  cy="354"
                  rx="44"
                  ry="8"
                  stroke="#F6F4EF"
                  strokeOpacity="0.34"
                  strokeWidth="0.95"
                />
                <ellipse
                  cx="216"
                  cy="354"
                  rx="82"
                  ry="14"
                  stroke="#DFBC91"
                  strokeOpacity="0.28"
                  strokeWidth="0.85"
                />
                <ellipse
                  cx="216"
                  cy="354"
                  rx="126"
                  ry="20"
                  stroke="#F6F4EF"
                  strokeOpacity="0.14"
                  strokeWidth="0.7"
                />
              </g>

              {/* Razor-Crisp Monsoon Botanical Reed Silhouette & Rain-Beaded Kadam Stems */}
              <g>
                {/* Primary slender sweeping reed */}
                <path
                  d="M 118 505 C 128 415 148 334 176 248 C 186 218 198 192 214 168"
                  stroke="#1E242E"
                  strokeOpacity="0.72"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                />
                {/* Graceful leaf blades */}
                <path
                  d="M 155 336 C 128 312 104 300 84 294"
                  stroke="#1E242E"
                  strokeOpacity="0.62"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />
                <path
                  d="M 172 280 C 202 260 226 246 248 238"
                  stroke="#1E242E"
                  strokeOpacity="0.56"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
                <path
                  d="M 142 384 C 166 364 188 352 210 344"
                  stroke="#1E242E"
                  strokeOpacity="0.48"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />
                {/* Secondary delicate grass arc */}
                <path
                  d="M 146 505 C 154 440 144 396 124 352"
                  stroke="#1E242E"
                  strokeOpacity="0.52"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                />
                {/* Luminous raindrop / kadam bud resting at the reed apex */}
                <circle cx="215" cy="166" r="4.5" fill="#DFBC91" fillOpacity="0.72" />
                <circle cx="213.8" cy="164.6" r="1.6" fill="#F6F4EF" fillOpacity="0.9" />
              </g>

              {/* Crisp Glass-Surface Rain Threads & Dew Beads */}
              <g opacity="0.72">
                <line
                  x1="142"
                  y1="62"
                  x2="128"
                  y2="164"
                  stroke="#F6F4EF"
                  strokeOpacity="0.34"
                  strokeWidth="0.85"
                />
                <line
                  x1="286"
                  y1="88"
                  x2="266"
                  y2="216"
                  stroke="#DFBC91"
                  strokeOpacity="0.42"
                  strokeWidth="0.9"
                />
                <line
                  x1="322"
                  y1="146"
                  x2="306"
                  y2="254"
                  stroke="#F6F4EF"
                  strokeOpacity="0.26"
                  strokeWidth="0.7"
                />
                <line
                  x1="92"
                  y1="186"
                  x2="80"
                  y2="268"
                  stroke="#F6F4EF"
                  strokeOpacity="0.22"
                  strokeWidth="0.65"
                />
                <circle cx="128" cy="167" r="1.7" fill="#F6F4EF" fillOpacity="0.74" />
                <circle cx="266" cy="219" r="2.0" fill="#DFBC91" fillOpacity="0.82" />
                <circle cx="232" cy="122" r="1.4" fill="#F6F4EF" fillOpacity="0.56" />
                <circle cx="306" cy="257" r="1.4" fill="#F6F4EF" fillOpacity="0.48" />
              </g>

              {/* Inner Architectural Hairline Arch & Horizon Calibration Ticks */}
              <path
                d="M 16 202 C 16 100.38 98.38 18 200 18 C 301.62 18 384 100.38 384 202 L 384 388 C 384 440.47 341.47 483 289 483 L 111 483 C 58.53 483 16 440.47 16 388 Z"
                stroke="rgba(246, 244, 239, 0.16)"
                strokeWidth="0.85"
              />
              <line
                x1="200"
                y1="10"
                x2="200"
                y2="26"
                stroke="rgba(223, 188, 145, 0.7)"
                strokeWidth="1"
              />
              <line
                x1="10"
                y1="308"
                x2="26"
                y2="308"
                stroke="rgba(223, 188, 145, 0.45)"
                strokeWidth="0.9"
              />
              <line
                x1="374"
                y1="308"
                x2="390"
                y2="308"
                stroke="rgba(223, 188, 145, 0.45)"
                strokeWidth="0.9"
              />
            </g>
          </svg>
        </div>

        {/* Pointer-reactive soft radial glass light refraction */}
        <motion.div
          style={
            reducedMotion
              ? undefined
              : { x: sheenX, y: sheenY }
          }
          className="pointer-events-none absolute -inset-8 opacity-80 will-change-transform"
        >
          <motion.div
            style={
              reducedMotion
                ? undefined
                : { x: innerDriftX, y: innerDriftY }
            }
            className="h-full w-full"
          >
            <div
              className="h-full w-full"
              style={{
                background:
                  'radial-gradient(52% 46% at 46% 36%, rgba(246, 244, 239, 0.22) 0%, rgba(223, 188, 145, 0.14) 40%, transparent 72%)',
              }}
            />
          </motion.div>
        </motion.div>

        {/* Sound-reactive harmonic water-ripple pulse inside glass */}
        {soundActive && !reducedMotion ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: [0.48, 0.12, 0.48], scale: [0.78, 1.04, 0.78] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-[16%] rounded-full border border-[#DFBC91]/42"
          />
        ) : null}

        {/* Subtle inner glass rim highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-t-[999px] rounded-b-[110px]"
          style={{
            boxShadow: 'inset 0 1px 22px rgba(246, 244, 239, 0.14)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
