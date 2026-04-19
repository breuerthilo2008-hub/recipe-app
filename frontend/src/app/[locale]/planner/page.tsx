// frontend/src/app/[locale]/planner/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, ShoppingBag, Calendar, Loader2, ChefHat, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';

export default function PlannerPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('planner');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // In a real app, groupId comes from session/context. Using '1' as default group.
  const groupId = '1';

  const fetchPlan = async () => {
    try {
      const data = await api.get(`/groups/${groupId}/meal-plans/current`);
      setPlan(data);
    } catch (err) {
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post(`/groups/${groupId}/meal-plans/generate`, {});
      await fetchPlan();
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const days = [
    { key: 'monday', id: 1 },
    { key: 'tuesday', id: 2 },
    { key: 'wednesday', id: 3 },
    { key: 'thursday', id: 4 },
    { key: 'friday', id: 5 },
    { key: 'saturday', id: 6 },
    { key: 'sunday', id: 7 }
  ];

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Calendar size={28} />
              </div>
              <h1 className="text-4xl font-bold text-accent font-sans">{t('title')}</h1>
            </div>
            <p className="text-slate-500 text-lg">
              {t('subtitle', { date: new Date().toLocaleDateString() })}
            </p>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={generating}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3 disabled:opacity-50 animate-in fade-in slide-in-from-right-4 duration-700"
          >
            {generating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {generating ? t('generating') : t('generate')}
          </button>
        </div>

        {!plan ? (
          <div className="bg-card rounded-[3rem] p-16 text-center border-2 border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 mx-auto text-slate-300">
              <ChefHat size={40} />
            </div>
            <h2 className="text-2xl font-bold text-accent mb-3">{t('no_plan')}</h2>
            <p className="text-slate-400 max-w-sm mx-auto mb-8">{t('no_plan_sub')}</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {days.map((day) => {
                const meal = plan.days?.find((d: any) => d.day_of_week === day.id);
                return (
                  <div key={day.key} className="group bg-card rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      {t(day.key)}
                    </h3>
                    
                    {meal ? (
                      <div>
                        <Link href={`/recipes/${meal.id}`} className="block">
                          <h4 className="text-xl font-bold text-accent mb-4 group-hover:text-primary transition-colors leading-tight">
                            {meal.title}
                          </h4>
                        </Link>
                        <Link href={`/recipes/${meal.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                          View Recipe <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <div className="py-4 text-slate-300 italic text-sm">
                        No recipe selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <Link 
                href={`/planner/${plan.id}/shopping-list`}
                className="bg-accent text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-accent/20 hover:-translate-y-1 transition-all flex items-center gap-4"
              >
                <ShoppingBag size={24} />
                {t('shopping_list')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
