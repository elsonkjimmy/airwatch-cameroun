import React, { useState, useEffect, useRef } from 'react';
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

const ALL_ZONES = [
  { id: 1, name: "Zone de Bassa", region: "Littoral", coords: [4.0511, 9.7679], priority: 8.5, ndvi: 0.42, status: "URGENT", wind: "Sud-Ouest", impact: "+12%", species: ["Pterocarpus", "Terminalia"] },
  { id: 2, name: "Périphérie Nord", region: "Extrême-Nord", coords: [10.5912, 14.3155], priority: 9.2, ndvi: 0.15, status: "CRITIQUE", wind: "Nord-Est", impact: "+25%", species: ["Acacia", "Baobab", "Neem"] },
  { id: 3, name: "Mont Mbankolo", region: "Centre", coords: [3.8850, 11.5020], priority: 6.8, ndvi: 0.55, status: "MODÉRÉ", wind: "Sud", impact: "+8%", species: ["Milicia", "Khaya"] },
  { id: 4, name: "Zone Portuaire", region: "Littoral", coords: [4.0211, 9.6979], priority: 7.9, ndvi: 0.38, status: "URGENT", wind: "Ouest", impact: "+15%", species: ["Rhizophora", "Avicennia"] },
  { id: 5, name: "Savane Garoua", region: "Nord", coords: [9.3019, 13.3977], priority: 8.1, ndvi: 0.22, status: "URGENT", wind: "Est", impact: "+18%", species: ["Acacia", "Eucalyptus"] },
];

const INITIAL_CHART = ['40%', '55%', '70%', '45%', '85%', '95%', '60%', '30%', '50%', '75%', '40%', '65%'];

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom(), { animate: true }); }, [center]);
  return null;
}

