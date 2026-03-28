import React from 'react';
import useStore from '../store/useStore';

const PROFILES = [
  { id: 'parent', label: "Parent avec enfants", icon: "family_restroom", color: "text-[#14A44D]", glow: "shadow-[0_0_40px_rgba(20,164,77,0.15)]" },
  { id: 'sportif', label: "Sportif / Joggeur", icon: "directions_run", color: "text-[#0d7377]", glow: "shadow-[0_0_40px_rgba(13,115,119,0.15)]" },
  { id: 'asthmatique', label: "Personne asthmatique", icon: "pulmonology", color: "text-[#EAB308]", glow: "shadow-[0_0_40px_rgba(234,179,8,0.15)]" },
  { id: 'agriculteur', label: "Agriculteur", icon: "agriculture", color: "text-[#F97316]", glow: "shadow-[0_0_40px_rgba(249,115,22,0.15)]" },
  { id: 'travailleur', label: "Travailleur en plein air", icon: "construction", color: "text-[#DC2626]", glow: "shadow-[0_0_40px_rgba(220,38,38,0.15)]" },
  { id: 'autre', label: "Autre Profil", icon: "diversity_3", color: "text-slate-400", glow: "shadow-[0_0_40px_rgba(148,163,184,0.15)]" },
];

const Onboarding = () => {
  const setProfileType = useStore((state) => state.setProfileType);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden bg-[#00132d] animate-page-reveal">
      
      {/* ATMOSPHERIC BACKGROUND LIGHT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-gradient from-[#81d4d8]/10 to-transparent blur-[150px] pointer-events-none" />

      <div className="w-full max-w-6xl space-y-16 relative z-10">
        
        {/* LOGO SECTION */}
        <div className="text-center space-y-6 animate-content-entrance">
          <div className="inline-flex items-center justify-center h-20 w-20 glass-card rounded-[28px] border-white/20 mb-4 animate-pulse lg:h-24 lg:w-24">
            <span className="material-symbols-outlined text-4xl text-[#81d4d8] lg:text-5xl">air</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-2xl lg:text-7xl">
              AirWatch <span className="text-[#81d4d8] opacity-80">Guardian</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.6em] opacity-60 italic lg:text-xs">
              Personnalisez votre expérience de santé
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex flex-col items-center space-y-4 animate-content-entrance delay-200">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#81d4d8]/50 to-transparent" />
            <p className="text-white text-[12px] font-black uppercase tracking-[0.4em] opacity-80 italic">Quel est votre profil ?</p>
          </div>

          {/* GRID ADAPTATIF : LISTE SUR MOBILE / GRILLE SUR PC */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 animate-content-entrance delay-300">
            {PROFILES.map((prof, index) => (
              <button
                key={prof.id}
                onClick={() => setProfileType(prof.id)}
                className={`group flex flex-row lg:flex-col items-center gap-6 p-6 lg:p-12 glass-card rounded-[32px] lg:rounded-[48px] border-white/5 hover:border-[#81d4d8]/30 hover:bg-white/[0.05] transition-all duration-700 active:scale-[0.98] text-left lg:text-center ${prof.glow}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* ICON */}
                <div className={`flex-shrink-0 w-14 h-14 lg:w-24 lg:h-24 rounded-2xl lg:rounded-[32px] glass-card flex items-center justify-center border-white/10 ${prof.color} group-hover:scale-110 transition-all duration-700 shadow-2xl`}>
                  <span className="material-symbols-outlined text-3xl lg:text-6xl">
                    {prof.icon}
                  </span>
                </div>
                
                {/* TEXT */}
                <div className="flex-1 lg:space-y-3">
                  <h3 className="text-white font-black text-lg lg:text-2xl uppercase italic tracking-tighter group-hover:text-[#81d4d8] transition-colors">
                    {prof.label}
                  </h3>
                  <p className="hidden lg:block text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-60 italic">
                    Conseils dédiés
                  </p>
                </div>

                {/* INDICATORS */}
                <span className="material-symbols-outlined text-slate-600 lg:hidden group-hover:text-white transition-all">arrow_forward</span>
                <div className="hidden lg:flex mt-6 items-center gap-2 text-[#81d4d8] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <span className="text-[10px] font-black uppercase tracking-widest">Sélectionner</span>
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-16 text-center animate-content-entrance delay-500">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.6em] opacity-40 italic">
            Protégez votre santé au Cameroun
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
