/**
 * API Offline - Remplace les appels backend par des données locales
 * Fonctionne 100% hors-ligne avec les données JSON embarquées
 */

import citiesData from '../data/cities.json';
import regionsData from '../data/regions.json';
import monthlyData from '../data/monthly.json';

// === DONNÉES AQI ===

export const getAQIByVille = (villeId) => {
  const city = citiesData.find(
    c => c.name.toLowerCase() === villeId.toLowerCase()
  );
  
  if (!city) {
    return null;
  }

  // Générer historique simulé basé sur l'AQI actuel
  const baseAqi = city.current.aqi || 50;
  const historique = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    aqi: Math.round(baseAqi * (0.8 + Math.random() * 0.4)) // ±20% variation
  }));

  return {
    ville: city.name,
    region: city.region,
    latitude: city.latitude,
    longitude: city.longitude,
    aqi_actuel: city.current.aqi,
    pm25: city.current.pm25,
    pm10: city.current.pm10,
    dust: city.current.dust,
    temperature: city.current.tempMean,
    wind_speed: city.current.windSpeed,
    precipitation: city.current.precipitation,
    aqi_demain: Math.round(baseAqi * (0.9 + Math.random() * 0.2)),
    aqi_apres_demain: Math.round(baseAqi * (0.85 + Math.random() * 0.3)),
    historique_30j: historique,
    derniere_maj: city.lastUpdate
  };
};

export const getAllCities = () => {
  return citiesData.map(city => ({
    name: city.name,
    region: city.region,
    latitude: city.latitude,
    longitude: city.longitude,
    aqi: city.current.aqi,
    pm25: city.current.pm25,
    pm10: city.current.pm10,
    temperature: city.current.tempMean,
    lastUpdate: city.lastUpdate
  }));
};

export const getCitiesByRegion = (region) => {
  return citiesData
    .filter(city => city.region.toLowerCase() === region.toLowerCase())
    .map(city => ({
      name: city.name,
      aqi: city.current.aqi,
      pm25: city.current.pm25,
      temperature: city.current.tempMean
    }));
};

// === RÉGIONS ===

export const getAllRegions = () => {
  return regionsData;
};

export const getRegionStats = (regionName) => {
  const regionCities = citiesData.filter(
    c => c.region.toLowerCase() === regionName.toLowerCase()
  );
  
  if (regionCities.length === 0) return null;

  const avgAqi = Math.round(
    regionCities.reduce((sum, c) => sum + (c.current.aqi || 0), 0) / regionCities.length
  );
  
  const avgPm25 = Math.round(
    regionCities.reduce((sum, c) => sum + (c.current.pm25 || 0), 0) / regionCities.length * 10
  ) / 10;

  return {
    region: regionName,
    cities_count: regionCities.length,
    avg_aqi: avgAqi,
    avg_pm25: avgPm25,
    worst_city: regionCities.sort((a, b) => (b.current.aqi || 0) - (a.current.aqi || 0))[0]?.name,
    best_city: regionCities.sort((a, b) => (a.current.aqi || 0) - (b.current.aqi || 0))[0]?.name
  };
};

// === PRÉDICTIONS ===

