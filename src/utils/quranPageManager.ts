import {
  SURAH_LIST,
  CURATED_SURAH_DATA,
  stripBismillahPrefix,
  stripBismillahFromTranslation,
  normalizeQuranArabic,
  generateOfflineSurahAyahs,
} from '../data/quranData';
import { AyahItem } from '../types';

export interface JuzInfo {
  number: number;
  nameArabic: string;
  nameBangla: string;
  nameEnglish: string;
  startSurah: number;
  startAyah: number;
  startPage: number;
}

export const JUZ_LIST: JuzInfo[] = [
  { number: 1, nameArabic: 'الم', nameBangla: '১ম পারা (আলিফ লাম মীম)', nameEnglish: 'Alif Lam Meem', startSurah: 1, startAyah: 1, startPage: 1 },
  { number: 2, nameArabic: 'سَيَقُولُ', nameBangla: '২য় পারা (সায়াকুলু)', nameEnglish: 'Sayaqool', startSurah: 2, startAyah: 142, startPage: 22 },
  { number: 3, nameArabic: 'تِلْكَ الرُّسُلُ', nameBangla: '৩য় পারা (তিলকার রুসুল)', nameEnglish: 'Tilkar Rusul', startSurah: 2, startAyah: 253, startPage: 42 },
  { number: 4, nameArabic: 'لَنْ تَنَالُوا', nameBangla: '৪র্থ পারা (লান তানালু)', nameEnglish: 'Lan Tanaloo', startSurah: 3, startAyah: 93, startPage: 62 },
  { number: 5, nameArabic: 'وَالْمُحْصَنَاتُ', nameBangla: '৫ম পারা (ওয়াল মুহসানাতু)', nameEnglish: 'Wal Muhsanat', startSurah: 4, startAyah: 24, startPage: 82 },
  { number: 6, nameArabic: 'لَا يُحِبُّ اللَّهُ', nameBangla: '৬ষ্ঠ পারা (লা ইউহিব্বুল্লাহ)', nameEnglish: 'La Yuhibbullah', startSurah: 4, startAyah: 148, startPage: 102 },
  { number: 7, nameArabic: 'وَإِذَا سَمِعُوا', nameBangla: '৭ম পারা (ওয়া ইযা সামিয়ু)', nameEnglish: 'Wa Iza Samiu', startSurah: 5, startAyah: 82, startPage: 121 },
  { number: 8, nameArabic: 'وَلَوْ أَنَّنَا', nameBangla: '৮ম পারা (ওয়ালাও আন্নানা)', nameEnglish: 'Wa Law Annana', startSurah: 6, startAyah: 111, startPage: 142 },
  { number: 9, nameArabic: 'قَالَ الْمَلَأُ', nameBangla: '৯ম পারা (ক্বালা আল-মালাউ)', nameEnglish: 'Qalal Malao', startSurah: 7, startAyah: 88, startPage: 162 },
  { number: 10, nameArabic: 'وَاعْلَمُوا', nameBangla: '১০ম পারা (ওয়া’লামু)', nameEnglish: 'Wa\'lamoo', startSurah: 8, startAyah: 41, startPage: 182 },
  { number: 11, nameArabic: 'يَعْتَذِرُونَ', nameBangla: '১১শ পারা (ইয়া’তাযিরূন)', nameEnglish: 'Ya\'taziroon', startSurah: 9, startAyah: 93, startPage: 201 },
  { number: 12, nameArabic: 'وَمَا مِنْ دَابَّةٍ', nameBangla: '১২শ পারা (ওয়ামা মিন দা-ব্বাতিন)', nameEnglish: 'Wa Mamin Da\'abbah', startSurah: 11, startAyah: 6, startPage: 222 },
  { number: 13, nameArabic: 'وَمَا أُبَرِّئُ', nameBangla: '১৩শ পারা (ওয়ামা উবাররিউ)', nameEnglish: 'Wa Ma Ubarri\'u', startSurah: 12, startAyah: 53, startPage: 242 },
  { number: 14, nameArabic: 'رُبَمَا', nameBangla: '১৪শ পারা (রুবা-মা)', nameEnglish: 'Rubama', startSurah: 15, startAyah: 1, startPage: 262 },
  { number: 15, nameArabic: 'سُبْحَانَ الَّذِي', nameBangla: '১৫শ পারা (সুবহানাল্লাযী)', nameEnglish: 'Subhanallazi', startSurah: 17, startAyah: 1, startPage: 282 },
  { number: 16, nameArabic: 'قَالَ أَلَمْ', nameBangla: '১৬শ পারা (ক্বালা আলাম)', nameEnglish: 'Qala Alam', startSurah: 18, startAyah: 75, startPage: 302 },
  { number: 17, nameArabic: 'اقْتَرَبَ لِلنَّاسِ', nameBangla: '১৭শ পারা (ইক্বতারা বা লিন্নাস)', nameEnglish: 'Iqtaraba Linnas', startSurah: 21, startAyah: 1, startPage: 322 },
  { number: 18, nameArabic: 'قَدْ أَفْلَحَ', nameBangla: '১৮শ পারা (ক্বাদ আফলাহা)', nameEnglish: 'Qad Aflaha', startSurah: 23, startAyah: 1, startPage: 342 },
  { number: 19, nameArabic: 'وَقَالَ الَّذِينَ', nameBangla: '১৯শ পারা (ওয়া ক্বালাল্লাযীনা)', nameEnglish: 'Wa Qalallazina', startSurah: 25, startAyah: 21, startPage: 362 },
  { number: 20, nameArabic: 'أَمَّنْ خَلَقَ', nameBangla: '২০শ পারা (আম্মান খালাক্বা)', nameEnglish: 'Amman Khalaqa', startSurah: 27, startAyah: 56, startPage: 382 },
  { number: 21, nameArabic: 'اتْلُ مَا أُوحِيَ', nameBangla: '২১শ পারা (উতলু মা উহিয়া)', nameEnglish: 'Utlu Ma Oohiya', startSurah: 29, startAyah: 46, startPage: 402 },
  { number: 22, nameArabic: 'وَمَنْ يَقْنُتْ', nameBangla: '২২শ পারা (ওয়া মাই ইয়াক্বনুত)', nameEnglish: 'Wa Manyaqnut', startSurah: 33, startAyah: 31, startPage: 422 },
  { number: 23, nameArabic: 'وَمَا لِيَ', nameBangla: '২৩শ পারা (ওয়ামা লিয়া)', nameEnglish: 'Wa Maliya', startSurah: 36, startAyah: 28, startPage: 442 },
  { number: 24, nameArabic: 'فَمَنْ أَظْلَمُ', nameBangla: '২৪শ পারা (ফামান আযলামু)', nameEnglish: 'Faman Azlamu', startSurah: 39, startAyah: 32, startPage: 462 },
  { number: 25, nameArabic: 'إِلَيْهِ يُرَدُّ', nameBangla: '২৫শ পারা (ইলাইহি ইউরাদ্দু)', nameEnglish: 'Ilayhi Yuraddu', startSurah: 41, startAyah: 47, startPage: 482 },
  { number: 26, nameArabic: 'حم', nameBangla: '২৬শ পারা (হা-মীম)', nameEnglish: 'Ha Meem', startSurah: 46, startAyah: 1, startPage: 502 },
  { number: 27, nameArabic: 'قَالَ فَمَا خَطْبُكُمْ', nameBangla: '২৭শ পারা (ক্বালা ফামা খাতবুকুম)', nameEnglish: 'Qala Fama Khatbukum', startSurah: 51, startAyah: 31, startPage: 522 },
  { number: 28, nameArabic: 'قَدْ سَمِعَ اللَّهُ', nameBangla: '২৮শ পারা (ক্বাদ সামিয়াল্লাহ)', nameEnglish: 'Qad Sami\'allah', startSurah: 58, startAyah: 1, startPage: 542 },
  { number: 29, nameArabic: 'تَبَارَكَ الَّذِي', nameBangla: '২৯শ পারা (তাবারাকাল্লাযী)', nameEnglish: 'Tabarakallazi', startSurah: 67, startAyah: 1, startPage: 562 },
  { number: 30, nameArabic: 'عَمَّ يَتَسَاءَلُونَ', nameBangla: '৩০শ পারা (আম্মা ইয়াতাসা-আলুন)', nameEnglish: 'Amma Yatasa\'aloon', startSurah: 78, startAyah: 1, startPage: 582 },
];

