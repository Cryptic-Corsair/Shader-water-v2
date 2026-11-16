import { useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { formatReadingTime } from '../../data/poemsCatalog';
import {
  EDITORIAL_EASE,
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { LiveAtmosphere } from '../shaders/LiveAtmosphere';
import { getFeaturedGalleryPoems, getRibbonFragments } from './versesLogic';

export function LivingVersesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ribbonViewportRef = useRef<HTMLDivElement>(null);
  const ribbonTrackRef = useRef<HTMLDivElement>(null);
  const loopTlRef = useRef<gsap.core.Tween | null>(null);
  const readCtaRef = useRef<HTMLAnchorElement>(null);

  const featuredPoems = getFeaturedGalleryPoems(5);
  const ribbonFragments = getRibbonFragments();
  const [activeSlug, setActiveSlug] = useState<string>(
    featuredPoems[0]?.slug ?? ''
  );

  const activePoem =
    featuredPoems.find((p) => p.slug === activeSlug) ?? featuredPoems[0];

  useMagnetic(readCtaRef, 0.22);

  useGSAP(
    () => {
      const track = ribbonTrackRef.current;
      const viewport = ribbonViewportRef.current;
      const reduced = prefersReducedMotion();

      if (track && viewport && !reduced) {
        const tween = gsap.to(track, {
          xPercent: -50,
          duration: 44,
          repeat: -1,
          ease: 'none',
        });
        loopTlRef.current = tween;

        ScrollTrigger.create({
          trigger: viewport,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate(self) {
            const velocity = self.getVelocity();
            if (Math.abs(velocity) < 12) return;
            const direction = velocity < 0 ? -1 : 1;
            const boost = Math.min(2.1, 1 + Math.abs(velocity) / 1800);
            gsap.to(tween, {
              timeScale: direction * boost,
              duration: 0.35,
              ease: EDITORIAL_EASE,
              overwrite: true,
              onComplete: () => {
                if (!tween.paused()) {
                  gsap.to(tween, {
                    timeScale: direction,
                    duration: 0.6,
                    ease: EDITORIAL_EASE,
                  });
                }
              },
            });
          },
        });
      }

      return () => {
        loopTlRef.current = null;
      };
    },
    { scope: sectionRef }
  );

  const handleRibbonMouseEnter = () => {
    loopTlRef.current?.pause();
  };

  const handleRibbonMouseLeave = () => {
    if (!prefersReducedMotion()) {
      loopTlRef.current?.play();
    }
  };

  if (!activePoem) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      data-snap-station
      aria-label="Kinetic verse ribbon and live mood preview"
      className="relative scroll-mt-20 overflow-x-clip pb-28 text-[#F6F4EF] md:pb-36"
    >
      {/* Top Generously Padded Infinite Marquee of Cormorant Italic Lines */}
      <div className="mx-auto max-w-[82rem] px-6 pt-16 pb-6 md:px-10 md:pt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-xs font-medium tracking-[0.14em] text-[#B2C2D4] uppercase">
            Living Verses
          </p>
          <span className="text-xs text-[#F6F4EF]/72">
            Hover a line or title to shift the atmosphere
          </span>
        </div>
      </div>

      <div
        ref={ribbonViewportRef}
        onMouseEnter={handleRibbonMouseEnter}
        onMouseLeave={handleRibbonMouseLeave}
        className="w-full overflow-hidden border-y border-white/14 bg-white/[0.03] py-6 backdrop-blur-[10px] md:py-8"
      >
        <div
          ref={ribbonTrackRef}
          data-testid="kinetic-verse-ribbon"
          className="flex w-max items-center will-change-transform"
        >
          <div className="flex shrink-0 items-center">
            {ribbonFragments.map((line, index) => (
              <span
                key={`frag-a-${index}`}
                className="font-editorial-serif inline-flex items-center text-[clamp(1.75rem,3vw,2.55rem)] leading-[1.35] font-light tracking-[-0.01em] text-[#F6F4EF]/92 whitespace-nowrap"
              >
                <span className="px-7 italic md:px-11">“{line}”</span>
                <span
                  aria-hidden="true"
                  className="text-sm text-[#DFBC91]"
                >
                  ·
                </span>
              </span>
            ))}
          </div>

          <div aria-hidden="true" className="flex shrink-0 items-center">
            {ribbonFragments.map((line, index) => (
              <span
                key={`frag-b-${index}`}
                className="font-editorial-serif inline-flex items-center text-[clamp(1.75rem,3vw,2.55rem)] leading-[1.35] font-light tracking-[-0.01em] text-[#F6F4EF]/92 whitespace-nowrap"
              >
                <span className="px-7 italic md:px-11">“{line}”</span>
                <span className="text-sm text-[#DFBC91]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Split Showcase: 5 Open Borderless Poem Rows + Sticky MeshGradient Mood Preview */}
      <div className="mx-auto mt-16 max-w-[82rem] px-6 md:mt-20 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Left (7 cols): 5 Open Borderless Poem Rows */}
          <div className="lg:col-span-7">
            <div className="mb-7 flex items-baseline justify-between gap-4">
              <h2 className="font-editorial-serif display-luminous text-[clamp(2.1rem,3.4vw,3rem)] font-normal tracking-[-0.015em]">
                Selected Verses
              </h2>
              <TransitionLink
                to="/poems"
                className="editorial-link text-xs font-medium tracking-[0.04em] text-[#DFBC91] transition-colors hover:text-[#F6F4EF]"
              >
                View All Works
              </TransitionLink>
            </div>

            <div role="list" aria-label="Featured poems">
              {featuredPoems.map((poem) => {
                const isActive = poem.slug === activePoem.slug;

                return (
                  <div
                    key={poem.id}
                    role="listitem"
                    className="border-t border-white/14 last:border-b"
                  >
                    <TransitionLink
                      to={`/poems/${poem.slug}`}
                      onMouseEnter={() => setActiveSlug(poem.slug)}
                      onFocus={() => setActiveSlug(poem.slug)}
                      data-active={isActive ? 'true' : 'false'}
                      className={`group relative flex flex-col gap-3 px-3 py-5 transition-all duration-250 md:flex-row md:items-center md:justify-between md:px-4 md:py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                        isActive
                          ? 'bg-white/[0.06]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                          <span
                            className={
                              isActive ? 'text-[#DFBC91]' : 'text-[#B2C2D4]'
                            }
                          >
                            {poem.collection}
                          </span>
                          <span aria-hidden="true" className="text-white/35">
                            ·
                          </span>
                          <span className="text-[#F6F4EF]/70">{poem.year}</span>
                        </div>

                        <h3
                          className={`font-editorial-serif mt-1.5 text-[1.75rem] leading-[1.15] font-normal tracking-[-0.015em] transition-colors md:text-[1.95rem] ${
                            isActive
                              ? 'text-[#DFBC91]'
                              : 'text-[#F6F4EF] group-hover:text-[#DFBC91]'
                          }`}
                        >
                          {poem.title}
                        </h3>

                        <p className="font-editorial-serif mt-1 truncate text-base italic text-[#F6F4EF]/76">
                          “{poem.firstLine}”
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#F6F4EF]/78 md:shrink-0 md:justify-end">
                        <span>{formatReadingTime(poem.readingSeconds)}</span>
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                            isActive
                              ? 'text-[#DFBC91]'
                              : 'text-[#F6F4EF]/70 group-hover:text-[#DFBC91]'
                          }`}
                        >
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </TransitionLink>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right (5 cols, sticky on desktop): Live Mood Preview with MeshGradient */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div
              data-testid="atmospheric-reading-plate"
              data-active-slug={activePoem.slug}
              className="relative flex min-h-[28rem] flex-col justify-between overflow-hidden rounded-[28px] border border-white/24 bg-[#363E4B] p-7 text-[#F6F4EF] shadow-[0_24px_60px_rgba(24,28,36,0.28)] md:min-h-[31rem] md:p-9"
            >
              <LiveAtmosphere
                variant="mesh"
                colors={[
                  activePoem.moodColors[0],
                  activePoem.moodColors[1],
                  activePoem.moodColors[2],
                  '#677180',
                ]}
                distortion={0.76}
                swirl={0.44}
                grainMixer={0.12}
                grainOverlay={0.05}
                speed={0.3}
                feather={false}
                scrim="soft"
              />

              {/* Top Unboxed Metadata */}
              <div className="relative z-10 flex items-center justify-between gap-3 text-xs font-medium">
                <span className="text-[#F6F4EF]/88">
                  {activePoem.collection}
                </span>
                <span className="text-[#DFBC91]">{activePoem.year}</span>
              </div>

              {/* Centerpiece Opening Line in Cormorant */}
              <div className="relative z-10 my-10">
                <p className="font-editorial-serif mb-3 text-xl font-normal text-[#DFBC91]">
                  {activePoem.title}
                </p>
                <blockquote className="font-editorial-serif display-luminous text-[clamp(1.75rem,2.7vw,2.35rem)] leading-[1.38] font-light italic">
                  “{activePoem.firstLine}”
                </blockquote>
              </div>

              {/* Bottom Themes & Rounded Frosted CTA */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
                <span className="text-xs font-medium text-[#F6F4EF]/80">
                  {activePoem.themes.slice(0, 3).join(' · ')}
                </span>

                <TransitionLink
                  ref={readCtaRef}
                  to={`/poems/${activePoem.slug}`}
                  className="glass-light inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-[#171A21] transition-all duration-200 hover:bg-white/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <span>Read Full Poem</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </TransitionLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
