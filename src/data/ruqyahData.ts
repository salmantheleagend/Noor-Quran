export type RuqyahCategory =
  | 'evil_eye'
  | 'magic_sihr'
  | 'jinn_waswasa'
  | 'sleep_nightmare'
  | 'illness_pain'
  | 'child_family_home'
  | 'morning_evening'
  | 'travel_protection'
  | 'anxiety_fear'
  | 'repentance_purification';

export interface RuqyahItem {
  id: string;
  titleBn: string;
  titleAr: string;
  category: RuqyahCategory;
  categoryBn: string;
  purposeBn: string; // কেন এই রুকইয়াহ
  targetBenefitBn: string;
  arabic: string;
  transliterationBn: string;
  translationBn: string;
  source: string;
  repeatCount: number;
  repeatNoteBn: string;
  instructionsBn: string[];
  audioSlowUrl?: string;
  audioFullUrl?: string;
  audioUrls?: string[];
  timingNoteBn?: string;
  cautionNoticeBn?: string;
}

export interface RuqyahCategoryMeta {
  id: RuqyahCategory;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  iconName: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  totalCount: number;
}

export const RUQYAH_CATEGORIES: RuqyahCategoryMeta[] = [
  {
    id: 'evil_eye',
    nameBn: 'বদনজর ও হাসাদ থেকে সুরক্ষা',
    nameEn: 'Evil Eye & Envy Protection',
    descriptionBn: 'মানুষ ও জ্বিনের হিংসাদৃষ্টি, বদনজর ও ক্ষতির প্রভাব নষ্ট করার শারয়ী রুকইয়াহ।',
    iconName: 'Eye',
    colorScheme: {
      bg: 'bg-[#F8E8ED] dark:bg-[#10235A]',
      border: 'border-[#E7D9DE] dark:border-[#21409A]/40',
      text: 'text-[#21409A] dark:text-[#E9B7C3]',
      badge: 'বদনজর সুরক্ষা',
    },
    totalCount: 5,
  },
  {
    id: 'magic_sihr',
    nameBn: 'জাদু ও সিহর বিনষ্টকরণ',
    nameEn: 'Sihr & Magic Protection',
    descriptionBn: 'কুরআনুল কারিমের পরীক্ষিত আয়াত ও মাসনূন দোয়ার মাধ্যমে জাদুর প্রভাব ধ্বংস করার রুকইয়াহ।',
    iconName: 'Flame',
    colorScheme: {
      bg: 'bg-[#F8E8ED] dark:bg-[#10235A]',
      border: 'border-[#E7D9DE] dark:border-[#21409A]/40',
      text: 'text-[#21409A] dark:text-[#E9B7C3]',
      badge: 'সিহর প্রতিরোধ',
    },
    totalCount: 5,
  },
  {
    id: 'jinn_waswasa',
    nameBn: 'জিনের ভয় ও শয়তানের ওয়াসওয়াসা',
    nameEn: 'Jinn & Waswasa Shield',
    descriptionBn: 'অযাচিত ভীতি, কুচিন্তা ও শয়তানি প্ররোচনা থেকে অন্তরের প্রশান্তি ও হিফাজত।',
    iconName: 'Shield',
    colorScheme: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      border: 'border-teal-200/80 dark:border-teal-800/60',
      text: 'text-teal-800 dark:text-teal-300',
      badge: 'ওয়াসওয়াসা মুক্তি',
    },
    totalCount: 4,
  },
  {
    id: 'sleep_nightmare',
    nameBn: 'ঘুমের ভয়, দুঃস্বপ্ন ও ঘুমে চেপে ধরা',
    nameEn: 'Sleep Fear, Nightmare & Paralysis',
    descriptionBn: 'ঘুমের ঘোরে বুকে চেপে ধরা (স্লিপ প্যারালাইসিস), দুঃস্বপ্ন ও অনিদ্রা নিরাময়ের সুন্নাহসম্মত আমল।',
    iconName: 'Moon',
    colorScheme: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-200/80 dark:border-indigo-800/60',
      text: 'text-indigo-800 dark:text-indigo-300',
      badge: 'নিরাপদ নিদ্রা',
    },
    totalCount: 5,
  },
  {
    id: 'illness_pain',
    nameBn: 'অসুস্থতা ও শারীরিক ব্যথার নিরাময়',
    nameEn: 'Illness & Pain Relief',
    descriptionBn: 'শরীরের যেকোনো ব্যথায় হাত রেখে রাসুলুল্লাহ (সা.) নির্দেশিত আত্মিক শিফার আমল।',
    iconName: 'HeartPulse',
    colorScheme: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200/80 dark:border-rose-800/60',
      text: 'text-rose-800 dark:text-rose-300',
      badge: 'ব্যথা নিরাময়',
    },
    totalCount: 4,
  },
  {
    id: 'child_family_home',
    nameBn: 'শিশু, পরিবার ও ঘরের হিফাজত',
    nameEn: 'Child, Family & Home Shield',
    descriptionBn: 'সন্তানের কান্নাকাটি, বদনজর থেকে রক্ষা এবং ঘরে বরকত ও নিরাপত্তামূলক দোয়া।',
    iconName: 'Home',
    colorScheme: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      border: 'border-sky-200/80 dark:border-sky-800/60',
      text: 'text-sky-800 dark:text-sky-300',
      badge: 'পারিবারিক প্রাচীর',
    },
    totalCount: 4,
  },
  {
    id: 'morning_evening',
    nameBn: 'সকাল-সন্ধ্যার সুরক্ষা আযকার',
    nameEn: 'Morning & Evening Daily Fortress',
    descriptionBn: 'প্রতিদিন সকাল ও সন্ধ্যায় ২৪ ঘণ্টার নিরাপত্তা দুর্গ গড়ে তোলার মাসনূন আযকার।',
    iconName: 'Sun',
    colorScheme: {
      bg: 'bg-[#F8E8ED] dark:bg-[#10235A]',
      border: 'border-[#E7D9DE] dark:border-[#21409A]/40',
      text: 'text-[#21409A] dark:text-[#E9B7C3]',
      badge: 'দৈনিক দুর্গ',
    },
    totalCount: 4,
  },
  {
    id: 'travel_protection',
    nameBn: 'সফর ও যাত্রাপথের সুরক্ষা',
    nameEn: 'Travel & Journey Protection',
    descriptionBn: 'যেকোনো যাত্রা, নতুন স্থানে অবস্থান ও পথচলায় দুর্ঘটনা এবং অনিষ্ট থেকে রক্ষার দোয়া।',
    iconName: 'Compass',
    colorScheme: {
      bg: 'bg-[#F8E8ED] dark:bg-[#10235A]',
      border: 'border-[#E7D9DE] dark:border-[#21409A]/40',
      text: 'text-[#21409A] dark:text-[#E9B7C3]',
      badge: 'সফর হিফাজত',
    },
    totalCount: 3,
  },
  {
    id: 'anxiety_fear',
    nameBn: 'ভয়, দুশ্চিন্তা ও মন শান্তির দোয়া (আয়াতুস সাকিনাহ)',
    nameEn: 'Anxiety, Panic & Tranquility',
    descriptionBn: 'মানসিক অস্থিরতা, বুক ধড়ফড়, ভবিষ্যৎ নিয়ে তীব্র উদ্বেগ ও মানসিক শান্তির দোয়া।',
    iconName: 'Sparkles',
    colorScheme: {
      bg: 'bg-[#F8E8ED] dark:bg-[#10235A]',
      border: 'border-[#E7D9DE] dark:border-[#21409A]/40',
      text: 'text-[#21409A] dark:text-[#E9B7C3]',
      badge: 'প্রশান্তি',
    },
    totalCount: 4,
  },
  {
    id: 'repentance_purification',
    nameBn: 'তওবা, পবিত্রতা, আত্মসংযম ও গুনাহ থেকে বাঁচার দোয়া',
    nameEn: 'Repentance & Purity of Mind',
    descriptionBn: 'কুপ্রবৃত্তি, চোখের হেফাজত, ব্যভিচার ও গোপন গুনাহ থেকে আত্মার পবিত্রতা অর্জনের দোয়া।',
    iconName: 'ShieldCheck',
    colorScheme: {
      bg: 'bg-[#F8E8ED] dark:bg-[#10235A]',
      border: 'border-[#E7D9DE] dark:border-[#21409A]/40',
      text: 'text-[#21409A] dark:text-[#E9B7C3]',
      badge: 'আত্মসংযম',
    },
    totalCount: 4,
  },
];

