'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutList, Calendar, IndianRupee, Save, Trash2, Plus, Loader2, FileUp, Download, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import { useProjectStore } from '@/store/projectStore';

export default function GuestBreakdownHub() {
  const router = useRouter();
  
  // 1. ONLY Read from Local Storage
  const activeProject = useProjectStore((state: any) => state.activeProject);
  
  const [project, setProject] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- THE PAYWALL TRIGGER ---
  const triggerPaywall = (actionName: string) => {
    alert(`${actionName} is a premium feature! Create a free account to unlock full project management.`);
    router.push('/auth'); 
  };

  useEffect(() => {
    if (activeProject) {
      setProject(activeProject);
      const guestAssets: any[] = [];
      activeProject.scenes?.forEach((scene: any) => {
        scene.assets?.forEach((asset: any) => {
          guestAssets.push({
            id: `guest-asset-${Date.now()}-${Math.random()}`,
            category: asset.category,
            description: asset.description,
            quantity: asset.quantity || 1,
          });
        });
      });
      setAssets(guestAssets);
    }
    setLoading(false);
  }, [activeProject]);

  const categorizedAssets = assets.reduce((acc: any, asset: any) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {});

  if (loading) return <main className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-12 h-12 text-[#E62B1E] animate-spin" /></main>;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <Header />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#E62B1E] opacity-[0.02] blur-[150px] rounded-full pointer-events-none" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between border-b border-neutral-800 pb-8 mb-8 md:items-end gap-6">
          <div>
            <h1 onClick={() => triggerPaywall("Editing the Project Title")} className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter mb-2 cursor-pointer">
              {project?.title || "Untitled Project"}
            </h1>
            <p className="text-sm text-[#E62B1E] font-bold uppercase tracking-widest">Read-Only Breakdown</p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <button onClick={() => triggerPaywall("Exporting to CSV")} className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors border border-neutral-800">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => triggerPaywall("Sharing")} className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors border border-[#25D366]/20">
              <MessageCircle className="w-4 h-4" /> Share All
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-neutral-900 pb-1 gap-4">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar">
            <button className="flex items-center gap-2 px-6 py-3 border-b-2 border-[#E62B1E] text-white font-bold uppercase tracking-widest text-sm bg-neutral-950/50 shrink-0">
              <LayoutList className="w-4 h-4" /> Breakdown
            </button>
            <button onClick={() => triggerPaywall("Scheduling")} className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent text-neutral-600 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors shrink-0">
              <Calendar className="w-4 h-4" /> Schedule
            </button>
            <button onClick={() => triggerPaywall("Budgeting")} className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent text-neutral-600 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors shrink-0">
              <IndianRupee className="w-4 h-4" /> Budget
            </button>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button onClick={() => triggerPaywall("Script Syncing")} className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors">
              <FileUp className="w-4 h-4" /> Sync Script
            </button>
            <button onClick={() => triggerPaywall("Cloud Saving")} className="flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors shrink-0 bg-[#E62B1E] hover:bg-white hover:text-black text-white">
               <Save className="w-4 h-4" /> Save Edits
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(categorizedAssets).map(([category, items]: [string, any]) => (
            <div key={category} className="bg-neutral-950 border border-neutral-900 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                <h3 className="text-[#E62B1E] font-bold uppercase tracking-widest text-sm">{category}</h3>
                <div className="flex gap-3">
                  <button onClick={() => triggerPaywall("Sharing")} className="text-[#25D366]/60 hover:text-[#25D366] transition-colors"><MessageCircle className="w-4 h-4" /></button>
                  <button onClick={() => triggerPaywall("Adding Items")} className="text-neutral-500 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              <ul className="space-y-4 flex-1">
                {items.map((item: any) => (
                  <li key={item.id} className="flex items-center gap-3 group">
                    <input type="text" value={item.description} readOnly onClick={() => triggerPaywall("Editing Items")} className="flex-1 bg-transparent border-b border-neutral-800 font-light text-sm py-1 cursor-pointer" />
                    <input type="number" value={item.quantity} readOnly onClick={() => triggerPaywall("Editing Quantities")} className="w-12 bg-black border border-neutral-800 text-center text-xs font-bold text-neutral-400 py-1 cursor-pointer" />
                    <button onClick={() => triggerPaywall("Deleting Items")} className="text-neutral-700 hover:text-[#E62B1E] transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
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