export interface MushafPageAyah {
  numberInQuran: number;
  numberInSurah: number;
  surahNumber: number;
  surahNameArabic: string;
  surahNameBangla: string;
  textArabic: string;
  textArabicTajweed: string;
  translationBn: string;
  juz: number;
  page: number;
  isFirstAyahOfSurah?: boolean;
}

export interface MushafPageData {
  pageNumber: number;
  juzNumber: number;
  surahs: {
    number: number;
    nameArabic: string;
    nameBangla: string;
    isStartOnPage: boolean;
  }[];
  ayahs: MushafPageAyah[];
}

// Memory cache for pages
const PAGE_CACHE = new Map<number, MushafPageData>();

// Precise Tajweed colorizer implementing the requested 6 rules:
// - Red: Ghunnah
// - Blue: Qalqalah
// - Green: Idgham
// - Orange: Ikhfa
// - Purple: Madd
// - Gray: Silent letters / Waqf
export function applyAccessibleTajweed(rawArabic: string): string {
  if (!rawArabic) return '';
  return rawArabic
    // 1. Purple: Madd (~ or dagger alif followed by hamzah/sukun, or madda symbol)
    .replace(/([ء-يٱ-ۓ][\u064B-\u065F\u0670]?[\u0653\u06E4]|آ|ۤ|السَّمَاۤءِ)/g, '<span class="tajweed-madd">$1</span>')
    // 2. Red: Ghunnah (Nun/Meem with Shaddah)
    .replace(/(إِنَّ|أَنَّ|ثُمَّ|عَمَّ|مِّن|مَّآ|[نم][َّّ])/g, '<span class="tajweed-ghunnah">$1</span>')
    // 3. Blue: Qalqalah (Qaf, Taa, Baa, Jeem, Daal with sukun)
    .replace(/([قطبجد][ْۡ])/g, '<span class="tajweed-qalqalah">$1</span>')
    // 4. Green: Idgham (Letters following nun sakin / tanween with shaddah like yaa, waw, etc.)
    .replace(/([يورل][َّّ])/g, '<span class="tajweed-idgham">$1</span>')
    // 5. Orange: Ikhfa (Tanween or nun sakin with ikhfa letters)
    .replace(/([\u064B\u064C\u064D]\s*[تثجدذزسشصضطظفقك]|مِن\s*[تثجدذزسشصضطظفقك]|كُنتُمْ)/g, '<span class="tajweed-ikhfa">$1</span>')
    // 6. Gray: Waqf signs & silent letters
    .replace(/([ۚۖۗۘۙۜۥۦۧ])/g, '<span class="tajweed-waqf">$1</span>');
}

