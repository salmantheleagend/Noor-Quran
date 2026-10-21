import {
  RuqyahCategory,
  RuqyahCategoryMeta,
  RuqyahItem,
  RUQYAH_CATEGORIES,
  RUQYAH_ITEMS,
} from '../data/ruqyahData';

export interface RuqyahIntentAnalysis {
  matchedCategoryId: RuqyahCategory;
  categoryMeta: RuqyahCategoryMeta;
  confidence: number;
  detectedKeywords: string[];
  intentTitleBn: string;
  recommendedReasonBn: string;
  primaryRuqyah: RuqyahItem;
  recommendedPlaylist: RuqyahItem[];
  medicalAdviceRequired: boolean;
  medicalAlertMessageBn?: string;
  medicalAdviceMessageBn?: string;
}

export interface DailyRoutineStatus {
  date: string;
  completedIds: string[];
  total: number;
  completedCount: number;
  percentage: number;
  isFullyCompleted: boolean;
}

// LocalStorage Keys
const STORAGE_ROUTINE_PREFIX = 'noor_ruqyah_routine_';
const STORAGE_FAVORITES_KEY = 'noor_ruqyah_favorites_v2';
const STORAGE_HISTORY_KEY = 'noor_ruqyah_history_v2';
const STORAGE_OFFLINE_KEY = 'noor_ruqyah_offline_v2';

/**
 * Keyword Dictionaries for Intent Mapping
 * Supports: Bengali, Banglish (phonetic Roman script), English, and Arabic terms
 */
interface IntentRule {
  categoryId: RuqyahCategory;
  intentTitleBn: string;
  reasonBn: string;
  patterns: RegExp[];
  priority: number;
}

