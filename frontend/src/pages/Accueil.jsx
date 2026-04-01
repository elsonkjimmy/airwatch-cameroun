import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import { LineChart, BarChart, Bar, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Thermometer, Wind, CloudRain, Sun, AlertTriangle, Heart, Shield, Activity, TrendingUp, TrendingDown, Users, Leaf, Droplets } from 'lucide-react';

// Import des données réelles
import citiesData from '../data/cities.json';
import regionsData from '../data/regions.json';

// Transformer les données pour l'affichage
const villesCamerounData = citiesData.map(city => ({
  name: city.name,
  region: city.region,
  pos: [city.latitude, city.longitude],
  aqi: city.current.aqi || 50,
  tempMax: city.current.tempMax || 25,
  tempMin: city.current.tempMin || 18,
  tempMean: city.current.tempMean || 22,
  wind: city.current.windSpeed || 10,
  windGusts: city.current.windGusts || 20,
  precip: city.current.precipitation || 0,
  pm25: city.current.pm25 || 15,
  pm10: city.current.pm10 || 20,
  dust: city.current.dust || 10,
  apparentMax: city.current.apparentMax || 28,
  lastUpdate: city.lastUpdate
}));

const getAQIColor = (aqi) => {
  if (aqi >= 150) return '#DC2626'; // Rouge - Critique
  if (aqi >= 100) return '#F97316'; // Orange - Mauvais
  if (aqi >= 50) return '#EAB308'; // Jaune - Modéré
  return '#14A44D'; // Vert - Bon
};

const getAQILabel = (aqi) => {
  if (aqi >= 150) return 'Critique';
  if (aqi >= 100) return 'Mauvais';
  if (aqi >= 50) return 'Modéré';
  return 'Bon';
};

const getHealthAdvice = (aqi) => {
  if (aqi >= 150) return {
    message: "Évitez toute activité extérieure prolongée. Port du masque recommandé.",
    icon: AlertTriangle,
    color: "#DC2626",
    groups: ["Enfants", "Personnes âgées", "Asthmatiques"]
  };
  if (aqi >= 100) return {
    message: "Limitez les efforts physiques intenses à l'extérieur.",
    icon: Shield,
    color: "#F97316",
    groups: ["Personnes sensibles"]
  };
  if (aqi >= 50) return {
    message: "Qualité acceptable. Les personnes sensibles doivent rester vigilantes.",
    icon: Activity,
    color: "#EAB308",
    groups: []
  };
  return {
    message: "Qualité de l'air satisfaisante. Aucune précaution particulière.",
    icon: Leaf,
    color: "#14A44D",
    groups: []
  };
};

// Données d'évolution sur 7 jours
const getWeeklyData = (baseAqi) => [
  { jour: 'Lun', aqi: Math.round(baseAqi * 0.9) },
  { jour: 'Mar', aqi: Math.round(baseAqi * 0.95) },
  { jour: 'Mer', aqi: Math.round(baseAqi * 1.05) },
  { jour: 'Jeu', aqi: Math.round(baseAqi * 0.98) },
  { jour: 'Ven', aqi: Math.round(baseAqi * 1.02) },
  { jour: 'Sam', aqi: Math.round(baseAqi * 0.92) },
  { jour: 'Dim', aqi: baseAqi },
];

