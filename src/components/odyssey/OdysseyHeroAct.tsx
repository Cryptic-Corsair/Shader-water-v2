import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import type { SiteLang } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import { gsap, prefersReducedMotion, useGSAP, useMagnetic } from '../../lib/motion';
import { TransitionLink } from '../PageTransition';

export interface OdysseyHeroActProps {
  lang: SiteLang;
  autostart: boolean;
  onEnterOdyssey: () => void;
}

export function OdysseyHeroAct({
  lang,
  autostart,
  onEnterOdyssey,
}: OdysseyHeroActProps) {
  const heroRef = useRef<HTMLElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const copy = getUiCopy(lang).odyssey.hero;

  useMagnetic(enterBtnRef, 0.2);

  useGSAP(
    () => {
      if (autostart || prefersReducedMotion()) return;
      const root = heroRef.current;
      if (!root) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        '.odyssey-curtain-left',
        { scaleX: 1, autoAlpha: 1 },
        { scaleX: 0, autoAlpha: 0, duration: 0.62, transformOrigin: 'left center' },
        0
      )
        .fromTo(
          '.odyssey-curtain-right',
          { scaleX: 1, autoAlpha: 1 },
          { scaleX: 0, autoAlpha: 0, duration: 0.62, transformOrigin: 'right center' },
          0
        )
        .fromTo(
          '.odyssey-hero-stagger',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.68, stagger: 0.07 },
          0.12
        );
    },
    { scope: heroRef, dependencies: [autostart] }
  );

  return (
    <section
      id="odyssey-act-prologue"
      ref={heroRef}
      data-testid="odyssey-hero-act"
      aria-label="Odyssey Grand Entrance"
      className="relative flex min-h-screen w-full flex-col justify-between overflow-x-clip px-6 pt-28 pb-24 text-[#F6F4EF] md:px-12 md:pt-32 md:pb-24"
    >
      {/* Opening Iris Curtain Panels (part outward smoothly on entrance) */}
      {!autostart && (
        <>
          <div
            aria-hidden="true"
            className="odyssey-curtain-left pointer-events-none fixed inset-y-0 left-0 z-30 w-1/2 bg-[#06080F]"
          />
          <div
            aria-hidden="true"
            className="odyssey-curtain-right pointer-events-none fixed inset-y-0 right-0 z-30 w-1/2 bg-[#06080F]"
          />
        </>
      )}

      {/* Celestial Corner Framing Hairlines (Leaves center Astrolabe 100% unobstructed) */}
      <div className="relative z-10 mx-auto flex w-full max-w-[84rem] items-center justify-between gap-4 border-b border-white/12 pb-4">
        <p className="odyssey-hero-stagger text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase">
          {copy.kicker}
        </p>
        <p className="odyssey-hero-stagger hidden text-xs text-[#B2C2D4]/85 tabular-nums sm:block">
          23°48′ N · 90°24′ E · {copy.metaLine}
        </p>
      </div>

      {/* Center Open Aperture Frame (Subtle Celestial Reticle SVG around 3D Astrolabe) */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative z-0 mx-auto my-4 flex h-[32vh] min-h-[190px] w-full max-w-[42rem] items-center justify-center md:h-[38vh]"
      >
        <svg
          viewBox="0 0 600 260"
          fill="none"
          className="h-full w-full opacity-55"
        >
          <circle
            cx="300"
            cy="130"
            r="116"
            stroke="#DFBC91"
            strokeOpacity="0.28"
            strokeWidth="0.9"
            strokeDasharray="3 8"
          />
          <circle
            cx="300"
            cy="130"
            r="84"
            stroke="#B2C2D4"
            strokeOpacity="0.22"
            strokeWidth="0.8"
          />
          <line
            x1="44"
            y1="130"
            x2="162"
            y2="130"
            stroke="rgba(223, 188, 145, 0.34)"
            strokeWidth="0.8"
          />
          <line
            x1="438"
            y1="130"
            x2="556"
            y2="130"
            stroke="rgba(223, 188, 145, 0.34)"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* Bottom Asymmetric Architectural Lockup */}
      <div className="relative z-10 mx-auto w-full max-w-[84rem]">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p
              lang={lang}
              className="odyssey-hero-stagger font-editorial-serif text-lg text-[#DFBC91] md:text-2xl"
            >
              {copy.headlineLead}
            </p>
            <h1
              lang={lang}
              className="odyssey-hero-stagger font-display display-luminous mt-2 text-[clamp(2.5rem,5.8vw,5.1rem)] leading-[1.08] font-semibold text-[#FAF6EE]"
            >
              {copy.headlineEmph}
            </h1>
            <blockquote
              lang="bn"
              className="odyssey-hero-stagger font-bn-verse mt-5 max-w-2xl text-[clamp(1.06rem,1.5vw,1.34rem)] leading-[1.82] text-[#E6DFD3]/92"
            >
              {copy.whisper}
            </blockquote>
          </div>

          <div className="odyssey-hero-stagger flex flex-col items-start gap-4 lg:col-span-4 lg:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <button
                ref={enterBtnRef}
                type="button"
                onClick={onEnterOdyssey}
                data-testid="odyssey-enter-btn"
                className="inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full border border-[#DFBC91]/70 bg-[#DFBC91] px-6 py-3 text-xs font-semibold text-[#11151E] shadow-[0_14px_38px_rgba(223,188,145,0.22)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#E9CEAA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF6EE]"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.primaryCta}</span>
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <TransitionLink
                to="/"
                data-testid="odyssey-classic-home-link"
                className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full border border-white/22 bg-[#0B0E17]/82 px-5 py-3 text-xs font-medium text-[#F6F4EF]/88 transition-colors hover:border-[#DFBC91]/70 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.secondaryCta}</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </TransitionLink>
            </div>

            <p className="text-xs text-[#B2C2D4]/75">
              {copy.scrollCue}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
