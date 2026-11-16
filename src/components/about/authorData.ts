import {
  AUTHOR_BIO_BEATS,
  AUTHOR_PROFILE,
  POET_TIMELINE_MILESTONES,
} from '../../data/authorProfile';

export interface LedgerHonor {
  year: string;
  institution: string;
  workCited: string;
  city: string;
}

export interface ReadingAppearance {
  date: string;
  venue: string;
  city: string;
  format: string;
  upcoming: boolean;
}

export interface CorrespondenceDesk {
  role: string;
  contact: string;
  note: string;
}

export { AUTHOR_BIO_BEATS, AUTHOR_PROFILE, POET_TIMELINE_MILESTONES };

export const BIOGRAPHY_PARAGRAPHS: string[] = AUTHOR_BIO_BEATS.map(
  (beat) => beat.paragraph.bn
);

export const PRINT_LEDGER_HONORS: LedgerHonor[] = [];
export const READING_APPEARANCES: ReadingAppearance[] = [];
export const CORRESPONDENCE_DESKS: CorrespondenceDesk[] = [
  {
    role: 'যোগাযোগ ও পাণ্ডুলিপি',
    contact: AUTHOR_PROFILE.contactEmail,
    note: AUTHOR_PROFILE.bioPlaceholderNote.bn,
  },
];
