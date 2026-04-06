import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import { LineChart, Line, Area, BarChart, Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { MapPin, Wind, Thermometer, CloudRain, Sun, Activity, Calendar, AlertTriangle, Sprout, Compass } from 'lucide-react';

const ClimateExplorer = () => {
  // --- ÉTATS SÉLECTEURS ---
  const [selectedVille, setSelectedVille] = useState('Maroua');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('All months');
  const [selectedDay, setSelectedDay] = useState('15');
  
  // --- ÉTATS COMPARAISON ---
  const [compareMetric, setCompareMetric] = useState('Temperature');
  const [compareYear, setCompareYear] = useState('2024');

  // --- MOCK DATA (Dataset Officiel 2020-2025) ---
  const villesCameroun = ['Yaoundé', 'Maroua', 'Garoua', 'Ngaoundéré', 'Douala', 'Bafoussam', 'Bamenda', 'Bertoua', 'Ebolowa', 'Buea'];
  
  const mapData = [
    { name: 'Yaoundé', pos: [3.86, 11.52], tempMax: 28, pm25: 45, aqi: 110 },
    { name: 'Maroua', pos: [10.59, 14.32], tempMax: 38, pm25: 120, aqi: 185 },
    { name: 'Garoua', pos: [9.30, 13.39], tempMax: 36, pm25: 85, aqi: 155 },
    { name: 'Douala', pos: [4.05, 9.70], tempMax: 31, pm25: 65, aqi: 130 },
    { name: 'Ngaoundéré', pos: [7.32, 13.58], tempMax: 30, pm25: 25, aqi: 60 },
  ];

  const metricsDuJour = { 
    aqi: 185, pm25: 120, status: 'Critique',
    tempMax: 38.5, apparentMax: 41.2, 
    tempMin: 24.2, apparentMin: 25.0,
    precip: 0.0, precipHours: 0,
    soleil: 11.2, radiation: 22.5,
    windSpeed: 18, windGusts: 45, windDir: 'NE (45°)',
    et0: 6.8 
  };

  const monthlyData = [
    { month: 'Jan', temp2025: 24, temp2024: 22, precip: 5, wind: 15, pm25: 90, et0: 4.2 },
    { month: 'Feb', temp2025: 26, temp2024: 25, precip: 10, wind: 18, pm25: 110, et0: 4.8 },
    { month: 'Mar', temp2025: 31, temp2024: 28, precip: 0, wind: 25, pm25: 140, et0: 6.5 }, 
    { month: 'Apr', temp2025: 35, temp2024: 33, precip: 45, wind: 12, pm25: 85, et0: 7.1 },
    { month: 'May', temp2025: 33, temp2024: 32, precip: 80, wind: 10, pm25: 60, et0: 5.5 },
    { month: 'Jun', temp2025: 30, temp2024: 29, precip: 150, wind: 8, pm25: 45, et0: 4.0 },
    { month: 'Jul', temp2025: 27, temp2024: 28, precip: 200, wind: 6, pm25: 35, et0: 3.2 },
    { month: 'Aug', temp2025: 26, temp2024: 26, precip: 250, wind: 7, pm25: 30, et0: 3.0 },
    { month: 'Sep', temp2025: 28, temp2024: 27, precip: 180, wind: 5, pm25: 40, et0: 3.8 },
    { month: 'Oct', temp2025: 30, temp2024: 29, precip: 90, wind: 6, pm25: 55, et0: 4.5 },
    { month: 'Nov', temp2025: 28, temp2024: 26, precip: 20, wind: 10, pm25: 70, et0: 4.8 },
    { month: 'Dec', temp2025: 25, temp2024: 23, precip: 5, wind: 12, pm25: 85, et0: 4.1 },
  ];

  const getAQIColor = (aqi) => {
    if (aqi >= 150) return '#DC2626'; 
    if (aqi >= 100) return '#F97316'; 
    if (aqi >= 50) return '#EAB308'; 
    return '#14A44D'; 
  };

  const getTempColor = (temp) => {
    if (temp >= 35) return '#EF4444'; // Hot
    if (temp >= 28) return '#F59E0B'; // Warm
    if (temp >= 20) return '#3B82F6'; // Cool
    return '#60A5FA'; // Cold
  };

  const heatmapDays = Array.from({ length: 365 }, (_, i) => ({ id: i, value: Math.random() * 100 }));
  const getHeatmapColor = (val) => {
    if (val > 80) return 'bg-red-500';
    if (val > 60) return 'bg-orange-400';
    if (val > 40) return 'bg-yellow-300';
    if (val > 20) return 'bg-blue-300';
    return 'bg-blue-100';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-inter animate-fade-in">

      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-12 flex-1">
        {/* --- FILTRES CLIMAT --- */}
        <section className="bg-gradient-to-r from-[#0A2342] to-[#0D7377] rounded-2xl p-4 md:p-5 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-white text-lg md:text-2xl font-black tracking-tight">Explorateur Climat</h1>
            <div className="flex flex-wrap items-center gap-3">
              <select className="bg-white/95 backdrop-blur-sm border-none rounded-full px-5 py-2 text-sm font-bold text-[#0A2342] shadow-md outline-none focus:ring-2 focus:ring-teal-400/50 appearance-none cursor-pointer" value={selectedVille} onChange={(e) => setSelectedVille(e.target.value)}>
                {villesCameroun.map(v => <option key={v}>{v}</option>)}
              </select>
              <select className="bg-white/95 backdrop-blur-sm border-none rounded-full px-5 py-2 text-sm font-bold text-[#0A2342] shadow-md outline-none focus:ring-2 focus:ring-teal-400/50 appearance-none cursor-pointer" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {['2020','2021','2022','2023','2024','2025'].map(y => <option key={y}>{y}</option>)}
              </select>
              <select className="bg-white/95 backdrop-blur-sm border-none rounded-full px-5 py-2 text-sm font-bold text-[#0A2342] shadow-md outline-none focus:ring-2 focus:ring-teal-400/50 appearance-none cursor-pointer" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option>All months</option><option>01</option><option>02</option>
              </select>
              <select className="bg-white/95 backdrop-blur-sm border-none rounded-full px-5 py-2 text-sm font-bold text-[#0A2342] shadow-md outline-none focus:ring-2 focus:ring-teal-400/50 appearance-none cursor-pointer" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                {Array.from({ length: 31 }, (_, i) => {
                  const day = String(i + 1).padStart(2, '0');
                  return <option key={day}>{day}</option>;
                })}
              </select>
            </div>
          </div>
        </section>
        
        {/* === SECTION 1 : CONDITIONS ACTUELLES (Hero Layout 40/60) === */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-[#0A2342] flex flex-col gap-1">
            <span>Conditions en Temps Réel</span>
            <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT COLUMN (40%) - Featured Card */}
            <div className="lg:w-[40%] bg-[#0A2342] rounded-[32px] p-10 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Thermometer size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-teal-400 font-black uppercase tracking-[0.2em] text-xs mb-6">Panneau Principal</p>
                <div className="space-y-8">
                  <div>
                    <p className="text-white/60 text-sm font-bold mb-2">Température Max</p>
                    <h2 className="text-7xl font-black text-orange-500 tracking-tighter leading-none">{metricsDuJour.tempMax}°<span className="text-3xl text-orange-400/50">C</span></h2>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm font-bold mb-1">Température Min</p>
                    <h2 className="text-4xl font-black text-blue-400 tracking-tight">{metricsDuJour.tempMin}°<span className="text-xl">C</span></h2>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Stress Thermique</p>
                  <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full border border-teal-500/30 font-bold text-sm">
                    <Activity size={16} /> +{(metricsDuJour.apparentMax - metricsDuJour.tempMax).toFixed(1)}°C Ressenti
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Lieu Actuel</p>
                  <p className="font-bold text-lg">{selectedVille}</p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (60%) - 2x2 Grid */}
            <div className="lg:w-[60%] grid grid-cols-2 gap-6">
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between card-hover-effect border-l-4 border-teal-500">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 text-teal-600">
                    <Wind size={20} /> <span className="text-xs font-black uppercase tracking-widest">Vent</span>
                  </div>
                  <div className="h-8 w-16 opacity-30">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData.slice(-6)}>
                        <Line type="monotone" dataKey="wind" stroke="#0D7377" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#0A2342] mt-4">{metricsDuJour.windSpeed} <span className="text-sm font-bold text-gray-400">km/h</span></p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Rafales: {metricsDuJour.windGusts}km/h</p>
                </div>
              </div>

              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between card-hover-effect border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 text-blue-600">
                    <CloudRain size={20} /> <span className="text-xs font-black uppercase tracking-widest">Pluie</span>
                  </div>
                  <div className="h-8 w-16 opacity-30">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData.slice(-6)}>
                        <Line type="monotone" dataKey="precip" stroke="#3B82F6" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#0A2342] mt-4">{metricsDuJour.precip} <span className="text-sm font-bold text-gray-400">mm</span></p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Saison: {metricsDuJour.precipHours}h de pluie</p>
                </div>
              </div>

              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between card-hover-effect border-l-4 border-yellow-500">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 text-yellow-600">
                    <Sun size={20} /> <span className="text-xs font-black uppercase tracking-widest">Radiation</span>
                  </div>
                  <div className="h-8 w-16 opacity-30">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData.slice(-6)}>
                        <Line type="monotone" dataKey="radiation" stroke="#EAB308" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#0A2342] mt-4">{metricsDuJour.radiation} <span className="text-sm font-bold text-gray-400">MJ</span></p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Ensoleillement: {metricsDuJour.soleil}h</p>
                </div>
              </div>

              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex flex-col justify-between card-hover-effect border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 text-green-600">
                    <Sprout size={20} /> <span className="text-xs font-black uppercase tracking-widest">Agricole</span>
                  </div>
                  <div className="h-8 w-16 opacity-30">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData.slice(-6)}>
                        <Line type="monotone" dataKey="et0" stroke="#22C55E" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black text-[#0A2342] mt-4">{metricsDuJour.et0} <span className="text-sm font-bold text-gray-400">mm</span></p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Evapotranspiration ETo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === SECTION 2 : CARTE & HEATMAP === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-md flex flex-col">
            <h3 className="text-sm font-black mb-1 flex flex-col gap-1 uppercase tracking-widest text-[#0A2342]">
              <div className="flex items-center gap-2"><MapPin size={20} className="text-[#0D7377]" /> Vue Géo-Climatique</div>
              <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
            </h3>
            <div className="flex-1 min-h-[400px] mt-4 rounded-2xl overflow-hidden relative border border-gray-100 shadow-inner">
              <MapContainer center={[7.36, 12.35]} zoom={5.5} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
                {mapData.map((v, i) => (
                  <CircleMarker 
                    key={i} 
                    center={v.pos} 
                    radius={12} 
                    pathOptions={{ 
                      fillColor: getTempColor(v.tempMax), 
                      color: v.name === selectedVille ? '#10B981' : 'white', 
                      weight: v.name === selectedVille ? 3 : 1, 
                      fillOpacity: 0.8 
                    }}
                  >
                    <LeafletTooltip direction="top" opacity={1} className="rounded-lg shadow-xl border-none p-0 overflow-hidden">
                      <div className="bg-[#0A2342] text-white p-2 text-xs">
                        <div className="font-black uppercase mb-1">{v.name}</div>
                        <div className="flex gap-3">
                          <span>Temp Max: <span className="font-bold text-orange-400">{v.tempMax}°C</span></span>
                        </div>
                      </div>
                    </LeafletTooltip>
                  </CircleMarker>
                ))}
              </MapContainer>
              
              {/* Légende Carte Overlay */}
              <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50">
                <p className="text-[10px] font-black uppercase text-[#0A2342] mb-2 tracking-tighter">Échelle Température</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-[9px] font-bold">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div> <span>+35°C (Chaud)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div> <span>28-34°C (Modéré)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-bold">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div> <span>20-27°C (Frais)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
            <h3 className="text-sm font-black mb-8 flex flex-col gap-1 uppercase tracking-widest text-[#0A2342]">
              <div className="flex items-center gap-2"><Calendar size={20} className="text-[#0D7377]" /> Intensité Thermique Annuelle</div>
              <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
            </h3>
            
            <div className="flex justify-between mb-4 px-2">
              {['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'].map(m => (
                <span key={m} className="text-[10px] font-black text-gray-400 uppercase w-8 text-center">{m}</span>
              ))}
            </div>
            
            <div className="w-full overflow-x-auto pb-6">
              <div className="flex flex-col flex-wrap h-[160px] w-max gap-1.5">
                {heatmapDays.map(day => (
                  <div 
                    key={day.id} 
                    className={`w-3.5 h-3.5 rounded-[3px] ${getHeatmapColor(day.value)} hover:ring-2 ring-teal-500 transition-all cursor-pointer relative group`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                      <div className="bg-[#0A2342] text-white text-[10px] p-2 rounded shadow-xl whitespace-nowrap">
                        <p className="font-bold">Jour {day.id + 1}</p>
                        <p>Temp: {(day.value / 2 + 15).toFixed(1)}°C</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Légende Heatmap */}
            <div className="mt-4 pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Froid</span>
                <div className="h-2.5 w-48 rounded-full bg-gradient-to-r from-blue-100 via-blue-300 via-yellow-300 via-orange-400 to-red-500 shadow-inner"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Chaud</span>
              </div>
              <p className="text-[10px] font-medium text-gray-400 italic">* Basé sur les relevés journaliers {selectedYear}</p>
            </div>
          </div>
        </div>

        {/* === SECTION 3 : ANALYSE IA CORRÉLATION === */}
        <div className="space-y-6 pt-4 border-t border-gray-100">
          <h2 className="text-2xl font-black text-[#0A2342] flex flex-col gap-1">
            <span>Evolution Annuelle & Corrélations</span>
            <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-md">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748B'}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748B'}} tickFormatter={(val) => `${val}µg`} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#F97316'}} tickFormatter={(val) => `${val}°C`} />
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}} 
                    itemStyle={{fontWeight: 700, fontSize: '12px'}}
                    cursor={{stroke: '#E2E8F0', strokeWidth: 2}}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingTop: '0px', fontSize: '12px', fontWeight: 700, color: '#0A2342' }} />
                  <Bar yAxisId="left" name="Pollution PM2.5" dataKey="pm25" fill="#94A3B8" radius={[6, 6, 0, 0]} animationDuration={1500} />
                  <Area yAxisId="right" type="monotone" dataKey="temp2025" fill="url(#colorTemp)" stroke="none" />
                  <Line 
                    yAxisId="right" 
                    name="Température Moyenne" 
                    type="monotone" 
                    dataKey="temp2025" 
                    stroke="#F97316" 
                    strokeWidth={4} 
                    dot={{r: 6, fill: "#F97316", strokeWidth: 2, stroke: "white"}} 
                    activeDot={{r: 8, strokeWidth: 0}}
                    animationDuration={2000}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* === SECTION 4 : ANALYSE COMPARATIVE === */}
        <div className="space-y-8 pt-4 border-t border-gray-100">
          <h2 className="text-2xl font-black text-[#0A2342] flex flex-col gap-1">
            <span>Analyses Comparatives Mensuelles</span>
            <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-md">
            <div className="flex flex-wrap items-center justify-between mb-10 gap-4">
              <h3 className="text-lg font-black text-[#0A2342] uppercase tracking-wider">Evolution Mensuelle</h3>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-full border border-gray-100 shadow-inner">
                <select className="bg-white px-4 py-1.5 rounded-full text-xs font-bold text-[#0A2342] shadow-sm outline-none cursor-pointer hover:bg-gray-100 transition-colors" value={compareMetric} onChange={(e) => setCompareMetric(e.target.value)}>
                  <option>Temperature</option><option>Precipitation</option><option>ET0</option>
                </select>
                <span className="text-[10px] font-black text-gray-400 px-1 uppercase tracking-tighter">vs</span>
                <select className="bg-white px-4 py-1.5 rounded-full text-xs font-bold text-[#0D7377] shadow-sm outline-none cursor-pointer hover:bg-gray-100 transition-colors" value={compareYear} onChange={(e) => setCompareYear(e.target.value)}>
                  <option>2024</option><option>2023</option>
                </select>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={8} barSize={24}>
                  <defs>
                    <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0D7377" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#0D7377" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#F97316" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#64748B'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#64748B'}} />
                  <RechartsTooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="top" height={36} iconType="rect" wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                  <Bar name={selectedYear} dataKey="temp2025" fill="url(#barGradient1)" radius={[6, 6, 0, 0]} animationDuration={1000} />
                  <Bar name={compareYear} dataKey="temp2024" fill="url(#barGradient2)" radius={[6, 6, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-md">
              <h3 className="text-base font-black text-[#0A2342] mb-1 flex flex-col gap-1 uppercase tracking-widest">
                <div className="flex items-center gap-2"><CloudRain className="text-blue-500" size={18} /> Précipitations</div>
                <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
              </h3>
              <div className="h-[220px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#94A3B8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94A3B8'}} />
                    <Line type="monotone" dataKey="precip" stroke="#3B82F6" strokeWidth={4} dot={{r: 5, fill: "white", stroke: "#3B82F6", strokeWidth: 3}} animationDuration={2500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-md">
              <h3 className="text-base font-black text-[#0A2342] mb-1 flex flex-col gap-1 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Wind className="text-teal-500" size={18} /> Vitesse du Vent</div>
                <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
              </h3>
              <div className="h-[220px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 700, fill: '#94A3B8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94A3B8'}} />
                    <Line type="monotone" dataKey="wind" stroke="#0D7377" strokeWidth={4} dot={{r: 5, fill: "white", stroke: "#0D7377", strokeWidth: 3}} animationDuration={2500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default ClimateExplorer;
