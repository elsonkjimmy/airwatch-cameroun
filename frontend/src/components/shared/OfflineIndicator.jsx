import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, CheckCircle } from 'lucide-react';
import { isOffline, onConnectionChange, getStorageStats } from '../../lib/offlineStorage';

/**
 * Indicateur de statut offline/online
 * Affiche l'état de la connexion et le mode de fonctionnement
 */
const OfflineIndicator = ({ showDetails = false }) => {
  const [offline, setOffline] = useState(isOffline());
  const [stats, setStats] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const unsubscribe = onConnectionChange((online) => {
      setOffline(!online);
    });

    // Charger les stats de stockage
    const loadStats = async () => {
      try {
        const storageStats = await getStorageStats();
        setStats(storageStats);
      } catch (e) {
        console.warn('Erreur chargement stats:', e);
      }
    };
    loadStats();

    return unsubscribe;
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          offline 
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
            : 'bg-green-100 text-green-800 hover:bg-green-200'
        }`}
      >
        {offline ? (
          <>
            <WifiOff size={16} />
            <span>Mode Offline</span>
          </>
        ) : (
          <>
            <Wifi size={16} />
            <span>En ligne</span>
          </>
        )}
      </button>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="flex items-center gap-2 mb-3">
            <Database size={18} className="text-blue-600" />
            <span className="font-semibold text-gray-800">Stockage Local</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={14} />
              <span>Application 100% offline</span>
            </div>
            
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={14} />
              <span>42 villes disponibles</span>
            </div>

            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={14} />
              <span>Cartes en cache</span>
            </div>

            {stats && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-gray-500 text-xs mb-2">Données locales :</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-gray-600">Signalements:</span>
                  <span className="font-medium">{stats.signalements || 0}</span>
                  <span className="text-gray-600">Alertes:</span>
                  <span className="font-medium">{stats.alertes || 0}</span>
                  <span className="text-gray-600">Historique:</span>
                  <span className="font-medium">{stats.historique || 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {offline 
                ? "Toutes les fonctionnalités sont disponibles hors-ligne."
                : "Les données seront mises à jour en arrière-plan."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
