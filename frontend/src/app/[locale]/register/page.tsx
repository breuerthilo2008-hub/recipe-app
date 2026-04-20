// frontend/src/app/[locale]/register/page.tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Mail, Lock, UserPlus, ArrowLeft, Loader2, Heart, Eye, EyeOff } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/20 mb-4">
          <Heart className="text-secondary-foreground fill-secondary-foreground" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-accent font-sans">Recipe Family</h2>
      </div>

      <div className="w-full max-w-md bg-card rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-black/5 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-accent mb-3">{t('register_title')}</h1>
          <p className="text-muted-foreground">{t('register_subtitle')}</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in shake duration-500">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
              {t('name_label')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors">
                <User size={20} />
              </div>
              <input 
                type="text" 
                required 
                placeholder="Nina"
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-muted border-2 border-transparent focus:border-secondary/30 focus:bg-card rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
              {t('email_label')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                required 
                placeholder="nina@family.com"
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-muted border-2 border-transparent focus:border-secondary/30 focus:bg-card rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider ml-1">
              {t('password_label')}
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-secondary transition-colors">
                <Lock size={20} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••"
                value={formData.password} 
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-muted border-2 border-transparent focus:border-secondary/30 focus:bg-card rounded-2xl py-4 pl-12 pr-12 outline-none transition-all placeholder:text-slate-200 font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-secondary transition-colors cursor-pointer"
                aria-label={showPassword ? t('hide_password') : t('show_password')}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-secondary text-secondary-foreground py-4 rounded-2xl font-bold shadow-xl shadow-secondary/20 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <UserPlus size={20} />
            )}
            {loading ? t('loading') : t('register_button')}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm font-medium">
            {t('has_account')}{' '}
            <Link 
              href="/login" 
              className="text-secondary hover:underline font-bold inline-flex items-center gap-1 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              {t('login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
