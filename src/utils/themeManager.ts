import { ColorTheme } from '../types';

export interface ThemePalette {
  primary: string;
  dark: string;
  accent: string;
  pale: string;
  cardBg: string;
  border: string;
  mainText: string;
  secondaryText: string;
}

export interface PresetMeta {
  id: Exclude<ColorTheme, 'custom'>;
  nameBn: string;
  nameEn: string;
  descBn: string;
  colorDot: string;
  accentDot: string;
  primaryHex: string;
  light: ThemePalette;
  dark: ThemePalette;
}

export const THEME_PRESETS: Record<Exclude<ColorTheme, 'custom'>, PresetMeta> = {
  teal: {
    id: 'teal',
    nameBn: 'টিল ও পার্ল (Teal + Pearl)',
    nameEn: 'Teal & Pearl (Default)',
    descBn: 'প্রশান্তিময় ইসলামিক টিল ও পার্ল (ডিফল্ট)',
    colorDot: 'bg-[#0F5F62]',
    accentDot: 'bg-[#B9E2DD]',
    primaryHex: '#0F5F62',
    light: {
      primary: '#0F5F62',
      dark: '#083B40',
      accent: '#B9E2DD',
      pale: '#F3FAF9',
      cardBg: '#FFFFFF',
      border: '#D7E9E7',
      mainText: '#123234',
      secondaryText: '#5E7475',
    },
    dark: {
      primary: '#148084',
      dark: '#B9E2DD',
      accent: '#194E52',
      pale: '#061B1D',
      cardBg: '#0B2527',
      border: '#153E41',
      mainText: '#E6F3F2',
      secondaryText: '#92A9A8',
    },
  },
  sapphire: {
    id: 'sapphire',
    nameBn: 'রয়েল স্যাফায়ার (Sapphire)',
    nameEn: 'Royal Sapphire Blue',
    descBn: 'রাজকীয় নীল ও রোজ কোয়ার্টজ',
    colorDot: 'bg-[#21409A]',
    accentDot: 'bg-[#E9B7C3]',
    primaryHex: '#21409A',
    light: {
      primary: '#21409A',
      dark: '#10235A',
      accent: '#E9B7C3',
      pale: '#F8E8ED',
      cardBg: '#FFFFFF',
      border: '#E7D9DE',
      mainText: '#10235A',
      secondaryText: '#5E6C84',
    },
    dark: {
      primary: '#3B82F6',
      dark: '#93C5FD',
      accent: '#1E3A8A',
      pale: '#0B132B',
      cardBg: '#131C38',
      border: '#1E2D5A',
      mainText: '#EFF6FF',
      secondaryText: '#94A3B8',
    },
  },
  emerald: {
    id: 'emerald',
    nameBn: 'পান্না সবুজ (Emerald)',
    nameEn: 'Islamic Emerald Green',
    descBn: 'ইসলামিক শান্ত সবুজ ও মিন্ট',
    colorDot: 'bg-[#047857]',
    accentDot: 'bg-[#34D399]',
    primaryHex: '#047857',
    light: {
      primary: '#047857',
      dark: '#064E3B',
      accent: '#6EE7B7',
      pale: '#ECFDF5',
      cardBg: '#FFFFFF',
      border: '#A7F3D0',
      mainText: '#064E3B',
      secondaryText: '#047857',
    },
    dark: {
      primary: '#10B981',
      dark: '#6EE7B7',
      accent: '#064E3B',
      pale: '#051A14',
      cardBg: '#0A2920',
      border: '#134E4A',
      mainText: '#ECFDF5',
      secondaryText: '#6EE7B7',
    },
  },
  minimal: {
    id: 'minimal',
    nameBn: 'মিনিমাল স্লেট (Minimal Slate)',
    nameEn: 'Minimal Slate',
    descBn: 'মার্জিত শান্ত স্লেট (চোখের জন্য আরামদায়ক)',
    colorDot: 'bg-[#334155]',
    accentDot: 'bg-[#94A3B8]',
    primaryHex: '#334155',
    light: {
      primary: '#334155',
      dark: '#1E293B',
      accent: '#94A3B8',
      pale: '#F8FAFC',
      cardBg: '#FFFFFF',
      border: '#CBD5E1',
      mainText: '#0F172A',
      secondaryText: '#64748B',
    },
    dark: {
      primary: '#94A3B8',
      dark: '#CBD5E1',
      accent: '#334155',
      pale: '#0F172A',
      cardBg: '#1E293B',
      border: '#334155',
      mainText: '#F8FAFC',
      secondaryText: '#94A3B8',
    },
  },
  rose: {
    id: 'rose',
    nameBn: 'রোজ কোয়ার্টজ (Rose)',
    nameEn: 'Rose Quartz & Ruby',
    descBn: 'স্নিগ্ধ গোলাপী ও রুবি আভা',
    colorDot: 'bg-[#9D174D]',
    accentDot: 'bg-[#F472B6]',
    primaryHex: '#9D174D',
    light: {
      primary: '#9D174D',
      dark: '#831843',
      accent: '#F472B6',
      pale: '#FDF2F8',
      cardBg: '#FFFFFF',
      border: '#FBCFE8',
      mainText: '#831843',
      secondaryText: '#9D174D',
    },
    dark: {
      primary: '#F472B6',
      dark: '#FBCFE8',
      accent: '#831843',
      pale: '#1F0A14',
      cardBg: '#2D0F1E',
      border: '#4A1530',
      mainText: '#FDF2F8',
      secondaryText: '#F472B6',
    },
  },
  amber: {
    id: 'amber',
    nameBn: 'মরু অ্যাম্বার (Desert Amber)',
    nameEn: 'Desert Amber & Gold',
    descBn: 'উষ্ণ সোনালী ও বালুকা আভা',
    colorDot: 'bg-[#B45309]',
    accentDot: 'bg-[#FBBF24]',
    primaryHex: '#B45309',
    light: {
      primary: '#B45309',
      dark: '#92400E',
      accent: '#FBBF24',
      pale: '#FFFBEB',
      cardBg: '#FFFFFF',
      border: '#FDE68A',
      mainText: '#78350F',
      secondaryText: '#92400E',
    },
    dark: {
      primary: '#F59E0B',
      dark: '#FDE68A',
      accent: '#78350F',
      pale: '#1C1305',
      cardBg: '#2C1E08',
      border: '#452E0B',
      mainText: '#FFFBEB',
      secondaryText: '#FCD34D',
    },
  },
  purple: {
    id: 'purple',
    nameBn: 'রয়েল পার্পল (Royal Purple)',
    nameEn: 'Royal Lavender & Purple',
    descBn: 'আভিজাত্যময় ভায়োলেট ও ল্যাভেন্ডার',
    colorDot: 'bg-[#6D28D9]',
    accentDot: 'bg-[#C4B5FD]',
    primaryHex: '#6D28D9',
    light: {
      primary: '#6D28D9',
      dark: '#5B21B6',
      accent: '#C4B5FD',
      pale: '#F5F3FF',
      cardBg: '#FFFFFF',
      border: '#DDD6FE',
      mainText: '#4C1D95',
      secondaryText: '#6D28D9',
    },
    dark: {
      primary: '#A78BFA',
      dark: '#DDD6FE',
      accent: '#5B21B6',
      pale: '#130D24',
      cardBg: '#1E1538',
      border: '#3B2D6B',
      mainText: '#F5F3FF',
      secondaryText: '#C4B5FD',
    },
  },
};

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 15, g: 95, b: 98 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

