import { ArrowRight, Eye, Layers } from 'lucide-react';
import { useRef, useState } from 'react';
import type { SiteLang } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';
import { TransitionLink } from '../PageTransition';

export interface OdysseyMaskActProps {
  lang: SiteLang;
}

export function OdysseyMaskAct({ lang }: OdysseyMaskActProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const leftPlateRef = useRef<HTMLDivElement>(null);
  const rightPlateRef = useRef<HTMLDivElement>(null);
  const [depthRevealed, setDepthRevealed] = useState(false);

  const copy = getUiCopy(lang).odyssey.maskAct;

  // Scroll-scrubbed counter-translation simulating fractured mask parting around 3D axis
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const section = sectionRef.current;
      const leftEl = leftPlateRef.current;
      const rightEl = rightPlateRef.current;
      if (!section || !leftEl || !rightEl) return;

      gsap.fromTo(
        leftEl,
        { y: 42, x: -24 },
        {
          y: -26,
          x: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 20%',
            scrub: 0.7,
          },
        }
      );

      gsap.fromTo(
        rightEl,
        { y: -32, x: 24 },
        {
          y: 28,
          x: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 20%',
            scrub: 0.7,
          },
        }
      );
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section
      id="odyssey-act-masks"
      ref={sectionRef}
      data-testid="odyssey-mask-act"
      aria-label="Masks and Reality spatial act"
      className="relative flex min-h-screen w-full items-center overflow-x-clip px-6 py-28 text-[#F6F4EF] md:px-12 md:py-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[84rem]">
        {/* Editorial Heading Header */}
        <div className="mb-12 flex flex-col gap-4 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.04em] text-[#C96D63] uppercase">
              {copy.eyebrow}
            </p>
            <h2
              lang={lang}
              className="font-display display-luminous mt-2 text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1.15] font-semibold"
            >
              {copy.heading}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setDepthRevealed((prev) => !prev)}
            aria-pressed={depthRevealed}
            data-testid="odyssey-mask-toggle"
            className="inline-flex cursor-pointer items-center gap-2 self-start whitespace-nowrap shrink-0 rounded-full border border-[#C96D63]/55 bg-[#12151E]/88 px-5 py-2.5 text-xs font-semibold text-[#F6F4EF] transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] lg:self-auto"
          >
            {depthRevealed ? (
              <Layers className="h-3.5 w-3.5 text-[#DFBC91]" aria-hidden="true" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-[#C96D63]" aria-hidden="true" />
            )}
            <span>{depthRevealed ? copy.toggleMask : copy.toggleReveal}</span>
          </button>
        </div>

        {/* Counter-Scrolling Split Plates flanking the live Fractured 3D Astrolabe */}
        <div className="grid items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Plate: Outer Artifice vs Inner Truth */}
          <div
            ref={leftPlateRef}
            className={`lg:col-span-5 flex flex-col justify-between rounded-[26px] border p-7 transition-colors duration-300 md:p-9 ${
              depthRevealed
                ? 'border-[#DFBC91]/48 bg-[#121620]/90'
                : 'border-white/14 bg-[#0B0E17]/84'
            }`}
          >
            <div>
              <p className="text-xs font-medium text-[#DFBC91]">
                {depthRevealed ? copy.depthLabel : copy.surfaceLabel}
              </p>

              <blockquote
                lang="bn"
                className="font-bn-verse mt-5 border-y border-white/12 py-6 text-[clamp(1.18rem,1.8vw,1.5rem)] leading-[1.86] text-[#F6F4EF]"
              >
                {(depthRevealed ? copy.depthLines : copy.surfaceLines).map(
                  (line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  )
                )}
              </blockquote>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-xs text-[#B2C2D4] tabular-nums">
                ১৩/১২/২০২৩ · মুখোশের অন্তরালে
              </span>
              <TransitionLink
                to="/poems/mukhosher-antarale"
                data-testid="odyssey-mask-poem-link"
                className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#DFBC91] transition-colors hover:text-[#FAF6EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.readCta}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </TransitionLink>
            </div>
          </div>

          {/* Center Window (Preserves visibility of 3D fractured astrolabe & shells) */}
          <div
            aria-hidden="true"
            className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-center"
          >
            <div className="h-44 w-px bg-gradient-to-b from-transparent via-[#C96D63]/60 to-transparent" />
          </div>

          {/* Right Plate: Companion Contrast (বাস্তবতার লড়াই) */}
          <div
            ref={rightPlateRef}
            className="lg:col-span-5 flex flex-col justify-between rounded-[26px] border border-white/14 bg-[#0B0E17]/84 p-7 md:p-9"
          >
            <div>
              <p className="text-xs font-medium text-[#C96D63]">
                ৩১ জানুয়ারি ২০২৪ · বাস্তবতার লড়াই
              </p>

              <blockquote
                lang="bn"
                className="font-bn-verse mt-5 border-y border-white/12 py-6 text-[clamp(1.15rem,1.75vw,1.44rem)] leading-[1.86] text-[#F6F4EF]/92"
              >
                <span className="block">“বেদনার নীল রঙে ডুবে আছে মন,,</span>
                <span className="block">
                  বিষাদের কালো মেঘে ভাসছে~~পুরো আকাশ অন্তর,,”
                </span>
              </blockquote>

              <p className="mt-5 text-sm leading-[1.8] text-[#B2C2D4]/90">
                {copy.companionNote}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <TransitionLink
                to="/poems/bastobotar-lorai"
                className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#C96D63] transition-colors hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>বাস্তবতার লড়াই · পাঠকক্ষ</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
