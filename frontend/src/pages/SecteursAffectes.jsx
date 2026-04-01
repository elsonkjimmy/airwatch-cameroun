import React from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip } from 'react-leaflet';
import { Heart, Wind, Sprout, Users, AlertTriangle, Activity } from 'lucide-react';

// Données des régions du Cameroun avec zones affectées
const regionsData = [
  {
    name: 'Extrême-Nord',
    center: [10.5, 14.5],
    polygon: [
      [12.5, 13.5],
      [12.5, 15.5],
      [10.0, 15.5],
      [10.0, 13.5],
    ],
    avgPollution: 185,
    aqiLevel: 'Critique',
    population: 3800000,
    mainRisk: 'Respiratoire',
    icon: Wind,
    color: '#DC2626',
    description: 'Forte pollution due à l\'harmattan et poussières sahéliennes',
  },
  {
    name: 'Nord',
    center: [9.3, 13.4],
    polygon: [
      [10.0, 12.5],
      [10.0, 15.0],
      [8.5, 15.0],
      [8.5, 12.5],
    ],
    avgPollution: 155,
    aqiLevel: 'Mauvais',
    population: 2500000,
    mainRisk: 'Respiratoire',
    icon: Wind,
    color: '#F97316',
    description: 'Pollution saisonnière avec pics en saison sèche',
  },
  {
    name: 'Adamaoua',
    center: [7.0, 13.0],
    polygon: [
      [8.5, 12.0],
      [8.5, 15.0],
      [6.0, 15.0],
      [6.0, 12.0],
    ],
    avgPollution: 85,
    aqiLevel: 'Modéré',
    population: 1200000,
    mainRisk: 'Agricole',
    icon: Sprout,
    color: '#EAB308',
    description: 'Impact modéré sur agriculture et élevage',
  },
  {
    name: 'Centre',
    center: [4.0, 11.5],
    polygon: [
      [5.0, 10.0],
      [5.0, 13.0],
      [3.0, 13.0],
      [3.0, 10.0],
    ],
    avgPollution: 110,
    aqiLevel: 'Mauvais',
    population: 3800000,
    mainRisk: 'Cardiovasculaire',
    icon: Heart,
    color: '#F97316',
    description: 'Urbanisation croissante et pollution automobile',
  },
  {
    name: 'Littoral',
    center: [4.5, 10.0],
    polygon: [
      [5.0, 9.0],
      [5.0, 11.0],
      [3.5, 11.0],
      [3.5, 9.0],
    ],
    avgPollution: 130,
    aqiLevel: 'Mauvais',
    population: 3500000,
    mainRisk: 'Respiratoire',
    icon: Wind,
    color: '#F97316',
    description: 'Pollution industrielle et portuaire à Douala',
  },
  {
    name: 'Ouest',
    center: [5.5, 10.4],
    polygon: [
      [6.5, 9.5],
      [6.5, 11.5],
      [5.0, 11.5],
      [5.0, 9.5],
    ],
    avgPollution: 75,
    aqiLevel: 'Modéré',
    population: 2000000,
    mainRisk: 'Agricole',
    icon: Sprout,
    color: '#EAB308',
    description: 'Zone agricole avec impact climatique modéré',
  },
  {
    name: 'Sud-Ouest',
    center: [4.5, 9.3],
    polygon: [
      [5.5, 8.5],
      [5.5, 10.0],
      [3.5, 10.0],
      [3.5, 8.5],
    ],
    avgPollution: 55,
    aqiLevel: 'Modéré',
    population: 1500000,
    mainRisk: 'Cardiovasculaire',
    icon: Heart,
    color: '#EAB308',
    description: 'Qualité d\'air relativement bonne, risques liés à l\'humidité',
  },
  {
    name: 'Nord-Ouest',
    center: [6.0, 10.2],
    polygon: [
      [7.0, 9.0],
      [7.0, 11.0],
      [5.5, 11.0],
      [5.5, 9.0],
    ],
    avgPollution: 70,
    aqiLevel: 'Modéré',
    population: 2100000,
    mainRisk: 'Agricole',
    icon: Sprout,
    color: '#EAB308',
    description: 'Région montagneuse avec bonne circulation d\'air',
  },
];

