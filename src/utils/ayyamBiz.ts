import { getHijriDate } from './prayerTimes';

export interface AyyamBizStatus {
  isActive: boolean; // True from 2-3 days before (Hijri 10) through Hijri 15
  isUpcoming: boolean; // Hijri 10, 11, 12
  isFastingToday: boolean; // Hijri 13, 14, 15
  currentFastDay?: 1 | 2 | 3;
  daysUntilStart: number;
  hijriDay: number;
  hijriMonthBn: string;
  hijriMonthEn: string;
  hijriYear: number;
  dates: {
    day13Date: Date;
    day14Date: Date;
    day15Date: Date;
    day13Bn: string;
    day14Bn: string;
    day15Bn: string;
    fullScheduleBn: string;
    fullScheduleEn: string;
  };
  hadithBn: string;
  hadithSourceBn: string;
  niyyahBn: string;
  niyyahAr: string;
}

export function getAyyamBizStatus(currentDate: Date = new Date()): AyyamBizStatus {
  const currentHijri = getHijriDate(currentDate);
  const hDay = currentHijri.day;
  const hMonthBn = currentHijri.monthNameBn;
  const hMonthEn = currentHijri.monthNameEn;
  const hYear = currentHijri.year;

  // Offset in days to reach the 13th of current Hijri month
  const offsetTo13 = 13 - hDay;
  const day13Date = new Date(currentDate.getTime() + offsetTo13 * 86400000);
  const day14Date = new Date(day13Date.getTime() + 86400000);
  const day15Date = new Date(day13Date.getTime() + 2 * 86400000);

  const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const bnDays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const toBn = (n: number) => n.toString().split('').map(d => bnDigits[parseInt(d, 10)] || d).join('');

  const formatGregorianBn = (d: Date) => {
    const dayName = bnDays[d.getDay()];
    const dateNum = toBn(d.getDate());
    const monthName = bnMonths[d.getMonth()];
    return `${dayName}, ${dateNum} ${monthName}`;
  };

  const day13Bn = formatGregorianBn(day13Date);
  const day14Bn = formatGregorianBn(day14Date);
  const day15Bn = formatGregorianBn(day15Date);

  const isActive = hDay >= 10 && hDay <= 15;
  const isUpcoming = hDay >= 10 && hDay <= 12;
  const isFastingToday = hDay >= 13 && hDay <= 15;
  const currentFastDay = hDay === 13 ? 1 : hDay === 14 ? 2 : hDay === 15 ? 3 : undefined;
  const daysUntilStart = Math.max(0, 13 - hDay);

  const fullScheduleBn = `${day13Bn} (১৩ ${hMonthBn}), ${day14Bn} (১৪ ${hMonthBn}) ও ${day15Bn} (১৫ ${hMonthBn})`;
  const fullScheduleEn = `${day13Date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (13 ${hMonthEn}), ${day14Date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (14 ${hMonthEn}) & ${day15Date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} (15 ${hMonthEn})`;

  return {
    isActive,
    isUpcoming,
    isFastingToday,
    currentFastDay,
    daysUntilStart,
    hijriDay: hDay,
    hijriMonthBn: hMonthBn,
    hijriMonthEn: hMonthEn,
    hijriYear: hYear,
    dates: {
      day13Date,
      day14Date,
      day15Date,
      day13Bn,
      day14Bn,
      day15Bn,
      fullScheduleBn,
      fullScheduleEn,
    },
    hadithBn: 'রাসূলুল্লাহ (ﷺ) প্রতি চন্দ্রমাসের ১৩, ১৪ ও ১৫ তারিখ রোজা রাখতে উপদেশ দিয়েছেন এবং বলেছেন: এটি সারা বছর রোজা রাখার সমতুল্য।',
    hadithSourceBn: 'সুনান আন-নাসায়ী: ২৪২০, জামে আত-তিরমিযী: ৭৬১ (সহীহ)',
    niyyahAr: 'نَوَيْتُ أَنْ أَصُومَ صَوْمَ أَيَّامِ الْبِيضِ سُنَّةً لِلَّهِ تَعَالَى',
    niyyahBn: 'নাওয়াইতু আন আসূমা সাওমা আইয়ামিল বিয়দি সুন্নাতান লিল্লাহি তাআলা (আমি আল্লাহর সন্তুষ্টির উদ্দেশ্যে আইয়ামে বীজের সুন্নাত রোজা রাখার নিয়ত করছি)।',
  };
}
