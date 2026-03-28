import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import useStore from '../store/useStore';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const REFORESTATION_ZONES = [
  { id: 1, name: "Zone de Bassa", region: "Littoral", coords: [4.0511, 9.7679], priority: 8.5, ndvi: 0.42, status: "URGENT", wind: "Sud-Ouest", impact: "+12%", species: ["Pterocarpus", "Terminalia"] },
  { id: 2, name: "Périphérie Nord", region: "Extrême-Nord", coords: [10.5912, 14.3155], priority: 9.2, ndvi: 0.15, status: "CRITIQUE", wind: "Nord-Est", impact: "+25%", species: ["Acacia", "Baobab", "Neem"] },
  { id: 3, name: "Mont Mbankolo", region: "Centre", coords: [3.8850, 11.5020], priority: 6.8, ndvi: 0.55, status: "MODÉRÉ", wind: "Sud", impact: "+8%", species: ["Milicia", "Khaya"] }
];

const INITIAL_CHART = ['40%', '55%', '70%', '45%', '85%', '95%', '60%', '30%', '50%', '75%', '40%', '65%'];

// Composant pour recentrer la carte
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function AssociationDashboard() {
  const { currentVille } = useStore();
  const [selectedZone, setSelectedZone] = useState(REFORESTATION_ZONES[0]);
  const [isPlanting, setIsPlanting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [impactData, setImpactData] = useState(INITIAL_CHART);

  const handlePlantingAction = () => {
    setIsPlanting(true);
    setTimeout(() => {
      setIsPlanting(false);
      setShowSuccess(true);
      const newImpact = [...impactData];
      newImpact[newImpact.length - 1] = '25%';
      newImpact[newImpact.length - 2] = '35%';
      setImpactData(newImpact);
      setTimeout(() => setShowSuccess(false), 4000);
    }, 1500);
  };

  const handleDownloadReport = () => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 3000);
  };

  return (
    <div className="relative min-h-screen select-none overflow-hidden">
      
      {/* MAP BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <MapContainer center={selectedZone.coords} zoom={7} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <ChangeView center={selectedZone.coords} />
          {REFORESTATION_ZONES.map((zone) => (
            <React.Fragment key={zone.id}>
              <Circle 
                center={zone.coords}
                pathOptions={{ 
                  fillColor: zone.status === 'CRITIQUE' ? '#DC2626' : zone.status === 'URGENT' ? '#F97316' : '#14A44D', 
                  color: 'white', 
                  weight: isPlanting ? 2 : 0.5,
                  fillOpacity: selectedZone.id === zone.id ? 0.4 : 0.2 
                }}
                radius={50000}
                eventHandlers={{ click: () => setSelectedZone(zone) }}
              />
              <Marker position={zone.coords} eventHandlers={{ click: () => setSelectedZone(zone) }} />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 bg-gradient-to-b from-[#00132d] to-transparent pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#81d4d8] opacity-80 italic">NGO Portal • Reforestation</p>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Zones Prioritaires</h1>
        </div>
        <button 
          onClick={handleDownloadReport}
          disabled={isDownloading}
          className="h-12 px-4 glass-button rounded-2xl flex items-center gap-2 border-white/10 pointer-events-auto"
        >
          {isDownloading ? (
            <span className="h-4 w-4 border-2 border-[#81d4d8]/30 border-t-[#81d4d8] rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">file_download</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#81d4d8]">PDF</span>
            </>
          )}
        </button>
      </header>

      {/* SUCCESS BANNER */}
      {showSuccess && (
        <div className="fixed inset-x-6 top-24 z-[100] animate-in slide-in-from-top-8 duration-500">
          <div className="glass-card bg-[#14A44D]/20 border-[#14A44D]/30 p-5 rounded-[28px] flex items-center gap-4 backdrop-blur-3xl shadow-2xl">
            <div className="h-12 w-12 rounded-2xl bg-[#14A44D] flex items-center justify-center animate-bounce shadow-lg shadow-[#14A44D]/40">
              <span className="material-symbols-outlined text-white">park</span>
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase italic tracking-tight">Plantation Enregistrée !</p>
              <p className="text-[10px] text-[#14A44D] font-bold uppercase tracking-widest mt-0.5">Impact calculé: {selectedZone.impact} d'AQI</p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT (SCROLLABLE) */}
      <main className="relative z-10 pt-24 px-4 pb-32 pointer-events-none h-screen overflow-y-auto no-scrollbar">
        <section className="max-w-[450px] mx-auto space-y-6 pointer-events-auto pb-10">
          
          {/* ZONE PICKER (Horizontal) */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-2">
            {REFORESTATION_ZONES.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl border transition-all duration-500 ${
                  selectedZone.id === zone.id 
                    ? 'glass-card border-[#81d4d8]/50 bg-[#81d4d8]/10 text-[#81d4d8] scale-105' 
                    : 'bg-white/5 border-white/5 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest italic">{zone.name}</span>
              </button>
            ))}
          </div>

          {/* ZONE CARD DETAILS */}
          <div className="glass-card rounded-[40px] p-8 border-white/10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedZone.name}</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3">{selectedZone.region} Region • Cameroun</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-lg ${
                selectedZone.status === 'CRITIQUE' ? 'border-error/30 bg-error/10 text-error shadow-error/10' : 'border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316] shadow-[#F97316]/10'
              }`}>
                {selectedZone.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
              <div className="bg-[#00132d]/40 p-6 space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Score Priorité</p>
                <p className="text-4xl font-black text-white italic">{selectedZone.priority}<span className="text-base font-normal text-slate-600">/10</span></p>
              </div>
              <div className="bg-[#00132d]/40 p-6 space-y-1 text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Indice NDVI</p>
                <p className="text-4xl font-black text-[#81d4d8] italic">{selectedZone.ndvi}</p>
              </div>
              <div className="bg-[#00132d]/40 p-6 space-y-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vents Dominants</p>
                <p className="text-sm font-black text-white uppercase italic tracking-tighter">{selectedZone.wind}</p>
              </div>
              <div className="bg-[#00132d]/40 p-6 space-y-1 text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Impact Estimé</p>
                <p className="text-sm font-black text-[#14A44D] uppercase italic tracking-tighter">{selectedZone.impact} AQI</p>
              </div>
            </div>

            {/* Species Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 opacity-60">
                <span className="material-symbols-outlined text-sm text-[#81d4d8]">inventory_2</span>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Plan de reboisement IA</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedZone.species.map((s, i) => (
                  <span key={i} className="px-5 py-2.5 glass-button rounded-2xl text-[11px] font-black text-white uppercase italic tracking-tighter border-white/5 hover:border-[#81d4d8]/20 transition-all">{s}</span>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <button 
              id="planting-btn"
              onClick={handlePlantingAction}
              disabled={isPlanting}
              className="w-full py-6 rounded-[32px] bg-[#81d4d8] text-[#00132d] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-[#81d4d8]/20 active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              {isPlanting ? (
                <div className="h-5 w-5 border-2 border-[#00132d]/30 border-t-[#00132d] rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">potted_plant</span>
                  ENREGISTRER ACTION TERRAIN
                </>
              )}
            </button>
          </div>

          {/* IMPACT CHART CARD */}
          <div id="impact-section" className="glass-card rounded-[40px] p-8 border-white/5 space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none text-editorial">Suivi d'Impact</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Évolution des Particules Fines (PM2.5)</p>
              </div>
              <span className="material-symbols-outlined text-[#81d4d8] animate-pulse">show_chart</span>
            </div>
            
            <div className="flex h-32 items-end justify-between gap-2 px-2 mt-4">
              {impactData.map((height, index) => (
                <div
                  key={index}
                  className={`w-full rounded-t-xl transition-all duration-1000 ${
                    index >= impactData.length - 2 && showSuccess 
                      ? 'bg-[#14A44D] shadow-[0_0_15px_rgba(20,164,77,0.4)]' 
                      : 'bg-[#81d4d8]/10 group-hover:bg-[#81d4d8]/30'
                  }`}
                  style={{ height }}
                />
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 italic">
              <span>Il y a 30 jours</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#14A44D]" />
                <span className="text-white">Aujourd'hui</span>
              </div>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default AssociationDashboard;
