import React, { useState } from 'react';
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
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

// Données mensuelles pour les corrélations
const correlationData = [
  { month: 'Jan', pm25: 90, temp: 24, wind: 15, correlation: 0.73 },
  { month: 'Fév', pm25: 110, temp: 26, wind: 18, correlation: 0.73 },
  { month: 'Mar', pm25: 140, temp: 31, wind: 25, correlation: 0.73 },
  { month: 'Avr', pm25: 85, temp: 35, wind: 12, correlation: 0.73 },
  { month: 'Mai', pm25: 60, temp: 33, wind: 10, correlation: 0.73 },
  { month: 'Juin', pm25: 45, temp: 30, wind: 8, correlation: 0.73 },
  { month: 'Juil', pm25: 35, temp: 27, wind: 6, correlation: 0.73 },
  { month: 'Août', pm25: 30, temp: 26, wind: 7, correlation: 0.73 },
  { month: 'Sep', pm25: 40, temp: 28, wind: 5, correlation: 0.73 },
  { month: 'Oct', pm25: 55, temp: 30, wind: 6, correlation: 0.73 },
  { month: 'Nov', pm25: 70, temp: 28, wind: 10, correlation: 0.73 },
  { month: 'Déc', pm25: 85, temp: 25, wind: 12, correlation: 0.73 },
];

// Données scatter pour PM2.5 vs Wind
const scatterData = correlationData.map((d) => ({
  wind: d.wind,
  pm25: d.pm25,
}));

// Données annuelles par année (2020-2025)
const yearlyData = {
  2020: [
    { month: 'Jan', temp: 22 },
    { month: 'Fév', temp: 24 },
    { month: 'Mar', temp: 27 },
    { month: 'Avr', temp: 31 },
    { month: 'Mai', temp: 30 },
    { month: 'Juin', temp: 28 },
    { month: 'Juil', temp: 26 },
    { month: 'Août', temp: 25 },
    { month: 'Sep', temp: 26 },
    { month: 'Oct', temp: 28 },
    { month: 'Nov', temp: 26 },
    { month: 'Déc', temp: 23 },
  ],
  2021: [
    { month: 'Jan', temp: 23 },
    { month: 'Fév', temp: 25 },
    { month: 'Mar', temp: 28 },
    { month: 'Avr', temp: 32 },
    { month: 'Mai', temp: 31 },
    { month: 'Juin', temp: 29 },
    { month: 'Juil', temp: 27 },
    { month: 'Août', temp: 26 },
    { month: 'Sep', temp: 27 },
    { month: 'Oct', temp: 29 },
    { month: 'Nov', temp: 26 },
    { month: 'Déc', temp: 24 },
  ],
  2022: [
    { month: 'Jan', temp: 23 },
    { month: 'Fév', temp: 24 },
    { month: 'Mar', temp: 28 },
    { month: 'Avr', temp: 32 },
    { month: 'Mai', temp: 31 },
    { month: 'Juin', temp: 29 },
    { month: 'Juil', temp: 27 },
    { month: 'Août', temp: 26 },
    { month: 'Sep', temp: 27 },
    { month: 'Oct', temp: 29 },
    { month: 'Nov', temp: 27 },
    { month: 'Déc', temp: 24 },
  ],
  2023: [
    { month: 'Jan', temp: 23 },
    { month: 'Fév', temp: 25 },
    { month: 'Mar', temp: 29 },
    { month: 'Avr', temp: 33 },
    { month: 'Mai', temp: 32 },
    { month: 'Juin', temp: 29 },
    { month: 'Juil', temp: 28 },
    { month: 'Août', temp: 26 },
    { month: 'Sep', temp: 27 },
    { month: 'Oct', temp: 29 },
    { month: 'Nov', temp: 26 },
    { month: 'Déc', temp: 23 },
  ],
  2024: [
    { month: 'Jan', temp: 22 },
    { month: 'Fév', temp: 25 },
    { month: 'Mar', temp: 28 },
    { month: 'Avr', temp: 33 },
    { month: 'Mai', temp: 32 },
    { month: 'Juin', temp: 29 },
    { month: 'Juil', temp: 28 },
    { month: 'Août', temp: 26 },
    { month: 'Sep', temp: 27 },
    { month: 'Oct', temp: 29 },
    { month: 'Nov', temp: 26 },
    { month: 'Déc', temp: 23 },
  ],
  2025: [
    { month: 'Jan', temp: 24 },
    { month: 'Fév', temp: 26 },
    { month: 'Mar', temp: 31 },
    { month: 'Avr', temp: 35 },
    { month: 'Mai', temp: 33 },
    { month: 'Juin', temp: 30 },
    { month: 'Juil', temp: 27 },
    { month: 'Août', temp: 26 },
    { month: 'Sep', temp: 28 },
    { month: 'Oct', temp: 30 },
    { month: 'Nov', temp: 28 },
    { month: 'Déc', temp: 25 },
  ],
};

// Données heatmap (365 jours)
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
  const [selectedYear, setSelectedYear] = useState('2025');
  const [compareYear, setCompareYear] = useState('2024');
  const [showComparison, setShowComparison] = useState(false);

  const currentYearData = yearlyData[selectedYear];
  const compareYearData = yearlyData[compareYear];

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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-gray-600">Année:</label>
              <select
                className="bg-white border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-bold text-[#0A2342] outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {['2020', '2021', '2022', '2023', '2024', '2025'].map((y) => (
                  <option key={y}>{y}</option>
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
              <span className="text-sm font-bold text-gray-600">Comparer avec {compareYear}</span>
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