const INTENT_RULES: IntentRule[] = [
  // 1. Sleep Paralysis, Night Terrors & Nightmares (High priority for specific sleep attack phrases)
  {
    categoryId: 'sleep_nightmare',
    intentTitleBn: 'ঘুমে চেপে ধরা, দুঃস্বপ্ন ও রাতের ভীতি নিরাময়',
    reasonBn:
      'ঘুমে বোবায় বা চেপে ধরা ও দুঃস্বপ্ন দেখলে রাসুলুল্লাহ (সা.) নির্দেশিত ঘুমের মাসনূন দোয়া ও তিন কুল দ্বারা শরীর সুরক্ষার আমল আবশ্যক।',
    priority: 10,
    patterns: [
      /\b(chepe\s*dhore|chape\s*dhore|boba\s*bhoot|boba\s*vut|boba\s*dhorse|chapa\s*lage)\b/i,
      /\b(sleep\s*paralysis|night\s*terror|night\s*terrors|nightmare|bad\s*dream|dusshopno|dusswapno|duswapno)\b/i,
      /\b(ghume\s*voy|ghumer\s*voy|ghumer\s*moddhe|ghume\s*atke|ghumer\s*somoy|insomnia|onidra)\b/i,
      /(ঘুমে\s*চেপে\s*ধরা|চেপে\s*ধরে|বোবায়\s*ধরা|বোবায়|দুঃস্বপ্ন|খারাপ\s*স্বপ্ন|ঘুমের\s*ভয়|রাতে\s*ভয়)/i,
      /(كابوس|الجاثوم|فزع|أرق)/i,
    ],
  },

  // 2. Evil Eye / Hasad (Very common)
  {
    categoryId: 'evil_eye',
    intentTitleBn: 'বদনজর ও হিংসা (Evil Eye & Hasad) বিনষ্টকরণ',
    reasonBn:
      'রাসূলুল্লাহ (সা.) বলেছেন, "বদনজর সত্য।" সূরা ফাতিহা, তিন কুল এবং নবীজির মাসনূন রুকইয়াহ বদনজরের কুপ্রভাব সাথে সাথে নষ্ট করে।',
    priority: 9,
    patterns: [
      /\b(bad\s*nojor|bod\s*nojor|bad\s*nazar|bod\s*nazar|nojor\s*lagse|nazar\s*lagse|chokh\s*lagse|evil\s*eye)\b/i,
      /\b(hasad|hingsha|jealousy|envy|ain\s*hasad|al\s*ayn|al\s*ain)\b/i,
      /(বদনজর|বদ\s*নজর|চোখ\s*লাগা|নজর\s*লেগেছে|হাসাদ|হিংসা|কু\s*নজর|দৃষ্টি\s*দোষ)/i,
      /(عين|حسد|العين|الحسد)/i,
    ],
  },

  // 3. Black Magic & Sihr / Jadu
  {
    categoryId: 'magic_sihr',
    intentTitleBn: 'জাদু, কুফরি ও সিহর (Black Magic & Sihr) প্রতিরোধ',
    reasonBn:
      'কুরআনুল কারিমের সিহর বিনাশক আয়াতসমূহ এবং সূরা আল-বাকারাহ তিলাওয়াত করলে কোনো জাদু বা কুফরি টিকতে পারে না।',
    priority: 9,
    patterns: [
      /\b(jadu|kalo\s*jadu|black\s*magic|magic|witchcraft|sorcery|spell|voodoo)\b/i,
      /\b(sihor|sihr|sehr|tuna|totka|tabiz|ban\s*mara|kufri|kufur)\b/i,
      /(জাদু|কালো\s*জাদু|সিহর|বান\s*মারা|কুফরি|তাবিজ|টুনা|জাদুর\s*আছর|জাদুগ্রস্ত)/i,
      /(سحر|السحر|سحرة|عقد|النفث)/i,
    ],
  },

  // 4. Jinn & Demonic Whispers / Waswasa
  {
    categoryId: 'jinn_waswasa',
    intentTitleBn: 'জিনের ভয়, আছর ও শয়তানি ওয়াসওয়াসা থেকে আত্মরক্ষা',
    reasonBn:
      'আয়াতুল কুরসি ও আযান পাঠ করলে শয়তান ও খবিস জ্বিন শত মাইল দূরে পালিয়ে যায় এবং অন্তরে সুরক্ষা তৈরি হয়।',
    priority: 8,
    patterns: [
      /\b(jin|jinn|djinn|vut|bhoot|ghost|demon|evil\s*spirit|acher|asor|achor)\b/i,
      /\b(waswasa|wiswas|kuchinta|shoytan|shaytan|whisper|satanic)\b/i,
      /(জিন|জ্বীন|জিনের\s*ভয়|জিনের\s*আছর|ভুত|ওয়াসওয়াসা|কুচিন্তা|শয়তান|শয়তানের\s*প্ররোচনা|অন্তরে\s*সন্দেহ)/i,
      /(جن|الجن|مس|وسواس|الوسواس|الشيطان)/i,
    ],
  },

  // 5. Illness & Physical Pain (With Medical Safety Guidance)
  {
    categoryId: 'illness_pain',
    intentTitleBn: 'শারীরিক অসুস্থতা ও ব্যথাস্থানে হাত রেখে শিফা',
    reasonBn:
      'রাসূলুল্লাহ (সা.) নির্দেশ করেছেন ব্যথার স্থানে ডান হাত রেখে ৩ বার বিসমিল্লাহ ও ৭ বার মাসনূন দোয়া পাঠ করতে।',
    priority: 8,
    patterns: [
      /\b(betha|byatha|bedona|pain|body\s*pain|headache|matha\s*betha|pet\s*betha|chest\s*pain|buk\s*betha)\b/i,
      /\b(osukh|osustho|sick|illness|fever|jor|rog|shifa|cure|healing)\b/i,
      /(ব্যথা|শারীরিক\s*ব্যথা|অসুস্থতা|মাথা\s*ব্যথা|পেট\s*ব্যথা|বুকে\s*ব্যথা|জ্বর|রোগ|শিফা|আরোগ্য)/i,
      /(مرض|ألم|وجع|شفاء|صداع|حمى)/i,
    ],
  },

  // 6. Child, Family & Home Protection
  {
    categoryId: 'child_family_home',
    intentTitleBn: 'শিশু, পরিবার ও বাসগৃহের নিরাপত্তা ও বরকত',
    reasonBn:
      'শিশু কান্নাকাটি করলে বা ঘরে অশান্তি হলে রাসুলুল্লাহ (সা.)-এর শেখানো দোয়া পড়ে ফুঁ দেওয়া ও সূরা বাকারাহ চালু রাখা পরীক্ষিত সুন্নাহ।',
    priority: 7,
    patterns: [
      /\b(child|baccha|bacha|baby|shishu|kid|infant|bacha\s*kande|santanner)\b/i,
      /\b(ghor|home|bari|house|family|poribar|bou|shami|shongsar|ghorer\s*shanti)\b/i,
      /(বাচ্চা|শিশু|সন্তান|বাচ্চা\s*কান্না|ঘরের\s*শান্তি|ঘর|বাড়ি|পরিবার|সংসার|বরকত)/i,
      /(أطفال|طفل|بيت|منزل|أهل|بركة)/i,
    ],
  },

  // 7. Morning & Evening Azkar (Fortress)
  {
    categoryId: 'morning_evening',
    intentTitleBn: 'সকাল ও সন্ধ্যার দৈনিক দুর্গ (Morning & Evening Shield)',
    reasonBn:
      'প্রতিদিন ফজর ও আসর/মাগরিবের পর এই আযকারগুলো পড়লে আকাশ বা পৃথিবী থেকে কোনো ক্ষতি বান্দাকে স্পর্শ করতে পারে না।',
    priority: 6,
    patterns: [
      /\b(morning|shokal|sokal|fajr\s*azkar|shokaler\s*dua|evening|shondha|sondha|maghrib\s*azkar)\b/i,
      /\b(daily\s*azkar|azkar|hisnul\s*muslim|durg|fortress)\b/i,
      /(সকাল|সন্ধ্যা|সকালের\s*আযকার|সন্ধ্যার\s*আযকার|দৈনিক\s*আযকার|সুরক্ষা\s*আযকার)/i,
      /(أذكار\s*الصباح|أذكار\s*المساء|حصن\s*المسلم)/i,
    ],
  },

  // 8. Travel & Journey Protection
  {
    categoryId: 'travel_protection',
    intentTitleBn: 'সফর, যাত্রা ও পথচলার নিরাপত্তা',
    reasonBn:
      'যেকোনো ভ্রমণ ও নতুন স্থানে যাওয়ার সময় এই মাসনূন দোয়া পাঠ করলে যাত্রা নিরাপদ ও আল্লাহর রহমতে সিক্ত থাকে।',
    priority: 6,
    patterns: [
      /\b(travel|journey|sofor|shofor|safar|tour|rasta|gari|flight|biman|bus|train|dour)\b/i,
      /(সফর|যাত্রা|ভ্রমণ|গাড়ি|রাস্তা|সফরের\s*দোয়া|যাত্রাপথ)/i,
      /(سفر|دعاء\s*السفر|طريق|ركوب)/i,
    ],
  },

  // 9. Anxiety, Depression & Mental Tranquility (Ayatus Sakinah)
  {
    categoryId: 'anxiety_fear',
    intentTitleBn: 'ভয়, দুশ্চিন্তা ও বুক ধড়ফড় থেকে অন্তরের প্রশান্তি',
    reasonBn:
      'কুরআনের আয়াতুস সাকিনাহ ও দোয়া ইউনুস পাঠ করলে অস্থির হৃদয়ে আকাশ থেকে প্রশান্তি অবতীর্ণ হয়।',
    priority: 7,
    patterns: [
      /\b(anxiety|tension|depress|depression|panic|panic\s*attack|mon\s*kharap|osthir|buk\s*dhorfor|chinta)\b/i,
      /\b(fear|voy|bhoy|shanti\s*nai|beproyah|frustration|stress)\b/i,
      /(দুশ্চিন্তা|অস্থিরতা|ভয়|প্যানিক|মন\s*খারাপ|হতাশা|প্রশান্তি|আয়াতুস\s*সাকিনাহ|শান্তি)/i,
      /(قلق|هم|غم|حزن|سكينة|خوف)/i,
    ],
  },

  // 10. Repentance, Purity & Self-Control
  {
    categoryId: 'repentance_purification',
    intentTitleBn: 'তওবা, অন্তরের পবিত্রতা ও গুনাহ থেকে আত্মরক্ষা',
    reasonBn:
      'সাইয়্যিদুল ইস্তিগফার ও কুপ্রবৃত্তি দমনের দোয়া অন্তরের গ্লানি দূর করে তাকওয়া ও মানসিক দৃঢ়তা দান করে।',
    priority: 6,
    patterns: [
      /\b(zina|gunah|pap|taubah|tobah|istighfar|chokh|self\s*control|porn|bad\s*habit|purity)\b/i,
      /(তওবা|গুনাহ|পাপ|ইস্তিগফার|পবিত্রতা|আত্মসংযম|কুপ্রবৃত্তি|ব্যভিচার)/i,
      /(توبة|استغفار|طهارة|عفة|ذنب)/i,
    ],
  },
];

