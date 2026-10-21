import React, { useState } from 'react';
import { AppLanguage, LocationInfo } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { BD_DISTRICTS, GLOBAL_CITIES } from '../data/districtsBD';
import {
  MapPin,
  Search,
  Crosshair,
  Check,
  X,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';

interface LocationModalProps {
  language: AppLanguage;
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  language,
  currentLocation,
  onSelectLocation,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const [search, setSearch] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleSelect = (loc: LocationInfo) => {
    triggerHaptic(15);
    onSelectLocation(loc);
    onClose();
  };

  const handleDetectGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('আপনার ডিভাইসে জিপিএস সমর্থন করে না।');
      return;
    }
    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const { latitude, longitude } = pos.coords;
        // Find closest BD district
        let closest = BD_DISTRICTS[0];
        let minDist = 999999;
        for (const dist of BD_DISTRICTS) {
          const d = Math.hypot(dist.lat - latitude, dist.lng - longitude);
          if (d < minDist) {
            minDist = d;
            closest = dist;
          }
        }
        handleSelect({
          name: closest.name,
          nameBn: closest.nameBn,
          nameAr: closest.nameAr,
          lat: latitude,
          lng: longitude,
          country: 'Bangladesh (GPS)',
        });
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError('লোকেশন পাওয়া যায়নি। অনুগ্রহ করে তালিকা থেকে জেলা নির্বাচন করুন।');
      },
      { timeout: 10000 }
    );
  };

  const allLocations = [...BD_DISTRICTS, ...GLOBAL_CITIES];
  const filtered = allLocations.filter(loc => {
    const q = search.toLowerCase().trim();
    return !q ||
      loc.name.toLowerCase().includes(q) ||
      loc.nameBn.includes(q) ||
      loc.nameAr.includes(q) ||
      loc.country.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-4 space-y-3 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E7D9DE] dark:border-[#1C2D5A] pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.changeLocation}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* GPS Auto-detect Button */}
        <button
          onClick={handleDetectGps}
          disabled={isDetectingGps}
          className="w-full py-2.5 px-3 rounded-2xl bg-[#F8E8ED] dark:bg-[#10235A] border border-[#E7D9DE] dark:border-[#21409A]/40 text-[#21409A] dark:text-[#E9B7C3] text-xs font-semibold hover:bg-[#E9B7C3]/30 transition-colors flex items-center justify-center gap-2"
        >
          <Crosshair className={`w-4 h-4 ${isDetectingGps ? 'animate-spin' : ''}`} />
          <span>{isDetectingGps ? 'জিপিএস খোঁজা হচ্ছে...' : t.autoDetectGps}</span>
        </button>

        {gpsError && (
          <p className="text-[11px] text-rose-500 text-center font-medium">
            {gpsError}
          </p>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="জেলার নাম বা শহর লিখুন..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-[#E7D9DE] dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#21409A]"
          />
        </div>

        {/* Locations List */}
        <div className="overflow-y-auto flex-1 space-y-1 pr-1 text-xs">
          {filtered.map((loc) => {
            const isSelected = loc.name === currentLocation.name;

            return (
              <button
                key={`${loc.country}-${loc.name}`}
                onClick={() => handleSelect(loc)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-[#21409A] text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
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
    </div>
  );
};
