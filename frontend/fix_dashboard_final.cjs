const fs = require('fs');
let code = fs.readFileSync('C:\\\\Users\\\\momok\\\\Desktop\\\\airwatch-cameroun\\\\frontend\\\\src\\\\pages\\\\Dashboard.jsx.bak', 'utf8');

// Find exactly the return block of Dashboard
const dashboardStart = code.lastIndexOf('const Dashboard = () => {');
if (dashboardStart === -1) throw new Error("Could not find Dashboard");

// Find the first 'return (' AFTER the Dashboard definition
const returnStartMatch = code.indexOf('return (', dashboardStart);

if (returnStartMatch === -1) throw new Error("Could not find return match!");

// Split the file precisely BEFORE the 'return ('
const prefix = code.substring(0, returnStartMatch);

const cleanJSX = \`return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 border-b border-white border-opacity-10 text-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-900 p-2 rounded-lg">
              <Wind size={20} className="font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AirWatch Cameroun</h1>
              <p className="text-slate-400 text-xs">Prévision de l'air ambiant & système d'alerte precoce</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className={\`flex items-center gap-1 text-sm font-medium transition-colors p-2 rounded-full \${isMuted ? 'bg-slate-800 text-slate-400' : 'bg-red-500 text-white animate-pulse'}\`}
            >
              <Volume2 size={16} />
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Alerte Active'}</span>
            </button>
            
            {/* National indicator summary */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
               <Activity size={12} className="text-amber-500" />
               <span className="text-xs text-slate-300">AQI Moy. National:</span>
               <span className="text-sm font-bold text-white">42</span>
            </div>
          </div>
        </div>
      </header>

      {showAlertBanner && (
        <div className="bg-red-600 text-white py-3 px-4 shadow-sm animate-pulse flex items-center justify-between transition-all">
          <p className="flex items-center max-w-7xl mx-auto w-full text-sm font-bold gap-3">
            <AlertTriangle className="text-white" />
            <span>ALERTE ROUGE: Conditions dangereuses détectées dans {alertCities.length} ville(s). Veuillez consulter les recommandations de santé ci-dessous.</span>
          </p>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div
            className="rounded-3xl p-6 md:p-8 mb-2 border transition-all duration-300 ease-in-out shadow-sm"
            style={{
              backgroundColor: \`\${getAQIColor(aqi)}12\`,
              borderColor: \`\${getAQIColor(aqi)}40\`
            }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-sm"
                    style={{ backgroundColor: getAQIColor(aqi) }}
                  >
                    {aqiLevel.label}
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-60 rounded-full border border-white border-opacity-40">
                    <Activity size={12} className="text-teal-600" />
                    <span className="text-teal-700 text-xs font-semibold">Prédit par IA</span>
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 truncate">
                  {selectedCity.name}
                </h2>
                <div className="text-gray-600 flex items-center gap-2 text-sm font-medium mb-6">
                  <MapPin size={16} /> <span>{selectedCity.region}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">Mise à jour: {selectedCity.lastUpdate}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'PM2.5', value: \`\${cityData.pm25 || '–'}\`, unit: 'µg/m³', color: '#7C3AED' },
                    { label: 'PM10', value: \`\${cityData.pm10 || '–'}\`, unit: 'µg/m³', color: '#2563EB' },
                    { label: 'Poussière', value: \`\${cityData.dust || '–'}\`, unit: 'µg/m³', color: '#D97706' },
                    { label: 'Vent', value: \`\${cityData.windSpeed || '–'}\`, unit: 'km/h', color: '#0D7377' }
                  ].map(metric => (
                    <div key={metric.label} className="bg-white bg-opacity-70 rounded-2xl p-4 shadow-sm border border-white border-opacity-60 backdrop-blur-sm">
                      <p className="text-xs text-gray-500 mb-1 font-medium">{metric.label}</p>
                      <p className="text-2xl font-black" style={{ color: metric.color }}>{metric.value}</p>
                      <p className="text-xs text-gray-400 font-medium">{metric.unit}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-white bg-opacity-60 rounded-3xl border border-white border-opacity-60 backdrop-blur-sm shadow-sm md:w-56 w-full">
                 <AQIGauge aqi={aqi} color={getAQIColor(aqi)} />
                 <p className="text-gray-500 mt-2 text-sm font-medium">Indice Qualité de l'Air</p>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
               {/* 24h Forecast Strip */}
               <div className="bg-white bg-opacity-60 p-4 rounded-2xl shadow-sm border border-white">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> Prévisions à 48h</h4>
                  <div className="flex justify-between items-center gap-2">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-1">Aujourd'hui</p>
                      <span className="w-10 h-10 mx-auto rounded-full text-white font-bold text-sm flex items-center justify-center shadow-sm" style={{backgroundColor: getAQIColor(aqi)}}>{aqi}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-1">Demain</p>
                      <span className="w-10 h-10 mx-auto rounded-full text-white font-bold text-sm flex items-center justify-center shadow-sm" style={{backgroundColor: getAQIColor(forecastTomorrow)}}>{forecastTomorrow}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-1">+2 Jours</p>
                      <span className="w-10 h-10 mx-auto rounded-full text-white font-bold text-sm flex items-center justify-center shadow-sm" style={{backgroundColor: getAQIColor(forecastAfter)}}>{forecastAfter}</span>
                    </div>
                  </div>
               </div>

               {/* Health Advisories & Patterns */}
               <div className="bg-white bg-opacity-60 p-4 rounded-2xl shadow-sm border border-white flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Shield size={14} className="text-gray-400"/> Recommandations</h4>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-xl" style={{ backgroundColor: \`\${pattern.color}15\` }}>
                       <pattern.icon size={18} style={{ color: pattern.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: pattern.color }}>{pattern.label}</p>
                      <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">{pattern.advice}</p>
                    </div>
                  </div>
               </div>
            </div>
            
            {firms.hasFireNearby && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 flex items-start gap-3 shadow-sm">
                 <div className="bg-red-500 p-2 rounded-xl">
                   <Flame size={16} className="text-white" />
                 </div>
                 <div>
                   <p className="text-sm font-bold text-red-800">Alert NASA FIRMS : Détection Active</p>
                   <p className="text-xs text-red-600 font-medium mt-1">
                     {firms.fireCount50km} feu(x) confirmés à de 50km (Intensité radiative: {firms.maxFRP} MW). 
                     Possibilité de fumée rabattue par le vent.
                   </p>
                 </div>
              </div>
            )}
          </div>

          <div className="p-4 border-b flex items-center justify-between">
             <h2 className="font-bold text-gray-800 flex items-center gap-2">
               <MapPin size={20} className="text-teal-600" />
               Carte interactive AQI — {citiesData.length} villes étudiées
             </h2>
             <div className="flex gap-2">
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Bon</span>
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span>Modéré</span>
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>Nocif</span>
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Dangereux</span>
             </div>
          </div>
          <div className="h-[400px] w-full hidden md:block">
             {typeof window !== 'undefined' && (
                <MapContainer 
                  center={[6.5, 12.5]} 
                  zoom={5.5} 
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapUpdater center={selectedCity ? [selectedCity.latitude, selectedCity.longitude] : null} />
                  
                  {citiesData.map(city => {
                    const cityAqi = city.current.aqi || 50;
                    const isSelected = selectedCity?.name === city.name;
                    return (
                      <CircleMarker
                        key={city.name}
                        center={[city.latitude, city.longitude]}
                        radius={isSelected ? 16 : 10}
                        fillColor={getAQIColor(cityAqi)}
                        color={isSelected ? '#0D7377' : '#ffffff'}
                        weight={isSelected ? 3 : 2}
                        fillOpacity={0.9}
                        eventHandlers={{
                          click: () => {
                            setSelectedCity(city);
                          },
                        }}
                      >
                        <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                          <div className="text-center font-sans">
                            <strong className="text-gray-800 text-sm block">{city.name}</strong>
                            <span className="text-xs font-bold" style={{color: getAQIColor(cityAqi)}}>AQI: {cityAqi}</span>
                          </div>
                        </LeafletTooltip>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
             )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <TrendingUp size={20} className="text-teal-600"/>
                  Historique : Indice de Qualité de l'Air (AQI) global
                </h3>
                <p className="text-sm text-gray-500">Réel historique issu de <b>monthly.json</b> (2020-2025)</p>
              </div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getAQIColor(aqi)} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={getAQIColor(aqi)} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="aqi" 
                    stroke={getAQIColor(aqi)} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAqi)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <Filter size={18} className="text-teal-600"/> Filtre & Villes
              </h3>
            </div>
            
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher une ville ou région..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[600px] p-2 space-y-1 custom-scrollbar">
              {filteredCities.map(city => {
                const cityAqi = city.current.aqi || 50;
                const isAlert = cityAqi >= 101;
                const isSelected = selectedCity?.name === city.name;
                
                return (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city)}
                    className={\`w-full text-left p-3 rounded-xl transition-all flex justify-between items-center \${
                      isSelected 
                        ? 'bg-teal-50 shadow-sm border border-teal-100' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }\`}
                  >
                    <div>
                      <p className={\`font-bold \${isSelected ? 'text-teal-800' : 'text-gray-800'} flex items-center gap-1\`}>
                         {city.name}
                         {isAlert && <AlertTriangle size={12} className="text-red-500" />}
                      </p>
                      <p className="text-xs text-gray-500">{city.region}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span 
                        className="px-2.5 py-1 rounded-lg text-white text-sm font-black shadow-sm"
                        style={{ backgroundColor: getAQIColor(cityAqi) }}
                      >
                        {cityAqi}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1 font-medium">{getAQILevel(cityAqi).label}</span>
                    </div>
                  </button>
                )
              })}
              {filteredCities.length === 0 && (
                <div className="text-center p-8 text-gray-400">
                  <p>Aucune ville trouvée</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-5 border border-gray-100 mt-auto">
             <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800 text-sm">Qualité de l'Air : Légende</h4>
             </div>
             <div className="space-y-2">
                {[
                  { range: '0-50', label: 'Bon', color: '#22c55e' },
                  { range: '51-100', label: 'Modéré', color: '#eab308' },
                  { range: '101-150', label: 'Sensible', color: '#f97316' },
                  { range: '150+', label: 'Nocif/Dangereux', color: '#ef4444' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                     <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-600 font-medium">{item.label}</span>
                     </div>
                     <span className="text-gray-400 font-medium">{item.range} AQI</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
\`;

fs.writeFileSync('C:\\\\Users\\\\momok\\\\Desktop\\\\airwatch-cameroun\\\\frontend\\\\src\\\\pages\\\\Dashboard.jsx', prefix + cleanJSX, 'utf8');
console.log("Dashboard.jsx fully repaired with Regex splice!");
