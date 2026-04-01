import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';
import { TrendingUp, CloudRain, Wind, Thermometer, Activity, MapPin } from 'lucide-react';

// Import des données réelles
import monthlyData from '../data/monthly.json';
import citiesData from '../data/cities.json';

const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

// Années disponibles
const availableYears = [...new Set(monthlyData.map(d => d.year))].sort();

// Annotations saisonnières
const seasonAnnotations = {
  1: '', 2: 'Harmattan', 3: 'Pic harmattan', 4: '', 5: '',
  6: 'Saison des pluies', 7: '', 8: '', 9: '', 10: '', 11: 'Saison sèche', 12: ''
};

// Fonction pour générer les données de comparaison pour une année
const getComparisonData = (year, city = null) => {
  let yearData;
  if (city) {
    yearData = monthlyData.filter(d => d.year === year && d.city === city);
  } else {
    yearData = monthlyData.filter(d => d.year === year);
  }
  
  return monthNames.map((month, idx) => {
    const monthData = yearData.filter(d => d.month === idx + 1);
    const avgTemp = monthData.reduce((sum, d) => sum + (d.tempMax || 0), 0) / monthData.length || 0;
    const avgWind = monthData.reduce((sum, d) => sum + (d.windSpeed || 0), 0) / monthData.length || 0;
    const avgPrecip = monthData.reduce((sum, d) => sum + (d.precipitation || 0), 0) / monthData.length || 0;
    const avgPm25 = monthData.reduce((sum, d) => sum + (d.pm25 || 0), 0) / monthData.length || 0;
    
    return {
      month,
      temp: Math.round(avgTemp * 10) / 10,
      wind: Math.round(avgWind * 10) / 10,
      precip: Math.round(avgPrecip * 10) / 10,
      pm25: Math.round(avgPm25),
      annotation: seasonAnnotations[idx + 1] || '',
    };
  });
};

// Données fallback
const comparisonData2024 = [
  {
    month: 'Jan',
    temp: 22,
    wind: 14,
    precip: 8,
    pm25: 85,
    annotation: '',
  },
  {
    month: 'Fév',
    temp: 25,
    wind: 17,
    precip: 12,
    pm25: 105,
    annotation: 'Harmattan',
  },
  {
    month: 'Mar',
    temp: 28,
    wind: 24,
    precip: 2,
    pm25: 135,
    annotation: 'Pic harmattan',
  },
  {
    month: 'Avr',
    temp: 33,
    wind: 11,
    precip: 48,
    pm25: 82,
    annotation: '',
  },
  {
    month: 'Mai',
    temp: 32,
    wind: 9,
    precip: 85,
    pm25: 58,
    annotation: '',
  },
  {
    month: 'Juin',
    temp: 29,
    wind: 7,
    precip: 155,
    pm25: 43,
    annotation: 'Saison des pluies',
  },
  {
    month: 'Juil',
    temp: 28,
    wind: 5,
    precip: 205,
    pm25: 33,
    annotation: '',
  },
  {
    month: 'Août',
    temp: 26,
    wind: 6,
    precip: 255,
    pm25: 28,
    annotation: '',
  },
  {
    month: 'Sep',
    temp: 27,
    wind: 4,
    precip: 185,
    pm25: 38,
    annotation: '',
  },
  {
    month: 'Oct',
    temp: 29,
    wind: 5,
    precip: 95,
    pm25: 52,
    annotation: '',
  },
  {
    month: 'Nov',
    temp: 26,
    wind: 9,
    precip: 25,
    pm25: 68,
    annotation: 'Saison sèche',
  },
  {
    month: 'Déc',
    temp: 23,
    wind: 11,
    precip: 8,
    pm25: 82,
    annotation: '',
  },
];

const comparisonData2025 = [
  {
    month: 'Jan',
    temp: 24,
    wind: 15,
    precip: 5,
    pm25: 90,
    annotation: '',
  },
  {
    month: 'Fév',
    temp: 26,
    wind: 18,
    precip: 10,
    pm25: 110,
    annotation: 'Harmattan',
  },
  {
    month: 'Mar',
    temp: 31,
    wind: 25,
    precip: 0,
    pm25: 140,
    annotation: 'Pic harmattan',
  },
  {
    month: 'Avr',
    temp: 35,
    wind: 12,
    precip: 45,
    pm25: 85,
    annotation: '',
  },
  {
    month: 'Mai',
    temp: 33,
    wind: 10,
    precip: 80,
    pm25: 60,
    annotation: '',
  },
  {
    month: 'Juin',
    temp: 30,
    wind: 8,
    precip: 150,
    pm25: 45,
    annotation: 'Saison des pluies',
  },
  {
    month: 'Juil',
    temp: 27,
    wind: 6,
    precip: 200,
    pm25: 35,
    annotation: '',
  },
  {
    month: 'Août',
    temp: 26,
    wind: 7,
    precip: 250,
    pm25: 30,
    annotation: '',
  },
  {
    month: 'Sep',
    temp: 28,
    wind: 5,
    precip: 180,
    pm25: 40,
    annotation: '',
  },
  {
    month: 'Oct',
    temp: 30,
    wind: 6,
    precip: 90,
    pm25: 55,
    annotation: '',
  },
  {
    month: 'Nov',
    temp: 28,
    wind: 10,
    precip: 20,
    pm25: 70,
    annotation: 'Saison sèche',
  },
  {
    month: 'Déc',
    temp: 25,
    wind: 12,
    precip: 5,
    pm25: 85,
    annotation: '',
  },
];

const yearData = {
  2024: comparisonData2024,
  2025: comparisonData2025,
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload.annotation) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#F97316" stroke="white" strokeWidth={2} />
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          fill="#F97316"
          fontSize="10"
          fontWeight="700"
        >
          {payload.annotation}
        </text>
      </g>
    );
  }
  return null;
};

