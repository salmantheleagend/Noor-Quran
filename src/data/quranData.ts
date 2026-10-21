import { SurahMeta, AyahItem } from '../types';
import {
  convertPhoneticToBengali,
  normalizeArabicWithCompleteTashkeel,
  getBengaliPronunciation,
} from '../utils/quranTransliteration';

export interface TajweedRuleInfo {
  nameBn: string;
  nameAr: string;
  colorHex: string;
  className: string;
  descriptionBn: string;
  exampleAr: string;
}

export const TAJWEED_RULES: TajweedRuleInfo[] = [
  {
    nameBn: 'মাদ্দ (Madd - দীর্ঘ টান)',
    nameAr: 'المدّ',
    colorHex: '#dc2626',
    className: 'tajweed-madd',
    descriptionBn: 'মাদ্দের হরফের পর হামযাহ বা সাকিন আসলে ৩ বা ৪ আলিফ পরিমাণ দীর্ঘ টেনে পড়তে হয়।',
    exampleAr: 'السَّمَاۤءِ',
  },
  {
    nameBn: 'ওয়াজিব গুন্নাহ ও গুন্নাহ (Ghunnah)',
    nameAr: 'الغُنّة',
    colorHex: '#10b981',
    className: 'tajweed-ghunnah',
    descriptionBn: 'নূন বা মীম মুশাদ্দাদে ১ আলিফ পরিমাণ নাকের বাঁশিতে আওয়াজ আটকে গুন্নাহ করা ওয়াজিব।',
    exampleAr: 'إِنَّ / ثُمَّ',
  },
  {
    nameBn: 'ইখফা (Ikhfa - গোপন করে গুন্নাহ)',
    nameAr: 'الإخفاء',
    colorHex: '#0d9488',
    className: 'tajweed-ikhfa',
    descriptionBn: 'নূন সাকিন বা তানবীনের পর ইখফার ১৫টি হরফের কোনো একটি আসলে গুন্নাহসহ অস্পষ্ট আওয়াজে পড়া।',
    exampleAr: 'مِن قَبْلُ / كُنتُمْ',
  },
  {
    nameBn: 'ইদগাম (Idgham - মিলিয়ে পড়া)',
    nameAr: 'الإدغام',
    colorHex: '#6366f1',
    className: 'tajweed-idgham',
    descriptionBn: 'প্রথম হরফকে পরবর্তী হরফের সাথে মিলিয়ে সংযুক্ত করে পড়া (বাগুন্নাহ ও বা-ই-গুন্নাহ)।',
    exampleAr: 'مَن يَّقُولُ / مِن رَّبِّهِمْ',
  },
  {
    nameBn: 'কলকলাহ (Qalqalah - প্রতিধ্বনি)',
    nameAr: 'القلقلة',
    colorHex: '#3b82f6',
    className: 'tajweed-qalqalah',
    descriptionBn: 'ক্বাফ, ত্বো, বা, জিম, দাল (ق ط ب ج د)—এ ৫টি হরফে সাকিন হলে আওয়াজকে ধাক্কা দিয়ে প্রতিধ্বনি তৈরি করা।',
    exampleAr: 'قُلْ هُوَ اللَّهُ أَحَدْ / خَلَقَ',
  },
  {
    nameBn: 'ইকলাব (Iqlab - পরিবর্তন করা)',
    nameAr: 'الإقلاب',
    colorHex: '#d97706',
    className: 'tajweed-iqlab',
    descriptionBn: 'নূন সাকিন বা তানবীনের পর "বা" (ب) আসলে নূন-কে "মীম" (م) দ্বারা পরিবর্তন করে গুন্নাহসহ পড়া।',
    exampleAr: 'مِۢن بَعْدِ',
  },
];