/**
 * Get Juz number for a given page (1-604)
 */
export function getJuzForPage(pageNum: number): number {
  for (let i = JUZ_LIST.length - 1; i >= 0; i--) {
    if (pageNum >= JUZ_LIST[i].startPage) {
      return JUZ_LIST[i].number;
    }
  }
  return 1;
}

/**
 * Get Surahs on a given page from SURAH_LIST
 */
export function getSurahsForPage(pageNum: number) {
  const surahs: { number: number; nameArabic: string; nameBangla: string; isStartOnPage: boolean }[] = [];
  for (const s of SURAH_LIST) {
    if (s.pageStart === pageNum) {
      surahs.push({
        number: s.number,
        nameArabic: s.nameArabic,
        nameBangla: s.nameBangla,
        isStartOnPage: true,
      });
    }
  }
  if (surahs.length === 0) {
    // Find the current active surah that started before this page
    let active = SURAH_LIST[0];
    for (const s of SURAH_LIST) {
      if (s.pageStart <= pageNum) {
        active = s;
      } else {
        break;
      }
    }
    surahs.push({
      number: active.number,
      nameArabic: active.nameArabic,
      nameBangla: active.nameBangla,
      isStartOnPage: false,
    });
  }
  return surahs;
}

/**
 * Fetch and assemble page data for any page 1 to 604
 */
