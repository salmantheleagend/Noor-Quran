import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppLanguage, LocationInfo } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import {
  Compass,
  Info,
  Sparkles,
  Check,
  AlertCircle,
  LocateFixed,
  RefreshCw,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioPlayer';
import kaabaArt from '../assets/images/kaaba_makkah_art_1790957360864.jpg';

interface QiblaCompassProps {
  language: AppLanguage;
  location: LocationInfo;
}

// Holy Kaaba Coordinates in Makkah al-Mukarramah
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

// Formula to calculate Great-Circle Qibla bearing from user latitude and longitude
function calculateQiblaBearing(lat: number, lng: number): number {
  const phiK = (KAABA_LAT * Math.PI) / 180.0;
  const lambdaK = (KAABA_LNG * Math.PI) / 180.0;
  const phi = (lat * Math.PI) / 180.0;
  const lambda = (lng * Math.PI) / 180.0;

  const numerator = Math.sin(lambdaK - lambda);
  const denominator =
    Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);

  let qibla = (Math.atan2(numerator, denominator) * 180.0) / Math.PI;
  if (qibla < 0) qibla += 360;
  return Math.round(qibla * 10) / 10;
}

// Distance to Kaaba via Haversine formula
function calculateDistanceToKaabaKm(lat: number, lng: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180.0;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180.0) *
      Math.cos((KAABA_LAT * Math.PI) / 180.0) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  language,
  location,
}) => {
  const t = TRANSLATIONS[language];
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasOrientationSensor, setHasOrientationSensor] = useState(false);
  const [manualAdjustment, setManualAdjustment] = useState<number>(0);

  // Live GPS state
  const [gpsCoordinates, setGpsCoordinates] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<
    'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'
  >('idle');
  const [gpsFeedback, setGpsFeedback] = useState<string | null>(null);
  const [needsSensorPermission, setNeedsSensorPermission] = useState(false);

  // Effective coordinates
  const currentLat = gpsCoordinates ? gpsCoordinates.lat : location.lat;
  const currentLng = gpsCoordinates ? gpsCoordinates.lng : location.lng;

  const qiblaAngle = calculateQiblaBearing(currentLat, currentLng);
  const distanceKm = calculateDistanceToKaabaKm(currentLat, currentLng);

  // Request device geolocation permission
  const handleRequestDeviceLocation = () => {
    triggerHaptic(15);
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('unsupported');
      setGpsFeedback(language === 'bn' ? 'আপনার ডিভাইসে জিপিএস লোকেশন সমর্থিত নয়।' : 'GPS location is not supported on this device.');
      return;
    }

    setIsLocating(true);
    setGpsStatus('requesting');
    setGpsFeedback(language === 'bn' ? 'ডিভাইসের লাইভ জিপিএস লোকেশন নেওয়া হচ্ছে...' : 'Acquiring live GPS location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsCoordinates({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
        });
        setIsLocating(false);
        setGpsStatus('granted');
        setGpsFeedback(language === 'bn' ? `জিপিএস সফল! সঠিকতা: ±${Math.round(accuracy)} মি.` : `GPS locked! Accuracy: ±${Math.round(accuracy)}m`);
        triggerHaptic(25);
        setTimeout(() => setGpsFeedback(null), 3500);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('denied');
          setGpsFeedback(language === 'bn' ? 'লোকেশন পারমিশন মেলেনি। জেলাভিত্তিক লোকেশন ব্যবহৃত হচ্ছে।' : 'Location permission denied. Using district default location.');
        } else {
          setGpsStatus('denied');
          setGpsFeedback(language === 'bn' ? 'জিপিএস সিগন্যাল পাওয়া যায়নি। জেলাভিত্তিক তথ্য ব্যবহৃত হচ্ছে।' : 'GPS signal unavailable. Using district default location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  // Request iOS / WebKit orientation permission if needed
  const handleRequestSensorPermission = async () => {
    triggerHaptic(15);
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
          .requestPermission === 'function'
      ) {
        const response = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (response === 'granted') {
          setNeedsSensorPermission(false);
          setHasOrientationSensor(true);
        }
      }
    } catch {
      // ignore
    }
  };

  // Try automatic GPS lookup on initial render once
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      handleRequestDeviceLocation();
    }
  }, []);

  // Orientation sensor event listener
  useEffect(() => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
        .requestPermission === 'function'
    ) {
      setNeedsSensorPermission(true);
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading = e.alpha || 0;
      if ('webkitCompassHeading' in e) {
        heading = (e as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      }
      setDeviceHeading(heading);
      setHasOrientationSensor(true);
      setNeedsSensorPermission(false);
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const effectiveHeading = (deviceHeading + manualAdjustment) % 360;
  const needleRotation = (qiblaAngle - effectiveHeading + 360) % 360;
  const isFacingQibla = Math.abs(needleRotation) < 5 || Math.abs(needleRotation - 360) < 5;

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-md mx-auto space-y-4 text-[#1F2937] dark:text-[#F8E8ED]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#10235A] dark:text-white">
          {t.qiblaCompass}
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-slate-400">
          {language === 'bn'
            ? 'লাইভ জিপিএস লোকেশন ও কাবার সঠিক দিকনির্দেশনা'
            : 'Live GPS Location & Precise Kaaba Direction'}
        </p>
      </div>

      {/* DEVICE GPS LOCATION PERMISSION & STATUS CARD */}
      <div
        className={`p-4 rounded-3xl border transition-all space-y-3 ${
          gpsStatus === 'granted'
            ? 'bg-[#F8E8ED]/90 dark:bg-[#142042] border-[#21409A]/40 dark:border-[#24386E] shadow-sm'
            : 'bg-white dark:bg-[#10235A]/50 border-[#E7D9DE] dark:border-[#24386E] shadow-md ring-1 ring-[#21409A]/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                gpsStatus === 'granted'
                  ? 'bg-[#21409A] text-white shadow-xs'
                  : 'bg-[#F8E8ED] dark:bg-[#1C2D5A] text-[#21409A] dark:text-[#E9B7C3] border border-[#E7D9DE] dark:border-[#24386E]'
              }`}
            >
              <LocateFixed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#10235A] dark:text-white block">
                {gpsCoordinates
                  ? (language === 'bn' ? '✓ লাইভ ডিভাইস জিপিএস সক্রিয় (সঠিক ডাটা)' : '✓ Live Device GPS Active (Accurate)')
                  : `${language === 'bn' ? 'বর্তমান অবস্থান: ' : 'Current Location: '}${language === 'bn' ? location.nameBn : location.name}`}
              </span>
              <p className="text-xs text-[#6B7280] dark:text-slate-300 mt-0.5">
                {gpsCoordinates
                  ? `${language === 'bn' ? 'লাইভ অক্ষাংশ' : 'Live Lat'}: ${gpsCoordinates.lat.toFixed(4)}°, ${language === 'bn' ? 'দ্রাঘিমাংশ' : 'Lng'}: ${gpsCoordinates.lng.toFixed(4)}° (${language === 'bn' ? 'সঠিকতা: ±' : 'Accuracy: ±'}${gpsCoordinates.accuracy || 15} ${language === 'bn' ? 'মি.' : 'm'})`
                  : (language === 'bn' ? 'ডিভাইসের লাইভ জিপিএস পারমিশন দিলে কাবার নির্ভুলতম ডিগ্রি ও দিক পাওয়া যাবে।' : 'Enable device GPS location for maximum precision and Kaaba heading.')}
              </p>
            </div>
          </div>

          <button
            onClick={handleRequestDeviceLocation}
            disabled={isLocating}
            className={`min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md self-start sm:self-auto shrink-0 ${
              isLocating
                ? 'bg-slate-200 dark:bg-slate-800 text-[#6B7280]'
                : 'bg-[#21409A] hover:bg-[#10235A] text-white'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating
                ? (language === 'bn' ? 'লোকেশন খোঁজা হচ্ছে...' : 'Locating...')
                : gpsStatus === 'granted'
                ? (language === 'bn' ? 'জিপিএস রিফ্রেশ' : 'Refresh GPS')
                : (language === 'bn' ? 'লোকেশন পারমিশন দিন' : 'Enable Location')}
            </span>
          </button>
        </div>

        {/* Feedback Alert Message */}
        {gpsFeedback && (
          <div
            className={`p-2.5 rounded-2xl text-xs flex items-center gap-2 ${
              gpsStatus === 'granted'
                ? 'bg-[#F8E8ED] dark:bg-[#10235A] text-[#10235A] dark:text-[#F8E8ED] border border-[#E7D9DE]'
                : 'bg-slate-100 dark:bg-slate-800 text-[#1F2937] dark:text-slate-300 border border-slate-200'
            }`}
          >
            {gpsStatus === 'granted' ? (
              <Check className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3] shrink-0 stroke-[3]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#21409A] shrink-0 stroke-[3]" />
            )}
            <span className="font-semibold">{gpsFeedback}</span>
          </div>
        )}

        {/* iOS Sensor Permission Button */}
        {needsSensorPermission && (
          <button
            onClick={handleRequestSensorPermission}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-2xl bg-[#21409A] hover:bg-[#10235A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>{language === 'bn' ? 'কম্পাস সেন্সর অনুমতি দিন (Allow Device Orientation)' : 'Allow Compass Sensor (Device Orientation)'}</span>
          </button>
        )}
      </div>

      {/* Kaaba Info Card in Deep Sapphire & Rose Quartz */}
      <div className="p-3.5 rounded-3xl bg-linear-to-r from-[#10235A] via-[#1c357f] to-[#0C152E] text-white shadow-md flex items-center justify-between border border-[#24386E]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#E9B7C3]/50 shrink-0 bg-[#0C152E]">
            <img
              src={kaabaArt}
              alt=""
              role="presentation"
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{language === 'bn' ? 'পবিত্র কাবা শরিফ (মক্কা)' : 'Holy Kaaba (Makkah)'}</h4>
            <span className="text-xs text-[#F8E8ED]/90">
              {language === 'bn' ? 'দূরত্ব: ' : 'Distance: '}<strong className="font-mono text-white">{distanceKm.toLocaleString()} {language === 'bn' ? 'কি.মি.' : 'km'}</strong>
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#E9B7C3] block uppercase font-bold">{language === 'bn' ? 'কিবলা কোণ' : 'Qibla Angle'}</span>
          <span className="text-lg font-bold font-mono text-[#E9B7C3]">
            {qiblaAngle}°
          </span>
        </div>
      </div>

      {/* Compass Circular Dial with Fluid Framer Motion Needle Animation */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-72 h-72 rounded-full bg-[#0C152E] border-8 border-[#10235A] shadow-2xl flex items-center justify-center select-none overflow-hidden">
          {/* Compass Dial Markings with Smooth Rotation Transition */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: -effectiveHeading }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, mass: 0.8 }}
          >
            {/* North Indicator */}
            <span className="absolute top-2 text-xs font-black text-rose-400 tracking-wider">
              {language === 'bn' ? 'N (উত্তর)' : 'N (North)'}
            </span>
            <span className="absolute bottom-2 text-xs font-bold text-slate-400">
              {language === 'bn' ? 'S (দক্ষিণ)' : 'S (South)'}
            </span>
            <span className="absolute right-2 text-xs font-bold text-slate-400">
              {language === 'bn' ? 'E (পূর্ব)' : 'E (East)'}
            </span>
            <span className="absolute left-2 text-xs font-bold text-slate-400">
              {language === 'bn' ? 'W (পশ্চিম)' : 'W (West)'}
            </span>

            {/* Compass degree ticks */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-3 bg-slate-700"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-120px)`,
                }}
              />
            ))}
          </motion.div>

          {/* Qibla Direction Needle with Smooth Motion Physics */}
          <motion.div
            className="absolute w-full h-full flex items-center justify-center pointer-events-none"
            animate={{ rotate: needleRotation }}
            transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.8 }}
          >
            {/* Needle pointing to Kaaba */}
            <div className="flex flex-col items-center justify-start h-full pt-6">
              <div className="w-8 h-8 rounded-full bg-[#21409A] text-white flex items-center justify-center shadow-lg border-2 border-[#E9B7C3] animate-pulse">
                🕋
              </div>
              <div className="w-1.5 h-20 bg-linear-to-b from-[#E9B7C3] via-[#21409A] to-[#10235A] rounded-full shadow-md" />
            </div>
          </motion.div>

          {/* Center Hub */}
          <div className="relative z-10 w-16 h-16 rounded-full bg-[#10235A] border-4 border-[#24386E] flex flex-col items-center justify-center text-white shadow-inner">
            <span className="text-xs font-mono font-bold text-[#E9B7C3]">
              {Math.round(needleRotation)}°
            </span>
            <span className="text-[9px] text-[#F8E8ED]/80 font-semibold">{language === 'bn' ? 'কিবলা' : 'Qibla'}</span>
          </div>
        </div>

        {/* Facing Status Notification */}
        <div className="mt-3">
          {isFacingQibla ? (
            <div className="px-4 py-1.5 rounded-full bg-[#21409A] text-white text-xs font-bold shadow-md flex items-center gap-1.5 border border-[#E9B7C3]/50">
              <Sparkles className="w-3.5 h-3.5 text-[#E9B7C3]" />
              <span>{language === 'bn' ? 'মাশাআল্লাহ! আপনি সঠিক কিবলামুখী আছেন' : 'MashaAllah! Facing Qibla accurately'}</span>
            </div>
          ) : (
            <p className="text-xs text-[#6B7280] dark:text-slate-400">
              {language === 'bn' ? 'কাবার প্রতীকের দিকে ফোনটি ধীরে ধীরে ঘোরান' : 'Slowly rotate phone toward Kaaba icon'}
            </p>
          )}
        </div>
      </div>

      {/* Manual Compass Rotation Slider */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#142042] border border-[#E7D9DE] dark:border-[#1C2D5A] space-y-2 text-xs">
        <div className="flex items-center justify-between text-[#10235A] dark:text-slate-300 font-bold">
          <span>{language === 'bn' ? 'ম্যানুয়াল দিক সমন্বয়:' : 'Manual Direction Adjustment:'}</span>
          <span className="font-mono">{effectiveHeading}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={manualAdjustment}
          onChange={(e) => setManualAdjustment(Number(e.target.value))}
          className="w-full accent-[#21409A]"
        />
        <div className="flex justify-between text-[10px] text-[#6B7280]">
          <span>{language === 'bn' ? 'উত্তর (০°)' : 'North (0°)'}</span>
          <span>{language === 'bn' ? 'পূর্ব (৯০°)' : 'East (90°)'}</span>
          <span>{language === 'bn' ? 'দক্ষিণ (১৮০°)' : 'South (180°)'}</span>
          <span>{language === 'bn' ? 'পশ্চিম (২৭০°)' : 'West (270°)'}</span>
        </div>
      </div>

      {/* Calibration Notice */}
      <div className="p-3 rounded-2xl bg-[#FCFAF8] dark:bg-[#10235A]/50 border border-[#E7D9DE] dark:border-[#1C2D5A] flex items-start gap-2.5 text-xs text-[#6B7280] dark:text-slate-300">
        <Info className="w-4 h-4 text-[#21409A] dark:text-[#E9B7C3] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {t.calibrateNotice} {language === 'bn' ? 'চৌম্বকীয় ক্ষেত্র বা ধাতব বস্তু থেকে ফোন দূরে রাখুন।' : 'Keep phone away from magnetic fields or metallic objects.'}
        </p>
      </div>
    </div>
  );
};

export default QiblaCompass;