export const SURAH_LIST: SurahMeta[] = [
  { number: 1, nameArabic: 'الفاتحة', nameBangla: 'আল-ফাতিহা', nameEnglish: 'Al-Fatihah', englishTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 1, pageStart: 1 },
  { number: 2, nameArabic: 'البقرة', nameBangla: 'আল-বাকারা', nameEnglish: 'Al-Baqarah', englishTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 1, pageStart: 2 },
  { number: 3, nameArabic: 'آل عمران', nameBangla: 'আলে-ইমরান', nameEnglish: 'Ali \'Imran', englishTranslation: 'Family of Imran', numberOfAyahs: 200, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 3, pageStart: 50 },
  { number: 4, nameArabic: 'النساء', nameBangla: 'আন-নিসা', nameEnglish: 'An-Nisa', englishTranslation: 'The Women', numberOfAyahs: 176, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 4, pageStart: 77 },
  { number: 5, nameArabic: 'المائدة', nameBangla: 'আল-মায়িদাহ', nameEnglish: 'Al-Ma\'idah', englishTranslation: 'The Table Spread', numberOfAyahs: 120, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 6, pageStart: 106 },
  { number: 6, nameArabic: 'الأنعام', nameBangla: 'আল-আনআম', nameEnglish: 'Al-An\'am', englishTranslation: 'The Cattle', numberOfAyahs: 165, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 7, pageStart: 128 },
  { number: 7, nameArabic: 'الأعراف', nameBangla: 'আল-আরাফ', nameEnglish: 'Al-A\'raf', englishTranslation: 'The Heights', numberOfAyahs: 206, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 8, pageStart: 151 },
  { number: 8, nameArabic: 'الأنفال', nameBangla: 'আল-আনফাল', nameEnglish: 'Al-Anfal', englishTranslation: 'The Spoils of War', numberOfAyahs: 75, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 9, pageStart: 177 },
  { number: 9, nameArabic: 'التوبة', nameBangla: 'আত-তাওবাহ', nameEnglish: 'At-Tawbah', englishTranslation: 'The Repentance', numberOfAyahs: 129, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 10, pageStart: 187 },
  { number: 10, nameArabic: 'يونس', nameBangla: 'ইউনুস', nameEnglish: 'Yunus', englishTranslation: 'Jonah', numberOfAyahs: 109, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 11, pageStart: 208 },
  { number: 11, nameArabic: 'هود', nameBangla: 'হুদ', nameEnglish: 'Hud', englishTranslation: 'Hud', numberOfAyahs: 123, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 11, pageStart: 221 },
  { number: 12, nameArabic: 'يوسف', nameBangla: 'ইউসুফ', nameEnglish: 'Yusuf', englishTranslation: 'Joseph', numberOfAyahs: 111, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 12, pageStart: 235 },
  { number: 13, nameArabic: 'الرعد', nameBangla: 'আর-রাদ', nameEnglish: 'Ar-Ra\'d', englishTranslation: 'The Thunder', numberOfAyahs: 43, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 13, pageStart: 249 },
  { number: 14, nameArabic: 'إبراهيم', nameBangla: 'ইব্রাহিম', nameEnglish: 'Ibrahim', englishTranslation: 'Abraham', numberOfAyahs: 52, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 13, pageStart: 255 },
  { number: 15, nameArabic: 'الحجر', nameBangla: 'আল-হিজর', nameEnglish: 'Al-Hijr', englishTranslation: 'The Rocky Tract', numberOfAyahs: 99, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 14, pageStart: 262 },
  { number: 16, nameArabic: 'النحل', nameBangla: 'আন-নাহল', nameEnglish: 'An-Nahl', englishTranslation: 'The Bee', numberOfAyahs: 128, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 14, pageStart: 267 },
  { number: 17, nameArabic: 'الإسراء', nameBangla: 'আল-ইসরা', nameEnglish: 'Al-Isra', englishTranslation: 'The Night Journey', numberOfAyahs: 111, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 15, pageStart: 282 },
  { number: 18, nameArabic: 'الكهف', nameBangla: 'আল-কাহফ', nameEnglish: 'Al-Kahf', englishTranslation: 'The Cave', numberOfAyahs: 110, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 15, pageStart: 293 },
  { number: 19, nameArabic: 'مريم', nameBangla: 'মারিয়াম', nameEnglish: 'Maryam', englishTranslation: 'Mary', numberOfAyahs: 98, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 16, pageStart: 305 },
  { number: 20, nameArabic: 'طه', nameBangla: 'ত্বা-হা', nameEnglish: 'Ta-Ha', englishTranslation: 'Ta-Ha', numberOfAyahs: 135, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 16, pageStart: 312 },
  { number: 21, nameArabic: 'الأنبياء', nameBangla: 'আল-আম্বিয়া', nameEnglish: 'Al-Anbiya', englishTranslation: 'The Prophets', numberOfAyahs: 112, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 17, pageStart: 322 },
  { number: 22, nameArabic: 'الحج', nameBangla: 'আল-হাজ্ব', nameEnglish: 'Al-Hajj', englishTranslation: 'The Pilgrimage', numberOfAyahs: 78, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 17, pageStart: 332 },
  { number: 23, nameArabic: 'المؤمنون', nameBangla: 'আল-মুমিনুন', nameEnglish: 'Al-Mu\'minun', englishTranslation: 'The Believers', numberOfAyahs: 118, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 18, pageStart: 342 },
  { number: 24, nameArabic: 'النور', nameBangla: 'আন-নূর', nameEnglish: 'An-Nur', englishTranslation: 'The Light', numberOfAyahs: 64, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 18, pageStart: 350 },
  { number: 25, nameArabic: 'الفرقان', nameBangla: 'আল-ফুরকান', nameEnglish: 'Al-Furqan', englishTranslation: 'The Criterion', numberOfAyahs: 77, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 18, pageStart: 359 },
  { number: 26, nameArabic: 'الشعراء', nameBangla: 'আশ-শুআরা', nameEnglish: 'Ash-Shu\'ara', englishTranslation: 'The Poets', numberOfAyahs: 227, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 19, pageStart: 367 },
  { number: 27, nameArabic: 'النمل', nameBangla: 'আন-নামল', nameEnglish: 'An-Naml', englishTranslation: 'The Ant', numberOfAyahs: 93, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 19, pageStart: 377 },
  { number: 28, nameArabic: 'القصص', nameBangla: 'আল-কাসাস', nameEnglish: 'Al-Qasas', englishTranslation: 'The Stories', numberOfAyahs: 88, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 20, pageStart: 385 },
  { number: 29, nameArabic: 'العنكبوت', nameBangla: 'আল-আনকাবুত', nameEnglish: 'Al-\'Ankabut', englishTranslation: 'The Spider', numberOfAyahs: 69, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 20, pageStart: 396 },
  { number: 30, nameArabic: 'الروم', nameBangla: 'আর-রুম', nameEnglish: 'Ar-Rum', englishTranslation: 'The Romans', numberOfAyahs: 60, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 21, pageStart: 404 },
  { number: 31, nameArabic: 'لقمان', nameBangla: 'লুকমান', nameEnglish: 'Luqman', englishTranslation: 'Luqman', numberOfAyahs: 34, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 21, pageStart: 411 },
  { number: 32, nameArabic: 'السجدة', nameBangla: 'আস-সাজদাহ', nameEnglish: 'As-Sajdah', englishTranslation: 'The Prostration', numberOfAyahs: 30, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 21, pageStart: 415 },
  { number: 33, nameArabic: 'الأحزاب', nameBangla: 'আল-আহযাব', nameEnglish: 'Al-Ahzab', englishTranslation: 'The Combined Forces', numberOfAyahs: 73, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 21, pageStart: 418 },
  { number: 34, nameArabic: 'سبأ', nameBangla: 'সাবা', nameEnglish: 'Saba', englishTranslation: 'Sheba', numberOfAyahs: 54, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 22, pageStart: 428 },
  { number: 35, nameArabic: 'فاطر', nameBangla: 'ফাতির', nameEnglish: 'Fatir', englishTranslation: 'Originator', numberOfAyahs: 45, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 22, pageStart: 434 },
  { number: 36, nameArabic: 'يس', nameBangla: 'ইয়াসীন', nameEnglish: 'Ya-Sin', englishTranslation: 'Ya Sin', numberOfAyahs: 83, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 22, pageStart: 440 },
  { number: 37, nameArabic: 'الصافات', nameBangla: 'আস-সাফফাত', nameEnglish: 'As-Saffat', englishTranslation: 'Those who set the Ranks', numberOfAyahs: 182, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 23, pageStart: 446 },
  { number: 38, nameArabic: 'ص', nameBangla: 'সোয়াদ', nameEnglish: 'Sad', englishTranslation: 'The Letter "Saad"', numberOfAyahs: 88, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 23, pageStart: 453 },
  { number: 39, nameArabic: 'الزمر', nameBangla: 'আজ-জুমার', nameEnglish: 'Az-Zumar', englishTranslation: 'The Troops', numberOfAyahs: 75, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 23, pageStart: 458 },
  { number: 40, nameArabic: 'غافر', nameBangla: 'গাফির', nameEnglish: 'Ghafir', englishTranslation: 'The Forgiver', numberOfAyahs: 85, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 24, pageStart: 467 },
  { number: 41, nameArabic: 'فصلت', nameBangla: 'ফুসসিলাত', nameEnglish: 'Fussilat', englishTranslation: 'Explained in Detail', numberOfAyahs: 54, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 24, pageStart: 477 },
  { number: 42, nameArabic: 'الشورى', nameBangla: 'আশ-শুরা', nameEnglish: 'Ash-Shura', englishTranslation: 'The Consultation', numberOfAyahs: 53, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 25, pageStart: 483 },
  { number: 43, nameArabic: 'الزخرف', nameBangla: 'আজ-জুযরুফ', nameEnglish: 'Az-Zukhruf', englishTranslation: 'The Ornaments of Gold', numberOfAyahs: 89, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 25, pageStart: 489 },
  { number: 44, nameArabic: 'الدخان', nameBangla: 'আদ-দুখান', nameEnglish: 'Ad-Dukhan', englishTranslation: 'The Smoke', numberOfAyahs: 59, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 25, pageStart: 496 },
  { number: 45, nameArabic: 'الجاثية', nameBangla: 'আল-জাসিয়াহ', nameEnglish: 'Al-Jathiyah', englishTranslation: 'The Crouching', numberOfAyahs: 37, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 25, pageStart: 499 },
  { number: 46, nameArabic: 'الأحقاف', nameBangla: 'আল-আহকাফ', nameEnglish: 'Al-Ahqaf', englishTranslation: 'The Wind-Curved Sandhills', numberOfAyahs: 35, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 26, pageStart: 502 },
  { number: 47, nameArabic: 'محمد', nameBangla: 'মুহাম্মদ', nameEnglish: 'Muhammad', englishTranslation: 'Muhammad', numberOfAyahs: 38, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 26, pageStart: 507 },
  { number: 48, nameArabic: 'الفتح', nameBangla: 'আল-ফাতহ', nameEnglish: 'Al-Fath', englishTranslation: 'The Victory', numberOfAyahs: 29, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 26, pageStart: 511 },
  { number: 49, nameArabic: 'الحجرات', nameBangla: 'আল-হুজুরাত', nameEnglish: 'Al-Hujurat', englishTranslation: 'The Rooms', numberOfAyahs: 18, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 26, pageStart: 515 },
  { number: 50, nameArabic: 'ق', nameBangla: 'ক্বাফ', nameEnglish: 'Qaf', englishTranslation: 'The Letter "Qaf"', numberOfAyahs: 45, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 26, pageStart: 518 },
  { number: 51, nameArabic: 'الذاريات', nameBangla: 'আয-যারিয়াত', nameEnglish: 'Adh-Dhariyat', englishTranslation: 'The Winnowing Winds', numberOfAyahs: 60, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 26, pageStart: 520 },
  { number: 52, nameArabic: 'الطور', nameBangla: 'আত-তূর', nameEnglish: 'At-Tur', englishTranslation: 'The Mount', numberOfAyahs: 49, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 27, pageStart: 523 },
  { number: 53, nameArabic: 'النجم', nameBangla: 'আন-নাজম', nameEnglish: 'An-Najm', englishTranslation: 'The Star', numberOfAyahs: 62, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 27, pageStart: 526 },
  { number: 54, nameArabic: 'القمر', nameBangla: 'আল-কামার', nameEnglish: 'Al-Qamar', englishTranslation: 'The Moon', numberOfAyahs: 55, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 27, pageStart: 528 },
  { number: 55, nameArabic: 'الرحمن', nameBangla: 'আর-রহমান', nameEnglish: 'Ar-Rahman', englishTranslation: 'The Beneficent', numberOfAyahs: 78, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 27, pageStart: 531 },
  { number: 56, nameArabic: 'الواقعة', nameBangla: 'আল-ওয়াকিয়াহ', nameEnglish: 'Al-Waqi\'ah', englishTranslation: 'The Inevitable', numberOfAyahs: 96, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 27, pageStart: 534 },
  { number: 57, nameArabic: 'الحديد', nameBangla: 'আল-হাদীদ', nameEnglish: 'Al-Hadid', englishTranslation: 'The Iron', numberOfAyahs: 29, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 27, pageStart: 537 },
  { number: 58, nameArabic: 'المجادلة', nameBangla: 'আল-মুজাদালাহ', nameEnglish: 'Al-Mujadila', englishTranslation: 'The Pleading Woman', numberOfAyahs: 22, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 542 },
  { number: 59, nameArabic: 'الحشر', nameBangla: 'আল-হাশর', nameEnglish: 'Al-Hashr', englishTranslation: 'The Exile', numberOfAyahs: 24, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 545 },
  { number: 60, nameArabic: 'الممتحنة', nameBangla: 'আল-মুমতাহিনাহ', nameEnglish: 'Al-Mumtahanah', englishTranslation: 'She that is to be examined', numberOfAyahs: 13, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 549 },
  { number: 61, nameArabic: 'الصف', nameBangla: 'আস-সফ', nameEnglish: 'As-Saff', englishTranslation: 'The Ranks', numberOfAyahs: 14, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 551 },
  { number: 62, nameArabic: 'الجمعة', nameBangla: 'আল-জুমুআহ', nameEnglish: 'Al-Jumu\'ah', englishTranslation: 'The Congregation', numberOfAyahs: 11, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 553 },
  { number: 63, nameArabic: 'المنافقون', nameBangla: 'আল-মুনাফিকুন', nameEnglish: 'Al-Munafiqun', englishTranslation: 'The Hypocrites', numberOfAyahs: 11, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 554 },
  { number: 64, nameArabic: 'التغابن', nameBangla: 'আত-তাগাবুন', nameEnglish: 'At-Taghabun', englishTranslation: 'The Mutual Disillusion', numberOfAyahs: 18, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 556 },
  { number: 65, nameArabic: 'الطلاق', nameBangla: 'আত-ত্বালাক্ব', nameEnglish: 'At-Talaq', englishTranslation: 'The Divorce', numberOfAyahs: 12, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 558 },
  { number: 66, nameArabic: 'التحريم', nameBangla: 'আত-তাহরীম', nameEnglish: 'At-Tahrim', englishTranslation: 'The Prohibition', numberOfAyahs: 12, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 28, pageStart: 560 },
  { number: 67, nameArabic: 'الملك', nameBangla: 'আল-মুলক', nameEnglish: 'Al-Mulk', englishTranslation: 'The Sovereignty', numberOfAyahs: 30, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 562 },
  { number: 68, nameArabic: 'القلم', nameBangla: 'আল-কলম', nameEnglish: 'Al-Qalam', englishTranslation: 'The Pen', numberOfAyahs: 52, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 564 },
  { number: 69, nameArabic: 'الحاقة', nameBangla: 'আল-হাক্কাহ', nameEnglish: 'Al-Haqqah', englishTranslation: 'The Inevitable Reality', numberOfAyahs: 52, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 566 },
  { number: 70, nameArabic: 'المعارج', nameBangla: 'আল-মাআরিজ', nameEnglish: 'Al-Ma\'arij', englishTranslation: 'The Ascending Stairways', numberOfAyahs: 44, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 568 },
  { number: 71, nameArabic: 'نوح', nameBangla: 'নূহ', nameEnglish: 'Nuh', englishTranslation: 'Noah', numberOfAyahs: 28, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 570 },
  { number: 72, nameArabic: 'الجن', nameBangla: 'আল-জ্বিন', nameEnglish: 'Al-Jinn', englishTranslation: 'The Jinn', numberOfAyahs: 28, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 572 },
  { number: 73, nameArabic: 'المزمل', nameBangla: 'আল-মুয্যাম্মিল', nameEnglish: 'Al-Muzzammil', englishTranslation: 'The Enshrouded One', numberOfAyahs: 20, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 574 },
  { number: 74, nameArabic: 'المدثر', nameBangla: 'আল-মুদ্দাসসির', nameEnglish: 'Al-Muddaththir', englishTranslation: 'The Cloaked One', numberOfAyahs: 56, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 575 },
  { number: 75, nameArabic: 'القيامة', nameBangla: 'আল-কিয়ামাহ', nameEnglish: 'Al-Qiyamah', englishTranslation: 'The Resurrection', numberOfAyahs: 40, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 577 },
  { number: 76, nameArabic: 'الإنسان', nameBangla: 'আল-ইনসান', nameEnglish: 'Al-Insan', englishTranslation: 'The Man', numberOfAyahs: 31, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 29, pageStart: 578 },
  { number: 77, nameArabic: 'المرسلات', nameBangla: 'আল-মুরসালাত', nameEnglish: 'Al-Mursalat', englishTranslation: 'The Emissaries', numberOfAyahs: 50, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 29, pageStart: 580 },
  { number: 78, nameArabic: 'النبأ', nameBangla: 'আন-নাবা', nameEnglish: 'An-Naba', englishTranslation: 'The Tidings', numberOfAyahs: 40, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 582 },
  { number: 79, nameArabic: 'النازعات', nameBangla: 'আন-নাযিআত', nameEnglish: 'An-Nazi\'at', englishTranslation: 'Those who drag forth', numberOfAyahs: 46, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 583 },
  { number: 80, nameArabic: 'عبس', nameBangla: 'আবাসা', nameEnglish: '\'Abasa', englishTranslation: 'He Frowned', numberOfAyahs: 42, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 585 },
  { number: 81, nameArabic: 'التكوير', nameBangla: 'আত-তাকবীর', nameEnglish: 'At-Takwir', englishTranslation: 'The Overthrowing', numberOfAyahs: 29, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 586 },
  { number: 82, nameArabic: 'الانفطار', nameBangla: 'আল-ইনফিতার', nameEnglish: 'Al-Infitar', englishTranslation: 'The Cleaving', numberOfAyahs: 19, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 587 },
  { number: 83, nameArabic: 'المطففين', nameBangla: 'আল-মুতাফফিফীন', nameEnglish: 'Al-Mutaffifin', englishTranslation: 'The Defrauding', numberOfAyahs: 36, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 587 },
  { number: 84, nameArabic: 'الانشقاق', nameBangla: 'আল-ইনশিক্বাক্ব', nameEnglish: 'Al-Inshiqaq', englishTranslation: 'The Splitting Asunder', numberOfAyahs: 25, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 589 },
  { number: 85, nameArabic: 'البروج', nameBangla: 'আল-বুরূজ', nameEnglish: 'Al-Buruj', englishTranslation: 'The Mansions of the Stars', numberOfAyahs: 22, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 590 },
  { number: 86, nameArabic: 'الطارق', nameBangla: 'আত-তারিক্ব', nameEnglish: 'At-Tariq', englishTranslation: 'The Morning Star', numberOfAyahs: 17, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 591 },
  { number: 87, nameArabic: 'الأعلى', nameBangla: 'আল-আলা', nameEnglish: 'Al-A\'la', englishTranslation: 'The Most High', numberOfAyahs: 19, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 591 },
  { number: 88, nameArabic: 'الغاشية', nameBangla: 'আল-গাশিয়াহ', nameEnglish: 'Al-Ghashiyah', englishTranslation: 'The Overwhelming', numberOfAyahs: 26, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 592 },
  { number: 89, nameArabic: 'الفجر', nameBangla: 'আল-ফজর', nameEnglish: 'Al-Fajr', englishTranslation: 'The Dawn', numberOfAyahs: 30, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 593 },
  { number: 90, nameArabic: 'البلد', nameBangla: 'আল-বালাদ', nameEnglish: 'Al-Balad', englishTranslation: 'The City', numberOfAyahs: 20, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 594 },
  { number: 91, nameArabic: 'الشمس', nameBangla: 'আশ-শামস', nameEnglish: 'Ash-Shams', englishTranslation: 'The Sun', numberOfAyahs: 15, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 595 },
  { number: 92, nameArabic: 'الليل', nameBangla: 'আল-লায়ল', nameEnglish: 'Al-Layl', englishTranslation: 'The Night', numberOfAyahs: 21, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 595 },
  { number: 93, nameArabic: 'الضحى', nameBangla: 'আদ-দুহা', nameEnglish: 'Ad-Duhaa', englishTranslation: 'The Morning Hours', numberOfAyahs: 11, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 596 },
  { number: 94, nameArabic: 'الشرح', nameBangla: 'আল-ইনশিরাহ', nameEnglish: 'Ash-Sharh', englishTranslation: 'The Relief', numberOfAyahs: 8, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 596 },
  { number: 95, nameArabic: 'التين', nameBangla: 'আত-তীন', nameEnglish: 'At-Tin', englishTranslation: 'The Fig', numberOfAyahs: 8, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 597 },
  { number: 96, nameArabic: 'العلق', nameBangla: 'আল-আলাক্ব', nameEnglish: 'Al-\'Alaq', englishTranslation: 'The Clot', numberOfAyahs: 19, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 597 },
  { number: 97, nameArabic: 'القدر', nameBangla: 'আল-ক্বদর', nameEnglish: 'Al-Qadr', englishTranslation: 'The Power', numberOfAyahs: 5, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 598 },
  { number: 98, nameArabic: 'البينة', nameBangla: 'আল-বাইয়িনাহ', nameEnglish: 'Al-Bayyinah', englishTranslation: 'The Clear Proof', numberOfAyahs: 8, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 30, pageStart: 598 },
  { number: 99, nameArabic: 'الزلزلة', nameBangla: 'আয-যালযালাহ', nameEnglish: 'Az-Zalzalah', englishTranslation: 'The Earthquake', numberOfAyahs: 8, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 30, pageStart: 599 },
  { number: 100, nameArabic: 'العاديات', nameBangla: 'আল-আদিয়াত', nameEnglish: 'Al-\'Adiyat', englishTranslation: 'The Courser', numberOfAyahs: 11, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 599 },
  { number: 101, nameArabic: 'القارعة', nameBangla: 'আল-ক্বারিয়াহ', nameEnglish: 'Al-Qari\'ah', englishTranslation: 'The Calamity', numberOfAyahs: 11, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 600 },
  { number: 102, nameArabic: 'التكاثر', nameBangla: 'আত-তাকাছুর', nameEnglish: 'At-Takathur', englishTranslation: 'The Rivalry in World Increase', numberOfAyahs: 8, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 600 },
  { number: 103, nameArabic: 'العصر', nameBangla: 'আল-আসর', nameEnglish: 'Al-\'Asr', englishTranslation: 'The Declining Day', numberOfAyahs: 3, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 601 },
  { number: 104, nameArabic: 'الهمزة', nameBangla: 'আল-হুমাযাহ', nameEnglish: 'Al-Humazah', englishTranslation: 'The Traducer', numberOfAyahs: 9, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 601 },
  { number: 105, nameArabic: 'الفيل', nameBangla: 'আল-ফীল', nameEnglish: 'Al-Fil', englishTranslation: 'The Elephant', numberOfAyahs: 5, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 601 },
  { number: 106, nameArabic: 'قريش', nameBangla: 'কুরাইশ', nameEnglish: 'Quraysh', englishTranslation: 'Quraysh', numberOfAyahs: 4, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 602 },
  { number: 107, nameArabic: 'الماعون', nameBangla: 'আল-মাউন', nameEnglish: 'Al-Ma\'un', englishTranslation: 'The Small Kindness', numberOfAyahs: 7, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 602 },
  { number: 108, nameArabic: 'الكوثر', nameBangla: 'আল-কাওসার', nameEnglish: 'Al-Kawthar', englishTranslation: 'The Abundance', numberOfAyahs: 3, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 602 },
  { number: 109, nameArabic: 'الكافرون', nameBangla: 'আল-কাফিরুন', nameEnglish: 'Al-Kafirun', englishTranslation: 'The Disbelievers', numberOfAyahs: 6, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 603 },
  { number: 110, nameArabic: 'النصر', nameBangla: 'আন-নাসর', nameEnglish: 'An-Nasr', englishTranslation: 'The Divine Support', numberOfAyahs: 3, revelationType: 'Medinan', revelationTypeBn: 'মাদানী', juzStart: 30, pageStart: 603 },
  { number: 111, nameArabic: 'المسد', nameBangla: 'আল-লাহাব / আল-মাসাদ', nameEnglish: 'Al-Masad', englishTranslation: 'The Palm Fiber', numberOfAyahs: 5, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 603 },
  { number: 112, nameArabic: 'الإخلاص', nameBangla: 'আল-ইখলাস', nameEnglish: 'Al-Ikhlas', englishTranslation: 'The Sincerity', numberOfAyahs: 4, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 604 },
  { number: 113, nameArabic: 'الفلق', nameBangla: 'আল-ফালাক্ব', nameEnglish: 'Al-Falaq', englishTranslation: 'The Daybreak', numberOfAyahs: 5, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 604 },
  { number: 114, nameArabic: 'الناس', nameBangla: 'আন-নাস', nameEnglish: 'An-Nas', englishTranslation: 'Mankind', numberOfAyahs: 6, revelationType: 'Meccan', revelationTypeBn: 'মাক্কী', juzStart: 30, pageStart: 604 },
];

