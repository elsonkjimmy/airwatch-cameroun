# 🌍 AirWatch Cameroun

**Système Intelligent de Veille et Prédiction de la Qualité de l'Air**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Now-2563eb?style=for-the-badge)](https://airwatch-cameroun.vercel.app)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

*IndabaX Cameroun 2026 — Hackathon IA & Résilience Climatique*

---

## 🚀 Le Projet

AirWatch est une plateforme interactive permettant de surveiller et de prédire la qualité de l'air dans 42 villes du Cameroun. Elle connecte les citoyens, les associations et le gouvernement pour une action climatique coordonnée.

### 🏆 Réalisations

- 🥇 **Hackathon Winner** - IndabaX Cameroun 2026
- 🌍 **42 villes couvertes** à travers le Cameroun
- 🤖 **Modèles IA déployés** pour la prédiction AQI
- 📱 **Application mobile-first** pour l'accès grand public

---

## 🛠 Stack Technique

### Frontend
- **React** - Bibliothèque UI moderne avec hooks
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utility-first
- **Leaflet.js** - Cartes interactives
- **Recharts** - Visualisation de données
- **Zustand** - Gestion d'état légère

### Backend
- **FastAPI** - Framework API Python haute performance
- **Pydantic** - Validation de données
- **XGBoost** - Modèles de prédiction AQI
- **Scikit-learn** - Classification et machine learning

### Base de Données & Infrastructure
- **Supabase** - PostgreSQL + RLS (Row Level Security)
- **Twilio** - Notifications SMS en temps réel
- **WebSocket** - Communication temps réel

---

## 📸 Screenshots

> **Note:** Screenshots will be added here. Include:
> - Main dashboard with air quality map
> - City-specific air quality details
> - Prediction charts and trends
> - Alert configuration interface

<!-- Add your screenshots here -->
<!-- 
![Dashboard](screenshots/dashboard.png)
![City View](screenshots/city.png)
![Predictions](screenshots/predictions.png)
![Alerts](screenshots/alerts.png)
-->

---

## 🚀 Installation

### Prérequis

- Node.js (v16 ou supérieur)
- Python 3.8+
- PostgreSQL (via Supabase)
- npm ou yarn

### Backend

1. **Naviguer vers le backend**
```bash
cd backend
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Configurer les variables d'environnement**
```env
DATABASE_URL=your_supabase_database_url
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

4. **Lancer le serveur**
```bash
uvicorn main:app --reload
```

### Frontend

1. **Naviguer vers le frontend**
```bash
cd frontend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

---

## 🏗 Structure du Projet

```
airwatch-cameroun/
├── frontend/              # Application React
│   ├── src/
│   │   ├── components/   # Composants React réutilisables
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services API
│   │   └── utils/        # Utilitaires
│   └── public/           # Assets statiques
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── api/          # Routes API
│   │   ├── models/       # Modèles de données
│   │   ├── services/     # Logique métier
│   │   └── ml/           # Modèles ML
│   └── tests/            # Tests
└── supabase_schema.sql   # Schéma de base de données
```

---

## 🎯 Fonctionnalités

### Surveillance en Temps Réel
- Données de qualité de l'air mises à jour en continu
- Cartes interactives avec Leaflet.js
- Indicateurs AQI (Air Quality Index)

### Prédictions IA
- Modèles XGBoost pour prédire la qualité de l'air
- Prévisions à 24h et 48h
- Classification des niveaux de pollution

### Alertes Intelligentes
- Notifications SMS via Twilio
- Alertes personnalisables par utilisateur
- Système WebSocket pour temps réel

### Dashboard Analytique
- Graphiques et tendances avec Recharts
- Comparaisons entre villes
- Historique des données

---

## 🔧 Configuration Supabase

1. **Créer un projet Supabase**
2. **Exécuter le schéma SQL**
```sql
-- Exécuter le fichier supabase_schema.sql
```
3. **Configurer RLS (Row Level Security)**
4. **Générer les clés API**

---

## 📊 Modèles Machine Learning

### XGBoost AQI Prediction
- **Features**: Température, humidité, vent, données historiques
- **Target**: AQI (Air Quality Index)
- **Performance**: RMSE < 15 sur les données de test

### Classification Scikit-learn
- **Classes**: Bon, Modéré, Mauvais, Dangereux
- **Algorithmes**: Random Forest, SVM
- **Accuracy**: > 85% sur validation

---

## 🌐 Déploiement

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Render/Heroku)
```bash
cd backend
# Déployer selon la plateforme choisie
```

### Demo en ligne
🔗 [airwatch-cameroun.vercel.app](https://airwatch-cameroun.vercel.app)

---

## 👥 Équipe

- **Développeur Lead** : EL SONK JIMMY
- **Data Scientists** : [Tes coéquipiers]

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à soumettre une Pull Request.

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- **IndabaX Cameroun** pour l'organisation du hackathon
- **Supabase** pour l'infrastructure de base de données
- **XGBoost** et **Scikit-learn** équipes pour les outils ML

---

## 📞 Contact

Pour des questions ou suggestions :
- **Email**: elsonkjimmy@gmail.com
- **GitHub**: [@elsonkjimmy](https://github.com/elsonkjimmy)
- **LinkedIn**: [Jimmy Mafo](https://www.linkedin.com/in/jimmy-d-9638a1329)

---

<p align="center">
  <em>🌍 Construit pour un avenir plus vert avec ❤️ et React + FastAPI</em>
</p>
