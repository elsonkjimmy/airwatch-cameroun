import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import Accueil from './pages/Accueil';
import Analyse from './pages/Analyse';
import SecteursAffectes from './pages/SecteursAffectes';
import Comparaison from './pages/Comparaison';

// Liste des 42 villes du Cameroun
const villesCameroun = [
  'Yaoundé', 'Douala', 'Maroua', 'Garoua', 'Ngaoundéré', 'Bafoussam', 
  'Bamenda', 'Bertoua', 'Ebolowa', 'Buea', 'Kribi', 'Limbe', 'Kumba', 
  'Edéa', 'Dschang', 'Foumban', 'Mbalmayo', 'Sangmelima', 'Abong-Mbang', 
  'Batouri', 'Yokadouma', 'Mokolo', 'Kousseri', 'Mora', 'Guider', 'Kaélé', 
  'Yagoua', 'Poli', 'Tcholliré', 'Meiganga', 'Tibati', 'Banyo', 'Tignère', 
  'Mbouda', 'Bafang', 'Nkongsamba', 'Loum', 'Manjo', 'Tiko', 'Mamfé', 
  'Fontem', 'Wum'
];

function App() {
  const [selectedVille, setSelectedVille] = useState('Maroua');

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
            <Route 
              path="/" 
              element={
                <Accueil 
                  selectedVille={selectedVille} 
                  setSelectedVille={setSelectedVille}
                />
              } 
            />
            <Route path="/analyse" element={<Analyse />} />
            <Route path="/secteurs" element={<SecteursAffectes />} />
            <Route path="/comparaison" element={<Comparaison />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
