'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UploadCloud, Loader2, Check } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function NewProjectGateway() {
  const router = useRouter();
  const [step, setStep] = useState<'UPLOAD' | 'PROCESSING' | 'CONFIRM' | 'SAVING'>('UPLOAD');
  const [parsedData, setParsedData] = useState<any>(null);
  const [projectName, setProjectName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.txt')) { alert("Please upload a .txt file script."); return; }
    setStep('PROCESSING');
    try {
      const text = await file.text();
      const response = await fetch('/api/parse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scriptText: text }),
      });
      if (!response.ok) throw new Error("AI Parsing Failed");
      const data = await response.json();
      setParsedData(data);
      setProjectName(data.title || 'Untitled Project');
      setAgencyName(data.agency || '');
      setStep('CONFIRM');
    } catch (error) {
      console.error(error);
      setStep('UPLOAD');
    }
  };

  const saveToDatabase = async () => {
    if (!projectName) return;
    setStep('SAVING');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth'); return; }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{ title: projectName, agency: agencyName, user_id: session.user.id }])
        .select().single();
      if (projectError) throw projectError;

      const scenesToInsert = parsedData.scenes.map((scene: any) => ({
        project_id: project.id, scene_number: scene.sceneNumber, setting: scene.setting, location: scene.location, time_of_day: scene.timeOfDay, action_summary: scene.actionSummary
      }));
      const { data: savedScenes, error: sceneError } = await supabase.from('scenes').insert(scenesToInsert).select();
      if (sceneError) throw sceneError;

      const assetsToInsert: any[] = [];
      parsedData.scenes.forEach((parsedScene: any, index: number) => {
        parsedScene.assets.forEach((asset: any) => {
          assetsToInsert.push({ project_id: project.id, scene_id: savedScenes[index].id, category: asset.category, description: asset.description, quantity: asset.quantity || 1 });
        });
      });
      if (assetsToInsert.length > 0) await supabase.from('assets').insert(assetsToInsert);

      router.push(`/project/${project.id}/breakdown`);
    } catch (error) {
      console.error(error);
      setStep('CONFIRM');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center relative z-10 px-6 py-12">
        {(step === 'UPLOAD' || step === 'PROCESSING') && (
          <>
            <div className="mb-10 text-center"><h2 className="text-4xl font-extrabold mb-3">Initialize Project</h2><p className="text-neutral-500">Drop your A/V Script below.</p></div>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && processFile(e.target.files[0])} accept=".txt" className="hidden" />
            <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]); }} onClick={() => step !== 'PROCESSING' && fileInputRef.current?.click()} className={`w-full p-16 text-center transition-all duration-500 border border-dashed rounded-none relative overflow-hidden ${step === 'PROCESSING' ? 'border-[#E62B1E] cursor-wait' : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-600 cursor-pointer'}`}>
              <div className="flex flex-col items-center space-y-6 relative z-10">
                <div className={`p-5 rounded-full ${step === 'PROCESSING' ? 'bg-[#E62B1E]/20' : 'bg-black border border-neutral-800'}`}>
                  {step === 'PROCESSING' ? <Loader2 className="w-10 h-10 text-[#E62B1E] animate-spin" /> : <UploadCloud className="w-10 h-10 text-neutral-500" />}
                </div>
                <div>
                  <h3 className={`text-2xl font-bold mb-2 ${step === 'PROCESSING' ? 'text-white' : 'text-[#E62B1E]'}`}>{step === 'PROCESSING' ? 'Extracting Assets...' : 'Launch Script Parser'}</h3>
                  <p className="text-sm text-neutral-500 font-light">Click or drag & drop a .txt script.</p>
                </div>
              </div>
            </div>
          </>
        )}

        {(step === 'CONFIRM' || step === 'SAVING') && (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full bg-neutral-950 border border-neutral-900 p-8">
            <div className="mb-8 border-b border-neutral-800 pb-6 text-center">
              <div className="mx-auto w-12 h-12 bg-[#E62B1E]/10 rounded-full flex items-center justify-center mb-4"><Check className="w-6 h-6 text-[#E62B1E]" /></div>
              <h2 className="text-2xl font-bold text-white">Extraction Complete</h2>
            </div>
            <div className="space-y-6">
              <div><label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Project Title</label><input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-[#E62B1E]" /></div>
              <div><label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Agency</label><input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-[#E62B1E]" /></div>
              <button onClick={saveToDatabase} disabled={step === 'SAVING' || !projectName} className="w-full bg-[#E62B1E] hover:bg-white hover:text-black text-white py-4 font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center gap-2">
                {step === 'SAVING' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Enter Workspace'}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}