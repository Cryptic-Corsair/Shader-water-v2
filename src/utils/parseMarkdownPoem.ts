import { isCycleId, type CollectionName, type PoemFull } from '../data/poemsCatalog';

export function parseMarkdownPoem(rawMd: string): PoemFull {
  const normalized = rawMd.replace(/\r\n/g, '\n').trim();
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  const body = match ? match[2].trim() : normalized;

  if (match) {
    for (const line of match[1].split('\n')) {
      const sep = line.indexOf(':');
      if (sep !== -1) {
        const key = line.slice(0, sep).trim();
        const val = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
        meta[key] = val;
      }
    }
  }

  const parseList = (raw?: string): string[] =>
    raw
      ? raw
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map((item) => item.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean)
      : [];

  const stanzas = body
    ? body.split(/\n\s*\n/).map((block) =>
        block
          .split('\n')
          .map((l) => l.trimEnd())
          .filter((l) => l.length > 0)
      )
    : [];

  const colors = parseList(meta.moodColors);
  const moodColors: [string, string, string] = [
    colors[0] || '#363E4B',
    colors[1] || '#677180',
    colors[2] || '#DFBC91',
  ];

  const resolvedCollection: CollectionName =
    meta.collection && isCycleId(meta.collection)
      ? meta.collection
      : 'twilight-sky';

  return {
    id: meta.id || `poem-${meta.slug || 'untitled'}`,
    slug: meta.slug || 'untitled',
    title: meta.title || 'Untitled',
    collection: resolvedCollection,
    dateDisplay: meta.dateDisplay || meta.date || 'তারিখ অজানা',
    year: Number(meta.year) || 2024,
    themes: parseList(meta.themes),
    searchKeywords: parseList(meta.searchKeywords),
    firstLine: meta.firstLine || stanzas[0]?.[0] || '',
    readingSeconds: Number(meta.readingSeconds) || 60,
    featured: meta.featured === 'true',
    order: Number(meta.order) || 999,
    moodColors,
    epigraph: meta.epigraph || undefined,
    stanzas,
  };
}