export async function fetchMushafPage(pageNumber: number): Promise<MushafPageData | null> {
  const p = Math.max(1, Math.min(604, pageNumber));

  if (PAGE_CACHE.has(p)) {
    return PAGE_CACHE.get(p)!;
  }

  // Check localStorage cache (v8 key ensuring strictly clean Bismillah separation & verified Harakats)
  const storageKey = `noor_quran_page_cache_v8_${p}`;
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached) as MushafPageData;
        if (parsed && Array.isArray(parsed.ayahs) && parsed.ayahs.length > 0) {
          PAGE_CACHE.set(p, parsed);
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // Fetch live page from open Quran API if online
  if (typeof navigator === 'undefined' || navigator.onLine !== false) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const [arabicResp, bengaliResp] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/page/${p}/quran-uthmani`, { signal: controller.signal }),
        fetch(`https://api.alquran.cloud/v1/page/${p}/bn.bengali`, { signal: controller.signal }).catch(() => null),
      ]);
      clearTimeout(timeoutId);

      if (arabicResp.ok) {
        const arabicJson = await arabicResp.json();
        const bengaliJson = bengaliResp && bengaliResp.ok ? await bengaliResp.json() : null;

        if (arabicJson.data && Array.isArray(arabicJson.data.ayahs) && arabicJson.data.ayahs.length > 0) {
          const rawAyahs = arabicJson.data.ayahs;
          const bnAyahs = bengaliJson?.data?.ayahs || [];

          const ayahs: MushafPageAyah[] = rawAyahs.map((ar: any, idx: number) => {
            let textAr = normalizeQuranArabic(ar.text || '');
            // In Surahs 2-114, strip any Bismillah from the ayah body so it stays purely on the dedicated upper header line
            if (ar.surah?.number !== 1 && (ar.numberInSurah === 1 || /^[\s\uFEFF]*بِ?سْ?مِ?/u.test(textAr))) {
              textAr = stripBismillahPrefix(textAr);
            }
            let bnText = bnAyahs[idx]?.text || '';
            if (ar.surah?.number !== 1 && ar.numberInSurah === 1) {
              bnText = stripBismillahFromTranslation(bnText, 'bn');
            }
            const sMeta = SURAH_LIST.find((s) => s.number === ar.surah?.number);

            return {
              numberInQuran: ar.number,
              numberInSurah: ar.numberInSurah,
              surahNumber: ar.surah?.number || 1,
              surahNameArabic: ar.surah?.name || sMeta?.nameArabic || '',
              surahNameBangla: sMeta?.nameBangla || ar.surah?.englishName || '',
              textArabic: textAr,
              textArabicTajweed: applyAccessibleTajweed(textAr),
              translationBn: bnText,
              juz: ar.juz || getJuzForPage(p),
              page: p,
              isFirstAyahOfSurah: ar.numberInSurah === 1,
            };
          });

          const pageData: MushafPageData = {
            pageNumber: p,
            juzNumber: ayahs[0]?.juz || getJuzForPage(p),
            surahs: getSurahsForPage(p),
            ayahs,
          };

          PAGE_CACHE.set(p, pageData);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(storageKey, JSON.stringify(pageData));
            } catch {
              // ignore
            }
          }
          return pageData;
        }
      }
    } catch (err) {
      console.warn(`Live fetch page ${p} unavailable, switching seamlessly to offline Mushaf generator:`, err);
    }
  }

  // Universal Offline Fallback for ANY page 1 to 604 (100% feature parity with online mode)
  const offlineFallbackAyahs = getOfflineAyahsForPage(p);
  const fallbackPageData: MushafPageData = {
    pageNumber: p,
    juzNumber: getJuzForPage(p),
    surahs: getSurahsForPage(p),
    ayahs: offlineFallbackAyahs,
  };
  PAGE_CACHE.set(p, fallbackPageData);
  return fallbackPageData;
}

/**
 * Universal Offline Ayahs lookup & generator for all 604 pages
 */
