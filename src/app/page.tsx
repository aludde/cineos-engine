'use client';

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Play, Shield, Zap, FileSpreadsheet, Share2, Lock } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Montserrat } from 'next/font/google';
import { useProjectStore } from '@/store/projectStore';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700', '800'] });

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  
  const setGuestMode = useProjectStore((state: any) => state.setGuestMode);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleGuestStart = () => {
    setGuestMode(true);
    router.push('/project/new');
  };

  const handleGetStarted = () => {
    setGuestMode(false); 

    if (session) {
      router.push('/projects');
    } else {
      router.push('/auth');
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#E62B1E] flex flex-col relative overflow-hidden">
      <Header />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E62B1E] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 w-full max-w-7xl mx-auto px-6 pt-20 pb-24 relative z-10 flex flex-col items-center">
        
        {/* HERO SECTION - Restored exact original typography */}
        <div className="text-center max-w-4xl mx-auto mb-24 flex flex-col items-center">
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.9]">
            Stop guessing. <br /><span className="text-neutral-500">Start shooting.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-neutral-400 font-light mb-12 max-w-xl mx-auto leading-relaxed">
            The single source of truth for Indian ad production. Turn a messy script into a GST-ready bid in 48 seconds.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {session ? (
              <button 
                onClick={handleGetStarted}
                className={`inline-block bg-[#E62B1E] border border-[#E62B1E] hover:bg-white hover:border-white hover:text-black text-white px-10 py-5 uppercase transition-all duration-300 transform hover:-translate-y-1 tracking-[0.15em] text-sm font-semibold w-full sm:w-auto ${montserrat.className}`}
              >
                Go to Vault
              </button>
            ) : (
              <>
                <button 
                  onClick={handleGuestStart}
                  className={`inline-flex items-center justify-center gap-2 bg-[#E62B1E] border border-[#E62B1E] hover:bg-white hover:border-white hover:text-black text-white px-10 py-5 uppercase transition-all duration-300 transform hover:-translate-y-1 tracking-[0.15em] text-sm font-semibold w-full sm:w-auto ${montserrat.className}`}
                >
                  <Zap className="w-4 h-4" /> Try for Free
                </button>

                <button 
                  onClick={handleGetStarted}
                  className={`inline-block bg-transparent border border-neutral-700 hover:border-white text-neutral-300 hover:text-white px-10 py-5 uppercase transition-all duration-300 transform hover:-translate-y-1 tracking-[0.15em] text-sm font-semibold w-full sm:w-auto ${montserrat.className}`}
                >
                  Sign In
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* CAPABILITIES SECTION */}
        <motion.div variants={itemVariants} className="w-full max-w-6xl mx-auto mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold uppercase tracking-tighter mb-4">What <span className="text-3xl font-extrabold uppercase tracking-tighter text-[#E62B1E] hover:text-white transition-colors">CINEOS</span> CAN DO</h2>
            <div className="w-12 h-1 bg-[#E62B1E] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-950 border border-neutral-900 p-8 hover:border-neutral-700 transition-colors">
              <Zap className="w-8 h-8 text-[#E62B1E] mb-6" />
              <h3 className="text-lg font-bold uppercase tracking-widest mb-3">AI Breakdown Engine</h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Drop in any PDF or TXT script. CineOS instantly extracts cast, props, wardrobe, and vehicles, isolating background action from hero elements in seconds.
              </p>
            </div>

            <div className="bg-neutral-950 border border-neutral-900 p-8 hover:border-neutral-700 transition-colors">
              <FileSpreadsheet className="w-8 h-8 text-[#E62B1E] mb-6" />
              <h3 className="text-lg font-bold uppercase tracking-widest mb-3">GST-Ready Exports</h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Say goodbye to copy-pasting into Excel. Generate perfectly formatted CSV breakdowns that your accounting team can immediately plug into their bidding templates.
              </p>
            </div>

            <div className="bg-neutral-950 border border-neutral-900 p-8 hover:border-neutral-700 transition-colors">
              <Share2 className="w-8 h-8 text-[#E62B1E] mb-6" />
              <h3 className="text-lg font-bold uppercase tracking-widest mb-3">Instant Crew Sync</h3>
              <p className="text-neutral-400 text-sm font-light leading-relaxed">
                Need to send the Wardrobe list to your stylist right now? One click generates a clean, formatted WhatsApp message for any specific department.
              </p>
            </div>
          </div>
        </motion.div>

        {/* SECURITY & PRIVACY BANNER */}
        <motion.div variants={itemVariants} className="w-full max-w-4xl mx-auto bg-neutral-950 border border-neutral-900 p-8 md:p-12 text-center flex flex-col items-center">
          <Shield className="w-12 h-12 text-[#E62B1E] mb-6" />
          <h2 className="text-2xl font-extrabold uppercase tracking-tighter mb-4">SAFETY & PRIVACY</h2>
          <p className="text-neutral-400 text-sm md:text-base font-light max-w-2xl mx-auto mb-6">
            Your scripts are never used to train public AI models and your project data is isolated to your account.
          </p>
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">
            <Lock className="w-3 h-3" /> 100% Private & Secure
          </div>
        </motion.div>

      </motion.div>

      {/* MINIMAL FOOTER */}
      <footer className="w-full border-t border-neutral-900 py-8 text-center text-xs font-bold text-neutral-700 uppercase tracking-widest relative z-10">
        <p>© {new Date().getFullYear()} CineOS. All rights reserved.</p>
      </footer>
    </main>
  );
}