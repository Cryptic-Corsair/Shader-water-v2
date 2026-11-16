import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSmoothScroll } from '../components/SmoothScrollProvider';
import { OdysseyActRail } from '../components/odyssey/OdysseyActRail';
import { OdysseyChronicleAct } from '../components/odyssey/OdysseyChronicleAct';
import { OdysseyConstellationAct } from '../components/odyssey/OdysseyConstellationAct';
import { OdysseyFinaleAct } from '../components/odyssey/OdysseyFinaleAct';
import { OdysseyHeroAct } from '../components/odyssey/OdysseyHeroAct';
import { OdysseyMaskAct } from '../components/odyssey/OdysseyMaskAct';
import {
  OdysseyWebGLCanvas,
  type OdysseyMoodOverride,
} from '../components/odyssey/OdysseyWebGLCanvas';
import {
  ODYSSEY_ACTS,
  resolveActByProgress,
} from '../components/odyssey/odysseyChoreography';
import { useLanguage } from '../context/LanguageContext';
import type { PoemMeta } from '../data/poemsCatalog';
import { getUiCopy } from '../data/uiCopy';
import { ScrollTrigger } from '../lib/motion';

export function OdysseyLandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<number>(0);
  const scrollVelocityRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const moodOverrideRef = useRef<OdysseyMoodOverride | null>(null);

  const [searchParams] = useSearchParams();
  const autostart = searchParams.get('autostart') === '1';

  const { lang } = useLanguage();
  const copy = getUiCopy(lang);
  const { scrollToElement, scrollToTop } = useSmoothScroll();

  const [activeActIndex, setActiveActIndex] = useState(0);
  const [hudProgress, setHudProgress] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState('tumi-amar');

  useEffect(() => {
    document.title = `${copy.brand} — ${copy.nav.odyssey}`;
  }, [copy.brand, copy.nav.odyssey]);

  // Normalized pointer tracking for camera parallax & particle magnetic drift
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const nx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
      pointerRef.current = { x: nx, y: ny };
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Global GSAP ScrollTrigger driving 0 -> 1 progress across the entire Odyssey journey
  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;

    let lastHudUpdate = 0;

    const trigger = ScrollTrigger.create({
      trigger: rootEl,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
        scrollVelocityRef.current = self.getVelocity() / 1800;

        // Release manual poem palette override once outside Act III constellation zone
        if (self.progress < 0.36 || self.progress > 0.78) {
          moodOverrideRef.current = null;
        }

        const now = performance.now();
        if (now - lastHudUpdate > 90 || self.progress === 0 || self.progress === 1) {
          lastHudUpdate = now;
          const resolved = resolveActByProgress(self.progress);
          setActiveActIndex((prev) =>
            prev === resolved.actIndex ? prev : resolved.actIndex
          );
          setHudProgress(self.progress);
        }
      },
    });

    ScrollTrigger.refresh();
    return () => {
      trigger.kill();
    };
  }, []);

  const handleSelectPoem = useCallback((poem: PoemMeta) => {
    setSelectedSlug(poem.slug);
    moodOverrideRef.current = {
      primaryHex: poem.moodColors[2],
      secondaryHex: poem.moodColors[1],
    };
  }, []);

  const handleJumpToAct = useCallback(
    (actId: string) => {
      scrollToElement(actId, 0);
    },
    [scrollToElement]
  );

  const handleEnterOdyssey = useCallback(() => {
    scrollToElement('odyssey-act-masks', 0);
  }, [scrollToElement]);

  const handleJumpTop = useCallback(() => {
    scrollToTop(false);
  }, [scrollToTop]);

  const activeAct = ODYSSEY_ACTS[activeActIndex] ?? ODYSSEY_ACTS[0];

  return (
    <div
      ref={rootRef}
      data-testid="odyssey-page-root"
      data-active-act={activeAct.id}
      className="relative min-h-screen w-full overflow-x-clip bg-[#06080F] text-[#F6F4EF]"
    >
      {/* Dedicated Full-Viewport Interactive Three.js WebGL Stage */}
      <OdysseyWebGLCanvas
        scrollProgressRef={scrollProgressRef}
        scrollVelocityRef={scrollVelocityRef}
        pointerRef={pointerRef}
        moodOverrideRef={moodOverrideRef}
      />

      {/* Five Scroll-Driven Narrative & Interactive Acts */}
      <div className="relative z-10">
        <OdysseyHeroAct
          lang={lang}
          autostart={autostart}
          onEnterOdyssey={handleEnterOdyssey}
        />

        <OdysseyMaskAct lang={lang} />

        <OdysseyConstellationAct
          lang={lang}
          selectedSlug={selectedSlug}
          onSelectPoem={handleSelectPoem}
        />

        <OdysseyChronicleAct lang={lang} />

        <OdysseyFinaleAct lang={lang} />
      </div>

      {/* Collapsible Bottom Act Dock */}
      <OdysseyActRail
        lang={lang}
        activeActIndex={activeActIndex}
        progress={hudProgress}
        onJumpToAct={handleJumpToAct}
        onJumpTop={handleJumpTop}
      />
    </div>
  );
}
