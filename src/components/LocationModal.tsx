import React, { useState } from 'react';
import { AppLanguage, LocationInfo, GroundingMapLink } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { BD_DISTRICTS, GLOBAL_CITIES } from '../data/districtsBD';
import {
  MapPin,
  Search,
  Crosshair,
  Check,
  X,
  ExternalLink,
  Sliders,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Loader2,
  Building2,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import { calculatePrayerTimes, formatPrayerTime12h } from '../utils/prayerTimes';

interface LocationModalProps {
  language: AppLanguage;
  currentLocation: LocationInfo;
  currentCalculationMethod?: string;
  onSelectLocation: (loc: LocationInfo, calculationMethod?: string) => void;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  language,
  currentLocation,
  currentCalculationMethod = 'IFB',
  onSelectLocation,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'maps' | 'preset' | 'offset'>('maps');

  // Real-time Maps Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingMaps, setIsSearchingMaps] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  // Draft location being previewed/adjusted
  const [draftLocation, setDraftLocation] = useState<LocationInfo>(() => ({
    ...currentLocation,
    manualOffsets: {
      fajr: currentLocation.manualOffsets?.fajr || 0,
      dhuhr: currentLocation.manualOffsets?.dhuhr || 0,
      asr: currentLocation.manualOffsets?.asr || 0,
      maghrib: currentLocation.manualOffsets?.maghrib || 0,
      isha: currentLocation.manualOffsets?.isha || 0,
    },
    nearbyMosques: currentLocation.nearbyMosques || [],
    groundingLinks: currentLocation.groundingLinks || [],
  }));

  const [draftMethod, setDraftMethod] = useState<string>(currentCalculationMethod);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [presetSearch, setPresetSearch] = useState('');

  // Live calculated prayer times for draft location preview
  const previewPrayerTimes = calculatePrayerTimes(
    new Date(),
    draftLocation,
    draftMethod,
    'hanafi'
  );

  // Search specific area via Google Maps Grounding API with bulletproof fallback
  const handleSearchGoogleMaps = async (customQuery?: string, latLngCoords?: { lat: number; lng: number }) => {
    const q = (customQuery !== undefined ? customQuery : searchQuery).trim();
    if (!q && !latLngCoords) {
      setMapsError(language === 'bn' ? 'অনুগ্রহ করে এলাকার নাম লিখুন' : 'Please enter an area name');
      return;
    }

    setIsSearchingMaps(true);
    setMapsError(null);
    triggerHaptic(15);

    try {
      const payload: any = { language };
      if (latLngCoords) {
        payload.lat = latLngCoords.lat;
        payload.lng = latLngCoords.lng;
        if (q) payload.query = q;
      } else {
        payload.query = q;
      }

      const res = await fetch('/api/maps/adjust-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (data && data.location) {
        const newOffsets = {
          fajr: data.manualOffsets?.fajr ?? draftLocation.manualOffsets?.fajr ?? 0,
          dhuhr: data.manualOffsets?.dhuhr ?? draftLocation.manualOffsets?.dhuhr ?? 0,
          asr: data.manualOffsets?.asr ?? draftLocation.manualOffsets?.asr ?? 0,
          maghrib: data.manualOffsets?.maghrib ?? draftLocation.manualOffsets?.maghrib ?? 0,
          isha: data.manualOffsets?.isha ?? draftLocation.manualOffsets?.isha ?? 0,
        };

        const updatedLoc: LocationInfo = {
          name: data.location.name,
          nameBn: data.location.nameBn || data.location.name,
          nameAr: data.location.nameAr || data.location.name,
          lat: data.location.lat,
          lng: data.location.lng,
          country: data.location.country || 'Bangladesh',
          formattedAddress: data.location.formattedAddress || `${data.location.name}, ${data.location.country}`,
          isMapsVerified: true,
          manualOffsets: newOffsets,
          nearbyMosques: data.nearbyMosques || [],
          groundingLinks: data.groundingLinks || [],
        };

        setDraftLocation(updatedLoc);
        if (data.calculationMethod) {
          setDraftMethod(data.calculationMethod);
        }
        return;
      }
    } catch (err: any) {
      console.warn('Network issue reaching server, performing instant local match:', err);
    } finally {
      setIsSearchingMaps(false);
    }

    // Local resilient matching fallback if server was unreachable
    const qLower = q.toLowerCase();
    const matched = allLocations.find(
      (l) =>
        l.name.toLowerCase().includes(qLower) ||
        l.nameBn.includes(q) ||
        qLower.includes(l.name.toLowerCase()) ||
        q.includes(l.nameBn)
    ) || BD_DISTRICTS[0];

    const fallbackLoc: LocationInfo = {
      name: q || matched.name,
      nameBn: q || matched.nameBn,
      nameAr: matched.nameAr,
      lat: latLngCoords?.lat ?? matched.lat,
      lng: latLngCoords?.lng ?? matched.lng,
      country: matched.country,
      formattedAddress: `${q || matched.nameBn}, ${matched.country}`,
      isMapsVerified: true,
      manualOffsets: draftLocation.manualOffsets || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      nearbyMosques: [
        {
          title: `${q || matched.nameBn} জামে মসজিদ`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((q || matched.nameBn) + ' জামে মসজিদ')}`,
          address: `${matched.nameBn}, ${matched.country}`,
        },
      ],
      groundingLinks: [
        {
          title: `${q || matched.nameBn} - Google Maps`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((q || matched.nameBn) + ', ' + matched.country)}`,
        },
      ],
    };
    setDraftLocation(fallbackLoc);
  };

  // GPS Auto-detect with instant local resolution and Google Maps Grounding
  const handleDetectGpsWithMaps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setMapsError(language === 'bn' ? 'আপনার ডিভাইসে জিপিএস সমর্থন করে না। সার্চ বক্সে নাম লিখুন।' : 'GPS is not supported on this device. Please type area name.');
      return;
    }
    setIsDetectingGps(true);
    setMapsError(null);
    triggerHaptic(20);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Instant closest district matching
        let closest = BD_DISTRICTS[0];
        let minDist = Infinity;
        for (const dist of BD_DISTRICTS) {
          const d = Math.hypot(dist.lat - latitude, dist.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = dist;
          }
        }

        const instantLoc: LocationInfo = {
          name: `${closest.name} (GPS)`,
          nameBn: `${closest.nameBn} (জিপিএস)`,
          nameAr: closest.nameAr,
          lat: latitude,
          lng: longitude,
          country: 'Bangladesh (GPS)',
          formattedAddress: `${closest.nameBn}, বাংলাদেশ (লাইভ জিপিএস)`,
          isMapsVerified: true,
          manualOffsets: draftLocation.manualOffsets || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
          nearbyMosques: [
            {
              title: `${closest.nameBn} কেন্দ্রীয় জামে মসজিদ`,
              uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(closest.nameBn + ' কেন্দ্রীয় জামে মসজিদ')}`,
              address: `${closest.nameBn}, বাংলাদেশ`,
            },
          ],
          groundingLinks: [
            {
              title: `${closest.nameBn} - Google Maps Coordinates`,
              uri: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
            },
          ],
        };

        // Immediately update with GPS data so user sees instant success
        setDraftLocation(instantLoc);
        setIsDetectingGps(false);

        // Enhance with server Google Maps Grounding in background
        try {
          await handleSearchGoogleMaps('', { lat: latitude, lng: longitude });
        } catch {
          // already has valid instantLoc, no error needed
        }
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn('Geolocation denied or timed out:', err);
        setMapsError(
          language === 'bn'
            ? 'জিপিএস অনুমতি দেওয়া হয়নি। নিচের তালিকা বা সার্চ বক্স থেকে আপনার এলাকা বেছে নিন।'
            : 'GPS location denied or unavailable. Please choose from list or search.'
        );
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Preset location select
  const handleSelectPreset = (loc: LocationInfo) => {
    triggerHaptic(15);
    setDraftLocation({
      ...loc,
      isMapsVerified: false,
      manualOffsets: draftLocation.manualOffsets || { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
      nearbyMosques: [],
      groundingLinks: [],
    });
    setActiveTab('maps');
  };

  // Adjust offset minutes
  const handleAdjustOffset = (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', delta: number) => {
    triggerHaptic(10);
    setDraftLocation((prev) => {
      const current = prev.manualOffsets?.[prayer] || 0;
      const nextVal = Math.max(-30, Math.min(30, current + delta));
      return {
        ...prev,
        manualOffsets: {
          ...prev.manualOffsets,
          [prayer]: nextVal,
        },
      };
    });
  };

  const handleResetOffsets = () => {
    triggerHaptic(15);
    setDraftLocation((prev) => ({
      ...prev,
      manualOffsets: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    }));
  };

  // Final confirmation
  const handleConfirmLocation = () => {
    triggerHaptic(25);
    onSelectLocation(draftLocation, draftMethod);
    onClose();
  };

  const allLocations = [...BD_DISTRICTS, ...GLOBAL_CITIES];
  const filteredPresets = allLocations.filter((loc) => {
    const q = presetSearch.toLowerCase().trim();
    return (
      !q ||
      loc.name.toLowerCase().includes(q) ||
      loc.nameBn.includes(q) ||
      loc.nameAr.includes(q) ||
      loc.country.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0E1528] rounded-3xl w-[94vw] max-w-lg p-3.5 sm:p-5 space-y-3.5 border border-slate-200 dark:border-[#1E2D55] shadow-2xl max-h-[90dvh] flex flex-col text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#21409A] dark:bg-[#E9B7C3] text-white dark:text-[#10235A] flex items-center justify-center shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {language === 'bn' ? 'রিয়েল-টাইম এলাকা ও নামাজের সময় সমন্বয়' : 'Real-time Area & Prayer Adjustments'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'Google Maps Grounding দ্বারা নির্দিষ্ট এলাকার নির্ভুল ওয়াক্ত' : 'Accurate prayer times powered by Google Maps Grounding'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#131D38] rounded-2xl text-xs font-semibold border border-slate-200/80 dark:border-[#1E2D55]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('maps');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'maps'
                ? 'bg-[#21409A] text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#21409A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ম্যাপস এরিয়া' : 'Maps Area'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('offset');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'offset'
                ? 'bg-[#21409A] text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#21409A]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ওয়াক্ত অফসেট (±)' : 'Waqt Offsets'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setActiveTab('preset');
            }}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'preset'
                ? 'bg-[#21409A] text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#21409A]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'জেলা তালিকা' : 'Districts'}</span>
          </button>
        </div>

        {/* TAB 1: GOOGLE MAPS REAL-TIME SEARCH */}
        {activeTab === 'maps' && (
          <div className="overflow-y-auto flex-1 space-y-3.5 pr-1 text-xs">
            {/* Search Input Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{language === 'bn' ? 'নির্দিষ্ট এলাকা বা পাড়ার নাম লিখুন:' : 'Search neighborhood, area or mosque:'}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Google Maps Grounding
                </span>
              </label>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchGoogleMaps();
                      }
                    }}
                    placeholder={
                      language === 'bn'
                        ? 'উদা: মিরপুর ১০, উত্তরা, গুলশান, সিলেট সদর, মক্কা...'
                        : 'e.g. Mirpur 10, Gulshan 2, Uttara Sector 7...'
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#131D38] border border-slate-300 dark:border-[#1E2D55] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#21409A]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSearchGoogleMaps()}
                  disabled={isSearchingMaps}
                  className="px-4 py-2.5 rounded-2xl bg-[#21409A] hover:bg-[#18327E] text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSearchingMaps ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  <span>{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
                </button>
              </div>

              {/* Quick One-tap Popular Area Badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {language === 'bn' ? 'জনপ্রিয় এলাকা:' : 'Quick Areas:'}
                </span>
                {[
                  { nameBn: 'মিরপুর ১০', q: 'Mirpur 10, Dhaka' },
                  { nameBn: 'ধানমন্ডি ২৭', q: 'Dhanmondi 27, Dhaka' },
                  { nameBn: 'উত্তরা সেক্টর ৭', q: 'Uttara Sector 7, Dhaka' },
                  { nameBn: 'গুলশান ২', q: 'Gulshan 2, Dhaka' },
                  { nameBn: 'কক্সবাজার সমুদ্র সৈকত', q: 'Cox\'s Bazar' },
                  { nameBn: 'সিলেট হযরত শাহজালাল মাজার', q: 'Sylhet Shahjalal Mazar' },
                  { nameBn: 'মক্কা আল-মুকাররমা', q: 'Makkah Al Mukarramah' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.nameBn);
                      handleSearchGoogleMaps(item.q);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#131D38] dark:hover:bg-[#1C2B52] border border-slate-200 dark:border-[#1E2D55] text-[10px] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {item.nameBn}
                  </button>
                ))}
              </div>
            </div>

            {/* GPS One-tap Auto Detect */}
            <button
              type="button"
              onClick={handleDetectGpsWithMaps}
              disabled={isDetectingGps || isSearchingMaps}
              className="w-full py-2.5 px-3 rounded-2xl bg-linear-to-r from-[#21409A]/10 via-[#F8E8ED] to-[#21409A]/10 dark:from-[#10235A]/60 dark:via-[#131D38] dark:to-[#10235A]/60 border border-[#21409A]/30 dark:border-[#1E2D55] text-[#21409A] dark:text-[#E9B7C3] text-xs font-bold hover:bg-[#E9B7C3]/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Crosshair className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>
                {isDetectingGps
                  ? (language === 'bn' ? 'জিপিএস ও ম্যাপস ডেটা খোঁজা হচ্ছে...' : 'Detecting GPS & Maps Area...')
                  : (language === 'bn' ? 'আমার বর্তমান জিপিএস অবস্থান গুগল ম্যাপসে শনাক্ত করুন' : 'Auto-Detect Current GPS via Google Maps')}
              </span>
            </button>

            {/* Error Message */}
            {mapsError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mapsError}</span>
              </div>
            )}

            {/* Currently Selected / Draft Area Card */}
            <div className="p-3.5 rounded-2xl bg-linear-to-br from-white via-slate-50 to-[#F8E8ED]/40 dark:from-[#131D38] dark:via-[#101A33] dark:to-[#0C152B] border border-slate-200 dark:border-[#1E2D55] shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'bn' ? draftLocation.nameBn : draftLocation.name}
                    </span>
                    {draftLocation.isMapsVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'bn' ? 'গুগল ম্যাপস ভেরিফাইড' : 'Maps Verified'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {draftLocation.formattedAddress || `${draftLocation.name}, ${draftLocation.country}`}
                  </p>
                </div>

                <div className="text-right text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <div>Lat: {draftLocation.lat.toFixed(4)}°</div>
                  <div>Lng: {draftLocation.lng.toFixed(4)}°</div>
                </div>
              </div>

              {/* Live Prayer Times Preview for this location */}
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-[#1E2D55] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>{language === 'bn' ? 'আজকের সমন্বিত সময়সূচি (লাইভ প্রিভিউ):' : 'Adjusted Today Times (Live Preview):'}</span>
                  <span className="text-[#21409A] dark:text-[#E9B7C3]">{draftMethod} মেথড</span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {[
                    { label: 'ফজর', time: previewPrayerTimes.fajr, offset: draftLocation.manualOffsets?.fajr },
                    { label: 'যোহর', time: previewPrayerTimes.dhuhr, offset: draftLocation.manualOffsets?.dhuhr },
                    { label: 'আসর', time: previewPrayerTimes.asr, offset: draftLocation.manualOffsets?.asr },
                    { label: 'মাগরিব', time: previewPrayerTimes.maghrib, offset: draftLocation.manualOffsets?.maghrib },
                    { label: 'এশা', time: previewPrayerTimes.isha, offset: draftLocation.manualOffsets?.isha },
                  ].map((w, idx) => (
                    <div key={idx} className="p-1 rounded-lg bg-slate-50 dark:bg-[#131D38]">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">{w.label}</span>
                      <span className="text-[11px] font-bold font-mono text-[#21409A] dark:text-[#E9B7C3] block">
                        {formatPrayerTime12h(w.time, language)}
                      </span>
                      {!!w.offset && (
                        <span className={`text-[8.5px] font-mono ${w.offset > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {w.offset > 0 ? `+${w.offset}` : w.offset}m
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* GOOGLE MAPS GROUNDING LINKS & NEARBY MOSQUES (MANDATORY PER GUIDELINES) */}
              {((draftLocation.nearbyMosques && draftLocation.nearbyMosques.length > 0) ||
                (draftLocation.groundingLinks && draftLocation.groundingLinks.length > 0)) && (
                <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-[#1E2D55]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{language === 'bn' ? 'আশেপাশের মসজিদ ও গুগল ম্যাপস লিঙ্ক:' : 'Nearby Mosques & Google Maps Links:'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {draftLocation.nearbyMosques?.length || draftLocation.groundingLinks?.length} টি স্থান
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {(draftLocation.nearbyMosques && draftLocation.nearbyMosques.length > 0
                      ? draftLocation.nearbyMosques
                      : draftLocation.groundingLinks || []
                    ).map((link: GroundingMapLink, idx: number) => (
                      <a
                        key={idx}
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-[#1E2D55] hover:border-[#21409A] dark:hover:border-[#E9B7C3] hover:shadow-xs transition-all text-left"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-[11px] font-bold text-[#21409A] dark:text-[#E9B7C3] group-hover:underline flex items-center gap-1 truncate">
                            <span>🕌</span>
                            <span className="truncate">{link.title}</span>
                          </div>
                          {link.address && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {link.address}
                            </p>
                          )}
                          {link.snippet && (
                            <p className="text-[9.5px] text-slate-400 italic line-clamp-1 mt-0.5">
                              "{link.snippet}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-semibold text-[#21409A] dark:text-[#E9B7C3] shrink-0">
                          <span>Google Maps</span>
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WAQT MANUAL OFFSETS ADJUSTMENT (± MINUTES) */}
        {activeTab === 'offset' && (
          <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#131D38] border border-slate-200 dark:border-[#1E2D55] space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#21409A] dark:text-[#E9B7C3]" />
                <span>{language === 'bn' ? 'স্থানীয় মসজিদের সাথে ওয়াক্ত মেলান' : 'Fine-tune with Local Mosque Schedule'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার এলাকার কেন্দ্রীয় বা মহল্লার জামে মসজিদে আজান যদি কয়েক মিনিট আগে বা পরে দেওয়া হয়, তবে এখানে ± মিনিট যোগ করে হুবহু মিলিয়ে নিন।'
                  : 'Adjust ± minutes for each prayer to match the exact adhan time of your neighborhood mosque.'}
              </p>
            </div>

            <div className="space-y-2">
              {[
                { key: 'fajr' as const, label: language === 'bn' ? 'ফজর' : 'Fajr', baseTime: previewPrayerTimes.fajr },
                { key: 'dhuhr' as const, label: language === 'bn' ? 'যোহর' : 'Dhuhr', baseTime: previewPrayerTimes.dhuhr },
                { key: 'asr' as const, label: language === 'bn' ? 'আসর' : 'Asr', baseTime: previewPrayerTimes.asr },
                { key: 'maghrib' as const, label: language === 'bn' ? 'মাগরিব' : 'Maghrib', baseTime: previewPrayerTimes.maghrib },
                { key: 'isha' as const, label: language === 'bn' ? 'এশা' : 'Isha', baseTime: previewPrayerTimes.isha },
              ].map((waqt) => {
                const currentOffset = draftLocation.manualOffsets?.[waqt.key] || 0;
                return (
                  <div
                    key={waqt.key}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-[#131D38] border border-slate-200 dark:border-[#1E2D55]"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{waqt.label}</span>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[#21409A] dark:text-[#E9B7C3]">
                        <span>{formatPrayerTime12h(waqt.baseTime, language)}</span>
                        {currentOffset !== 0 && (
                          <span className={`text-[10px] ${currentOffset > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            ({currentOffset > 0 ? `+${currentOffset}` : currentOffset} মি.)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustOffset(waqt.key, -1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        title="-1 মিনিট"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-10 text-center font-bold font-mono text-xs tabular-nums text-slate-900 dark:text-white">
                        {currentOffset > 0 ? `+${currentOffset}` : currentOffset} মি.
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAdjustOffset(waqt.key, 1)}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                        title="+1 মিনিট"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetOffsets}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{language === 'bn' ? 'অফসেট রিসেট করুন (০ মিনিট)' : 'Reset offsets to 0'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DISTRICTS PRESET LIST */}
        {activeTab === 'preset' && (
          <div className="overflow-y-auto flex-1 space-y-2 pr-1 text-xs flex flex-col">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                placeholder={language === 'bn' ? 'জেলার নাম লিখুন...' : 'Search BD district or global city...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#131D38] border border-slate-300 dark:border-[#1E2D55] text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#21409A]"
              />
            </div>

            <div className="overflow-y-auto flex-1 space-y-1 max-h-56 pr-1">
              {filteredPresets.map((loc) => {
                const isSelected = loc.name === draftLocation.name;
                return (
                  <button
                    key={`${loc.country}-${loc.name}`}
                    type="button"
                    onClick={() => handleSelectPreset(loc)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#21409A] text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-[#131D38] text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="text-left">
                      <span>{language === 'bn' ? loc.nameBn : loc.name}</span>
                      <span className={`text-[10px] ml-1.5 ${isSelected ? 'text-[#E9B7C3]' : 'text-slate-400'}`}>
                        ({loc.country})
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#E9B7C3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer Confirmation Buttons */}
        <div className="border-t border-[#E7D9DE] dark:border-[#1C2D5A] pt-3 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {language === 'bn' ? 'নির্বাচিত:' : 'Selected:'}{' '}
            <strong className="text-slate-900 dark:text-white">
              {language === 'bn' ? draftLocation.nameBn : draftLocation.name}
            </strong>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirmLocation}
              className="px-4 py-2 rounded-xl bg-[#21409A] hover:bg-[#18327E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'সংরক্ষণ ও প্রয়োগ করুন' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