class RuqyahManagerService {
  /**
   * Maps user raw query/intent to specific Category ID
   */
  public mapIntentToCategoryId(rawQuery: string): RuqyahCategory {
    const analysis = this.analyzeIntent(rawQuery);
    return analysis.matchedCategoryId;
  }

  /**
   * Full NLP intent detection, scoring, and recommendation generator
   */
  public analyzeIntent(rawQuery: string): RuqyahIntentAnalysis {
    const query = (rawQuery || '').trim().toLowerCase();

    // Default fallback
    if (!query) {
      const defaultCategory = 'evil_eye';
      const meta = this.getCategoryById(defaultCategory);
      const items = this.getItemsByCategory(defaultCategory);
      return {
        matchedCategoryId: defaultCategory,
        categoryMeta: meta,
        confidence: 0.5,
        detectedKeywords: [],
        intentTitleBn: 'দৈনিক সাধারণ আত্মিক সুরক্ষা ও রুকইয়াহ',
        recommendedReasonBn:
          'কুরআনের শ্রেষ্ঠতম রুকইয়াহ হিসেবে সূরা ফাতিহা ও তিন কুল প্রতিদিন পাঠ করা সকল অকল্যাণ থেকে সুরক্ষিত রাখে।',
        primaryRuqyah: items[0] || RUQYAH_ITEMS[0],
        recommendedPlaylist: items.slice(0, 3),
        medicalAdviceRequired: false,
      };
    }

    // Check Medical Alert Keywords
    const medicalRegex =
      /\b(emergency|hospital|bleeding|broken|fracture|seizure|epilepsy|heart\s*attack|stroke|paralysis|blood|doctor)\b|হাসপাতাল|রক্তক্ষরণ|হার্ট\s*অ্যাটাক|স্ট্রোক|মৃগী\s*রোগ/i;
    const hasMedicalAlert = medicalRegex.test(query);
    const medicalAlertMessageBn = hasMedicalAlert
      ? 'জরুরি জ্ঞাতব্য: শারীরিক জটিলতা বা মারাত্মক উপসর্গের ক্ষেত্রে অনতিবিলম্বে বিশেষজ্ঞ ডাক্তারের চিকিৎসা গ্রহণ করুন। চিকিৎসকের পাশাপাশি কুরআন-সুন্নাহর দোয়া পাঠ করা সর্বোত্তম।'
      : undefined;

    let bestRule: IntentRule | null = null;
    let highestScore = 0;
    const detectedKeywords: string[] = [];

    for (const rule of INTENT_RULES) {
      let matchCount = 0;
      for (const pattern of rule.patterns) {
        const match = query.match(pattern);
        if (match) {
          matchCount++;
          detectedKeywords.push(match[0]);
        }
      }

      if (matchCount > 0) {
        const score = matchCount * 10 + rule.priority;
        if (score > highestScore) {
          highestScore = score;
          bestRule = rule;
        }
      }
    }

    const matchedCategory: RuqyahCategory = bestRule ? bestRule.categoryId : 'evil_eye';
    const categoryMeta = this.getCategoryById(matchedCategory);
    const categoryItems = this.getItemsByCategory(matchedCategory);

    const primaryRuqyah = categoryItems[0] || RUQYAH_ITEMS[0];
    const recommendedPlaylist =
      categoryItems.length > 1 ? categoryItems.slice(0, 4) : [primaryRuqyah];

    return {
      matchedCategoryId: matchedCategory,
      categoryMeta,
      confidence: bestRule ? Math.min(1.0, 0.65 + highestScore * 0.05) : 0.4,
      detectedKeywords: Array.from(new Set(detectedKeywords)),
      intentTitleBn: bestRule
        ? bestRule.intentTitleBn
        : 'সার্বজনীন আত্মিক সুরক্ষা ও রুকইয়াহ শারইয়াহ',
      recommendedReasonBn: bestRule
        ? bestRule.reasonBn
        : 'সূরা ফাতিহা, আয়াতুল কুরসি ও তিন কুল যেকোনো আত্মিক সংকটে আল্লাহর সাহায্য পাওয়ার পরীক্ষিত মাধ্যম।',
      primaryRuqyah,
      recommendedPlaylist,
      medicalAdviceRequired: hasMedicalAlert,
      medicalAlertMessageBn,
      medicalAdviceMessageBn: medicalAlertMessageBn,
    };
  }

