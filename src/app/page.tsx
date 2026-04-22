'use client';

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700', '800'] });

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  // Check the browser's local storage for a valid token on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleGetStarted = () => {
    // If they have a token, skip auth and go straight to the vault.
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

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 max-w-7xl mx-auto px-6 py-20 relative z-10 w-full flex flex-col items-center justify-center">
        <div className="max-w-4xl mb-24 flex flex-col items-center text-center">
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.9]">
            Stop guessing. <br /><span className="text-neutral-500">Start shooting.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-xl text-neutral-400 font-light mb-12 max-w-xl mx-auto leading-relaxed">
            The single source of truth for Indian ad production. Turn a messy script into a GST-ready bid in 48 seconds.
          </motion.p>
          <motion.div variants={itemVariants}>
            <button 
              onClick={handleGetStarted}
              className={`inline-block bg-[#E62B1E] hover:bg-white hover:text-black text-white px-10 py-5 uppercase transition-all duration-300 transform hover:-translate-y-1 tracking-[0.15em] text-sm font-semibold ${montserrat.className}`}
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}