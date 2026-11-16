import type { MarginaliaNote } from '../data/poemsCatalog';

export const POEM_FONT_STEPS_REM = [1.125, 1.25, 1.375, 1.5, 1.65] as const;
export const DEFAULT_POEM_FONT_STEP = 2;

export function clampFontStep(step: number): number {
  if (!Number.isFinite(step)) return DEFAULT_POEM_FONT_STEP;
  return Math.max(0, Math.min(POEM_FONT_STEPS_REM.length - 1, Math.round(step)));
}

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

export function toSuperscript(num: number): string {
  return String(num)
    .split('')
    .map((ch) => SUPERSCRIPTS[ch] ?? ch)
    .join('');
}

export interface IndexedMarginalia extends MarginaliaNote {
  noteIndex: number;
  superscript: string;
}

export type AnnotatedSegment =
  | { type: 'text'; text: string }
  | {
      type: 'annotation';
      text: string;
      noteIndex: number;
      superscript: string;
      note: string;
      lineHint: string;
    };

export interface AnnotatedStanza {
  lines: AnnotatedSegment[][];
  notes: IndexedMarginalia[];
}

function parseRomanOrInt(token: string): number | null {
  const trimmed = token.trim().toUpperCase();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  const romanMap: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
  };
  let total = 0;
  let prev = 0;
  for (let i = trimmed.length - 1; i >= 0; i--) {
    const val = romanMap[trimmed[i]];
    if (!val) return null;
    if (val < prev) total -= val;
    else total += val;
    prev = val;
  }
  return total > 0 ? total : null;
}

export function buildAnnotatedStanzas(
  stanzas: string[][],
  marginalia: MarginaliaNote[] = []
): AnnotatedStanza[] {
  const matchedNoteIndices = new Set<number>();

  const indexedNotes: IndexedMarginalia[] = marginalia.map((entry, idx) => ({
    ...entry,
    noteIndex: idx + 1,
    superscript: toSuperscript(idx + 1),
  }));

  // Track which line coordinates receive a fallback positional match
  const positionalAssignments = new Map<string, IndexedMarginalia>();

  // First pass: exact phrase matching against poem lines
  const lineMatchedCoords = new Map<string, IndexedMarginalia[]>();
  for (const entry of indexedNotes) {
    const hint = entry.lineHint.trim();
    if (!hint) continue;
    const hintLower = hint.toLowerCase();

    let found = false;
    for (let s = 0; s < stanzas.length && !found; s++) {
      for (let l = 0; l < stanzas[s].length && !found; l++) {
        const line = stanzas[s][l];
        const exactIdx = line.indexOf(hint);
        const matchIdx =
          exactIdx !== -1 ? exactIdx : line.toLowerCase().indexOf(hintLower);
        if (matchIdx !== -1) {
          const key = `${s}:${l}`;
          const list = lineMatchedCoords.get(key) ?? [];
          list.push(entry);
          lineMatchedCoords.set(key, list);
          matchedNoteIndices.add(entry.noteIndex);
          found = true;
        }
      }
    }

    // Fallback: support "Stanza II, l. 4" format if custom markdown uses positional hints
    if (!found) {
      const posMatch = /^Stanza\s+([IVXLCDM\d]+)\s*,\s*l\.\s*(\d+)$/i.exec(hint);
      if (posMatch) {
        const stanzaNum = parseRomanOrInt(posMatch[1]);
        const lineNum = parseInt(posMatch[2], 10);
        if (
          stanzaNum !== null &&
          stanzaNum >= 1 &&
          stanzaNum <= stanzas.length &&
          lineNum >= 1 &&
          lineNum <= stanzas[stanzaNum - 1].length
        ) {
          positionalAssignments.set(`${stanzaNum - 1}:${lineNum - 1}`, entry);
          matchedNoteIndices.add(entry.noteIndex);
        }
      }
    }
  }

  return stanzas.map((stanza, stanzaIdx) => {
    const stanzaNotes: IndexedMarginalia[] = [];
    const seenNoteInStanza = new Set<number>();

    const pushStanzaNote = (entry: IndexedMarginalia) => {
      if (!seenNoteInStanza.has(entry.noteIndex)) {
        seenNoteInStanza.add(entry.noteIndex);
        stanzaNotes.push(entry);
      }
    };

    const lines = stanza.map((line, lineIdx): AnnotatedSegment[] => {
      const key = `${stanzaIdx}:${lineIdx}`;
      const matched = lineMatchedCoords.get(key);

      if (matched && matched.length > 0) {
        // Apply non-overlapping phrase matches in order of appearance
        const spans: {
          start: number;
          end: number;
          entry: IndexedMarginalia;
        }[] = [];

        for (const entry of matched) {
          const hint = entry.lineHint.trim();
          let idx = line.indexOf(hint);
          if (idx === -1) {
            idx = line.toLowerCase().indexOf(hint.toLowerCase());
          }
          if (idx !== -1) {
            const end = idx + hint.length;
            const overlaps = spans.some(
              (s) => !(end <= s.start || idx >= s.end)
            );
            if (!overlaps) {
              spans.push({ start: idx, end, entry });
            }
          }
        }

        if (spans.length > 0) {
          spans.sort((a, b) => a.start - b.start);
          const segments: AnnotatedSegment[] = [];
          let cursor = 0;

          for (const span of spans) {
            if (span.start > cursor) {
              segments.push({
                type: 'text',
                text: line.slice(cursor, span.start),
              });
            }
            segments.push({
              type: 'annotation',
              text: line.slice(span.start, span.end),
              noteIndex: span.entry.noteIndex,
              superscript: span.entry.superscript,
              note: span.entry.note,
              lineHint: span.entry.lineHint,
            });
            pushStanzaNote(span.entry);
            cursor = span.end;
          }

          if (cursor < line.length) {
            segments.push({
              type: 'text',
              text: line.slice(cursor),
            });
          }

          return segments;
        }
      }

      const fallbackEntry = positionalAssignments.get(key);
      if (fallbackEntry) {
        pushStanzaNote(fallbackEntry);
        return [
          {
            type: 'annotation',
            text: line,
            noteIndex: fallbackEntry.noteIndex,
            superscript: fallbackEntry.superscript,
            note: fallbackEntry.note,
            lineHint: fallbackEntry.lineHint,
          },
        ];
      }

      return [{ type: 'text', text: line }];
    });

    return {
      lines,
      notes: stanzaNotes,
    };
  });
}
