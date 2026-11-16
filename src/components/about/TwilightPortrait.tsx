import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Water } from '@paper-design/shaders-react';
import { useLanguage } from '../../context/LanguageContext';
import { AUTHOR_PROFILE } from '../../data/authorProfile';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';
import {
  ShaderErrorBoundary,
  detectWebGLCapabilities,
} from '../shaders/LiveAtmosphere';

const TWILIGHT_PORTRAIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <defs>
    <filter id="mistBlur" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
    <filter id="contourBlur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
    <linearGradient id="twilightSky" x1="0%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#8C97A6"/>
      <stop offset="48%" stop-color="#5A6372"/>
      <stop offset="100%" stop-color="#363E4B"/>
    </linearGradient>
    <radialGradient id="amberHalo" cx="32%" cy="28%" r="58%">
      <stop offset="0%" stop-color="#EFEAE2" stop-opacity="0.72"/>
      <stop offset="45%" stop-color="#DFBC91" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#5A6372" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="profileLight" x1="18%" y1="18%" x2="86%" y2="85%">
      <stop offset="0%" stop-color="#F6F4EF" stop-opacity="0.88"/>
      <stop offset="52%" stop-color="#C8C0B6" stop-opacity="0.54"/>
      <stop offset="100%" stop-color="#4A5362" stop-opacity="0.18"/>
    </linearGradient>
    <linearGradient id="coatWash" x1="25%" y1="0%" x2="75%" y2="100%">
      <stop offset="0%" stop-color="#434C5B"/>
      <stop offset="55%" stop-color="#363E4B"/>
      <stop offset="100%" stop-color="#2D3542"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#twilightSky)"/>
  <circle cx="265" cy="285" r="340" fill="url(#amberHalo)" filter="url(#mistBlur)"/>
  <polygon points="0,0 410,0 240,1000 0,1000" fill="#B2C2D4" fill-opacity="0.18" filter="url(#mistBlur)"/>
  <!-- Three-quarter poetic silhouette in soft twilight slate -->
  <path d="M402 184c-58 0-108 32-134 86-16 32-20 70-12 108l-10 26c-4 10 2 18 12 20l4 24c3 16 14 28 28 34l8 40c2 22-4 44-20 58-82 32-154 114-184 252l-18 168h648l-14-146c-18-134-84-224-174-268-20-12-30-34-26-62l10-58c24-36 38-84 34-136-6-76-62-146-142-146z" fill="#3B4453" filter="url(#contourBlur)"/>
  <!-- Luminous brow, cheek, and shoulder rim -->
  <path d="M276 266c16-38 50-62 92-64-18 28-24 62-20 96-14 20-20 44-16 70 4 28 20 54 44 68-22 14-50 12-72-4-24-18-36-50-36-86 0-30 2-58 8-80z" fill="url(#profileLight)" filter="url(#contourBlur)"/>
  <path d="M454 218c38 30 58 82 52 138-6 44-24 84-50 116 14-42 20-86 14-132-4-46-12-88-16-122z" fill="#DFBC91" fill-opacity="0.32" filter="url(#mistBlur)"/>
  <path d="M98 1000c20-164 82-298 182-358 34-20 74-26 118-26 62 0 126 24 180 66 72 56 116 164 134 318H98z" fill="url(#coatWash)"/>
  <path d="M286 638c34 52 68 118 88 192 18-74 42-138 70-188" fill="none" stroke="#EFEAE2" stroke-opacity="0.34" stroke-width="4" filter="url(#contourBlur)"/>
</svg>`;

const DEFAULT_PORTRAIT_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  TWILIGHT_PORTRAIT_SVG
)}`;

export interface TwilightPortraitProps {
  imageSrc?: string;
  caption?: string;
  className?: string;
}

export function TwilightPortrait({
  imageSrc,
  caption,
  className = '',
}: TwilightPortraitProps) {
  const { lang } = useLanguage();
  const frameRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [waveBoost, setWaveBoost] = useState(0.35);
  const [webgl] = useState(() => detectWebGLCapabilities());

  const resolvedImage = useMemo(
    () => imageSrc || DEFAULT_PORTRAIT_DATA_URI,
    [imageSrc]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () =>
      document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEnteredView(true);
        }
      },
      { threshold: 0.05, rootMargin: '250px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !frameRef.current || !parallaxRef.current) {
        return;
      }

      gsap.fromTo(
        parallaxRef.current,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: frameRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );
    },
    { scope: frameRef }
  );

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const normX = Math.abs((e.clientX - rect.left) / rect.width - 0.5);
    setWaveBoost(Number((0.35 + normX * 0.14).toFixed(3)));
  };

  const handlePointerLeave = () => {
    setWaveBoost(0.35);
  };

  const maxPixelCount = webgl.isSoftwareRenderer ? 180000 : 320000;
  const effectiveSpeed = inView && pageVisible && !reducedMotion ? 0.35 : 0;

  const fallbackPortrait = (
    <div className="relative h-full w-full bg-[#5A6372]">
      <img
        src={resolvedImage}
        alt={`Twilight portrait study of ${AUTHOR_PROFILE.name[lang]}`}
        className="h-full w-full object-cover"
      />
    </div>
  );

  return (
    <figure className={className}>
      <div
        ref={frameRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        data-testid="twilight-portrait-frame"
        data-shader-active={effectiveSpeed > 0 ? 'true' : 'false'}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] border border-white/30 bg-[#5A6372]/55 shadow-[0_24px_60px_rgba(24,28,36,0.24)] backdrop-blur-[12px]"
      >
        <div
          ref={parallaxRef}
          className="absolute -inset-y-5 inset-x-0 will-change-transform"
        >
          {!webgl.supported || !hasEnteredView ? (
            fallbackPortrait
          ) : (
            <ShaderErrorBoundary fallback={fallbackPortrait}>
              <Water
                image={resolvedImage}
                colorBack="#5A6372"
                colorHighlight="#EFEAE2"
                highlights={0.4}
                layering={webgl.isSoftwareRenderer ? 0 : 0.25}
                waves={waveBoost}
                caustic={0.25}
                speed={effectiveSpeed}
                minPixelRatio={1}
                maxPixelCount={maxPixelCount}
                style={{ width: '100%', height: '100%' }}
              />
            </ShaderErrorBoundary>
          )}
        </div>

        {/* Soft translucent rim glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[32px]"
          style={{
            boxShadow: 'inset 0 1px 28px rgba(246, 244, 239, 0.25)',
          }}
        />
      </div>

      <figcaption className="mt-4 flex items-center justify-between px-1 text-xs font-medium text-[#F6F4EF]/76">
        <span>{caption ?? AUTHOR_PROFILE.portraitCaption[lang]}</span>
        <span className="text-[#DFBC91]">
          {AUTHOR_PROFILE.portraitSubcaption[lang]}
        </span>
      </figcaption>
    </figure>
  );
}
