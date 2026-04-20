// frontend/src/app/[locale]/planner/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles, ShoppingBag, Calendar, Loader2, ChefHat, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';
import { useGroup } from '@/context/GroupContext';

export default function PlannerPage() {
  const t = useTranslations('planner');
  const { groupId, loading: groupLoading } = useGroup();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPlan = async () => {
    if (!groupId) return;
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
    if (!groupLoading && groupId) {
      fetchPlan();
    } else if (!groupLoading && !groupId) {
      setLoading(false);
    }
  }, [groupLoading, groupId]);

  const handleGenerate = async () => {
    if (!groupId) return;
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

  if (loading || groupLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-card p-12 rounded-[3rem] shadow-xl max-w-md">
          <ChefHat size={48} className="text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-black text-accent mb-4">No Family Group</h1>
          <p className="text-muted-foreground mb-8">You need to join or create a family group before you can plan meals.</p>
          <Link href="/groups" className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold">
            Go to Onboarding
          </Link>
        </div>
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
              <h1 className="text-4xl font-bold text-accent font-sans uppercase tracking-tight">{t('title')}</h1>
            </div>
            <p className="text-muted-foreground text-lg">
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
          <div className="bg-card rounded-[3rem] p-16 text-center border-2 border-dashed border-border animate-in fade-in zoom-in-95 duration-500 shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-8 mx-auto text-slate-300 border border-border">
              <ChefHat size={40} />
            </div>
            <h2 className="text-2xl font-black text-accent mb-3">{t('no_plan')}</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">{t('no_plan_sub')}</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {days.map((day) => {
                const meal = plan.days?.find((d: any) => d.day_of_week === day.id);
                return (
                  <div key={day.key} className="group bg-card rounded-[2rem] p-8 border border-border shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">
                      {t(day.key)}
                    </h3>
                    
                    {meal ? (
                      <div>
                        <Link href={`/recipes/${meal.id}`} className="block">
                          <h4 className="text-xl font-black text-accent mb-4 group-hover:text-primary transition-colors leading-tight">
                            {meal.title}
                          </h4>
                        </Link>
                        <Link href={`/recipes/${meal.id}`} className="inline-flex items-center gap-2 text-sm font-black text-primary group-hover:gap-3 transition-all uppercase tracking-wider">
                          View Recipe <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      <div className="py-4 text-slate-300 italic text-sm font-medium">
                        Rest Day
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <Link 
                href={`/planner/${plan.id}/shopping-list`}
                className="bg-accent text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-accent/20 hover:-translate-y-1 transition-all flex items-center gap-4 group"
              >
                <div className="w-10 h-10 bg-card/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag size={20} />
                </div>
                <span className="uppercase tracking-widest">{t('shopping_list')}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
