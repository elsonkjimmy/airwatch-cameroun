import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

const CITIES_AQI = [
  { name: "Douala", coords: [4.0511, 9.7679], aqi: 185, status: "CRITICAL" },
  { name: "Yaoundé", coords: [3.8480, 11.5192], aqi: 92, status: "MODERATE" },
  { name: "Maroua", coords: [10.5912, 14.3155], aqi: 162, status: "UNHEALTHY" },
  { name: "Garoua", coords: [9.3019, 13.3977], aqi: 45, status: "GOOD" },
  { name: "Bamenda", coords: [5.9631, 10.1591], aqi: 78, status: "MODERATE" },
  { name: "Bafoussam", coords: [5.4777, 10.4176], aqi: 110, status: "UNHEALTHY" },
];

const INITIAL_REPORTS = [
  { id: 1, icon: 'factory', iconClass: 'text-error', label: 'Fumée industrielle', status: 'CRITICAL', statusClass: 'border-error/30 text-error', location: 'Bassa, Douala', time: '2m' },
  { id: 2, icon: 'local_fire_department', iconClass: 'text-yellow-500', label: 'Brûlage déchets', status: 'MODERATE', statusClass: 'border-yellow-500/30 text-yellow-500', location: 'Mvan, Yaoundé', time: '14m' },
  { id: 3, icon: 'cloud', iconClass: 'text-slate-400', label: 'Poussière chantier', status: 'LOW', statusClass: 'border-slate-400/30 text-slate-400', location: 'Odza, Yaoundé', time: '45m' },
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

function GouvernementDashboard() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(true);
      const newReport = {
        id: Date.now(),
        icon: 'warning',
        iconClass: 'text-error',
        label: 'PIC CRITIQUE',
        status: 'CRITICAL',
        statusClass: 'border-error/30 text-error',
        location: 'Zone Portuaire, Douala',
        time: 'À l\'instant',
      };
      setReports([newReport, ...reports]);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* MAP BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <MapContainer center={[7.3697, 12.3547]} zoom={6} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {CITIES_AQI.map((city, idx) => (
            <CircleMarker 
              key={idx}
              center={city.coords}
              pathOptions={{ fillColor: getStatusColor(city.status), color: 'white', weight: 0.5, fillOpacity: 0.6 }}
              radius={city.aqi / 8}
            >
              <Popup>
                <div className="text-[#00132d] p-1 font-bold">{city.name}: {city.aqi}</div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* OVERLAY CONTENT */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 bg-gradient-to-b from-[#00132d] to-transparent">
        <div className="flex flex-col">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#F97316] opacity-80 italic">Government Portal • Command Center</p>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">National surveillance</h1>
        </div>
        <div className="relative h-10 w-10 glass-button rounded-full flex items-center justify-center border-white/10">
          <span className="material-symbols-outlined text-sm">notifications</span>
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error animate-ping" />
        </div>
      </header>

      <main className="relative z-10 pt-24 px-4 pb-32 pointer-events-none">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: ALERTS & PATTERNS */}
          <div className="lg:col-span-4 space-y-6 pointer-events-auto">
            
            {/* CRITICAL ALERT CARD */}
            {showAlert && (
              <div className="glass-card bg-error/10 border-error/30 p-6 rounded-[32px] animate-in slide-in-from-left-8 duration-500 aqi-pulse-red">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-error flex items-center justify-center animate-bounce">
                    <span className="material-symbols-outlined text-white text-sm">priority_high</span>
                  </div>
                  <h3 className="text-[11px] font-black text-error uppercase tracking-[0.2em] italic">Alerte Critique</h3>
                </div>
                <p className="text-sm font-black text-white italic uppercase tracking-tight">Douala - Zone Portuaire</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Seuil franchi: AQI 210+</p>
                <button onClick={() => setShowAlert(false)} className="w-full mt-6 py-3 rounded-2xl bg-error text-white font-black text-[10px] uppercase tracking-[0.3em]">Acquitter</button>
              </div>
            )}

            {/* PREDICTIVE ANALYSIS */}
            <div className="glass-card rounded-[32px] p-6 border-white/5 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">IA Predictions</h2>
                <span className="material-symbols-outlined text-[#81d4d8] text-sm animate-pulse">analytics</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-[11px] font-black text-white italic uppercase">Douala Bassa</p>
                    <p className="text-[11px] font-black text-[#81d4d8]">91% Match</p>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#81d4d8] rounded-full" style={{ width: '91%' }} />
                  </div>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-400 font-medium italic opacity-80">
                  Corrélation forte avec les cycles de production usiniers (04h00 - 07h00). Pic PM2.5 systématique.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LIVE FEED */}
          <div className="lg:col-span-8 pointer-events-auto">
            <div className="glass-card rounded-[40px] border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-3xl">
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Signalements Live</h2>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Classification Automatique IA</p>
                </div>
                <div className="px-4 py-2 glass-button rounded-full flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#81d4d8] animate-pulse" />
                  <span className="text-[9px] font-black text-[#81d4d8] uppercase tracking-widest">Live Feed</span>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {reports.map((item) => (
                  <div key={item.id} className="p-6 flex items-center gap-6 group hover:bg-white/5 transition-all cursor-pointer">
                    <div className={`h-12 w-12 rounded-2xl glass-card flex items-center justify-center border-white/10 ${item.iconClass}`}>
                      <span className="material-symbols-outlined">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-[13px] font-black text-white uppercase italic tracking-tight">{item.label}</h4>
                        <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${item.statusClass}`}>{item.status}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {item.location}
                      </p>
                    </div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic group-hover:text-[#81d4d8] transition-colors">il y a {item.time}</p>
                  </div>
                ))}
              </div>

              <button className="w-full py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] hover:text-[#81d4d8] transition-all bg-white/5">
                Consulter tous les rapports PDF
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default GouvernementDashboard;
