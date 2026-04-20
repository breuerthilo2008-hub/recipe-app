// frontend/src/app/[locale]/login/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Mail, Lock, LogIn, ArrowRight, CheckCircle2, Loader2, Heart, Eye, EyeOff } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';

export default function LoginPage() {
  const t = useTranslations('auth');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/login', formData);
      router.push('/'); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
          <Heart className="text-primary-foreground fill-primary-foreground" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-accent font-sans">Recipe Family</h2>
      </div>

      <div className="w-full max-w-md bg-card rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-black/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-accent mb-3">{t('login_title')}</h1>
          <p className="text-muted-foreground">{t('login_subtitle')}</p>
        </div>

        {registered && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in zoom-in-95">
            <CheckCircle2 size={20} className="shrink-0" />
            <span className="text-sm font-medium">{t('success_registered')}</span>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-500">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
              {t('email_label')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                required 
                placeholder="nina@family.com"
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-muted border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
              {t('password_label')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••"
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-muted border-2 border-transparent focus:border-primary/20 focus:bg-card rounded-2xl py-4 pl-12 pr-12 outline-none transition-all placeholder:text-slate-200 font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors cursor-pointer"
                aria-label={showPassword ? t('hide_password') : t('show_password')}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <LogIn size={20} />
            )}
            {loading ? t('loading') : t('login_button')}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm font-medium">
            {t('no_account')}{' '}
            <Link 
              href="/register" 
              className="text-primary hover:underline font-bold inline-flex items-center gap-1 group"
            >
              {t('register_link')}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
