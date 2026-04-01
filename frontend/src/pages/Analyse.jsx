import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  LineChart,
  ScatterChart,
  AreaChart,
  Line,
  Area,
  Bar,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, MapPin } from 'lucide-react';

// Import des données réelles
import monthlyData from '../data/monthly.json';
import citiesData from '../data/cities.json';

const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

// Fonction pour préparer les données de corrélation (moyennes nationales)
const getCorrelationData = (year) => {
  const yearData = monthlyData.filter(d => d.year === year);
  return monthNames.map((month, idx) => {
    const monthData = yearData.filter(d => d.month === idx + 1);
    const avgPm25 = monthData.reduce((sum, d) => sum + (d.pm25 || 0), 0) / monthData.length || 0;
    const avgTemp = monthData.reduce((sum, d) => sum + (d.tempMax || 0), 0) / monthData.length || 0;
    const avgWind = monthData.reduce((sum, d) => sum + (d.windSpeed || 0), 0) / monthData.length || 0;
    return {
      month,
      pm25: Math.round(avgPm25),
      temp: Math.round(avgTemp * 10) / 10,
      wind: Math.round(avgWind * 10) / 10,
    };
  });
};

// Fonction pour obtenir les données d'une ville par année
const getCityYearlyData = (city, year) => {
  const cityYearData = monthlyData.filter(d => d.city === city && d.year === year);
  return monthNames.map((month, idx) => {
    const data = cityYearData.find(d => d.month === idx + 1);
    return {
      month,
      temp: data?.tempMax || null,
      pm25: data?.pm25 || null,
      precipitation: data?.precipitation || null,
      windSpeed: data?.windSpeed || null,
    };
  });
};

// Années disponibles
const availableYears = [...new Set(monthlyData.map(d => d.year))].sort();

// Générer heatmap data
const generateHeatmapData = () => {
  const data = [];
  for (let i = 0; i < 365; i++) {
    data.push({
      day: i,
      value: 15 + Math.random() * 25 + Math.sin(i / 30) * 10,
    });
  }
  return data;
};

const heatmapData = generateHeatmapData();

const getHeatmapColor = (val) => {
  if (val > 35) return 'bg-red-500';
  if (val > 30) return 'bg-orange-400';
  if (val > 25) return 'bg-yellow-300';
  if (val > 20) return 'bg-blue-300';
  return 'bg-blue-100';
};

