import MiniSearch from 'minisearch';
import { POEM_CYCLES, POEMS_CATALOG } from '../data/poemsCatalog';
import { getPoemBodyText } from '../data/poemsContent';

interface PoemSearchDocument {
  id: string;
  slug: string;
  title: string;
  firstLine: string;
  collectionName: string;
  themesText: string;
  searchKeywordsText: string;
  dateDisplay: string;
  bodyText: string;
}

export interface PoemSearchHit {
  id: string;
  score: number;
  terms: string[];
  snippet: string | null;
}

export interface PoemSearchResponse {
  ids: string[];
  hitsById: Record<string, PoemSearchHit>;
}

const TOKEN_SPLIT_RE = /[\s,।॥;:.!?~☆♡\-—"'“”‘’()[\]/]+/;

const documents: PoemSearchDocument[] = POEMS_CATALOG.map((poem) => {
  const cycle = POEM_CYCLES[poem.collection];
  return {
    id: poem.id,
    slug: poem.slug,
    title: poem.title,
    firstLine: poem.firstLine,
    collectionName: `${cycle.nameBn} ${cycle.nameEn} ${poem.collection}`,
    themesText: poem.themes.join(' '),
    searchKeywordsText: poem.searchKeywords.join(' '),
    dateDisplay: `${poem.dateDisplay} ${poem.year}`,
    bodyText: getPoemBodyText(poem.slug),
  };
});

const documentsById: Record<string, PoemSearchDocument> = Object.fromEntries(
  documents.map((doc) => [doc.id, doc])
);

const searchIndex = new MiniSearch<PoemSearchDocument>({
  fields: [
    'title',
    'firstLine',
    'collectionName',
    'themesText',
    'searchKeywordsText',
    'dateDisplay',
    'bodyText',
  ],
  storeFields: ['id', 'slug'],
  tokenize: (str: string) =>
    str.normalize('NFC').split(TOKEN_SPLIT_RE).filter(Boolean),
  processTerm: (term: string) => term.normalize('NFC').toLowerCase(),
  searchOptions: {
    boost: {
      title: 3.5,
      firstLine: 2.2,
      themesText: 2,
      searchKeywordsText: 2,
      collectionName: 1.5,
      dateDisplay: 1.2,
      bodyText: 1,
    },
    prefix: true,
    fuzzy: 0.2,
  },
});

searchIndex.addAll(documents);

function extractSnippet(text: string, terms: string[]): string | null {
  if (!text || terms.length === 0) return null;
  const normalizedText = text.normalize('NFC');
  const lower = normalizedText.toLowerCase();
  let matchIndex = -1;
  for (const term of terms) {
    const idx = lower.indexOf(term.normalize('NFC').toLowerCase());
    if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
      matchIndex = idx;
    }
  }
  if (matchIndex === -1) return null;

  const start = Math.max(0, matchIndex - 28);
  const end = Math.min(normalizedText.length, matchIndex + 72);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < normalizedText.length ? '…' : '';
  return `${prefix}${normalizedText.slice(start, end).trim()}${suffix}`;
}

export function searchPoems(query: string): PoemSearchResponse {
  const trimmed = query.trim().normalize('NFC');
  if (!trimmed) {
    return {
      ids: POEMS_CATALOG.map((p) => p.id),
      hitsById: {},
    };
  }

  const results = searchIndex.search(trimmed);
  const ids: string[] = [];
  const hitsById: Record<string, PoemSearchHit> = {};

  for (const result of results) {
    const id = String(result.id);
    const doc = documentsById[id];
    const terms = result.terms ?? [];
    const snippet = doc ? extractSnippet(doc.bodyText, terms) : null;

    ids.push(id);
    hitsById[id] = {
      id,
      score: result.score,
      terms,
      snippet,
    };
  }

  return { ids, hitsById };
}
