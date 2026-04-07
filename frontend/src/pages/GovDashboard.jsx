import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  Shield, AlertTriangle, FileText, Download, Building2, Leaf,
  MapPin, Calendar, CheckCircle, XCircle, Clock, Users,
  Activity, TrendingUp, Filter, ChevronRight, Flame
} from 'lucide-react';

import citiesData from '../data/cities.json';

// ── Pollution pattern display labels + colors ─────────────────────────────────
const PATTERN_LABELS = {
  episode_poussieres:        { label: 'Poussières',    color: '#D97706', bg: '#FEF3C7' },
  stress_thermique:          { label: 'Stress therm.', color: '#DC2626', bg: '#FEE2E2' },
  stagnation_atmospherique:  { label: 'Stagnation',    color: '#7C3AED', bg: '#EDE9FE' },
  particules_saison_seche:   { label: 'Saison sèche',  color: '#EA580C', bg: '#FFEDD5' },
  episode_feu_confirme:      { label: 'Feu confirmé',  color: '#B91C1C', bg: '#FEE2E2' },
  qualite_acceptable:        { label: 'Acceptable',    color: '#16A34A', bg: '#DCFCE7' },
};

const PatternBadge = ({ pattern }) => {
  const meta = PATTERN_LABELS[pattern] || { label: pattern, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      {meta.label}
    </span>
  );
};

// ── KPI card ──────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  </div>
);

// ============================================================================
// UTILITAIRES
// ============================================================================

const getAQIColor = (aqi) => {
  if (aqi >= 151) return '#DC2626';
  if (aqi >= 101) return '#F97316';
  if (aqi >= 51) return '#EAB308';
  return '#22C55E';
};

// Générer log d'alertes (30 derniers jours)
const generateAlertLog = () => {
  const patterns = ['episode_poussieres', 'stress_thermique', 'stagnation_atmospherique', 'particules_saison_seche'];
  const levels = ['moderate', 'unhealthy_sensitive', 'unhealthy', 'dangerous'];
  
  return Array.from({ length: 50 }, (_, i) => {
    const city = citiesData[Math.floor(Math.random() * citiesData.length)];
    const aqi = Math.floor(50 + Math.random() * 150);
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      id: i + 1,
      city: city.name,
      region: city.region,
      datetime: date.toISOString(),
      aqi,
      pattern: patterns[Math.floor(Math.random() * patterns.length)],
      firmsConfirmed: Math.random() > 0.7,
      level: aqi >= 151 ? 'dangerous' : aqi >= 101 ? 'unhealthy_sensitive' : 'moderate'
    };
  }).sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
};

// Générer advisories santé
const generateHealthAdvisories = () => {
  return [
    {
      id: 1,
      city: 'Maroua',
      region: 'Extreme-Nord',
      type: 'forecast',
      severity: 'high',
      message: "AQI prévu > 150 pour les prochaines 48h durant l'harmattan — recommander le pré-positionnement de masques dans les marchés et écoles.",
      actions: ['Distribuer masques FFP2', 'Alerter établissements scolaires', 'Préparer centres de santé']
    },
    {
      id: 2,
      city: 'Douala',
      region: 'Littoral',
      type: 'persistent',
      severity: 'medium',
      message: "Zone portuaire: stagnation_atmospherique persistante depuis 3+ jours — conseiller aux patients respiratoires d'éviter la zone.",
      actions: ['Communication publique', 'Alerter hôpitaux de la zone']
    },
    {
      id: 3,
      city: 'Région Nord',
      region: 'Nord',
      type: 'firms',
      severity: 'high',
      message: "5 feux FIRMS confirmés dans un rayon de 50 km — alerter les unités de santé publique pour une probable augmentation des consultations respiratoires dans 24-72h.",
      actions: ['Mobiliser personnel médical', 'Stock médicaments respiratoires', 'Surveillance épidémiologique']
    },
    {
      id: 4,
      city: 'Ngaoundere',
      region: 'Adamaoua',
      type: 'forecast',
      severity: 'medium',
      message: "Pic de stress thermique prévu ce week-end (>35°C) — conseiller aux populations vulnérables de rester à l'intérieur.",
      actions: ['Ouvrir centres de rafraîchissement', 'Distribuer eau potable']
    }
  ];
};