export const predictAQI = (lat, lon, targetDate) => {
  // Trouver la ville la plus proche
  let nearestCity = citiesData[0];
  let minDistance = Infinity;
  
  citiesData.forEach(city => {
    const distance = Math.sqrt(
      Math.pow(city.latitude - lat, 2) + Math.pow(city.longitude - lon, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });

  const baseAqi = nearestCity.current.aqi || 50;
  const predictedAqi = Math.round(baseAqi * (0.85 + Math.random() * 0.3));
  
  // Déterminer le type de pollution
  const pollutionTypes = ['Particules fines', 'Poussière', 'Combustion', 'Industrielle'];
  const type = nearestCity.current.dust > 50 
    ? 'Poussière' 
    : nearestCity.current.pm25 > 30 
      ? 'Particules fines' 
      : pollutionTypes[Math.floor(Math.random() * pollutionTypes.length)];

  return {
    ville_proche: nearestCity.name,
    aqi: predictedAqi,
    pm25: Math.round(predictedAqi * 0.31 * 10) / 10,
    type_pollution: type,
    niveau: predictedAqi > 150 ? 3 : predictedAqi > 100 ? 2 : 1,
    conseils: getHealthAdvice(predictedAqi),
    confidence: 0.85
  };
};

// === CONSEILS SANTÉ ===

const getHealthAdvice = (aqi) => {
  if (aqi >= 150) {
    return [
      "🚨 Évitez toute activité extérieure prolongée",
      "😷 Port du masque FFP2 recommandé",
      "🏠 Restez à l'intérieur autant que possible",
      "💨 Fermez les fenêtres et utilisez un purificateur d'air",
      "👶 Protégez particulièrement les enfants et personnes âgées"
    ];
  }
  if (aqi >= 100) {
    return [
      "⚠️ Limitez les efforts physiques intenses à l'extérieur",
      "😷 Masque conseillé pour les personnes sensibles",
      "🏃 Évitez le sport en extérieur",
      "💊 Gardez vos médicaments à portée si vous êtes asthmatique"
    ];
  }
  if (aqi >= 50) {
    return [
      "👀 Qualité acceptable - Restez vigilant",
      "🏃 Activités extérieures possibles avec modération",
      "👶 Les personnes sensibles doivent limiter l'exposition"
    ];
  }
  return [
    "✅ Qualité de l'air satisfaisante",
    "🌳 Profitez des activités en extérieur",
    "🏃 Conditions idéales pour le sport"
  ];
};

// === CLASSEMENTS ===

export const getTopPollutedCities = (limit = 10) => {
  return [...citiesData]
    .sort((a, b) => (b.current.aqi || 0) - (a.current.aqi || 0))
    .slice(0, limit)
    .map(city => ({
      name: city.name,
      region: city.region,
      aqi: city.current.aqi,
      pm25: city.current.pm25
    }));
};

export const getCleanestCities = (limit = 10) => {
  return [...citiesData]
    .sort((a, b) => (a.current.aqi || 0) - (b.current.aqi || 0))
    .slice(0, limit)
    .map(city => ({
      name: city.name,
      region: city.region,
      aqi: city.current.aqi,
      pm25: city.current.pm25
    }));
};

// === DONNÉES MENSUELLES ===

export const getMonthlyData = () => {
  return monthlyData;
};

// === COMPARAISON ===

export const compareCities = (cityNames) => {
  return cityNames.map(name => {
    const city = citiesData.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    );
    if (!city) return null;
    
    return {
      name: city.name,
      region: city.region,
      aqi: city.current.aqi,
      pm25: city.current.pm25,
      pm10: city.current.pm10,
      temperature: city.current.tempMean,
      wind: city.current.windSpeed,
      precipitation: city.current.precipitation
    };
  }).filter(Boolean);
};

// === STATISTIQUES NATIONALES ===

export const getNationalStats = () => {
  const totalCities = citiesData.length;
  const avgAqi = Math.round(
    citiesData.reduce((sum, c) => sum + (c.current.aqi || 0), 0) / totalCities
  );
  const avgPm25 = Math.round(
    citiesData.reduce((sum, c) => sum + (c.current.pm25 || 0), 0) / totalCities * 10
  ) / 10;
  
  const criticalCities = citiesData.filter(c => (c.current.aqi || 0) >= 150).length;
  const badCities = citiesData.filter(c => (c.current.aqi || 0) >= 100 && (c.current.aqi || 0) < 150).length;
  const moderateCities = citiesData.filter(c => (c.current.aqi || 0) >= 50 && (c.current.aqi || 0) < 100).length;
  const goodCities = citiesData.filter(c => (c.current.aqi || 0) < 50).length;

  return {
    total_cities: totalCities,
    avg_aqi: avgAqi,
    avg_pm25: avgPm25,
    distribution: {
      critical: criticalCities,
      bad: badCities,
      moderate: moderateCities,
      good: goodCities
    },
    worst_city: getTopPollutedCities(1)[0],
    best_city: getCleanestCities(1)[0]
  };
};
