# 🌍 AirWatch Cameroun
**Système Intelligent de Veille et Prédiction de la Qualité de l'Air**
*IndabaX Cameroun 2026 — Hackathon IA & Résilience Climatique*

## 🚀 Le Projet
AirWatch est une plateforme interactive permettant de surveiller et de prédire la qualité de l'air dans 42 villes du Cameroun. Elle connecte les citoyens, les associations et le gouvernement pour une action climatique coordonnée.

## 🛠 Stack Technique
- **Frontend** : React, Vite, Tailwind CSS, Leaflet.js, Recharts, Zustand.
- **Backend** : FastAPI (Python), Pydantic.
- **Base de Données** : Supabase (PostgreSQL) + RLS.
- **Intelligence Artificielle** : XGBoost, Scikit-learn (Modèles de prédiction AQI et classification).
- **Alertes** : Twilio (SMS), WebSocket (Temps réel).

## 📂 Structure du projet
- `frontend/` : Application Web Mobile-First.
- `backend/` : API REST et Services IA.
- `supabase_schema.sql` : Structure de la base de données.

## 💻 Installation
```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend && npm install
npm run dev
```

## 👥 Équipe
- **Développeur Lead** : EL SONK JIMMY
- **Data Scientists** : [Tes coéquipiers]
