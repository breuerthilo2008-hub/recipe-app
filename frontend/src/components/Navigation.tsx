// frontend/src/components/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Home, User, LogOut, ChevronDown, Users, Sun, Moon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useGroup } from '@/context/GroupContext';
import { useTheme } from 'next-themes';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const { theme, setTheme } = useTheme();
  const { groupId, groupName, loading: groupLoading } = useGroup();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.get('/auth/me');
        setUser(data.user);

        if (data.user && !data.user.groupId && !pathname.includes('/groups') && !pathname.includes('/login') && !pathname.includes('/register')) {
          router.push('/groups');
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      window.location.href = '/login'; 
    } catch (err) {
      console.error('Logout failed');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-accent/10 flex items-center justify-center transition-colors text-accent"
          >
            <ChevronLeft size={24} />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Home className="text-primary-foreground" size={18} />
            </div>
            <span className="font-bold text-accent hidden sm:block">Heirloom Kitchen</span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          {groupId && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/recipes/new" className="text-sm font-bold text-accent hover:text-primary transition-colors">
                {t('scan')}
              </Link>
              <Link href="/planner" className="text-sm font-bold text-accent hover:text-primary transition-colors">
                {t('planner')}
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4">
             {/* Beautiful Animated Theme Toggle */}
             {mounted && (
               <button
                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                 className="relative w-12 h-6 bg-slate-100 dark:bg-slate-800 rounded-full p-1 transition-colors duration-500 shadow-inner group"
               >
                 <div className={`
                   absolute top-1 left-1 w-4 h-4 bg-white dark:bg-primary rounded-full shadow-md transform transition-all duration-500 flex items-center justify-center
                   ${theme === 'dark' ? 'translate-x-6 rotate-[360deg]' : 'translate-x-0'}
                 `}>
                   {theme === 'dark' ? <Moon size={10} className="text-white" /> : <Sun size={10} className="text-primary" />}
                 </div>
               </button>
             )}

             <div className="h-4 w-px bg-border/50 mx-2 hidden sm:block"></div>

             {loading ? (
               <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
             ) : user ? (
               <div className="relative">
                 <button
                   onClick={() => setDropdownOpen(!dropdownOpen)}
                   className="flex items-center gap-2 group focus:outline-none"
                 >
                   <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                     <User size={18} />
                   </div>
                   <div className="text-left hidden md:block">
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">{groupName || 'No Family'}</p>
                     <p className="text-sm font-bold text-accent leading-none">{user.name}</p>
                   </div>
                   <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {dropdownOpen && (
                   <div className="absolute right-0 mt-3 w-56 bg-card rounded-2xl shadow-2xl border border-border/50 p-2 animate-in fade-in slide-in-from-top-2">
                     <div className="px-4 py-2 border-b border-border/30 mb-1">
                       <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Family Access</p>
                     </div>
                     <Link 
                       href={`/groups/${groupId || 'new'}`} 
                       onClick={() => setDropdownOpen(false)}
                       className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-accent hover:bg-primary/5 rounded-xl transition-colors"
                     >
                       <Users size={18} className="text-primary" />
                       Manage Family
                     </Link>
                     <button
                       onClick={handleLogout}
                       className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                     >
                       <LogOut size={18} />
                       {t('logout')}
                     </button>
                   </div>
                 )}
               </div>
             ) : (
               <Link href="/login" className="px-6 py-2 bg-accent text-white rounded-full text-sm font-black uppercase tracking-wider hover:bg-accent/90 transition-all shadow-lg shadow-accent/20">
                 {t('login')}
               </Link>
             )}
          </div>
        </nav>
      </div>
    </header>
  );
}
