// frontend/src/components/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Home, User, LogOut, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [pathname]); // Re-check auth on route changes

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout failed');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-accent"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Home className="text-primary-foreground" size={18} />
            </div>
            <span className="font-bold text-accent hidden sm:block">Recipe Family</span>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link 
            href="/recipes/new" 
            className="text-sm font-bold text-accent hover:text-primary transition-colors"
          >
            {t('scan')}
          </Link>
          <Link 
            href="/planner" 
            className="text-sm font-bold text-accent hover:text-primary transition-colors"
          >
            {t('planner')}
          </Link>
          
          <div className="h-4 w-px bg-slate-200 mx-2"></div>
          
          {loading ? (
            <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse"></div>
          ) : user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                  <User size={18} />
                </div>
                <span className="text-sm font-bold text-accent hidden md:block">{user.name}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={18} />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-5 py-2 bg-accent text-white rounded-full text-sm font-bold hover:bg-accent/90 transition-all active:scale-95"
            >
              {t('login')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
