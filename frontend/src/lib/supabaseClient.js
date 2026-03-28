import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification stricte : l'URL doit exister et commencer par http
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http');

export const supabase = (isValidUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn(
    "⚠️ Configuration Supabase manquante ou invalide.\n" +
    "Le mode 'Citoyen' fonctionnera normalement (accès libre).\n" +
    "Pour activer les modes 'Association' et 'Gouvernement', veuillez remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier frontend/.env avec des valeurs valides."
  );
}
