import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClimateExplorer from './pages/ClimateExplorer';

function App() {
  return (
    <BrowserRouter>
      {/* 
          Le Layout avec la Bottom Nav est retiré pour laisser 
          place à une expérience "Full Explorer" 
      */}
      <div className="min-h-screen bg-[#F8FAFC]">
        <Routes>
          <Route path="/explorer" element={<ClimateExplorer />} />
          <Route path="/" element={<Navigate to="/explorer" />} />
          
          {/* Les anciennes routes sont conservées mais non accessibles via la nav */}
          <Route path="*" element={<Navigate to="/explorer" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
