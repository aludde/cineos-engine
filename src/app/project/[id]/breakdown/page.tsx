'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutList, Calendar, IndianRupee, Save, Trash2, Plus, Loader2, FileUp, Download, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

export default function BreakdownHub() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingVersionBump, setPendingVersionBump] = useState(false);
  const [isProcessingRevision, setIsProcessingRevision] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const { data: projData } = await supabase.from('projects').select('*').eq('id', projectId).single();
      setProject(projData);
      const { data: assetData } = await supabase.from('assets').select('*').eq('project_id', projectId);
      setAssets(assetData || []);
      setLoading(false);
    }
    if (projectId) loadData();
  }, [projectId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const safeNavigate = (path: string) => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes! Are you sure you want to leave without saving?")) return;
    }
    router.push(path);
  };

  const updateAsset = (id: string, field: string, value: any) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
    setHasUnsavedChanges(true);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setHasUnsavedChanges(true);
  };
  
  const handleAddAsset = (category: string) => {
    setAssets([...assets, { 
      id: `temp-${Date.now()}`, 
      project_id: projectId, 
      scene_id: null, 
      category, 
      description: 'New Item', 
      quantity: 1, 
      unit_price: 0 
    }]);
    setHasUnsavedChanges(true);
  };

  const handleProcessRevision = async (file: File) => {
    if (!file.name.endsWith('.txt')) { alert("Please upload a .txt file."); return; }
    setIsProcessingRevision(true);
    
    try {
      const text = await file.text();
      const response = await fetch('/api/parse', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scriptText: text }),
      });
      
      if (!response.ok) throw new Error("AI Parsing Failed");
      const data = await response.json();
      
      const newAssets: any[] = [];
      
      data.scenes?.forEach((scene: any) => {
        scene.assets?.forEach((asset: any) => {
          const isDuplicate = assets.some(existingAsset => 
            existingAsset.category === asset.category && 
            existingAsset.description.toLowerCase().trim() === asset.description.toLowerCase().trim()
          );

          if (!isDuplicate) {
            newAssets.push({
              id: `temp-rev-${Date.now()}-${Math.random()}`,
              project_id: projectId,
              scene_id: null,
              category: asset.category,
              description: `[NEW] ${asset.description}`,
              quantity: asset.quantity || 1,
              unit_price: 0
            });
          }
        });
      });

      if (newAssets.length > 0) {
        setAssets(prev => [...prev, ...newAssets]);
        setHasUnsavedChanges(true);
        setPendingVersionBump(true); 
        alert(`Revision parsed! Found ${newAssets.length} new unique items. Please review and click 'Save Edits'.`);
      } else {
        alert("Revision parsed, but no new items were found. Everything is already in your breakdown.");
      }

    } catch (error: any) {
      console.error(error);
      alert("Failed to process revision: " + error.message);
    } finally {
      setIsProcessingRevision(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportCSV = () => {
    const headers = ["Category", "Description", "Quantity"];
    const rows = assets.map(a => `"${a.category}","${a.description.replace('[NEW] ', '')}",${a.quantity}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${project?.title || 'Project'}_Breakdown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsAppShare = (categoryFilter?: string) => {
    let text = `*${project?.title || 'Project'} - Breakdown*\n\n`;
    
    Object.entries(categorizedAssets).forEach(([category, items]: [string, any]) => {
      if (categoryFilter && category !== categoryFilter) return; 
      
      text += `*${category.toUpperCase()}*\n`;
      items.forEach((item: any) => {
        text += `- ${item.description.replace('[NEW] ', '')} (x${item.quantity})\n`;
      });
      text += `\n`;
    });

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSaveBreakdown = async () => {
    setIsSaving(true);
    try {
      const { error: deleteError } = await supabase.from('assets').delete().eq('project_id', projectId);
      if (deleteError) throw deleteError;

      if (assets.length > 0) {
        const cleanAssets = assets.map(({ id, ...rest }) => ({
          ...rest,
          description: rest.description.replace('[NEW] ', '')
        }));
        const { error: insertError } = await supabase.from('assets').insert(cleanAssets);
        if (insertError) throw insertError;
        
        setAssets(assets.map(a => ({ ...a, description: a.description.replace('[NEW] ', '') })));
      }
      
      if (pendingVersionBump) {
        const newVersion = (project.version || 1) + 1;
        await supabase.from('projects').update({ version: newVersion }).eq('id', projectId);
        setProject({ ...project, version: newVersion });
        setPendingVersionBump(false);
      }

      setHasUnsavedChanges(false);
      alert("Breakdown Saved Successfully.");
    } catch (e: any) { 
      console.error("SAVE CRASH:", e);
      alert("Database Error: " + (e.message || "Failed to save breakdown."));
    } finally { 
      setIsSaving(false); 
    }
  };

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
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter mb-2">{project?.title}</h1>
            <p className="text-sm text-[#E62B1E] font-bold uppercase tracking-widest">
              Editable Breakdown {hasUnsavedChanges && <span className="text-neutral-500 lowercase tracking-normal font-normal ml-2">*unsaved changes</span>}
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={handleExportCSV} 
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors border border-neutral-800"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button 
              onClick={() => handleWhatsAppShare()} 
              className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors border border-[#25D366]/20"
            >
              <MessageCircle className="w-4 h-4" /> Share All
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between mb-8 border-b border-neutral-900 pb-1 gap-4">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar">
            <button className="flex items-center gap-2 px-6 py-3 border-b-2 border-[#E62B1E] text-white font-bold uppercase tracking-widest text-sm bg-neutral-950/50 shrink-0">
              <LayoutList className="w-4 h-4" /> Breakdown
            </button>
            <button onClick={() => safeNavigate(`/project/${projectId}/scheduling`)} className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent text-neutral-600 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors shrink-0">
              <Calendar className="w-4 h-4" /> Schedule
            </button>
            <button onClick={() => safeNavigate(`/project/${projectId}/budgeting`)} className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent text-neutral-600 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors shrink-0">
              <IndianRupee className="w-4 h-4" /> Budget
            </button>
          </div>
          
          <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleProcessRevision(e.target.files[0])} accept=".txt" className="hidden" />

          <div className="flex gap-2 shrink-0">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isProcessingRevision}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors"
            >
              {isProcessingRevision ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />} 
              Sync V{project?.version ? (pendingVersionBump ? project.version + 1 : project.version + 1) : 2} Script
            </button>
            
            <button 
              onClick={handleSaveBreakdown} 
              disabled={!hasUnsavedChanges && !isSaving}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors shrink-0 ${hasUnsavedChanges ? 'bg-[#E62B1E] hover:bg-white hover:text-black text-white' : 'bg-neutral-900 text-neutral-600 cursor-not-allowed border border-neutral-800'}`}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Edits
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(categorizedAssets).map(([category, items]: [string, any]) => (
            <div key={category} className="bg-neutral-950 border border-neutral-900 p-6 flex flex-col">
              
              <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                <h3 className="text-[#E62B1E] font-bold uppercase tracking-widest text-sm">{category}</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleWhatsAppShare(category)} 
                    className="text-[#25D366]/60 hover:text-[#25D366] transition-colors"
                    title={`WhatsApp ${category} List`}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleAddAsset(category)} 
                    className="text-neutral-500 hover:text-white transition-colors"
                    title={`Add new ${category}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <ul className="space-y-4 flex-1">
                {items.map((item: any) => (
                  <motion.li 
                    layout 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    key={item.id} 
                    className="flex items-center gap-3 group"
                  >
                    <input 
                      type="text" 
                      value={item.description} 
                      onChange={(e) => updateAsset(item.id, 'description', e.target.value)} 
                      className={`flex-1 bg-transparent border-b hover:border-neutral-600 focus:border-[#E62B1E] focus:outline-none font-light text-sm transition-colors py-1 ${item.description.includes('[NEW]') ? 'text-green-400 border-green-900' : 'text-neutral-300 border-neutral-800'}`}
                    />
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateAsset(item.id, 'quantity', Number(e.target.value))} 
                      className="w-12 bg-black border border-neutral-800 text-center text-xs font-bold text-neutral-400 py-1 focus:border-[#E62B1E] outline-none" 
                    />
                    <button 
                      onClick={() => handleDeleteAsset(item.id)} 
                      className="text-neutral-700 hover:text-[#E62B1E] transition-colors p-1"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}