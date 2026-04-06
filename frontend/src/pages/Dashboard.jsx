import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, Polyline, useMap } from 'react-leaflet';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import {
  AlertTriangle, Wind, Thermometer, Droplets, CloudRain,
  Activity, Shield, Leaf, MapPin, Clock, Volume2, VolumeX,
  ChevronDown, Flame, Eye, Info
} from 'lucide-react';

import citiesData from '../data/cities.json';

// ============================================================================
// CONSTANTES & UTILITAIRES
// ============================================================================

const getAQIColor = (aqi) => {
  if (aqi >= 151) return '#DC2626'; // Rouge - Dangereux
  if (aqi >= 101) return '#F97316'; // Orange - Mauvais pour sensibles
  if (aqi >= 51) return '#EAB308';  // Jaune - Modéré
  return '#22C55E';                  // Vert - Bon
};

const getAQILevel = (aqi) => {
  if (aqi >= 151) return { level: 'dangerous', label: 'Dangereux', labelEn: 'Unhealthy' };
  if (aqi >= 101) return { level: 'unhealthy_sensitive', label: 'Mauvais (sensibles)', labelEn: 'Unhealthy for Sensitive' };
  if (aqi >= 51) return { level: 'moderate', label: 'Modéré', labelEn: 'Moderate' };
  return { level: 'good', label: 'Bon', labelEn: 'Good' };
};

// Pollution patterns selon les specs
const POLLUTION_PATTERNS = {
  episode_poussieres: {
    label: 'Épisode de poussières',
    labelEn: 'Dust Episode',
    color: '#D97706',
    condition: (data) => data.dust > 50 || (data.windSpeed > 15 && data.humidity < 30),
    advice: "Portez un masque à l'extérieur. Fermez les fenêtres. Rincez les yeux si irritation. Les groupes vulnérables doivent rester à l'intérieur."
  },
  stress_thermique: {
    label: 'Stress thermique',
    labelEn: 'Heat Stress',
    color: '#DC2626',
    condition: (data) => data.tempMax > 33 && data.windSpeed < 10 && data.humidity < 50,
    advice: "Risque d'ozone. Évitez les exercices en extérieur de 11h à 16h. Restez hydraté. Personnes âgées et asthmatiques — restez à l'intérieur."
  },
  stagnation_atmospherique: {
    label: 'Stagnation atmosphérique',
    labelEn: 'Atmospheric Stagnation',
    color: '#7C3AED',
    condition: (data) => data.windSpeed < 5 && data.humidity > 75 && data.pm25 > 20,
    advice: "Particules piégées par l'air stagnant. Limitez l'exposition extérieure. Enfants et personnes âgées plus à risque."
  },
  particules_saison_seche: {
    label: 'Particules saison sèche',
    labelEn: 'Dry Season Particles',
    color: '#EA580C',
    condition: (data) => data.pm25 > 35 && data.precipitation < 1,
    advice: "Particules élevées de saison sèche. Source non confirmée. Portez un masque si vous sortez."
  },
  qualite_acceptable: {
    label: 'Qualité acceptable',
    labelEn: 'Acceptable Quality',
    color: '#22C55E',
    condition: () => true, // Fallback
    advice: "Conditions normales. Pas de précaution particulière nécessaire."
  }
};

// Déterminer le pattern de pollution
const detectPollutionPattern = (cityData) => {
  const data = {
    dust: cityData.dust || 0,
    windSpeed: cityData.windSpeed || 10,
    humidity: 100 - (cityData.dust || 0), // Approximation
    tempMax: cityData.tempMax || 25,
    pm25: cityData.pm25 || 15,
    precipitation: cityData.precipitation || 0
  };

  for (const [key, pattern] of Object.entries(POLLUTION_PATTERNS)) {
    if (key !== 'qualite_acceptable' && pattern.condition(data)) {
      return { key, ...pattern };
    }
  }
  return { key: 'qualite_acceptable', ...POLLUTION_PATTERNS.qualite_acceptable };
};

