// frontend/src/app/[locale]/page.tsx
'use client';

import { useTranslations } from 'next-intl';
import { Camera, Calendar, Clock, Utensils, ArrowRight, BookOpen, Heart, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const [recentRecipes, setRecentRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecent() {
      try {
        setLoading(true);
        // Attempting to fetch recipes; catches 401/Unauthorized gracefully
        const recipes = await api.get('/groups/1/recipes');
        setRecentRecipes(recipes.slice(0, 6));
      } catch (err: any) {
        if (err.message.includes('401') || err.message.includes('Unauthorized')) {
          setError('unauthorized');
        } else {
          setError('failed');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex-1">
          <h1 className="text-5xl md:text-6xl font-bold font-sans text-accent leading-tight mb-6">{t('greeting')}</h1>
          <p className="text-xl text-card-foreground max-w-xl leading-relaxed">{t('intro')}</p>
        </div>
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-2xl bg-primary/20 rotate-3 flex items-center justify-center">
            <Heart className="text-primary fill-primary" size={40} />
          </div>
          <div className="w-24 h-24 rounded-2xl bg-secondary/30 -rotate-6 flex items-center justify-center translate-y-4">
            <Users className="text-secondary-foreground" size={40} />
          </div>
        </div>
      </section>

      {/* Quick Action Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          {t('quick_actions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/recipes/new" className="group">
            <div className="bg-card border-none hover:ring-4 hover:ring-primary/20 transition-all duration-500 p-10 rounded-[2rem] shadow-xl shadow-black/5 flex items-center gap-8 relative overflow-hidden">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                <Camera className="text-primary-foreground w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-accent">{t('scan_recipe')}</h3>
                <p className="text-muted-foreground">{t('scan_desc')}</p>
              </div>
              <ArrowRight className="text-primary group-hover:translate-x-2 transition-transform" size={28} />
            </div>
          </Link>

          <Link href="/planner" className="group">
            <div className="bg-card border-none hover:ring-4 hover:ring-secondary/40 transition-all duration-500 p-10 rounded-[2rem] shadow-xl shadow-black/5 flex items-center gap-8 relative overflow-hidden">
              <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/30 group-hover:scale-110 transition-transform">
                <Calendar className="text-secondary-foreground w-10 h-10" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-accent">{t('meal_planner')}</h3>
                <p className="text-muted-foreground">{t('planner_desc')}</p>
              </div>
              <ArrowRight className="text-secondary group-hover:translate-x-2 transition-transform" size={28} />
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Recipes Section with Resilience */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-2 h-8 bg-accent rounded-full"></span>
            {t('recent_additions')}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="bg-muted animate-pulse h-80 rounded-[2rem]"></div>)}
          </div>
        ) : error === 'unauthorized' ? (
          <div className="bg-secondary/10 border-2 border-dashed border-secondary/30 rounded-[2.5rem] p-16 text-center">
            <Users className="mx-auto text-secondary mb-6" size={64} />
            <p className="text-card-foreground mb-8 max-w-md mx-auto">{t('unauthorized_msg')}</p>
            <Link href="/login" className="inline-block bg-accent text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:-translate-y-1 transition-all">Log In to View</Link>
          </div>
        ) : recentRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentRecipes.map((recipe) => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="group">
                <div className="bg-card rounded-[2rem] overflow-hidden shadow-lg shadow-black/5 border border-border h-full flex flex-col hover:-translate-y-2 transition-all duration-300">
                  <div className="h-56 bg-muted flex items-center justify-center overflow-hidden">
                    <Utensils className="w-16 h-16 text-slate-200" />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-4 text-accent line-clamp-2 leading-snug group-hover:text-primary transition-colors">{recipe.title}</h3>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground mt-auto pt-6 border-t border-border">
                      <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /><span>{recipe.prep_time_min + recipe.cook_time_min}m</span></div>
                      <div className="flex items-center gap-2"><BookOpen size={16} className="text-secondary" /><span>{recipe.servings} servings</span></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card rounded-[3rem] border-2 border-dashed border-border">
            <p className="text-xl font-medium text-muted-foreground">{t('no_recipes')}</p>
          </div>
        )}
      </section>
    </main>
  );
}