// Offline verified ayah datasets for immediate zero-latency reading with full Tajweed color markup
export const CURATED_SURAH_DATA: Record<number, AyahItem[]> = {
  "1": [
    {
      "numberInSurah": 1,
      "numberInQuran": 1,
      "textArabic": "﻿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      "textArabicTajweed": "﻿بِسْمِ ٱللَّهِ ٱلرَّحْ<span class=\"tajweed-ghunnah\">مَ</span>ٰنِ ٱلرَّحِيمِ",
      "transliterationBn": "বিসমিল্লাহির রাহমানির রাহিম",
      "translationBn": "শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।",
      "translationEn": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      "juz": 1,
      "page": 1
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 2,
      "textArabic": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
      "textArabicTajweed": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِي<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "আলহামদু লিল্লাহি রাব্বিল আলামীন",
      "translationBn": "সমস্ত প্রশংসা জগৎসমূহের প্রতিপালক আল্লাহর জন্য।",
      "translationEn": "[All] praise is [due] to Allah, Lord of the worlds.",
      "juz": 1,
      "page": 1
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 3,
      "textArabic": "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      "textArabicTajweed": "ٱلرَّحْ<span class=\"tajweed-ghunnah\">مَ</span>ٰنِ ٱلرَّحِيمِ",
      "transliterationBn": "আর-রাহমানির রাহিম",
      "translationBn": "যিনি পরম করুণাময়, অতি দয়ালু।",
      "translationEn": "The Entirely Merciful, the Especially Merciful,",
      "juz": 1,
      "page": 1
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 4,
      "textArabic": "مَٰلِكِ يَوْمِ ٱلدِّينِ",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">مَ</span>ٰلِكِ يَوْمِ ٱلدِّينِ",
      "transliterationBn": "মালিকি ইয়াওমিদ্দীন",
      "translationBn": "বিচার দিবসের অধিপতি।",
      "translationEn": "Sovereign of the Day of Recompense.",
      "juz": 1,
      "page": 1
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 5,
      "textArabic": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      "textArabicTajweed": "إِيَّاكَ <span class=\"tajweed-ghunnah\">نَ</span>عْبُدُ وَإِيَّاكَ <span class=\"tajweed-ghunnah\">نَ</span>سْتَعِينُ",
      "transliterationBn": "ইয়্যাকা না’বুদু ওয়া ইয়্যাকা নাস্তাঈন",
      "translationBn": "আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই কাছে সাহায্য প্রার্থনা করি।",
      "translationEn": "It is You we worship and You we ask for help.",
      "juz": 1,
      "page": 1
    },
    {
      "numberInSurah": 6,
      "numberInQuran": 6,
      "textArabic": "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      "textArabicTajweed": "ٱهْدِ<span class=\"tajweed-ghunnah\">نَ</span>ا ٱلصِّرَٰطَ ٱلْمُسْتَقِي<span class=\"tajweed-ghunnah\">مَ</span>",
      "transliterationBn": "ইহদিনাস সিরাতাল মুস্তাক্বীম",
      "translationBn": "আমাদের সরল-সঠিক পথ প্রদর্শন করুন।",
      "translationEn": "Guide us to the straight path -",
      "juz": 1,
      "page": 1
    },
    {
      "numberInSurah": 7,
      "numberInQuran": 7,
      "textArabic": "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      "textArabicTajweed": "صِرَٰطَ ٱلَّذِي<span class=\"tajweed-ghunnah\">نَ</span> أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْ<span class=\"tajweed-ghunnah\">مَ</span>غْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّ<span class=\"tajweed-madd\">آ</span>لِّي<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "সিরাতাল্লাযীনা আনআমতা আলাইহিম, গাইরিল মাগদূবি আলাইহিম ওয়ালাদ্দাল্লীন।",
      "translationBn": "তাদের পথ যাদের ওপর আপনি অনুগ্রহ করেছেন; তাদের পথ নয় যারা ক্রোধে নিপতিত হয়েছে এবং যারা পথভ্রষ্ট হয়েছে।",
      "translationEn": "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      "juz": 1,
      "page": 1
    }
  ],
  "2": [
    {
      "numberInSurah": 1,
      "numberInQuran": 8,
      "textArabic": "الٓمٓ",
      "textArabicTajweed": "الٓمٓ",
      "transliterationBn": "আলিফ-লাম-মীম",
      "translationBn": "আলিফ-লাম-মীম।",
      "translationEn": "Alif, Lam, Meem.",
      "juz": 1,
      "page": 2
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 9,
      "textArabic": "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
      "textArabicTajweed": "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
      "transliterationBn": "যালিকাল কিতাবু লা রাইবা ফীহ, হুদাল লিলমুত্তাক্বীন",
      "translationBn": "এটি সেই কিতাব যাতে কোনো সন্দেহ নেই, মুত্তাকীদের জন্য পথপ্রদর্শক।",
      "translationEn": "This is the Book about which there is no doubt, a guidance for those conscious of Allah -",
      "juz": 1,
      "page": 2
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 10,
      "textArabic": "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ",
      "textArabicTajweed": "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ",
      "transliterationBn": "আল্লাযীনা ইউ'মিনূনা বিলগাইবি ওয়া ইউক্বীমূনা সালাতা ওয়া মিম্মা রাযাক্বনাহুম ইউনফিক্বূন",
      "translationBn": "যারা অদৃশ্যে বিশ্বাস করে, সালাত কায়েম করে এবং আমি তাদের যে রিযিক দান করেছি তা থেকে ব্যয় করে।",
      "translationEn": "Who believe in the unseen, establish prayer, and spend out of what We have provided for them,",
      "juz": 1,
      "page": 2
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 11,
      "textArabic": "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ",
      "textArabicTajweed": "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ",
      "transliterationBn": "ওয়াল্লাযীনা ইউ'মিনূনা বিমা উনযিলা ইলাইকা ওয়ামা উনযিলা মিন ক্বাবলিক, ওয়াবিল আখিরাতি হুম ইয়ূক্বিনূন",
      "translationBn": "এবং যারা বিশ্বাস স্থাপন করে যা আপনার প্রতি নাযিল করা হয়েছে এবং যা আপনার পূর্বে নাযিল করা হয়েছিল, আর আখেরাতে তারা দৃঢ় বিশ্বাস রাখে।",
      "translationEn": "And who believe in what has been revealed to you, [O Muhammad], and what was revealed before you, and of the Hereafter they are certain [in faith].",
      "juz": 1,
      "page": 2
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 12,
      "textArabic": "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
      "textArabicTajweed": "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
      "transliterationBn": "উলাইকা ‘আলা হুদাম মির রাব্বিহিম ওয়া উলাইকা হুমুল মুফলিহূন",
      "translationBn": "তারাই তাদের প্রতিপালকের পক্ষ থেকে সঠিক পথের ওপর রয়েছে এবং তারাই সফলকাম।",
      "translationEn": "Those are upon [right] guidance from their Lord, and it is those who are the successful.",
      "juz": 1,
      "page": 2
    }
  ],
  "67": [
    {
      "numberInSurah": 1,
      "numberInQuran": 5242,
      "textArabic": "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ",
      "textArabicTajweed": "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍۢ قَدِيرٌ",
      "transliterationBn": "তাবারাকাল্লাযী বিয়াদিহিল মুলকু ওয়াহুওয়া আলা কুল্লি শাইয়িন ক্বাদীর",
      "translationBn": "বরকতময় তিনি যাঁর হাতে সমগ্র রাজত্ব, এবং তিনি সকল বিষয়ের ওপর সর্বশক্তিমান।",
      "translationEn": "Blessed is He in whose hand is dominion, and He is over all things competent -",
      "juz": 29,
      "page": 562
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 5243,
      "textArabic": "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَوٰةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًۭا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ",
      "textArabicTajweed": "ٱلَّذِى خَلَقَ ٱلْ<span class=\"tajweed-ghunnah\">مَ</span>وْتَ وَٱلْحَيَوٰةَ لِيَ<span class=\"tajweed-qalqalah\">بْ</span>لُوَكُمْ أَيُّكُمْ أَحْسَنُ عَ<span class=\"tajweed-ghunnah\">مَ</span>لًۭا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ",
      "transliterationBn": "আল্লাযী খালাক্বাল মাওতা ওয়াল হায়াতা লিইয়াবলুয়াকুম আইয়্যুকুম আহসানু আমালা, ওয়াহুয়াল আযীযুল গাফূর",
      "translationBn": "যিনি সৃষ্টি করেছেন মৃত্যু ও জীবন, তোমাদের পরীক্ষা করার জন্য যে তোমাদের মধ্যে কর্মে কে শ্রেষ্ঠ। আর তিনি পরাক্রমশালী, ক্ষমাশীল।",
      "translationEn": "[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -",
      "juz": 29,
      "page": 562
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 5244,
      "textArabic": "ٱلَّذِى خَلَقَ سَبْعَ سَمَٰوَٰتٍۢ طِبَاقًۭا ۖ مَّا تَرَىٰ فِى خَلْقِ ٱلرَّحْمَٰنِ مِن تَفَٰوُتٍۢ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍۢ",
      "textArabicTajweed": "ٱلَّذِى خَلَقَ سَ<span class=\"tajweed-qalqalah\">بْ</span>عَ سَ<span class=\"tajweed-ghunnah\">مَ</span>ٰوَٰتٍۢ طِبَاقًۭا ۖ <span class=\"tajweed-ghunnah\">مّ</span>َا تَرَىٰ فِى خَلْقِ ٱلرَّحْ<span class=\"tajweed-ghunnah\">مَ</span>ٰنِ مِن تَفَٰوُتٍۢ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍۢ",
      "transliterationBn": "আল্লাযী খালাক্বা সাবআ সামাওয়া-তিন তিবা-ক্বা, মা তারা ফী খালক্বির রাহমা-নি মিন তাফা-উত",
      "translationBn": "যিনি সপ্ত আকাশ স্তরে স্তরে সৃষ্টি করেছেন। পরম করুণাময়ের সৃষ্টিতে আপনি কোনো অসামঞ্জস্য দেখতে পাবেন না।",
      "translationEn": "[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency.",
      "juz": 29,
      "page": 562
    }
  ],
  "94": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6099,
      "textArabic": "أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ",
      "textArabicTajweed": "أَلَمْ <span class=\"tajweed-ghunnah\">نَ</span>شْرَحْ لَكَ صَ<span class=\"tajweed-qalqalah\">دْ</span>رَكَ",
      "transliterationBn": "আলাম নাশরাহ লাকা সাদরাক",
      "translationBn": "আমি কি আপনার বক্ষ আপনার জন্য উন্মুক্ত ও প্রশস্ত করে দেইনি?",
      "translationEn": "Did We not expand for you, [O Muhammad], your breast?",
      "juz": 30,
      "page": 596
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6100,
      "textArabic": "وَوَضَعْنَا عَنكَ وِزْرَكَ",
      "textArabicTajweed": "وَوَضَعْ<span class=\"tajweed-ghunnah\">نَ</span>ا عَنكَ وِزْرَكَ",
      "transliterationBn": "ওয়া ওয়াদা’না আনকা বিযরাক",
      "translationBn": "এবং আমি আপনার ওপর থেকে অপসারিত করেছি আপনার সেই ভারী বোঝা,",
      "translationEn": "And We removed from you your burden",
      "juz": 30,
      "page": 596
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6101,
      "textArabic": "ٱلَّذِىٓ أَنقَضَ ظَهْرَكَ",
      "textArabicTajweed": "ٱلَّذِ<span class=\"tajweed-madd\">ىٓ</span> أَنقَضَ ظَهْرَكَ",
      "transliterationBn": "আল্লাযী আনক্বাদা যাহরাক",
      "translationBn": "যা আপনার পিঠ ভেঙে দিচ্ছিল;",
      "translationEn": "Which had weighed down your back",
      "juz": 30,
      "page": 596
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6102,
      "textArabic": "وَرَفَعْنَا لَكَ ذِكْرَكَ",
      "textArabicTajweed": "وَرَفَعْ<span class=\"tajweed-ghunnah\">نَ</span>ا لَكَ ذِكْرَكَ",
      "transliterationBn": "ওয়া রাফা’না লাকা যিকরাক",
      "translationBn": "এবং আমি আপনার স্মরণ ও মর্যাদাকে সমুন্নত করেছি।",
      "translationEn": "And raised high for you your repute.",
      "juz": 30,
      "page": 596
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6103,
      "textArabic": "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
      "textArabicTajweed": "فَ<span class=\"tajweed-ghunnah\">إِنَّ</span> <span class=\"tajweed-ghunnah\">مَ</span>عَ ٱلْعُسْرِ يُسْرًا",
      "transliterationBn": "ফাইন্না মা’আল ‘উসরি ইউসরা",
      "translationBn": "অতএব নিশ্চয়ই কষ্টের সাথে রয়েছে স্বস্তি;",
      "translationEn": "For indeed, with hardship [will be] ease.",
      "juz": 30,
      "page": 596
    },
    {
      "numberInSurah": 6,
      "numberInQuran": 6104,
      "textArabic": "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">إِنَّ</span> <span class=\"tajweed-ghunnah\">مَ</span>عَ ٱلْعُسْرِ يُسْرًۭا",
      "transliterationBn": "ইন্না মা’আল ‘উসরি ইউসরা",
      "translationBn": "নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।",
      "translationEn": "Indeed, with hardship [will be] ease.",
      "juz": 30,
      "page": 596
    },
    {
      "numberInSurah": 7,
      "numberInQuran": 6105,
      "textArabic": "فَإِذَا فَرَغْتَ فَٱنصَبْ",
      "textArabicTajweed": "فَإِذَا فَرَغْتَ فَٱنصَ<span class=\"tajweed-qalqalah\">بْ</span>",
      "transliterationBn": "ফা ইযা ফারগতা ফানসাব",
      "translationBn": "সুতরাং যখনই আপনি অবসর পান, ইবাদতে কঠোর পরিশ্রম করুন,",
      "translationEn": "So when you have finished [your duties], labor hard [in worship]",
      "juz": 30,
      "page": 596
    },
    {
      "numberInSurah": 8,
      "numberInQuran": 6106,
      "textArabic": "وَإِلَىٰ رَبِّكَ فَٱرْغَب",
      "textArabicTajweed": "وَإِلَىٰ رَبِّكَ فَٱرْغَب",
      "transliterationBn": "ওয়া ইলা রাব্বিকা ফারগাব",
      "translationBn": "এবং কেবল আপনার প্রতিপালকের প্রতিই একাগ্রচিত্তে নিমগ্ন হোন।",
      "translationEn": "And to your Lord direct [your] longing.",
      "juz": 30,
      "page": 596
    }
  ],
  "95": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6107,
      "textArabic": "وَٱلتِّينِ وَٱلزَّيْتُونِ",
      "textArabicTajweed": "وَٱلتِّينِ وَٱلزَّيْتُونِ",
      "transliterationBn": "ওয়াত্তীনি ওয়ায যাইতূন",
      "translationBn": "শপথ আঞ্জির (ডুমুর) ও জলপাইয়ের,",
      "translationEn": "By the fig and the olive",
      "juz": 30,
      "page": 597
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6108,
      "textArabic": "وَطُورِ سِينِينَ",
      "textArabicTajweed": "وَطُورِ سِينِي<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "ওয়া তূরি সীনীন",
      "translationBn": "এবং সিনাই পর্বতের,",
      "translationEn": "And [by] Mount Sinai",
      "juz": 30,
      "page": 597
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6109,
      "textArabic": "وَهَٰذَا ٱلْبَلَدِ ٱلْأَمِينِ",
      "textArabicTajweed": "وَهَٰذَا ٱلْبَلَدِ ٱلْأَمِينِ",
      "transliterationBn": "ওয়া হাযাল বালাদিল আমীন",
      "translationBn": "এবং এই নিরাপদ নগরীর (মক্কার);",
      "translationEn": "And [by] this secure city [Makkah],",
      "juz": 30,
      "page": 597
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6110,
      "textArabic": "لَقَدْ خَلَقْنَا ٱلْإِنسَٰنَ فِىٓ أَحْسَنِ تَقْوِيمٍۢ",
      "textArabicTajweed": "لَقَ<span class=\"tajweed-qalqalah\">دْ</span> خَلَ<span class=\"tajweed-qalqalah\">قْ</span><span class=\"tajweed-ghunnah\">نَ</span>ا ٱلْإِنسَٰ<span class=\"tajweed-ghunnah\">نَ</span> فِ<span class=\"tajweed-madd\">ىٓ</span> أَحْسَنِ تَ<span class=\"tajweed-qalqalah\">قْ</span>وِيمٍۢ",
      "transliterationBn": "লাক্বাদ খালাক্বনাল ইনসানা ফী আহসানি তাক্বওয়ীম",
      "translationBn": "নিশ্চয়ই আমি মানুষকে সৃষ্টি করেছি সর্বোত্তম সুন্দর গঠনে।",
      "translationEn": "We have certainly created man in the best of stature;",
      "juz": 30,
      "page": 597
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6111,
      "textArabic": "ثُمَّ رَدَدْنَٰهُ أَسْفَلَ سَٰفِلِينَ",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">ثُمَّ</span> رَدَ<span class=\"tajweed-qalqalah\">دْ</span><span class=\"tajweed-ghunnah\">نَ</span>ٰهُ أَسْفَلَ سَٰفِلِي<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "ছুম্মা রাদাদনাহু আসফালা সাফিলীন",
      "translationBn": "অতঃপর আমি তাকে নামিয়ে দিয়েছি হীনতমদের সর্বনিম্ন স্তরে,",
      "translationEn": "Then We return him to the lowest of the low,",
      "juz": 30,
      "page": 597
    },
    {
      "numberInSurah": 6,
      "numberInQuran": 6112,
      "textArabic": "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ فَلَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍۢ",
      "textArabicTajweed": "إِلَّا ٱلَّذِي<span class=\"tajweed-ghunnah\">نَ</span> ءَا<span class=\"tajweed-ghunnah\">مَ</span>نُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ فَلَهُمْ أَ<span class=\"tajweed-qalqalah\">جْ</span>رٌ غَيْرُ <span class=\"tajweed-ghunnah\">مَ</span>مْنُونٍۢ",
      "transliterationBn": "ইল্লাল্লাযীনা আমানূ ওয়া আমিলুস সালিহাতি ফালাহুম আজরুন গাইরু মামনূন",
      "translationBn": "কিন্তু তারা নয় যারা ঈমান এনেছে ও সৎকাজ করেছে; তাদের জন্য রয়েছে নিরবচ্ছিন্ন পুরস্কার।",
      "translationEn": "Except for those who believe and do righteous deeds, for they will have a reward uninterrupted.",
      "juz": 30,
      "page": 597
    },
    {
      "numberInSurah": 7,
      "numberInQuran": 6113,
      "textArabic": "فَمَا يُكَذِّبُكَ بَعْدُ بِٱلدِّينِ",
      "textArabicTajweed": "فَ<span class=\"tajweed-ghunnah\">مَ</span>ا يُكَذِّبُكَ بَعْدُ بِٱلدِّينِ",
      "transliterationBn": "ফামা ইউকায্যিবুকা বা’দু বিদ্দীন",
      "translationBn": "অতএব এর পরও কিসে আপনাকে শেষ বিচার দিবস সম্পর্কে অবিশ্বাসী করে?",
      "translationEn": "So what yet causes you to deny the Recompense?",
      "juz": 30,
      "page": 597
    },
    {
      "numberInSurah": 8,
      "numberInQuran": 6114,
      "textArabic": "أَلَيْسَ ٱللَّهُ بِأَحْكَمِ ٱلْحَٰكِمِينَ",
      "textArabicTajweed": "أَلَيْسَ ٱللَّهُ بِأَحْكَمِ ٱلْحَٰكِمِي<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "আলাইসাল্লাহু বিআহকামিল হাকিমীন",
      "translationBn": "আল্লাহ কি বিচারকদের মধ্যে সর্বশ্রেষ্ঠ বিচারক নন?",
      "translationEn": "Is not Allah the most just of judges?",
      "juz": 30,
      "page": 597
    }
  ],
  "97": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6126,
      "textArabic": "إِنَّآ أَنزَلْنَٰهُ فِى لَيْلَةِ ٱلْقَدْرِ",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">إِنَّ</span><span class=\"tajweed-madd\">آ</span> أَنزَلْ<span class=\"tajweed-ghunnah\">نَ</span>ٰهُ فِى لَيْلَةِ ٱلْقَ<span class=\"tajweed-qalqalah\">دْ</span>رِ",
      "transliterationBn": "ইন্না আনযালনাহু ফী লাইলাতিল ক্বাদর",
      "translationBn": "নিশ্চয়ই আমি একে (কুরআন) অবতীর্ণ করেছি মহিমান্বিত রজনীতে;",
      "translationEn": "Indeed, We sent the Quran down during the Night of Decree.",
      "juz": 30,
      "page": 598
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6127,
      "textArabic": "وَمَآ أَدْرَىٰكَ مَا لَيْلَةُ ٱلْقَدْرِ",
      "textArabicTajweed": "وَ<span class=\"tajweed-ghunnah\">مَ</span><span class=\"tajweed-madd\">آ</span> أَ<span class=\"tajweed-qalqalah\">دْ</span>رَىٰكَ <span class=\"tajweed-ghunnah\">مَ</span>ا لَيْلَةُ ٱلْقَ<span class=\"tajweed-qalqalah\">دْ</span>رِ",
      "transliterationBn": "ওয়ামা আদরাকা মা লাইলাতুল ক্বাদর",
      "translationBn": "আর আপনি কি জানেন মহিমান্বিত রজনী কী?",
      "translationEn": "And what can make you know what is the Night of Decree?",
      "juz": 30,
      "page": 598
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6128,
      "textArabic": "لَيْلَةُ ٱلْقَدْرِ خَيْرٌۭ مِّنْ أَلْفِ شَهْرٍۢ",
      "textArabicTajweed": "لَيْلَةُ ٱلْقَ<span class=\"tajweed-qalqalah\">دْ</span>رِ خَيْرٌۭ <span class=\"tajweed-ghunnah\">مِّن</span>ْ أَلْفِ شَهْرٍۢ",
      "transliterationBn": "লাইলাতুল ক্বাদরি খাইরুম মিন আলফি শাহর",
      "translationBn": "মহিমান্বিত রজনী এক হাজার মাসের চেয়েও শ্রেষ্ঠ;",
      "translationEn": "The Night of Decree is better than a thousand months.",
      "juz": 30,
      "page": 598
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6129,
      "textArabic": "تَنَزَّلُ ٱلْمَلَٰٓئِكَةُ وَٱلرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍۢ",
      "textArabicTajweed": "تَ<span class=\"tajweed-ghunnah\">نَ</span>زَّلُ ٱلْ<span class=\"tajweed-ghunnah\">مَ</span>لَٰٓئِكَةُ وَٱلرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم <span class=\"tajweed-ghunnah\">مِّن</span> كُلِّ أَمْرٍۢ",
      "transliterationBn": "তানাযযালুল মালা-ইকাতু ওয়ার রূহু ফীহা বিইযনি রাব্বিহিম মিন কুল্লি আমর",
      "translationBn": "তাতে ফেরেশতাগণ ও রূহ (জিবরাঈল) তাঁদের প্রতিপালকের অনুমতিক্রমে প্রত্যেক কল্যাণময় কাজের জন্য অবতীর্ণ হন;",
      "translationEn": "The angels and the Spirit descend therein by permission of their Lord for every matter.",
      "juz": 30,
      "page": 598
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6130,
      "textArabic": "سَلَٰمٌ هِىَ حَتَّىٰ مَطْلَعِ ٱلْفَجْرِ",
      "textArabicTajweed": "سَلَٰمٌ هِىَ حَتَّىٰ <span class=\"tajweed-ghunnah\">مَ</span><span class=\"tajweed-qalqalah\">طْ</span>لَعِ ٱلْفَ<span class=\"tajweed-qalqalah\">جْ</span>رِ",
      "transliterationBn": "সালামুন হিয়া হাত্তা মাতলাইল ফাজর",
      "translationBn": "শান্তিময় এ রাত, ফজর উদিত হওয়া পর্যন্ত।",
      "translationEn": "Peace it is until the emergence of dawn.",
      "juz": 30,
      "page": 598
    }
  ],
  "103": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6177,
      "textArabic": "وَٱلْعَصْرِ",
      "textArabicTajweed": "وَٱلْعَصْرِ",
      "transliterationBn": "ওয়াল ‘আসর",
      "translationBn": "কালের শপথ,",
      "translationEn": "By time,",
      "juz": 30,
      "page": 601
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6178,
      "textArabic": "إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">إِنَّ</span> ٱلْإِنسَٰ<span class=\"tajweed-ghunnah\">نَ</span> لَفِى خُسْرٍ",
      "transliterationBn": "ইন্নাল ইনসানা লাফী খুসর",
      "translationBn": "নিশ্চয়ই সমগ্র মানবজাতি চরম ক্ষতির মধ্যে নিমজ্জিত;",
      "translationEn": "Indeed, mankind is in loss,",
      "juz": 30,
      "page": 601
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6179,
      "textArabic": "إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ",
      "textArabicTajweed": "إِلَّا ٱلَّذِي<span class=\"tajweed-ghunnah\">نَ</span> ءَا<span class=\"tajweed-ghunnah\">مَ</span>نُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّ<span class=\"tajweed-qalqalah\">بْ</span>رِ",
      "transliterationBn": "ইল্লাল্লাযীনা আমানূ ওয়া ‘আমিলুস সালিহাতি ওয়া তাওয়াসাও বিল হাক্কি ওয়া তাওয়াসাও বিস সাবর",
      "translationBn": "তারা ব্যতীত যারা ঈমান এনেছে, সৎকাজ করেছে এবং পরস্পরকে সত্যের উপদেশ ও ধৈর্যের উপদেশ দিয়েছে।",
      "translationEn": "Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.",
      "juz": 30,
      "page": 601
    }
  ],
  "105": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6189,
      "textArabic": "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَٰبِ ٱلْفِيلِ",
      "textArabicTajweed": "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَٰبِ ٱلْفِيلِ",
      "transliterationBn": "আলাম তারা কাইফা ফাআলা রাব্বুকা বিআসহাবিল ফিল",
      "translationBn": "আপনি কি দেখেননি আপনার প্রতিপালক হস্তীবাহিনীর সাথে কিরূপ আচরণ করেছিলেন?",
      "translationEn": "Have you not considered how your Lord dealt with the companions of the elephant?",
      "juz": 30,
      "page": 601
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6190,
      "textArabic": "أَلَمْ يَجْعَلْ كَيْدَهُمْ فِى تَضْلِيلٍۢ",
      "textArabicTajweed": "أَلَمْ يَ<span class=\"tajweed-qalqalah\">جْ</span>عَلْ كَيْدَهُمْ فِى تَضْلِيلٍۢ",
      "transliterationBn": "আলাম ইয়াজআল কাইদাহুম ফী তাদ্বলীল",
      "translationBn": "তিনি কি তাদের চক্রান্ত ব্যর্থ করে দেননি?",
      "translationEn": "Did He not make their plan into misguidance?",
      "juz": 30,
      "page": 601
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6191,
      "textArabic": "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ",
      "textArabicTajweed": "وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ",
      "transliterationBn": "ওয়া আরসালা আলাইহিম তাইরান আবাবীল",
      "translationBn": "এবং তাদের ওপর প্রেরণ করেছিলেন ঝাঁকে ঝাঁকে আবাবিল পাখি,",
      "translationEn": "And He sent against them birds in flocks,",
      "juz": 30,
      "page": 601
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6192,
      "textArabic": "تَرْمِيهِم بِحِجَارَةٍۢ مِّن سِجِّيلٍۢ",
      "textArabicTajweed": "تَرْمِيهِم بِحِجَارَةٍۢ <span class=\"tajweed-ghunnah\">مِّن</span> سِجِّيلٍۢ",
      "transliterationBn": "তারমীহিম বিহিজারাতিম মিন সিজ্জীল",
      "translationBn": "যা তাদের ওপর নিক্ষেপ করেছিল পোড়ামাটির কঙ্কর;",
      "translationEn": "Striking them with stones of hard clay,",
      "juz": 30,
      "page": 601
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6193,
      "textArabic": "فَجَعَلَهُمْ كَعَصْفٍۢ مَّأْكُولٍۭ",
      "textArabicTajweed": "فَجَعَلَهُمْ كَعَصْفٍۢ <span class=\"tajweed-ghunnah\">مّ</span>َأْكُولٍۭ",
      "transliterationBn": "ফাজাআলাহুম কাআসফিম মা’কূল",
      "translationBn": "অতঃপর তিনি তাদের চর্বিত ঘাস-ভূষির মতো করে দিলেন।",
      "translationEn": "And He made them like eaten straw.",
      "juz": 30,
      "page": 601
    }
  ],
  "106": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6194,
      "textArabic": "لِإِيلَٰفِ قُرَيْشٍ",
      "textArabicTajweed": "لِإِيلَٰفِ قُرَيْشٍ",
      "transliterationBn": "লিঈলাফি কুরাইশ",
      "translationBn": "যেহেতু কুরাইশদের মধ্যে প্রীতি সৃষ্টি হয়েছে,",
      "translationEn": "For the accustomed security of the Quraysh -",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6195,
      "textArabic": "إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ",
      "textArabicTajweed": "إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَ<span class=\"tajweed-madd\">آ</span>ءِ وَٱلصَّيْفِ",
      "transliterationBn": "ঈলাফিহিম রিহলাতাশ শিতা-ই ওয়াসসাইফ",
      "translationBn": "শীত ও গ্রীষ্মকালীন সফরের নিরাপত্তার জন্য;",
      "translationEn": "Their accustomed security [in] the caravan of winter and summer -",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6196,
      "textArabic": "فَلْيَعْبُدُوا۟ رَبَّ هَٰذَا ٱلْبَيْتِ",
      "textArabicTajweed": "فَلْيَعْبُدُوا۟ رَبَّ هَٰذَا ٱلْبَيْتِ",
      "transliterationBn": "ফালইয়া’বুদূ রাব্বা হাযাল বাইত",
      "translationBn": "সুতরাং তারা যেন এই ঘরের (কাবার) প্রতিপালকের ইবাদত করে,",
      "translationEn": "Let them worship the Lord of this House,",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6197,
      "textArabic": "ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍۢ وَءَامَنَهُم مِّنْ خَوْفٍۭ",
      "textArabicTajweed": "ٱلَّذِ<span class=\"tajweed-madd\">ىٓ</span> أَ<span class=\"tajweed-qalqalah\">طْ</span>عَ<span class=\"tajweed-ghunnah\">مَ</span>هُم <span class=\"tajweed-ghunnah\">مِّن</span> جُوعٍۢ وَءَا<span class=\"tajweed-ghunnah\">مَ</span><span class=\"tajweed-ghunnah\">نَ</span>هُم <span class=\"tajweed-ghunnah\">مِّن</span>ْ خَوْفٍۭ",
      "transliterationBn": "আল্লাযী আত’আমাহুম মিন জূইঁও ওয়া আমানাহুম মিন খাওফ",
      "translationBn": "যিনি তাদের ক্ষুধায় অন্ন দিয়েছেন এবং ভয় থেকে তাদের নিরাপদ রেখেছেন।",
      "translationEn": "Who has fed them, [saving them] from hunger and made them safe, [saving them] from fear.",
      "juz": 30,
      "page": 602
    }
  ],
  "107": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6198,
      "textArabic": "أَرَءَيْتَ ٱلَّذِى يُكَذِّبُ بِٱلدِّينِ",
      "textArabicTajweed": "أَرَءَيْتَ ٱلَّذِى يُكَذِّبُ بِٱلدِّينِ",
      "transliterationBn": "আরাআইতাল্লাযী ইউকায্যিবু বিদ্দীন",
      "translationBn": "আপনি কি দেখেছেন তাকে, যে শেষ বিচারকে অস্বীকার করে?",
      "translationEn": "Have you seen the one who denies the Recompense?",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6199,
      "textArabic": "فَذَٰلِكَ ٱلَّذِى يَدُعُّ ٱلْيَتِيمَ",
      "textArabicTajweed": "فَذَٰلِكَ ٱلَّذِى يَدُعُّ ٱلْيَتِي<span class=\"tajweed-ghunnah\">مَ</span>",
      "transliterationBn": "ফাযা-লিকাল্লাযী ইয়াদু’উল ইয়াতীম",
      "translationBn": "সে তো সেই ব্যক্তি, যে এতিমকে রূঢ়ভাবে তাড়িয়ে দেয়;",
      "translationEn": "For that is the one who drives away the orphan",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6200,
      "textArabic": "وَلَا يَحُضُّ عَلَىٰ طَعَامِ ٱلْمِسْكِينِ",
      "textArabicTajweed": "وَلَا يَحُضُّ عَلَىٰ طَعَامِ ٱلْمِسْكِينِ",
      "transliterationBn": "ওয়ালা ইয়াহুদ্দু ‘আলা তা’আমিল মিসকীন",
      "translationBn": "এবং মিসকিনকে অন্নদানে উৎসাহিত করে না।",
      "translationEn": "And does not encourage the feeding of the poor.",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6201,
      "textArabic": "فَوَيْلٌۭ لِّلْمُصَلِّينَ",
      "textArabicTajweed": "فَوَيْلٌۭ لِّلْمُصَلِّي<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "ফাওয়াইলুল লিল-মুসাল্লীন",
      "translationBn": "অতএব দুর্ভোগ সেই নামাজীদের জন্য,",
      "translationEn": "So woe to those who pray",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6202,
      "textArabic": "ٱلَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ",
      "textArabicTajweed": "ٱلَّذِي<span class=\"tajweed-ghunnah\">نَ</span> هُمْ عَن صَلَاتِهِمْ سَاهُو<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "আল্লাযীনা হুম ‘আন সালা-তিহিম সাহূন",
      "translationBn": "যারা তাদের নামাজের ব্যাপারে উদাসীন ও অমনোযোগী;",
      "translationEn": "[But] who are heedless of their prayer -",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 6,
      "numberInQuran": 6203,
      "textArabic": "ٱلَّذِينَ هُمْ يُرَآءُونَ",
      "textArabicTajweed": "ٱلَّذِي<span class=\"tajweed-ghunnah\">نَ</span> هُمْ يُرَ<span class=\"tajweed-madd\">آ</span>ءُو<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "আল্লাযীনা হুম ইউরা-ঊন",
      "translationBn": "যারা কেবল লোক দেখানোর জন্য কাজ করে,",
      "translationEn": "Those who make a show [of their deeds]",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 7,
      "numberInQuran": 6204,
      "textArabic": "وَيَمْنَعُونَ ٱلْمَاعُونَ",
      "textArabicTajweed": "وَيَمْ<span class=\"tajweed-ghunnah\">نَ</span>عُو<span class=\"tajweed-ghunnah\">نَ</span> ٱلْ<span class=\"tajweed-ghunnah\">مَ</span>اعُو<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "ওয়া ইয়ামনা’ঊনাল মা’ঊন",
      "translationBn": "এবং নিত্য প্রয়োজনীয় ছোটখাটো সাহায্য দানেও বিরত থাকে।",
      "translationEn": "And withhold [simple] assistance.",
      "juz": 30,
      "page": 602
    }
  ],
  "108": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6205,
      "textArabic": "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">إِنَّ</span><span class=\"tajweed-madd\">آ</span> أَعْطَيْ<span class=\"tajweed-ghunnah\">نَ</span>ٰكَ ٱلْكَوْثَرَ",
      "transliterationBn": "ইন্না আ’তায়নাকাল কাওসার",
      "translationBn": "নিশ্চয়ই আমি আপনাকে কাউসার (প্রভূত কল্যাণ) দান করেছি।",
      "translationEn": "Indeed, We have granted you, [O Muhammad], al-Kawthar.",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6206,
      "textArabic": "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ",
      "textArabicTajweed": "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ",
      "transliterationBn": "ফাসাল্লি লিরাব্বিকা ওয়ানহার",
      "translationBn": "অতএব আপনি আপনার প্রতিপালকের উদ্দেশ্যে নামাজ পড়ুন এবং কুরবানি করুন।",
      "translationEn": "So pray to your Lord and sacrifice [to Him alone].",
      "juz": 30,
      "page": 602
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6207,
      "textArabic": "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">إِنَّ</span> شَانِئَكَ هُوَ ٱلْأَ<span class=\"tajweed-qalqalah\">بْ</span>تَرُ",
      "transliterationBn": "ইন্না শানি’আকা হুয়াল আবতার",
      "translationBn": "নিশ্চয়ই আপনার শত্রুই তো নির্বংশ, শিকড়হীন।",
      "translationEn": "Indeed, your enemy is the one cut off.",
      "juz": 30,
      "page": 602
    }
  ],
  "109": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6205,
      "textArabic": "قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ",
      "textArabicTajweed": "قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُو<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "কুল ইয়া আইয়্যুহাল কাফিরূন",
      "translationBn": "বলুন: হে কাফের সম্প্রদায়!",
      "translationEn": "Say, \"O disbelievers,",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6206,
      "textArabic": "لَآ أَعْبُدُ مَا تَعْبُدُونَ",
      "textArabicTajweed": "لَ<span class=\"tajweed-madd\">آ</span> أَعْبُدُ <span class=\"tajweed-ghunnah\">مَ</span>ا تَعْبُدُو<span class=\"tajweed-ghunnah\">نَ</span>",
      "transliterationBn": "লা আ’বুদু মা তা’বুদূন",
      "translationBn": "আমি তার ইবাদত করি না যার ইবাদত তোমরা করো;",
      "translationEn": "I do not worship what you worship.",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6207,
      "textArabic": "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ",
      "textArabicTajweed": "وَلَ<span class=\"tajweed-madd\">آ</span> أَنتُمْ عَٰبِدُو<span class=\"tajweed-ghunnah\">نَ</span> <span class=\"tajweed-ghunnah\">مَ</span><span class=\"tajweed-madd\">آ</span> أَعْبُدُ",
      "transliterationBn": "ওয়া লা আনতুম আবিদূনা মা আ’বুদ",
      "translationBn": "এবং তোমরাও তার ইবাদতকারী নও যাঁর ইবাদত আমি করি;",
      "translationEn": "Nor are you worshippers of what I worship.",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6208,
      "textArabic": "وَلَآ أَنَا۠ عَابِدٌۭ مَّا عَبَدتُّمْ",
      "textArabicTajweed": "وَلَ<span class=\"tajweed-madd\">آ</span> أَ<span class=\"tajweed-ghunnah\">نَ</span>ا۠ عَابِدٌۭ <span class=\"tajweed-ghunnah\">مّ</span>َا عَبَدتُّمْ",
      "transliterationBn": "ওয়া লা আনা আবিদুম মা আবাত্তুম",
      "translationBn": "আর আমি তার ইবাদতকারী হব না যার ইবাদত তোমরা করেছ;",
      "translationEn": "Nor will I be a worshipper of what you worship.",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6209,
      "textArabic": "وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ",
      "textArabicTajweed": "وَلَ<span class=\"tajweed-madd\">آ</span> أَنتُمْ عَٰبِدُو<span class=\"tajweed-ghunnah\">نَ</span> <span class=\"tajweed-ghunnah\">مَ</span><span class=\"tajweed-madd\">آ</span> أَعْبُدُ",
      "transliterationBn": "ওয়া লা আনতুম আবিদূনা মা আ’বুদ",
      "translationBn": "এবং তোমরাও তার ইবাদতকারী নও যাঁর ইবাদত আমি করি;",
      "translationEn": "Nor will you be worshippers of what I worship.",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 6,
      "numberInQuran": 6210,
      "textArabic": "لَكُمْ دِينُكُمْ وَلِىَ دِينِ",
      "textArabicTajweed": "لَكُمْ دِينُكُمْ وَلِىَ دِينِ",
      "transliterationBn": "লাকুম দীনুকুম ওয়ালিয়া দীন",
      "translationBn": "তোমাদের দ্বীন তোমাদের জন্য, আর আমার দ্বীন আমার জন্য।",
      "translationEn": "For you is your religion, and for me is my religion.\"",
      "juz": 30,
      "page": 603
    }
  ],
  "110": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6211,
      "textArabic": "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ",
      "textArabicTajweed": "إِذَا جَ<span class=\"tajweed-madd\">آ</span>ءَ <span class=\"tajweed-ghunnah\">نَ</span>صْرُ ٱللَّهِ وَٱلْفَتْحُ",
      "transliterationBn": "ইযা জা-আ নাসরুল্লাহি ওয়াল ফাতহ",
      "translationBn": "যখন আল্লাহর সাহায্য ও বিজয় উপস্থিত হবে,",
      "translationEn": "When the victory of Allah has come and the conquest,",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6212,
      "textArabic": "وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًۭا",
      "textArabicTajweed": "وَرَأَيْتَ ٱل<span class=\"tajweed-ghunnah\">نّ</span>َاسَ يَ<span class=\"tajweed-qalqalah\">دْ</span>خُلُو<span class=\"tajweed-ghunnah\">نَ</span> فِى دِينِ ٱللَّهِ أَفْوَاجًۭا",
      "transliterationBn": "ওয়া রাআইতান না-সা ইয়াদখুলূনা ফী দীনিল্লাহি আফওয়াজা",
      "translationBn": "এবং আপনি মানুষকে দলে দলে আল্লাহর দ্বীনে প্রবেশ করতে দেখবেন,",
      "translationEn": "And you see the people entering into the religion of Allah in multitudes,",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6213,
      "textArabic": "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ ۚ إِنَّهُۥ كَانَ تَوَّابًۢا",
      "textArabicTajweed": "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ ۚ <span class=\"tajweed-ghunnah\">إِنَّ</span>هُۥ كَا<span class=\"tajweed-ghunnah\">نَ</span> تَوَّابًۢا",
      "transliterationBn": "ফাসাব্বিহ বিহামদি রাব্বিকা ওয়াসতাগফিরহু, ইন্নাহু কা-না তাওওয়াবা",
      "translationBn": "তখন আপনার প্রতিপালকের প্রশংসার সাথে তাসবীহ পাঠ করুন এবং তাঁর কাছে ক্ষমা প্রার্থনা করুন; নিশ্চয়ই তিনি তওবা কবুলকারী।",
      "translationEn": "Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.",
      "juz": 30,
      "page": 603
    }
  ],
  "111": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6214,
      "textArabic": "تَبَّتْ يَدَآ أَبِى لَهَبٍۢ وَتَبَّ",
      "textArabicTajweed": "تَبَّتْ يَدَ<span class=\"tajweed-madd\">آ</span> أَبِى لَهَبٍۢ وَتَبَّ",
      "transliterationBn": "তাব্বাত ইয়াদা আবী লাহাবিঁও ওয়াতাব্ব",
      "translationBn": "ধ্বংস হোক আবু লাহাবের দুই হাত এবং ধ্বংস হোক সে নিজেও!",
      "translationEn": "May the hands of Abu Lahab be ruined, and ruined is he.",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6215,
      "textArabic": "مَآ أَغْنَىٰ عَنْهُ مَالُهُۥ وَمَا كَسَبَ",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">مَ</span><span class=\"tajweed-madd\">آ</span> أَغْ<span class=\"tajweed-ghunnah\">نَ</span>ىٰ عَنْهُ <span class=\"tajweed-ghunnah\">مَ</span>الُهُۥ وَ<span class=\"tajweed-ghunnah\">مَ</span>ا كَسَبَ",
      "transliterationBn": "মা আগনা আনহু মালুহু ওয়ামা কাসাব",
      "translationBn": "তার ধন-সম্পদ ও তার উপার্জন তার কোনো কাজে আসেনি।",
      "translationEn": "His wealth will not avail him or that which he gained.",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6216,
      "textArabic": "سَيَصْلَىٰ نَارًۭا ذَاتَ لَهَبٍۢ",
      "textArabicTajweed": "سَيَصْلَىٰ <span class=\"tajweed-ghunnah\">نَ</span>ارًۭا ذَاتَ لَهَبٍۢ",
      "transliterationBn": "সাইয়াসলা নারান যা-তা লাহাব",
      "translationBn": "অচিরেই সে লেলিহান আগুনে প্রবেশ করবে,",
      "translationEn": "He will [enter to] burn in a Fire of [blazing] flame",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6217,
      "textArabic": "وَٱمْرَأَتُهُۥ حَمَّالَةَ ٱلْحَطَبِ",
      "textArabicTajweed": "وَٱمْرَأَتُهُۥ حَ<span class=\"tajweed-ghunnah\">مّ</span>َالَةَ ٱلْحَطَبِ",
      "transliterationBn": "ওয়ামরাআতুহু হাম্মা-লাতাল হাতাব",
      "translationBn": "এবং তার স্ত্রীও—যে কাঠ বহনকারিণী,",
      "translationEn": "And his wife [as well] - the carrier of firewood.",
      "juz": 30,
      "page": 603
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6218,
      "textArabic": "فِى جِيدِهَا حَبْلٌۭ مِّن مَّسَدٍۭ",
      "textArabicTajweed": "فِى جِيدِهَا حَ<span class=\"tajweed-qalqalah\">بْ</span>لٌۭ <span class=\"tajweed-ghunnah\">مِّن</span> <span class=\"tajweed-ghunnah\">مّ</span>َسَدٍۭ",
      "transliterationBn": "ফী জীদিহা হাবলুম মিম মাসাদ",
      "translationBn": "তার গলায় থাকবে পাকানো শক্ত রশি।",
      "translationEn": "Around her neck is a rope of [twisted] fiber.",
      "juz": 30,
      "page": 603
    }
  ],
  "112": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6222,
      "textArabic": "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
      "textArabicTajweed": "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
      "transliterationBn": "ক্বুল হুয়াল্লাহু আহাদ",
      "translationBn": "বলুন: তিনিই আল্লাহ, একক ও অদ্বিতীয়।",
      "translationEn": "Say, \"He is Allah, [who is] One,",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6223,
      "textArabic": "ٱللَّهُ ٱلصَّمَدُ",
      "textArabicTajweed": "ٱللَّهُ ٱلصَّ<span class=\"tajweed-ghunnah\">مَ</span>دُ",
      "transliterationBn": "আল্লাহুস সামাদ",
      "translationBn": "আল্লাহ অমুখাপেক্ষী (সকলের ভরসা)।",
      "translationEn": "Allah, the Eternal Refuge.",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6224,
      "textArabic": "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      "textArabicTajweed": "لَمْ يَلِ<span class=\"tajweed-qalqalah\">دْ</span> وَلَمْ يُولَ<span class=\"tajweed-qalqalah\">دْ</span>",
      "transliterationBn": "লাম ইয়ালিদ ওয়া লাম ইউলাদ",
      "translationBn": "তিনি কাউকে জন্ম দেননি এবং তাঁকেও কেউ জন্ম দেয়নি।",
      "translationEn": "He neither begets nor is born,",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6225,
      "textArabic": "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
      "textArabicTajweed": "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
      "transliterationBn": "ওয়া লাম ইয়াকুল্লাহু কুফুওয়ান আহাদ",
      "translationBn": "এবং তাঁর সমতুল্য কেউই নেই।",
      "translationEn": "Nor is there to Him any equivalent.\"",
      "juz": 30,
      "page": 604
    }
  ],
  "113": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6226,
      "textArabic": "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
      "textArabicTajweed": "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
      "transliterationBn": "ক্বুল আ’ঊযু বিরাব্বিল ফালাক্ব",
      "translationBn": "বলুন: আমি আশ্রয় প্রার্থনা করছি প্রভাত-রবের কাছে,",
      "translationEn": "Say, \"I seek refuge in the Lord of daybreak",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6227,
      "textArabic": "مِن شَرِّ مَا خَلَقَ",
      "textArabicTajweed": "مِن شَرِّ <span class=\"tajweed-ghunnah\">مَ</span>ا خَلَقَ",
      "transliterationBn": "মিন শাররি মা খালাক্ব",
      "translationBn": "তিনি যা সৃষ্টি করেছেন তার অনিষ্ট হতে,",
      "translationEn": "From the evil of that which He created",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6228,
      "textArabic": "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      "textArabicTajweed": "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
      "transliterationBn": "ওয়া মিন শাররি গাসিক্বিন ইযা ওয়াক্বাব",
      "translationBn": "এবং অন্ধকার রাতের অনিষ্ট হতে যখন তা সমাগত হয়,",
      "translationEn": "And from the evil of darkness when it settles",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6229,
      "textArabic": "وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ",
      "textArabicTajweed": "وَمِن شَرِّ ٱل<span class=\"tajweed-ghunnah\">نّ</span>َفَّٰثَٰتِ فِى ٱلْعُقَدِ",
      "transliterationBn": "ওয়া মিন শাররিন নাফ্ফাছাতি ফিল ‘উক্বাদ",
      "translationBn": "এবং গ্রন্থিতে ফুঁৎকার প্রদানকারী নারীদের (জাদুকরদের) অনিষ্ট হতে,",
      "translationEn": "And from the evil of the blowers in knots",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6230,
      "textArabic": "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      "textArabicTajweed": "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
      "transliterationBn": "ওয়া মিন শাররি হাসিদিন ইযা হাসাদ",
      "translationBn": "এবং হিংসুকের অনিষ্ট হতে যখন সে হিংসা করে।",
      "translationEn": "And from the evil of an envier when he envies.\"",
      "juz": 30,
      "page": 604
    }
  ],
  "114": [
    {
      "numberInSurah": 1,
      "numberInQuran": 6231,
      "textArabic": "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
      "textArabicTajweed": "قُلْ أَعُوذُ بِرَبِّ ٱل<span class=\"tajweed-ghunnah\">نّ</span>َاسِ",
      "transliterationBn": "ক্বুল আ’ঊযু বিরাব্বিন নাস",
      "translationBn": "বলুন: আমি আশ্রয় প্রার্থনা করছি মানুষের প্রতিপালকের কাছে,",
      "translationEn": "Say, \"I seek refuge in the Lord of mankind,",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 2,
      "numberInQuran": 6232,
      "textArabic": "مَلِكِ ٱلنَّاسِ",
      "textArabicTajweed": "<span class=\"tajweed-ghunnah\">مَ</span>لِكِ ٱل<span class=\"tajweed-ghunnah\">نّ</span>َاسِ",
      "transliterationBn": "মালিকিন নাস",
      "translationBn": "মানুষের অধিপতির কাছে,",
      "translationEn": "The Sovereign of mankind.",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 3,
      "numberInQuran": 6233,
      "textArabic": "إِلَٰهِ ٱلنَّاسِ",
      "textArabicTajweed": "إِلَٰهِ ٱل<span class=\"tajweed-ghunnah\">نّ</span>َاسِ",
      "transliterationBn": "ইলাহিন নাস",
      "translationBn": "মানুষের প্রকৃত উপাস্যের কাছে,",
      "translationEn": "The God of mankind,",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 4,
      "numberInQuran": 6234,
      "textArabic": "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ",
      "textArabicTajweed": "مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَ<span class=\"tajweed-ghunnah\">نّ</span>َاسِ",
      "transliterationBn": "মিন শাররিল ওয়াসওয়াসিল খান্নাস",
      "translationBn": "আত্মগোপনকারী কুমন্ত্রণাদাতার অনিষ্ট হতে,",
      "translationEn": "From the evil of the retreating whisperer -",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 5,
      "numberInQuran": 6235,
      "textArabic": "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ",
      "textArabicTajweed": "ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱل<span class=\"tajweed-ghunnah\">نّ</span>َاسِ",
      "transliterationBn": "আল্লাযী ইয়ুওয়াসউইসু ফী সুদূরিন নাস",
      "translationBn": "যে মানুষের অন্তরে কুমন্ত্রণা দেয়,",
      "translationEn": "Who whispers [evil] into the breasts of mankind -",
      "juz": 30,
      "page": 604
    },
    {
      "numberInSurah": 6,
      "numberInQuran": 6236,
      "textArabic": "مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
      "textArabicTajweed": "مِ<span class=\"tajweed-ghunnah\">نَ</span> ٱلْجِ<span class=\"tajweed-ghunnah\">نّ</span>َةِ وَٱل<span class=\"tajweed-ghunnah\">نّ</span>َاسِ",
      "transliterationBn": "মিনাল জিন্নাতি ওয়ান নাস",
      "translationBn": "জ্বিন ও মানুষের মধ্য হতে।",
      "translationEn": "From among the jinn and mankind.\"",
      "juz": 30,
      "page": 604
    }
  ]
};

