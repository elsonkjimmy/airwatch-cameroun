import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import useStore from '../store/useStore';

const CITIES_AQI = [
  { name: "Douala", coords: [4.0511, 9.7679], aqi: 185, status: "CRITICAL" },
  { name: "Yaoundé", coords: [3.8480, 11.5192], aqi: 92, status: "MODERATE" },
  { name: "Maroua", coords: [10.5912, 14.3155], aqi: 162, status: "UNHEALTHY" },
  { name: "Garoua", coords: [9.3019, 13.3977], aqi: 45, status: "GOOD" },
  { name: "Bamenda", coords: [5.9631, 10.1591], aqi: 78, status: "MODERATE" },
  { name: "Bafoussam", coords: [5.4777, 10.4176], aqi: 110, status: "UNHEALTHY" },
  { name: "Kribi", coords: [2.9506, 9.9077], aqi: 35, status: "GOOD" },
];

const INITIAL_REPORTS = [
  { id: 1, icon: 'factory', label: 'Fumée industrielle', status: 'CRITICAL', color: 'text-error', location: 'Bassa, Douala', time: '2m' },
  { id: 2, icon: 'local_fire_department', label: 'Brûlage déchets', status: 'MODERATE', color: 'text-yellow-500', location: 'Mvan, Yaoundé', time: '14m' },
  { id: 3, icon: 'cloud', label: 'Poussière chantier', status: 'LOW', color: 'text-slate-400', location: 'Odza, Yaoundé', time: '45m' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'CRITICAL': return '#DC2626';
    case 'UNHEALTHY': return '#F97316';
    case 'MODERATE': return '#EAB308';
    case 'GOOD': return '#14A44D';
    default: return '#94a3b8';
  }
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom]);
  return null;
}

