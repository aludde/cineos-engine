'use client';

import { useProjectStore } from '@/store/projectStore';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const activeProject = useProjectStore((state) => state.activeProject);

  if (!activeProject) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-[#E62B1E] mb-4">No Active Project</h2>
          <p className="text-neutral-500">Please upload a script to launch</p>
        </div>
      </main>
    );
  }

  // Engine Logic: Group all assets from all scenes by their Category
  const categorizedAssets = activeProject.scenes.reduce((acc, scene) => {
    scene.assets.forEach((asset) => {
      if (!acc[asset.category]) {
        acc[asset.category] = [];
      }
      // Prevent duplicates in the overall list
      if (!acc[asset.category].some((a) => a.description === asset.description)) {
        acc[asset.category].push(asset);
      }
    });
    return acc;
  }, {} as Record<string, typeof activeProject.scenes[0]['assets']>);

  // Extract unique locations
  const uniqueLocations = Array.from(new Set(activeProject.scenes.map(s => s.location)));

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <Header />
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#E62B1E] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full relative z-10"
      >
        {/* Project Header */}
        <div className="mb-12 border-b border-neutral-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 uppercase">
            {activeProject.title}
          </h1>
          {activeProject.agency && (
            <p className="text-sm text-[#E62B1E] font-bold tracking-[0.2em] uppercase">
              Agency: {activeProject.agency}
            </p>
          )}
        </div>

        {/* Categorized Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Locations Column */}
          <div className="bg-neutral-950 border border-neutral-900 p-6">
            <h3 className="text-[#E62B1E] font-bold uppercase tracking-widest text-sm mb-4 border-b border-neutral-800 pb-2">
              Locations ({uniqueLocations.length})
            </h3>
            <ul className="space-y-3">
              {uniqueLocations.map((loc, idx) => (
                <li key={idx} className="text-neutral-300 font-light text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full" />
                  {loc}
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Asset Columns (Cast, Props, Wardrobe, etc.) */}
          {Object.entries(categorizedAssets).map(([category, assets]) => (
            <div key={category} className="bg-neutral-950 border border-neutral-900 p-6">
              <h3 className="text-[#E62B1E] font-bold uppercase tracking-widest text-sm mb-4 border-b border-neutral-800 pb-2">
                {category} ({assets.length})
              </h3>
              <ul className="space-y-3">
                {assets.map((asset, idx) => (
                  <li key={idx} className="text-neutral-300 font-light text-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-neutral-700 rounded-full mt-1.5 shrink-0" />
                    <span>{asset.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </motion.div>
    </main>
  );
}