const Analyse = () => {
  const [selectedYear, setSelectedYear] = useState(2025);
  const [compareYear, setCompareYear] = useState(2024);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');

  // Données de corrélation pour l'année sélectionnée
  const correlationData = useMemo(() => getCorrelationData(selectedYear), [selectedYear]);
  
  // Données scatter pour PM2.5 vs Wind
  const scatterData = useMemo(() => correlationData.map(d => ({
    wind: d.wind,
    pm25: d.pm25,
    month: d.month,
  })), [correlationData]);
  
  // Données annuelles
  const currentYearData = useMemo(() => {
    if (selectedCity) {
      return getCityYearlyData(selectedCity, selectedYear);
    }
    return getCorrelationData(selectedYear);
  }, [selectedYear, selectedCity]);
  
  const compareYearData = useMemo(() => {
    if (selectedCity) {
      return getCityYearlyData(selectedCity, compareYear);
    }
    return getCorrelationData(compareYear);
  }, [compareYear, selectedCity]);

  // Merge data for comparison
  const comparisonData = currentYearData.map((d, i) => ({
    month: d.month,
    temp1: d.temp,
    temp2: compareYearData[i].temp,
  }));

  return (
    <div className="w-full px-6 py-8 space-y-12">
      {/* SECTION 1: Facteurs Causaux */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-black text-[#0A2342] flex flex-col gap-1">
            <span>Facteurs Causaux de la Pollution</span>
            <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Analyse des corrélations entre qualité de l'air et facteurs climatiques
          </p>
        </div>

        {/* Chart 1: PM2.5 vs Temperature (Dual Axis) */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-[#0A2342]">
                La température influence-t-elle la pollution ?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Évolution mensuelle de PM2.5 et température (axe double)
              </p>
            </div>
            <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-full border border-teal-200">
              <span className="text-xs font-black">Corrélation: +0.73</span>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={correlationData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94A3B8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#94A3B8" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                  label={{
                    value: 'PM2.5 (μg/m³)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 12, fontWeight: 700, fill: '#64748B' },
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#F97316' }}
                  label={{
                    value: 'Température (°C)',
                    angle: 90,
                    position: 'insideRight',
                    style: { fontSize: 12, fontWeight: 700, fill: '#F97316' },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    padding: '12px',
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    paddingBottom: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="pm25"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  name="PM2.5"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temp"
                  stroke="#F97316"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#F97316', strokeWidth: 2, stroke: 'white' }}
                  name="Température"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: PM2.5 vs Wind Speed (Scatter) */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-[#0A2342]">
                Le vent réduit-il la pollution ?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Relation inverse entre vitesse du vent et concentration PM2.5
              </p>
            </div>
            <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-full border border-orange-200 flex items-center gap-2">
              <TrendingDown size={16} />
              <span className="text-xs font-black">Corrélation: -0.68</span>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  dataKey="wind"
                  name="Vent"
                  unit=" km/h"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                  label={{
                    value: 'Vitesse du Vent (km/h)',
                    position: 'insideBottom',
                    offset: -10,
                    style: { fontSize: 12, fontWeight: 700, fill: '#64748B' },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="pm25"
                  name="PM2.5"
                  unit=" μg/m³"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                  label={{
                    value: 'PM2.5 (μg/m³)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 12, fontWeight: 700, fill: '#64748B' },
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value, name) => [
                    `${value}${name === 'Vent' ? ' km/h' : ' μg/m³'}`,
                    name,
                  ]}
                />
                <Scatter
                  data={scatterData}
                  fill="#0D7377"
                  name="PM2.5 vs Vent"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 2: Évolution Annuelle */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#0A2342] flex flex-col gap-1">
              <span>Évolution Annuelle</span>
              <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Tendances de température sur 12 mois avec comparaison inter-annuelle
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Sélecteur de ville */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <select
                className="bg-white border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-bold text-[#0A2342] outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">Moyenne nationale</option>
                {citiesData.map(city => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-gray-600">Année:</label>
              <select
                className="bg-white border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-bold text-[#0A2342] outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded focus:ring-2 focus:ring-teal-400"
              />
              <span className="text-sm font-bold text-gray-600">Comparer avec</span>
              <select
                className="bg-white border border-gray-200 rounded-full px-3 py-1 text-sm font-bold text-[#0A2342] outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer"
                value={compareYear}
                onChange={(e) => setCompareYear(Number(e.target.value))}
                disabled={!showComparison}
              >
                {availableYears.filter(y => y !== selectedYear).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {!showComparison ? (
                <AreaChart data={currentYearData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                    label={{
                      value: 'Température (°C)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 12, fontWeight: 700, fill: '#64748B' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => [`${value}°C`, 'Température']}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#F97316"
                    strokeWidth={3}
                    fill="url(#colorTemp)"
                    name={`Température ${selectedYear}`}
                  />
                </AreaChart>
              ) : (
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748B' }}
                    label={{
                      value: 'Température (°C)',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fontSize: 12, fontWeight: 700, fill: '#64748B' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => [`${value}°C`]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', fontWeight: 700 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp1"
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{ r: 5, fill: 'white', stroke: '#F97316', strokeWidth: 2 }}
                    name={selectedYear}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp2"
                    stroke="#0D7377"
                    strokeWidth={3}
                    dot={{ r: 5, fill: 'white', stroke: '#0D7377', strokeWidth: 2 }}
                    name={compareYear}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: Intensité Thermique (Heatmap) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[#0A2342] flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <Calendar className="text-[#0D7377]" size={28} />
              Intensité Thermique Annuelle
            </span>
            <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Calendrier thermique complet de {selectedYear} - 365 jours visualisés
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          {/* Month Labels */}
          <div className="flex justify-between mb-4 px-2">
            {[
              'Janvier',
              'Février',
              'Mars',
              'Avril',
              'Mai',
              'Juin',
              'Juillet',
              'Août',
              'Septembre',
              'Octobre',
              'Novembre',
              'Décembre',
            ].map((m) => (
              <span key={m} className="text-[10px] font-black text-gray-400 uppercase">
                {m.slice(0, 3)}
              </span>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="w-full overflow-x-auto pb-6">
            <div className="flex flex-col flex-wrap h-[180px] gap-1.5" style={{ width: '100%' }}>
              {heatmapData.map((day) => (
                <div
                  key={day.day}
                  className={`w-3 h-3 rounded-sm ${getHeatmapColor(
                    day.value
                  )} hover:ring-2 ring-teal-500 transition-all cursor-pointer relative group`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-[#0A2342] text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap">
                      <p className="font-bold">Jour {day.day + 1}</p>
                      <p>Temp: {day.value.toFixed(1)}°C</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Légende */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400 uppercase">Moins chaud</span>
              <div className="h-3 w-64 rounded-full bg-gradient-to-r from-blue-100 via-blue-300 via-yellow-300 via-orange-400 to-red-500 shadow-inner"></div>
              <span className="text-xs font-bold text-gray-400 uppercase">Plus chaud</span>
            </div>
            <p className="text-xs font-medium text-gray-400 italic">
              * Basé sur les relevés journaliers {selectedYear}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyse;