function GouvernementDashboard() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [activeAlert, setActiveAlert] = useState(null);
  const [focusCity, setFocusCity] = useState({ coords: [7.3697, 12.3547], zoom: 6 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveAlert({ city: "Douala", aqi: 215, zone: "Zone Portuaire" });
      setFocusCity({ coords: [4.0511, 9.7679], zoom: 12 });
      setReports([{ id: Date.now(), icon: 'warning', label: 'PIC CRITIQUE', status: 'CRITICAL', color: 'text-error', location: 'Port, Douala', time: 'À l\'instant' }, ...reports]);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen select-none bg-[#00132d] lg:flex overflow-hidden animate-page-reveal">
      
      {/* MAP BACKGROUND */}
      <div className="fixed inset-0 lg:relative lg:flex-1 z-0">
        <MapContainer center={focusCity.coords} zoom={focusCity.zoom} style={{ height: '100%', width: '100%', background: '#00132d' }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <ChangeView center={focusCity.coords} zoom={focusCity.zoom} />
          {CITIES_AQI.map((city, idx) => (
            <CircleMarker key={idx} center={city.coords} pathOptions={{ fillColor: getStatusColor(city.status), color: 'white', weight: 0.5, fillOpacity: 0.6 }} radius={city.aqi / 8} eventHandlers={{ click: () => setFocusCity({ coords: city.coords, zoom: 10 }) }}>
              <Popup><div className="text-white p-2 font-black uppercase italic tracking-tighter">{city.name} AQI {city.aqi}</div></Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center justify-between px-6 pointer-events-none lg:px-10 lg:pt-4 animate-content-entrance">
        <div className="flex flex-col pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-error opacity-80 italic">REPUBLIQUE DU CAMEROUN • HQ NATIONAL</p>
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Surveillance</h1>
        </div>
        <button className="h-14 px-8 glass-button rounded-[24px] flex items-center gap-3 border-white/10 pointer-events-auto shadow-2xl transition-all">
          <span className="material-symbols-outlined text-error">analytics</span>
          <span className="text-[11px] font-black uppercase tracking-widest text-white">Export PDF</span>
        </button>
      </header>

      {/* ALERT OVERLAY */}
      {activeAlert && (
        <div className="fixed top-28 inset-x-6 lg:left-auto lg:right-10 lg:w-[400px] z-[100] animate-in slide-in-from-top-8 duration-500">
          <div className="glass-card bg-error/10 border-error/30 p-8 rounded-[40px] backdrop-blur-3xl shadow-2xl aqi-pulse-red text-center">
            <div className="h-16 w-16 rounded-3xl bg-error flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="material-symbols-outlined text-white text-2xl">priority_high</span>
            </div>
            <h3 className="text-[11px] font-black text-error uppercase tracking-[0.3em] mb-2">Alerte Critique</h3>
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">{activeAlert.city} - {activeAlert.zone}</h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8">Niveau de pollution extrême détecté. Mesures d'urgence recommandées et SMS envoyés.</p>
            <button onClick={() => setActiveAlert(null)} className="w-full py-5 rounded-[28px] bg-error text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-error/20">Acquitter</button>
          </div>
        </div>
      )}

      {/* SIDE PANEL */}
      <main className="relative z-10 pt-[50vh] lg:pt-24 px-4 pb-32 lg:w-[500px] lg:h-screen lg:overflow-y-auto no-scrollbar pointer-events-none lg:pointer-events-auto scroll-smooth bg-transparent lg:backdrop-blur-md lg:border-l lg:border-white/10 animate-content-entrance delay-300">
        <section className="max-w-[450px] mx-auto space-y-8 pointer-events-auto pb-10 lg:px-6 lg:pt-6">
          
          <div className="flex flex-col items-center mb-8 opacity-40 animate-bounce lg:hidden">
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Glisser pour détails</p>
            <span className="material-symbols-outlined text-sm">keyboard_double_arrow_up</span>
          </div>

          <div id="alerts-section" className="glass-card rounded-[44px] p-10 border-white/10 space-y-8 animate-content-entrance delay-500">
            <div className="flex justify-between items-center">
              <div><p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#81d4d8] opacity-80 italic">Status Global</p><h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mt-1">Données Live</h2></div>
              <div className="h-12 w-12 glass-button rounded-2xl flex items-center justify-center border-white/10"><span className="material-symbols-outlined text-[#81d4d8]">sensors</span></div>
            </div>
            <div className="grid grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
              <div className="p-8 bg-[#00132d]/40"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stations</p><p className="text-4xl font-black text-white italic">42</p></div>
              <div className="p-8 bg-[#00132d]/40 text-right"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Alertes</p><p className="text-4xl font-black text-error italic">03</p></div>
            </div>
          </div>

          <div className="glass-card rounded-[44px] p-10 border-white/10 space-y-8 animate-content-entrance delay-700">
            <div className="flex justify-between items-center"><h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">IA Patterns</h3><span className="material-symbols-outlined text-[#81d4d8] text-sm animate-pulse">analytics</span></div>
            <div className="space-y-6">
              <div className="flex justify-between items-end"><p className="text-sm font-black text-white italic uppercase tracking-tight">Zone Bassa - Douala</p><p className="text-[11px] font-black text-[#81d4d8]">91% MATCH</p></div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#81d4d8] rounded-full" style={{ width: '91%' }} /></div>
              <p className="text-[11px] leading-relaxed text-slate-400 font-bold italic opacity-80 uppercase tracking-wide">Corrélation forte avec les cycles industriels (04h00 - 07h00).</p>
            </div>
          </div>

          <div id="data-section" className="glass-card rounded-[44px] border-white/10 overflow-hidden animate-content-entrance" style={{ animationDelay: '900ms' }}>
            <div className="p-10 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Signalements</h3>
              <div className="px-4 py-1.5 bg-[#81d4d8]/10 rounded-full border border-[#81d4d8]/20"><p className="text-[9px] font-black text-[#81d4d8] uppercase tracking-widest animate-pulse">LIVE FEED</p></div>
            </div>
            <div className="divide-y divide-white/5">
              {reports.map((r) => (
                <div key={r.id} className="p-8 flex items-center gap-8 group hover:bg-white/[0.05] transition-all cursor-pointer">
                  <div className={`h-14 w-14 rounded-2xl glass-card flex items-center justify-center border-white/10 ${r.color}`}><span className="material-symbols-outlined text-2xl">{r.icon}</span></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5"><h4 className="text-sm font-black text-white uppercase italic tracking-tight">{r.label}</h4><span className={`px-2 py-0.5 rounded-lg border border-white/10 text-[8px] font-black uppercase tracking-widest ${r.color}`}>{r.status}</span></div>
                    <p className="text-[11px] font-black text-slate-500 flex items-center gap-2 italic tracking-tight"><span className="material-symbols-outlined text-[14px]">location_on</span>{r.location}</p>
                  </div>
                  <p className="text-[10px] font-black text-slate-600 uppercase italic">{r.time}</p>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default GouvernementDashboard;
