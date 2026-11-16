import { ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import type { SiteLang } from '../../context/LanguageContext';
import {
  formatReadingTime,
  getCycleLabel,
  type PoemMeta,
} from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import { TransitionLink } from '../PageTransition';
import { buildPoemConstellationNodes } from './odysseyChoreography';

export interface OdysseyConstellationActProps {
  lang: SiteLang;
  selectedSlug: string;
  onSelectPoem: (poem: PoemMeta) => void;
}

export function OdysseyConstellationAct({
  lang,
  selectedSlug,
  onSelectPoem,
}: OdysseyConstellationActProps) {
  const copy = getUiCopy(lang).odyssey.constellationAct;
  const nodes = useMemo(() => buildPoemConstellationNodes(lang), [lang]);

  const activeNode =
    nodes.find((n) => n.poem.slug === selectedSlug) ?? nodes[5] ?? nodes[0];

  return (
    <section
      id="odyssey-act-constellation"
      data-testid="odyssey-constellation-act"
      aria-label="Ten-poem spatial constellation"
      className="relative flex min-h-screen w-full items-center overflow-x-clip px-6 py-28 text-[#F6F4EF] md:px-12 md:py-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[84rem]">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.04em] text-[#B2C2D4] uppercase">
              {copy.eyebrow}
            </p>
            <h2
              lang={lang}
              className="font-display display-luminous mt-2 text-[clamp(2.2rem,4.3vw,3.6rem)] leading-[1.18] font-semibold"
            >
              {copy.heading}
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-[1.8] text-[#E6DFD3]/80 md:text-base">
            {copy.subheading}
          </p>
        </div>

        {/* 12-Col Constellation Map + Active Stanza Observatory */}
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          {/* Left 7 Cols: Interactive 10-Star Celestial Arc List */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-[26px] border border-white/14 bg-[#0B0E17]/82 p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <span className="text-xs font-medium text-[#B2C2D4]">
                {copy.selectHint}
              </span>
              <span className="text-xs text-[#DFBC91] tabular-nums">
                {activeNode.indexLabel} / {lang === 'bn' ? '১০' : '10'}
              </span>
            </div>

            <div
              role="tablist"
              aria-label={copy.heading}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
            >
              {nodes.map((node) => {
                const isSelected = node.poem.slug === activeNode.poem.slug;
                return (
                  <button
                    key={node.poem.slug}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    data-testid={`constellation-node-${node.poem.slug}`}
                    onClick={() => onSelectPoem(node.poem)}
                    className={`group flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                      isSelected
                        ? 'border-[#DFBC91]/75 bg-[#171E2C]/95 text-[#FAF6EE]'
                        : 'border-white/10 bg-[#0E131E]/75 text-[#F6F4EF]/80 hover:border-white/28 hover:bg-[#141A28]/90'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2.5">
                        <span
                          className="text-xs font-semibold tabular-nums"
                          style={{
                            color: isSelected
                              ? node.poem.moodColors[2]
                              : 'rgba(178, 194, 212, 0.72)',
                          }}
                        >
                          {node.indexLabel}
                        </span>
                        <span
                          lang="bn"
                          className="font-bn-display truncate text-sm font-semibold md:text-base"
                        >
                          {node.poem.title}
                        </span>
                      </div>
                      <p className="mt-0.5 pl-6 text-[11px] text-[#B2C2D4]/72">
                        {node.poem.dateDisplay}
                      </p>
                    </div>

                    <span
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/25"
                      style={{
                        background: `linear-gradient(135deg, ${node.poem.moodColors[1]}, ${node.poem.moodColors[2]})`,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 Cols: Live Tuned Poem Stanza Observatory */}
          <div
            data-testid="constellation-inspector"
            data-active-poem={activeNode.poem.slug}
            className="lg:col-span-5 flex flex-col justify-between rounded-[26px] border border-white/18 bg-[#0E131E]/88 p-7 md:p-9"
            style={{
              borderColor: `${activeNode.poem.moodColors[2]}55`,
            }}
          >
            <div>
              <p
                className="text-xs font-medium"
                style={{ color: activeNode.poem.moodColors[2] }}
              >
                <span>{getCycleLabel(activeNode.cycle, lang)}</span>
                <span aria-hidden="true" className="mx-2 text-white/35">
                  ·
                </span>
                <span className="text-[#F6F4EF]/80 tabular-nums">
                  {activeNode.poem.dateDisplay}
                </span>
              </p>

              <h3
                lang="bn"
                className="font-bn-display mt-3 text-2xl font-semibold text-[#FAF6EE] md:text-3xl"
              >
                {activeNode.poem.title}
              </h3>

              <blockquote
                lang="bn"
                className="font-bn-verse my-6 space-y-1.5 border-y border-white/12 py-5 text-[clamp(1.12rem,1.65vw,1.38rem)] leading-[1.85] text-[#F6F4EF]/94"
              >
                {activeNode.stanzaPreview.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </blockquote>

              <p className="text-xs text-[#B2C2D4]/85 tabular-nums">
                <span>
                  {formatReadingTime(activeNode.poem.readingSeconds, lang)}
                </span>
                <span aria-hidden="true" className="mx-2 text-white/35">
                  ·
                </span>
                <span lang="bn">{activeNode.poem.themes.join(' · ')}</span>
              </p>
            </div>

            <div className="mt-7 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2" aria-hidden="true">
                {activeNode.poem.moodColors.map((hex) => (
                  <span
                    key={hex}
                    className="h-3 w-3 rounded-full border border-white/25"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>

              <TransitionLink
                to={`/poems/${activeNode.poem.slug}`}
                data-testid="constellation-read-cta"
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full border border-[#DFBC91]/70 bg-[#DFBC91] px-5 py-2.5 text-xs font-semibold text-[#11151E] transition-colors hover:bg-[#E9CEAA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF6EE]"
              >
                <span>{copy.readRoomCta}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </TransitionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