export const RUQYAH_ITEMS: RuqyahItem[] = [
  // 1. Evil Eye / Bad Nojor
  {
    id: 'ruq_fatihah',
    titleBn: 'সূরা আল-ফাতিহা (শিফা ও রুকইয়াহর মূল ভিত্তি)',
    titleAr: 'سورة الفاتحة - الشافية',
    category: 'evil_eye',
    categoryBn: 'বদনজর ও শিফা',
    purposeBn: 'রাসূলুল্লাহ (সা.) সূরা ফাতিহাকে সর্বোত্তম রুকইয়াহ হিসেবে অনুমোদন দিয়েছেন। এটি বদনজর, বিষাক্ত দংশন ও সকল অসুস্থতা দূর করে।',
    targetBenefitBn: 'বদনজর, বিষক্রিয়া ও শরীরের অস্বস্তি থেকে তাৎক্ষণিক শিফা।',
    arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ ۝ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ۝ مَٰلِكِ يَوْمِ ٱلدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ ۝ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
    transliterationBn: 'বিসমিল্লাহির রাহমানির রাহিম। আলহামদু লিল্লাহি রাব্বিল আলামীন। আর-রাহমানির রাহিম। মালিকি ইয়াওমিদ্দীন। ইয়্যাকা না’বুদু ওয়া ইয়্যাকা নাস্তাঈন। ইহদিনাস সিরাতাল মুস্তাক্বীম। সিরাতাল্লাযীনা আনআমতা আলাইহিম, গাইরিল মাগদূবি আলাইহিম ওয়ালাদ্দাল্লীন।',
    translationBn: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু। সমস্ত প্রশংসা জগৎসমূহের প্রতিপালক আল্লাহর। যিনি পরম দয়ালু ও করুণাময়। বিচার দিবসের অধিপতি। আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই কাছে সাহায্য প্রার্থনা করি। আমাদের সরল-সঠিক পথ প্রদর্শন করুন। তাদের পথ, যাদের আপনি পুরস্কৃত করেছেন; তাদের নয় যারা ক্রোধে নিপতিত ও পথভ্রষ্ট।',
    source: 'সহিহ বুখারি: ২২৭৬, সহিহ মুসলিম: ২২০১ (সাহাবি আবু সাঈদ আল-খুদরি রা. বর্ণিত রুকইয়াহ হাদিস)',
    repeatCount: 7,
    repeatNoteBn: '৩ বার অথবা ৭ বার পাঠ করা মুস্তাহাব।',
    instructionsBn: [
      'উভয় হাত একত্র করে সূরা ফাতিহা তিলাওয়াত করুন।',
      'তিলাওয়াত শেষে হাতের তালুতে হালকা ফুঁ (শুষ্ক বাতাসসহ দম) দিন।',
      'মাথা, মুখমণ্ডল এবং পুরো শরীরে হাত বুলিয়ে নিন।',
      'প্রয়োজনে পানিতে ফুঁ দিয়ে তা পান করতে পারেন ও মুখ ধুতে পারেন।',
    ],
    audioSlowUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/001.mp3',
    audioFullUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/001.mp3',
  },
  {
    id: 'ruq_muawwidhat',
    titleBn: 'তিন কুল (সূরা ইখলাস, ফালাক্ব ও নাস)',
    titleAr: 'المعوذات (الإخلاص، الفلق، الناس)',
    category: 'evil_eye',
    categoryBn: 'বদনজর ও সার্বিক নিরাপত্তা',
    purposeBn: 'রাসূলুল্লাহ (সা.) বলেছেন, "সকাল-সন্ধ্যায় এই তিন সূরা পাঠ করলে তা তোমার যেকোনো অনিষ্ট থেকে সুরক্ষার জন্য যথেষ্ট হবে।"',
    targetBenefitBn: 'মানুষের চোখ, জিনের দৃষ্টি, হিংসুক ও চক্রান্তকারীর অনিষ্ট থেকে সার্বক্ষণিক সুরক্ষা।',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    transliterationBn: 'কুল হুয়াল্লাহু আহাদ... কুল আউযু বিরাব্বিল ফালাক্ব... কুল আউযু বিরাব্বিন নাস...',
    translationBn: 'বলুন: তিনিই আল্লাহ, এক-অদ্বিতীয়... বলুন: আমি আশ্রয় প্রার্থনা করছি উষার প্রতিপালকের... বলুন: আমি আশ্রয় প্রার্থনা করছি মানবজাতির প্রতিপালকের...',
    source: 'সুনান আবু দাউদ: ৫০৮২, সুনান তিরমিজি: ৩৫৭৫ (হাসান সহিহ)',
    repeatCount: 3,
    repeatNoteBn: 'সকালে ৩ বার, সন্ধ্যায় ৩ বার এবং প্রতি নামাজের পর ১ বার করে পাঠ করুন।',
    instructionsBn: [
      'দুই হাত একত্র করে মুখের কাছে আনুন।',
      'সূরা ইখলাস, সূরা ফালাক ও সূরা নাস পূর্ণ পাঠ করুন।',
      'তালুতে হালকা ফুঁ দিন এবং মাথা ও শরীরের যে অংশে পৌঁছায় হাত বুলান।',
      'এটি ক্রমান্বয়ে ৩ বার সম্পন্ন করুন।',
    ],
    audioUrls: [
      'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/112.mp3',
      'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/113.mp3',
      'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/114.mp3',
    ],
    audioSlowUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/112.mp3',
    audioFullUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/112.mp3',
  },
  {
    id: 'ruq_hasad_prophetic',
    titleBn: 'বদনজর ও হিংসা নষ্টের মাসনূন দোয়া',
    titleAr: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ',
    category: 'evil_eye',
    categoryBn: 'বদনজর ও বিষাক্ত অনিষ্ট',
    purposeBn: 'হযরত ইব্রাহিম (আ.) ইসমাঈল ও ইসহাক (আ.)-কে এবং হযরত মুহাম্মদ (সা.) হাসান ও হুসাইন (রা.)-কে এই দোয়ার মাধ্যমে আল্লাহর আশ্রয়ে দিতেন।',
    targetBenefitBn: 'বদনজর, বিষাক্ত প্রাণী ও শয়তানের আক্রমণ প্রতিহত করে।',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    transliterationBn: 'আউযু বিকালিমা-তিল্লা-হিত তা-ম্মাতি মিন কুল্লি শাইত্বা-নিঁও ওয়া হা-ম্মাহ, ওয়া মিন কুল্লি আইনিন লা-ম্মাহ।',
    translationBn: 'আমি আল্লাহর পূর্ণাঙ্গ বাণীসমূহের আশ্রয়ে পানাহ চাই সকল শয়তান থেকে, বিষাক্ত কীট-পতঙ্গ থেকে এবং ক্ষতিকর বদনজর থেকে।',
    source: 'সহিহ বুখারি: ৩৩৭১, তিরমিজি: ২০৬০',
    repeatCount: 3,
    repeatNoteBn: 'সকাল-সন্ধ্যায় ৩ বার এবং সন্তানের ওপর হাত রেখে পাঠ করুন।',
    instructionsBn: [
      'নিজের ওপর অথবা সন্তানের কপালে বা মাথায় হাত রেখে দোয়াটি পড়ুন।',
      'দোয়া শেষে হালকা ফুঁ দিয়ে আশীর্বাদ করুন।',
    ],
  },

  // 2. Magic / Sihr Protection
  {
    id: 'ruq_ayatul_kursi',
    titleBn: 'আয়াতুল কুরসি (সিহর ও শয়তানের মহা প্রাচীর)',
    titleAr: 'آية الكرسي - سورة البقرة: ٢٥٥',
    category: 'magic_sihr',
    categoryBn: 'জাদু ও শয়তান দমন',
    purposeBn: 'রাসূলুল্লাহ (সা.) বলেছেন, "যে ব্যক্তি রাতে আয়াতুল কুরসি পাঠ করবে, আল্লাহর পক্ষ থেকে তার জন্য একজন রক্ষক নিযুক্ত থাকবে এবং ভোর পর্যন্ত শয়তান তার কাছে ভিড়তে পারবে না।"',
    targetBenefitBn: 'জাদুটোনা, সিহর, দুষ্ট জিন ও শয়তানের যাবতীয় কূটকৌশল প্রতিহত করে।',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    transliterationBn: 'আল্লা-হু লা- ইলা-হা ইল্লা- হুওয়াল হাইয়্যুল ক্বাইয়্যূম। লা- তা’খুযুহূ সিনাতুঁও ওয়ালা- নাওম। লাহূ মা- ফিসসামা-ওয়া-তি ওয়ামা- ফিল আরদ্ব। মান যাল্লাযী ইয়াশফা‘উ ‘ইনদাহূ ইল্লা- বিইযনিহ। ইয়া‘লামু মা- বাইনা আইদীহিম ওয়ামা- খালফাহুম, ওয়ালা- ইউহীত্বূনা বিশাইইম মিন ‘ইলমিহী ইল্লা- বিমা- শা-আ। ওয়াসি‘আ কুরসিয়্যুহুস সামা-ওয়া-তি ওয়াল আরদ্ব, ওয়ালা- ইয়াউদুহূ হিফযুহুমা- ওয়াহুওয়াল ‘আলিয়্যুল ‘আযীম।',
    translationBn: 'আল্লাহ, তিনি ছাড়া কোনো সত্য ইলাহ নেই; তিনি চিরঞ্জীব, সর্বসত্তার ধারক। তন্দ্রা ও নিদ্রা তাঁকে স্পর্শ করে না। আসমান ও জমিনে যা কিছু রয়েছে সবই তাঁর। কে আছে যে তাঁর অনুমতি ছাড়া তাঁর নিকট সুপারিশ করবে? তাদের সম্মুখে ও পেছনে যা কিছু আছে তা তিনি জানেন। আর তাঁর ইচ্ছার বাইরে তারা তাঁর জ্ঞানের কোনো অংশই আয়ত্ত করতে পারে না। তাঁর কুরসি আসমান ও জমিন পরিব্যাপ্ত করে আছে এবং উভয়ের সংরক্ষণ তাঁকে ক্লান্ত করে না। আর তিনি সুউচ্চ, মহামহিম।',
    source: 'সূরা আল-বাকারাহ: ২৫৫, সহিহ বুখারি: ২৩১১',
    repeatCount: 1,
    repeatNoteBn: 'প্রতি ফরজ নামাজের পর ১ বার এবং ঘুমানোর আগে ১ বার পাঠ বাধ্যতামূলক।',
    instructionsBn: [
      'মনোযোগ সহকারে অর্থ বুঝে তিলাওয়াত করুন।',
      'জাদুটোনার প্রবল সন্দেহে ৩ বার বা ৭ বার পড়ে বুক ও শরীরে ফুঁ দিন।',
    ],
    audioSlowUrl: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3',
    audioFullUrl: 'https://everyayah.com/data/Alafasy_128kbps/002255.mp3',
  },
  {
    id: 'ruq_baqarah_last2',
    titleBn: 'সূরা বাকারার শেষ দুই আয়াত (আমানার রাসূল)',
    titleAr: 'خواتيم سورة البقرة (آمن الرسول)',
    category: 'magic_sihr',
    categoryBn: 'রাতের মহাশক্তিমান ঢাল',
    purposeBn: 'রাসূলুল্লাহ (সা.) বলেছেন, "যে ব্যক্তি রাতে সূরা বাকারার শেষ দুটি আয়াত তিলাওয়াত করবে, এটি তার জন্য (যেকোনো অনিষ্ট ও জাদুর বিরুদ্ধে) যথেষ্ট হবে।"',
    targetBenefitBn: 'সিহর ধ্বংস ও সারা রাতের যাবতীয় অনিষ্ট থেকে পূর্ণাঙ্গ নিষ্কৃতি।',
    arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ۝ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    transliterationBn: 'আ-মানার রাসূ-লু বিমা- উনযিলা ইলাইহি মির রাব্বিহী ওয়াল মু’মিনূন... লা- ইউকাল্লিফুল্লা-হু নাফসান ইল্লা- উস‘আহা-...',
    translationBn: 'রাসূল তাঁর প্রতিপালকের পক্ষ থেকে যা অবতীর্ণ হয়েছে তাতে ঈমান এনেছেন এবং মুমিনগণও... হে আমাদের প্রতিপালক! যদি আমরা ভুলে যাই বা ভুল করি, তবে আমাদের পাকড়াও করবেন না... আপনিই আমাদের অভিভাবক; সুতরাং কাফির সম্প্রদায়ের বিরুদ্ধে আমাদের সাহায্য করুন।',
    source: 'সূরা আল-বাকারাহ: ২৮৫–২৮৬, সহিহ বুখারি: ৫০০৯',
    repeatCount: 1,
    repeatNoteBn: 'প্রতি রাতে ঘুমানোর পূর্বে একবার পাঠ করুন।',
    instructionsBn: [
      'রাতে ঘুমাতে যাওয়ার আগে পাঠ করে শুয়ে পড়ুন।',
    ],
    audioUrls: [
      'https://everyayah.com/data/Alafasy_128kbps/002285.mp3',
      'https://everyayah.com/data/Alafasy_128kbps/002286.mp3',
    ],
    audioSlowUrl: 'https://everyayah.com/data/Alafasy_128kbps/002285.mp3',
    audioFullUrl: 'https://everyayah.com/data/Alafasy_128kbps/002285.mp3',
  },
  {
    id: 'ruq_destroy_sihr_ayats',
    titleBn: 'জাদু বিনষ্টকারী কুরআনুল কারিমের ৩টি আয়াত',
    titleAr: 'آيات إبطال السحر (يونس، الأعراف، طه)',
    category: 'magic_sihr',
    categoryBn: 'সিহর অকার্যকরকরণ',
    purposeBn: 'মুসা (আ.) ও ফেরাউনের জাদুকরদের সংঘাতের প্রেক্ষিতে আল্লাহ তায়ালা ঘোষণা করেছিলেন যে জাদুকরদের মিথ্যা কৌশল কখনোই বিজয়ী হতে পারে না।',
    targetBenefitBn: 'যেকোনো কৃত্রিম জাদু, তুকতাক ও শয়তানি বন্ধন অবিলম্বে অকার্যকর করা।',
    arabic: 'فَلَمَّا أَلْقَوْا قَالَ مُوسَىٰ مَا جِئْتُم بِهِ السِّحْرُ ۖ إِنَّ اللَّهَ سَيُبْطِلُهُ ۖ إِنَّ اللَّهَ لَا يُصْلِحُ عَمَلَ الْمُفْسِدِينَ ۝ وَيُحِقُّ اللَّهُ الْحَقَّ بِكَلِمَاتِهِ وَلَوْ كَرِهَ الْمُجْرِمُونَ',
    transliterationBn: 'ফালাম্মা- আলক্বাও ক্বালা মূসা মা জি’তুম বিহিস সিহর, ইন্নাল্লা-হা সাইউবত্বিলুহ, ইন্নাল্লা-হা লা ইয়ুসলিহু আমালাল মুফসিদীন। ওয়া ইয়ুহিক্কুল্লা-হুল হাক্কা বিকালিমা-তিহী ওয়ালাও কারিহাল মুজরিমূন।',
    translationBn: 'অতপর যখন তারা ফেলল, মুসা বললেন: তোমরা যা এনেছ তা জাদু; নিশ্চয় আল্লাহ তা অসার করে দেবেন। নিশ্চয় আল্লাহ ফাসাদ সৃষ্টিকারীদের কাজ সংশোধন করেন না। আর আল্লাহ স্বীয় বাণীর মাধ্যমে সত্যকে প্রতিষ্ঠিত করবেন, যদিও পাপীরা তা অপছন্দ করে।',
    source: 'সূরা ইউনুস: ৮১–৮২, সূরা আল-আ’রাফ: ১১৮–১২২, সূরা ত্বা-হা: ৬৯',
    repeatCount: 7,
    repeatNoteBn: 'সকালে ও সন্ধ্যায় ৭ বার করে পাঠ করুন।',
    instructionsBn: [
      'দৃঢ় বিশ্বাস রেখে পাঠ করুন যে আল্লাহর বাণীর সামনে কোনো জাদু টিকতে পারে না।',
      'প্রয়োজনে পানিতে ফুঁ দিয়ে তা দিয়ে গোসল করতে পারেন।',
    ],
    audioUrls: [
      'https://everyayah.com/data/Alafasy_128kbps/010081.mp3',
      'https://everyayah.com/data/Alafasy_128kbps/010082.mp3',
    ],
    audioSlowUrl: 'https://everyayah.com/data/Alafasy_128kbps/010081.mp3',
    audioFullUrl: 'https://everyayah.com/data/Alafasy_128kbps/010081.mp3',
  },

  // 3. Jinn & Waswasa
  {
    id: 'ruq_waswasa_dua',
    titleBn: 'শয়তানের উপস্থিতি ও প্ররোচনা থেকে মুক্তির দোয়া',
    titleAr: 'رَّبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ',
    category: 'jinn_waswasa',
    categoryBn: 'জ্বিন ও কুচিন্তা তাড়ানো',
    purposeBn: 'আল্লাহ তায়ালা স্বয়ং রাসূলুল্লাহ (সা.)-কে শয়তানের অনিষ্ট ও তার সান্নিধ্য থেকে আশ্রয় চাওয়ার জন্য এই দোয়া শিক্ষা দিয়েছেন।',
    targetBenefitBn: 'অন্তরে অহেতুক খারাপ চিন্তা, ভীতি ও জিনের উপস্থিতি দূর হয়।',
    arabic: 'رَّبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ ۝ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ',
    transliterationBn: 'রাব্বি আ‘ঊযু বিকা মিন হামাযা-তিশ শায়াত্বীন। ওয়া আ‘ঊযু বিকা রাব্বি আঁই ইয়াহদ্বুরূন।',
    translationBn: 'হে আমার পালনকর্তা! আমি শয়তানদের প্ররোচনা থেকে আপনার কাছে পানাহ চাই। আর হে আমার রব! আমি আপনার আশ্রয় চাই যেন তারা আমার কাছে উপস্থিত না হতে পারে।',
    source: 'সূরা আল-মুমিনুন: ৯৭–৯৮',
    repeatCount: 3,
    repeatNoteBn: 'ওয়াসওয়াসা বা অস্বস্তি বোধ হলেই ৩ বার পাঠ করুন।',
    instructionsBn: [
      'বাম দিকে ৩ বার হালকা থুতুর ভাব (শুষ্ক ফুঁ) দিয়ে এই দোয়া পাঠ করুন।',
      '‘আউযুবিল্লাহি মিনাশ শাইতানির রাজিম’ বেশি বেশি পড়ুন।',
    ],
    audioUrls: [
      'https://everyayah.com/data/Alafasy_128kbps/023097.mp3',
      'https://everyayah.com/data/Alafasy_128kbps/023098.mp3',
    ],
    audioSlowUrl: 'https://everyayah.com/data/Alafasy_128kbps/023097.mp3',
    audioFullUrl: 'https://everyayah.com/data/Alafasy_128kbps/023097.mp3',
  },
  {
    id: 'ruq_azan_waswasa',
    titleBn: 'আযানের মাধ্যমে জিন ও শয়তান দূরীকরণ',
    titleAr: 'الأذان لطرد الشياطين',
    category: 'jinn_waswasa',
    categoryBn: 'শয়তান বিতাড়ন',
    purposeBn: 'সহিহ হাদিসে এসেছে, আযান দেওয়া হলে শয়তান সশব্দে বায়ু ত্যাগ করতে করতে বহুদূরে পালিয়ে যায়।',
    targetBenefitBn: 'ঘরের বাতাস থেকে অশুভ শক্তির প্রভাব সম্পূর্ণ বিতাড়িত হয়।',
    arabic: 'اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ ، اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ ، أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ ، أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ ، حَيَّ عَلَى الصَّلَاةِ ، حَيَّ عَلَى الصَّلَاةِ ، حَيَّ عَلَى الْفَلَاحِ ، حَيَّ عَلَى الْفَلَاحِ ، اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ ، لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliterationBn: 'আল্লাহু আকবার আল্লাহু আকবার, আল্লাহু আকবার আল্লাহু আকবার। আশহাদু আল লা ইলাহা ইল্লাল্লাহ, আশহাদু আল লা ইলাহা ইল্লাল্লাহ। আশহাদু আন্না মুহাম্মাদার রাসূলুল্লাহ, আশহাদু আন্না মুহাম্মাদার রাসূলুল্লাহ। হাইয়া ‘আলাস সালাহ, হাইয়া ‘আলাস সালাহ। হাইয়া ‘আলাল ফালাহ, হাইয়া ‘আলাল ফালাহ। আল্লাহু আকবার আল্লাহু আকবার। লা ইলাহা ইল্লাল্লাহ।',
    translationBn: 'আল্লাহ মহান, আল্লাহ মহান। আল্লাহ মহান, আল্লাহ মহান। আমি সাক্ষ্য দিচ্ছি যে আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই। আমি সাক্ষ্য দিচ্ছি যে মুহাম্মদ আল্লাহর রাসূল। সালাতের দিকে এসো। কল্যাণের দিকে এসো। আল্লাহ মহান, আল্লাহ মহান। আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই।',
    source: 'সহিহ বুখারি: ৬০৮, সহিহ মুসলিম: ৩৮৯',
    repeatCount: 1,
    repeatNoteBn: 'ঘরে অস্বস্তি বোধ হলে উচ্চকণ্ঠে আযান দিন বা অডিও শুনুন।',
    instructionsBn: [
      'ঘরের ডান ও বাম কোণে দাঁড়িয়ে স্পষ্ট স্বরে আযান দিন।',
    ],
  },

  // 4. Sleep Fear, Nightmare & Paralysis (ঘুমে চেপে ধরা)
  {
    id: 'ruq_night_paralysis',
    titleBn: 'ঘুমে চেপে ধরা (Sleep Paralysis) ও ভীতির মাসনূন দোয়া',
    titleAr: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ',
    category: 'sleep_nightmare',
    categoryBn: 'দুঃস্বপ্ন ও বোবায় ধরা নিবারণ',
    purposeBn: 'খালিদ ইবনুল ওয়ালীদ (রা.) রাতের বেলা দুঃস্বপ্ন ও আতঙ্কে ভুগলে রাসূলুল্লাহ (সা.) তাঁকে এই বাক্যগুলো পাঠ করার নির্দেশ দেন।',
    targetBenefitBn: 'ঘুমের ঘোরে বুকে ভার হওয়া, শ্বাসকষ্টের ভীতি ও রাতের ভয় দূর হয়।',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ',
    transliterationBn: 'আউযু বিকালিমা-তিল্লা-হিত তা-ম্মা-তি মিন গাদ্বাবিহী ওয়া ‘ইক্বা-বিহী ওয়া শাররি ‘ইবা-দিহী, ওয়া মিন হামাযা-তিশ শায়াত্বীনি ওয়া আঁই ইয়াহদুরূন।',
    translationBn: 'আমি আল্লাহর পূর্ণাঙ্গ বাণীসমূহের মাধ্যমে পানাহ চাই তাঁর ক্রোধ, তাঁর শাস্তি ও তাঁর বান্দাদের অনিষ্ট থেকে; এবং শয়তানদের প্ররোচনা ও আমার কাছে তাদের উপস্থিতি থেকে।',
    source: 'সুনান আবু দাউদ: ৩৮৯৩, তিরমিজি: ৩৫২৮ (হাসান)',
    repeatCount: 3,
    repeatNoteBn: 'বিছানায় শোয়ার পর এবং দুঃস্বপ্ন দেখে জেগে উঠলে পাঠ করুন।',
    instructionsBn: [
      'ঘুমানোর আগে অজু করুন এবং বিছানা ৩ বার ঝেড়ে নিন।',
      'ডান কাতে শুয়ে দোয়াটি পাঠ করুন।',
      'খারাপ স্বপ্ন দেখলে বাম দিকে ৩ বার হালকা থুতুর ভঙ্গি করে পাশে ফিরে শুয়ে পড়ুন।',
    ],
  },
  {
    id: 'ruq_nightmare_action',
    titleBn: 'দুঃস্বপ্ন দেখলে সুন্নাহসম্মত ৪টি জরুরি আমল',
    titleAr: 'ما يفعل من رأى الرؤيا المكروهة',
    category: 'sleep_nightmare',
    categoryBn: 'দুঃস্বপ্নের ক্ষতিমুক্ত থাকা',
    purposeBn: 'রাসূলুল্লাহ (সা.) বলেছেন, "ভালো স্বপ্ন আল্লাহর পক্ষ থেকে আর খারাপ স্বপ্ন শয়তানের পক্ষ থেকে। যে ব্যক্তি খারাপ স্বপ্ন দেখে সে যেন এই আমলগুলো করে, তবে তা তার কোনো ক্ষতি করতে পারবে না।" ',
    targetBenefitBn: 'দুঃস্বপ্ন বাস্তব জীবনে কোনো রূপ ক্ষতি ফেলতে পারে না।',
    arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ، وَمِنْ شَرِّ هَٰذِهِ الرُّؤْيَا',
    transliterationBn: 'আউযু বিল্লা-হি মিনাশ শায়ত্বা-নির রাজীম, ওয়া মিন শাররি হাযিহির রু’ইয়া।',
    translationBn: 'আমি বিতাড়িত শয়তান থেকে এবং এই স্বপ্নের অনিষ্ট থেকে আল্লাহর আশ্রয় প্রার্থনা করছি।',
    source: 'সহিহ বুখারি: ৬৯৮৬, সহিহ মুসলিম: ২২৬১',
    repeatCount: 3,
    repeatNoteBn: 'ঘুম ভেঙে যাওয়ার সাথে সাথে এই আমলগুলো করুন।',
    instructionsBn: [
      '১. বাম দিকে ৩ বার হালকা থুতু নিক্ষেপের ভঙ্গি (শুষ্ক দম) করুন।',
      '২. ৩ বার "আউযুবিল্লাহি মিনাশ শাইতানির রাজিম" পাঠ করুন।',
      '৩. যে কাতে শুয়েছিলেন তা পরিবর্তন করে অন্য কাতে শুয়ে পড়ুন।',
      '৪. এই খারাপ স্বপ্নের কথা কারও কাছে ভুলেও প্রকাশ করবেন না। ইচ্ছা হলে উঠে ২ রাকাত নফল সালাত পড়ুন।',
    ],
  },

  // 5. Illness & Pain
  {
    id: 'ruq_pain_relief_body',
    titleBn: 'ব্যথার স্থানে হাত রেখে শিফার সহিহ দোয়া',
    titleAr: 'بِاسْمِ اللَّهِ (ثَلَاثًا) ، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ...',
    category: 'illness_pain',
    categoryBn: 'শারীরিক যাতনা নিরাময়',
    purposeBn: 'উসমান ইবনে আবুল আস (রা.) শরীরে তীব্র যন্ত্রণার কথা জানালে রাসূলুল্লাহ (সা.) তাঁকে ব্যথার স্থানে হাত রেখে এই আমলটি করতে বলেন। তিনি তা করে পুরোপুরি সুস্থ হন।',
    targetBenefitBn: 'মাথাব্যথা, বুকব্যথা, পেটব্যথা বা শরীরের যেকোনো দীর্ঘস্থায়ী ব্যথায় আত্মিক উপশম।',
    arabic: 'بِسْمِ اللَّهِ ، أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ',
    transliterationBn: 'বিসমিল্লাহ (৩ বার)। আউযু বিল্লা-হি ওয়া ক্বুদরাতিহী মিন শাররি মা- আজিদু ওয়া উহা-যিরু (৭ বার)।',
    translationBn: 'আল্লাহর নামে (৩ বার)। আমি আল্লাহর নিকট এবং তাঁর কুদরতের আশ্রয়ে পানাহ চাই আমি যে ব্যথা অনুভব করছি এবং যার আশঙ্কা করছি তার অনিষ্ট থেকে (৭ বার)।',
    source: 'সহিহ মুসলিম: ২২০২',
    repeatCount: 7,
    repeatNoteBn: 'প্রথমে ৩ বার বিসমিল্লাহ, এরপর ৭ বার দোয়াটি পড়ুন।',
    instructionsBn: [
      'আপনার ডান হাতটি শরীরের যে স্থানে ব্যথা সেখানে স্থাপন করুন।',
      'মনোযোগ দিয়ে ৩ বার ‘বিসমিল্লাহ’ বলুন।',
      'অতঃপর ৭ বার উপরোক্ত দোয়াটি পূর্ণ দৃঢ়তায় পাঠ করুন।',
    ],
  },
  {
    id: 'ruq_general_cure_prophet',
    titleBn: 'রোগীর শিফার জন্য রাসূলুল্লাহ (সা.)-এর দোআ',
    titleAr: 'أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ اشْفِ أَنْتَ الشَّافِي',
    category: 'illness_pain',
    categoryBn: 'রোগমুক্তি প্রার্থনা',
    purposeBn: 'নবী করীম (সা.) তাঁর পরিবারের কেউ অসুস্থ হলে ডান হাত দিয়ে রোগীর শরীরে মাসাহ করে এই দোয়াটি পড়তেন।',
    targetBenefitBn: 'সকল শারীরিক ও আত্মিক রোগব্যাধি থেকে আরোগ্য লাভ।',
    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ ، اشْفِ أَنْتَ الشَّافِي ، لَا شِفَاءَ إِلَّا شِفَاؤُكَ ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
    transliterationBn: 'আল্লা-হুম্মা রাব্বান না-সি আযহিবিল বা’স, ইশফি আনতাশ শা-ফী, লা- শিফা-আ ইল্লা- শিফা-উকা, শিফা-আন লা- ইউগাদিরু সাক্বামা।',
    translationBn: 'হে আল্লাহ! মানবজাতির প্রতিপালক! আপনি কষ্ট দূর করে দিন। আপনি আরোগ্য দান করুন, আপনিই একমাত্র আরোগ্যকারী। আপনার শিফা ছাড়া আর কোনো শিফা নেই; এমন আরোগ্য দিন যা কোনো রোগ অবশিষ্ট রাখে না।',
    source: 'সহিহ বুখারি: ৫৭৪৩, সহিহ মুসলিম: ২১৯১',
    repeatCount: 3,
    repeatNoteBn: 'রোগীর পাশে বসে ৩ বার পাঠ করা সুন্নাত।',
    instructionsBn: [
      'রোগীর মাথায় বা বুকে হাত রেখে পাঠ করুন।',
    ],
  },

  // 6. Child, Family & Home Shield
  {
    id: 'ruq_child_shield',
    titleBn: 'সন্তান ও শিশুদের বদনজর থেকে সুরক্ষার দোয়া',
    titleAr: 'تَعْوِيذُ الأَوْلَادِ مِنَ العَيْنِ وَالشَّيْطَانِ',
    category: 'child_family_home',
    categoryBn: 'শিশুদের হিফাজত',
    purposeBn: 'শিশুরা দ্রুত বদনজরের শিকার হয়। রাসূলুল্লাহ (সা.) হাসান ও হুসাইন (রা.)-কে এই বাক্যগুলো পড়ে ফুঁ দিতেন।',
    targetBenefitBn: 'শিশুর অহেতুক রাতে কান্না, ভয় পাওয়া ও স্বাস্থ্যহানি থেকে সুরক্ষা।',
    arabic: 'أُعِيذُكَ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    transliterationBn: 'উ‘ঈযুকা বিকালিমা-তিল্লা-হিত তা-ম্মাতি মিন কুল্লি শাইত্বা-নিঁও ওয়া হা-ম্মাহ, ওয়া মিন কুল্লি ‘আইনিন লা-ম্মাহ। (মেয়ে শিশুর ক্ষেত্রে ‘উ‘ঈযুকি’)',
    translationBn: 'আমি তোমাকে আল্লাহর পূর্ণাঙ্গ কালামের আশ্রয়ে সোপর্দ করছি সকল শয়তান থেকে, বিষাক্ত প্রাণী থেকে এবং ক্ষতিকর বদনজর থেকে।',
    source: 'সহিহ বুখারি: ৩৩৭১',
    repeatCount: 3,
    repeatNoteBn: 'প্রতিদিন সকাল ও সন্ধ্যায় শিশুর মাথায় হাত রেখে পড়ুন।',
    instructionsBn: [
      'শিশুর মাথায় কোমলভাবে হাত রাখুন।',
      'দোয়াটি ৩ বার পাঠ করে শিশুর পুরো গায়ে হালকা ফুঁ দিন।',
    ],
  },
  {
    id: 'ruq_home_baqarah',
    titleBn: 'ঘর থেকে শয়তান তাড়াতে সূরা বাকারাহ তিলাওয়াত',
    titleAr: 'قراءة سورة البقرة في البيت',
    category: 'child_family_home',
    categoryBn: 'ঘরের বরকত ও নিরাপত্তা',
    purposeBn: 'রাসূলুল্লাহ (সা.) বলেছেন, "তোমরা তোমাদের ঘরসমূহকে কবর বানিও না। যে ঘরে সূরা আল-বাকারাহ তিলাওয়াত করা হয়, সে ঘর থেকে শয়তান পলায়ন করে।" ',
    targetBenefitBn: 'ঘরের পারিবারিক অশান্তি, কলহ, ভীতি ও জিনের উপস্থিতি দূরীভূত হয়।',
    arabic: 'إِنَّ الشَّيْطَانَ يَنْفِرُ مِنَ الْبَيْتِ الَّذِي تُقْرَأُ فِيهِ سُورَةُ الْبَقَرَةِ',
    transliterationBn: 'ইন্নাশ শাইত্বা-না ইয়ানফিরু মিনাল বাইতিল্লাযী তুক্বরাউ ফীহি সূরাতুল বাক্বারাহ।',
    translationBn: 'নিশ্চয়ই শয়তান সেই ঘর থেকে পালিয়ে যায় যে ঘরে সূরা আল-বাকারাহ পড়া হয়।',
    source: 'সহিহ মুসলিম: ৭৮০',
    repeatCount: 1,
    repeatNoteBn: 'প্রতি ৩ দিনে অন্তত একবার ঘরে সূরা বাকারাহ পাঠ বা অডিও বাজানো উচিত।',
    instructionsBn: [
      'ঘরের সদস্যরা মিলে পুরো সূরা বাকারাহ তিলাওয়াত করুন অথবা পরিষ্কার কণ্ঠে অডিও প্লে করুন।',
    ],
    audioSlowUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/002.mp3',
    audioFullUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/002.mp3',
  },

  // 9. Anxiety & Fear (Ayatus Sakinah)
  {
    id: 'ruq_ayatus_sakinah',
    titleBn: 'আয়াতুস সাকিনাহ (অন্তরের স্থিরতা ও মন শান্তির আয়াত)',
    titleAr: 'آيَاتُ السَّكِينَةِ لِطُمَأْنِينَةِ القَلْبِ',
    category: 'anxiety_fear',
    categoryBn: 'মানসিক প্রশান্তি লাভ',
    purposeBn: 'ইমাম ইবনে তাইমিয়্যাহ (রহ.) কঠিন বিপদ ও মানসিক আতঙ্কের সময় আয়াতুস সাকিনাহ পাঠ করতেন এবং এতে অভূতপূর্ব অলৌকিক মানসিক শান্তি পেতেন।',
    targetBenefitBn: 'আতঙ্কগ্রস্ত মন শান্ত হয়, বুক ধড়ফড়ানি কমে এবং অন্তরে গভীর আল্লাহভক্তি ও স্থিরতা নেমে আসে।',
    arabic: 'هُوَ الَّذِي أَنزَلَ السَّكِينَةَ فِي قُلُوبِ الْمُؤْمِنِينَ لِيَزْدَادُوا إِيمَانًا مَّعَ إِيمَانِهِمْ ۗ وَلِلَّهِ جُنُودُ السَّمَاوَاتِ وَالْأَرْضِ ۚ وَكَانَ اللَّهُ عَلِيمًا حَكِيمًا',
    transliterationBn: 'হুওয়াল্লাযী আনযালাস সাকীনা-তা ফী কুলূবিল মু’মিনীনা লিইয়াযদা-দূ ঈমা-নাম মা‘আ ঈমা-নিহিম, ওয়ালিল্লা-হি জুনূদুস সামা-ওয়া-তি ওয়াল আরদ্ব, ওয়াকা-নাল্লা-হু ‘অালীমান হাকীমা।',
    translationBn: 'তিনিই মুমিনদের অন্তরে প্রশান্তি নাজিল করেছিলেন, যেন তাদের ঈমানের সাথে আরও ঈমান বৃদ্ধি পায়। আর আসমান ও জমিনের যাবতীয় বাহিনী আল্লাহরই; আর আল্লাহ সর্বজ্ঞ, প্রজ্ঞাময়।',
    source: 'সূরা আল-ফাতহ: ৪, সূরা আত-তাওবাহ: ২৬ ও ৪০',
    repeatCount: 7,
    repeatNoteBn: 'বুকে ডান হাত রেখে ৭ বার পাঠ করুন।',
    instructionsBn: [
      'বুকে ডান হাত রাখুন।',
      'ধীরে ধীরে শ্বাস নিন ও ছাড়ুন, অতঃপর আয়াতটি অর্থ উপলব্ধি করে তিলাওয়াত করুন।',
    ],
    audioSlowUrl: 'https://everyayah.com/data/Alafasy_128kbps/048004.mp3',
    audioFullUrl: 'https://everyayah.com/data/Alafasy_128kbps/048004.mp3',
  },
  {
    id: 'ruq_yunus_dua',
    titleBn: 'দোয়া ইউনুস (বিপদ ও গভীর দুশ্চিন্তা মুক্তির দোয়া)',
    titleAr: 'دُعَاءُ ذِي النُّونِ (لَا إِلَٰهَ إِلَّا أَنْتَ...)',
    category: 'anxiety_fear',
    categoryBn: 'সংকট মোচন',
    purposeBn: 'রাসূলুল্লাহ (সা.) বলেছেন, "মাছের পেটে ইউনুস (আ.) যে দোয়া পাঠ করেছিলেন, কোনো মুসলিম কোনো বিপদে পড়ে এই দোয়া করলে আল্লাহ অবশ্যই তা কবুল করেন।" ',
    targetBenefitBn: 'যেকোনো অবর্ণনীয় সংকট, মনের চাপ ও কঠিন পরিস্থিতি থেকে মুক্তির পথ খুলে যায়।',
    arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliterationBn: 'লা- ইলা-হা ইল্লা- আনতা সুবহা-নাকা ইন্নী কুনতু মিনায যা-লিমীন।',
    translationBn: 'আপনি ছাড়া কোনো সত্য উপাস্য নেই; আপনি মহা পবিত্র! নিশ্চয়ই আমি জালিমদের অন্তর্ভুক্ত ছিলাম।',
    source: 'সূরা আল-আম্বিয়া: ৮৭, সুনান তিরমিজি: ৩৫০৫ (সহিহ)',
    repeatCount: 40,
    repeatNoteBn: 'যত বেশি সম্ভব পাঠ করুন (৪০ বার পাঠের বিশেষ ফজিলত রয়েছে)।',
    instructionsBn: [
      'তওবার নিয়তে একমনে পাঠ করতে থাকুন।',
    ],
    audioSlowUrl: 'https://everyayah.com/data/Alafasy_128kbps/021087.mp3',
    audioFullUrl: 'https://everyayah.com/data/Alafasy_128kbps/021087.mp3',
  },

  // 10. Repentance & Purity
  {
    id: 'ruq_repentance_sayyidul',
    titleBn: 'সাইয়্যিদুল ইস্তিগফার (শ্রেষ্ঠ ক্ষমাপ্রার্থনা ও তওবা)',
    titleAr: 'سَيِّدُ الاسْتِغْفَارِ',
    category: 'repentance_purification',
    categoryBn: 'পাপমুক্তি ও আত্মসংযম',
    purposeBn: 'রাসূলুল্লাহ (সা.) বলেছেন, "যে ব্যক্তি দৃঢ় বিশ্বাসের সাথে সকালে এ দোয়া পাঠ করবে এবং সন্ধ্যায় পৌঁছার আগেই মারা যাবে, সে জান্নাতি হবে।" ',
    targetBenefitBn: 'গুনাহের কালিমা দূর হয়, কুপ্রবৃত্তির দাসত্ব থেকে মুক্তি মেলে এবং অন্তরের পবিত্রতা অর্জিত হয়।',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    transliterationBn: 'আল্লা-হুম্মা আনতা রাব্বী লা- ইলা-হা ইল্লা- আনতা, খালাক্বতানী ওয়া আনা ‘আবদুকা, ওয়া আনা ‘অালা- ‘আহদিকা ওয়া ওয়া‘দিকা মাসতাত্বা‘তু, আ‘ঊযু বিকা মিন শাররি মা- সানাতু, আবূউ লাকা বিনি‘মাতিকা ‘আলাইয়্যা, ওয়া আবূউ বিযানবী ফাগফির লী, ফাইন্নাহূ লা- ইয়াগফিরুয যুনূবা ইল্লা- আনতা।',
    translationBn: 'হে আল্লাহ! আপনিই আমার প্রতিপালক। আপনি ছাড়া কোনো সত্য ইলাহ নেই। আপনি আমাকে সৃষ্টি করেছেন এবং আমি আপনার বান্দা। আমি যথাসাধ্য আপনার অঙ্গীকার ও প্রতিশ্রুতির ওপর অবিচল আছি। আমি যা করেছি তার অনিষ্ট থেকে আপনার কাছে আশ্রয় চাই। আমার ওপর আপনার যে অনুগ্রহ রয়েছে তা স্বীকার করছি এবং আমার অপরাধ স্বীকার করছি। অতএব আমাকে ক্ষমা করুন; কারণ আপনি ছাড়া কেউই গুনাহ ক্ষমা করতে পারে না।',
    source: 'সহিহ বুখারি: ৬৩০৬',
    repeatCount: 1,
    repeatNoteBn: 'প্রতিদিন সকাল ও সন্ধ্যায় অত্যন্ত বিনয়ের সাথে পাঠ করুন।',
    instructionsBn: [
      'অতীতের সকল অন্যায়ের জন্য অনুতপ্ত হয়ে পাঠ করুন।',
    ],
  },
  {
    id: 'ruq_full_shariyyah',
    titleBn: 'সম্পূর্ণ রুকইয়াহ শারইয়াহ অডিও (Full Ruqyah Audio)',
    titleAr: 'الرقية الشرعية الكاملة الشاملة',
    category: 'evil_eye',
    categoryBn: 'সম্পূর্ণ রুকইয়াহ',
    purposeBn: 'কুরআনুল কারিমের বিভিন্ন সূরা-আয়াত ও সহিহ সুন্নাহর মাসনূন দোয়ার সমন্বয়ে পূর্ণাঙ্গ রুকইয়াহ শারইয়াহ অডিও। বদনজর, জাদু, জিন ও মানসিক অস্থিরতা দূরীকরণে অত্যন্ত শক্তিশালী।',
    targetBenefitBn: 'বদনজর, কুপ্রভাব, জাদুটোনা ও শারীরিক-মানসিক যাবতীয় অশান্তি দূর করে অন্তরে আল্লাহর রহমত ও প্রশান্তি প্রতিষ্ঠা করে।',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ، أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ ، اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ، قُلْ هُوَ اللَّهُ أَحَدٌ ، قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ، قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
    transliterationBn: 'বিসমিল্লাহির রাহমানির রাহিম। আউযু বিকালিমা-তিল্লা-হিত তা-ম্মা-তি মিন শাররি মা- খালাক্ব। আল্লা-হু লা- ইলা-হা ইল্লা- হুওয়াল হাইয়্যুল ক্বাইয়্যূম...',
    translationBn: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু। আমি আল্লাহর পূর্ণাঙ্গ বাণীসমূহের আশ্রয়ে পানাহ চাই তাঁর সৃষ্টির যাবতীয় অনিষ্ট থেকে। আল্লাহ, তিনি ছাড়া কোনো সত্য উপাস্য নেই, তিনি চিরঞ্জীব...',
    source: 'কুরআনুল কারিম ও সহিহ সুন্নাহ ভিত্তিক প্রখ্যাত ক্বারীর পূর্ণাঙ্গ তিলাওয়াত',
    repeatCount: 1,
    repeatNoteBn: 'মনোযোগ দিয়ে দিনে অন্তত একবার সম্পূর্ণ শুনুন।',
    instructionsBn: [
      'শান্ত ও পবিত্র পরিবেশে ওজু অবস্থায় বসে শুনুন।',
      'তিলাওয়াত চলাকালে অন্তরে আল্লাহর ওপর পূর্ণ তাওয়াক্কুল রাখুন।',
      'প্রয়োজনে এক গ্লাস খাবার পানি সামনে রেখে শুনুন এবং তিলাওয়াত শেষে তাতে দম করে পান করুন।',
    ],
    audioSlowUrl: 'https://cdn.mp3quran.net/audio/ruqyah/sadhan.mp3',
    audioFullUrl: 'https://cdn.mp3quran.net/audio/ruqyah/sadhan.mp3',
  },
];

