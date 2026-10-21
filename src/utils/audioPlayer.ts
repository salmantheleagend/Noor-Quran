/**
 * Audio reciter definitions and playback management
 */

export interface ReciterInfo {
  id: string;
  name: string;
  nameBn: string;
  nameAr: string;
  subfolder: string;
}

export const QURAN_RECITERS: ReciterInfo[] = [
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    nameBn: 'মিশারী রশিদ আল-আফাসী',
    nameAr: 'مشاري راشد العفاسي',
    subfolder: 'Alafasy_128kbps',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit Murattal',
    nameBn: 'আব্দুল বাসেত (মুরাত্তাল)',
    nameAr: 'عبد الباسط عبد الصمد',
    subfolder: 'Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman As-Sudais',
    nameBn: 'আব্দুর রহমান আস-সুদাইস (ইমামে কাবা)',
    nameAr: 'عبد الرحمن السديس',
    subfolder: 'Abdurrahmaan_As-Sudais_192kbps',
  },
  {
    id: 'muaiqly',
    name: 'Maher Al-Muaiqly',
    nameBn: 'মাহের আল-মুয়াইক্বিলী',
    nameAr: 'ماهر المعيقلي',
    subfolder: 'MaherAlMuaiqly128kbps',
  },
];

// Helper to format 3-digit surah and ayah (e.g., Surah 1 Ayah 1 -> "001001.mp3")
export function getAyahAudioUrl(surahNum: number, ayahNum: number, reciterId: string = 'alafasy'): string {
  const reciter = QURAN_RECITERS.find(r => r.id === reciterId) || QURAN_RECITERS[0];
  const s = surahNum.toString().padStart(3, '0');
  const a = ayahNum.toString().padStart(3, '0');
  return `https://everyayah.com/data/${reciter.subfolder}/${s}${a}.mp3`;
}

// Full Surah audio URL (from high-speed Quran CDN)
export function getSurahAudioUrl(surahNum: number, reciterId: string = 'alafasy'): string {
  const s = surahNum.toString().padStart(3, '0');
  if (reciterId === 'abdulbasit') {
    return `https://server7.mp3quran.net/basit/${s}.mp3`;
  }
  if (reciterId === 'sudais') {
    return `https://server11.mp3quran.net/sds/${s}.mp3`;
  }
  if (reciterId === 'muaiqly') {
    return `https://server12.mp3quran.net/maher/${s}.mp3`;
  }
  // Default Alafasy
  return `https://server8.mp3quran.net/afs/${s}.mp3`;
}

