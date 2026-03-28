import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // États utilisateur & Auth
      user: null,
      role: 'citoyen', 
      isAuthenticated: false,
      assignedZone: null, // Pour les ONG : 'Littoral', 'Grand Nord', 'Centre', etc.
      
      // Profil Citoyen
      hasSelectedProfile: false,
      profileType: 'parent', 
      
      // Données AQI
      currentAQI: 162,
      currentVille: 'Maroua',
      
      // États d'Interface (UI)
      showCityPicker: false,
      showProfilePicker: false,
      showReportingModal: false,
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setRole: (role) => set({ role }),
      setProfileType: (type) => set({ profileType: type, hasSelectedProfile: true, showProfilePicker: false }),
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      setCurrentAQI: (aqi) => set({ currentAQI: aqi }),
      setCurrentVille: (ville) => set({ currentVille: ville }),
      
      // Actions UI
      setShowCityPicker: (val) => set({ showCityPicker: val }),
      setShowProfilePicker: (val) => set({ showProfilePicker: val }),
      setShowReportingModal: (val) => set({ showReportingModal: val }),
      
      logout: () => set({ 
        user: null, 
        role: 'citoyen', 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'airwatch-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStore;
