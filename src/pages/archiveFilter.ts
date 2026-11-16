import { POEM_CYCLES, POEMS_CATALOG, isCycleId, type PoemMeta } from '../data/poemsCatalog';
import { searchPoems, type PoemSearchHit } from '../lib/poemSearch';

export type ArchiveSort = 'order' | 'newest' | 'alpha';

export interface ArchiveFilterParams {
  query: string;
  collection: string;
  theme: string;
  sort: ArchiveSort;
  letter: string;
}

export interface ArchiveFilterResult {
  items: PoemMeta[];
  hitsById: Record<string, PoemSearchHit>;
  availableLetters: Set<string>;
}

export function getAllThemes(catalog: PoemMeta[] = POEMS_CATALOG): string[] {
  const themeSet = new Set<string>();
  for (const poem of catalog) {
    for (const theme of poem.themes) {
      themeSet.add(theme);
    }
  }
  return Array.from(themeSet).sort((a, b) => a.localeCompare(b, 'bn'));
}

export function getTitleInitial(title: string): string {
  const normalized = title.trim().normalize('NFC');
  if (!normalized) return '';
  return Array.from(normalized)[0] ?? '';
}

export function filterAndSortPoems(
  params: ArchiveFilterParams,
  catalog: PoemMeta[] = POEMS_CATALOG
): ArchiveFilterResult {
  const { query, collection, theme, sort, letter } = params;
  const trimmedQuery = query.trim();

  let hitsById: Record<string, PoemSearchHit> = {};
  let candidateItems = [...catalog];

  if (trimmedQuery.length > 0) {
    const searchRes = searchPoems(trimmedQuery);
    hitsById = searchRes.hitsById;
    const rankMap = new Map(searchRes.ids.map((id, idx) => [id, idx]));
    candidateItems = candidateItems
      .filter((poem) => rankMap.has(poem.id))
      .sort(
        (a, b) => (rankMap.get(a.id) ?? 9999) - (rankMap.get(b.id) ?? 9999)
      );
  }

  if (collection && collection !== 'All') {
    if (isCycleId(collection)) {
      candidateItems = candidateItems.filter(
        (poem) => poem.collection === collection
      );
    } else {
      const normalizedCol = collection.trim().toLowerCase();
      candidateItems = candidateItems.filter((poem) => {
        const meta = POEM_CYCLES[poem.collection];
        return (
          meta.nameBn.toLowerCase() === normalizedCol ||
          meta.nameEn.toLowerCase() === normalizedCol
        );
      });
    }
  }

  if (theme) {
    candidateItems = candidateItems.filter((poem) =>
      poem.themes.includes(theme)
    );
  }

  const availableLetters = new Set<string>();
  for (const poem of candidateItems) {
    const initial = getTitleInitial(poem.title);
    if (initial) {
      availableLetters.add(initial);
    }
  }

  if (sort === 'alpha' && letter) {
    const target = letter.normalize('NFC');
    candidateItems = candidateItems.filter(
      (poem) => getTitleInitial(poem.title) === target
    );
  }

  if (trimmedQuery.length === 0 || sort !== 'order') {
    if (sort === 'order') {
      candidateItems.sort((a, b) => a.order - b.order);
    } else if (sort === 'newest') {
      candidateItems.sort((a, b) => b.order - a.order);
    } else if (sort === 'alpha') {
      candidateItems.sort((a, b) => a.title.localeCompare(b.title, 'bn'));
    }
  }

  return {
    items: candidateItems,
    hitsById,
    availableLetters,
  };
}
