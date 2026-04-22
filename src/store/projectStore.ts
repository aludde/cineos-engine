import { create } from 'zustand';

// Define the shape of the data your Dashboard is expecting
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

// Create the global store
export const useProjectStore = create<ProjectStore>((set) => ({
  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),
  clearProject: () => set({ activeProject: null }),
}));