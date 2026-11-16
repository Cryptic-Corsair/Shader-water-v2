import { useEffect, useRef } from 'react';
import { useSmoothScroll } from '../components/SmoothScrollProvider';
import { ChapterPresence } from '../components/home/ChapterPresence';
import { ChronologyLedgerSection } from '../components/home/ChronologyLedgerSection';
import { CraftNotebookSection } from '../components/home/CraftNotebookSection';
import { CycleVolumesSection } from '../components/home/CycleVolumesSection';
import { HeroCinematicSection } from '../components/home/HeroCinematicSection';
import { PoeticTriptychSection } from '../components/home/PoeticTriptychSection';
import { SalonReadingSection } from '../components/home/SalonReadingSection';
import { ScrollTraceSpine } from '../components/home/ScrollTraceSpine';
import { useLanguage } from '../context/LanguageContext';
import { getUiCopy } from '../data/uiCopy';
import { useMagneticSnap } from '../hooks/useMagneticSnap';
import { ScrollTrigger } from '../lib/motion';

export function HomePage() {
  const homeRef = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();
  const { lang } = useLanguage();
  const copy = getUiCopy(lang);

  useEffect(() => {
    document.title = copy.brandFull;
    ScrollTrigger.refresh();
  }, [copy.brandFull]);

  useMagneticSnap(lenis, homeRef, '[data-snap-station]');

  return (
    <div
      id="exhibition-root"
      ref={homeRef}
      className="relative min-h-screen overflow-x-clip text-[#F6F4EF]"
    >
      <ScrollTraceSpine scopeSelector="#exhibition-root" />

      {/* Chapter 1 — Cinematic Spectacular Monsoon & Twilight Hero */}
      <HeroCinematicSection />

      {/* Chapter 3 — Poet Profile · 2023–2024 Notebook (Preserved Unchanged) */}
      <ChapterPresence />

      {/* Chapter 4 — Three Poetic Movements Triptych */}
      <PoeticTriptychSection />

      {/* Chapter 5 — Three Poetic Volumes Monograph Stage */}
      <CycleVolumesSection />

      {/* Chapter 6 — Craft & Notebook Studio */}
      <CraftNotebookSection />

      {/* Chapter 7 — Nocturnal Reading Salon & Kinetic Verse Ribbons */}
      <SalonReadingSection />

      {/* Chapter 8 — Dated Manuscript Chronology & Exhibition Epilogue */}
      <ChronologyLedgerSection />
    </div>
  );
}
