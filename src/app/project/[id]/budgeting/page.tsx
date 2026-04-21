'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutList, Calendar, IndianRupee, Download, MessageCircle, Loader2, Save } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function BudgetingHub() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [totalDays, setTotalDays] = useState(1);

  // Financial Constants (Standard for Indian Ad Production)
  const GST_RATE = 0.18;
  const AGENCY_FEE_RATE = 0.10;

  useEffect(() => {
    async function loadBudgetData() {
      try {
        const { data: projData } = await supabase.from('projects').select('*').eq('id', projectId).single();
        setProject(projData);

        // We fetch scenes just to count the total shoot days
        const { data: sceneData } = await supabase.from('scenes').select('id').eq('project_id', projectId);
        // For this MVP, we assume each scene is a segment, but a real line producer 
        // would group them. We'll default to a "Total Days" calculation or let them override.
        setTotalDays(Math.max(1, Math.ceil((sceneData?.length || 1) / 3))); 

        const { data: assetData } = await supabase.from('assets').select('*').eq('project_id', projectId);
        setAssets(assetData || []);

      } catch (error) {
        console.error("Budget Load Error:", error);
      } finally {
        setLoading(false);
      }
    }
    if (projectId) loadBudgetData();
  }, [projectId]);

  const updateAssetPrice = (id: string, price: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, unit_price: price } : a));
  };

  const saveBudget = async () => {
    setIsSaving(true);
    try {
      const updates = assets.map(asset => (
        supabase.from('assets').update({ unit_price: asset.unit_price }).eq('id', asset.id)
      ));
      await Promise.all(updates);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations
  const subtotal = assets.reduce((sum, a) => sum + (Number(a.unit_price || 0) * a.quantity), 0);
  const agencyFee = subtotal * AGENCY_FEE_RATE;
  const taxableValue = subtotal + agencyFee;
  const gst = taxableValue * GST_RATE;
  const grandTotal = taxableValue + gst;

  if (loading) return <main className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-12 h-12 text-[#E62B1E] animate-spin" /></main>;

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#E62B1E] flex flex-col relative overflow-hidden">
      <Header />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#E62B1E] opacity-[0.02] blur-[150px] rounded-full pointer-events-none" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-800 pb-8 mb-8">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-2 uppercase">{project?.title}</h1>
            <p className="text-sm text-[#E62B1E] font-bold tracking-[0.2em] uppercase">Financial Engine</p>
          </div>
          <div className="flex gap-4 mt-6 md:mt-0">
            <button onClick={saveBudget} className="flex items-center gap-2 bg-white text-black hover:bg-[#E62B1E] hover:text-white px-5 py-3 text-sm font-bold uppercase tracking-widest transition-all">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Estimates
            </button>
            <button className="flex items-center gap-2 bg-[#E62B1E] hover:bg-white hover:text-black text-white px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp Bid
            </button>
          </div>
        </div>

        {/* Hub Navigation */}
        <div className="flex gap-2 mb-8 border-b border-neutral-900 pb-1">
          <button onClick={() => router.push(`/project/${projectId}/breakdown`)} className="px-6 py-3 border-b-2 border-transparent text-neutral-600 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-2"><LayoutList className="w-4 h-4" /> Breakdown</button>
          <button onClick={() => router.push(`/project/${projectId}/scheduling`)} className="px-6 py-3 border-b-2 border-transparent text-neutral-600 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule</button>
          <button className="px-6 py-3 border-b-2 border-[#E62B1E] text-white font-bold uppercase tracking-widest text-sm bg-neutral-950/50 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Budget</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Line Items */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.3em] mb-6">Asset Line Items</h3>
            {assets.map((asset) => (
              <div key={asset.id} className="bg-neutral-950 border border-neutral-900 p-4 flex items-center justify-between group hover:border-neutral-700 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs text-[#E62B1E] font-bold uppercase tracking-tighter mb-1">{asset.category}</span>
                  <span className="text-sm font-light text-white">{asset.description} (x{asset.quantity})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-600 text-xs font-bold">₹</span>
                  <input 
                    type="number" 
                    value={asset.unit_price || ''} 
                    onChange={(e) => updateAssetPrice(asset.id, Number(e.target.value))}
                    className="bg-black border border-neutral-800 text-white text-right px-3 py-2 w-32 focus:outline-none focus:border-[#E62B1E] transition-colors font-mono"
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right: The Final Bid Card */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 border border-neutral-800 p-8 sticky top-8">
              <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-8 border-b border-neutral-800 pb-4">Estimate Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Agency Fee (10%)</span>
                  <span className="font-mono">₹{agencyFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-neutral-800 pt-4">
                  <span className="text-neutral-500">Taxable Value</span>
                  <span className="font-mono text-[#E62B1E]">₹{taxableValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">GST (18%)</span>
                  <span className="font-mono">₹{gst.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="bg-black p-6 border border-neutral-800">
                <span className="text-xs text-neutral-500 uppercase font-bold tracking-widest block mb-2">Grand Total</span>
                <span className="text-4xl font-extrabold tracking-tighter">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              
              <p className="text-[10px] text-neutral-600 mt-6 leading-relaxed uppercase tracking-tighter">
                * This is an AI-generated logistical estimate. Final quotes may vary based on vendor availability and shoot location permits.
              </p>
            </div>
          </div>
        </div>

      </motion.div>
    </main>
  );
}