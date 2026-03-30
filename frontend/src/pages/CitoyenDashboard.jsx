import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useStore from '../store/useStore';

const CAMEROON_CITIES = [
  { id: 'maroua', name: 'Maroua', region: 'Extrême-Nord', baseAqi: 162, lat: 10.5912, lon: 14.3155 },
  { id: 'yaounde', name: 'Yaoundé', region: 'Centre', baseAqi: 92, lat: 3.8480, lon: 11.5192 },
  { id: 'douala', name: 'Douala', region: 'Littoral', baseAqi: 145, lat: 4.0511, lon: 9.7679 },
  { id: 'garoua', name: 'Garoua', region: 'Nord', baseAqi: 110, lat: 9.3019, lon: 13.3977 },
];

const PROFILES = {
  parent: { id: 'parent', label: "Parent", icon: "family_restroom", advice: { good: "Air pur. Vos enfants peuvent jouer dehors.", moderate: "Air correct. Surveillez les plus fragiles.", orange: "Pollution. Évitez les jeux extérieurs.", red: "DANGER. Gardez les enfants à l'intérieur." } },
  sportif: { id: 'sportif', label: "Sportif", icon: "directions_run", advice: { good: "Conditions parfaites pour s'entraîner.", moderate: "Air moyen. Évitez les grands axes.", orange: "Pollution. Préférez le sport en salle.", red: "ALERTE. Aucun effort physique intense." } },
  asthmatique: { id: 'asthmatique', label: "Sensible", icon: "pulmonology", advice: { good: "Respiration facile. Profitez.", moderate: "Vigilance avec votre traitement.", orange: "Difficultés possibles. Inhalateur requis.", red: "URGENCE. Restez au calme absolu." } },
  autre: { id: 'autre', label: "Standard", icon: "diversity_3", advice: { good: "Journée idéale pour tout le monde.", moderate: "Qualité acceptable pour tous.", orange: "Pollution modérée. Sorties brèves.", red: "Santé menacée. Portez un masque." } }
};

const getAqiConfig = (aqi) => {
  if (aqi <= 50) return { level: 'good', color: '#14A44D', label: 'EXCELLENT', msg: 'Respirez librement', action: 'Sortie conseillée' };
  if (aqi <= 100) return { level: 'moderate', color: '#EAB308', label: 'MODÉRÉ', msg: 'Air un peu chargé', action: 'Prudence modérée' };
  if (aqi <= 150) return { level: 'orange', color: '#F97316', label: 'ALERTE', msg: 'Qualité mauvaise', action: 'Portez un masque' };
  return { level: 'red', color: '#DC2626', label: 'CRITIQUE', msg: 'DANGER SANTÉ', action: 'RESTEZ À L\'INTÉRIEUR', isPulsing: true };
};

const getWeekWindow = () => {
  const days = [];
  const daysName = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const today = new Date();
  for (let i = -2; i <= 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ index: i + 2, dayName: i === 0 ? "Auj." : i === -1 ? "Hier" : i === -2 ? "Av-h." : daysName[d.getDay()], dateNum: d.getDate() });
  }
  return days;
};

const HOURLY_MOCK_DATA = [{ time: '00h', aqi: 85 }, { time: '06h', aqi: 165 }, { time: '12h', aqi: 140 }, { time: '18h', aqi: 95 }, { time: '23h', aqi: 80 }];

