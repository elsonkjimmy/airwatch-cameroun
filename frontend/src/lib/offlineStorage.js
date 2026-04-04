/**
 * Service de stockage offline avec IndexedDB
 * Remplace Supabase pour un fonctionnement 100% hors-ligne
 */

const DB_NAME = 'airwatch_offline_db';
const DB_VERSION = 1;

let db = null;

// Ouvrir/créer la base de données
export const initOfflineDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Store pour les signalements citoyens
      if (!database.objectStoreNames.contains('signalements')) {
        const signalementStore = database.createObjectStore('signalements', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        signalementStore.createIndex('ville', 'ville', { unique: false });
        signalementStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Store pour les préférences utilisateur
      if (!database.objectStoreNames.contains('preferences')) {
        database.createObjectStore('preferences', { keyPath: 'key' });
      }

      // Store pour les alertes sauvegardées
      if (!database.objectStoreNames.contains('alertes')) {
        const alerteStore = database.createObjectStore('alertes', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        alerteStore.createIndex('ville', 'ville', { unique: false });
        alerteStore.createIndex('niveau', 'niveau', { unique: false });
      }

      // Store pour l'historique des données consultées
      if (!database.objectStoreNames.contains('historique')) {
        const historiqueStore = database.createObjectStore('historique', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        historiqueStore.createIndex('ville', 'ville', { unique: false });
        historiqueStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
};

// === SIGNALEMENTS ===

export const addSignalement = async (signalement) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['signalements'], 'readwrite');
    const store = transaction.objectStore('signalements');
    
    const data = {
      ...signalement,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    const request = store.add(data);
    request.onsuccess = () => resolve({ id: request.result, ...data });
    request.onerror = () => reject(request.error);
  });
};

export const getSignalements = async (ville = null) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['signalements'], 'readonly');
    const store = transaction.objectStore('signalements');
    
    let request;
    if (ville) {
      const index = store.index('ville');
      request = index.getAll(ville);
    } else {
      request = store.getAll();
    }
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteSignalement = async (id) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['signalements'], 'readwrite');
    const store = transaction.objectStore('signalements');
    const request = store.delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

// === PREFERENCES ===

export const setPreference = async (key, value) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['preferences'], 'readwrite');
    const store = transaction.objectStore('preferences');
    const request = store.put({ key, value, updatedAt: new Date().toISOString() });
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const getPreference = async (key, defaultValue = null) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['preferences'], 'readonly');
    const store = transaction.objectStore('preferences');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.value ?? defaultValue);
    request.onerror = () => reject(request.error);
  });
};

// === ALERTES ===

export const addAlerte = async (alerte) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['alertes'], 'readwrite');
    const store = transaction.objectStore('alertes');
    
    const data = {
      ...alerte,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    const request = store.add(data);
    request.onsuccess = () => resolve({ id: request.result, ...data });
    request.onerror = () => reject(request.error);
  });
};

export const getAlertes = async (ville = null) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['alertes'], 'readonly');
    const store = transaction.objectStore('alertes');
    
    let request;
    if (ville) {
      const index = store.index('ville');
      request = index.getAll(ville);
    } else {
      request = store.getAll();
    }
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const markAlerteAsRead = async (id) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['alertes'], 'readwrite');
    const store = transaction.objectStore('alertes');
    
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const alerte = getRequest.result;
      if (alerte) {
        alerte.read = true;
        const updateRequest = store.put(alerte);
        updateRequest.onsuccess = () => resolve(true);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        resolve(false);
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// === HISTORIQUE ===

export const addHistorique = async (entry) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['historique'], 'readwrite');
    const store = transaction.objectStore('historique');
    
    const data = {
      ...entry,
      date: new Date().toISOString()
    };
    
    const request = store.add(data);
    request.onsuccess = () => resolve({ id: request.result, ...data });
    request.onerror = () => reject(request.error);
  });
};

export const getHistorique = async (ville = null, limit = 100) => {
  const database = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(['historique'], 'readonly');
    const store = transaction.objectStore('historique');
    
    let request;
    if (ville) {
      const index = store.index('ville');
      request = index.getAll(ville);
    } else {
      request = store.getAll();
    }
    
    request.onsuccess = () => {
      const results = request.result
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

// === UTILITAIRES ===

export const clearAllData = async () => {
  const database = await initOfflineDB();
  const stores = ['signalements', 'preferences', 'alertes', 'historique'];
  
  return Promise.all(stores.map(storeName => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }));
};

export const getStorageStats = async () => {
  const database = await initOfflineDB();
  const stores = ['signalements', 'preferences', 'alertes', 'historique'];
  const stats = {};
  
  await Promise.all(stores.map(storeName => {
    return new Promise((resolve) => {
      const transaction = database.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        stats[storeName] = countRequest.result;
        resolve();
      };
      countRequest.onerror = () => {
        stats[storeName] = 0;
        resolve();
      };
    });
  }));
  
  return stats;
};

// Vérifier si on est en mode offline
export const isOffline = () => !navigator.onLine;

// Écouter les changements de connexion
export const onConnectionChange = (callback) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
  
  return () => {
    window.removeEventListener('online', () => callback(true));
    window.removeEventListener('offline', () => callback(false));
  };
};
