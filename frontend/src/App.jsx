import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CitoyenDashboard from './pages/CitoyenDashboard';
import AssociationDashboard from './pages/AssociationDashboard';
import GouvernementDashboard from './pages/GouvernementDashboard';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import useStore from './store/useStore';

// Composant pour protéger les routes Pro (Asso / Gouv)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { hasSelectedProfile, role } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN PRO */}
        <Route path="/login" element={<Login />} />

        {/* FLUX CITOYEN (SANS LOGIN) */}
        {!hasSelectedProfile ? (
          <Route path="*" element={<Onboarding />} />
        ) : (
          <Route element={<Layout />}>
            <Route path="/citoyen" element={<CitoyenDashboard />} />
            
            {/* ROUTES PROTÉGÉES */}
            <Route 
              path="/association" 
              element={
                <ProtectedRoute allowedRoles={['association']}>
                  <AssociationDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gouvernement" 
              element={
                <ProtectedRoute allowedRoles={['gouvernement']}>
                  <GouvernementDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirection intelligente basée sur le rôle actuel */}
            <Route path="/" element={<Navigate to={role === 'citoyen' ? '/citoyen' : `/${role}`} replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
