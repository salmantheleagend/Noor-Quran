import { SURAH_LIST } from '../data/quranData';

export interface QuranLastRead {
  surahNumber: number;
  surahNameBn: string;
  surahNameAr: string;
  ayahNumber: number;
  totalAyahs: number;
  pageNumber: number;
  juzNumber?: number;
  readingMode: 'study' | 'mushaf';
  timestamp: number;
  progressPercent: number; // e.g. Math.round((ayahNumber / totalAyahs) * 100)
}

const LAST_READ_STORAGE_KEY = 'noor_quran_last_read_v2';

export function getQuranLastRead(): QuranLastRead | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_READ_STORAGE_KEY);
    if (!raw) {
      // Check legacy single-value keys
      const legacySurah = localStorage.getItem('noor_quran_last_read_surah');
      const legacyPage = localStorage.getItem('noor_quran_last_mushaf_page');
      if (legacySurah) {
        const sNum = parseInt(legacySurah, 10) || 1;
        const meta = SURAH_LIST.find((s) => s.number === sNum) || SURAH_LIST[0];
        const page = legacyPage ? parseInt(legacyPage, 10) : (meta.pageStart || 1);
        return {
          surahNumber: sNum,
          surahNameBn: meta.nameBangla,
          surahNameAr: meta.nameArabic,
          ayahNumber: 1,
          totalAyahs: meta.numberOfAyahs,
          pageNumber: page,
          readingMode: 'study',
          timestamp: Date.now(),
          progressPercent: Math.round((1 / meta.numberOfAyahs) * 100) || 1,
        };
      }
      return null;
    }
    const parsed = JSON.parse(raw) as QuranLastRead;
    return parsed;
  } catch {
    return null;
  }
}

export function saveQuranLastRead(params: {
  surahNumber: number;
  ayahNumber: number;
  pageNumber?: number;
  readingMode?: 'study' | 'mushaf';
}): void {
  if (typeof window === 'undefined') return;
  try {
    const meta = SURAH_LIST.find((s) => s.number === params.surahNumber) || SURAH_LIST[0];
    const page = params.pageNumber || meta.pageStart || 1;
    const totalAyahs = meta.numberOfAyahs || 1;
    const progressPercent = Math.min(100, Math.max(1, Math.round((params.ayahNumber / totalAyahs) * 100)));

    const record: QuranLastRead = {
      surahNumber: meta.number,
      surahNameBn: meta.nameBangla,
      surahNameAr: meta.nameArabic,
      ayahNumber: params.ayahNumber,
      totalAyahs,
      pageNumber: page,
      readingMode: params.readingMode || 'study',
      timestamp: Date.now(),
      progressPercent,
    };

    localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify(record));
    localStorage.setItem('noor_quran_last_read_surah', meta.number.toString());
    localStorage.setItem('noor_quran_last_mushaf_page', page.toString());
  } catch {
    // ignore
  }
}