// Speak Arabic letter or word using browser speech synthesis
export function speakArabic(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85; // slightly slower for clear tajweed learning
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export interface AyahAudioTrack {
  type: 'tilawat' | 'ortho';
  url: string;
}

export function getDailyAyahPlaylist(
  todayAyah: {
    surahNumber: number;
    ayahNumber: number | string;
    audioAyahNumber?: number;
    audioAyahList?: number[];
    translationBn: string;
    translationEn?: string;
  },
  lang: 'bn' | 'en' = 'bn'
): AyahAudioTrack[] {
  const tracks: AyahAudioTrack[] = [];

  // Play EXACTLY that single specific ayah shown on screen
  const singleAyahNum = typeof todayAyah.audioAyahNumber === 'number'
    ? todayAyah.audioAyahNumber
    : (typeof todayAyah.ayahNumber === 'number' ? todayAyah.ayahNumber : parseInt(String(todayAyah.ayahNumber), 10) || 1);

  tracks.push({
    type: 'tilawat',
    url: getAyahAudioUrl(todayAyah.surahNumber, singleAyahNum, 'alafasy'),
  });

  return tracks;
}

// Splits long translation into sentence chunks for audio streaming
export function getTranslationTtsChunks(text: string): string[] {
  const clean = text.replace(/["'“”]/g, '').trim();
  if (!clean) return [];
  const rawParts = clean.split(/([।!?\n]+)/).filter(Boolean);
  const sentences: string[] = [];
  for (let i = 0; i < rawParts.length; i += 2) {
    const s = (rawParts[i] || '') + (rawParts[i + 1] || '');
    if (s.trim()) sentences.push(s.trim());
  }

  const chunks: string[] = [];
  for (const s of (sentences.length > 0 ? sentences : [clean])) {
    if (s.length <= 140) {
      chunks.push(s);
    } else {
      const subParts = s.split(/([,،]+)/).filter(Boolean);
      let current = '';
      for (let j = 0; j < subParts.length; j += 2) {
        const piece = (subParts[j] || '') + (subParts[j + 1] || '');
        if ((current + piece).length <= 140) {
          current += piece;
        } else {
          if (current.trim()) chunks.push(current.trim());
          current = piece;
        }
      }
      if (current.trim()) chunks.push(current.trim());
    }
  }

  return chunks.length > 0 ? chunks : [clean];
}

// Plays translation aloud with 100% reliable Bengali TTS audio stream, with Web Speech fallback
export function playTranslationAudio(
  text: string,
  lang: 'bn' | 'en' = 'bn',
  onEnd?: () => void,
  onError?: () => void
): { stop: () => void } {
  let isStopped = false;
  let currentAudio: HTMLAudioElement | null = null;

  const stop = () => {
    isStopped = true;
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      currentAudio = null;
    }
    stopSpeechAudio();
  };

  const chunks = getTranslationTtsChunks(text);
  if (chunks.length === 0) {
    if (onEnd) onEnd();
    return { stop };
  }

  const tl = lang === 'en' ? 'en' : 'bn';
  let chunkIdx = 0;

  const playNextChunk = () => {
    if (isStopped) return;
    if (chunkIdx >= chunks.length) {
      if (onEnd) onEnd();
      return;
    }

    const chunk = chunks[chunkIdx];
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
    const audio = new Audio(url);
    currentAudio = audio;

    audio.onended = () => {
      chunkIdx++;
      playNextChunk();
    };

    audio.onerror = () => {
      if (isStopped) return;
      // Fallback to Web Speech API
      speakAyahTranslation(
        chunks.slice(chunkIdx).join(' '),
        lang,
        onEnd,
        onError
      );
    };

    audio.play().catch(() => {
      if (isStopped) return;
      // Fallback to Web Speech API
      speakAyahTranslation(
        chunks.slice(chunkIdx).join(' '),
        lang,
        onEnd,
        onError
      );
    });
  };

  playNextChunk();
  return { stop };
}

// Speak translation / meaning (Ortho) in Bengali or English via SpeechSynthesis with a dignified male voice
export function speakAyahTranslation(
  text: string,
  lang: 'bn' | 'en' | 'ar' = 'bn',
  onEnd?: () => void,
  onError?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return null;
  }
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    if (lang === 'bn') {
      utterance.lang = 'bn-BD';
      const bnVoices = voices.filter(v => v.lang.startsWith('bn') || v.lang.includes('Bengali'));
      const maleBn = bnVoices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('male') || n.includes('david') || n.includes('guy') || n.includes('google বাংলা');
      });
      if (maleBn) {
        utterance.voice = maleBn;
      } else if (bnVoices.length > 0) {
        utterance.voice = bnVoices[0];
      }
      // Pitch 0.78 & rate 0.88 produces a calm, deep, masculine recitation tone
      utterance.pitch = 0.78;
      utterance.rate = 0.88;
    } else if (lang === 'en') {
      utterance.lang = 'en-US';
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      const maleEn = enVoices.find(v => {
        const n = v.name.toLowerCase();
        return n.includes('male') || n.includes('david') || n.includes('guy') || n.includes('george');
      });
      if (maleEn) utterance.voice = maleEn;
      utterance.pitch = 0.8;
      utterance.rate = 0.9;
    } else {
      utterance.lang = 'ar-SA';
      utterance.pitch = 0.8;
      utterance.rate = 0.85;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (onError) onError();
      else if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (onEnd) onEnd();
    return null;
  }
}

export function stopSpeechAudio(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

// Play pleasant mechanical click / bead sound for Tasbeeh
export function playTasbeehClick(): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Audio context may be restricted before user gesture
  }
}

// Play melodic Adhan preview chime / bell notification
export function playAdhanTone(): void {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.22;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch {
    // Ignore audio restriction
  }
}

// Haptic feedback trigger
export function triggerHaptic(duration = 25): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration error
    }
  }
}
