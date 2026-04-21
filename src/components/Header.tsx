'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Montserrat } from 'next/font/google';
import { supabase } from '@/lib/supabase';
import { LayoutGrid, LogIn } from 'lucide-react';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700', '800'] });

export default function Header() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // 1. Check if the user is already logged in when the header loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2. Listen continuously for any login/logout events in the background
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="w-full bg-[#E62B1E] py-4 px-6 md:px-12 flex justify-between items-center relative z-50">
      <Link href="/" className="text-2xl font-extrabold tracking-tighter">
        <span className="text-white">CINE</span><span className="text-black">OS</span>
      </Link>
      
      {/* 3. The Smart Toggle: Show Command Center if logged in, else show Login */}
      {session ? (
        <Link 
          href="/projects" 
          className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black hover:text-white transition-colors ${montserrat.className}`}
        >
          <LayoutGrid className="w-4 h-4" /> Command Center
        </Link>
      ) : (
        <Link 
          href="/auth" 
          className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black hover:text-white transition-colors ${montserrat.className}`}
        >
          <LogIn className="w-4 h-4" /> Login / SIGN UP
        </Link>
      )}
    </header>
  );
}