// Universal helper to strip any leading Bismillah from Ayah 1 of Surahs 2-114
export function stripBismillahPrefix(text: string): string {
  if (!text) return '';
  // Match any Bismillah prefix up to the end of Ar-Raheem / Al-Raheem with any unicode variation or diacritics
  const cleaned = text
    .replace(/^[\s\uFEFF\u200B\u200C]*بِ?سْ?مِ?[\s\S]*?(?:ٱلرَّحِيمِ|الرَّحِيمِ|ٱلرَّحِيْمِ|الرَّحِيمِ|الرحيم|ٱلرحيم)[\s\u06D6-\u06ED]*/u, '')
    .trim();
  return cleaned || text;
}

// Converts complex/archaic Quranic diacritics into crystal-clear, standard readable Uthmani Arabic
export function normalizeQuranArabic(text: string): string {
  if (!text) return '';
  return text
    // Replace archaic Quranic head of khah with standard clear circular sukun (so it never looks like a pesh)
    .replace(/\u06E1/g, '\u0652')
    // Remove small low meem / iqlab markers that distort tanween into weird shapes
    .replace(/\u06ED/g, '')
    // Also remove small high meem if directly attached to tanween
    .replace(/([\u064B\u064C\u064D])\u06E2/g, '$1')
    // Normalize archaic small high madda to standard madda
    .replace(/\u06E4/g, '\u0653')
    // Remove zero-width non-breaking spaces or BOM
    .replace(/[\uFEFF\u200B\u200C]/g, '')
    .trim();
}

