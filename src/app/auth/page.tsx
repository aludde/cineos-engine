'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useProjectStore } from '@/store/projectStore';

export default function AuthPortal() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isResetting, setIsResetting] = useState(false); // <-- Added reset state

  // 1. PULL IN THE GUEST DATA
  const activeProject = useProjectStore((state: any) => state.activeProject);
  const isGuestMode = useProjectStore((state: any) => state.isGuestMode);
  const setGuestMode = useProjectStore((state: any) => state.setGuestMode);
  const clearProject = useProjectStore((state: any) => state.clearProject);

  // 2. THE MASTER AUTH LISTENER & MIGRATION BRIDGE
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        handleMigration(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [isGuestMode, activeProject]);

  const handleMigration = async (user: any) => {
    // Failsafe: Ensure their public profile exists with email
    await supabase.from('profiles').upsert([{ id: user.id, email: user.email }]);

    // IF THEY CAME FROM GUEST MODE: Migrate their data!
    if (isGuestMode && activeProject) {
      try {
        const { data: newProject, error: projError } = await supabase
          .from('projects')
          .insert({
            title: activeProject.title || "Untitled Project",
            agency: activeProject.agency || "Unknown",
            user_id: user.id
          })
          .select()
          .single();

        if (projError) throw projError;

        const dbAssets: any[] = [];
        activeProject.scenes?.forEach((scene: any) => {
          scene.assets?.forEach((asset: any) => {
            dbAssets.push({
              project_id: newProject.id,
              category: asset.category,
              description: asset.description,
              quantity: asset.quantity || 1,
              unit_price: 0,
            });
          });
        });

        if (dbAssets.length > 0) {
          const { error: assetError } = await supabase.from('assets').insert(dbAssets);
          if (assetError) throw assetError;
        }

        // Clean up Local Storage & Teleport to Secure URL
        setGuestMode(false);
        clearProject();
        router.push(`/project/${newProject.id}/breakdown`);
        return; 

      } catch (error) {
        console.error("Migration failed:", error);
        alert("Login successful, but we couldn't migrate your guest project. Please re-upload.");
      }
    }

    // IF NORMAL LOGIN: Just go straight to the Vault
    setGuestMode(false);
    router.push('/projects');
  };

  // 3. GOOGLE OAUTH TRIGGER
  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`, 
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  // 4. EMAIL AUTH TRIGGER
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isResetting) {
        // Password Reset Flow
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        if (error) throw error;
        alert('Password reset link sent! Check your email.');
        setIsResetting(false);
      } else if (isLogin) {
        // Standard Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // New Account Creation
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        
        // Save email to profiles table on signup
        if (authData.user) {
          await supabase.from('profiles').upsert([{ id: authData.user.id, email: email }]);
        }
      }
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
          
          {/* DE-ROBOTIZED HEADINGS */}
          <h1 className="text-3xl font-extrabold tracking-tighter mb-2">
            {isResetting ? 'Reset Password' : isLogin ? 'Welcome back.' : 'Join CineOS.'}
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            {isResetting 
              ? 'Enter your email to receive a secure reset link.' 
              : isLogin 
                ? 'Log in to access your production vault.' 
                : 'Create your free account to save your breakdowns.'}
          </p>
          
          {/* HIDE GOOGLE AUTH DURING PASSWORD RESET */}
          {!isResetting && (
            <>
              <button 
                onClick={handleGoogleAuth} 
                disabled={loading} 
                className="w-full bg-white hover:bg-neutral-200 text-black py-3 font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center gap-3 mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 border-t border-neutral-800"></div>
                <span className="text-xs text-neutral-600 font-bold tracking-widest uppercase">Or</span>
                <div className="flex-1 border-t border-neutral-800"></div>
              </div>
            </>
          )}

          {/* EMAIL FORM */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Work Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-[#E62B1E]" />
            </div>
            
            {/* HIDE PASSWORD FIELD DURING RESET */}
            {!isResetting && (
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button type="button" onClick={() => setIsResetting(true)} className="text-xs text-[#E62B1E] hover:text-white transition-colors">
                      Forgot?
                    </button>
                  )}
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black border border-neutral-800 text-white px-4 py-3 focus:outline-none focus:border-[#E62B1E]" />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-[#E62B1E] hover:bg-white hover:text-black text-white py-4 mt-4 font-bold uppercase tracking-widest text-sm transition-all flex justify-center items-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isResetting ? 'Send Reset Link' : isLogin ? 'Log In' : 'Create Account'}
            </button>
          </form>
          
          <button 
            onClick={() => {
              setIsResetting(false);
              setIsLogin(!isLogin);
            }} 
            className="w-full mt-6 text-xs text-neutral-500 hover:text-white transition-colors"
          >
            {isResetting ? 'Back to login' : isLogin ? "Don't have an account? Sign up." : 'Already have an account? Log in.'}
          </button>
        </div>
      </div>
    </main>
  );
}