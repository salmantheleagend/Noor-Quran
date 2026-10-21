export type MushafEditionId =
  | 'madani'
  | 'hafezi_15'
  | 'hafezi_13'
  | 'tajweed'
  | 'nurani'
  | 'word_by_word'
  | 'ar_bn_pronunciation'
  | 'ar_bn_meaning'
  | 'ar_bn_complete'
  | 'ar_en_translation'
  | 'clean_arabic'
  | 'large_font'
  | 'children'
  | 'dark_reading'
  | 'hifz_practice'
  | 'indo_pak';

export interface MushafEdition {
  id: MushafEditionId;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  descriptionBn: string;
  badgeBn: string;
  recommendedFor: string;
  linesPerView: number; // e.g., 15 for Hafezi 15, 13 for 13-line, 0 for fluid
  fontClass: string;
  features: string[];
  sampleAyahText: string;
  sampleTranslationBn?: string;
  sampleTransliterationBn?: string;
  supportsTajweedColor: boolean;
  supportsHifzHide: boolean;
  isBookPageMode: boolean;
}

export const MUSHAF_EDITIONS: MushafEdition[] = [
  {
    id: 'madani',
    nameBn: 'মদিনা উসমানি মুসহাফ (Madani Standard)',
    nameEn: 'Standard Madani Uthmani Mushaf',
    taglineBn: 'কিং ফাহাদ কুরআন প্রিন্টিং কমপ্লেক্সের আন্তর্জাতিক মানদণ্ড',
    descriptionBn: 'বিশ্বের সর্বাধিক পঠিত ও নির্ভরযোগ্য মদিনা শরীফের উসমানি স্ক্রিপ্ট, যাতে পূর্ণাঙ্গ নুকতাহ ও ওয়াকফ চিহ্ন সন্নিবেশিত।',
    badgeBn: 'আন্তর্জাতিক মানদণ্ড',
    recommendedFor: 'সাধারণ কুরআন তিলাওয়াত ও খতমের জন্য',
    linesPerView: 15,
    fontClass: 'font-arabic-amiri-quran',
    features: ['প্রামাণ্য উসমানি স্ক্রিপ্ট', 'ওয়াকফ ও রুকু চিহ্ন', 'আয়াত নম্বর বৃত্ত'],
    sampleAyahText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    sampleTranslationBn: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু।',
    supportsTajweedColor: false,
    supportsHifzHide: false,
    isBookPageMode: true,
  },
  {
    id: 'hafezi_15',
    nameBn: '১৫ লাইনের হাফেজি কুরআন (Hafezi 15-Line)',
    nameEn: '15-Line Hifz Memorization Mushaf',
    taglineBn: 'হিফজ শিক্ষার্থী ও হাফেজদের জন্য নির্ধারিত পৃষ্ঠাভিত্তিক বিন্যাস',
    descriptionBn: 'প্রতি পৃষ্ঠায় ঠিক ১৫ লাইন বিশিষ্ট প্রথাগত হাফেজি মুদ্রণ, যার প্রতিটি পৃষ্ঠা আয়াতে শেষ হয় (আয়াত সমাপ্তি পৃষ্ঠা)।',
    badgeBn: 'হিফজ শিক্ষার্থী প্রিয়',
    recommendedFor: 'কুরআন মুখস্থ ও নিয়মিত পুনরাবৃত্তির (দাওর) জন্য',
    linesPerView: 15,
    fontClass: 'font-arabic-amiri',
    features: ['পৃষ্ঠা প্রতি ঠিক ১৫ লাইন', 'পৃষ্ঠা শেষে আয়াত সমাপ্তি', 'হিফজ লক্ষ্য ট্র্যাকিং'],
    sampleAyahText: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
    supportsTajweedColor: false,
    supportsHifzHide: true,
    isBookPageMode: true,
  },
  {
    id: 'tajweed',
    nameBn: 'কালার-কোডেড তাজবীদ মুসহাফ (Tajwid Color)',
    nameEn: 'Tajwid Rules Color-Coded Mushaf',
    taglineBn: 'সঠিক উচ্চারণে তাজবীদ শিক্ষার আন্তর্জাতিক রঙের নিয়ম',
    descriptionBn: 'গুন্নাহ, ইখফা, ইদগাম, কলকলাহ ও মাদ্দের মতো তাজবীদ নিয়মসমূহ স্বয়ংক্রিয় কালার কোডিং সহ প্রদর্শিত।',
    badgeBn: 'বিশুদ্ধ তাজবীদ',
    recommendedFor: 'সহিহ-শুদ্ধ উচ্চারণ ও তাজবীদ শিক্ষার্থী',
    linesPerView: 0,
    fontClass: 'font-arabic-noto-naskh',
    features: ['কালার কোডেড হরকত', 'নিয়মসমূহের জীবন্ত লেজেন্ড', 'সঠিক উচ্চারণ নিশ্চিতকরণ'],
    sampleAyahText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    supportsTajweedColor: true,
    supportsHifzHide: false,
    isBookPageMode: false,
  },
  {
    id: 'ar_bn_complete',
    nameBn: 'আরবি + উচ্চারণ + অর্থ (৩-ইন-১ পূর্ণাঙ্গ)',
    nameEn: 'Arabic + Pronunciation + Meaning (3-in-1)',
    taglineBn: 'আরবি পাঠ, বাংলা সহজ উচ্চারণ এবং অনুধাবনের অর্থ একসঙ্গে',
    descriptionBn: 'প্রতিটি আয়াতের মূল আরবি, শুদ্ধ বাংলা উচ্চারণ এবং নির্ভুল বাংলা অনুবাদ সম্পূর্ণ আলাদা সুনির্দিষ্ট বক্সে সাজানো।',
    badgeBn: 'সর্বাধিক জনপ্রিয়',
    recommendedFor: 'নতুন পাঠক ও অর্থ বুঝে তিলাওয়াতকারী',
    linesPerView: 0,
    fontClass: 'font-arabic-amiri-quran',
    features: ['সম্পূর্ণ পৃথক নন-ওভারল্যাপ বক্স', 'সহজ পাঠ বাংলা উচ্চারণ', 'মুফাসসিরগণ সমর্থিত অর্থ'],
    sampleAyahText: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
    sampleTransliterationBn: 'মালিকি ইয়াওমিদ্দীন',
    sampleTranslationBn: 'বিচার দিবসের অধিপতি।',
    supportsTajweedColor: true,
    supportsHifzHide: false,
    isBookPageMode: false,
  },
  {
    id: 'hifz_practice',
    nameBn: 'হিফজ প্র্যাকটিস মুসহাফ (Hide & Reveal)',
    nameEn: 'Hifz Memory Test & Practice Mushaf',
    taglineBn: 'আয়াত লুকিয়ে পরীক্ষা নেওয়া ও আয়াতের শুরু দেখে মুখস্থ পড়ার মোড',
    descriptionBn: 'হিফজ মজবুত করার জন্য আয়াতগুলো ঝাপসা বা লুকিয়ে রাখা যায়; ট্যাপ করলে প্রকাশ পায় এবং ভুল চিহ্নিত করা যায়।',
    badgeBn: 'স্মার্ট হিফজ টুল',
    recommendedFor: 'হিফজ ক্লাসের ছাত্র ও মুখস্থ যাচাইকারী',
    linesPerView: 15,
    fontClass: 'font-arabic-amiri',
    features: ['আয়াত গোপন/প্রকাশ বাটন', 'স্মার্ট পুনরাবৃত্তি কাউন্টার', 'কঠিন আয়াত বুকমার্ক'],
    sampleAyahText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    supportsTajweedColor: false,
    supportsHifzHide: true,
    isBookPageMode: true,
  },
  {
    id: 'nurani',
    nameBn: 'নূরানী সহজ শিক্ষার্থী মুসহাফ (Nurani Easy)',
    nameEn: 'Nurani Beginner Learning Mushaf',
    taglineBn: 'স্পষ্ট ও বড় বড় হরফ যাতে নতুন শিক্ষার্থীদের পড়তে কোনো কষ্ট না হয়',
    descriptionBn: 'উপমহাদেশের নূরানী পদ্ধতির আদলে অত্যন্ত স্পষ্ট ও বড় আকৃতির আরবি অক্ষর, যাতে যুক্তাক্ষর সহজে চেনা যায়।',
    badgeBn: 'নতুন শিক্ষার্থীদের জন্য',
    recommendedFor: 'কায়দা শেষ করা নতুন শিক্ষার্থী ও বয়োজ্যেষ্ঠদের জন্য',
    linesPerView: 13,
    fontClass: 'font-arabic-noto-naskh',
    features: ['বড় ও স্পষ্ট হরফ', 'সহজ দৃশ্যমান নুকতাহ', 'সহজ হরকত শনাক্তকরণ'],
    sampleAyahText: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    supportsTajweedColor: true,
    supportsHifzHide: false,
    isBookPageMode: false,
  },
  {
    id: 'word_by_word',
    nameBn: 'শব্দে শব্দে অর্থসহ মুসহাফ (Word by Word)',
    nameEn: 'Word-by-Word Translation Mushaf',
    taglineBn: 'প্রতিটি আরবি শব্দের নিচে তার সরাসরি বাংলা অর্থ',
    descriptionBn: 'কুরআনের ভাষা সরাসরি শেখার জন্য প্রতিটি শব্দের নিচে তার প্রাসঙ্গিক বাংলা প্রতিশব্দ সন্নিবেশিত।',
    badgeBn: 'কুরআনিক আরবি শিক্ষা',
    recommendedFor: 'আরবি ব্যাকরণ ও শব্দার্থ শিক্ষার্থী',
    linesPerView: 0,
    fontClass: 'font-arabic-amiri-quran',
    features: ['শব্দভিত্তিক অনুবাদ', 'শব্দে ট্যাপ করে একক অডিও', 'শব্দভাণ্ডার সমৃদ্ধকরণ'],
    sampleAyahText: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
    sampleTranslationBn: 'তাদের পথ যাদের আপনি অনুগ্রহ করেছেন',
    supportsTajweedColor: false,
    supportsHifzHide: false,
    isBookPageMode: false,
  },
  {
    id: 'clean_arabic',
    nameBn: 'ক্লিন আরবি মুসহাফ (Clean Arabic Only)',
    nameEn: 'Minimalist Clean Arabic Mushaf',
    taglineBn: 'অনুবাদ ও উচ্চারণ ছাড়া কেবল নিখাদ আরবি তিলাওয়াতের জন্য',
    descriptionBn: 'কোনো অনুবাদ, উচ্চারণ বা বিভ্রান্তিকর উপাদান ছাড়া শুধু পবিত্র কালামের বিশুদ্ধ তিলাওয়াত রূপ।',
    badgeBn: 'নিরবচ্ছিন্ন তিলাওয়াত',
    recommendedFor: 'দ্রুত খতম ও নামাজে তিলাওয়াত চর্চাকারী',
    linesPerView: 15,
    fontClass: 'font-arabic-scheherazade',
    features: ['জিরো ডিস্ট্রাকশন', 'প্রশান্তিময় ফন্ট', 'অবিচ্ছিন্ন তিলাওয়াত ফ্লো'],
    sampleAyahText: 'غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    supportsTajweedColor: false,
    supportsHifzHide: false,
    isBookPageMode: true,
  },
  {
    id: 'large_font',
    nameBn: 'বড় হরফের মুসহাফ (Large Font / Senior Friendly)',
    nameEn: 'Large Text & Accessible Mushaf',
    taglineBn: 'বয়োজ্যেষ্ঠ পাঠক ও দুর্বল দৃষ্টিশক্তির জন্য আরামদায়ক বড় হরফ',
    descriptionBn: 'উচ্চ রেজোলিউশন ও ৩৫ পিক্সেল মাপের বড় আরবি হরফ, যা চোখের ওপর চাপ না ফেলে ঘণ্টার পর ঘণ্টা পড়া যায়।',
    badgeBn: 'চোখের জন্য আরামদায়ক',
    recommendedFor: 'বয়স্ক পাঠক ও চশমা ব্যবহারকারী',
    linesPerView: 0,
    fontClass: 'font-arabic-lateef',
    features: ['৩৫px+ বড় ফন্ট সাইজ', 'উচ্চ কন্ট্রাস্ট ব্যবধান', 'আরামদায়ক লাইন স্পেসিং'],
    sampleAyahText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    supportsTajweedColor: true,
    supportsHifzHide: false,
    isBookPageMode: false,
  },
  {
    id: 'dark_reading',
    nameBn: 'নাইট রিডিং ডার্ক মুসহাফ (AMOLED Dark)',
    nameEn: 'High Contrast Night Reading Mushaf',
    taglineBn: 'রাতের বেলা চোখের ক্লান্তিহীন তিলাওয়াতের জন্য গাঢ় কালো পটভূমি',
    descriptionBn: 'ঘন কালো ব্যাকগ্রাউন্ড এবং নরম সোনালী ও সবুজ হরফের সমন্বয়ে তৈরি, যা রাতে ঘরের আলো কমিয়ে পড়লেও চোখে লাগে না।',
    badgeBn: 'রাত ও তাহাজ্জুদ',
    recommendedFor: 'রাতের তিলাওয়াত ও তাহাজ্জুদের নামাজে',
    linesPerView: 0,
    fontClass: 'font-arabic-amiri-quran',
    features: ['পিওর ব্ল্যাক ব্যাকগ্রাউন্ড', 'সোনালী-সবুজ মৃদু আলো', 'ব্যাটারি সাশ্রয়ী AMOLED'],
    sampleAyahText: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ',
    supportsTajweedColor: true,
    supportsHifzHide: false,
    isBookPageMode: false,
  },
  {
    id: 'indo_pak',
    nameBn: 'ইন্দো-পাক ঐতিহ্যবাহী মুসহাফ (Indo-Pak Script)',
    nameEn: 'Indo-Pak / South Asian Classical Mushaf',
    taglineBn: 'উপমহাদেশের যুগান্তকারী হস্তলিখিত ক্যালিগ্রাফি শৈলী',
    descriptionBn: 'বাংলাদেশ, ভারত ও পাকিস্তানে যুগ যুগ ধরে পঠিত সনাতন ক্যালিগ্রাফি রূপ, যাতে প্রতিটি হরকত ও নুকতাহ গভীর স্পষ্টতায় অঙ্কিত।',
    badgeBn: 'উপমহাদেশীয় ঐতিহ্য',
    recommendedFor: 'সনাতন হস্তলিপিতে অভ্যস্ত পাঠক',
    linesPerView: 15,
    fontClass: 'font-arabic-scheherazade',
    features: ['ঐতিহ্যবাহী নুকতাহ বিন্যাস', 'গভীর স্পষ্ট হরকত', 'উপমহাদেশীয় ওয়াকফ সংকেত'],
    sampleAyahText: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    supportsTajweedColor: false,
    supportsHifzHide: false,
    isBookPageMode: true,
  },
];

export const DEFAULT_MUSHAF_ID: MushafEditionId = 'madani';

export function getMushafEdition(id: MushafEditionId): MushafEdition {
  const found = MUSHAF_EDITIONS.find((e) => e.id === id);
  return found || MUSHAF_EDITIONS[0];
}
