-- 1. Tables de base
CREATE TABLE users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('citoyen', 'asso', 'gouv')) DEFAULT 'citoyen',
    profile_type TEXT CHECK (profile_type IN ('parent', 'sportif', 'asthmatique', 'agriculteur', 'travailleur_exterieur')) DEFAULT 'parent',
    ville TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE signalements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    ville TEXT,
    aqi_detecte INTEGER,
    type_pollution TEXT,
    niveau INTEGER CHECK (niveau IN (1, 2, 3)),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ville_id TEXT NOT NULL,
    date DATE NOT NULL,
    aqi_predit INTEGER NOT NULL,
    pm25 FLOAT,
    type_pollution TEXT,
    niveau INTEGER CHECK (niveau IN (1, 2, 3)),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE zones_surveillees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ville TEXT NOT NULL,
    region TEXT NOT NULL,
    aqi_actuel INTEGER,
    dernier_update TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE alertes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ville TEXT NOT NULL,
    niveau INTEGER NOT NULL,
    message TEXT,
    destinataires TEXT[], -- roles concernés
    envoye_le TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE zones_reboisement (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ville TEXT NOT NULL,
    score_priorite FLOAT,
    ndvi FLOAT, -- Indice de végétation
    vent_dominant TEXT,
    especes_recommandees TEXT[],
    geom GEOMETRY(POLYGON, 4326), -- Nécessite l'extension PostGIS
    impact_estime FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activation du RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones_surveillees ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones_reboisement ENABLE ROW LEVEL SECURITY;

-- 3. Politiques RLS (Exemples)
-- Citoyen peut lire toutes les predictions et ses propres signalements
CREATE POLICY "Citoyen_Read_Predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Citoyen_Manage_Own_Signalements" ON signalements FOR ALL USING (auth.uid() = user_id);

-- ONG peut tout lire + zones de reboisement
CREATE POLICY "Asso_Read_All" ON zones_reboisement FOR SELECT USING (true);

-- Gouvernement a accès total
CREATE POLICY "Gouv_Manage_All" ON alertes FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'gouv')
);
