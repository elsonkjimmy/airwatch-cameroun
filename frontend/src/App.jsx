import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import Dashboard from './pages/Dashboard';
import GovDashboard from './pages/GovDashboard';
import Analyse from './pages/Analyse';
import SecteursAffectes from './pages/SecteursAffectes';
import Comparaison from './pages/Comparaison';
import ClimateExplorer from './pages/ClimateExplorer';

// Import des données réelles des villes
import citiesData from './data/cities.json';

// Liste des villes depuis le dataset
const villesCameroun = citiesData.map(city => city.name).sort();

function App() {
  const [selectedVille, setSelectedVille] = useState('Yaounde');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar 
          selectedVille={selectedVille} 
          setSelectedVille={setSelectedVille} 
          villesCameroun={villesCameroun}
        />
        
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/gov" element={<GovDashboard />} />
            <Route path="/analyse" element={<Analyse />} />
            <Route path="/secteurs" element={<SecteursAffectes />} />
            <Route path="/comparaison" element={<Comparaison />} />
            <Route path="/climate" element={<ClimateExplorer />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
