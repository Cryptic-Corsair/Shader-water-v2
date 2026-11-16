import { useRef } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { formatReadingTime } from '../../data/poemsCatalog';
import {
  EDITORIAL_EASE,
  EDITORIAL_EASE_EXPO,
  SplitText,
  gsap,
  isTouchDevice,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { useSmoothScroll } from '../SmoothScrollProvider';
import { LiquidMetalBezel } from '../shaders/LiquidMetalBezel';
import { HERO_STANZA, getFeaturedTodayPoem } from './heroData';

export function HeroMasterclass() {
  const heroRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const stanzaRef = useRef<HTMLParagraphElement>(null);
  const bezelWrapperRef = useRef<HTMLDivElement>(null);
  const primaryCtaRef = useRef<HTMLAnchorElement>(null);
  const scrollCtaRef = useRef<HTMLButtonElement>(null);

  const { lenis } = useSmoothScroll();
  const featuredPoem = getFeaturedTodayPoem();

  useMagnetic(primaryCtaRef, 0.22);
  useMagnetic(scrollCtaRef, 0.2);

  useGSAP(
    () => {
      const heroEl = heroRef.current;
      const headlineEl = headlineRef.current;
      const stanzaEl = stanzaRef.current;
      const bezelEl = bezelWrapperRef.current;
      if (!heroEl) return;

      const reduced = prefersReducedMotion();
      const splitInstances: SplitText[] = [];
      let cancelled = false;

      if (!reduced) {
        document.fonts.ready.then(() => {
          if (cancelled) return;

          if (headlineEl) {
            const headlineSplit = SplitText.create(headlineEl, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'pt-[0.08em] pb-[0.22em] -mb-[0.14em]',
              autoSplit: true,
              onSplit(self) {
                return gsap.from(self.lines, {
                  yPercent: 108,
                  opacity: 0,
                  duration: 1.15,
                  stagger: 0.09,
                  ease: EDITORIAL_EASE_EXPO,
                  clearProps: 'transform,opacity',
                });
              },
            });
            splitInstances.push(headlineSplit);
          }

          if (stanzaEl) {
            const stanzaSplit = SplitText.create(stanzaEl, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'pt-[0.06em] pb-[0.2em] -mb-[0.14em]',
              autoSplit: true,
              onSplit(self) {
                return gsap.from(self.lines, {
                  yPercent: 105,
                  opacity: 0,
                  duration: 0.95,
                  delay: 0.2,
                  stagger: 0.08,
                  ease: EDITORIAL_EASE,
                  clearProps: 'transform,opacity',
                });
              },
            });
            splitInstances.push(stanzaSplit);
          }
        });
      }

      // Gentle pointer-reactive parallax on LiquidMetal sculpture (desktop only)
      let cleanupParallax: (() => void) | undefined;
      if (bezelEl && !reduced && !isTouchDevice()) {
        const xTo = gsap.quickTo(bezelEl, 'x', {
          duration: 0.85,
          ease: EDITORIAL_EASE,
        });
        const yTo = gsap.quickTo(bezelEl, 'y', {
          duration: 0.85,
          ease: EDITORIAL_EASE,
        });

        const handleMouseMove = (event: MouseEvent) => {
          const rect = heroEl.getBoundingClientRect();
          const normX = (event.clientX - rect.left) / rect.width - 0.5;
          const normY = (event.clientY - rect.top) / rect.height - 0.5;
          xTo(normX * -26);
          yTo(normY * -20);
        };

        const handleMouseLeave = () => {
          xTo(0);
          yTo(0);
        };

        heroEl.addEventListener('mousemove', handleMouseMove, { passive: true });
        heroEl.addEventListener('mouseleave', handleMouseLeave);

        cleanupParallax = () => {
          heroEl.removeEventListener('mousemove', handleMouseMove);
          heroEl.removeEventListener('mouseleave', handleMouseLeave);
        };
      }

      return () => {
        cancelled = true;
        splitInstances.forEach((instance) => instance.revert());
        cleanupParallax?.();
      };
    },
    { scope: heroRef }
  );

  const handleScrollToDepth = () => {
    const anchor = document.getElementById('kinetic-depth-anchor');
    if (!anchor) return;
    if (lenis) {
      lenis.scrollTo(anchor, { duration: 1.15 });
    } else {
      anchor.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={heroRef}
      data-snap-station
      aria-label="Luminous Dusk Hero"
      className="relative flex min-h-[100svh] w-full items-center overflow-x-clip pt-22 pb-10 text-[#F6F4EF] md:pt-32 md:pb-20"
    >
      {/* Soft localized dawn-amber halo that blends continuously with the global twilight layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(62% 58% at 74% 46%, rgba(223, 188, 145, 0.1) 0%, transparent 72%)',
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[82rem] items-center gap-7 px-6 md:px-10 lg:grid-cols-12 lg:gap-8">
        {/* Left / Center Editorial Composition (7 cols) */}
        <div className="lg:col-span-7">
          <p className="mb-3 text-xs font-medium text-[#DFBC91] uppercase md:mb-5">
            সংগৃহীত কবিতা · অনন্যা হাসান
          </p>

          <h1
            ref={headlineRef}
            lang="bn"
            className="font-bn-display display-luminous max-w-3xl text-[clamp(2.5rem,6.5vw,5.4rem)] leading-[1.24] font-semibold"
          >
            গোধূলির ছায়া, মেঘ ও বাস্তবতার নীরব লিপি।
          </h1>

          <p
            ref={stanzaRef}
            lang="bn"
            className="font-bn-verse mt-6 max-w-2xl text-[clamp(1.32rem,2.15vw,1.95rem)] text-[#F6F4EF]/92 md:mt-10"
          >
            {HERO_STANZA.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </p>

          <p
            lang="bn"
            className="font-bn-ui mt-4 max-w-lg text-[0.95rem] leading-[1.85] text-[#F6F4EF]/78 md:mt-6 md:text-[0.96rem]"
          >
            ২০২৩–২০২৪ সালের কবিতার খাতা থেকে সংকলিত দশটি কবিতা—মুখোশ ও বাস্তবতা,
            শ্রাবণ সন্ধ্যা এবং অনুভবের নীরব উচ্চারণ।
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4 md:mt-9">
            <TransitionLink
              ref={primaryCtaRef}
              to="/poems"
              className="glass-light inline-flex items-center gap-3 whitespace-nowrap shrink-0 rounded-full px-7 py-3.5 text-sm font-semibold shadow-[0_12px_32px_rgba(24,28,36,0.18)] transition-all duration-200 hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <span>সব কবিতা পড়ুন</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TransitionLink>

            <button
              ref={scrollCtaRef}
              type="button"
              onClick={handleScrollToDepth}
              className="glass-dusk inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full px-5 py-3.5 text-sm font-medium text-[#F6F4EF] transition-colors duration-200 hover:border-white/35 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              <span>স্ক্রল করুন</span>
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right Borderless Floating LiquidMetal Sculpture & Featured Reading Link (5 cols) */}
        <div className="flex flex-col items-center lg:col-span-5 lg:items-end">
          <div
            ref={bezelWrapperRef}
            className="w-full max-w-[16.5rem] sm:max-w-[23rem] lg:max-w-[30rem] will-change-transform"
          >
            <LiquidMetalBezel />
          </div>

          <TransitionLink
            to={`/poems/${featuredPoem.slug}`}
            className="group -mt-4 flex w-full max-w-[24rem] items-center justify-between gap-4 border-t border-white/16 pt-4 transition-colors duration-300 hover:border-[#DFBC91]/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#DFBC91] uppercase">
                নির্বাচিত পাঠ · {formatReadingTime(featuredPoem.readingSeconds, 'bn')}
              </p>
              <p lang="bn" className="font-bn-display mt-1 truncate text-2xl font-semibold text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91]">
                {featuredPoem.title}
              </p>
              <p lang="bn" className="font-bn-verse truncate text-sm text-[#F6F4EF]/74">
                “{featuredPoem.firstLine}”
              </p>
            </div>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-[#F6F4EF]/70 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#DFBC91]"
              aria-hidden="true"
            />
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
