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
    { id: 'citoyen', label: 'Citoyen', icon: 'person', desc: 'Accès libre • Immédiat', color: 'text-white' },
    { id: 'association', label: 'Association', icon: 'groups', desc: 'ONG • Reforestation', color: 'text-[#81d4d8]' },
    { id: 'gouvernement', label: 'Institution', icon: 'account_balance', desc: 'État • National', color: 'text-[#F97316]' },
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
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || profile.role !== selectedPortail) {
        await supabase.auth.signOut();
        throw new Error(`Accès refusé au portail ${selectedPortail}.`);
      }

      setUser(data.user);
      setRole(profile.role);
      setAuthenticated(true);
      navigate(`/${profile.role}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      
      <div className="w-full max-w-md space-y-12 relative z-10 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-[#81d4d8] uppercase italic leading-none drop-shadow-2xl">
            AirWatch
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-60 italic">
            Cameroun • Atmospheric Guardian
          </p>
        </div>

        {!selectedPortail ? (
          <div className="space-y-4 pt-4">
            <p className="text-white text-center text-[11px] font-black uppercase tracking-[0.2em] mb-8 opacity-80">
              Choisissez votre accès
            </p>
            <div className="grid grid-cols-1 gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => role.id === 'citoyen' ? handleCitoyenAccess() : setSelectedPortail(role.id)}
                  className="group w-full flex items-center gap-6 p-6 glass-card rounded-[28px] border-white/5 hover:border-[#81d4d8]/30 hover:bg-white/10 transition-all duration-500 active:scale-[0.98] text-left"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl glass-card flex items-center justify-center border-white/10 ${role.color} group-hover:scale-110 transition-all duration-500`}>
                    <span className="material-symbols-outlined text-3xl">
                      {role.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-black text-base leading-none uppercase italic tracking-tighter mb-1">
                      {role.label}
                    </h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                      {role.desc}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-[#81d4d8] transition-colors">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-[40px] p-10 border-white/10 space-y-10 relative overflow-hidden animate-in zoom-in-95 duration-500">
            {/* Design elements inside form */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#81d4d8]/10 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-6">
              <button 
                type="button" 
                onClick={() => setSelectedPortail(null)}
                className="h-12 w-12 glass-button rounded-2xl flex items-center justify-center border-white/10"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </button>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{selectedPortail}</h2>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em] mt-1">Espace Authentifié</p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error text-[10px] font-black uppercase tracking-widest text-center italic">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Email Pro</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#81d4d8]/50 focus:bg-white/10 transition-all font-bold placeholder:text-slate-700"
                  placeholder="nom@domaine.cm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Secret</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#81d4d8]/50 focus:bg-white/10 transition-all font-bold placeholder:text-slate-700"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-[24px] bg-[#81d4d8] text-[#00132d] font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_20px_40px_rgba(129,212,216,0.2)] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-[#00132d]/30 border-t-[#00132d] rounded-full animate-spin" />
                ) : (
                  <>Accéder <span className="material-symbols-outlined text-sm">login</span></>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="pt-8 text-center">
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.4em] opacity-30 italic">
            Hackathon IndabaX 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