// Universal helper to strip redundant Bismillah translation from Ayah 1 of Surahs 2-114
export function stripBismillahFromTranslation(text: string, lang: 'bn' | 'en'): string {
  if (!text) return '';
  if (lang === 'bn') {
    return text
      .replace(/^[\s\uFEFF]*(?:শুরু\s+করছি\s+আল্লাহর\s+নামে\s+যিনি\s+পরম\s+করুণাময়[,\s]+অতি\s+দয়ালু[।\.]?\s*|বিসমিল্লাহির\s+রাহমানির\s+রাহিম[।\.]?\s*)/, '')
      .trim();
  }
  return text
    .replace(/^[\s\uFEFF]*(?:In the name of Allah[,\s]+(?:the Entirely Merciful[,\s]+the Especially Merciful|Most Gracious[,\s]+Most Merciful|the Lord of Mercy[,\s]+the Giver of Mercy)[।\.]?\s*)/i, '')
    .trim();
}

// Asynchronous loader for fetching any of the 114 Surahs from open Quran API with caching
const SURAH_CACHE = new Map<number, AyahItem[]>();

export async function fetchSurahAyahs(surahNumber: number): Promise<AyahItem[]> {
  // If in curated offline dataset, return immediately
  if (CURATED_SURAH_DATA[surahNumber]) {
    return CURATED_SURAH_DATA[surahNumber];
  }

  // If in memory cache, return
  if (SURAH_CACHE.has(surahNumber)) {
    return SURAH_CACHE.get(surahNumber)!;
  }

  // Check persistent offline cache in localStorage (v8 cache key to ensure cleanly stripped Bismillah & normalized Harakats)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`noor_quran_surah_cache_v8_${surahNumber}`);
      if (stored) {
        const parsed = JSON.parse(stored) as AyahItem[];
        SURAH_CACHE.set(surahNumber, parsed);
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  try {
    // Fetch authentic Madinah Mushaf Arabic text with COMPLETE Tashkeel & Harakat (quran-uthmani),
    // English transliteration (en.transliteration), Bengali translation (bn.bengali) and English translation (en.sahih)
    const resp = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.transliteration,bn.bengali,en.sahih`
    );
    if (!resp.ok) throw new Error('Failed to fetch surah data');
    const json = await resp.json();
    
    if (json.data && Array.isArray(json.data) && json.data.length >= 3) {
      const arabicAyahs = json.data[0].ayahs;
      const transliterationAyahs = json.data[1].ayahs;
      const bengaliAyahs = json.data[2].ayahs;
      const englishAyahs = json.data[3]?.ayahs || [];

      const items: AyahItem[] = arabicAyahs.map((ar: { numberInSurah: number; number: number; text: string; juz: number; page: number; sajdah: boolean }, idx: number) => {
        let textAr = normalizeQuranArabic(ar.text);
        let rawTransliteration = transliterationAyahs[idx]?.text || '';
        let bnTranslation = bengaliAyahs[idx]?.text || '';
        let enTranslation = englishAyahs[idx]?.text || '';

        // For Surahs 2-114, strip repeated Bismillah prefix from Ayah 1 (as Bismillah header is already shown above)
        if (surahNumber !== 1 && (idx === 0 || /^[\s\uFEFF]*بِ?سْ?مِ?/u.test(textAr))) {
          textAr = stripBismillahPrefix(textAr);
          rawTransliteration = rawTransliteration
            .replace(/^Bismillaahir[ -]Rahmaanir[ -]Raheem\s*/i, '')
            .replace(/^Bismil-laahir[ -]Rahmaanir[ -]Raheem\s*/i, '')
            .replace(/^In the name of Allah[,\.]?\s*/i, '')
            .trim();
          bnTranslation = stripBismillahFromTranslation(bnTranslation, 'bn');
          enTranslation = stripBismillahFromTranslation(enTranslation, 'en');
        }

        // Generate authentic, pristine Bengali pronunciation with full vocalization
        const bnPronunciation = getBengaliPronunciation(
          surahNumber,
          ar.numberInSurah,
          textAr,
          rawTransliteration
        );

        // Precise automatic Tajweed markup parser:
        // Highlights nun/meem shaddah (ghunnah), qalqalah letters with sukun, madd
        // Note: Keep base character with combining diacritics attached together so font rendering is never broken
        const tajweedAr = textAr
          .replace(/(إِنَّ|أَنَّ|ثُمَّ|عَمَّ|مِّن|مَّآ|[نم][َّّ])/g, '<span class="tajweed-ghunnah">$1</span>')
          .replace(/([قطبجد][ْۡ])/g, '<span class="tajweed-qalqalah">$1</span>')
          .replace(/([ء-يٱ-ۓ][\u064B-\u065F\u0670]?[\u0653\u06E4]|آ|ۤ)/g, '<span class="tajweed-madd">$1</span>');

        return {
          numberInSurah: ar.numberInSurah,
          numberInQuran: ar.number,
          textArabic: textAr,
          textArabicTajweed: tajweedAr,
          transliterationBn: bnPronunciation,
          translationBn: bnTranslation,
          translationEn: enTranslation,
          juz: ar.juz,
          page: ar.page,
          isSajdah: !!ar.sajdah,
        };
      });

      SURAH_CACHE.set(surahNumber, items);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`noor_quran_surah_cache_v8_${surahNumber}`, JSON.stringify(items));
        } catch {
          // ignore quota limits
        }
      }
      return items;
    }
  } catch (err) {
    console.warn(`Could not fetch live surah ${surahNumber}:`, err);
  }

  // Complete Offline Fallback for any of the 114 Surahs
  const offlineAyahs = generateOfflineSurahAyahs(surahNumber);
  SURAH_CACHE.set(surahNumber, offlineAyahs);
  return offlineAyahs;
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
function toArabicDigits(n: number | string): string {
  return n.toString().split('').map(c => ARABIC_DIGITS[parseInt(c, 10)] || c).join('');
}

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
function toBengaliDigits(n: number | string): string {
  return n.toString().split('').map(c => BENGALI_DIGITS[parseInt(c, 10)] || c).join('');
}

export function generateOfflineSurahAyahs(surahNumber: number): AyahItem[] {
  const meta = SURAH_LIST.find((s) => s.number === surahNumber);
  if (!meta) return [];

  // Authentic openings based on Muqatta'at or Surah style
  let openingAr = surahNumber === 1 ? 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ' : `سُورَةُ ${meta.nameArabic}`;
  let openingBn = surahNumber === 1 ? 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।' : `পবিত্র কুরআনুল কারীমের সূরা ${meta.nameBangla}-এর সূচনা।`;
  let openingTrans = surahNumber === 1 ? 'বিসমিল্লাহির রাহমানির রাহিম' : `সূরা ${meta.nameBangla}`;

  if ([2, 3, 29, 30, 31, 32].includes(surahNumber)) {
    openingAr = 'الم';
    openingBn = 'আলিফ-লাম-মীম (আল্লাহ ছাড়া এর প্রকৃত অর্থ কেউ জানে না)।';
    openingTrans = 'আলিফ-লাম-মীম';
  } else if ([7].includes(surahNumber)) {
    openingAr = 'المص';
    openingBn = 'আলিফ-লাম-মীম-সোয়াদ।';
    openingTrans = 'আলিফ-লাম-মীম-সোয়াদ';
  } else if ([10, 11, 12, 14, 15].includes(surahNumber)) {
    openingAr = 'الر ۚ تِلْكَ آيَاتُ الْكِتَابِ الْحَكِيمِ';
    openingBn = 'আলিফ-লাম-রা; এগুলো প্রজ্ঞাময় কিতাবের আয়াত।';
    openingTrans = 'আলিফ-লাম-রা, তিলকা আয়াতুল কিতাবিল হাকীম';
  } else if ([13].includes(surahNumber)) {
    openingAr = 'المر ۚ تِلْكَ آيَاتُ الْكِتَابِ';
    openingBn = 'আলিফ-লাম-মীম-রা; এগুলো সেই কিতাবের আয়াত।';
    openingTrans = 'আলিফ-লাম-মীম-রা';
  } else if ([19].includes(surahNumber)) {
    openingAr = 'كهيعص';
    openingBn = 'কাফ-হা-ইয়া-আইন-সোয়াদ।';
    openingTrans = 'কাফ-হা-ইয়া-আইন-সোয়াদ';
  } else if ([20].includes(surahNumber)) {
    openingAr = 'طه';
    openingBn = 'ত্বা-হা।';
    openingTrans = 'ত্বা-হা';
  } else if ([26, 28].includes(surahNumber)) {
    openingAr = 'طسم';
    openingBn = 'ত্বা-সীন-মীম।';
    openingTrans = 'ত্বা-সীন-মীম';
  } else if ([27].includes(surahNumber)) {
    openingAr = 'طس ۚ تِلْكَ آيَاتُ الْقُرْآنِ وَكِتَابٍ مُّبِينٍ';
    openingBn = 'ত্বা-সীন; এগুলো কুরআন এবং সুস্পষ্ট কিতাবের আয়াত।';
    openingTrans = 'ত্বা-সীন';
  } else if ([40, 41, 42, 43, 44, 45, 46].includes(surahNumber)) {
    openingAr = 'حم';
    openingBn = 'হা-মীম।';
    openingTrans = 'হা-মীম';
  } else if ([50].includes(surahNumber)) {
    openingAr = 'ق ۚ وَالْقُرْآنِ الْمَجِيدِ';
    openingBn = 'ক্বাফ; সম্মানিত কুরআনের শপথ।';
    openingTrans = 'ক্বাফ, ওয়াল কুরআনিল মাজীদ';
  } else if ([68].includes(surahNumber)) {
    openingAr = 'ن ۚ وَالْقَلَمِ وَمَا يَسْطُرُونَ';
    openingBn = 'নূন; শপথ কলমের এবং যা তারা লিপিবদ্ধ করে।';
    openingTrans = 'নূন, ওয়াল ক্বালামি ওয়ামা ইয়াসতুরূন';
  } else if (surahNumber === 18) {
    openingAr = 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَل لَّهُ عِوَجًا';
    openingBn = 'সমস্ত প্রশংসা আল্লাহর, যিনি তাঁর বান্দার ওপর এই কিতাব অবতীর্ণ করেছেন এবং এতে কোনো বক্রতা রাখেননি।';
    openingTrans = 'আলহামদু লিল্লাহিল্লাযী আনযালা ‘আলা আবদিহিল কিতাবা ওয়া লাম ইয়াজ’আল লাহু ইওয়াজা';
  } else if (surahNumber === 36) {
    openingAr = 'يس ۝ وَالْقُرْآنِ الْحَكِيمِ ۝ إِنَّكَ لَمِنَ الْمُرْسَلِينَ';
    openingBn = 'ইয়া-সীন। প্রজ্ঞাময় কুরআনের শপথ। নিশ্চয়ই আপনি রাসূলগণের অন্যতম।';
    openingTrans = 'ইয়া-সীন, ওয়াল কুরআনিল হাকীম, ইন্নাকা লামিনাল মুরসালীন';
  } else if (surahNumber === 55) {
    openingAr = 'الرَّحْمَٰنُ ۝ عَلَّمَ الْقُرْآنَ ۝ خَلَقَ الْإِنسَانَ ۝ عَلَّمَهُ الْبَيَانَ';
    openingBn = 'পরম করুণাময় আল্লাহ। তিনি শিক্ষা দিয়েছেন কুরআন। তিনি সৃষ্টি করেছেন মানুষ। তিনি তাকে শিখিয়েছেন ভাব প্রকাশ করতে।';
    openingTrans = 'আর-রাহমান, আল্লামাল কুরআন, খালাকাল ইনসান, আল্লামাহুল বায়ান';
  } else if (surahNumber === 56) {
    openingAr = 'إِذَا وَقَعَتِ الْوَاقِعَةُ ۝ لَيْسَ لِوَقْعَتِهَا كَاذِبَةٌ';
    openingBn = 'যখন কিয়ামত সংঘটিত হবে, যার সংঘটন অস্বীকার করার মতো কোনো অবকাশ থাকবে না।';
    openingTrans = 'ইযা ওয়াকা’আতিল ওয়াক্বি’আহ, লাইসা লিওয়াক্ব’আতিহা কাযিবাহ';
  } else if (surahNumber === 67) {
    openingAr = 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ';
    openingBn = 'বরকতময় তিনি যাঁর হাতে সর্বময় কর্তৃত্ব এবং তিনি সব কিছুর ওপর সর্বশক্তিমান।';
    openingTrans = 'তাবারাকাল্লাযী বিয়াদিহিল মুলকু ওয়াহুওয়া ‘আলা কুল্লি শাইয়িন ক্বাদীর';
  } else if (surahNumber === 93) {
    openingAr = 'وَالضُّحَىٰ ۝ وَاللَّيْلِ إِذَا سَجَىٰ';
    openingBn = 'শপথ পূর্বাহ্নের রৌদ্রের এবং শপথ রজনীর যখন তা নিঝুম হয়ে যায়।';
    openingTrans = 'ওয়াদ্দুহা, ওয়াল্লাইলি ইযা সাজা';
  } else if (surahNumber === 94) {
    openingAr = 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ';
    openingBn = 'আমি কি আপনার বক্ষকে প্রশস্ত করে দেইনি?';
    openingTrans = 'আলাম নাশরাহ লাকা সাদরাক';
  } else if (surahNumber === 95) {
    openingAr = 'وَالتِّينِ وَالزَّيْتُونِ ۝ وَطُورِ سِينِينَ';
    openingBn = 'শপথ তীন ও যাইতুন ফলের এবং সিনাই পর্বতের।';
    openingTrans = 'ওয়াত্তীনি ওয়াযযাইতূন, ওয়াতূরি সীনীন';
  } else if (surahNumber === 97) {
    openingAr = 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ';
    openingBn = 'নিশ্চয়ই আমি একে নাযিল করেছি কদরের মহিমান্বিত রজনীতে।';
    openingTrans = 'ইন্না আনযালনাহু ফী লাইলাতিল ক্বাদর';
  } else if (surahNumber === 103) {
    openingAr = 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ';
    openingBn = 'শপথ কালের! নিশ্চয়ই মানুষ চরম ক্ষতিগ্রস্ততায় নিমজ্জিত।';
    openingTrans = 'ওয়াল ‘আসর, ইন্নাল ইনসানা লাফী খুসর';
  } else if (surahNumber === 105) {
    openingAr = 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ';
    openingBn = 'আপনি কি দেখেননি আপনার রব হস্তীওয়ালাদের সাথে কিরূপ আচরণ করেছিলেন?';
    openingTrans = 'আলাম তারা কাইফা ফা’আলা রাব্বুকা বিআসহাবিল ফীল';
  } else if (surahNumber === 108) {
    openingAr = 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ';
    openingBn = 'নিশ্চয়ই আমি আপনাকে কাউসার দান করেছি। অতএব আপনার রবের উদ্দেশ্যে সালাত আদায় করুন ও কোরবানি করুন।';
    openingTrans = 'ইন্না আ’তায়নাকাল কাওসার, ফাসাল্লি লিরাব্বিকা ওয়ানহার';
  } else if (surahNumber === 109) {
    openingAr = 'قُلْ يَا أَيُّهَا الْكَافِرُونَ ۝ لَا أَعْبُدُ مَا تَعْبُدُونَ';
    openingBn = 'বলুন: হে কাফেরগণ! আমি তাদের ইবাদত করি না যাদের ইবাদত তোমরা করো।';
    openingTrans = 'ক্বুল ইয়া আইয়ুহাল কাফিরূন, লা আ’বুদু মা তা’বুদূন';
  } else if (surahNumber === 110) {
    openingAr = 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ';
    openingBn = 'যখন আসবে আল্লাহর সাহায্য ও বিজয়।';
    openingTrans = 'ইযা জাআ নাসরুল্লাহি ওয়াল ফাতহ';
  } else if (surahNumber === 111) {
    openingAr = 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ';
    openingBn = 'ধ্বংস হোক আবু লাহাবের দুই হাত এবং সে নিজেও ধ্বংস হোক।';
    openingTrans = 'তাব্বাত ইয়াদা আবী লাহাবিও ওয়াতাব্ব';
  } else if (surahNumber === 112) {
    openingAr = 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ';
    openingBn = 'বলুন: তিনিই আল্লাহ, একক ও অদ্বিতীয়। আল্লাহ কারো মুখাপেক্ষী নন, সবাই তাঁর মুখাপেক্ষী।';
    openingTrans = 'ক্বুল হুয়াল্লাহু আহাদ, আল্লাহুস সামাদ';
  } else if (surahNumber === 113) {
    openingAr = 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ';
    openingBn = 'বলুন: আমি আশ্রয় চাই প্রভাতের রবের কাছে, তিনি যা সৃষ্টি করেছেন তার অনিষ্ট থেকে।';
    openingTrans = 'ক্বুল আ’ঊযু বিরাব্বিল ফালাক্ব, মিন শাররি মা খালাক্ব';
  } else if (surahNumber === 114) {
    openingAr = 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ';
    openingBn = 'বলুন: আমি আশ্রয় প্রার্থনা করছি মানুষের রবের কাছে, মানুষের অধিপতির কাছে, মানুষের সত্য উপাস্যের কাছে।';
    openingTrans = 'ক্বুল আ’ঊযু বিরাব্বিন নাস, মালিকিন নাস, ইলাহিন নাস';
  }

  const items: AyahItem[] = [];
  const count = meta.numberOfAyahs;
  const nextSurah = SURAH_LIST.find((s) => s.number === surahNumber + 1);
  const endPage = nextSurah ? nextSurah.pageStart : 604;
  const pageRange = Math.max(1, endPage - meta.pageStart + 1);

  for (let i = 1; i <= count; i++) {
    const pageNum = meta.pageStart + Math.min(pageRange - 1, Math.floor(((i - 1) / count) * pageRange));
    if (i === 1) {
      items.push({
        numberInSurah: 1,
        numberInQuran: (meta.number * 50) + 1,
        textArabic: openingAr,
        textArabicTajweed: openingAr,
        transliterationBn: openingTrans,
        translationBn: openingBn,
        translationEn: `In the name of Allah, Most Gracious, Most Merciful. [Surah ${meta.nameEnglish}]`,
        juz: meta.juzStart,
        page: pageNum,
      });
    } else {
      items.push({
        numberInSurah: i,
        numberInQuran: (meta.number * 50) + i,
        textArabic: `۞ سُورَةُ ${meta.nameArabic} - الآيَةُ ${toArabicDigits(i)}`,
        textArabicTajweed: `۞ سُورَةُ ${meta.nameArabic} - الآيَةُ ${toArabicDigits(i)}`,
        transliterationBn: `সূরা ${meta.nameBangla} - আয়াত ${toBengaliDigits(i)}`,
        translationBn: `[সূরা ${meta.nameBangla}: আয়াত ${toBengaliDigits(i)}] - অনলাইনে সম্পূর্ণ শাব্দিক পাঠ স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।`,
        translationEn: `[Surah ${meta.nameEnglish}: Ayah ${i}] - Full text cached when online.`,
        juz: meta.juzStart,
        page: pageNum,
      });
    }
  }

  return items;
}
