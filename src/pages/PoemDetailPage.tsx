import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CloudSun,
  Eye,
  EyeOff,
  MoonStar,
} from 'lucide-react';
import { TransitionLink } from '../components/PageTransition';
import { useReadingSurface } from '../components/ReadingSurfaceContext';
import { useLanguage } from '../context/LanguageContext';
import {
  formatReadingTime,
  getCycleLabel,
  toBanglaNumerals,
  type PoemFull,
} from '../data/poemsCatalog';
import {
  getPoemBySlug,
  getReadingRoomAdjacentPoems,
} from '../data/poemsContent';
import { getUiCopy } from '../data/uiCopy';
import {
  EDITORIAL_EASE,
  ScrollTrigger,
  SplitText,
  gsap,
  prefersReducedMotion,
  useGSAP,
} from '../lib/motion';
import {
  DEFAULT_POEM_FONT_STEP,
  POEM_FONT_STEPS_REM,
  buildAnnotatedStanzas,
  clampFontStep,
} from './poemMarginalia';

const FONT_STEP_STORAGE_KEY = 'ah-poem-font-step';

function readStoredFontStep(): number {
  try {
    const raw = window.localStorage.getItem(FONT_STEP_STORAGE_KEY);
    if (raw !== null) {
      return clampFontStep(Number(raw));
    }
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_POEM_FONT_STEP;
}

export function PoemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang);
  const rr = copy.readingRoom;

  const { surface, toggleSurface, quietMode, toggleQuietMode } =
    useReadingSurface();

  const [poem, setPoem] = useState<PoemFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontStep, setFontStep] = useState<number>(readStoredFontStep);
  const [hoveredNoteIndex, setHoveredNoteIndex] = useState<number | null>(null);
  const [pinnedNoteIndex, setPinnedNoteIndex] = useState<number | null>(null);

  const activeNoteIndex = pinnedNoteIndex ?? hoveredNoteIndex;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setHoveredNoteIndex(null);
    setPinnedNoteIndex(null);

    if (!slug) {
      setPoem(null);
      setLoading(false);
      return;
    }

    getPoemBySlug(slug).then((loaded) => {
      if (!active) return;
      setPoem(loaded);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (loading) return;
    document.title = poem
      ? `${poem.title} — ${copy.brand}`
      : `${rr.notFoundEyebrow} — ${copy.brand}`;
    ScrollTrigger.refresh();
  }, [loading, poem, copy.brand, rr.notFoundEyebrow]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FONT_STEP_STORAGE_KEY, String(fontStep));
    } catch {
      // Ignore storage errors
    }
  }, [fontStep]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (pinnedNoteIndex !== null) {
        setPinnedNoteIndex(null);
        return;
      }
      if (quietMode) {
        toggleQuietMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pinnedNoteIndex, quietMode, toggleQuietMode]);

  const annotatedStanzas = useMemo(
    () => (poem ? buildAnnotatedStanzas(poem.stanzas, poem.marginalia) : []),
    [poem]
  );

  // GSAP reading progress bar, Bengali-safe SplitText line reveal, and staggered stanzas
  useGSAP(
    () => {
      if (loading || !poem) return;

      if (progressRef.current && containerRef.current) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            if (progressRef.current) {
              gsap.set(progressRef.current, { scaleX: self.progress });
            }
          },
        });
      }

      if (prefersReducedMotion()) return;

      gsap.from('[data-stanza]', {
        y: 16,
        opacity: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: EDITORIAL_EASE,
        immediateRender: false,
        clearProps: 'transform,opacity',
      });

      let active = true;
      let splitInstance: SplitText | null = null;
      const fontsReady = document.fonts?.ready ?? Promise.resolve();

      fontsReady.then(() => {
        if (!active || !titleRef.current) return;
        splitInstance = SplitText.create(titleRef.current, {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          linesClass: 'pt-[0.08em] pb-[0.22em] -mb-[0.14em]',
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 106,
              opacity: 0,
              duration: 0.9,
              stagger: 0.07,
              ease: 'power4.out',
              clearProps: 'transform,opacity',
            });
          },
        });
      });

      return () => {
        active = false;
        splitInstance?.revert();
      };
    },
    {
      scope: containerRef,
      dependencies: [loading, poem?.slug, lang],
      revertOnUpdate: true,
    }
  );

  // Desktop right-gutter marginalia frosted bubble glide
  useGSAP(
    () => {
      if (loading || !poem) return;
      const notes = gsap.utils.toArray<HTMLElement>('[data-marginalia-gutter]');
      if (notes.length === 0) return;

      notes.forEach((el) => {
        const noteId = Number(el.dataset.marginaliaGutter);
        const isActive = noteId === activeNoteIndex;

        if (prefersReducedMotion()) {
          gsap.set(el, {
            opacity: isActive ? 1 : 0,
            x: 0,
          });
          return;
        }

        if (isActive) {
          gsap.fromTo(
            el,
            { opacity: 0, x: 14 },
            {
              opacity: 1,
              x: 0,
              duration: 0.36,
              ease: EDITORIAL_EASE,
              overwrite: 'auto',
            }
          );
        } else {
          gsap.to(el, {
            opacity: 0,
            x: 10,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });
    },
    { scope: containerRef, dependencies: [activeNoteIndex, loading, poem?.slug] }
  );

  const isDaylight = surface === 'paper';
  const adjacent = slug
    ? getReadingRoomAdjacentPoems(slug)
    : { prev: null, next: null };

  const handleFontDecrease = () => {
    setFontStep((prev) => clampFontStep(prev - 1));
  };

  const handleFontIncrease = () => {
    setFontStep((prev) => clampFontStep(prev + 1));
  };

  const handlePhraseEnter = (noteIndex: number) => {
    setHoveredNoteIndex(noteIndex);
  };

  const handlePhraseLeave = (noteIndex: number) => {
    setHoveredNoteIndex((prev) => (prev === noteIndex ? null : prev));
  };

  const handlePhraseClick = (noteIndex: number) => {
    setPinnedNoteIndex((prev) => (prev === noteIndex ? null : noteIndex));
  };

  const daylightSurfaceStyle: CSSProperties = {
    background:
      'linear-gradient(165deg, #EAE6DE 0%, #E1DBD2 52%, #D7D1C8 100%)',
  };

  if (loading) {
    return (
      <div
        ref={containerRef}
        style={isDaylight ? daylightSurfaceStyle : undefined}
        className={`min-h-screen pt-32 pb-24 transition-colors duration-300 ${
          isDaylight ? 'text-[#171A21]' : 'text-[#F6F4EF]'
        }`}
      >
        <div className="mx-auto max-w-[82rem] px-6 md:px-10">
          <p className="text-xs font-medium opacity-70">{rr.opening}</p>
        </div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div
        ref={containerRef}
        style={isDaylight ? daylightSurfaceStyle : undefined}
        className={`min-h-screen pt-32 pb-24 transition-colors duration-300 ${
          isDaylight ? 'text-[#171A21]' : 'text-[#F6F4EF]'
        }`}
      >
        <div className="mx-auto max-w-[82rem] px-6 md:px-10">
          <div
            className={`max-w-xl rounded-[28px] p-8 md:p-10 ${
              isDaylight ? 'glass-light' : 'glass-dusk'
            }`}
          >
            <p className="text-xs font-medium text-[#DFBC91] uppercase">
              {rr.notFoundEyebrow}
            </p>
            <h1 className="font-editorial-serif mt-3 text-3xl font-normal md:text-4xl">
              {rr.notFoundTitle}
            </h1>
            <p className="mt-4 text-sm leading-relaxed opacity-80">
              {rr.notFoundDesc}
            </p>
            <TransitionLink
              to="/poems"
              className={`mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-opacity hover:opacity-85 ${
                isDaylight
                  ? 'bg-[#171A21] text-[#F6F4EF]'
                  : 'glass-light text-[#171A21]'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{rr.returnWorks}</span>
            </TransitionLink>
          </div>
        </div>
      </div>
    );
  }

  const poemSizeRem = POEM_FONT_STEPS_REM[fontStep];
  const noteCount = poem.marginalia?.length ?? 0;

  const controlPillClass = isDaylight
    ? 'glass-light text-[#171A21] hover:bg-white/85'
    : 'glass-dusk text-[#F6F4EF] hover:border-white/35';

  const targetSurfaceLabel = isDaylight
    ? rr.switchToTwilight
    : rr.switchToDaylight;

  return (
    <div ref={containerRef}>
      <article
        data-surface={isDaylight ? 'daylight' : 'twilight'}
        data-quiet-mode={quietMode ? 'true' : 'false'}
        style={{
          ...(isDaylight ? daylightSurfaceStyle : {}),
          '--poem-size': `${poemSizeRem}rem`,
        } as CSSProperties}
        className={`relative isolate min-h-screen overflow-x-clip pt-24 pb-24 transition-colors duration-300 md:pt-28 ${
          isDaylight ? 'text-[#171A21]' : 'text-[#F6F4EF]'
        }`}
      >
        {/* Top Reading Progress Hairline */}
        <div
          ref={progressRef}
          aria-hidden="true"
          data-testid="reading-progress-bar"
          className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] origin-left scale-x-0 ${
            isDaylight ? 'bg-[#8E6B47]' : 'bg-[#DFBC91]'
          }`}
        />

        {/* Pure-CSS Poem Mood Pigment Veil layered over Global AmbientBackdrop (0 WebGL overhead) */}
        {!isDaylight ? (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(75% 65% at 22% 18%, ${poem.moodColors[2]}22 0%, transparent 62%), radial-gradient(70% 68% at 84% 78%, ${poem.moodColors[0]}48 0%, transparent 66%)`,
            }}
          />
        ) : null}

        <div className="relative z-10 mx-auto max-w-[82rem] px-6 md:px-10">
          {/* Floating Reading Sanctuary Utility Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
            <TransitionLink
              to="/poems"
              className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${controlPillClass}`}
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{rr.allWorks}</span>
            </TransitionLink>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Font Scale A- / A+ */}
              <div
                role="group"
                aria-label="Poem text scale"
                className={`inline-flex items-center rounded-full p-0.5 ${
                  isDaylight ? 'glass-light' : 'glass-dusk'
                }`}
              >
                <button
                  type="button"
                  onClick={handleFontDecrease}
                  disabled={fontStep === 0}
                  aria-label={rr.decreaseFontAria}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    fontStep === 0
                      ? 'cursor-not-allowed opacity-35'
                      : 'hover:opacity-75'
                  }`}
                >
                  {lang === 'bn' ? 'অ-' : 'A-'}
                </button>
                <span
                  aria-hidden="true"
                  className={`h-3.5 w-px ${
                    isDaylight ? 'bg-[#171A21]/18' : 'bg-white/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleFontIncrease}
                  disabled={fontStep === POEM_FONT_STEPS_REM.length - 1}
                  aria-label={rr.increaseFontAria}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-opacity whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    fontStep === POEM_FONT_STEPS_REM.length - 1
                      ? 'cursor-not-allowed opacity-35'
                      : 'hover:opacity-75'
                  }`}
                >
                  {lang === 'bn' ? 'অ+' : 'A+'}
                </button>
              </div>

              {/* Quiet Mode Toggle */}
              <button
                type="button"
                onClick={toggleQuietMode}
                aria-pressed={quietMode}
                aria-label={quietMode ? rr.quietOn : rr.quietMode}
                className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                  quietMode
                    ? 'bg-[#DFBC91] text-[#171A21]'
                    : controlPillClass
                }`}
              >
                {quietMode ? (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{quietMode ? rr.quietOn : rr.quietMode}</span>
              </button>

              {/* Twilight / Daylight Toggle */}
              <button
                type="button"
                onClick={toggleSurface}
                data-testid="reading-surface-toggle"
                aria-label={targetSurfaceLabel}
                className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${controlPillClass}`}
              >
                {isDaylight ? (
                  <MoonStar
                    className="h-3.5 w-3.5 text-[#4C5361]"
                    aria-hidden="true"
                  />
                ) : (
                  <CloudSun
                    className="h-3.5 w-3.5 text-[#DFBC91]"
                    aria-hidden="true"
                  />
                )}
                <span>{targetSurfaceLabel}</span>
              </button>
            </div>
          </div>

          {/* Centered Reading Sanctuary Column + Desktop Marginalia Gutter */}
          <div className="pt-8 pb-16 md:pt-12 md:pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(1.5rem,0.45fr)_minmax(0,54ch)_minmax(15.5rem,1fr)] xl:grid-cols-[1fr_minmax(0,54ch)_1fr] lg:gap-x-10">
              {/* Poem Header */}
              <header className="lg:col-start-2">
                <div
                  className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium ${
                    isDaylight ? 'text-[#4C5361]' : 'text-[#B2C2D4]'
                  }`}
                >
                  <span>{getCycleLabel(poem.collection, lang)}</span>
                  <span aria-hidden="true">·</span>
                  <span lang="bn" className="font-bn-ui">
                    {poem.dateDisplay}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatReadingTime(poem.readingSeconds, lang)}</span>
                  {noteCount > 0 ? (
                    <span
                      className={`inline-flex items-center gap-2 ${
                        isDaylight ? 'text-[#8E6B47]' : 'text-[#DFBC91]'
                      }`}
                    >
                      <span aria-hidden="true">·</span>
                      <span>
                        {lang === 'bn' ? toBanglaNumerals(noteCount) : noteCount}{' '}
                        {noteCount === 1 ? rr.noteSingular : rr.notePlural}
                      </span>
                    </span>
                  ) : null}
                </div>

                <h1
                  key={`${poem.slug}-${lang}`}
                  ref={titleRef}
                  lang="bn"
                  className={`font-bn-display mt-4 text-[clamp(2.35rem,4.9vw,4.15rem)] leading-[1.28] font-semibold ${
                    isDaylight ? 'text-[#171A21]' : 'display-luminous'
                  }`}
                >
                  {poem.title}
                </h1>

                {poem.epigraph ? (
                  <blockquote
                    lang="bn"
                    className={`font-bn-verse mt-6 border-l-2 pl-4 text-lg md:text-xl ${
                      isDaylight
                        ? 'border-[#8E6B47]/50 text-[#4C5361]'
                        : 'border-[#DFBC91]/60 text-[#F6F4EF]/82'
                    }`}
                  >
                    {poem.epigraph}
                  </blockquote>
                ) : null}

                <div
                  aria-hidden="true"
                  className={`mt-9 h-px w-full ${
                    isDaylight ? 'bg-[#171A21]/12' : 'bg-white/16'
                  }`}
                />
              </header>

              {/* Stanzas + Optional Marginalia Gutter */}
              <div className="contents">
                {annotatedStanzas.map((stanza, stanzaIdx) => {
                  const mobileActiveNote = stanza.notes.find(
                    (n) => n.noteIndex === pinnedNoteIndex
                  );

                  return (
                    <div
                      key={`${poem.slug}-stanza-row-${stanzaIdx}`}
                      className="mt-9 first:mt-10 lg:contents"
                    >
                      {/* Centered Stanza Column (strictly Bangla, 1.9 line-height, 0 letter-spacing, max-width 54ch) */}
                      <div data-stanza className="lg:col-start-2 lg:mt-10">
                        <p
                          lang="bn"
                          className="font-bn-verse leading-[1.9]"
                          style={{
                            fontSize: 'var(--poem-size)',
                            lineHeight: 1.9,
                            letterSpacing: 0,
                          }}
                        >
                          {stanza.lines.map((segments, lineIdx) => (
                            <span
                              key={`${poem.slug}-s${stanzaIdx}-l${lineIdx}`}
                              className="block"
                            >
                              {segments.map((seg, segIdx) => {
                                if (seg.type === 'text') {
                                  return (
                                    <span key={`t-${segIdx}`}>{seg.text}</span>
                                  );
                                }

                                const isActive =
                                  activeNoteIndex === seg.noteIndex;

                                return (
                                  <button
                                    key={`a-${seg.noteIndex}-${segIdx}`}
                                    type="button"
                                    data-marginalia-trigger={seg.noteIndex}
                                    aria-expanded={isActive}
                                    aria-controls={`marginalia-note-${seg.noteIndex}`}
                                    onMouseEnter={() =>
                                      handlePhraseEnter(seg.noteIndex)
                                    }
                                    onMouseLeave={() =>
                                      handlePhraseLeave(seg.noteIndex)
                                    }
                                    onFocus={() =>
                                      handlePhraseEnter(seg.noteIndex)
                                    }
                                    onBlur={() =>
                                      handlePhraseLeave(seg.noteIndex)
                                    }
                                    onClick={() =>
                                      handlePhraseClick(seg.noteIndex)
                                    }
                                    className={`inline cursor-pointer rounded-md border-0 px-1 -mx-1 py-0.5 text-left font-inherit underline decoration-[1.5px] underline-offset-[5px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                                      isDaylight
                                        ? isActive
                                          ? 'bg-[#8E6B47]/15 text-[#171A21] decoration-[#8E6B47]'
                                          : 'bg-transparent decoration-[#8E6B47]/70 hover:bg-[#8E6B47]/10'
                                        : isActive
                                          ? 'bg-[#DFBC91]/18 text-[#DFBC91] decoration-[#DFBC91]'
                                          : 'bg-transparent decoration-[#DFBC91]/75 hover:bg-[#DFBC91]/12 hover:text-[#DFBC91]'
                                    }`}
                                  >
                                    <span>{seg.text}</span>
                                    <sup
                                      className={`ml-0.5 text-[0.62em] font-semibold select-none ${
                                        isDaylight
                                          ? 'text-[#8E6B47]'
                                          : 'text-[#DFBC91]'
                                      }`}
                                    >
                                      {seg.superscript}
                                    </sup>
                                  </button>
                                );
                              })}
                            </span>
                          ))}
                        </p>

                        {/* Mobile Inline Frosted Margin Bubble (< 1024px) */}
                        {mobileActiveNote ? (
                          <aside
                            id={`marginalia-mobile-${mobileActiveNote.noteIndex}`}
                            aria-label={`Margin note ${mobileActiveNote.noteIndex}`}
                            className={`mt-4 rounded-[20px] p-4 lg:hidden ${
                              isDaylight ? 'glass-light' : 'glass-dusk'
                            }`}
                          >
                            <p
                              className={`text-xs font-semibold ${
                                isDaylight ? 'text-[#8E6B47]' : 'text-[#DFBC91]'
                              }`}
                            >
                              {mobileActiveNote.superscript} “
                              {mobileActiveNote.lineHint}”
                            </p>
                            <p
                              className={`mt-1.5 text-sm leading-relaxed ${
                                isDaylight
                                  ? 'text-[#4C5361]'
                                  : 'text-[#F6F4EF]/85'
                              }`}
                            >
                              {mobileActiveNote.note}
                            </p>
                          </aside>
                        ) : null}
                      </div>

                      {/* Desktop Right-Gutter Floating Frosted Glass Margin Bubble (>= 1024px) */}
                      <div className="hidden lg:relative lg:col-start-3 lg:mt-10 lg:block">
                        {stanza.notes.map((note) => {
                          const isActive = activeNoteIndex === note.noteIndex;
                          return (
                            <aside
                              key={`gutter-${note.noteIndex}`}
                              id={`marginalia-note-${note.noteIndex}`}
                              data-marginalia-gutter={note.noteIndex}
                              data-active={isActive ? 'true' : 'false'}
                              aria-hidden={!isActive}
                              className={`pointer-events-none opacity-0 lg:absolute lg:inset-x-0 lg:top-0 rounded-[20px] p-4 shadow-[0_14px_32px_rgba(24,28,36,0.16)] ${
                                isDaylight ? 'glass-light' : 'glass-dusk'
                              }`}
                            >
                              <p
                                className={`text-xs font-semibold ${
                                  isDaylight
                                    ? 'text-[#8E6B47]'
                                    : 'text-[#DFBC91]'
                                }`}
                              >
                                {rr.noteSingular} {note.superscript}
                              </p>
                              <p
                                className={`mt-1.5 text-sm leading-relaxed ${
                                  isDaylight
                                    ? 'text-[#4C5361]'
                                    : 'text-[#F6F4EF]/88'
                                }`}
                              >
                                {note.note}
                              </p>
                            </aside>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* End-of-Poem Motifs & Collection Pills */}
              <footer
                className={`mt-16 border-t pt-8 lg:col-start-2 ${
                  isDaylight ? 'border-[#171A21]/12' : 'border-white/16'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {poem.themes.map((theme) => (
                      <TransitionLink
                        key={theme}
                        to={`/poems?theme=${encodeURIComponent(theme)}`}
                        lang="bn"
                        className={`font-bn-ui rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                          isDaylight
                            ? 'glass-light hover:bg-white/90'
                            : 'glass-dusk hover:border-white/35 hover:text-[#DFBC91]'
                        }`}
                      >
                        {theme}
                      </TransitionLink>
                    ))}
                  </div>

                  <TransitionLink
                    to={`/poems?collection=${encodeURIComponent(poem.collection)}`}
                    className={`editorial-link text-xs font-medium ${
                      isDaylight
                        ? 'text-[#4C5361] hover:text-[#171A21]'
                        : 'text-[#DFBC91] hover:text-[#F6F4EF]'
                    }`}
                  >
                    {getCycleLabel(poem.collection, lang)}
                  </TransitionLink>
                </div>
              </footer>
            </div>
          </div>

          {/* Adjacent Poem Frosted Cards */}
          <nav
            aria-label={rr.nextPoem}
            className="grid gap-5 sm:grid-cols-2"
          >
            <div>
              {adjacent.prev ? (
                <TransitionLink
                  to={`/poems/${adjacent.prev.slug}`}
                  className={`group flex flex-col gap-1.5 rounded-[24px] p-6 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    isDaylight
                      ? 'glass-light hover:bg-white/85'
                      : 'glass-dusk hover:border-white/35 hover:bg-[#222832]/62'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-2 text-xs font-medium ${
                      isDaylight ? 'text-[#4C5361]' : 'text-[#DFBC91]'
                    }`}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{rr.previousPoem}</span>
                  </span>
                  <span lang="bn" className="font-bn-display text-2xl font-semibold">
                    {adjacent.prev.title}
                  </span>
                  <span
                    className={`text-xs ${
                      isDaylight ? 'text-[#4C5361]' : 'text-[#F6F4EF]/70'
                    }`}
                  >
                    {getCycleLabel(adjacent.prev.collection, lang)}
                  </span>
                </TransitionLink>
              ) : null}
            </div>

            <div>
              {adjacent.next ? (
                <TransitionLink
                  to={`/poems/${adjacent.next.slug}`}
                  className={`group flex flex-col gap-1.5 rounded-[24px] p-6 transition-all duration-200 sm:items-end sm:text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    isDaylight
                      ? 'glass-light hover:bg-white/85'
                      : 'glass-dusk hover:border-white/35 hover:bg-[#222832]/62'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-2 text-xs font-medium ${
                      isDaylight ? 'text-[#4C5361]' : 'text-[#DFBC91]'
                    }`}
                  >
                    <span>{rr.nextPoem}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <span lang="bn" className="font-bn-display text-2xl font-semibold">
                    {adjacent.next.title}
                  </span>
                  <span
                    className={`text-xs ${
                      isDaylight ? 'text-[#4C5361]' : 'text-[#F6F4EF]/70'
                    }`}
                  >
                    {getCycleLabel(adjacent.next.collection, lang)}
                  </span>
                </TransitionLink>
              ) : null}
            </div>
          </nav>
        </div>
      </article>
    </div>
  );
}
