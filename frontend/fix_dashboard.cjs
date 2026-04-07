const fs = require('fs');
let code = fs.readFileSync('C:\\\\Users\\\\momok\\\\Desktop\\\\airwatch-cameroun\\\\frontend\\\\src\\\\pages\\\\Dashboard.jsx.bak', 'utf8');

// The code was corrupted by PowerShell replacing EOF with garbage
// and translating special characters incorrectly.
// We will simply extract everything up to `return (` at line 555
// and rewrite the return statement cleanly.

const splitPoint = code.indexOf('  return (');
if (splitPoint === -1) throw new Error("Could not find 'return ('");

const prefix = code.substring(0, splitPoint);

const cleanJSX = `  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ====== LEFT SIDEBAR ====== */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-sm">
        {/* Sidebar header */}
        <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Wind size={18} />
            </div>
            <span className="font-bold text-sm">AirWatch Cameroun</span>
          </div>
          <p className="text-slate-400 text-xs">Surveillance qualite de l'air</p>
        </div>

        {/* Alert banner (compact) */}
        {showAlertBanner && alertCities.length > 0 && (
          <div className="bg-red-600 text-white px-3 py-2 flex items-center gap-2 text-xs">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="font-semibold">{alertCities.length} ville(s) en alerte</span>
          </div>
        )}

        {/* Stats mini row */}
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <NationalStatsBar cities={citiesData} compact />
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              placeholder="Rechercher une ville..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
            />
          </div>
        </div>

        {/* City list */}
        <div className="flex-1 overflow-y-auto">
          {sidebarCities.map(city => {
            const cityAqi = city.current.aqi || 0;
            const isSelected = city.name === selectedCity.name;
            const isAlert = cityAqi >= 151;
            return (
              <button
                key={city.name}
                onClick={() => setSelectedCity(city)}
                className={\`w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-gray-50 transition-colors \${
                  isSelected ? 'bg-teal-50 border-l-4 border-l-teal-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                }\`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: getAQIColor(cityAqi) }}
                >
                  {cityAqi}
                </div>
                <div className="min-w-0">
                  <p className={\`text-sm font-semibold truncate \${isSelected ? 'text-teal-700' : 'text-gray-800'}\`}>
                    {isAlert && <span className="mr-1">🔴</span>}{city.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{city.region}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
          <span>{citiesData.length} villes</span>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 hover:bg-gray-100 rounded"
            title={isMuted ? 'Activer alertes sonores' : 'Desactiver alertes sonores'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </aside>

      {/* ====== RIGHT CONTENT ====== */}
      <div className="flex-1 overflow-y-auto bg-slate-50">

        {/* TOP HEADER BAR */}
        <header className="sticky top-0 z-50 bg-slate-900 text-white px-6 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Wind size={18} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">AirWatch Cameroun</p>
              <p className="text-slate-400 text-xs leading-tight">Prevision qualite de l'air</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {alertCities.length > 0 && (
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-full animate-pulse">
                <AlertTriangle size={14} className="text-white" />
                <span className="text-white text-xs font-bold">{alertCities.length} actives</span>
              </div>
            )}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all \${
                isMuted ? 'bg-slate-700 text-slate-400' : alertCities.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-400'
              }\`}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              {isMuted ? 'Son coupe' : 'Son actif'}
            </button>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Clock size={12} />
              {new Date().toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="p-5 space-y-5">

          {/* CITY HERO CARD */}
          <div
            className="rounded-2xl p-5 border-2 shadow-sm"
            style={{ backgroundColor: \`\${getAQIColor(aqi)}08\`, borderColor: \`\${getAQIColor(aqi)}60\` }}
          >
            <div className="flex flex-col lg:flex-row gap-5">
              <div className="flex flex-col items-center">
                <AQIGauge aqi={aqi} color={getAQIColor(aqi)} />
                <div className="flex items-center gap-1.5 mt-1 px-3 py-1 bg-slate-800 rounded-full">
                  <Activity size={11} className="text-teal-400" />
                  <span className="text-teal-400 text-xs font-semibold">Predit par IA</span>
                </div>
                <p className="text-gray-500 text-xs mt-1.5">Indice Qualite de l'Air</p>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{selectedCity.name}</h2>
                    <p className="text-gray-500 text-sm">{selectedCity.region}</p>
                  </div>
                  <span
                    className="px-3 py-1.5 rounded-xl text-white text-sm font-bold shadow-sm"
                    style={{ backgroundColor: getAQIColor(aqi) }}
                  >
                    {aqiLevel.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'PM2.5', value: \`\${cityData.pm25 || '-'}\`, unit: 'ug/m3', color: '#7C3AED' },
                    { label: 'PM10', value: \`\${cityData.pm10 || '-'}\`, unit: 'ug/m3', color: '#2563EB' },
                    { label: 'Poussiere', value: \`\${cityData.dust || '-'}\`, unit: 'ug/m3', color: '#D97706' },
                    { label: 'Vent', value: \`\${cityData.windSpeed || '-'}\`, unit: 'km/h', color: '#0D7377' },
                  ].map(m => (
                    <div key={m.label} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                      <p className="text-xs text-gray-500 mb-0.5">{m.label}</p>
                      <p className="text-xl font-black" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-xs text-gray-400">{m.unit}</p>
                    </div>
                  ))}
                </div>

                <ForecastStrip aqi={aqi} aqiTomorrow={forecastTomorrow} aqiAfter={forecastAfter} />

                <div className="mt-3 p-3 rounded-xl flex items-start gap-2" style={{ backgroundColor: \`\${pattern.color}12\` }}>
                  <Shield size={14} style={{ color: pattern.color }} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: pattern.color }}>{pattern.label}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{pattern.advice}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {firms.hasFireNearby && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                <Flame size={14} className="text-red-500" />
                <span>NASA FIRMS : {firms.fireCount50km} feux</span>
              </div>
            )}
          </div>

          {/* INTERACTIVE MAP */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-teal-600" /> Carte nationale
              </h3>
            </div>
            <div className="h-[360px]">
              <MapContainer center={[6.5, 12.5]} zoom={5.5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapUpdater center={selectedCity ? [selectedCity.latitude, selectedCity.longitude] : null} />
                {citiesData.map(city => {
                  const cityAqi = city.current.aqi || 50;
                  const isSelected = city.name === selectedCity.name;
                  return (
                    <CircleMarker
                      key={city.name}
                      center={[city.latitude, city.longitude]}
                      radius={isSelected ? 14 : 9}
                      fillColor={getAQIColor(cityAqi)}
                      color={isSelected ? '#0D7377' : '#fff'}
                      weight={isSelected ? 3 : 1.5}
                      fillOpacity={0.88}
                      eventHandlers={{ click: () => setSelectedCity(city) }}
                    />
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* HISTORICAL TREND */}
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Historique AQI 2022-2025</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={monthlyData
                  .filter(d => d.city === selectedCity.name && d.year >= 2022 && d.aqi != null)
                  .map(d => ({ date: \`\${d.month}/\${d.year}\`, aqi: d.aqi, pm25: d.pm25 }))
                }
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={2} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                <Tooltip />
                <ReferenceLine y={150} stroke="#DC2626" strokeDasharray="4 4" />
                <ReferenceLine y={100} stroke="#F97316" strokeDasharray="4 4" />
                <ReferenceLine y={50} stroke="#EAB308" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="aqi" stroke={getAQIColor(aqi)} strokeWidth={2} fillOpacity={0.1} />
                <Line type="monotone" dataKey="pm25" stroke="#7C3AED" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* CITY RANKINGS */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <AlertTriangle className="text-red-500" size={16} /> Top 5 - Plus pollue
              </h3>
              <div className="space-y-2">
                {[...citiesData].sort((a, b) => b.current.aqi - a.current.aqi).slice(0, 5).map((city, i) => (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{city.name}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: getAQIColor(city.current.aqi) }}>
                      {city.current.aqi}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <Leaf className="text-green-500" size={16} /> Top 5 - Plus propre
              </h3>
              <div className="space-y-2">
                {[...citiesData].sort((a, b) => a.current.aqi - b.current.aqi).slice(0, 5).map((city, i) => (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold">{city.name}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: getAQIColor(city.current.aqi) }}>
                      {city.current.aqi}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
`;

fs.writeFileSync('C:\\\\Users\\\\momok\\\\Desktop\\\\airwatch-cameroun\\\\frontend\\\\src\\\\pages\\\\Dashboard.jsx', prefix + cleanJSX, 'utf8');
console.log("Dashboard.jsx successfully rewritten.");
