'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreVertical, Settings, LogOut, Loader2, Film, User, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '700', '800'] });

export default function CommandCenter() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function fetchUserAndProjects() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth'); return; }
      
      setUserEmail(session.user.email || '');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (!error) setProjects(data || []);
      setLoading(false);
    }
    fetchUserAndProjects();
  }, [router]);


  const handleDeleteProject = async (e: React.MouseEvent, projectId: string, title: string) => {
    e.stopPropagation(); // Prevents the click from opening the project
    
    // Strict Warning Protocol
    if (!confirm(`WARNING: Are you sure you want to permanently delete "${title}"?\n\nThis will instantly destroy the breakdown, schedule, and budget. This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      
      // Remove it from the local screen instantly without reloading the page
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project. Check connection.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }).format(date);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <header className="w-full bg-[#E62B1E] py-4 px-6 md:px-12 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-4">
          <span className={`text-2xl font-extrabold tracking-tighter ${montserrat.className}`}>
            <span className="text-white">CINE</span><span className="text-black">OS</span>
          </span>
          <span className="text-black/50 font-bold uppercase tracking-widest text-xs ml-4 hidden md:block">Command Center</span>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 text-black hover:text-white transition-colors">
            <div className="w-8 h-8 bg-black flex items-center justify-center rounded-sm"><User className="w-4 h-4 text-[#E62B1E]" /></div>
            <MoreVertical className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-4 w-56 bg-neutral-950 border border-neutral-900 shadow-2xl z-50">
                <div className="p-4 border-b border-neutral-900">
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Active User</p>
                  <p className="text-sm text-white mt-1 truncate">{userEmail}</p>
                </div>
                <div className="p-2 flex flex-col">
                  <button className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors text-left w-full"><Settings className="w-4 h-4" /> System Settings</button>
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-[#E62B1E] hover:text-white hover:bg-[#E62B1E] transition-colors text-left w-full mt-1"><LogOut className="w-4 h-4" /> Terminate Session</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 border-b border-neutral-800 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter uppercase mb-2">Active Projects</h1>
            <p className="text-neutral-500 text-sm">Select a project to enter the workspace.</p>
          </div>
          <button onClick={() => router.push('/project/new')} className="mt-6 md:mt-0 flex items-center gap-2 bg-[#E62B1E] hover:bg-white hover:text-black text-white px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all">
            <Plus className="w-5 h-5" /> Initialize New Project
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#E62B1E] animate-spin" /></div>
        ) : projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-neutral-800 bg-neutral-950/30 p-12">
            <Film className="w-16 h-16 text-neutral-800 mb-6" />
            <h2 className="text-2xl font-bold mb-2">The Vault is Empty</h2>
            <p className="text-neutral-500 max-w-md">Initialize a new project and drop a script to launch the engine.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div 
                key={project.id} 
                whileHover={{ y: -5 }} 
                onClick={() => router.push(`/project/${project.id}/breakdown`)} 
                className="bg-neutral-950 border border-neutral-900 p-6 cursor-pointer group hover:border-[#E62B1E] flex flex-col relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-black border border-neutral-800 flex items-center justify-center group-hover:border-[#E62B1E]/50 transition-colors">
                    <Film className="w-4 h-4 text-neutral-500 group-hover:text-[#E62B1E] transition-colors" />
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest bg-black px-2 py-1">
                      v{project.version}
                    </span>
                    
                    {/* THE DELETE BUTTON */}
                    <button 
                      onClick={(e) => handleDeleteProject(e, project.id, project.title)}
                      className="p-1.5 text-neutral-600 hover:text-[#E62B1E] hover:bg-[#E62B1E]/10 transition-colors z-20"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold uppercase tracking-wide text-white mb-1 truncate">{project.title}</h3>
                <p className="text-xs text-[#E62B1E] font-bold tracking-widest uppercase mb-6 truncate">{project.agency || 'Independent'}</p>

                <div className="mt-auto pt-4 border-t border-neutral-900 flex justify-between items-center text-xs text-neutral-500">
                  <span>ID: {project.id.split('-')[0]}</span>
                  <span>{formatDate(project.updated_at)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}