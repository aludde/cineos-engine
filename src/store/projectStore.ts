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
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  clearProject: () => void;
}

// 2. WRAP YOUR STORE IN "persist"
export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      activeProject: null,
      setActiveProject: (project) => set({ activeProject: project }),
      clearProject: () => set({ activeProject: null }),
    }),
    {
      name: 'cineos-guest-storage', // This is the secret key saved in their browser
    }
  )
);