  /**
   * Get metadata for a given Ruqyah Category
   */
  public getCategoryById(id: RuqyahCategory): RuqyahCategoryMeta {
    const meta = RUQYAH_CATEGORIES.find((c) => c.id === id);
    if (meta) return meta;
    return RUQYAH_CATEGORIES[0];
  }

  /**
   * Get all verified Ruqyah Items for a category
   */
  public getItemsByCategory(id: RuqyahCategory | 'all'): RuqyahItem[] {
    if (id === 'all') return RUQYAH_ITEMS;
    return RUQYAH_ITEMS.filter((item) => item.category === id);
  }

  /**
   * Essential 5 items for Daily Protection Routine (আজকের সুরক্ষা রুটিন)
   */
  public getDailyProtectionRoutine(): RuqyahItem[] {
    const routineIds = [
      'ruq_fatihah', // 1. Surah Fatihah (Foundation)
      'ruq_ayatul_kursi', // 2. Ayatul Kursi (Day & Night shield)
      'ruq_muawwidhat', // 3. Three Quls (Morning/Evening protection)
      'ruq_baqarah_last2', // 4. Amanar Rasul (Night shield)
      'ruq_hasad_prophetic', // 5. Masnoon protection against evil eye & harm
    ];

    const routineItems: RuqyahItem[] = [];
    for (const id of routineIds) {
      const item = RUQYAH_ITEMS.find((it) => it.id === id);
      if (item) routineItems.push(item);
    }

    // In case any wasn't found, fill with first items
    if (routineItems.length < 5) {
      for (const item of RUQYAH_ITEMS) {
        if (!routineItems.some((r) => r.id === item.id)) {
          routineItems.push(item);
        }
        if (routineItems.length >= 5) break;
      }
    }

    return routineItems;
  }

