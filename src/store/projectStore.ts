import { create } from 'zustand';
// 1. IMPORT THE PERSIST MIDDLEWARE
import { persist } from 'zustand/middleware';

interface Asset {
  category: string;
  description: string;
  quantity?: number;
}

interface Scene {
  location: string;
  assets: Asset[];
}

interface Project {
  title: string;
  agency?: string;
  scenes: Scene[];
}

interface ProjectStore {
  activeProject: any | null;
  isGuestMode: boolean; // <-- 1. ADD THIS
  setActiveProject: (project: any | null) => void;
  clearProject: () => void;
  setGuestMode: (isGuest: boolean) => void; // <-- 2. ADD THIS
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      activeProject: null,
      isGuestMode: false, // <-- 3. DEFAULT TO FALSE
      setActiveProject: (project) => set({ activeProject: project }),
      clearProject: () => set({ activeProject: null }),
      setGuestMode: (isGuest) => set({ isGuestMode: isGuest }), // <-- 4. ADD THE FUNCTION
    }),
    {
      name: 'cineos-guest-storage', 
    }
  )
);