function CitoyenDashboard() {
  const { currentAQI, currentVille, profileType, setProfileType, setCurrentVille, setCurrentAQI, showCityPicker, setShowCityPicker, showProfilePicker, setShowProfilePicker, showReportingModal, setShowReportingModal } = useStore();
  const [selectedDayIndex, setSelectedDayIndex] = useState(2);
  const scrollRef = useRef(null);
  const days = getWeekWindow();

  const displayAQI = Math.round(currentAQI * [0.7, 0.9, 1, 0.85, 1.2, 0.95, 1.1][selectedDayIndex]);
  const status = getAqiConfig(displayAQI);
  const currentAdvice = PROFILES[profileType]?.advice[status.level] || PROFILES.autre.advice[status.level];

  const pollutants = [
    { name: 'PM2.5', val: Math.round(displayAQI * 0.6), unit: 'µg/m³', status: status.level === 'red' ? 'DANGER' : 'SAIN' },
    { name: 'NO₂', val: 12.4, unit: 'ppb', status: 'SAIN' },
    { name: 'CO₂', val: 412, unit: 'ppm', status: 'SAIN' },
  ];

  return (
    <div className="relative min-h-screen bg-[#0A2342] text-slate-50 select-none lg:flex lg:justify-center animate-page-reveal overflow-x-hidden">
      
      <style>{`
        * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
        *::-webkit-scrollbar { display: none !important; }
        @keyframes wave { 0% { transform: translateX(-50%) skewY(-5deg); } 50% { transform: translateX(-30%) skewY(5deg); } 100% { transform: translateX(-50%) skewY(-5deg); } }
        .liquid-wave { animation: wave 10s infinite linear; opacity: 0.2; }
      `}</style>

      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full h-[500px] blur-[120px] opacity-20 pointer-events-none transition-all duration-1000" style={{ background: `radial-gradient(circle, ${status.color} 0%, transparent 70%)` }} />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[60] h-20 px-6 flex items-center justify-between glass-panel lg:px-12 animate-content-entrance">
        <button onClick={() => setShowCityPicker(true)} className="flex flex-col text-left group">
          <p className="text-[10px] font-bold text-teal-vif tracking-widest uppercase leading-none">AirWatch Cameroun</p>
          <h1 className="text-xl font-bold flex items-center gap-2 lg:text-2xl mt-1">{currentVille} <span className="material-symbols-outlined text-sm">expand_more</span></h1>
        </button>
        <button onClick={() => setShowProfilePicker(true)} className="h-12 w-12 glass-button rounded-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-90 shadow-xl border-white/20">
          <span className="material-symbols-outlined text-teal-vif text-2xl">{PROFILES[profileType]?.icon}</span>
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-lg mx-auto pt-28 pb-32 space-y-12 relative z-10 lg:max-w-6xl lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start lg:px-8">
        
        {/* COLONNE GAUCHE (AQI) */}
        <section className="flex flex-col items-center lg:col-span-5 lg:sticky lg:top-32 animate-content-entrance">
          <div className="relative group overflow-visible">
            <svg className="absolute inset-0 w-full h-full -rotate-90 scale-[1.15]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="1" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={status.color} strokeWidth="3" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * Math.min(displayAQI, 300)) / 300} strokeLinecap="round" className="transition-all duration-1000 ease-out opacity-40" />
            </svg>
            <div 
              className={`h-72 w-72 lg:h-96 lg:w-96 rounded-full border-4 border-white/5 flex flex-col items-center justify-center relative shadow-2xl transition-all duration-700 overflow-hidden ${status.isPulsing ? 'aqi-pulse-red' : ''}`}
              style={{ backgroundColor: `${status.color}11`, borderColor: `${status.color}22` }}
            >
              <div className="absolute inset-0 pointer-events-none"><div className="liquid-wave absolute bottom-0 left-0 w-[200%] h-full transition-all duration-1000" style={{ backgroundColor: status.color, transform: `translateY(${100 - (displayAQI / 300) * 100}%)`, borderRadius: '40% 45% 42% 38%' }} /></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-[10px] font-black uppercase text-white/30 mb-2 tracking-[0.3em]">Indice Qualité Air</span>
                <span className="text-[110px] lg:text-[150px] font-bold tracking-tighter text-white leading-none drop-shadow-xl">{displayAQI}</span>
                <div className="mt-4 px-6 py-2 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl" style={{ backgroundColor: status.color }}><span className="text-xs font-black uppercase text-[#001a3d]">{status.msg}</span></div>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center space-y-4 w-full px-4">
            <div className="glass-card rounded-[32px] p-8 border-t-4 shadow-2xl" style={{ borderTopColor: status.color }}>
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 italic">Recommandation</h3>
              <p className="text-xl font-bold italic uppercase text-white tracking-tight leading-tight">{status.action}</p>
              <p className="text-sm text-slate-400 font-medium mt-4 leading-relaxed italic opacity-80">"{currentAdvice}"</p>
            </div>
          </div>
        </section>

        {/* COLONNE DROITE */}
        <div className="lg:col-span-7 space-y-16 animate-content-entrance delay-200">
          
          {/* SÉLECTEUR DE JOUR */}
          <section className="space-y-4 relative">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60 ml-6">Historique & Prévisions</h2>
            <div className="relative px-2 py-6 overflow-visible">
              <div ref={scrollRef} className="flex items-center gap-4 overflow-x-auto overflow-y-visible no-scrollbar snap-x snap-mandatory px-10 py-6 lg:px-4 lg:justify-start lg:snap-none">
                {days.map((day) => (
                  <button key={day.index} onClick={() => setSelectedDayIndex(day.index)} className={`flex-shrink-0 w-16 h-20 rounded-2xl border transition-all duration-500 snap-center ${selectedDayIndex === day.index ? 'bg-teal-vif text-[#001a3d] font-bold border-transparent scale-150 shadow-[0_15px_40px_rgba(13,115,119,0.6)] z-10 mx-4' : 'bg-white/5 border-white/5 text-slate-500 scale-90 opacity-40'}`}>
                    <span className="text-[9px] block uppercase leading-none">{day.dayName}</span>
                    <span className="text-xl block italic mt-1 font-black">{day.dateNum}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* PARAMÈTRES */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60 ml-6">Analyse des Particules</h2>
            <div className="grid grid-cols-3 gap-3 px-4">
              {pollutants.map((p, i) => (
                <div key={i} className="glass-card p-5 rounded-[28px] text-center space-y-2 border-white/5 hover:bg-white/[0.1] transition-all">
                  <p className="text-[9px] font-black text-slate-500 uppercase">{p.name}</p>
                  <p className="text-2xl font-bold text-white text-technical">{p.val}</p>
                  <p className={`text-[8px] font-black uppercase ${p.status === 'DANGER' ? 'text-error animate-pulse' : 'text-[#14A44D]'}`}>{p.status}</p>
                </div>
              ))}
            </div>
          </section>

          {/* GRAPHIQUE */}
          <section className="space-y-4 px-4 pb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60">Tendance 24h</h2>
            <div className="glass-card rounded-[40px] p-8 h-64 w-full border-white/5 shadow-2xl">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={HOURLY_MOCK_DATA}><defs><linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={status.color} stopOpacity={0.3}/><stop offset="95%" stopColor={status.color} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} /><XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} /><Tooltip contentStyle={{ backgroundColor: '#0A2342', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} /><Area type="monotone" dataKey="aqi" stroke={status.color} strokeWidth={3} fill="url(#colorAqi)" /></AreaChart></ResponsiveContainer>
            </div>
          </section>

        </div>
      </main>

      {/* MODALS */}
      {showCityPicker && <PortalModal title="Villes" onClose={() => setShowCityPicker(false)}><CityPickerContent /></PortalModal>}
      {showProfilePicker && <PortalModal title="Votre Profil" onClose={() => setShowProfilePicker(false)}><ProfilePickerContent /></PortalModal>}
      {showReportingModal && <PortalModal title="Signaler" onClose={() => setShowReportingModal(false)}><ReportingContent /></PortalModal>}
    </div>
  );
}

// PORTAL MODAL (FIXED POSITIONING)
const PortalModal = ({ title, children, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-6 animate-page-reveal">
      <div className="absolute inset-0 bg-[#0A2342]/95 backdrop-blur-2xl" onClick={onClose} />
      <div className="w-full max-w-[380px] glass-card rounded-[48px] p-10 relative z-[10000] shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-white/20 flex flex-col max-h-[85vh]" style={{ overscrollBehavior: 'contain' }}>
        <button onClick={onClose} className="absolute top-8 right-8 h-10 w-10 glass-button rounded-full flex items-center justify-center z-[10001] border-white/10 hover:bg-white/10">
          <span className="material-symbols-outlined text-sm text-white">close</span>
        </button>
        <h3 className="text-2xl font-bold text-white uppercase italic tracking-tighter mb-8 shrink-0">{title}</h3>
        <div className="relative overflow-y-auto no-scrollbar flex-1 pr-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Contenus
const CityPickerContent = () => {
  const { currentVille, setCurrentVille, setCurrentAQI, setShowCityPicker } = useStore();
  return (
    <div className="space-y-3">
      {CAMEROON_CITIES.map((city) => (
        <button key={city.id} onClick={() => { setCurrentVille(city.name); setCurrentAQI(city.baseAqi); setShowCityPicker(false); }} className={`w-full p-5 rounded-[24px] flex items-center justify-between border transition-all ${currentVille === city.name ? 'bg-teal-vif border-transparent text-[#001a3d]' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`}>
          <span className="font-bold uppercase italic text-sm">{city.name}</span>
          {currentVille === city.name && <span className="material-symbols-outlined text-sm">check_circle</span>}
        </button>
      ))}
    </div>
  );
};

const ProfilePickerContent = () => {
  const { profileType, setProfileType, setShowProfilePicker } = useStore();
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.values(PROFILES).map((prof) => (
        <button key={prof.id} onClick={() => { setProfileType(prof.id); setShowProfilePicker(false); }} className={`flex flex-col items-center justify-center p-6 rounded-[32px] border transition-all ${profileType === prof.id ? 'bg-teal-vif border-transparent text-[#001a3d] scale-105 shadow-xl' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'}`}>
          <span className="material-symbols-outlined text-2xl mb-3">{prof.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">{prof.label}</span>
        </button>
      ))}
    </div>
  );
};

const ReportingContent = () => {
  const { setShowReportingModal, currentAQI } = useStore();
  const [isReporting, setIsReporting] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const handleReport = () => { setIsReporting(true); setTimeout(() => { setReportResult({ aqi: currentAQI + 15, type_pollution: "Fumée", timestamp: "À l'instant" }); setIsReporting(false); }, 2000); };
  if (isReporting) return <div className="flex flex-col items-center py-12 space-y-8"><div className="h-24 w-24 rounded-full border-4 border-dashed border-teal-vif animate-spin" /><h3 className="text-xl font-bold text-white uppercase italic">Analyse IA...</h3></div>;
  if (reportResult) return <div className="space-y-8 text-center"><div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-center gap-6 text-left"><div className="h-16 w-16 glass-card rounded-xl flex flex-col justify-center items-center"><span className="text-[10px] font-bold opacity-40">AQI</span><span className="text-2xl font-bold">{reportResult.aqi}</span></div><div className="font-black uppercase italic text-sm">{reportResult.type_pollution}</div></div><button onClick={() => setShowReportingModal(false)} className="w-full py-5 bg-teal-vif text-[#001a3d] rounded-3xl text-[11px] font-bold uppercase shadow-xl shadow-teal-vif/20">Terminer</button></div>;
  return <div className="text-center space-y-8 py-4"><div className="h-20 w-20 bg-teal-vif/10 rounded-full flex items-center justify-center mx-auto border border-teal-vif/20 animate-pulse"><span className="material-symbols-outlined text-4xl text-teal-vif">campaign</span></div><p className="text-xs text-slate-400 font-medium px-4">Souhaitez-vous signaler une pollution ? Votre position GPS sera analysée par l'IA.</p><div className="flex gap-4"><button onClick={() => setShowReportingModal(false)} className="flex-1 py-5 glass-button rounded-3xl text-[10px] font-bold uppercase">Non</button><button onClick={handleReport} className="flex-1 py-5 bg-teal-vif text-[#001a3d] rounded-3xl text-[10px] font-bold uppercase shadow-lg shadow-teal-vif/20">Oui</button></div></div>;
};

export default CitoyenDashboard;
