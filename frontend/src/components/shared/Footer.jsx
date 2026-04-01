import React from 'react';
import { CloudSun } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0A2342] py-12 px-6 mt-auto shrink-0">
      <div className="w-full flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <CloudSun className="text-teal-400" size={28} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">
            AirWatch <span className="text-teal-400">Cameroun</span>
          </span>
        </div>
        <div className="h-px w-16 bg-teal-500/30"></div>
        <p className="text-teal-100/60 text-sm font-bold tracking-wide text-center">
          IndabaX Cameroun 2026 Hackathon — TechSpine Initiative
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">
          <span>Données climatiques & sanitaires</span>
          <span className="text-teal-500/50">•</span>
          <span>Période 2020-2025</span>
          <span className="text-teal-500/50">•</span>
          <span>42 villes couvertes</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