const getAQIColorFromLevel = (level) => {
  switch (level) {
    case 'Critique':
      return '#DC2626';
    case 'Mauvais':
      return '#F97316';
    case 'Modéré':
      return '#EAB308';
    default:
      return '#14A44D';
  }
};

const SecteursAffectes = () => {
  return (
    <div className="w-full px-6 py-8 space-y-8">
      <div>
        <h2 className="text-3xl font-black text-[#0A2342] flex flex-col gap-1">
          <span>Zones à Risque Climatique au Cameroun</span>
          <div className="h-[3px] w-10 bg-[#0D7377] rounded-full"></div>
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Cartographie des régions affectées par la pollution atmosphérique et leurs impacts sanitaires
        </p>
      </div>

      {/* MAP SECTION */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
        <div className="h-[500px] w-full rounded-xl overflow-hidden">
          <MapContainer
            center={[7.36, 12.35]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
            {regionsData.map((region, i) => (
              <Polygon
                key={i}
                positions={region.polygon}
                pathOptions={{
                  fillColor: region.color,
                  fillOpacity: 0.4,
                  color: region.color,
                  weight: 3,
                }}
              >
                <LeafletTooltip
                  direction="center"
                  permanent
                  opacity={0.9}
                  className="rounded-lg shadow-xl border-none p-0"
                >
                  <div className="bg-[#0A2342] text-white p-2 text-xs font-bold text-center">
                    {region.name}
                  </div>
                </LeafletTooltip>
              </Polygon>
            ))}
          </MapContainer>
        </div>

        {/* Map Legend */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#14A44D' }}></div>
            <span className="text-xs font-bold text-gray-600">Bon</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EAB308' }}></div>
            <span className="text-xs font-bold text-gray-600">Modéré</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F97316' }}></div>
            <span className="text-xs font-bold text-gray-600">Mauvais</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
            <span className="text-xs font-bold text-gray-600">Critique</span>
          </div>
        </div>
      </div>

      {/* REGION CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regionsData.map((region, i) => {
          const RiskIcon = region.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-md border-l-4 hover:shadow-xl transition-shadow"
              style={{ borderLeftColor: region.color }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-[#0A2342]">{region.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{region.description}</p>
                </div>
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${region.color}20` }}
                >
                  <RiskIcon size={24} style={{ color: region.color }} strokeWidth={2.5} />
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                {/* Pollution Level */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-gray-600" />
                    <span className="text-xs font-bold text-gray-600">Niveau pollution</span>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-black text-white"
                    style={{ backgroundColor: region.color }}
                  >
                    {region.avgPollution} AQI
                  </div>
                </div>

                {/* Population Exposed */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-600" />
                    <span className="text-xs font-bold text-gray-600">Population exposée</span>
                  </div>
                  <span className="text-sm font-black text-[#0A2342]">
                    {(region.population / 1000000).toFixed(1)}M
                  </span>
                </div>

                {/* Main Risk */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-gray-600" />
                    <span className="text-xs font-bold text-gray-600">Risque principal</span>
                  </div>
                  <span className="text-sm font-black text-[#0A2342]">{region.mainRisk}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${region.color}20`,
                    color: region.color,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: region.color }}
                  ></div>
                  Statut: {region.aqiLevel}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INFO BANNER */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-teal-100 rounded-full">
            <AlertTriangle className="text-teal-700" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-lg font-black text-[#0A2342] mb-2">Note Méthodologique</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              Les données présentées sont des estimations basées sur des modèles climatiques et de
              qualité de l'air. Les zones identifiées comme "à risque" nécessitent une surveillance
              accrue et des interventions ciblées en matière de santé publique. Les risques
              respiratoires sont particulièrement élevés dans les régions du Nord exposées aux
              poussières sahéliennes pendant l'harmattan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecteursAffectes;
