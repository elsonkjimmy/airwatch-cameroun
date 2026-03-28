import React from 'react';
import useStore from '../store/useStore';

const PROFILES = [
  { id: 'parent', label: "Parent avec enfants", icon: "family_restroom", color: "text-[#14A44D]" },
  { id: 'sportif', label: "Sportif / Joggeur", icon: "directions_run", color: "text-[#0d7377]" },
  { id: 'asthmatique', label: "Personne asthmatique", icon: "pulmonology", color: "text-[#EAB308]" },
  { id: 'agriculteur', label: "Agriculteur", icon: "agriculture", color: "text-[#F97316]" },
  { id: 'travailleur', label: "Travailleur en plein air", icon: "construction", color: "text-[#DC2626]" },
];

const Onboarding = () => {
  const setProfileType = useStore((state) => state.setProfileType);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-[#81d4d8]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 glass-card rounded-3xl flex items-center justify-center mx-auto mb-6 border-white/20 animate-pulse">
             <span className="material-symbols-outlined text-4xl text-[#81d4d8]">eco</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-tight italic uppercase">
            AirWatch <br/> <span className="text-[#81d4d8] opacity-80">Guardian</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest opacity-60">
            Personnalisez votre expérience
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#81d4d8] text-center mb-8">
            Quel est votre profil ?
          </p>
          
          <div className="grid grid-cols-1 gap-4">
            {PROFILES.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setProfileType(prof.id)}
                className="group w-full flex items-center gap-6 p-5 glass-card rounded-[24px] border-white/5 hover:border-[#81d4d8]/30 hover:bg-white/10 transition-all active:scale-[0.98] text-left"
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl glass-card flex items-center justify-center border-white/10 ${prof.color} group-hover:scale-110 transition-all duration-500 shadow-xl`}>
                  <span className="material-symbols-outlined text-3xl">
                    {prof.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-black text-base leading-none uppercase italic tracking-tight">
                    {prof.label}
                  </h3>
                </div>
                <span className="material-symbols-outlined text-slate-500 text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 text-center">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em] opacity-40 italic">
            Protégez votre santé au Cameroun
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
