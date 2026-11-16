import { useEffect } from 'react';
import { ArrowLeft, Compass } from 'lucide-react';
import { TransitionLink } from '../components/PageTransition';
import { useLanguage } from '../context/LanguageContext';
import { getUiCopy } from '../data/uiCopy';
import { ScrollTrigger } from '../lib/motion';

export function NotFoundPage() {
  const { lang } = useLanguage();
  const copy = getUiCopy(lang);
  const nf = copy.notFound;

  useEffect(() => {
    document.title = `${nf.eyebrow} — ${copy.brand}`;
    ScrollTrigger.refresh();
  }, [nf.eyebrow, copy.brand]);

  return (
    <section
      aria-label={nf.eyebrow}
      className="relative flex min-h-[82svh] items-center justify-center overflow-x-clip px-6 py-32 text-[#F6F4EF]"
    >
      <div className="glass-dusk relative z-10 w-full max-w-xl rounded-[28px] p-8 text-center shadow-[0_24px_60px_rgba(24,28,36,0.24)] md:p-12">
        <p className="text-xs font-medium text-[#DFBC91] uppercase">
          {nf.eyebrow}
        </p>
        <h1 className="font-display display-luminous mt-4 text-[clamp(2.3rem,4.5vw,3.35rem)] font-semibold">
          {nf.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#F6F4EF]/80">
          {nf.desc}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <TransitionLink
            to="/"
            className="glass-light inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold text-[#171A21] transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{nf.returnHome}</span>
          </TransitionLink>

          <TransitionLink
            to="/poems"
            className="glass-dusk inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-medium text-[#F6F4EF] transition-colors hover:border-white/35 hover:text-[#DFBC91]"
          >
            <Compass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{nf.exploreWorks}</span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
