import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_PROFILE } from '../../data/authorProfile';
import {
  getCollections,
  getCycleLabel,
  type CycleId,
} from '../../data/poemsCatalog';
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
import { SectionShaderBackdrop } from '../shaders/SectionShaderBackdrop';
import { filterTimelineMilestonesByCycle } from './cycleVolumesData';
import { buildMeridianTimeline } from './timelinePortalData';

const MILESTONE_SLUGS: Record<string, string> = {
  'ms-feb-02': 'bhalo-thaka',
  'ms-feb-01': 'shopnil-jogote',
  'ms-jan-31': 'bastobotar-lorai',
  'ms-jan-30': 'shudhui-tumi',
  'ms-jan-28b': 'tumi-amar',
  'ms-jan-27': 'tomar-tumi-hobo',
  'ms-jan-25': 'bhalobashar-adhyay',
  'ms-dec-13': 'mukhosher-antarale',
};

export function ChronologyLedgerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const meridianPathRef = useRef<SVGPathElement>(null);
  const portalBtnRef = useRef<HTMLAnchorElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang).timeline;

  const allMilestones = useMemo(() => buildMeridianTimeline(lang), [lang]);
  const [cycleFilter, setCycleFilter] = useState<'all' | CycleId>('all');
  const [expandedId, setExpandedId] = useState<string>(
    () => allMilestones[0]?.id ?? ''
  );
  const [copied, setCopied] = useState(false);

  const filterOptions = useMemo<Array<'all' | CycleId>>(
    () => ['all', ...getCollections()],
    []
  );

  const visibleMilestones = useMemo(
    () => filterTimelineMilestonesByCycle(allMilestones, cycleFilter),
    [allMilestones, cycleFilter]
  );

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
    { scope: sectionRef, dependencies: [lang, cycleFilter], revertOnUpdate: true }
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
      // Clipboard blocked in restricted context; visual confirmation shown cleanly
    }
  };

  return (
    <section
      id="chapter-8"
      ref={sectionRef}
      data-bg-stage="4"
      data-snap-station
      aria-label="Poem chronology and exhibition epilogue"
      className="relative w-full overflow-x-clip py-24 text-[#F6F4EF] md:py-36"
    >
      <SectionShaderBackdrop sectionKey="chronology" />
      <div className="relative z-10 mx-auto max-w-[82rem] px-6 md:px-10">
        {/* Header & Description */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="font-display display-luminous mt-3 text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[1.18] font-semibold">
              {copy.heading}
            </h2>
          </div>

          <p className="max-w-md text-sm leading-[1.85] text-[#F6F4EF]/78 md:text-base">
            {copy.description}
          </p>
        </div>

        {/* Interactive Ledger Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter chronological ledger"
          className="mt-10 flex flex-wrap items-center gap-2 border-b border-white/14 pb-5"
        >
          {filterOptions.map((opt) => {
            const isActive = cycleFilter === opt;
            const label =
              opt === 'all' ? copy.allFilter : getCycleLabel(opt, lang);
            return (
              <button
                key={opt}
                type="button"
                role="tab"
                aria-selected={isActive}
                data-testid={`chronology-filter-${opt}`}
                onClick={() => {
                  setCycleFilter(opt);
                  const next = filterTimelineMilestonesByCycle(
                    allMilestones,
                    opt
                  );
                  if (next[0]) setExpandedId(next[0].id);
                }}
                className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                  isActive
                    ? 'bg-[#DFBC91] text-[#171A21]'
                    : 'border border-white/14 bg-white/[0.04] text-[#F6F4EF]/76 hover:text-[#F6F4EF]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* SVG-Traced Meridian Chronological Ledger */}
        <div className="relative mt-10 pr-2 sm:pr-0 md:mt-12">
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
              strokeOpacity="0.85"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <ol className="space-y-2">
            {visibleMilestones.map((node) => {
              const isExpanded = expandedId === node.id;
              const slug = MILESTONE_SLUGS[node.id] ?? 'mukhosher-antarale';

              return (
                <li
                  key={node.id}
                  data-testid={`timeline-node-${node.id}`}
                  data-expanded={isExpanded ? 'true' : 'false'}
                  className="relative grid grid-cols-[1.75rem_1fr] items-start gap-4 border-b border-white/12 py-5 transition-colors duration-300 last:border-b-0 md:grid-cols-[7.5rem_1.75rem_1fr] md:gap-6 md:py-6"
                >
                  {/* Date Column (Desktop Left) */}
                  <div className="hidden pt-1 text-right md:block">
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        node.upcoming ? 'text-[#DFBC91]' : 'text-[#F6F4EF]/72'
                      }`}
                    >
                      {node.yearLabel}
                    </span>
                  </div>

                  {/* Meridian Orbital Node */}
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

                  {/* Row Title, Metadata & Expandable Citation */}
                  <div>
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
                            className="font-bn-display text-[clamp(1.25rem,2.1vw,1.7rem)] leading-[1.45] font-semibold text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91]"
                          >
                            {node.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs">
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
                          <span className="text-[#F6F4EF]/72 tabular-nums">
                            {node.location}
                          </span>
                        </div>
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isExpanded
                          ? 'mt-3 grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                          <p className="font-editorial-serif max-w-2xl text-base leading-[1.75] text-[#DFBC91]/92 md:text-lg">
                            {node.citation}
                          </p>
                          <TransitionLink
                            to={`/poems/${slug}`}
                            className="group inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#F6F4EF]/85 transition-colors hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                          >
                            <span>{copy.openPoem}</span>
                            <ArrowUpRight
                              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden="true"
                            />
                          </TransitionLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Exhibition Epilogue & Correspondence Desk */}
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

          <div className="mt-16 max-w-3xl border-y border-white/14 py-10 md:mt-20">
            <p className="font-editorial-serif text-[clamp(1.45rem,2.6vw,2.15rem)] leading-[1.58] font-light text-[#F6F4EF]/92">
              “{AUTHOR_PROFILE.pullQuote[lang]}”
            </p>
            <p className="mt-4 text-xs font-medium text-[#DFBC91]">
              {AUTHOR_PROFILE.pullQuoteAttribution[lang]}
            </p>
          </div>

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
    </section>
  );
}
