'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';

export default function AuthPortal() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Optionally, create a record in the 'profiles' table here
      }
      router.push('/projects'); // Teleport to Command Center on success
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-neutral-950 border border-neutral-900 p-8 shadow-2xl">
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase mb-6">
            {isLogin ? 'System Access' : 'Initialize Profile'}
          </h1>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Email Designation</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-[#E62B1E]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Security Key</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-[#E62B1E]" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#E62B1E] hover:bg-white hover:text-black text-white py-4 mt-4 font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isLogin ? 'Engage' : 'Register')}
            </button>
          </form>

          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-xs text-neutral-500 uppercase tracking-widest hover:text-white transition-colors">
            {isLogin ? 'Need a profile? Register.' : 'Have clearance? Log in.'}
          </button>
        </div>
      </div>
    </main>
  );
}