export function blendWithColor(hex: string, targetHex: string, ratio: number): string {
  const c1 = hexToRgb(hex);
  const c2 = hexToRgb(targetHex);
  const r = c1.r * (1 - ratio) + c2.r * ratio;
  const g = c1.g * (1 - ratio) + c2.g * ratio;
  const b = c1.b * (1 - ratio) + c2.b * ratio;
  return rgbToHex(r, g, b);
}

export function generateCustomPalette(primaryHex: string, isDark: boolean): ThemePalette {
  const safePrimary = primaryHex.startsWith('#') ? primaryHex : `#${primaryHex}`;
  if (!isDark) {
    return {
      primary: safePrimary,
      dark: blendWithColor(safePrimary, '#000000', 0.28),
      accent: blendWithColor(safePrimary, '#FFFFFF', 0.45),
      pale: blendWithColor(safePrimary, '#FFFFFF', 0.94),
      cardBg: '#FFFFFF',
      border: blendWithColor(safePrimary, '#FFFFFF', 0.75),
      mainText: blendWithColor(safePrimary, '#000000', 0.55),
      secondaryText: blendWithColor(safePrimary, '#000000', 0.35),
    };
  } else {
    const brightPrimary = blendWithColor(safePrimary, '#FFFFFF', 0.3);
    return {
      primary: brightPrimary,
      dark: blendWithColor(safePrimary, '#FFFFFF', 0.55),
      accent: blendWithColor(safePrimary, '#000000', 0.4),
      pale: blendWithColor(safePrimary, '#000000', 0.9),
      cardBg: blendWithColor(safePrimary, '#000000', 0.8),
      border: blendWithColor(safePrimary, '#000000', 0.65),
      mainText: blendWithColor(safePrimary, '#FFFFFF', 0.92),
      secondaryText: blendWithColor(safePrimary, '#FFFFFF', 0.65),
    };
  }
}

export function applyThemeToDOM(
  colorTheme: ColorTheme = 'teal',
  customColor?: string,
  isDark: boolean = false
): ThemePalette {
  if (typeof document === 'undefined') return THEME_PRESETS.teal.light;

  const root = document.documentElement;
  let palette: ThemePalette;

  if (colorTheme === 'custom' && customColor) {
    palette = generateCustomPalette(customColor, isDark);
  } else {
    const preset = THEME_PRESETS[colorTheme as Exclude<ColorTheme, 'custom'>] || THEME_PRESETS.teal;
    palette = isDark ? preset.dark : preset.light;
  }

  // Set CSS Variables dynamically on root
  root.style.setProperty('--theme-primary', palette.primary);
  root.style.setProperty('--theme-dark', palette.dark);
  root.style.setProperty('--theme-accent', palette.accent);
  root.style.setProperty('--theme-pale', palette.pale);
  root.style.setProperty('--theme-card-bg', palette.cardBg);
  root.style.setProperty('--theme-border', palette.border);
  root.style.setProperty('--theme-main-text', palette.mainText);
  root.style.setProperty('--theme-secondary-text', palette.secondaryText);

  // Backwards compatibility tokens
  root.style.setProperty('--primary-teal', palette.primary);
  root.style.setProperty('--deep-teal', palette.dark);
  root.style.setProperty('--pearl-accent', palette.accent);
  root.style.setProperty('--light-pearl', palette.pale);
  root.style.setProperty('--card-bg', palette.cardBg);
  root.style.setProperty('--main-text', palette.mainText);
  root.style.setProperty('--secondary-text', palette.secondaryText);
  root.style.setProperty('--soft-border', palette.border);

  // Set data-color-theme attribute
  root.setAttribute('data-color-theme', colorTheme);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  return palette;
}