const Accueil = ({ selectedVille, setSelectedVille }) => {
  const selectedCityData = villesCamerounData.find(v => v.name === selectedVille) || villesCamerounData[0];
  const healthAdvice = getHealthAdvice(selectedCityData.aqi);
  const HealthIcon = healthAdvice.icon;
  const weeklyData = getWeeklyData(selectedCityData.aqi);
  
  // Top 5 villes les plus polluées
  const topPolluted = [...villesCamerounData]
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 5);
  
  // Top 5 villes les moins polluées
  const cleanestCities = [...villesCamerounData]
    .sort((a, b) => a.aqi - b.aqi)
    .slice(0, 5);

  // Données sparkline pour les cartes métriques (6 derniers mois simulés)
  const sparklineData = [
    { value: selectedCityData.tempMax - 3 },
    { value: selectedCityData.tempMax - 2 },
    { value: selectedCityData.tempMax - 1 },
    { value: selectedCityData.tempMax },
    { value: selectedCityData.tempMax + 1 },
    { value: selectedCityData.tempMax + 2 },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* TOP 60% - MAP */}
      <div className="w-full" style={{ height: '50vh', minHeight: '300px' }}>
        <div className="relative w-full h-full overflow-hidden">
          <MapContainer 
            center={[7.36, 12.35]} 
            zoom={5.5} 
            style={{ height: '100%', width: '100%', zIndex: 10 }}
            zoomControl={false}
          >
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {villesCamerounData.map((ville, i) => (
              <CircleMarker
                key={i}
                center={ville.pos}
                radius={ville.name === selectedVille ? 16 : 10}
                pathOptions={{
                  fillColor: getAQIColor(ville.aqi),
                  color: ville.name === selectedVille ? '#10B981' : 'white',
                  weight: ville.name === selectedVille ? 4 : 2,
                  fillOpacity: 0.85,
                }}
                eventHandlers={{
                  click: () => setSelectedVille(ville.name),
                }}
                className={ville.name === selectedVille ? 'animate-pulse' : ''}
              >
                <LeafletTooltip 
                  direction="top" 
                  opacity={1} 
                  className="rounded-lg shadow-xl border-none p-0 overflow-hidden"
                  permanent={ville.name === selectedVille}
                >
                  <div className="bg-[#0A2342] text-white p-3 text-xs">
                    <div className="font-black uppercase mb-1.5">{ville.name}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">AQI:</span>
                        <span 
                          className="font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: getAQIColor(ville.aqi) }}
                        >
                          {ville.aqi} - {getAQILabel(ville.aqi)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">Temp:</span>
                        <span className="font-bold text-orange-400">{ville.tempMax}°C</span>
                      </div>
                    </div>
                  </div>
                </LeafletTooltip>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Légende Overlay - compacte sur mobile */}
          <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 z-[1000] bg-white/95 backdrop-blur-md p-2 md:p-4 rounded-lg md:rounded-xl shadow-2xl border border-white/50">
            <p className="text-[9px] md:text-xs font-black uppercase text-[#0A2342] mb-1.5 md:mb-3 tracking-tight">Qualité Air</p>
            <div className="flex flex-row md:flex-col gap-2 md:gap-2">
              <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold">
                <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#14A44D' }}></div>
                <span className="hidden md:inline">0-49: Bon</span>
              </div>
              <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold">
                <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#EAB308' }}></div>
                <span className="hidden md:inline">50-99: Modéré</span>
              </div>
              <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold">
                <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
                <span className="hidden md:inline">100-149: Mauvais</span>
              </div>
              <div className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold">
                <div className="w-2.5 h-2.5 md:w-4 md:h-4 rounded-full" style={{ backgroundColor: '#DC2626' }}></div>
                <span className="hidden md:inline">150+: Critique</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM 40% - METRIC CARDS */}
      <div className="w-full px-4 md:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {/* Temp Max Card */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-l-4 border-orange-500 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="flex items-center gap-2 text-orange-600">
                <Thermometer size={18} className="md:hidden" strokeWidth={2.5} />
                <Thermometer size={24} className="hidden md:block" strokeWidth={2.5} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Temp Max</span>
              </div>
              <div className="h-8 w-12 md:h-10 md:w-20 hidden sm:block">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#F97316" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-4xl font-black text-[#0A2342]">
                {selectedCityData.tempMax}
                <span className="text-sm md:text-lg font-bold text-gray-400 ml-1">°C</span>
              </p>
              <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase mt-1 md:mt-2 truncate">
                {selectedCityData.name}
              </p>
            </div>
          </div>

          {/* Temp Min Card */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-l-4 border-blue-500 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Thermometer size={18} className="md:hidden" strokeWidth={2.5} />
                <Thermometer size={24} className="hidden md:block" strokeWidth={2.5} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Temp Min</span>
              </div>
              <div className="h-8 w-12 md:h-10 md:w-20 hidden sm:block">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData.map(d => ({ value: d.value - 10 }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-4xl font-black text-[#0A2342]">
                {selectedCityData.tempMin}
                <span className="text-sm md:text-lg font-bold text-gray-400 ml-1">°C</span>
              </p>
              <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase mt-1 md:mt-2">
                Nuit: {selectedCityData.tempMin - 2}°C
              </p>
            </div>
          </div>

          {/* Wind Card */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-l-4 border-teal-500 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="flex items-center gap-2 text-teal-600">
                <Wind size={18} className="md:hidden" strokeWidth={2.5} />
                <Wind size={24} className="hidden md:block" strokeWidth={2.5} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Vent</span>
              </div>
              <div className="h-8 w-12 md:h-10 md:w-20 hidden sm:block">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData.map(d => ({ value: selectedCityData.wind + Math.random() * 4 }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#0D7377" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-4xl font-black text-[#0A2342]">
                {selectedCityData.wind}
                <span className="text-sm md:text-lg font-bold text-gray-400 ml-1">km/h</span>
              </p>
              <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase mt-1 md:mt-2">
                Rafales: {selectedCityData.wind + 12}km/h
              </p>
            </div>
          </div>

          {/* Precipitation Card */}
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border-l-4 border-blue-400 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-2 md:mb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <CloudRain size={18} className="md:hidden" strokeWidth={2.5} />
                <CloudRain size={24} className="hidden md:block" strokeWidth={2.5} />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Pluie</span>
              </div>
              <div className="h-8 w-12 md:h-10 md:w-20 hidden sm:block">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData.map(d => ({ value: selectedCityData.precip + Math.random() * 5 }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#60A5FA" 
                      strokeWidth={2} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-4xl font-black text-[#0A2342]">
                {selectedCityData.precip}
                <span className="text-sm md:text-lg font-bold text-gray-400 ml-1">mm</span>
              </p>
              <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase mt-1 md:mt-2">
                24h cumulées
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AQI DÉTAILLÉ + CONSEILS SANTÉ */}
      <div className="w-full px-4 md:px-6 py-6 bg-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Carte AQI Grande */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                Indice Qualité de l'Air
              </p>
              <div 
                className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ 
                  backgroundColor: `${getAQIColor(selectedCityData.aqi)}20`,
                  border: `4px solid ${getAQIColor(selectedCityData.aqi)}`
                }}
              >
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-black" style={{ color: getAQIColor(selectedCityData.aqi) }}>
                    {selectedCityData.aqi}
                  </p>
                  <p className="text-xs font-bold text-gray-500">AQI</p>
                </div>
              </div>
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black"
                style={{ 
                  backgroundColor: `${getAQIColor(selectedCityData.aqi)}20`,
                  color: getAQIColor(selectedCityData.aqi)
                }}
              >
                <Activity size={16} />
                {getAQILabel(selectedCityData.aqi)}
              </div>
              <p className="mt-4 text-lg font-black text-[#0A2342]">{selectedCityData.name}</p>
            </div>
          </div>

          {/* Conseils Santé */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${healthAdvice.color}20` }}
              >
                <HealthIcon size={24} style={{ color: healthAdvice.color }} />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0A2342]">
                  Conseils Santé
                </h3>
                <p className="text-xs text-gray-500">Recommandations du jour</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {healthAdvice.message}
            </p>
            
            {healthAdvice.groups.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2">Groupes à risque :</p>
                <div className="flex flex-wrap gap-2">
                  {healthAdvice.groups.map((group, i) => (
                    <span 
                      key={i}
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `${healthAdvice.color}15`,
                        color: healthAdvice.color
                      }}
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <Heart size={14} className="text-red-400" />
              <span>Protégez votre santé et celle de vos proches</span>
            </div>
          </div>

          {/* Évolution 7 jours */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0A2342]">
                  Tendance 7 jours
                </h3>
                <p className="text-xs text-gray-500">Évolution AQI à {selectedCityData.name}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                <TrendingDown size={14} />
                <span>-8%</span>
              </div>
            </div>
            
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis 
                    dataKey="jour" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
                    }}
                    formatter={(value) => [`${value} AQI`, 'Qualité air']}
                  />
                  <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
                    {weeklyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getAQIColor(entry.aqi)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: TOP VILLES POLLUÉES + VILLES PROPRES */}
      <div className="w-full px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Villes les plus polluées */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0A2342]">
                  Alertes Pollution
                </h3>
                <p className="text-xs text-gray-500">Top 5 villes les plus polluées</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {topPolluted.map((ville, i) => (
                <div 
                  key={ville.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => setSelectedVille(ville.name)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-gray-300">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-[#0A2342]">{ville.name}</p>
                      <p className="text-[10px] text-gray-500">{ville.tempMax}°C • {ville.wind} km/h</p>
                    </div>
                  </div>
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-black text-white"
                    style={{ backgroundColor: getAQIColor(ville.aqi) }}
                  >
                    {ville.aqi}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Villes les plus propres */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Leaf size={20} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-[#0A2342]">
                  Air Pur
                </h3>
                <p className="text-xs text-gray-500">Top 5 villes les moins polluées</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {cleanestCities.map((ville, i) => (
                <div 
                  key={ville.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => setSelectedVille(ville.name)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-gray-300">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold text-[#0A2342]">{ville.name}</p>
                      <p className="text-[10px] text-gray-500">{ville.tempMax}°C • {ville.precip} mm pluie</p>
                    </div>
                  </div>
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-black text-white"
                    style={{ backgroundColor: getAQIColor(ville.aqi) }}
                  >
                    {ville.aqi}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: STATISTIQUES NATIONALES */}
      <div className="w-full px-4 md:px-6 py-6 bg-gradient-to-r from-[#0A2342] to-[#0D7377]">
        <div className="text-center mb-6">
          <h3 className="text-lg md:text-xl font-black text-white">Aperçu National</h3>
          <p className="text-sm text-teal-200/70">Statistiques en temps réel sur 42 villes</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl md:text-4xl font-black text-white">42</p>
            <p className="text-xs text-teal-200/70 font-bold uppercase mt-1">Villes</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl md:text-4xl font-black text-green-400">
              {villesCamerounData.filter(v => v.aqi < 50).length}
            </p>
            <p className="text-xs text-teal-200/70 font-bold uppercase mt-1">Air Bon</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl md:text-4xl font-black text-orange-400">
              {villesCamerounData.filter(v => v.aqi >= 100 && v.aqi < 150).length}
            </p>
            <p className="text-xs text-teal-200/70 font-bold uppercase mt-1">Air Mauvais</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-3xl md:text-4xl font-black text-red-400">
              {villesCamerounData.filter(v => v.aqi >= 150).length}
            </p>
            <p className="text-xs text-teal-200/70 font-bold uppercase mt-1">Alerte</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accueil;
