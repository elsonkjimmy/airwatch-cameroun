import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useStore from '../store/useStore';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout, setShowReportingModal, setShowProfilePicker } = useStore();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getNavItems = () => {
    if (role === 'gouvernement') {
      return [
        { icon: 'dashboard', label: 'Alertes', action: () => scrollToSection('alerts-section'), path: '/gouvernement' },
        { icon: 'analytics', label: 'Données', action: () => scrollToSection('data-section'), path: '/gouvernement' },
        { icon: 'logout', label: 'Quitter', action: logout, path: '/login' },
      ];
    }
    if (role === 'association') {
      return [
        { icon: 'map', label: 'Carte', path: '/association', action: () => window.scrollTo({top: 0, behavior: 'smooth'}) },
        { 
          icon: 'potted_plant', 
          label: 'Planter', 
          action: () => scrollToSection('planting-btn'), // On scroll vers le bouton d'action
          path: '/association',
          isMain: true 
        },
        { 
          icon: 'bar_chart', 
          label: 'Impact', 
          action: () => scrollToSection('impact-section'),
          path: '/association' 
        },
        { icon: 'logout', label: 'Quitter', action: logout, path: '/login' },
      ];
    }
    return [
      { icon: 'home', label: 'AQI', path: '/citoyen' },
      { 
        icon: 'campaign', 
        label: 'Signaler', 
        action: () => setShowReportingModal(true),
        path: '/citoyen',
        isMain: true 
      },
      { 
        icon: 'person', 
        label: 'Profil', 
        action: () => setShowProfilePicker(true),
        path: '/citoyen' 
      },
      { icon: 'admin_panel_settings', label: 'Pro', path: '/login' },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen text-[#d5e3ff] font-sans selection:bg-[#81d4d8]/30">
      <main className="relative z-10 pb-0">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-[100] px-4 pb-3 pt-2 pointer-events-none">
        <div className="max-w-[450px] mx-auto h-20 glass-panel rounded-[32px] flex justify-around items-center px-4 pointer-events-auto border border-white/10">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.action) item.action();
                navigate(item.path);
              }}
              className={`group flex flex-col items-center justify-center transition-all active:scale-90 ${
                item.isMain ? 'relative -top-2' : ''
              } ${
                location.pathname === item.path && !item.isMain
                  ? 'text-[#81d4d8]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className={`flex items-center justify-center transition-all duration-300 ${
                item.isMain 
                  ? 'h-14 w-14 rounded-full bg-[#81d4d8] text-[#00132d] shadow-[0_8px_24px_rgba(129,212,216,0.4)] mb-1' 
                  : location.pathname === item.path 
                    ? 'bg-[#81d4d8]/15 rounded-2xl px-4 py-1.5 mb-1' 
                    : 'rounded-2xl px-4 py-1.5 mb-1'
              }`}>
                <span className={`material-symbols-outlined ${item.isMain ? 'text-3xl filled' : 'text-2xl'} ${
                  location.pathname === item.path && !item.isMain ? 'filled' : ''
                }`}>
                  {item.icon}
                </span>
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.15em] ${item.isMain ? 'text-[#81d4d8]' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