// Simuler FIRMS data (feux détectés)
const generateFIRMSData = (city) => {
  // Simulation basée sur la région et la saison
  const northernRegions = ['Nord', 'Extreme-Nord', 'Adamaoua'];
  const isNorthern = northernRegions.includes(city.region);
  const hasFire = isNorthern && Math.random() > 0.6;
  
  return {
    hasFireNearby: hasFire,
    fireCount50km: hasFire ? Math.floor(Math.random() * 5) + 1 : 0,
    fireCount100km: hasFire ? Math.floor(Math.random() * 10) + 2 : 0,
    maxFRP: hasFire ? Math.floor(Math.random() * 150) + 50 : 0,
    highConfidence: hasFire && Math.random() > 0.3
  };
};

// Calculer mouvement de pollution
const calculatePollutionMovement = (city, allCities) => {
  if (city.current.windSpeed < 10) return null;
  
  // Chercher une ville en amont avec AQI > 50 plus élevé
  const upwindCities = allCities.filter(c => {
    if (c.name === city.name) return false;
    const distance = Math.sqrt(
      Math.pow(c.latitude - city.latitude, 2) + 
      Math.pow(c.longitude - city.longitude, 2)
    ) * 111; // Approximation km
    return distance < 200 && c.current.aqi > city.current.aqi + 50;
  });

  if (upwindCities.length === 0) return null;

  const source = upwindCities[0];
  const distance = Math.sqrt(
    Math.pow(source.latitude - city.latitude, 2) + 
    Math.pow(source.longitude - city.longitude, 2)
  ) * 111;
  
  const arrivalTime = Math.round(distance / city.current.windSpeed);
  const direction = getDirection(source.latitude - city.latitude, source.longitude - city.longitude);

  return {
    sourceCity: source.name,
    distance: Math.round(distance),
    direction,
    arrivalTime,
    windSpeed: city.current.windSpeed,
    sourceAQI: source.current.aqi
  };
};

const getDirection = (latDiff, lonDiff) => {
  const angle = Math.atan2(lonDiff, latDiff) * 180 / Math.PI;
  if (angle >= -22.5 && angle < 22.5) return 'N';
  if (angle >= 22.5 && angle < 67.5) return 'NE';
  if (angle >= 67.5 && angle < 112.5) return 'E';
  if (angle >= 112.5 && angle < 157.5) return 'SE';
  if (angle >= 157.5 || angle < -157.5) return 'S';
  if (angle >= -157.5 && angle < -112.5) return 'SO';
  if (angle >= -112.5 && angle < -67.5) return 'O';
  return 'NO';
};

// ============================================================================
// COMPOSANT ALERT SOUND (880 Hz bip)
// ============================================================================

const useAlertSound = () => {
  const audioContextRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

  const playBip = useCallback(() => {
    if (isMuted) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 880; // 880 Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }, [isMuted]);

  return { playBip, isMuted, setIsMuted };
};

// ============================================================================
// COMPOSANT MAP UPDATER
// ============================================================================

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 8, { duration: 0.5 });
    }
  }, [center, map]);
  return null;
};

// ============================================================================
// GÉNÉRATION DONNÉES HISTORIQUES
// ============================================================================

// Générateur pseudo-aléatoire déterministe basé sur une seed
const seededRandom = (seed) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Hash simple pour convertir string en nombre
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const generateHistoricalAQI = (baseAqi, cityName, years = ['2020', '2021', '2022', '2023', '2024', '2025']) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const seasonalFactor = [1.3, 1.4, 1.2, 0.9, 0.7, 0.6, 0.5, 0.55, 0.6, 0.8, 1.0, 1.2];
  const baseSeed = hashString(cityName);
  
  return years.flatMap((year, yi) => 
    months.map((month, i) => ({
      date: `${month} ${year}`,
      month,
      year,
      monthIndex: i,
      aqi: Math.round(baseAqi * seasonalFactor[i] * (0.85 + seededRandom(baseSeed + yi * 12 + i) * 0.3))
    }))
  );
};

