import React, { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';

const CAMEROON_CITIES = [
  { id: 'maroua', name: 'Maroua', region: 'Extrême-Nord', baseAqi: 162, lat: 10.5912, lon: 14.3155 },
  { id: 'yaounde', name: 'Yaoundé', region: 'Centre', baseAqi: 92, lat: 3.8480, lon: 11.5192 },
  { id: 'douala', name: 'Douala', region: 'Littoral', baseAqi: 145, lat: 4.0511, lon: 9.7679 },
  { id: 'garoua', name: 'Garoua', region: 'Nord', baseAqi: 110, lat: 9.3019, lon: 13.3977 },
  { id: 'bamenda', name: 'Bamenda', region: 'Nord-Ouest', baseAqi: 75, lat: 5.9631, lon: 10.1591 },
  { id: 'bafoussam', name: 'Bafoussam', region: 'Ouest', baseAqi: 105, lat: 5.4777, lon: 10.4176 },
  { id: 'ngaoundere', name: 'Ngaoundéré', region: 'Adamaoua', baseAqi: 85, lat: 7.3277, lon: 13.5847 },
  { id: 'kribi', name: 'Kribi', region: 'Sud', baseAqi: 40, lat: 2.9506, lon: 9.9077 },
  { id: 'limbe', name: 'Limbé', region: 'Sud-Ouest', baseAqi: 55, lat: 4.0131, lon: 9.2203 },
];

const PROFILES = {
  parent: { id: 'parent', label: "Parent", icon: "family_restroom", advice: { good: { icon: 'check_circle', color: 'text-[#14A44D]', text: "L'air est pur, profitez de l'extérieur avec vos enfants." }, moderate: { icon: 'info', color: 'text-[#EAB308]', text: "Qualité acceptable, soyez attentifs si vos enfants sont sensibles." }, orange: { icon: 'warning', color: 'text-[#F97316]', text: "Limitez le temps dehors des enfants après l'école" }, red: { icon: 'error', color: 'text-[#DC2626]', text: "Gardez les enfants à la maison, fermez les fenêtres" } } },
  sportif: { id: 'sportif', label: "Sportif", icon: "directions_run", advice: { good: { icon: 'check_circle', color: 'text-[#14A44D]', text: "Conditions idéales pour votre entraînement en extérieur." }, moderate: { icon: 'info', color: 'text-[#EAB308]', text: "Bon pour le sport, mais évitez les zones à fort trafic." }, orange: { icon: 'warning', color: 'text-[#F97316]', text: "Préférez un sport en salle aujourd'hui" }, red: { icon: 'error', color: 'text-[#DC2626]', text: "Annulez votre séance — risque respiratoire élevé" } } },
  asthmatique: { id: 'asthmatique', label: "Asthmatique", icon: "pulmonology", advice: { good: { icon: 'check_circle', color: 'text-[#14A44D]', text: "Bonne qualité d'air, respirez tranquillement." }, moderate: { icon: 'info', color: 'text-[#EAB308]', text: "Gardez votre traitement habituel à proximité par précaution." }, orange: { icon: 'warning', color: 'text-[#F97316]', text: "Ayez votre inhalateur à portée de main" }, red: { icon: 'error', color: 'text-[#DC2626]', text: "Restez à l'intérieur, prenez votre traitement préventif" } } },
  agriculteur: { id: 'agriculteur', label: "Agriculteur", icon: "agriculture", advice: { good: { icon: 'check_circle', color: 'text-[#14A44D]', text: "Excellentes conditions pour le travail aux champs." }, moderate: { icon: 'info', color: 'text-[#EAB308]', text: "Conditions normales, restez hydraté." }, orange: { icon: 'warning', color: 'text-[#F97316]', text: "Évitez de brûler des résidus cette semaine" }, red: { icon: 'error', color: 'text-[#DC2626]', text: "Suspendez tout brûlage — risque d'aggravation critique" } } },
  travailleur: { id: 'travailleur', label: "Travailleur", icon: "construction", advice: { good: { icon: 'check_circle', color: 'text-[#14A44D]', text: "Conditions de travail en extérieur optimales." }, moderate: { icon: 'info', color: 'text-[#EAB308]', text: "Faites des pauses régulières à l'ombre." }, orange: { icon: 'warning', color: 'text-[#F97316]', text: "Portez un masque si vous travaillez dehors" }, red: { icon: 'error', color: 'text-[#DC2626]', text: "Demandez à votre employeur une protection ou un arrêt" } } }
};

const getAqiStatus = (aqi) => {
  if (aqi <= 50) return { level: 'good', color: '#14A44D', rgb: '20, 164, 77', label: 'PUR', desc: 'Air excellent', glow: 'shadow-[0_0_50px_rgba(20,164,77,0.3)]' };
  if (aqi <= 100) return { level: 'moderate', color: '#EAB308', rgb: '234, 179, 8', label: 'MODÉRÉ', desc: 'Acceptable', glow: 'shadow-[0_0_60px_rgba(234,179,8,0.25)]' };
  if (aqi <= 150) return { level: 'orange', color: '#F97316', rgb: '249, 115, 22', label: 'MAUVAIS', desc: 'Sensibles à risque', glow: 'shadow-[0_0_70px_rgba(249,115,22,0.3)]', isPulsing: true };
  return { level: 'red', color: '#DC2626', rgb: '220, 38, 38', label: 'CRITIQUE', desc: 'Danger immédiat', glow: 'shadow-[0_0_100px_rgba(220,38,38,0.4)]', isPulsing: true, isCritical: true };
};

// Fonction stable pour générer la semaine
const getWeekWindow = () => {
  const days = [];
  const daysName = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const today = new Date();
  
  for (let i = -2; i <= 4; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ 
      index: i + 2, 
      dayName: i === 0 ? "Auj." : i === -1 ? "Hier" : i === -2 ? "Av-h." : daysName[d.getDay()], 
      dateNum: d.getDate() 
    });
  }
  return days;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
};

