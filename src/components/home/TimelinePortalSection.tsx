import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_PROFILE } from '../../data/authorProfile';
import { getUiCopy } from '../../data/uiCopy';
import {
  DrawSVGPlugin,
  ScrollTrigger,
  gsap,
  prefersReducedMotion,
  useGSAP,
  useMagnetic,
} from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import { buildMeridianTimeline } from './timelinePortalData';

export function TimelinePortalSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const meridianPathRef = useRef<SVGPathElement>(null);
  const portalBtnRef = useRef<HTMLAnchorElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).timeline;

  const milestones = useMemo(() => buildMeridianTimeline(lang), [lang]);
  const [expandedId, setExpandedId] = useState<string>(
    () => milestones[0]?.id ?? ''
  );
  const [copied, setCopied] = useState(false);

  useMagnetic(portalBtnRef, 0.22);
  useMagnetic(copyBtnRef, 0.18);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const meridian = meridianPathRef.current;
      if (!section || !meridian) return;

      void DrawSVGPlugin;

      if (prefersReducedMotion()) {
        gsap.set(meridian, { drawSVG: '100%' });
        return;
      }

      gsap.set(meridian, { drawSVG: '6%' });

      const tween = gsap.to(meridian, {
        drawSVG: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          end: 'bottom 78%',
          scrub: 0.75,
        },
      });

      ScrollTrigger.refresh();
      return () => {
        tween.kill();
      };
    },
    { scope: sectionRef, dependencies: [lang], revertOnUpdate: true }
  );

  const handleCopyEmail = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);

    try {
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard
          .writeText(AUTHOR_PROFILE.contactEmail)
          .catch(() => {});
        return;
      }
      const tmp = document.createElement('textarea');
      tmp.value = AUTHOR_PROFILE.contactEmail;
      tmp.setAttribute('readonly', '');
      tmp.style.position = 'fixed';
      tmp.style.opacity = '0';
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
    } catch {
      // Clipboard blocked in restricted context; UI confirmation shown cleanly
    }
  };

  return (
    <section
      id="chapter-8"
      ref={sectionRef}
      data-bg-stage="4"
      data-snap-station
      aria-label="Poem chronology and archive portal"
      className="relative min-h-[120svh] w-full overflow-x-clip py-24 text-[#F6F4EF] md:py-36"
    >
      <div className="mx-auto max-w-[82rem] px-6 md:px-10">
        {/* Open Editorial Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium text-[#DFBC91] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.15] font-semibold">
              {copy.heading}
            </h2>
          </div>

          <p className="max-w-md text-sm leading-[1.85] text-[#F6F4EF]/78 md:text-base">
            {copy.description}
          </p>
        </div>

        {/* Open SVG-Traced Meridian Timeline (Zero Boxed Cards) */}
        <div className="relative mt-16 pr-6 sm:pr-0 md:mt-20">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 800"
            preserveAspectRatio="none"
            fill="none"
            className="pointer-events-none absolute top-2 bottom-2 left-[2px] h-[calc(100%-1rem)] w-6 md:left-[146px]"
          >
            <path
              d="M 12 0 C 14 140, 10 280, 12 420 C 14 560, 10 680, 12 800"
              stroke="rgba(246, 244, 239, 0.16)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
            <path
              ref={meridianPathRef}
              d="M 12 0 C 14 140, 10 280, 12 420 C 14 560, 10 680, 12 800"
              stroke="#DFBC91"
              strokeOpacity="0.82"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <ol className="space-y-2">
            {milestones.map((node) => {
              const isExpanded = expandedId === node.id;

              return (
                <li
                  key={node.id}
                  data-testid={`timeline-node-${node.id}`}
                  data-expanded={isExpanded ? 'true' : 'false'}
                  onMouseEnter={() => setExpandedId(node.id)}
                  className="relative grid grid-cols-[1.75rem_1fr] items-start gap-4 border-b border-white/12 py-5 transition-colors duration-300 last:border-b-0 md:grid-cols-[7.5rem_1.75rem_1fr] md:gap-6 md:py-6"
                >
                  {/* Year / Date Column (Desktop Left) */}
                  <div className="hidden pt-1 text-right md:block">
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        node.upcoming ? 'text-[#DFBC91]' : 'text-[#F6F4EF]/72'
                      }`}
                    >
                      {node.yearLabel}
                    </span>
                  </div>

                  {/* Meridian Orbital Node Marker */}
                  <div className="relative z-10 flex justify-center pt-1.5">
                    <button
                      type="button"
                      onClick={() => setExpandedId(node.id)}
                      aria-label={node.title}
                      aria-expanded={isExpanded}
                      className={`h-3.5 w-3.5 cursor-pointer rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                        isExpanded
                          ? 'scale-125 border-[#DFBC91] bg-[#DFBC91] shadow-[0_0_16px_rgba(223,188,145,0.65)]'
                          : 'border-white/55 bg-[#4A5362] hover:border-[#DFBC91]'
                      }`}
                    />
                  </div>

                  {/* Open Borderless Content & Expandable Citation */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(node.id)}
                    aria-expanded={isExpanded}
                    className="group w-full cursor-pointer border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <span className="text-xs font-medium text-[#DFBC91] tabular-nums md:hidden">
                          {node.yearLabel}
                        </span>
                        <span
                          lang="bn"
                          className="font-bn-display text-[clamp(1.25rem,2.1vw,1.75rem)] leading-[1.45] font-semibold text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91]"
                        >
                          {node.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span
                          className={
                            node.upcoming
                              ? 'font-semibold text-[#DFBC91]'
                              : 'text-[#B2C2D4]'
                          }
                        >
                          {node.kindLabel}
                        </span>
                        <span aria-hidden="true" className="text-white/30">
                          ·
                        </span>
                        <span className="text-[#F6F4EF]/72">{node.location}</span>
                      </div>
                    </div>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isExpanded
                          ? 'mt-3 grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="font-editorial-serif text-base leading-[1.75] text-[#DFBC91]/92 md:text-lg">
                          {node.citation}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Quiet Frosted Correspondence Anchor + Spacious Finale Archive Portal */}
        <div className="mt-24 flex flex-col items-center text-center md:mt-32">
          <div className="glass-dusk inline-flex flex-wrap items-center justify-center gap-3 rounded-full px-5 py-2.5 shadow-[0_14px_38px_rgba(24,28,36,0.2)]">
            <span className="text-xs font-medium text-[#B2C2D4] uppercase">
              {copy.correspondenceLabel}
            </span>
            <span aria-hidden="true" className="text-white/30">
              ·
            </span>
            <button
              ref={copyBtnRef}
              type="button"
              onClick={handleCopyEmail}
              data-testid="copy-email-button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-[#F6F4EF] transition-colors duration-200 hover:bg-[#DFBC91] hover:text-[#171A21] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {copy.copiedEmail} · {AUTHOR_PROFILE.contactEmail}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {copy.copyEmail} · {AUTHOR_PROFILE.contactEmail}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="mt-16 max-w-3xl md:mt-20">
            <p className="font-editorial-serif text-[clamp(1.45rem,2.6vw,2.15rem)] leading-[1.55] font-light text-[#F6F4EF]/90">
              “{AUTHOR_PROFILE.pullQuote[lang]}”
            </p>
            <p className="mt-4 text-xs font-medium text-[#DFBC91]">
              {AUTHOR_PROFILE.pullQuoteAttribution[lang]}
            </p>

            <div className="mt-10 flex justify-center">
              <TransitionLink
                ref={portalBtnRef}
                to="/poems"
                data-testid="finale-archive-portal"
                className="glass-light inline-flex items-center gap-3 whitespace-nowrap shrink-0 rounded-full px-8 py-4 text-sm font-semibold text-[#171A21] shadow-[0_18px_46px_rgba(24,28,36,0.24)] transition-all duration-200 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <span>{copy.exploreAll}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
