import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { SiteLang } from '../../context/LanguageContext';
import { formatReadingTime, toBanglaNumerals } from '../../data/poemsCatalog';
import { getUiCopy } from '../../data/uiCopy';
import { prefersReducedMotion } from '../../lib/motion';
import { TransitionLink } from '../PageTransition';
import type { CycleVolumeEntry } from './cycleVolumesData';

const CONTEMPLATIVE_EASE = [0.22, 1, 0.36, 1] as const;

export interface CyclePoemDrawerProps {
  volume: CycleVolumeEntry | null;
  artworkSrc: string;
  artworkAlt: string;
  lang: SiteLang;
  onClose: () => void;
  onStepCycle: (delta: -1 | 1) => void;
}

export function CyclePoemDrawer({
  volume,
  artworkSrc,
  artworkAlt,
  lang,
  onClose,
  onStepCycle,
}: CyclePoemDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const copy = getUiCopy(lang).carousel;
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    if (!volume) return;
    const rafId = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onStepCycle(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        onStepCycle(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [volume, onClose, onStepCycle]);

  const drawerNode = (
    <AnimatePresence>
      {volume ? (
        <div
          className="fixed inset-0 z-[80] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cycle-drawer-title"
          data-testid="cycle-poem-drawer"
          data-active-cycle={volume.id}
        >
          {/* Scrim Backdrop */}
          <motion.button
            type="button"
            aria-label={copy.closeDrawer}
            onClick={onClose}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 cursor-pointer border-0 bg-[#10141D]/74 backdrop-blur-[8px]"
          />

          {/* Slide-Over Frosted Dusk Panel */}
          <motion.div
            initial={reducedMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reducedMotion ? undefined : { x: '100%' }}
            transition={{ duration: 0.32, ease: CONTEMPLATIVE_EASE }}
            data-lenis-prevent
            className="relative z-10 flex h-full w-full max-w-xl flex-col justify-between overflow-hidden border-l border-white/18 bg-[#181F2A]/96 text-[#F6F4EF] shadow-[-24px_0_72px_rgba(10,14,22,0.56)] backdrop-blur-[22px]"
          >
            {/* Header with Mini Artwork + Cycle Stepper + Close */}
            <div className="border-b border-white/14 p-6 md:px-8 md:py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-white/18 bg-[#252E3D]">
                    <img
                      src={artworkSrc}
                      alt={artworkAlt}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#DFBC91] tabular-nums">
                      <span>
                        {copy.volumeLabel} {volume.indexLabel}
                      </span>
                      <span aria-hidden="true" className="mx-2 text-white/40">
                        ·
                      </span>
                      <span className="text-[#F6F4EF]/80">
                        {volume.countLabel}
                      </span>
                    </p>
                    <h3
                      id="cycle-drawer-title"
                      lang={lang}
                      className="font-bn-display mt-1 text-xl leading-[1.32] font-semibold text-[#F6F4EF] md:text-2xl"
                    >
                      {volume.name}
                    </h3>
                  </div>
                </div>

                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label={copy.closeDrawer}
                  data-testid="cycle-drawer-close"
                  className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/[0.06] text-[#F6F4EF] transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-[#B2C2D4]">
                  {volume.years} · {copy.drawerSubtitle}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onStepCycle(-1)}
                    aria-label={copy.prevAria}
                    data-testid="drawer-prev-cycle"
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/16 bg-white/[0.04] text-[#F6F4EF]/82 transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onStepCycle(1)}
                    aria-label={copy.nextAria}
                    data-testid="drawer-next-cycle"
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/16 bg-white/[0.04] text-[#F6F4EF]/82 transition-colors hover:border-[#DFBC91] hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Poem List inside Cycle */}
            <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8">
              <ul className="divide-y divide-white/12">
                {volume.poems.map((poem, idx) => {
                  const numStr = String(idx + 1).padStart(2, '0');
                  const numLabel =
                    lang === 'bn' ? toBanglaNumerals(numStr) : numStr;

                  return (
                    <li key={poem.id} className="py-5 first:pt-2 last:pb-2">
                      <TransitionLink
                        to={`/poems/${poem.slug}`}
                        onClick={onClose}
                        data-testid={`drawer-poem-link-${poem.slug}`}
                        className="group block rounded-2xl p-2 -mx-2 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-xs font-medium text-[#DFBC91] tabular-nums">
                                {numLabel}
                              </span>
                              <h4
                                lang="bn"
                                className="font-bn-display text-lg font-semibold text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91] md:text-xl"
                              >
                                {poem.title}
                              </h4>
                            </div>

                            <p
                              lang="bn"
                              className="font-bn-verse mt-2 text-sm leading-[1.75] text-[#F6F4EF]/78"
                            >
                              “{poem.firstLine}”
                            </p>

                            <p className="mt-2.5 text-xs text-[#B2C2D4]/85 tabular-nums">
                              <span lang="bn">{poem.dateDisplay}</span>
                              <span aria-hidden="true" className="mx-1.5">
                                ·
                              </span>
                              <span>
                                {formatReadingTime(poem.readingSeconds, lang)}
                              </span>
                              <span aria-hidden="true" className="mx-1.5">
                                ·
                              </span>
                              <span lang="bn">{poem.themes.join(' · ')}</span>
                            </p>
                          </div>

                          <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#DFBC91] transition-transform duration-200 group-hover:translate-x-0.5">
                            <span className="hidden sm:inline">
                              {copy.openReadingRoom}
                            </span>
                            <ArrowUpRight
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </TransitionLink>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer Archive Link */}
            <div className="border-t border-white/14 bg-[#141A24]/90 p-6 md:px-8">
              <TransitionLink
                to={`/poems?collection=${encodeURIComponent(volume.id)}`}
                onClick={onClose}
                data-testid="drawer-archive-cycle-link"
                className="glass-light flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3 text-xs font-semibold text-[#171A21] shadow-[0_12px_32px_rgba(12,16,24,0.3)] transition-all duration-200 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{copy.exploreArchiveCycle}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </TransitionLink>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  return typeof document !== 'undefined'
    ? createPortal(drawerNode, document.body)
    : drawerNode;
}