const generatePatternDistribution = (cityName) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const baseSeed = hashString(cityName + '_pattern');
  
  return months.map((month, i) => {
    const isDrySeason = i < 3 || i > 9;
    const seed = baseSeed + i;
    return {
      month,
      episode_poussieres: isDrySeason ? Math.round(10 + seededRandom(seed) * 15) : Math.round(seededRandom(seed + 1) * 5),
      stress_thermique: i >= 1 && i <= 4 ? Math.round(5 + seededRandom(seed + 2) * 10) : Math.round(seededRandom(seed + 3) * 3),
      stagnation_atmospherique: !isDrySeason ? Math.round(8 + seededRandom(seed + 4) * 12) : Math.round(seededRandom(seed + 5) * 4),
      particules_saison_seche: isDrySeason ? Math.round(5 + seededRandom(seed + 6) * 10) : 0,
      qualite_acceptable: Math.round(15 + seededRandom(seed + 7) * 20)
    };
  });
};

const generateFireActivity = (cityName, region) => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const baseSeed = hashString(cityName + '_fires');
  const northernRegions = ['Nord', 'Extreme-Nord', 'Adamaoua'];
  const isNorthern = northernRegions.includes(region);
  const regionMultiplier = isNorthern ? 1.5 : 0.7;
  
  return months.map((month, i) => {
    let fires = 0;
    const seed = baseSeed + i;
    if (i <= 2) fires = Math.round((15 + seededRandom(seed) * 20) * regionMultiplier);
    else if (i >= 6 && i <= 8) fires = 0;
    else if (i >= 10) fires = Math.round((10 + seededRandom(seed) * 15) * regionMultiplier);
    else fires = Math.round(seededRandom(seed) * 8 * regionMultiplier);
    
    return {
      month,
      fires,
      annotation: i === 1 ? 'Pic brûlage agricole' : i === 7 ? 'Saison des pluies' : null
    };
  });
};

// ============================================================================
// COMPOSANT PRINCIPAL DASHBOARD
// ============================================================================