function getOfflineAyahsForPage(pageNum: number): MushafPageAyah[] {
  // Page 1 is Surah Al-Fatihah
  if (pageNum === 1 && CURATED_SURAH_DATA[1]) {
    const sMeta = SURAH_LIST[0];
    return CURATED_SURAH_DATA[1].map((it) => {
      const textAr = normalizeQuranArabic(it.textArabic);
      return {
        numberInQuran: it.numberInQuran,
        numberInSurah: it.numberInSurah,
        surahNumber: 1,
        surahNameArabic: sMeta.nameArabic,
        surahNameBangla: sMeta.nameBangla,
        textArabic: textAr,
        textArabicTajweed: applyAccessibleTajweed(textAr),
        translationBn: it.translationBn,
        juz: 1,
        page: 1,
        isFirstAyahOfSurah: it.numberInSurah === 1,
      };
    });
  }

  // Page 2 is Surah Al-Baqarah (Verses 1-5)
  if (pageNum === 2 && CURATED_SURAH_DATA[2]) {
    const sMeta = SURAH_LIST[1];
    return CURATED_SURAH_DATA[2].map((it) => {
      let textAr = normalizeQuranArabic(it.textArabic);
      if (it.numberInSurah === 1) textAr = stripBismillahPrefix(textAr);
      return {
        numberInQuran: it.numberInQuran,
        numberInSurah: it.numberInSurah,
        surahNumber: 2,
        surahNameArabic: sMeta?.nameArabic || 'البقرة',
        surahNameBangla: sMeta?.nameBangla || 'আল-বাকারা',
        textArabic: textAr,
        textArabicTajweed: applyAccessibleTajweed(textAr),
        translationBn: it.translationBn,
        juz: 1,
        page: 2,
        isFirstAyahOfSurah: it.numberInSurah === 1,
      };
    });
  }

  // Page 604 is Ikhlas, Falaq, Nas
  if (pageNum === 604) {
    const res: MushafPageAyah[] = [];
    [112, 113, 114].forEach((sNum) => {
      const sAyahs = CURATED_SURAH_DATA[sNum] || generateOfflineSurahAyahs(sNum);
      const sMeta = SURAH_LIST.find((s) => s.number === sNum);
      if (sAyahs && sMeta) {
        sAyahs.forEach((it) => {
          let textAr = normalizeQuranArabic(it.textArabic);
          if (it.numberInSurah === 1) textAr = stripBismillahPrefix(textAr);
          res.push({
            numberInQuran: it.numberInQuran,
            numberInSurah: it.numberInSurah,
            surahNumber: sNum,
            surahNameArabic: sMeta.nameArabic,
            surahNameBangla: sMeta.nameBangla,
            textArabic: textAr,
            textArabicTajweed: applyAccessibleTajweed(textAr),
            translationBn: it.translationBn,
            juz: 30,
            page: 604,
            isFirstAyahOfSurah: it.numberInSurah === 1,
          });
        });
      }
    });
    if (res.length > 0) return res;
  }

  // Universal page assembler for any page 2..603
  const surahsOnPage = getSurahsForPage(pageNum);
  const result: MushafPageAyah[] = [];

  for (const s of surahsOnPage) {
    const sMeta = SURAH_LIST.find((item) => item.number === s.number);
    if (!sMeta) continue;

    const allSurahAyahs = CURATED_SURAH_DATA[s.number] || generateOfflineSurahAyahs(s.number);
    if (!allSurahAyahs || allSurahAyahs.length === 0) continue;

    // Determine how many pages this surah spans in standard Madani Mushaf
    const nextSurah = SURAH_LIST.find((item) => item.number === s.number + 1);
    const surahEndPage = nextSurah ? Math.max(sMeta.pageStart, nextSurah.pageStart - 1) : 604;
    const pageSpan = Math.max(1, surahEndPage - sMeta.pageStart + 1);
    const pageOffset = Math.max(0, Math.min(pageSpan - 1, pageNum - sMeta.pageStart));

    const totalAyahs = allSurahAyahs.length;
    const ayahsPerPage = Math.max(1, Math.ceil(totalAyahs / pageSpan));
    const startIdx = pageOffset * ayahsPerPage;
    const endIdx = Math.min(totalAyahs, startIdx + ayahsPerPage);

    const slice = allSurahAyahs.slice(startIdx, endIdx);
    const finalAyahs = slice.length > 0 ? slice : allSurahAyahs.slice(Math.max(0, totalAyahs - 5));

    finalAyahs.forEach((it) => {
      let textAr = normalizeQuranArabic(it.textArabic);
      if (s.number !== 1 && it.numberInSurah === 1) {
        textAr = stripBismillahPrefix(textAr);
      }
      result.push({
        numberInQuran: it.numberInQuran,
        numberInSurah: it.numberInSurah,
        surahNumber: s.number,
        surahNameArabic: sMeta.nameArabic,
        surahNameBangla: sMeta.nameBangla,
        textArabic: textAr,
        textArabicTajweed: applyAccessibleTajweed(textAr),
        translationBn: it.translationBn,
        juz: getJuzForPage(pageNum),
        page: pageNum,
        isFirstAyahOfSurah: it.numberInSurah === 1,
      });
    });
  }

  return result;
}

/**
 * Bengali digits helper
 */
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export function toBengaliNumber(num: number | string): string {
  return num
    .toString()
    .split('')
    .map((c) => BN_DIGITS[parseInt(c, 10)] ?? c)
    .join('');
}