const Comparaison = () => {
  const [year1, setYear1] = useState(2024);
  const [year2, setYear2] = useState(2025);
  const [selectedCity, setSelectedCity] = useState('');

  // Obtenir les données de comparaison basées sur les sélections
  const data1 = useMemo(() => getComparisonData(year1, selectedCity || null), [year1, selectedCity]);
  const data2 = useMemo(() => getComparisonData(year2, selectedCity || null), [year2, selectedCity]);

  return (
    <div className="w-full px-6 py-8 space-y-12">
      <div>
        <h2 className="text-3xl font-black text-[#0A2342] flex flex-col gap-1">
          <span>Comparaison Climat vs Qualité de l'Air</span>
          <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Analyse comparative des facteurs climatiques et de la qualité de l'air sur plusieurs années
        </p>
      </div>

      {/* Year Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-6 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        {/* Sélecteur de ville */}
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-teal-600" />
          <select
            className="bg-white border-2 border-gray-200 rounded-full px-5 py-2 text-sm font-bold text-[#0A2342] outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Moyenne nationale</option>
            {citiesData.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-600">Année 1:</label>
          <select
            className="bg-white border-2 border-teal-500 rounded-full px-5 py-2 text-sm font-bold text-[#0A2342] outline-none focus:ring-2 focus:ring-teal-400/50 cursor-pointer"
            value={year1}
            onChange={(e) => setYear1(Number(e.target.value))}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <span className="text-2xl font-black text-gray-300">VS</span>

        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-600">Année 2:</label>
          <select
            className="bg-white border-2 border-orange-500 rounded-full px-5 py-2 text-sm font-bold text-[#0A2342] outline-none focus:ring-2 focus:ring-orange-400/50 cursor-pointer"
            value={year2}
            onChange={(e) => setYear2(Number(e.target.value))}
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CHART 1: Temperature Comparison */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Thermometer className="text-orange-500" size={24} strokeWidth={2.5} />
            <h3 className="text-xl font-black text-[#0A2342]">Évolution de la Température</h3>
          </div>
          <p className="text-xs text-gray-500">
            Comparaison des températures mensuelles moyennes entre {year1} et {year2}
          </p>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                type="category"
                allowDuplicatedCategory={false}
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
                data={data1}
                type="monotone"
                dataKey="temp"
                stroke="#0D7377"
                strokeWidth={3}
                dot={{ r: 5, fill: 'white', stroke: '#0D7377', strokeWidth: 2 }}
                name={`Température ${year1}`}
              />
              <Line
                data={data2}
                type="monotone"
                dataKey="temp"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ r: 5, fill: 'white', stroke: '#F97316', strokeWidth: 2 }}
                name={`Température ${year2}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Air Quality (PM2.5) with Annotations */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-purple-500" size={24} strokeWidth={2.5} />
            <h3 className="text-xl font-black text-[#0A2342]">
              Qualité de l'Air (PM2.5) avec Annotations
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Évolution de la pollution avec marquage des événements climatiques majeurs
          </p>
        </div>

        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                type="category"
                allowDuplicatedCategory={false}
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
                  value: 'PM2.5 (μg/m³)',
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
                formatter={(value) => [`${value} μg/m³`]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '12px', fontWeight: 700 }}
              />
              <Line
                data={data1}
                type="monotone"
                dataKey="pm25"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={<CustomDot />}
                name={`PM2.5 ${year1}`}
              />
              <Line
                data={data2}
                type="monotone"
                dataKey="pm25"
                stroke="#EC4899"
                strokeWidth={3}
                dot={<CustomDot />}
                name={`PM2.5 ${year2}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 3: Side by Side - Wind & Precipitation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wind */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Wind className="text-teal-500" size={24} strokeWidth={2.5} />
              <h3 className="text-lg font-black text-[#0A2342]">Vitesse du Vent</h3>
            </div>
            <p className="text-xs text-gray-500">
              Comparaison mensuelle des vitesses de vent (km/h)
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  type="category"
                  allowDuplicatedCategory={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }}
                  label={{
                    value: 'Vent (km/h)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fontWeight: 700 },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [`${value} km/h`]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                <Line
                  data={data1}
                  type="monotone"
                  dataKey="wind"
                  stroke="#0D7377"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name={year1}
                />
                <Line
                  data={data2}
                  type="monotone"
                  dataKey="wind"
                  stroke="#14B8A6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name={year2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precipitation */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CloudRain className="text-blue-500" size={24} strokeWidth={2.5} />
              <h3 className="text-lg font-black text-[#0A2342]">Précipitations</h3>
            </div>
            <p className="text-xs text-gray-500">
              Comparaison mensuelle des précipitations (mm)
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  type="category"
                  allowDuplicatedCategory={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#94A3B8' }}
                  label={{
                    value: 'Précipitations (mm)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fontWeight: 700 },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [`${value} mm`]}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                <Line
                  data={data1}
                  type="monotone"
                  dataKey="precip"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name={year1}
                />
                <Line
                  data={data2}
                  type="monotone"
                  dataKey="precip"
                  stroke="#60A5FA"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name={year2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <TrendingUp className="text-orange-700" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-lg font-black text-[#0A2342] mb-2">Observations Clés</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>
                  <strong>Harmattan (Fév-Mar):</strong> Pic de pollution PM2.5 corrélé avec vents forts du Sahara
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>
                  <strong>Saison des pluies (Juin-Août):</strong> Amélioration significative de la qualité de l'air
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>
                  <strong>Saison sèche (Nov-Déc):</strong> Remontée progressive de la pollution atmosphérique
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparaison;