const Dashboard = () => {
  // États
  const [selectedCity, setSelectedCity] = useState(
    citiesData.find(c => c.name === 'Yaounde') || citiesData[0]
  );
  const [showAlertBanner, setShowAlertBanner] = useState(false);
  const [alertCities, setAlertCities] = useState([]);
  
  const { playBip, isMuted, setIsMuted } = useAlertSound();
  
  // Calculer données
  const cityData = selectedCity.current;
  const aqi = cityData.aqi || 50;
  const aqiLevel = getAQILevel(aqi);
  const pattern = detectPollutionPattern(cityData);
  const firms = useMemo(() => generateFIRMSData(selectedCity), [selectedCity]);
  const pollutionMovement = useMemo(
    () => calculatePollutionMovement(selectedCity, citiesData),
    [selectedCity]
  );

  // Données graphiques - dépendent de selectedCity pour se rafraîchir
  const historicalAQI = useMemo(
    () => generateHistoricalAQI(aqi, selectedCity.name), 
    [selectedCity.name, aqi]
  );
  const patternDistribution = useMemo(
    () => generatePatternDistribution(selectedCity.name), 
    [selectedCity.name]
  );
  const fireActivity = useMemo(
    () => generateFireActivity(selectedCity.name, selectedCity.region), 
    [selectedCity.name, selectedCity.region]
  );

  // Dernières données pour graphique ligne (dernière année)
  const recentAQI = useMemo(() => historicalAQI.filter(d => d.year === '2025'), [historicalAQI]);

  // Détecter villes en alerte
  useEffect(() => {
    const alerts = citiesData.filter(c => c.current.aqi >= 151 || generateFIRMSData(c).hasFireNearby);
    setAlertCities(alerts);
    setShowAlertBanner(alerts.length > 0);
    
    // Jouer son si alerte active
    if (alerts.length > 0 && !isMuted) {
      const interval = setInterval(() => playBip(), 5000);
      playBip(); // Jouer immédiatement
      return () => clearInterval(interval);
    }
  }, [playBip, isMuted]);

  // Régions pour grouper
  const regions = [...new Set(citiesData.map(c => c.region))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== ALERT BANNER (si AQI > 150 ou feu FIRMS) ========== */}
      {showAlertBanner && alertCities.length > 0 && (
        <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="animate-bounce" size={24} />
            <div>
              <span className="font-bold">ALERTE POLLUTION</span>
              <span className="ml-2">
                {alertCities.slice(0, 3).map(c => `${c.name} (AQI ${c.current.aqi})`).join(', ')}
                {alertCities.length > 3 && ` +${alertCities.length - 3} autres`}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      )}

      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 px-4 md:px-6 shadow-lg">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
              <Wind size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">AirWatch Cameroun</h1>
              <p className="text-slate-400 text-xs">Surveillance qualité de l'air en temps réel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedCity.name}
              onChange={(e) => setSelectedCity(citiesData.find(c => c.name === e.target.value))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
            >
              {regions.map(region => (
                <optgroup key={region} label={region}>
                  {citiesData.filter(c => c.region === region).map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock size={14} />
              <span>{new Date().toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 md:px-6 py-6 space-y-6">
        {/* ========== SCREEN 1: CARTE INTERACTIVE ========== */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <MapPin size={20} className="text-teal-600" />
              Carte AQI — {citiesData.length} villes
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Bon</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Modéré</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Mauvais</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span> Dangereux</span>
            </div>
          </div>
          
          <div className="h-[550px]">
            <MapContainer
              center={[6.5, 12.5]}
              zoom={5.5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <MapUpdater center={selectedCity ? [selectedCity.latitude, selectedCity.longitude] : null} />
              
              {/* Pollution movement arrows */}
              {pollutionMovement && (
                <Polyline
                  positions={[
                    [citiesData.find(c => c.name === pollutionMovement.sourceCity)?.latitude || 0,
                     citiesData.find(c => c.name === pollutionMovement.sourceCity)?.longitude || 0],
                    [selectedCity.latitude, selectedCity.longitude]
                  ]}
                  pathOptions={{ color: '#DC2626', weight: 3, dashArray: '10, 10' }}
                />
              )}
              
              {/* City markers */}
              {citiesData.map((city) => {
                const isSelected = city.name === selectedCity.name;
                const cityAqi = city.current.aqi || 50;
                const isAlert = cityAqi >= 151 || generateFIRMSData(city).hasFireNearby;
                
                return (
                  <CircleMarker
                    key={city.name}
                    center={[city.latitude, city.longitude]}
                    radius={isSelected ? 14 : 10}
                    fillColor={getAQIColor(cityAqi)}
                    color={isSelected ? '#0D7377' : '#fff'}
                    weight={isSelected ? 3 : 2}
                    fillOpacity={0.85}
                    className={isAlert ? 'animate-pulse' : ''}
                    eventHandlers={{
                      click: () => setSelectedCity(city)
                    }}
                  >
                    <LeafletTooltip direction="top" offset={[0, -10]}>
                      <div className="text-center font-medium">
                        <div className="font-bold">{city.name}</div>
                        <div style={{ color: getAQIColor(cityAqi) }}>
                          AQI: {cityAqi} — {getAQILevel(cityAqi).label}
                        </div>
                        {isAlert && (
                          <div className="text-red-600 text-xs mt-1">⚠️ Alerte active</div>
                        )}
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* ========== SCREEN 2: CITY DETAIL PANEL ========== */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* AQI Card */}
          <div 
            className="rounded-2xl p-6 border-2 transition-all"
            style={{ 
              backgroundColor: `${getAQIColor(aqi)}15`,
              borderColor: getAQIColor(aqi)
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{selectedCity.name}</h3>
                <p className="text-gray-500 text-sm">{selectedCity.region}</p>
              </div>
              <span 
                className="px-3 py-1 rounded-full text-white text-sm font-bold"
                style={{ backgroundColor: getAQIColor(aqi) }}
              >
                {aqiLevel.label}
              </span>
            </div>
            
            <div className="text-center py-6">
              <p 
                className="text-8xl font-black"
                style={{ color: getAQIColor(aqi) }}
              >
                {aqi}
              </p>
              <p className="text-gray-500 mt-2">Indice Qualité Air (AQI)</p>
            </div>
            
            {/* Pattern badge */}
            <div 
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: pattern.color }}
            >
              <Activity size={16} />
              {pattern.label}
            </div>
            
            {/* Last updated */}
            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <Clock size={12} />
              Dernière mise à jour: {selectedCity.lastUpdate}
            </p>
          </div>

          {/* FIRMS & Weather */}
          <div className="space-y-4">
            {/* FIRMS Status */}
            <div className={`rounded-xl p-4 border ${firms.hasFireNearby ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Flame className={firms.hasFireNearby ? 'text-red-500' : 'text-green-500'} size={20} />
                <span className="font-bold text-gray-800">NASA FIRMS</span>
              </div>
              {firms.hasFireNearby ? (
                <p className="text-sm text-red-700">
                  🔥 {firms.fireCount50km} feu(x) confirmé(s) dans un rayon de 50 km. 
                  Intensité max: {firms.maxFRP} MW — source probable de fumée.
                </p>
              ) : (
                <p className="text-sm text-green-700">
                  ✓ Aucun feu actif détecté dans un rayon de 100 km — cause probable: poussière ou émissions locales.
                </p>
              )}
            </div>

            {/* Weather conditions */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-3 text-sm">Conditions météo</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="text-red-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Température</p>
                    <p className="font-bold">{cityData.tempMax || cityData.tempMean}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="text-blue-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Vent</p>
                    <p className="font-bold">{cityData.windSpeed} km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="text-cyan-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Précipitations</p>
                    <p className="font-bold">{cityData.precipitation} mm</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="text-amber-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Poussière</p>
                    <p className="font-bold">{cityData.dust} µg/m³</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pollution movement alert */}
            {pollutionMovement && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="text-orange-500" size={20} />
                  <span className="font-bold text-orange-800">Mouvement de pollution détecté</span>
                </div>
                <p className="text-sm text-orange-700">
                  Pollution élevée à <strong>{pollutionMovement.sourceCity}</strong> ({pollutionMovement.sourceAQI} AQI), 
                  {pollutionMovement.distance} km {pollutionMovement.direction}. 
                  Vent à {pollutionMovement.windSpeed} km/h — arrivée estimée dans ~{pollutionMovement.arrivalTime}h.
                </p>
              </div>
            )}
          </div>

          {/* Health Advice */}
          <div 
            className="rounded-xl p-5 border"
            style={{ 
              backgroundColor: `${pattern.color}10`,
              borderColor: pattern.color
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield style={{ color: pattern.color }} size={24} />
              <h4 className="font-bold text-gray-800">Conseils santé</h4>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{pattern.advice}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Groupes vulnérables:</p>
              <div className="flex flex-wrap gap-2">
                {['Enfants', 'Personnes âgées', 'Asthmatiques', 'Femmes enceintes'].map(group => (
                  <span key={group} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                    {group}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========== SCREEN 3: HISTORICAL CHARTS ========== */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-teal-600" size={24} />
            Données historiques — {selectedCity.name} (2020-2025)
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Chart 1: AQI Over Time */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-1">Évolution AQI (moyennes mensuelles)</h3>
              <p className="text-xs text-gray-500 mb-4">Année 2025 • Tendances saisonnières</p>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={recentAQI}>
                  <defs>
                    <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 200]} />
                  <Tooltip />
                  <ReferenceLine y={100} stroke="#F97316" strokeDasharray="5 5" label={{ value: 'Seuil mauvais', position: 'right', fontSize: 10 }} />
                  <ReferenceLine y={50} stroke="#EAB308" strokeDasharray="5 5" />
                  <Area 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke="#DC2626" 
                    strokeWidth={2}
                    fill="url(#aqiGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-2 italic">
                📌 Pic Fév-Mar: saison Harmattan • Creux Jul-Sep: saison des pluies
              </p>
            </div>

            {/* Chart 2: Pollution Pattern Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-1">Distribution des patterns de pollution</h3>
              <p className="text-xs text-gray-500 mb-4">Fréquence par mois • Contraste saison sèche/pluies</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={patternDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="episode_poussieres" name="Poussières" stackId="a" fill="#D97706" />
                  <Bar dataKey="stress_thermique" name="Stress therm." stackId="a" fill="#DC2626" />
                  <Bar dataKey="stagnation_atmospherique" name="Stagnation" stackId="a" fill="#7C3AED" />
                  <Bar dataKey="particules_saison_seche" name="Saison sèche" stackId="a" fill="#EA580C" />
                  <Bar dataKey="qualite_acceptable" name="Acceptable" stackId="a" fill="#22C55E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Fire Activity (FIRMS) */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              Activité feux dans un rayon de 50 km (NASA FIRMS 2020-2025)
            </h3>
            <p className="text-xs text-gray-500 mb-4">Détections satellites • Cumul mensuel</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fireActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="fires" name="Feux détectés" fill="#DC2626" radius={[4, 4, 0, 0]}>
                  {fireActivity.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fires > 15 ? '#DC2626' : entry.fires > 5 ? '#F97316' : '#22C55E'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-between mt-2 text-xs text-gray-400 italic">
              <span>📌 Pic Jan-Mar: brûlage agricole</span>
              <span>📌 Zéro Jul-Sep: saison des pluies</span>
            </div>
          </div>
        </div>

        {/* ========== PARTICULATE DATA ========== */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-gray-500 text-sm">PM2.5</p>
            <p className="text-3xl font-bold text-purple-600">{cityData.pm25 || 15}</p>
            <p className="text-xs text-gray-400">µg/m³</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-gray-500 text-sm">PM10</p>
            <p className="text-3xl font-bold text-blue-600">{cityData.pm10 || 25}</p>
            <p className="text-xs text-gray-400">µg/m³</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-gray-500 text-sm">Poussière</p>
            <p className="text-3xl font-bold text-amber-600">{cityData.dust || 10}</p>
            <p className="text-xs text-gray-400">µg/m³</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-gray-500 text-sm">Rafales vent</p>
            <p className="text-3xl font-bold text-cyan-600">{cityData.windGusts || 20}</p>
            <p className="text-xs text-gray-400">km/h</p>
          </div>
        </div>

        {/* ========== CITY RANKINGS ========== */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              Villes en alerte (AQI élevé)
            </h3>
            <div className="space-y-2">
              {[...citiesData].sort((a, b) => b.current.aqi - a.current.aqi).slice(0, 5).map((city, i) => (
                <div 
                  key={city.name}
                  onClick={() => setSelectedCity(city)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                    <div>
                      <p className="font-medium">{city.name}</p>
                      <p className="text-xs text-gray-500">{city.region}</p>
                    </div>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: getAQIColor(city.current.aqi) }}
                  >
                    {city.current.aqi}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Leaf className="text-green-500" size={20} />
              Villes avec air sain
            </h3>
            <div className="space-y-2">
              {[...citiesData].sort((a, b) => a.current.aqi - b.current.aqi).slice(0, 5).map((city, i) => (
                <div 
                  key={city.name}
                  onClick={() => setSelectedCity(city)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">{i + 1}</span>
                    <div>
                      <p className="font-medium">{city.name}</p>
                      <p className="text-xs text-gray-500">{city.region}</p>
                    </div>
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: getAQIColor(city.current.aqi) }}
                  >
                    {city.current.aqi}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
