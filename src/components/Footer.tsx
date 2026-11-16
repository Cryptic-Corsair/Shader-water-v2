import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';
import { ArrowUp } from 'lucide-react';
import { Water } from '@paper-design/shaders-react';
import { useLanguage } from '../context/LanguageContext';
import { getUiCopy } from '../data/uiCopy';
import { useMagnetic } from '../lib/motion';
import { TransitionLink } from './PageTransition';
import { useSmoothScroll } from './SmoothScrollProvider';
import {
  FOOTER_DIAGONAL_CUT_POLYGON,
  FOOTER_WATER_IMAGE_URI,
  resolveFooterWaterSpeed,
} from './footerWaterConfig';
import { validateDispatchEmail } from './home/versesLogic';
import {
  ShaderErrorBoundary,
  detectWebGLCapabilities,
} from './shaders/LiveAtmosphere';

export function Footer() {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const footerRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webgl] = useState(() => detectWebGLCapabilities());

  const { lang } = useLanguage();
  const ui = getUiCopy(lang);
  const copy = ui.footer;

  const subscribeBtnRef = useRef<HTMLButtonElement>(null);
  const topBtnRef = useRef<HTMLButtonElement>(null);
  const { scrollToTop } = useSmoothScroll();

  useMagnetic(subscribeBtnRef, 0.2);
  useMagnetic(topBtnRef, 0.22);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
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
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEnteredView(true);
        }
      },
      { threshold: 0.02, rootMargin: '280px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateDispatchEmail(email, lang);
    setFeedback(result);
    if (result.valid) {
      setEmail('');
    }
  };

  const effectiveSpeed = resolveFooterWaterSpeed({
    inView,
    pageVisible,
    reducedMotion,
  });

  const fallbackWaterBg = (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url("${FOOTER_WATER_IMAGE_URI}")`,
      }}
    />
  );

  const footerCssVars = {
    '--footer-cut-h': 'clamp(44px, 5.5vw, 84px)',
  } as CSSProperties;

  return (
    <footer
      ref={footerRef}
      data-testid="site-footer"
      data-water-active={effectiveSpeed > 0 ? 'true' : 'false'}
      aria-label="Site footer and notes"
      style={footerCssVars}
      className="relative z-10 mt-6 overflow-x-clip bg-transparent text-[#F6F4EF]"
    >
      {/* Diagonal Twilight Horizon Cut Surface */}
      <div
        data-testid="footer-diagonal-shell"
        className="relative w-full overflow-hidden bg-[#232934]"
        style={{
          clipPath: FOOTER_DIAGONAL_CUT_POLYGON,
          WebkitClipPath: FOOTER_DIAGONAL_CUT_POLYGON,
        }}
      >
        {/* Clearly Visible Luminous Twilight Amber Water Shader */}
        <div
          data-testid="footer-water-layer"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-100"
        >
          {!webgl.supported || !hasEnteredView ? (
            fallbackWaterBg
          ) : (
            <ShaderErrorBoundary fallback={fallbackWaterBg}>
              <Water
                image={FOOTER_WATER_IMAGE_URI}
                colorBack="#232934"
                colorHighlight="#DFBC91"
                highlights={0.85}
                layering={webgl.isSoftwareRenderer ? 0 : 0.45}
                edges={0.16}
                caustic={0.62}
                waves={0.55}
                size={1.75}
                speed={effectiveSpeed}
                minPixelRatio={1}
                maxPixelCount={webgl.isSoftwareRenderer ? 200000 : 340000}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  inset: 0,
                }}
              />
            </ShaderErrorBoundary>
          )}
        </div>

        {/* Soft Top Horizon Rim Glow + Localized Lower Text Readability Scrim (keeps upper water caustics bright & vivid) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(180deg, rgba(223, 188, 145, 0.14) 0%, rgba(28, 34, 44, 0.08) 38%, rgba(20, 25, 33, 0.56) 70%, rgba(18, 22, 30, 0.72) 100%)',
          }}
        />

        {/* Compact Single-Band Archive Bar */}
        <div className="relative z-10 mx-auto max-w-[82rem] px-6 pt-[calc(var(--footer-cut-h)+2.75rem)] pb-10 md:px-10 md:pt-[calc(var(--footer-cut-h)+3.25rem)] md:pb-11">
          <div className="flex flex-col gap-7 rounded-2xl border border-white/14 bg-[#1B2029]/48 px-5 py-5 backdrop-blur-[10px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-7 lg:py-5">
            {/* Zone 1: Poet Imprint & Collection Summary */}
            <div className="min-w-0 lg:max-w-[26rem]">
              <p
                lang={lang}
                className="font-editorial-serif text-base font-medium text-[#FAF0E8]"
              >
                {ui.brand}
                <span className="mx-2 text-[#DFBC91]" aria-hidden="true">
                  ·
                </span>
                <span className="text-xs font-normal text-[#DFBC91]">
                  {copy.notesEyebrow}
                </span>
              </p>
              <p
                lang={lang}
                className="mt-1 text-xs leading-[1.65] text-[#F6F4EF]/84"
              >
                {copy.brandSummary}
              </p>
            </div>

            {/* Zone 2: Unboxed Single-Line Editorial Navigation */}
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap items-center gap-6 shrink-0"
            >
              <TransitionLink
                to="/"
                className="editorial-link whitespace-nowrap shrink-0 text-xs font-medium text-[#F6F4EF]/90 transition-colors hover:text-[#DFBC91]"
              >
                {copy.home}
              </TransitionLink>
              <TransitionLink
                to="/poems"
                className="editorial-link whitespace-nowrap shrink-0 text-xs font-medium text-[#F6F4EF]/90 transition-colors hover:text-[#DFBC91]"
              >
                {copy.archive}
              </TransitionLink>
              <TransitionLink
                to="/shaders"
                className="editorial-link whitespace-nowrap shrink-0 text-xs font-medium text-[#F6F4EF]/90 transition-colors hover:text-[#DFBC91]"
              >
                {ui.nav.shaders}
              </TransitionLink>
              <TransitionLink
                to="/#chapter-story"
                className="editorial-link whitespace-nowrap shrink-0 text-xs font-medium text-[#F6F4EF]/90 transition-colors hover:text-[#DFBC91]"
              >
                {copy.journey}
              </TransitionLink>
            </nav>

            {/* Zone 3: Compact Inline Notes Form + Back-to-Top Action */}
            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-1 items-center gap-2 sm:flex-initial"
                >
                  <label htmlFor="dispatch-email-input" className="sr-only">
                    {copy.emailLabel}
                  </label>
                  <input
                    id="dispatch-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (feedback) setFeedback(null);
                    }}
                    placeholder={copy.emailPlaceholder}
                    aria-describedby={
                      feedback ? 'dispatch-feedback-msg' : undefined
                    }
                    className="min-w-0 flex-1 rounded-full border border-white/24 bg-[#171B23]/65 px-4 py-2 text-xs text-[#F6F4EF] placeholder:text-[#F6F4EF]/60 transition-colors focus:border-[#DFBC91] focus:bg-[#171B23]/85 focus:outline-none sm:w-48"
                  />

                  <button
                    ref={subscribeBtnRef}
                    type="submit"
                    className="glass-light inline-flex cursor-pointer items-center justify-center whitespace-nowrap shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-[#171A21] transition-colors duration-200 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    {copy.receiveNotes}
                  </button>
                </form>

                <button
                  ref={topBtnRef}
                  type="button"
                  onClick={() => scrollToTop(false)}
                  className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full border border-white/26 bg-white/10 px-4 py-2 text-xs font-medium text-[#F6F4EF] transition-colors hover:border-[#DFBC91]/80 hover:text-[#DFBC91] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <span>{copy.backToTop}</span>
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {feedback ? (
                <p
                  id="dispatch-feedback-msg"
                  role="status"
                  className={`text-xs font-medium ${
                    feedback.valid ? 'text-[#DFBC91]' : 'text-[#B2C2D4]'
                  }`}
                >
                  {feedback.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Crisp Diagonal Twilight Amber Horizon Seam Line */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 w-full"
        style={{ height: 'var(--footer-cut-h)' }}
      >
        <defs>
          <linearGradient id="footerHorizonSeam" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B2C2D4" stopOpacity="0.45" />
            <stop offset="48%" stopColor="#DFBC91" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#FAF0E2" stopOpacity="0.72" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="100"
          x2="100"
          y2="0"
          stroke="url(#footerHorizonSeam)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </footer>
  );
}
