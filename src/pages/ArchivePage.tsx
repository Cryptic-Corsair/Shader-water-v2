import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronDown,
  LayoutGrid,
  List,
  Search,
  X,
} from 'lucide-react';
import { TransitionLink } from '../components/PageTransition';
import { useLanguage } from '../context/LanguageContext';
import {
  POEMS_CATALOG,
  formatReadingTime,
  getCollections,
  getCycleLabel,
  getFeaturedPoems,
  isCycleId,
  toBanglaNumerals,
} from '../data/poemsCatalog';
import { getUiCopy } from '../data/uiCopy';
import {
  Flip,
  ScrollTrigger,
  prefersReducedMotion,
  useGSAP,
} from '../lib/motion';
import {
  filterAndSortPoems,
  getAllThemes,
  type ArchiveSort,
} from './archiveFilter';

const PAGE_SIZE = 24;

type ViewMode = 'plates' | 'ledger';

export function ArchivePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const motifDropdownRef = useRef<HTMLDivElement>(null);

  const { lang } = useLanguage();
  const copy = getUiCopy(lang);
  const arch = copy.archive;

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('plates');
  const [sort, setSort] = useState<ArchiveSort>('order');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [motifsOpen, setMotifsOpen] = useState(false);

  const urlQuery = searchParams.get('q') ?? '';
  const [localQuery, setLocalQuery] = useState<string>(urlQuery);
  const selectedCollection = searchParams.get('collection') ?? 'All';
  const selectedTheme = searchParams.get('theme') ?? '';
  const activeLetter = searchParams.get('letter') ?? '';

  const collections = getCollections();
  const featuredPair = useMemo(() => getFeaturedPoems().slice(0, 2), []);
  const allThemes = useMemo(() => getAllThemes(), []);

  useEffect(() => {
    const cycleTitle =
      selectedCollection !== 'All' && isCycleId(selectedCollection)
        ? getCycleLabel(selectedCollection, lang)
        : selectedCollection !== 'All'
          ? selectedCollection
          : arch.title;
    document.title = `${cycleTitle} — ${copy.brand}`;
    ScrollTrigger.refresh();
  }, [selectedCollection, lang, arch.title, copy.brand]);

  useEffect(() => {
    setLocalQuery(urlQuery);
  }, [urlQuery]);

  // Close Motifs dropdown on outside click or Escape
  useEffect(() => {
    if (!motifsOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        motifDropdownRef.current &&
        !motifDropdownRef.current.contains(event.target as Node)
      ) {
        setMotifsOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMotifsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [motifsOpen]);

  const updateParam = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value || (key === 'collection' && value === 'All')) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      },
      { replace: true }
    );
    setVisibleCount(PAGE_SIZE);
  };

  const handleQueryChange = (nextVal: string) => {
    setLocalQuery(nextVal);
    updateParam('q', nextVal);
  };

  const clearAllFilters = () => {
    setLocalQuery('');
    setSearchParams({}, { replace: true });
    setSort('order');
    setVisibleCount(PAGE_SIZE);
    setMotifsOpen(false);
  };

  // '/' focuses search, 'Esc' clears active search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (
        event.key === 'Escape' &&
        (document.activeElement === searchInputRef.current ||
          localQuery.length > 0)
      ) {
        handleQueryChange('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [localQuery]);

  const { items: filteredPoems, hitsById, availableLetters } = useMemo(
    () =>
      filterAndSortPoems({
        query: localQuery,
        collection: selectedCollection,
        theme: selectedTheme,
        sort,
        letter: activeLetter,
      }),
    [localQuery, selectedCollection, selectedTheme, sort, activeLetter]
  );

  const sortedLetters = useMemo(
    () =>
      Array.from(availableLetters).sort((a, b) => a.localeCompare(b, 'bn')),
    [availableLetters]
  );

  const visiblePoems = useMemo(
    () => filteredPoems.slice(0, visibleCount),
    [filteredPoems, visibleCount]
  );

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleViewModeChange = contextSafe((nextMode: ViewMode) => {
    if (nextMode === viewMode) return;
    if (prefersReducedMotion()) {
      setViewMode(nextMode);
      return;
    }

    const state = Flip.getState('.poem-archive-item');
    setViewMode(nextMode);

    window.requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.02,
        absolute: true,
        nested: true,
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      });
    });
  });

  const handleSortChange = (nextSort: ArchiveSort) => {
    setSort(nextSort);
    if (nextSort !== 'alpha' && activeLetter) {
      updateParam('letter', '');
    }
    setVisibleCount(PAGE_SIZE);
  };

  const hasActiveFilters =
    localQuery.trim().length > 0 ||
    selectedCollection !== 'All' ||
    selectedTheme.length > 0 ||
    activeLetter.length > 0;

  const formatNum = (val: number) =>
    lang === 'bn' ? toBanglaNumerals(val) : String(val);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-x-clip pb-28 text-[#F6F4EF]"
    >
      {/* Seamless Twilight Header over Global Living Atmosphere */}
      <header className="relative pt-28 pb-10 md:pt-36 md:pb-12">
        <div className="relative z-10 mx-auto max-w-[82rem] px-6 md:px-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <p className="text-xs font-medium text-[#DFBC91] uppercase">
              {arch.eyebrow}
            </p>
            <p
              className="text-xs font-medium text-[#F6F4EF]/78"
              data-testid="archive-showing-count"
            >
              {arch.showingPrefix}{' '}
              <span className="font-semibold text-[#DFBC91]">
                {formatNum(filteredPoems.length)}
              </span>{' '}
              {arch.of}{' '}
              <span data-testid="archive-total-count">
                {formatNum(POEMS_CATALOG.length)}
              </span>{' '}
              {arch.worksUnit}
            </p>
          </div>

          <h1
            className={`font-display display-luminous mt-3 font-semibold ${
              lang === 'bn'
                ? 'font-bn-display text-[clamp(2.5rem,5.2vw,4.35rem)] leading-[1.24]'
                : 'text-[clamp(2.75rem,5.5vw,4.75rem)] leading-[1.0] tracking-[-0.025em]'
            }`}
          >
            {arch.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#F6F4EF]/80 md:text-base">
            {arch.subtitle}
          </p>

          {/* Featured 2-Poem Asymmetric Editorial Header Strip */}
          {featuredPair.length >= 2 ? (
            <div
              data-testid="archive-featured-strip"
              className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-12"
            >
              {featuredPair.map((item, idx) => {
                const isLead = idx === 0;
                const [c0, c1, c2] = item.moodColors;
                return (
                  <TransitionLink
                    key={item.id}
                    to={`/poems/${item.slug}`}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-[26px] border border-white/24 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#DFBC91]/60 md:p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                      isLead ? 'lg:col-span-7' : 'lg:col-span-5'
                    }`}
                    style={{
                      background: `radial-gradient(82% 80% at 88% 18%, ${c2}26 0%, transparent 62%), radial-gradient(75% 75% at 15% 86%, ${c0}42 0%, transparent 65%), linear-gradient(155deg, ${c0}33 0%, ${c1}24 100%)`,
                      backdropFilter: 'blur(14px) saturate(112%)',
                      WebkitBackdropFilter: 'blur(14px) saturate(112%)',
                    }}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-[#DFBC91]">
                        <span>
                          {isLead ? arch.featuredLead : arch.featuredCompanion} ·{' '}
                          {getCycleLabel(item.collection, lang)}
                        </span>
                        <span lang="bn" className="font-bn-ui tabular-nums text-[#F6F4EF]/76">
                          {item.dateDisplay} · {formatReadingTime(item.readingSeconds, lang)}
                        </span>
                      </div>

                      <h2
                        lang="bn"
                        className="font-bn-display mt-3 text-[clamp(1.65rem,2.6vw,2.3rem)] font-semibold text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91]"
                      >
                        {item.title}
                      </h2>

                      <p
                        lang="bn"
                        className="font-bn-verse mt-3 max-w-xl text-[1.08rem] text-[#F6F4EF]/88"
                      >
                        “{item.firstLine}”
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4 text-xs font-medium text-[#F6F4EF]/80">
                      <span lang="bn" className="font-bn-ui">
                        {item.themes.join(' · ')}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-[#DFBC91]">
                        <span>{arch.readAction}</span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </TransitionLink>
                );
              })}
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Content & Floating Frosted Spotlight Dock */}
      <div className="relative z-20 mx-auto max-w-[82rem] px-6 md:px-10">
        {/* Floating Frosted Spotlight Dock */}
        <section
          aria-label={arch.searchAria}
          className="glass-dusk relative z-30 rounded-[24px] p-4 shadow-[0_18px_48px_rgba(24,28,36,0.22)] md:p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Minimalist Search Input with '/' shortcut */}
            <div className="relative flex flex-1 items-center rounded-full border border-white/22 bg-white/10 px-4 py-2 transition-colors focus-within:border-[#DFBC91] focus-within:bg-white/14 lg:max-w-md">
              <Search
                className="mr-3 h-4 w-4 shrink-0 text-[#DFBC91]"
                aria-hidden="true"
              />
              <label htmlFor="archive-search-input" className="sr-only">
                {arch.searchAria}
              </label>
              <input
                ref={searchInputRef}
                id="archive-search-input"
                type="search"
                value={localQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={arch.searchPlaceholder}
                className="w-full bg-transparent py-1 text-sm text-[#F6F4EF] placeholder:text-[#F6F4EF]/58 focus:outline-none"
              />
              {localQuery.length > 0 ? (
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  aria-label={arch.clearSearchAria}
                  className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-[#F6F4EF]/75 transition-colors hover:bg-white/14 hover:text-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : (
                <span
                  aria-hidden="true"
                  className="ml-2 hidden rounded-full border border-white/20 px-2 py-0.5 text-[11px] font-medium text-[#F6F4EF]/65 sm:inline-block"
                >
                  /
                </span>
              )}
            </div>

            {/* Right Controls: Motifs Popover, Sort Pill & Spatial/List Flip Toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Compact Motifs Dropdown Popover */}
              <div ref={motifDropdownRef} className="relative">
                <button
                  type="button"
                  aria-expanded={motifsOpen}
                  aria-haspopup="listbox"
                  data-testid="motifs-dropdown-trigger"
                  onClick={() => setMotifsOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    selectedTheme
                      ? 'border-[#DFBC91]/70 bg-[#DFBC91]/20 text-[#F6F4EF]'
                      : 'border-white/20 bg-white/10 text-[#F6F4EF]/88 hover:border-white/35'
                  }`}
                >
                  <span lang={selectedTheme ? 'bn' : undefined}>
                    {selectedTheme
                      ? `${arch.motifActivePrefix} ${selectedTheme}`
                      : arch.motifs}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      motifsOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {motifsOpen ? (
                  <div
                    role="listbox"
                    aria-label={arch.allMotifs}
                    className="glass-light absolute left-0 z-40 mt-2.5 w-64 max-h-72 overflow-y-auto rounded-[22px] p-2.5 shadow-[0_22px_50px_rgba(24,28,36,0.28)] sm:left-auto sm:right-0"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={selectedTheme === ''}
                      onClick={() => {
                        updateParam('theme', '');
                        setMotifsOpen(false);
                      }}
                      className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                        selectedTheme === ''
                          ? 'bg-[#171A21]/12 text-[#171A21]'
                          : 'text-[#4C5361] hover:bg-white/45 hover:text-[#171A21]'
                      }`}
                    >
                      <span>{arch.allMotifs}</span>
                      <span className="text-[11px] opacity-70">
                        {formatNum(allThemes.length)}
                      </span>
                    </button>
                    <div className="my-1.5 h-px bg-[#171A21]/10" />
                    <div className="grid grid-cols-2 gap-1">
                      {allThemes.map((theme) => {
                        const isActive = selectedTheme === theme;
                        return (
                          <button
                            key={theme}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            lang="bn"
                            onClick={() => {
                              updateParam('theme', isActive ? '' : theme);
                              setMotifsOpen(false);
                            }}
                            className={`font-bn-ui truncate rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-[#171A21] text-[#F6F4EF]'
                                : 'text-[#4C5361] hover:bg-white/55 hover:text-[#171A21]'
                            }`}
                          >
                            {theme}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Sort Pill */}
              <div>
                <label htmlFor="archive-sort-select" className="sr-only">
                  {arch.sortAria}
                </label>
                <select
                  id="archive-sort-select"
                  value={sort}
                  onChange={(e) =>
                    handleSortChange(e.target.value as ArchiveSort)
                  }
                  className="rounded-full border border-white/20 bg-[#2D3542]/85 px-4 py-2 text-xs font-medium text-[#F6F4EF] transition-colors hover:border-white/38 focus:border-[#DFBC91] focus:outline-none"
                >
                  <option value="order">{arch.sortCurated}</option>
                  <option value="newest">{arch.sortNewest}</option>
                  <option value="alpha">{arch.sortAlpha}</option>
                </select>
              </div>

              {/* Grid / List View Mode Toggle (GSAP Flip) */}
              <div
                role="group"
                aria-label="Archive view mode"
                className="inline-flex rounded-full border border-white/20 bg-white/8 p-1"
              >
                <button
                  type="button"
                  aria-pressed={viewMode === 'plates'}
                  onClick={() => handleViewModeChange('plates')}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    viewMode === 'plates'
                      ? 'bg-[#F5F2ED] text-[#171A21] shadow-sm'
                      : 'text-[#F6F4EF]/78 hover:text-[#F6F4EF]'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{arch.viewCards}</span>
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === 'ledger'}
                  onClick={() => handleViewModeChange('ledger')}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                    viewMode === 'ledger'
                      ? 'bg-[#F5F2ED] text-[#171A21] shadow-sm'
                      : 'text-[#F6F4EF]/78 hover:text-[#F6F4EF]'
                  }`}
                >
                  <List className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{arch.viewList}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Collection Segmented Pills */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/14 pt-4">
            <div
              role="group"
              aria-label={arch.allCycles}
              className="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                aria-pressed={selectedCollection === 'All'}
                onClick={() => updateParam('collection', 'All')}
                className={`whitespace-nowrap shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                  selectedCollection === 'All'
                    ? 'glass-light shadow-sm'
                    : 'border border-white/16 bg-white/6 text-[#F6F4EF]/82 hover:bg-white/14 hover:text-[#F6F4EF]'
                }`}
              >
                {arch.allCycles}
              </button>

              {collections.map((cycleId) => {
                const isActive = selectedCollection === cycleId;
                return (
                  <button
                    key={cycleId}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => updateParam('collection', cycleId)}
                    className={`whitespace-nowrap shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91] ${
                      isActive
                        ? 'glass-light shadow-sm'
                        : 'border border-white/16 bg-white/6 text-[#F6F4EF]/82 hover:bg-white/14 hover:text-[#F6F4EF]'
                    }`}
                  >
                    {getCycleLabel(cycleId, lang)}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-full px-3 py-1 text-xs font-medium text-[#DFBC91] transition-colors hover:bg-white/10 hover:text-[#F6F4EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
              >
                {arch.resetFilters}
              </button>
            ) : null}
          </div>
        </section>

        {/* Initial-Character Quick-Jump Bar when Alphabetical Sort is Active */}
        {sort === 'alpha' && sortedLetters.length > 0 ? (
          <div
            role="group"
            aria-label={arch.sortAlpha}
            className="glass-dusk mt-4 flex flex-wrap items-center gap-1.5 rounded-full px-4 py-2"
          >
            <button
              type="button"
              onClick={() => updateParam('letter', '')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeLetter === ''
                  ? 'bg-[#F5F2ED] text-[#171A21]'
                  : 'text-[#F6F4EF]/78 hover:text-[#DFBC91]'
              }`}
            >
              {arch.allLetters}
            </button>
            {sortedLetters.map((letter) => {
              const isSelected = activeLetter === letter;
              return (
                <button
                  key={letter}
                  type="button"
                  lang="bn"
                  onClick={() =>
                    updateParam('letter', isSelected ? '' : letter)
                  }
                  className={`font-bn-ui rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#DFBC91] text-[#171A21]'
                      : 'text-[#F6F4EF]/84 hover:bg-white/10 hover:text-[#DFBC91]'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ) : null}

        {/* Catalog Results Area */}
        <section
          aria-label={arch.title}
          data-view-mode={viewMode}
          className="mt-8 min-h-[20rem]"
        >
          {visiblePoems.length === 0 ? (
            <div className="glass-dusk rounded-[28px] px-8 py-16 text-center">
              <p className="font-editorial-serif text-2xl font-normal text-[#F6F4EF] md:text-3xl">
                {arch.emptyTitle}
              </p>
              <p className="mt-2 text-sm text-[#F6F4EF]/75">
                {arch.emptyHint}
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="glass-light mt-6 rounded-full px-6 py-2.5 text-xs font-semibold text-[#171A21] transition-opacity hover:opacity-90"
              >
                {arch.resetFilters}
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'plates'
                  ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col border-t border-white/16'
              }
            >
              {visiblePoems.map((poem) => {
                const hit = hitsById[poem.id];

                if (viewMode === 'plates') {
                  return (
                    <TransitionLink
                      key={poem.id}
                      data-flip-id={poem.id}
                      to={`/poems/${poem.slug}`}
                      className="poem-archive-item group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/40 bg-[#F5F2ED]/76 text-[#171A21] shadow-[0_14px_36px_rgba(24,28,36,0.14)] backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-1 hover:bg-[#F5F2ED]/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                    >
                      {/* Soft curved mood-gradient glow bar */}
                      <div
                        aria-hidden="true"
                        className="mx-5 mt-5 h-1.5 rounded-full opacity-85"
                        style={{
                          backgroundImage: `linear-gradient(90deg, ${poem.moodColors[0]}, ${poem.moodColors[1]}, ${poem.moodColors[2]})`,
                        }}
                      />

                      <div className="flex flex-1 flex-col justify-between p-6 pt-5">
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#4C5361]">
                            <span>{getCycleLabel(poem.collection, lang)}</span>
                            <span lang="bn" className="font-bn-ui">
                              {poem.dateDisplay}
                            </span>
                          </div>

                          <h2
                            lang="bn"
                            className="font-bn-display mt-3 text-[1.72rem] leading-[1.35] font-semibold text-[#171A21]"
                          >
                            {poem.title}
                          </h2>

                          <p
                            lang="bn"
                            className="font-bn-verse mt-3 text-[1.06rem] text-[#171A21]/84"
                          >
                            “{poem.firstLine}”
                          </p>

                          {hit?.snippet ? (
                            <p
                              lang="bn"
                              className="font-bn-ui mt-3 rounded-xl bg-[#171A21]/6 px-3 py-2 text-xs text-[#4C5361]"
                            >
                              {arch.matchLabel}{' '}
                              <span className="font-medium text-[#171A21]">
                                {hit.snippet}
                              </span>
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#171A21]/10 pt-4 text-xs font-medium text-[#4C5361]">
                          <span lang="bn" className="font-bn-ui truncate">
                            {poem.themes.join(' · ')}
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1.5 text-[#171A21]">
                            <span>{formatReadingTime(poem.readingSeconds, lang)}</span>
                            <ArrowUpRight
                              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </div>
                    </TransitionLink>
                  );
                }

                // Crisp Open Hairline List Row (zero boxed pill traps)
                return (
                  <TransitionLink
                    key={poem.id}
                    data-flip-id={poem.id}
                    to={`/poems/${poem.slug}`}
                    className="poem-archive-item group grid items-center gap-3 border-b border-white/16 px-2 py-5 transition-colors duration-200 hover:border-[#DFBC91]/55 hover:bg-white/[0.03] md:grid-cols-12 md:gap-5 md:px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFBC91]"
                  >
                    <div className="flex min-w-0 items-center gap-3.5 md:col-span-5">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: poem.moodColors[2] }}
                      />
                      <div className="min-w-0">
                        <h2
                          lang="bn"
                          className="font-bn-display truncate text-[1.4rem] font-semibold text-[#F6F4EF] transition-colors group-hover:text-[#DFBC91]"
                        >
                          {poem.title}
                        </h2>
                        <p
                          lang="bn"
                          className="font-bn-verse truncate text-sm text-[#F6F4EF]/76"
                        >
                          “{poem.firstLine}”
                        </p>
                        {hit?.snippet ? (
                          <p
                            lang="bn"
                            className="font-bn-ui truncate text-xs text-[#DFBC91]"
                          >
                            {hit.snippet}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="truncate text-xs font-medium text-[#B2C2D4] md:col-span-3">
                      {getCycleLabel(poem.collection, lang)}
                    </div>

                    <div
                      lang="bn"
                      className="font-bn-ui truncate text-xs text-[#F6F4EF]/72 md:col-span-2"
                    >
                      {poem.themes.join(' · ')}
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#F6F4EF]/78 md:col-span-2 md:justify-end">
                      <span lang="bn" className="font-bn-ui">
                        {poem.dateDisplay}
                      </span>
                      <span>·</span>
                      <span>{formatReadingTime(poem.readingSeconds, lang)}</span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-[#DFBC91] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </TransitionLink>
                );
              })}
            </div>
          )}

          {/* Pagination Safeguard */}
          {filteredPoems.length > visibleCount ? (
            <div className="mt-10 flex items-center justify-between rounded-full border border-white/18 bg-[#222832]/38 px-6 py-3 backdrop-blur-md">
              <span className="text-xs font-medium text-[#F6F4EF]/76">
                {arch.showingPrefix} {formatNum(visiblePoems.length)} {arch.of}{' '}
                {formatNum(filteredPoems.length)} {arch.worksUnit}
              </span>
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                className="glass-light rounded-full px-5 py-2 text-xs font-semibold text-[#171A21] transition-opacity hover:opacity-90"
              >
                {arch.loadNextPrefix}{' '}
                {formatNum(Math.min(PAGE_SIZE, filteredPoems.length - visibleCount))}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
