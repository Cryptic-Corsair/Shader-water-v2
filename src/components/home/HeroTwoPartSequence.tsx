import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { useAmbientSound } from '../../context/AmbientSoundContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import {
  isTouchDevice,
  prefersReducedMotion,
  useMagnetic,
} from '../../lib/motion';
import { useSmoothScroll } from '../SmoothScrollProvider';
import { HERO_STANZA } from '../hero/heroData';
import { splitHeadlineLines } from '../hero/heroAtmosphereMath';
import { HeroMonsoonCanvas } from '../hero/HeroMonsoonCanvas';
import { HeroTwilightSculpture } from '../hero/HeroTwilightSculpture';

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

export function HeroTwoPartSequence() {
  const sequenceRef = useRef<HTMLDivElement>(null);
  const part1SectionRef = useRef<HTMLElement>(null);
  const scrollPromptRef = useRef<HTMLButtonElement>(null);

  const { lang } = useLanguage();
  const { isPlaying: soundActive } = useAmbientSound();
  const copy = getUiCopy(lang);
  const { scrollToElement } = useSmoothScroll();

  const [reducedMotion, setReducedMotion] = useState(() =>
    prefersReducedMotion()
  );

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useMagnetic(scrollPromptRef, 0.22);

  // Damped cursor physics (stiffness: 80, damping: 25) across separate depth planes
  const rawPointerX = useMotionValue(0);
  const rawPointerY = useMotionValue(0);
  const pointerX = useSpring(rawPointerX, { stiffness: 80, damping: 25 });
  const pointerY = useSpring(rawPointerY, { stiffness: 80, damping: 25 });
  const pointerTargetRef = useRef({ x: 0, y: 0 });

  const sculptureParallaxX = useTransform(pointerX, [-0.5, 0.5], [-18, 18]);
  const sculptureParallaxY = useTransform(pointerY, [-0.5, 0.5], [-14, 14]);
  const poetryParallaxX = useTransform(pointerX, [-0.5, 0.5], [6, -6]);
  const poetryParallaxY = useTransform(pointerY, [-0.5, 0.5], [4, -4]);

  // Scrollytelling: bind hero scroll progress [0..1] to gentle upward poem drift & mist dissolve
  const { scrollYProgress } = useScroll({
    target: part1SectionRef,
    offset: ['start start', 'end start'],
  });
  const poemScrollY = useTransform(scrollYProgress, [0, 1], [0, -56]);
  const poemScrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.85, 1],
    [1, 0.28, 0.14]
  );
  const mistScrollOpacity = useTransform(
    scrollYProgress,
    [0, 0.85, 1],
    [1, 0.18, 0]
  );
  const sculptureScrollY = useTransform(scrollYProgress, [0, 1], [0, -28]);
  const sculptureScrollScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 1.06]
  );

  const handleHeroPointerMove = (event: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || isTouchDevice()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const normX = (event.clientX - rect.left) / rect.width - 0.5;
    const normY = (event.clientY - rect.top) / rect.height - 0.5;
    rawPointerX.set(normX);
    rawPointerY.set(normY);
    pointerTargetRef.current = { x: normX, y: normY };
  };

  const handleHeroPointerLeave = () => {
    rawPointerX.set(0);
    rawPointerY.set(0);
    pointerTargetRef.current = { x: 0, y: 0 };
  };

  const headlineLines = splitHeadlineLines(copy.hero.headline, lang);

  return (
    <div ref={sequenceRef} className="relative w-full">
      {/* Chapter 1 — Cinematic 4-Layer Literary Monsoon Hero */}
      <section
        id="chapter-1"
        ref={part1SectionRef}
        data-bg-stage="0"
        data-snap-station
        data-sound-active={soundActive ? 'true' : 'false'}
        aria-label="Opening verse"
        onMouseMove={handleHeroPointerMove}
        onMouseLeave={handleHeroPointerLeave}
        className="relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden px-6 pt-24 pb-10 text-[#F6F4EF] md:px-12 md:pt-28 md:pb-12"
      >
        {/* Layer 1: Tactile Paper & Dusk Grain Layer (archival literary print texture, opacity 0.04) */}
        <div
          data-testid="hero-paper-grain"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperFiber'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperFiber)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '180px 180px',
          }}
        />

        {/* Layer 2: Ambient HTML5 Canvas Motion Layer (Volumetric Mist, Monsoon Rain & Luminous Motes) */}
        <motion.div
          aria-hidden="true"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.75, ease: CONTEMPLATIVE_EASE }}
          style={
            reducedMotion
              ? undefined
              : {
                  opacity: mistScrollOpacity,
                }
          }
          className="pointer-events-none absolute inset-0 z-[2]"
        >
          <HeroMonsoonCanvas
            soundActive={soundActive}
            pointerTargetRef={pointerTargetRef}
          />
          {/* Subtle upper-right twilight warmth wash behind visual centerpiece */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(56% 54% at 78% 42%, rgba(223, 188, 145, 0.12) 0%, rgba(178, 194, 212, 0.06) 46%, transparent 74%)',
            }}
          />
        </motion.div>

        {/* Main 12-Col Editorial Grid (Foreground Poetry Left + Refractive Glass Centerpiece Right) */}
        <div className="relative z-10 mx-auto grid w-full max-w-[82rem] flex-1 items-center gap-8 py-4 lg:grid-cols-12 lg:gap-10">
          {/* Layer 4: Foreground Poetry & Editorial HUD (Left 7 cols) */}
          <motion.div
            style={
              reducedMotion
                ? undefined
                : {
                    y: poemScrollY,
                    opacity: poemScrollOpacity,
                    x: poetryParallaxX,
                  }
            }
            className="relative z-20 will-change-transform lg:col-span-7"
          >
            <motion.div
              style={reducedMotion ? undefined : { y: poetryParallaxY }}
            >
              {/* Eyebrow */}
              <motion.p
                key={`hero-sub-${lang}`}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: 0.1,
                  ease: CONTEMPLATIVE_EASE,
                }}
                className="mb-5 text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase"
              >
                {copy.collectedSubtitle}
              </motion.p>

              {/* Main Bengali / English Display Headline (Line-by-line upward mask + blur-to-sharp reveal) */}
              <h1
                key={`hero-h1-${lang}`}
                lang={lang}
                className={`font-display display-luminous max-w-4xl font-semibold ${
                  lang === 'bn'
                    ? 'font-bn-display text-[clamp(2.35rem,5.2vw,4.55rem)] leading-[1.38]'
                    : 'text-[clamp(2.65rem,6.2vw,5.35rem)] leading-[1.08] tracking-[-0.03em]'
                }`}
              >
                {headlineLines.map((line, index) => (
                  <span
                    key={`${lang}-line-${index}`}
                    className="block overflow-hidden py-[0.22em] -my-[0.22em]"
                  >
                    <motion.span
                      className="block will-change-transform"
                      initial={
                        reducedMotion
                          ? false
                          : {
                              y: '100%',
                              opacity: 0,
                              filter: 'blur(6px)',
                            }
                      }
                      animate={{
                        y: '0%',
                        opacity: 1,
                        filter: 'blur(0px)',
                      }}
                      transition={{
                        duration: 0.82,
                        delay: 0.2 + index * 0.14,
                        ease: CONTEMPLATIVE_EASE,
                      }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>

              {/* Horizontal Hairline Divider with Center Crosshair (+), expanding outward from center 0.0s - 0.6s */}
              <div
                aria-hidden="true"
                data-testid="hero-horizon-divider"
                className="relative my-8 flex w-full max-w-2xl items-center justify-center md:my-9"
              >
                <motion.div
                  initial={
                    reducedMotion ? false : { scaleX: 0, opacity: 0.35 }
                  }
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.05,
                    ease: CONTEMPLATIVE_EASE,
                  }}
                  style={{ originX: 0.5 }}
                  className="h-px w-full bg-gradient-to-r from-transparent via-[#DFBC91]/70 to-transparent"
                />
                <motion.span
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: 0.2,
                    ease: CONTEMPLATIVE_EASE,
                  }}
                  className="absolute flex h-4 w-4 items-center justify-center text-[#F6F4EF]/75"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <line
                      x1="8"
                      y1="1.5"
                      x2="8"
                      y2="14.5"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <line
                      x1="1.5"
                      y1="8"
                      x2="14.5"
                      y2="8"
                      stroke="rgba(223, 188, 145, 0.85)"
                      strokeWidth="1"
                    />
                  </svg>
                </motion.span>
              </div>

              {/* Poetic Stanza: always preserved strictly in Bangla, ink-settling fade 0.6s - 1.3s */}
              <p
                key={`hero-couplet-${lang}`}
                lang="bn"
                className="font-bn-verse max-w-2xl text-[clamp(1.25rem,2.05vw,1.85rem)] leading-[1.85] text-[#F6F4EF]/94"
              >
                {HERO_STANZA.map((line, idx) => (
                  <motion.span
                    key={`stanza-line-${idx}`}
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 10, filter: 'blur(4px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.68,
                      delay: 0.62 + idx * 0.18,
                      ease: CONTEMPLATIVE_EASE,
                    }}
                    className="block py-[0.08em]"
                  >
                    {line}
                  </motion.span>
                ))}
              </p>
            </motion.div>
          </motion.div>

          {/* Layer 3: Right-Side Editorial Visual Centerpiece (Rain-rippled refractive twilight glass) */}
          <motion.div
            style={
              reducedMotion
                ? undefined
                : {
                    x: sculptureParallaxX,
                    y: sculptureScrollY,
                    scale: sculptureScrollScale,
                  }
            }
            className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center opacity-28 will-change-transform lg:pointer-events-auto lg:static lg:col-span-5 lg:translate-y-0 lg:justify-end lg:opacity-100"
          >
            <motion.div
              style={reducedMotion ? undefined : { y: sculptureParallaxY }}
              className="w-full"
            >
              <HeroTwilightSculpture
                soundActive={soundActive}
                reducedMotion={reducedMotion}
                pointerX={pointerX}
                pointerY={pointerY}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Editorial HUD Bar */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.75,
            delay: 0.85,
            ease: CONTEMPLATIVE_EASE,
          }}
          className="relative z-20 mx-auto flex w-full max-w-[82rem] items-center justify-between pt-4"
        >
          <button
            ref={scrollPromptRef}
            type="button"
            onClick={() => scrollToElement('chapter-presence', -40)}
            className="group inline-flex cursor-pointer items-center gap-3 whitespace-nowrap shrink-0 rounded-full border border-white/24 bg-[#2C333F]/52 px-5 py-2.5 text-xs font-medium text-[#F6F4EF]/92 transition-colors duration-200 hover:border-[#DFBC91]/70 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
          >
            <span>{copy.hero.scrollPrompt}</span>
            <motion.span
              aria-hidden="true"
              animate={reducedMotion ? undefined : { y: [0, 3.5, 0] }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-flex items-center"
            >
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </motion.span>
          </button>

          <span className="hidden text-xs text-[#F6F4EF]/70 sm:inline">
            {copy.hero.subtitleRight}
          </span>
        </motion.div>
      </section>
    </div>
  );
}
