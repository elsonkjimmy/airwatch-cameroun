import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, Wind } from 'lucide-react';

import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import Dashboard from './pages/Dashboard';
import GovDashboard from './pages/GovDashboard';
import Analyse from './pages/Analyse';
import SecteursAffectes from './pages/SecteursAffectes';
import Comparaison from './pages/Comparaison';
import ClimateExplorer from './pages/ClimateExplorer';

import citiesData from './data/cities.json';

const villesCameroun = citiesData.map(city => city.name).sort();

// ─── Gov password (shared account) ────────────────────────────────────────────
const GOV_PASSWORD = 'airwatch2026';

// Persist auth in sessionStorage so it survives page refreshes within the session
const getInitialGovAuth = () => {
  try { return sessionStorage.getItem('govAuth') === 'true'; }
  catch { return false; }
};

// ─── Gov Login Gate ────────────────────────────────────────────────────────────
const GovLoginGate = ({ children }) => {
  const [isAuth, setIsAuth] = useState(getInitialGovAuth);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === GOV_PASSWORD) {
        sessionStorage.setItem('govAuth', 'true');
        setIsAuth(true);
        setError('');
      } else {
        setError('Mot de passe incorrect. Vérifiez vos accès.');
        setPassword('');
      }
      setLoading(false);
    }, 600); // slight delay for UI feel
  };

  if (isAuth) return children;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-2xl mb-4 shadow-2xl shadow-teal-500/30">
            <Wind size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">AirWatch</h1>
          <p className="text-slate-400 text-sm mt-1">Cameroun · Système de surveillance</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Accès Gouvernement</h2>
              <p className="text-slate-400 text-xs">Panneau restreint · Autorisation requise</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Mot de passe d'accès
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Vérification…
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Accéder au panneau
                </>
              )}
            </button>
          </form>

          <p className="text-slate-500 text-xs text-center mt-6">
            Cette interface est réservée aux agents du gouvernement.<br />
            Accès public disponible sur{' '}
            <a href="/" className="text-teal-400 hover:underline">la page principale</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

import { useLocation } from 'react-router-dom';

// ─── Main App Content ──────────────────────────────────────────────────────────
const AppContent = () => {
  const [selectedVille, setSelectedVille] = useState('Yaounde');
  const location = useLocation();

  // On the standalone dashboard pages, we hide the legacy public Navbar and Footer
  const isDashboardLayout = location.pathname === '/' || location.pathname === '/gov';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {!isDashboardLayout && (
        <Navbar
          selectedVille={selectedVille}
          setSelectedVille={setSelectedVille}
          villesCameroun={villesCameroun}
        />
      )}

      <main className="flex-1 w-full flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/gov"
            element={
              <GovLoginGate>
                <GovDashboard />
              </GovLoginGate>
            }
          />
          <Route path="/analyse" element={<Analyse />} />
          <Route path="/secteurs" element={<SecteursAffectes />} />
          <Route path="/comparaison" element={<Comparaison />} />
          <Route path="/climate" element={<ClimateExplorer />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!isDashboardLayout && <Footer />}
    </div>
  );
};

// ─── Main App Entry ──────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