function AssociationDashboard() {
  const { assignedZone, user } = useStore();
  const filteredZones = ALL_ZONES.filter(z => !assignedZone || z.region.includes(assignedZone) || assignedZone.includes(z.region));

  const [selectedZone, setSelectedZone] = useState(filteredZones[0] || ALL_ZONES[0]);
  const [isPlanting, setIsPlanting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [impactData, setImpactData] = useState(INITIAL_CHART);
  const scrollRef = useRef(null);

  const handlePlantingAction = () => {
    setIsPlanting(true);
    setTimeout(() => {
      setIsPlanting(false);
      setShowSuccess(true);
      const newImpact = [...impactData];
      newImpact[newImpact.length - 1] = '20%';
      newImpact[newImpact.length - 2] = '30%';
      newImpact[newImpact.length - 3] = '40%';
      setImpactData(newImpact);
      setTimeout(() => setShowSuccess(false), 4000);
    }, 1500);
  };

  const handleDownloadReport = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setTimeout(() => setDownloadProgress(null), 1000); return 100; }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="relative min-h-screen select-none bg-[#00132d] lg:flex overflow-hidden animate-page-reveal">
      
      {/* MAP BACKGROUND */}
      <div className="fixed inset-0 lg:relative lg:flex-1 z-0 bg-[#00132d]">
        <MapContainer center={selectedZone.coords} zoom={7} style={{ height: '100%', width: '100%', background: '#00132d' }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <ChangeView center={selectedZone.coords} />
          {filteredZones.map((zone) => (
            <React.Fragment key={zone.id}>
              <Circle center={zone.coords} pathOptions={{ fillColor: zone.status === 'CRITIQUE' ? '#DC2626' : '#F97316', color: 'white', weight: 0.5, fillOpacity: selectedZone.id === zone.id ? 0.4 : 0.2 }} radius={50000} eventHandlers={{ click: () => setSelectedZone(zone) }} />
              <Marker position={zone.coords} eventHandlers={{ click: () => setSelectedZone(zone) }} />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-6 bg-gradient-to-b from-[#00132d] to-transparent pointer-events-none lg:bg-none lg:px-8 animate-content-entrance">
        <div className="flex flex-col pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#81d4d8] animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#81d4d8] opacity-80 italic">{user?.email?.split('@')[0].toUpperCase()} • {assignedZone || 'National'}</p>
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Reforestation</h1>
        </div>
        <button onClick={handleDownloadReport} disabled={downloadProgress !== null} className="h-12 px-4 glass-button rounded-2xl flex items-center gap-2 border-white/10 pointer-events-auto shadow-2xl relative overflow-hidden transition-transform hover:scale-105 active:scale-95">
          {downloadProgress !== null ? <><div className="absolute inset-0 bg-[#81d4d8]/20 transition-all" style={{ width: `${downloadProgress}%` }} /><span className="text-[10px] font-black text-white relative z-10">{downloadProgress}%</span></> : <><span className="material-symbols-outlined text-sm text-[#81d4d8]">description</span><span className="text-[10px] font-black uppercase text-[#81d4d8]">Rapport</span></>}
        </button>
      </header>

      {/* SIDE PANEL */}
      <main className="relative z-10 pt-[45vh] lg:pt-24 px-4 pb-32 lg:w-[480px] lg:h-screen lg:overflow-y-auto no-scrollbar pointer-events-none lg:pointer-events-auto scroll-smooth bg-transparent lg:backdrop-blur-md lg:border-l lg:border-white/5 animate-content-entrance delay-300">
        <section className="max-w-[450px] mx-auto space-y-6 pointer-events-auto pb-10 lg:px-4 lg:pt-4">
          
          <div className="flex flex-col items-center mb-4 opacity-40 animate-bounce lg:hidden">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Scroller pour détails</span>
            <span className="material-symbols-outlined text-sm">keyboard_double_arrow_up</span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-2 animate-content-entrance delay-500">
            {filteredZones.map((zone) => (
              <button key={zone.id} onClick={() => setSelectedZone(zone)} className={`flex-shrink-0 px-6 py-3 rounded-2xl border transition-all duration-500 ${selectedZone.id === zone.id ? 'glass-card border-[#81d4d8]/50 bg-[#81d4d8]/10 text-[#81d4d8] scale-105 shadow-xl' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest italic">{zone.name}</span>
              </button>
            ))}
          </div>

          <div className="glass-card rounded-[40px] p-8 border-white/10 space-y-8 animate-content-entrance delay-700">
            <div className="flex justify-between items-start">
              <div><h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedZone.name}</h2><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3">{selectedZone.region} Region • Jurisidiction</p></div>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedZone.status === 'CRITIQUE' ? 'border-error/30 bg-error/10 text-error' : 'border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]'}`}>{selectedZone.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
              <div className="bg-[#00132d]/40 p-6 space-y-1"><p className="text-[9px] font-black text-slate-500 uppercase">Priorité</p><p className="text-4xl font-black text-white italic">{selectedZone.priority}<span className="text-base font-normal text-slate-600">/10</span></p></div>
              <div className="bg-[#00132d]/40 p-6 space-y-1 text-right"><p className="text-[9px] font-black text-slate-500 uppercase">NDVI</p><p className="text-4xl font-black text-[#81d4d8] italic">{selectedZone.ndvi}</p></div>
            </div>

            <button id="planting-btn" onClick={handlePlantingAction} disabled={isPlanting} className="w-full py-6 rounded-[32px] bg-[#81d4d8] text-[#00132d] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 group">
              {isPlanting ? <div className="h-5 w-5 border-2 border-t-black rounded-full animate-spin" /> : <><span className="material-symbols-outlined group-hover:rotate-12 transition-transform">potted_plant</span>ENREGISTRER ACTION</>}
            </button>
          </div>

          <div id="impact-section" className="glass-card rounded-[40px] p-8 border-white/5 space-y-8 animate-content-entrance" style={{ animationDelay: '900ms' }}>
            <div className="flex justify-between items-center"><div><h3 className="text-lg font-black text-white italic uppercase tracking-tighter leading-none text-editorial">Suivi Impact</h3><p className="text-[9px] font-bold text-slate-500 uppercase mt-1">PM2.5 Trend</p></div><span className="material-symbols-outlined text-[#81d4d8] animate-pulse">show_chart</span></div>
            <div className="flex h-32 items-end justify-between gap-2 px-2 mt-4">
              {impactData.map((height, index) => (
                <div key={index} className={`w-full rounded-t-xl transition-all duration-1000 ${index >= impactData.length - 2 && showSuccess ? 'bg-[#14A44D] shadow-[0_0_15px_rgba(20,164,77,0.4)]' : 'bg-[#81d4d8]/10'}`} style={{ height }} />
              ))}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default AssociationDashboard;