  /**
   * Today's Date String in YYYY-MM-DD
   */
  public getTodayDateKey(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Get status of today's protective routine
   */
  public getDailyRoutineStatus(dateKey?: string): DailyRoutineStatus {
    const date = dateKey || this.getTodayDateKey();
    const storageKey = `${STORAGE_ROUTINE_PREFIX}${date}`;
    const routineItems = this.getDailyProtectionRoutine();
    const total = routineItems.length;

    let completedIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            completedIds = parsed;
          } else if (typeof parsed === 'object') {
            completedIds = Object.keys(parsed).filter((k) => !!parsed[k]);
          }
        }
      } catch {
        completedIds = [];
      }
    }

    const completedCount = completedIds.filter((id) =>
      routineItems.some((r) => r.id === id)
    ).length;

    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      date,
      completedIds,
      total,
      completedCount,
      percentage,
      isFullyCompleted: completedCount >= total,
    };
  }

  /**
   * Toggle a routine item's completion
   */
  public toggleRoutineItem(itemId: string, dateKey?: string): DailyRoutineStatus {
    const date = dateKey || this.getTodayDateKey();
    const storageKey = `${STORAGE_ROUTINE_PREFIX}${date}`;
    const status = this.getDailyRoutineStatus(date);

    let nextCompletedIds: string[];
    if (status.completedIds.includes(itemId)) {
      nextCompletedIds = status.completedIds.filter((id) => id !== itemId);
    } else {
      nextCompletedIds = [...status.completedIds, itemId];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextCompletedIds));
      } catch {
        // ignore
      }
    }

    return this.getDailyRoutineStatus(date);
  }

  /**
   * Full Playable Daily Ruqyah Playlist
   */
  public getDailyRuqyahPlaylist(): RuqyahItem[] {
    return this.getDailyProtectionRoutine();
  }

  /**
   * Favorites Management
   */
  public getFavoriteIds(): string[] {
    if (typeof window === 'undefined') return ['ruq_fatihah', 'ruq_ayatul_kursi'];
    try {
      const raw = localStorage.getItem(STORAGE_FAVORITES_KEY);
      return raw ? JSON.parse(raw) : ['ruq_fatihah', 'ruq_ayatul_kursi'];
    } catch {
      return ['ruq_fatihah', 'ruq_ayatul_kursi'];
    }
  }

  public isFavorite(itemId: string): boolean {
    return this.getFavoriteIds().includes(itemId);
  }

  public toggleFavorite(itemId: string): boolean {
    const current = this.getFavoriteIds();
    let next: string[];
    let isNowFav = false;
    if (current.includes(itemId)) {
      next = current.filter((id) => id !== itemId);
      isNowFav = false;
    } else {
      next = [...current, itemId];
      isNowFav = true;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    return isNowFav;
  }

  /**
   * Listening History Management
   */
  public recordHistory(itemId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
      const list: { id: string; time: number }[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((it) => it.id !== itemId);
      filtered.unshift({ id: itemId, time: Date.now() });
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(filtered.slice(0, 30)));
    } catch {
      // ignore
    }
  }

  public getHistoryItems(): RuqyahItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
      const list: { id: string; time: number }[] = raw ? JSON.parse(raw) : [];
      return list
        .map((entry) => RUQYAH_ITEMS.find((it) => it.id === entry.id))
        .filter((it): it is RuqyahItem => !!it);
    } catch {
      return [];
    }
  }

  /**
   * Offline Saved Items
   */
  public getOfflineSavedIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_OFFLINE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public toggleOfflineSave(itemId: string): boolean {
    const current = this.getOfflineSavedIds();
    let next: string[];
    let isSaved = false;
    if (current.includes(itemId)) {
      next = current.filter((id) => id !== itemId);
      isSaved = false;
    } else {
      next = [...current, itemId];
      isSaved = true;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_OFFLINE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    }
    return isSaved;
  }
}

// Singleton Instance Export
export const ruqyahManager = new RuqyahManagerService();

// Export the class as well
export default RuqyahManagerService;
