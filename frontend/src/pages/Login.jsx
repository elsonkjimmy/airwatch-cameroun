import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const { setRole, setUser, setAuthenticated, setProfileType } = useStore();
  
  const [selectedPortail, setSelectedPortail] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roles = [
    { id: 'citoyen', label: 'Citoyen', icon: 'person', desc: 'Accès libre • Immédiat', color: 'text-white', glow: 'hover:shadow-[0_0_50px_rgba(255,255,255,0.1)]' },
    { id: 'association', label: 'Association', icon: 'groups', desc: 'ONG • Reforestation', color: 'text-[#81d4d8]', glow: 'hover:shadow-[0_0_50px_rgba(129,212,216,0.2)]' },
    { id: 'gouvernement', label: 'Institution', icon: 'account_balance', desc: 'État • National', color: 'text-[#F97316]', glow: 'hover:shadow-[0_0_50px_rgba(249,115,22,0.2)]' },
  ];

  const handleCitoyenAccess = () => {
    setRole('citoyen');
    setAuthenticated(false);
    setProfileType('parent'); 
    navigate('/citoyen');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!supabase) throw new Error("Supabase non configuré.");
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      const { data: profile, error: profileError } = await supabase.from('users').select('role, ville').eq('id', data.user.id).single();
      if (profileError || profile.role !== selectedPortail) { await supabase.auth.signOut(); throw new Error(`Accès refusé au portail ${selectedPortail}.`); }
      setUser(data.user); setRole(profile.role); useStore.setState({ assignedZone: profile.ville }); setAuthenticated(true); navigate(`/${profile.role}`);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden bg-[#00132d]">
      
      {/* ATMOSPHERIC BACKGROUND */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-radial-gradient from-[#81d4d8]/10 to-transparent blur-[150px] pointer-events-none" />

      <div className={`w-full relative z-10 animate-in fade-in zoom-in-95 duration-1000 ${selectedPortail ? 'max-w-md' : 'max-w-6xl'}`}>
        
        {/* LOGO SECTION */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center h-16 w-16 glass-card rounded-[24px] border-white/20 mb-4 lg:h-24 lg:w-24 lg:rounded-[32px]">
            <span className="material-symbols-outlined text-3xl text-[#81d4d8] lg:text-5xl">air</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none lg:text-7xl">AirWatch</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] opacity-60 italic lg:text-xs">Cameroun • Atmospheric Guardian</p>
          </div>
        </div>

        {!selectedPortail ? (
          <div className="space-y-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#81d4d8]/50 to-transparent" />
              <p className="text-white text-[11px] font-black uppercase tracking-[0.3em] opacity-80 italic">Choisissez votre accès</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => role.id === 'citoyen' ? handleCitoyenAccess() : setSelectedPortail(role.id)}
                  className={`group w-full flex flex-row lg:flex-col items-center gap-6 p-6 lg:p-12 glass-card rounded-[32px] lg:rounded-[48px] border-white/5 hover:border-[#81d4d8]/30 hover:bg-white/[0.05] transition-all duration-500 active:scale-[0.98] ${role.glow} text-left lg:text-center`}
                >
                  {/* ICON : GAUCHE SUR MOBILE / HAUT SUR PC */}
                  <div className={`flex-shrink-0 w-14 h-14 lg:w-24 lg:h-24 rounded-2xl lg:rounded-[32px] glass-card flex items-center justify-center border-white/10 ${role.color} group-hover:scale-110 transition-all duration-700 shadow-2xl`}>
                    <span className="material-symbols-outlined text-3xl lg:text-6xl">
                      {role.icon}
                    </span>
                  </div>
                  
                  {/* TEXT : DROITE SUR MOBILE / BAS SUR PC */}
                  <div className="flex-1 lg:space-y-3">
                    <h3 className="text-white font-black text-lg lg:text-3xl uppercase italic tracking-tighter group-hover:text-[#81d4d8] transition-colors">
                      {role.label}
                    </h3>
                    <p className="text-slate-500 text-[10px] lg:text-[11px] font-black uppercase tracking-widest lg:tracking-[0.2em] leading-tight opacity-80 italic lg:max-w-[180px] lg:mx-auto">
                      {role.desc}
                    </p>
                  </div>

                  {/* INDICATOR : SEULEMENT MOBILE (Flèche) / PC (Bouton Entrer) */}
                  <span className="material-symbols-outlined text-slate-600 lg:hidden group-hover:text-white transition-all">chevron_right</span>
                  <div className="hidden lg:flex mt-8 items-center gap-2 text-[#81d4d8] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="text-[10px] font-black uppercase tracking-widest">Entrer</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* LOGIN FORM (Même style) */
          <div className="glass-card rounded-[44px] p-10 lg:p-14 border-white/10 space-y-10 relative overflow-hidden animate-in zoom-in-95 duration-500 mx-auto">
            <div className="flex items-center gap-6">
              <button type="button" onClick={() => setSelectedPortail(null)} className="h-12 w-12 lg:h-14 lg:w-14 glass-button rounded-2xl flex items-center justify-center border-white/10 hover:bg-white/10 transition-all">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h2 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tighter">{selectedPortail}</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic">Espace Authentifié</p>
              </div>
            </div>
            {error && <div className="p-5 rounded-3xl bg-error/10 border border-error/20 text-error text-[10px] font-black uppercase text-center animate-shake">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Identifiant</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white focus:outline-none focus:border-[#81d4d8]/50 focus:bg-white/10 transition-all font-bold placeholder:text-slate-500" placeholder="nom@airwatch.cm" /></div>
              <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 ml-4">Code Secret</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-3xl px-8 py-5 text-sm text-white focus:outline-none focus:border-[#81d4d8]/50 focus:bg-white/10 transition-all font-bold placeholder:text-slate-500" placeholder="••••••••" /></div>
              <button type="submit" disabled={loading} className="w-full py-6 lg:py-7 rounded-[32px] bg-[#81d4d8] text-[#00132d] font-black uppercase tracking-[0.4em] text-[12px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4">{loading ? <div className="h-5 w-5 border-2 border-[#00132d]/30 border-t-[#00132d] rounded-full animate-spin" /> : <>Ouvrir la session <span className="material-symbols-outlined text-sm">login</span></>}</button>
            </form>
          </div>
        )}

        <div className="pt-16 text-center">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.6em] opacity-40 italic">Hackathon IndabaX Cameroun 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
