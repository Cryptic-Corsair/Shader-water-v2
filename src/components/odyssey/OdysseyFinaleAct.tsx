import { ArrowRight, Home } from 'lucide-react';
import type { SiteLang } from '../../context/LanguageContext';
import { getUiCopy } from '../../data/uiCopy';
import { TransitionLink } from '../PageTransition';

export interface OdysseyFinaleActProps {
  lang: SiteLang;
}

export function OdysseyFinaleAct({ lang }: OdysseyFinaleActProps) {
  const copy = getUiCopy(lang).odyssey.finaleAct;

  return (
    <section
      id="odyssey-act-finale"
      data-testid="odyssey-finale-act"
      aria-label="Odyssey Finale and Archive Portal"
      className="relative flex min-h-[84vh] w-full items-center overflow-x-clip px-6 py-28 text-[#F6F4EF] md:px-12 md:py-36"
    >
      <div className="relative z-10 mx-auto w-full max-w-[68rem] rounded-[30px] border border-[#DFBC91]/32 bg-[#0B0E17]/88 p-8 text-center md:p-14">
        <p className="text-xs font-medium tracking-[0.04em] text-[#DFBC91] uppercase">
          {copy.eyebrow}
        </p>

        <blockquote
          lang="bn"
          className="font-bn-verse mx-auto mt-6 max-w-3xl border-y border-white/12 py-8 text-[clamp(1.35rem,2.5vw,2.15rem)] leading-[1.72] text-[#FAF6EE]"
        >
          {copy.quote}
        </blockquote>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-[1.8] text-[#B2C2D4]/90 md:text-base">
          {copy.note}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <TransitionLink
            to="/poems"
            data-testid="odyssey-finale-archive-cta"
            className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 rounded-full border border-[#DFBC91]/75 bg-[#DFBC91] px-7 py-3 text-xs font-semibold text-[#11151E] transition-colors hover:bg-[#E9CEAA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FAF6EE]"
          >
            <span>{copy.archiveCta}</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </TransitionLink>

          <TransitionLink
            to="/"
            data-testid="odyssey-finale-home-cta"
            className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full border border-white/22 bg-[#121620] px-6 py-3 text-xs font-medium text-[#F6F4EF] transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{copy.classicCta}</span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
