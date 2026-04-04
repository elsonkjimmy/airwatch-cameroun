import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CloudSun, Home, BarChart3, MapPinned, GitCompare, Menu, X, MapPin } from 'lucide-react';
import OfflineIndicator from './OfflineIndicator';

const Navbar = ({ selectedVille, setSelectedVille, villesCameroun }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/analyse', label: 'Analyse', icon: BarChart3 },
    { to: '/secteurs', label: 'Secteurs', icon: MapPinned },
    { to: '/comparaison', label: 'Comparaison', icon: GitCompare },
  ];

  return (
    <header className="bg-gradient-to-r from-[#0A2342] to-[#0D7377] py-3 px-4 md:px-6 sticky top-0 z-50 shadow-lg shrink-0">
      <div className="w-full flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <CloudSun className="text-white" size={24} strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-[#0A2342] animate-pulse-dot"></div>
          </div>
          <h1 className="text-lg md:text-xl font-black text-white tracking-tight">
            AirWatch <span className="text-teal-200 hidden sm:inline">Cameroun</span>
          </h1>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-white/10 rounded-full p-1 backdrop-blur-sm">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#0A2342] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right side: Offline + City + Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Offline Indicator */}
          <div className="hidden sm:block">
            <OfflineIndicator />
          </div>

          {/* City Selector Pill */}
          <div className="flex items-center gap-1 bg-white/95 rounded-full pl-2 pr-1 py-1 shadow-md">
            <MapPin size={14} className="text-teal-600 shrink-0" />
            <select
              className="bg-transparent border-none text-xs md:text-sm font-bold text-[#0A2342] outline-none appearance-none cursor-pointer pr-2 max-w-[80px] md:max-w-[120px]"
              value={selectedVille}
              onChange={(e) => setSelectedVille(e.target.value)}
            >
              {villesCameroun.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 bg-white/10 rounded-full text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-3 pt-3 border-t border-white/20">
          <div className="grid grid-cols-4 gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all ${
                    isActive
                      ? 'bg-white text-[#0A2342] shadow-md'
                      : 'text-white/80 hover:bg-white/10'
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-[10px] font-bold leading-tight">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