function CitoyenDashboard() {
  const { 
    currentAQI, currentVille, profileType, setProfileType, setCurrentVille, setCurrentAQI,
    showCityPicker, setShowCityPicker, showProfilePicker, setShowProfilePicker,
    showReportingModal, setShowReportingModal
  } = useStore();
  
  const [selectedDayIndex, setSelectedDayIndex] = useState(2);
  const [isDetecting, setIsDetecting] = useState(false);
  const scrollRef = useRef(null);
  const days = getWeekWindow();

  // Détection manuelle et auto
  const detectLocation = () => {
    if (!("geolocation" in navigator)) return;
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      let closestCity = CAMEROON_CITIES[0];
      let minDistance = calculateDistance(latitude, longitude, closestCity.lat, closestCity.lon);

      CAMEROON_CITIES.forEach(city => {
        const dist = calculateDistance(latitude, longitude, city.lat, city.lon);
        if (dist < minDistance) {
          minDistance = dist;
          closestCity = city;
        }
      });

      setCurrentVille(closestCity.name);
      setCurrentAQI(closestCity.baseAqi);
      setIsDetecting(false);
    }, () => setIsDetecting(false));
  };

  useEffect(() => {
    // On ne détecte auto que si aucune ville n'est définie (premier lancement)
    if (!currentVille || currentVille === 'Maroua') {
      detectLocation();
    }
    // Centrage immédiat
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current.children[2]?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }, 50);
    }
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const itemWidth = 84; 
    const newIndex = Math.round(scrollLeft / itemWidth);
    const clampedIndex = Math.max(0, Math.min(days.length - 1, newIndex));
    if (clampedIndex !== selectedDayIndex) {
      setSelectedDayIndex(clampedIndex);
    }
  };

  const displayAQI = Math.round(currentAQI * [0.7, 0.9, 1, 0.85, 1.2, 0.95, 1.1][selectedDayIndex]);
  const status = getAqiStatus(displayAQI);
  const currentProfile = PROFILES[profileType] || PROFILES.parent;
  const adviceItems = [{ ...currentProfile.advice[status.level], isMain: true }];

  return (
    <div className="relative min-h-screen pt-20 px-4 select-none">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full h-[500px] blur-[120px] opacity-20 pointer-events-none transition-all duration-1000" style={{ background: `radial-gradient(circle, ${status.color} 0%, transparent 70%)` }} />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[60] h-20 flex items-center justify-between px-6 bg-gradient-to-b from-[#00132d] to-transparent pointer-events-none">
        <button onClick={() => setShowCityPicker(true)} className="flex flex-col pointer-events-auto text-left group">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className={`material-symbols-outlined text-[14px] ${isDetecting ? 'animate-spin' : ''}`}>location_on</span>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{isDetecting ? 'Localisation...' : 'Cameroun • Live'}</span>
            <span className="material-symbols-outlined text-[12px]">expand_more</span>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-[#81d4d8] leading-none mt-1 uppercase italic">{currentVille}</h1>
        </button>
        <button onClick={() => setShowProfilePicker(true)} className="h-10 w-10 glass-button rounded-full flex items-center justify-center pointer-events-auto">
          <span className="material-symbols-outlined text-sm">{currentProfile.icon}</span>
        </button>
      </header>

      {/* CORE CONTENT */}
      <main className="max-w-[450px] mx-auto space-y-12 pb-32 relative z-10">
        <section className="flex flex-col items-center justify-center py-6">
          <div className="relative">
            <div className={`absolute inset-0 rounded-full border border-white/5 scale-125 transition-all duration-1000 ${status.isPulsing ? 'animate-pulse' : ''}`} />
            <div className={`aqi-sphere h-72 w-72 rounded-full flex flex-col items-center justify-center border border-white/10 ${status.glow} ${status.isCritical ? 'aqi-pulse-red' : ''}`} style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at center, rgba(${status.rgb}, 0.2) 0%, transparent 70%)`, boxShadow: `inset 0 0 40px rgba(${status.rgb}, 0.2)` }}>
              <div className="flex flex-col items-center text-center"><span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-1">Atmospheric Index</span><span className="text-[100px] font-black tracking-tighter text-white leading-none transition-all duration-500">{displayAQI}</span><div className="mt-4 px-6 py-1.5 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-2" style={{ backgroundColor: `rgba(${status.rgb}, 0.1)` }}><div className={`h-1.5 w-1.5 rounded-full ${status.isPulsing ? 'animate-ping' : ''}`} style={{ backgroundColor: status.color }} /><span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: status.color }}>{status.label}</span></div></div>
            </div>
          </div>
          <p className="mt-12 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60 text-center italic max-w-[200px]">"{status.desc}"</p>
        </section>

        {/* SÉLECTEUR DE JOUR : TAILLE RÉDUITE + CLIC ACTIVÉ */}
        <section className="space-y-2 relative overflow-hidden py-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60 ml-6">Historique & Prévisions</h2>
          
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory px-[calc(50%-40px)] scroll-smooth pointer-events-auto py-6"
          >
            {days.map((day) => {
              const isSelected = selectedDayIndex === day.index;
              
              return (
                <div
                  key={day.index}
                  onClick={() => {
                    setSelectedDayIndex(day.index);
                    scrollRef.current.children[day.index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }}
                  className={`flex-shrink-0 w-20 h-24 flex items-center justify-center snap-center transition-all duration-500 cursor-pointer ${
                    isSelected ? 'scale-125 z-20' : 'scale-90 z-10'
                  }`}
                >
                  <div className={`w-16 h-20 rounded-[24px] flex flex-col items-center justify-center border transition-all duration-500 ${
                    isSelected ? 'glass-card border-[#81d4d8]/50 bg-[#81d4d8]/20 text-[#81d4d8] shadow-2xl' : 'border-white/5 bg-white/5 text-slate-500 opacity-40 hover:opacity-100 hover:border-white/20'
                  }`}>
                    <span className="text-[9px] font-black uppercase tracking-widest">{day.dayName}</span>
                    <span className="text-xl font-black italic mt-1">{day.dateNum}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#00132d] to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#00132d] to-transparent pointer-events-none z-10" />
        </section>

        {/* CONSEILS */}
        <section className="space-y-6 px-4 pb-10">
          <div className="flex items-center justify-between"><h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60">Atmospheric Advice</h2><div className="px-4 py-1.5 glass-card rounded-full text-[9px] font-black uppercase text-[#81d4d8] italic tracking-widest border-white/10">{currentProfile.label}</div></div>
          <div className="glass-card rounded-[40px] p-10 space-y-10 relative overflow-hidden group border-white/10">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-all duration-1000"><span className="material-symbols-outlined text-9xl">{currentProfile.icon}</span></div>
            <div className="flex flex-col gap-10 relative z-10">
              {adviceItems.map((item, idx) => (
                <div className="flex items-start gap-8" key={idx}>
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/10 shadow-xl"><span className={`material-symbols-outlined text-3xl ${item.color} filled`}>{item.icon}</span></div>
                  <div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#81d4d8] opacity-80">Action Prioritaire</p><p className="text-[15px] leading-relaxed font-bold text-white italic">{item.text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* MODALS PERSISTANTS (CITY, PROFILE, SIGNALEMENT) */}
      {showCityPicker && <CityPickerModal />}
      {showProfilePicker && <ProfilePickerModal />}
      {showReportingModal && <ReportingModal />}
    </div>
  );
}

// Sous-composants Modals
const CityPickerModal = () => {
  const { currentVille, setCurrentVille, setCurrentAQI, setShowCityPicker } = useStore();
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 backdrop-blur-2xl bg-[#00132d]/60">
      <div className="w-full max-w-[350px] glass-card rounded-[40px] p-8 space-y-6 animate-in zoom-in duration-300 border-white/10 pointer-events-auto">
        <div className="flex justify-between items-center"><h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Villes</h3><button onClick={() => setShowCityPicker(false)} className="h-10 w-10 glass-button rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button></div>
        <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-2">
          {CAMEROON_CITIES.map((city) => (
            <button key={city.id} onClick={() => { setCurrentVille(city.name); setCurrentAQI(city.baseAqi); setShowCityPicker(false); }} className={`w-full p-5 rounded-3xl flex items-center justify-between transition-all ${currentVille === city.name ? 'bg-[#81d4d8]/20 border border-[#81d4d8]/30' : 'bg-white/5 border border-white/5'}`}>
              <div><p className="text-sm font-black text-white uppercase italic">{city.name}</p><p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{city.region}</p></div>
              {currentVille === city.name && <span className="material-symbols-outlined text-[#81d4d8]">check_circle</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfilePickerModal = () => {
  const { profileType, setProfileType, setShowProfilePicker } = useStore();
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 backdrop-blur-2xl bg-[#00132d]/60">
      <div className="w-full max-w-[350px] glass-card rounded-[40px] p-8 space-y-6 animate-in zoom-in duration-300 border-white/10 pointer-events-auto">
        <div className="flex justify-between items-center"><h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Mon Profil</h3><button onClick={() => setShowProfilePicker(false)} className="h-10 w-10 glass-button rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button></div>
        <div className="space-y-3">
          {Object.values(PROFILES).map((prof) => (
            <button key={prof.id} onClick={() => setProfileType(prof.id)} className={`w-full p-5 rounded-3xl flex items-center gap-5 transition-all ${profileType === prof.id ? 'bg-[#81d4d8]/20 border border-[#81d4d8]/30' : 'bg-white/5 border border-white/5'}`}>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${profileType === prof.id ? 'bg-[#81d4d8] text-[#00132d]' : 'bg-white/10 text-white'}`}><span className="material-symbols-outlined">{prof.icon}</span></div>
              <span className="text-sm font-black text-white uppercase italic tracking-tight">{prof.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ReportingModal = () => {
  const { currentVille, currentAQI, setShowReportingModal } = useStore();
  const [isReporting, setIsReporting] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const handleReport = () => { setIsReporting(true); setTimeout(() => { setReportResult({ aqi: currentAQI + 15, type_pollution: "Fumée de combustion", timestamp: "À l'instant" }); setIsReporting(false); }, 2000); };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-6 backdrop-blur-2xl bg-[#00132d]/40">
      <div className="w-full max-w-[350px] glass-card rounded-[40px] p-10 space-y-8 animate-in zoom-in duration-300 border-white/10 pointer-events-auto">
        {!reportResult && !isReporting ? (
          <div className="text-center space-y-8">
            <div className="h-24 w-24 bg-[#81d4d8]/10 rounded-[32px] flex items-center justify-center mx-auto border border-[#81d4d8]/20 animate-pulse"><span className="material-symbols-outlined text-5xl text-[#81d4d8]">campaign</span></div>
            <div className="space-y-2"><h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Signaler ?</h3><p className="text-xs text-slate-400 font-medium px-4">Votre position GPS sera analysée.</p></div>
            <div className="flex gap-4"><button onClick={() => setShowReportingModal(false)} className="flex-1 py-5 glass-button rounded-3xl text-[10px] font-black uppercase">Annuler</button><button onClick={handleReport} className="flex-1 py-5 bg-[#81d4d8] text-[#00132d] rounded-3xl text-[10px] font-black uppercase shadow-lg">Confirmer</button></div>
          </div>
        ) : isReporting ? (
          <div className="flex flex-col items-center py-12 space-y-10">
            <div className="relative"><div className="h-32 w-32 rounded-full border border-dashed border-[#81d4d8]/40 animate-spin" /><span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-5xl text-[#81d4d8]">radar</span></div>
            <h3 className="text-xl font-black text-white italic uppercase">Analyse IA...</h3>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Rapport IA</h3><button onClick={() => { setReportResult(null); setShowReportingModal(false); }} className="h-10 w-10 glass-button rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button></div>
            <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[32px] border border-white/5">
              <div className="h-20 w-20 glass-card rounded-2xl flex flex-col items-center justify-center border-white/10"><span className="text-[10px] font-black text-slate-500 uppercase">AQI</span><span className="text-3xl font-black text-white italic">{reportResult.aqi}</span></div>
              <div className="flex-1"><p className="text-sm font-black text-white uppercase italic leading-tight mb-1">{reportResult.type_pollution}</p><p className="text-[10px] text-slate-500 font-bold uppercase italic">{reportResult.timestamp}</p></div>
            </div>
            <button onClick={() => { setReportResult(null); setShowReportingModal(false); }} className="w-full py-5 bg-[#81d4d8] text-[#00132d] rounded-[28px] text-[11px] font-black uppercase shadow-xl">Terminer</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitoyenDashboard;