// Calculer scores pour placement cliniques
const calculateClinicScores = () => {
  return citiesData.map(city => {
    const avgAqi = city.current.aqi || 50;
    const highAqiDays = Math.round((avgAqi / 200) * 100); // Simulation
    const populationDensity = Math.random() * 100; // Simulation
    
    const score = Math.round((avgAqi * 0.4) + (highAqiDays * 0.3) + (populationDensity * 0.3));
    
    return {
      ...city,
      avgAqi,
      highAqiDays,
      populationDensity: Math.round(populationDensity),
      score,
      priority: score > 70 ? 'high' : score > 40 ? 'medium' : 'low',
      rationale: score > 70 
        ? 'Zone à haute exposition - besoin urgent de clinique respiratoire'
        : score > 40
        ? 'Zone à exposition modérée - clinique recommandée'
        : 'Zone à faible exposition - priorité basse'
    };
  }).sort((a, b) => b.score - a.score);
};

// Calculer priorités reboisement
const calculateReforestationPriorities = () => {
  return citiesData.map(city => {
    // Simulation NDVI et données
    const ndvi = 0.2 + Math.random() * 0.6; // 0.2 = peu de végétation, 0.8 = forêt dense
    const fireFrequency = Math.round(Math.random() * 30);
    const avgDustAqi = city.current.dust || 20;
    
    // Score = faible végétation + beaucoup de feux + AQI élevé
    const score = Math.round(((1 - ndvi) * 40) + (fireFrequency * 1.5) + (avgDustAqi * 0.5));
    
    return {
      ...city,
      ndvi: Math.round(ndvi * 100) / 100,
      fireFrequency,
      avgDustAqi,
      score,
      priority: score > 50 ? 'critical' : score > 30 ? 'high' : score > 15 ? 'medium' : 'low',
      rationale: `Fréquence feux élevée (${fireFrequency}/an) + AQI poussière ${avgDustAqi} µg/m³ + végétation ${Math.round(ndvi * 100)}% — le reboisement réduirait risque incendie et particules.`
    };
  }).sort((a, b) => b.score - a.score);
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

const GovDashboard = () => {
  const [activePanel, setActivePanel] = useState('alerts');
  const [filterLevel, setFilterLevel] = useState('all');
  const [handledAdvisories, setHandledAdvisories] = useState(new Set());

  const alertLog = useMemo(() => generateAlertLog(), []);
  const healthAdvisories = useMemo(() => generateHealthAdvisories(), []);
  const clinicScores = useMemo(() => calculateClinicScores(), []);
  const reforestationData = useMemo(() => calculateReforestationPriorities(), []);

  // KPI calculations
  const today = useMemo(() => {
    const now = new Date();
    return alertLog.filter(a => {
      const d = new Date(a.datetime);
      return d.toDateString() === now.toDateString();
    });
  }, [alertLog]);
  const criticalCities = useMemo(() => new Set(alertLog.filter(a => a.level === 'dangerous').map(a => a.city)).size, [alertLog]);
  const firmsConfirmed = useMemo(() => alertLog.filter(a => a.firmsConfirmed).length, [alertLog]);
  const avgNationalAqi = Math.round(citiesData.reduce((s, c) => s + (c.current.aqi || 0), 0) / citiesData.length);

  const filteredAlerts = filterLevel === 'all'
    ? alertLog
    : alertLog.filter(a => a.level === filterLevel);

  const toggleAdvisory = (id) => {
    setHandledAdvisories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };


  // Export CSV
  const exportCSV = () => {
    const headers = ['ID', 'Ville', 'Région', 'Date/Heure', 'AQI', 'Pattern', 'FIRMS', 'Niveau'];
    const rows = alertLog.map(a => [
      a.id, a.city, a.region, a.datetime, a.aqi, a.pattern, 
      a.firmsConfirmed ? 'Oui' : 'Non', a.level
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alertes_airwatch_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const panels = [
    { id: 'alerts', label: 'Log Alertes', icon: AlertTriangle },
    { id: 'advisories', label: 'Advisories Santé', icon: Shield },
    { id: 'clinics', label: 'Placement Cliniques', icon: Building2 },
    { id: 'reforestation', label: 'Priorité Reboisement', icon: Leaf }
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">AirWatch Gouvernement</h1>
              <p className="text-slate-400 text-xs">Panneau d'aide à la décision</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full text-sm">
            <Shield size={16} />
            Accès Autorisé
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ========== KPI ROW ========== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Alertes aujourd'hui"
            value={today.length}
            sub={`sur ${alertLog.length} au total`}
            icon={AlertTriangle}
            color="#DC2626"
          />
          <KPICard
            label="Villes critiques"
            value={criticalCities}
            sub="AQI ≥ 151"
            icon={MapPin}
            color="#F97316"
          />
          <KPICard
            label="Feux FIRMS"
            value={firmsConfirmed}
            sub="confirmés (30j)"
            icon={Flame}
            color="#B91C1C"
          />
          <KPICard
            label="AQI moyen national"
            value={avgNationalAqi}
            sub={`${citiesData.length} villes surveillées`}
            icon={Activity}
            color="#0D7377"
          />
        </div>

        {/* Navigation Panels */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {panels.map(panel => (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activePanel === panel.id
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <panel.icon size={18} />
              {panel.label}
            </button>
          ))}
        </div>

        {/* ========== PANEL 1: ALERT LOG ========== */}
        {activePanel === 'alerts' && (
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">Log des Alertes</h2>
                <p className="text-sm text-gray-500">30 derniers jours • {alertLog.length} alertes</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="dangerous">Dangereux</option>
                  <option value="unhealthy_sensitive">Mauvais (sensibles)</option>
                  <option value="moderate">Modéré</option>
                </select>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Ville</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Date/Heure</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">AQI</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Pattern</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">FIRMS</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Niveau</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.slice(0, 20).map((alert, i) => (
                    <tr key={alert.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-800">{alert.city}</p>
                          <p className="text-xs text-gray-500">{alert.region}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(alert.datetime).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span 
                          className="inline-block px-2.5 py-1 rounded-full text-white text-xs font-bold"
                          style={{ backgroundColor: getAQIColor(alert.aqi) }}
                        >
                          {alert.aqi}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs">
                        <PatternBadge pattern={alert.pattern} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        {alert.firmsConfirmed ? (
                          <CheckCircle className="inline text-green-500" size={18} />
                        ) : (
                          <XCircle className="inline text-gray-300" size={18} />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          alert.level === 'dangerous' ? 'bg-red-100 text-red-700' :
                          alert.level === 'unhealthy_sensitive' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {alert.level === 'dangerous' ? 'Dangereux' :
                           alert.level === 'unhealthy_sensitive' ? 'Mauvais' : 'Modéré'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== PANEL 2: HEALTH ADVISORIES ========== */}
        {activePanel === 'advisories' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-800 text-lg mb-2">Advisories Santé Automatiques</h2>
              <p className="text-sm text-gray-500 mb-4">Recommandations générées selon AQI actuel et prévisions</p>
            </div>

            {healthAdvisories.map(advisory => {
              const isHandled = handledAdvisories.has(advisory.id);
              return (
              <div 
                key={advisory.id}
                className={`bg-white rounded-xl shadow-sm p-5 border-l-4 transition-opacity ${
                  advisory.severity === 'high' ? 'border-red-500' : 'border-orange-400'
                } ${isHandled ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-gray-400" size={16} />
                    <span className="font-bold text-gray-800">{advisory.city}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{advisory.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      advisory.type === 'forecast' ? 'bg-blue-100 text-blue-700' :
                      advisory.type === 'firms' ? 'bg-red-100 text-red-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {advisory.type === 'forecast' ? 'Prévision' :
                       advisory.type === 'firms' ? 'Feux détectés' : 'Persistant'}
                    </span>
                    <button
                      onClick={() => toggleAdvisory(advisory.id)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        isHandled
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {isHandled ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {isHandled ? 'Traité' : 'Marquer traité'}
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{advisory.message}</p>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Actions recommandées:</p>
                  <div className="flex flex-wrap gap-2">
                    {advisory.actions.map((action, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border">
                        <ChevronRight size={12} className="text-teal-500" />
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* ========== PANEL 3: CLINIC PLACEMENT ========== */}
        {activePanel === 'clinics' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b">
                <h2 className="font-bold text-gray-800 text-lg">Analyse Placement Cliniques</h2>
                <p className="text-sm text-gray-500">Score = AQI moyen × Fréquence AQI&gt;150 × Densité population</p>
              </div>
              <div className="h-[400px]">
                <MapContainer
                  center={[6.5, 12.5]}
                  zoom={5.5}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {clinicScores.map(city => (
                    <CircleMarker
                      key={city.name}
                      center={[city.latitude, city.longitude]}
                      radius={Math.max(8, city.score / 5)}
                      fillColor={city.priority === 'high' ? '#DC2626' : city.priority === 'medium' ? '#F97316' : '#22C55E'}
                      color="#fff"
                      weight={2}
                      fillOpacity={0.7}
                    >
                      <LeafletTooltip>
                        <div>
                          <strong>{city.name}</strong>
                          <br />Score: {city.score}
                          <br />Priorité: {city.priority}
                        </div>
                      </LeafletTooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Top 10 Zones Prioritaires</h3>
              <div className="space-y-3">
                {clinicScores.slice(0, 10).map((city, i) => (
                  <div key={city.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        city.priority === 'high' ? 'bg-red-500' : city.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{city.name}</p>
                        <p className="text-xs text-gray-500">{city.region}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{city.score}</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== PANEL 4: REFORESTATION ========== */}
        {activePanel === 'reforestation' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b">
                <h2 className="font-bold text-gray-800 text-lg">Carte Priorité Reboisement</h2>
                <p className="text-sm text-gray-500">Faible végétation + Feux fréquents + AQI élevé</p>
              </div>
              <div className="h-[400px]">
                <MapContainer
                  center={[6.5, 12.5]}
                  zoom={5.5}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {reforestationData.map(city => (
                    <CircleMarker
                      key={city.name}
                      center={[city.latitude, city.longitude]}
                      radius={Math.max(8, city.score / 3)}
                      fillColor={
                        city.priority === 'critical' ? '#7C2D12' :
                        city.priority === 'high' ? '#DC2626' :
                        city.priority === 'medium' ? '#F97316' : '#22C55E'
                      }
                      color="#fff"
                      weight={2}
                      fillOpacity={0.7}
                    >
                      <LeafletTooltip>
                        <div>
                          <strong>{city.name}</strong>
                          <br />NDVI: {city.ndvi}
                          <br />Feux/an: {city.fireFrequency}
                          <br />Score: {city.score}
                        </div>
                      </LeafletTooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4">Top 10 Zones à Reboiser</h3>
              <div className="space-y-3">
                {reforestationData.slice(0, 10).map((city, i) => (
                  <div key={city.name} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          city.priority === 'critical' ? 'bg-amber-900' :
                          city.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-medium text-gray-800">{city.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        city.priority === 'critical' ? 'bg-amber-100 text-amber-800' :
                        city.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {city.priority === 'critical' ? 'Critique' : city.priority === 'high' ? 'Haute' : 'Moyenne'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{city.rationale}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>NDVI: {city.ndvi}</span>
                      <span>Feux: {city.fireFrequency}/an</span>
                      <span>Poussière: {city.avgDustAqi} µg/m³</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovDashboard;