// Smart Ruqyah Suggestion NLP Keyword Matcher supporting Bengali, Banglish, English, and Arabic
export interface RuqyahSearchMatch {
  matchedItem: RuqyahItem;
  categoryMeta: RuqyahCategoryMeta;
  matchedReasonBn: string; // "কেন এই রুকইয়াহ"
  isPrimary: boolean;
  score: number;
}

export function matchRuqyahByQuery(rawQuery: string): {
  primaryMatch: RuqyahSearchMatch | null;
  secondaryMatches: RuqyahSearchMatch[];
  detectedIntentBn: string;
  hasMedicalAlert: boolean;
  medicalAlertMessageBn?: string;
} {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return {
      primaryMatch: null,
      secondaryMatches: [],
      detectedIntentBn: '',
      hasMedicalAlert: false,
    };
  }

  // Safety Medical Condition Check
  const medicalKeywords = [
    'chest pain', 'buke betha', 'buk betha', 'buk betha kore', 'seizure', 'khichuni', 'faint', 'oggan',
    'suicide', 'attoghati', 'buke chap', 'shashkosto', 'breathing problem', 'panic attack', 'tibrw ontongko',
    'বুকব্যথা', 'বুকে ব্যথা', 'শ্বাসকষ্ট', 'খিঁচুনি', 'অজ্ঞান', 'আত্মহত্যার চিন্তা'
  ];
  const hasMedicalAlert = medicalKeywords.some(mk => query.includes(mk));
  const medicalAlertMessageBn = hasMedicalAlert
    ? 'সতর্কতা: বুকে তীব্র ব্যথা, শ্বাসকষ্ট, খিঁচুনি, অজ্ঞান হওয়া বা অতিরিক্ত আতঙ্কের উপসর্গ দেখা দিলে অবিলম্বে নিকটস্থ চিকিৎসক বা হাসপাতালে জরুরি সেবা নিন। রুকইয়াহ কোনো জরুরি শারীরিক চিকিৎসার বিকল্প নয়।'
    : undefined;

  // Normalized Banglish Dictionary rules
  let matchedCategoryId: RuqyahCategory | null = null;
  let reasonBn = '';
  let intentBn = '';

  // 1. Sleep Paralysis / Chepe Dhore / Nightmare
  if (
    query.includes('chepe dhore') ||
    query.includes('chepe') ||
    query.includes('sleep paralysis') ||
    query.includes('nightmare') ||
    query.includes('dussopno') ||
    query.includes('duswapno') ||
    query.includes('bovay') ||
    query.includes('bobay') ||
    query.includes('ghume voy') ||
    query.includes('ghume voy lage') ||
    query.includes('ঘুমের ভয়') ||
    query.includes('চেপে ধরে') ||
    query.includes('দুঃস্বপ্ন')
  ) {
    matchedCategoryId = 'sleep_nightmare';
    intentBn = 'ঘুমের ভয় ও দুঃস্বপ্ন (Night Protection)';
    reasonBn = 'ঘুমে চেপে ধরা বা দুঃস্বপ্নের ভয় নিবারণে সুন্নাহসম্মত রাতের সুরক্ষা দোআ সর্বাধিক কার্যকর।';
  }
  // 2. Bad Nojor / Evil Eye / Hasad
  else if (
    query.includes('bad nojor') ||
    query.includes('bod nojor') ||
    query.includes('bodnojor') ||
    query.includes('badnojor') ||
    query.includes('evil eye') ||
    query.includes('hasad') ||
    query.includes('hingsha') ||
    query.includes('chokh lagse') ||
    query.includes('chokh laga') ||
    query.includes('nojor lagse') ||
    query.includes('বদনজর') ||
    query.includes('হাসাদ') ||
    query.includes('নজর লেগেছে')
  ) {
    matchedCategoryId = 'evil_eye';
    intentBn = 'বদনজর ও হিংসা থেকে নিষ্কৃতি';
    reasonBn = 'বদনজর সত্য এবং তা বিনষ্টে সূরা ফাতিহা, তিন কুল ও রাসুলুল্লাহ (সা.)-এর শেখানো দোয়া অদ্বিতীয় ঢাল।';
  }
  // 3. Jadu / Sihr / Magic
  else if (
    query.includes('jadu') ||
    query.includes('jaddu') ||
    query.includes('sihor') ||
    query.includes('sihr') ||
    query.includes('magic') ||
    query.includes('tuktuk') ||
    query.includes('ban marse') ||
    query.includes('tabij') ||
    query.includes('জাদু') ||
    query.includes('সিহর') ||
    query.includes('বান মারা')
  ) {
    matchedCategoryId = 'magic_sihr';
    intentBn = 'জাদু ও সিহরের প্রভাব ধ্বংস';
    reasonBn = 'সূরা বাকারার আয়াতুল কুরসি ও সিহর বিনষ্টকারী কুরআনের বিশেষ আয়াত জাদুর প্রভাব চিরতরে অসার করে দেয়।';
  }
  // 4. Jinn / Waswasa / Bhoy
  else if (
    query.includes('jin') ||
    query.includes('jinn') ||
    query.includes('jin er voy') ||
    query.includes('bhut') ||
    query.includes('waswasa') ||
    query.includes('kuchinta') ||
    query.includes('bhoot') ||
    query.includes('ভয় লাগে') ||
    query.includes('জিন') ||
    query.includes('ওয়াসওয়াসা')
  ) {
    matchedCategoryId = 'jinn_waswasa';
    intentBn = 'জ্বিনের ভয় ও শয়তানি ওয়াসওয়াসা থেকে আত্মরক্ষা';
    reasonBn = 'আযানের ধ্বনি ও আল্লাহর আশ্রয় প্রার্থনার আয়াত শয়তান ও দুষ্ট জ্বিনকে মুহূর্তেই দূরে বিতাড়িত করে।';
  }
  // 5. Illness / Pain / Betha
  else if (
    query.includes('betha') ||
    query.includes('byatha') ||
    query.includes('pain') ||
    query.includes('oshustho') ||
    query.includes('rog') ||
    query.includes('shifa') ||
    query.includes('matha betha') ||
    query.includes('ব্যথা') ||
    query.includes('অসুস্থতা') ||
    query.includes('রোগমুক্তি')
  ) {
    matchedCategoryId = 'illness_pain';
    intentBn = 'শারীরিক অসুস্থতা ও যন্ত্রণার শিফা';
    reasonBn = 'ব্যথার স্থানে ডান হাত রেখে রাসুলুল্লাহ (সা.) শেখানো দোয়া পাঠ করলে মহান আল্লাহ রহমত ও শিফা দান করেন।';
  }
  // 6. Child / Family / Ghor
  else if (
    query.includes('child') ||
    query.includes('bacha') ||
    query.includes('baccha') ||
    query.includes('baccader') ||
    query.includes('shishu') ||
    query.includes('poribar') ||
    query.includes('ghor') ||
    query.includes('বাচ্চা') ||
    query.includes('শিশু') ||
    query.includes('পরিবার')
  ) {
    matchedCategoryId = 'child_family_home';
    intentBn = 'সন্তান, পরিবার ও ঘরের নিরাপত্তা';
    reasonBn = 'শিশুদের উপর হাত রেখে পাঠ করার মাসনূন দোয়া তাদের রাত-দিনের বদনজর ও কান্না থেকে রক্ষা করে।';
  }
  // 7. Anxiety / Depressed / Tension / Voy
  else if (
    query.includes('anxiety') ||
    query.includes('tension') ||
    query.includes('depress') ||
    query.includes('depression') ||
    query.includes('mon kharap') ||
    query.includes('voy lage') ||
    query.includes('osthir') ||
    query.includes('shanti nai') ||
    query.includes('দুশ্চিন্তা') ||
    query.includes('অস্থিরতা') ||
    query.includes('মন শান্তি')
  ) {
    matchedCategoryId = 'anxiety_fear';
    intentBn = 'মানসিক অস্থিরতা ও দুশ্চিন্তা থেকে প্রশান্তি';
    reasonBn = 'আয়াতুস সাকিনাহ ও দোয়া ইউনুস পাঠ করলে মহান আল্লাহ সরাসরি অন্তরে স্বর্গীয় প্রশান্তি নাজিল করেন।';
  }
  // 8. Zina / Gunah / Taubah / Self-Control
  else if (
    query.includes('zina') ||
    query.includes('gunah') ||
    query.includes('pap') ||
    query.includes('taubah') ||
    query.includes('tobah') ||
    query.includes('chokh') ||
    query.includes('self control') ||
    query.includes('তওবা') ||
    query.includes('গুনাহ') ||
    query.includes('পবিত্রতা')
  ) {
    matchedCategoryId = 'repentance_purification';
    intentBn = 'আত্মসংযম, পবিত্রতা ও তওবা';
    reasonBn = 'সাইয়্যিদুল ইস্তিগফার অন্তরের সকল গোনাহ ধুয়ে পরিষ্কার করে এবং আত্মিক পরিশুদ্ধি এনে দেয়।';
  } else {
    // General fallback to Evil Eye / Fatihah
    matchedCategoryId = 'evil_eye';
    intentBn = 'সার্বজনীন আত্মিক সুরক্ষা ও রুকইয়াহ';
    reasonBn = 'সূরা ফাতিহা ও তিন কুল যেকোনো আত্মিক ও শারীরিক ব্যাধির বিরুদ্ধে পরীক্ষিত মহৌষধ।';
  }

  const categoryMeta = RUQYAH_CATEGORIES.find(c => c.id === matchedCategoryId)!;
  const items = RUQYAH_ITEMS.filter(item => item.category === matchedCategoryId);
  const primaryItem = items[0] || RUQYAH_ITEMS[0];
  const secondaryItems = items.slice(1, 3);

  const primaryMatch: RuqyahSearchMatch = {
    matchedItem: primaryItem,
    categoryMeta,
    matchedReasonBn: reasonBn,
    isPrimary: true,
    score: 1.0,
  };

  const secondaryMatches: RuqyahSearchMatch[] = secondaryItems.map(item => ({
    matchedItem: item,
    categoryMeta,
    matchedReasonBn: 'এই মূল রুকইয়াহর পাশাপাশি সহায়ক আমল হিসেবে পাঠ্য।',
    isPrimary: false,
    score: 0.8,
  }));

  return {
    primaryMatch,
    secondaryMatches,
    detectedIntentBn: intentBn,
    hasMedicalAlert,
    medicalAlertMessageBn,
  };
}
