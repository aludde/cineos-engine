'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, Reorder } from 'framer-motion';
import { LayoutList, Calendar, IndianRupee, Download, MessageCircle, Loader2, GripVertical, Wand2, Save } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function SchedulingHub() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [scenes, setScenes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Data
  useEffect(() => {
    async function loadScheduleData() {
      try {
        const { data: projData, error: projError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (projError) throw projError;
        setProject(projData);

        const { data: sceneData, error: sceneError } = await supabase
          .from('scenes')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true }); // Default to script order

        if (sceneError) throw sceneError;
        setScenes(sceneData || []);

      } catch (error) {
        console.error("Failed to load schedule:", error);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) loadScheduleData();
  }, [projectId]);

  // --- THE AI OPTIMIZER ---
  // Groups scenes by Location -> Setting (INT/EXT) -> Time of Day
  const handleAutoSchedule = () => {
    const sortedScenes = [...scenes].sort((a, b) => {
      // 1. Sort by Location
      const locCompare = (a.location || '').localeCompare(b.location || '');
      if (locCompare !== 0) return locCompare;
      
      // 2. Sort by INT/EXT
      const setCompare = (a.setting || '').localeCompare(b.setting || '');
      if (setCompare !== 0) return setCompare;
      
      // 3. Sort by DAY/NIGHT
      return (a.time_of_day || '').localeCompare(b.time_of_day || '');
    });
    
    setScenes(sortedScenes);
  };
   const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      const updates = scenes.map((scene, index) => (
        supabase.from('scenes').update({ sort_order: index }).eq('id', scene.id)
      ));
      
      await Promise.all(updates);
      alert("Schedule Saved Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save schedule.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#E62B1E] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#E62B1E] flex flex-col relative overflow-hidden">
      <Header />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#E62B1E] opacity-[0.02] blur-[150px] rounded-full pointer-events-none" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col">
        
        {/* TOP SECTION: Project Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800 pb-8 mb-8 shrink-0">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-2 uppercase">{project?.title}</h1>
            <p className="text-sm text-[#E62B1E] font-bold tracking-[0.2em] uppercase">Dynamic Stripboard</p>
          </div>
          
          <div className="flex gap-4 mt-6 md:mt-0">
            <button className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors border border-neutral-800">
              <Download className="w-4 h-4" /> PDF
            </button>
            <button className="flex items-center gap-2 bg-[#E62B1E] hover:bg-white hover:text-black text-white px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </button>
          </div>
        </div>

        {/* MIDDLE SECTION: Hub Navigation */}
        <div className="flex gap-2 mb-8 border-b border-neutral-900 pb-1 shrink-0">
          <button onClick={() => router.push(`/project/${projectId}/breakdown`)} className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent text-neutral-600 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors">
            <LayoutList className="w-4 h-4" /> Breakdown
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border-b-2 border-[#E62B1E] text-white font-bold uppercase tracking-widest text-sm bg-neutral-950/50">
            <Calendar className="w-4 h-4" /> Schedule
          </button>
          <button onClick={() => router.push(`/project/${projectId}/budgeting`)} className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent text-neutral-600 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors">
            <IndianRupee className="w-4 h-4" /> Budget
          </button>
        </div>

        {/* BOTTOM SECTION: The Stripboard */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex justify-between items-center mb-6 shrink-0 border-b border-neutral-900 pb-4">
            <p className="text-neutral-500 text-sm">Drag the strips to manually organize your shoot days.</p>
            
            <div className="flex gap-2">
              <button 
                onClick={handleAutoSchedule}
                className="flex items-center gap-2 text-[#E62B1E] border border-[#E62B1E]/30 bg-[#E62B1E]/5 hover:bg-[#E62B1E] hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all"
              >
                <Wand2 className="w-4 h-4" /> AI Auto-Schedule
              </button>
              
              <button 
                onClick={handleSaveSchedule}
                className="flex items-center gap-2 bg-[#E62B1E] hover:bg-white hover:text-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </div>

          {/* Draggable Area */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <Reorder.Group axis="y" values={scenes} onReorder={setScenes} className="space-y-2">
              {scenes.map((scene, index) => (
                <Reorder.Item 
                  key={scene.id} 
                  value={scene}
                  className="flex items-center gap-4 bg-neutral-950 border border-neutral-900 p-4 cursor-grab active:cursor-grabbing hover:border-neutral-700 transition-colors"
                >
                  <GripVertical className="w-5 h-5 text-neutral-700 shrink-0" />
                  
                  <div className="w-12 h-12 bg-black border border-neutral-800 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-white">{scene.scene_number || index + 1}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="col-span-2">
                      <h3 className="font-bold text-white uppercase tracking-wide truncate">
                        {scene.setting} • {scene.location}
                      </h3>
                      <p className="text-neutral-500 text-sm truncate">{scene.action_summary}</p>
                    </div>
                    
                    <div className="md:col-span-1 md:text-right">
                      <span className={`text-xs font-bold px-3 py-1 uppercase tracking-widest ${
                        (scene.time_of_day || '').toLowerCase().includes('night') 
                          ? 'bg-neutral-900 text-blue-400' 
                          : 'bg-neutral-900 text-yellow-400'
                      }`}>
                        {scene.time_of_day}
                      </span>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>

      </motion.div>
    </main>
  );
}