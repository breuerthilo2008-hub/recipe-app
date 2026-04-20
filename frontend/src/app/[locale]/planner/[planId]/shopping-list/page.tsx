// frontend/src/app/[locale]/planner/[planId]/shopping-list/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Circle, 
  Download, 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Table as TableIcon,
  ChefHat
} from 'lucide-react';
import { api } from '@/lib/api';
import { useGroup } from '@/context/GroupContext';

interface ShoppingItem {
  name: string;
  total: number;
  unit: string;
}

export default function ShoppingListPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('shopping_list');
  const { groupId, loading: groupLoading } = useGroup();
  
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      if (!groupId || !params.planId) return;
      try {
        const data = await api.get(`/groups/${groupId}/meal-plans/${params.planId}/shopping-list`);
        setItems(data);
      } catch (err) {
        setError('Failed to load shopping list');
      } finally {
        setLoading(false);
      }
    };

    if (!groupLoading && groupId) {
      fetchList();
    }
  }, [groupId, groupLoading, params.planId]);

  const toggleItem = (name: string) => {
    setChecked(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleExport = (format: 'txt' | 'csv') => {
    // Generate the direct backend Export URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const exportUrl = `${baseUrl}/groups/${groupId}/meal-plans/${params.planId}/shopping-list/export?format=${format}`;
    window.open(exportUrl, '_blank');
  };

  if (loading || groupLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-black animate-pulse">Gathering Ingredients...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest mb-4 hover:gap-3 transition-all"
            >
              <ArrowLeft size={16} />
              {t('back_to_planner')}
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-accent/20">
                <ShoppingBag size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-accent">{t('title')}</h1>
                <p className="text-muted-foreground font-medium">{t('subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
            <button 
              onClick={() => handleExport('txt')}
              className="group relative flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-2xl text-sm font-black text-accent hover:shadow-xl hover:shadow-black/5 transition-all active:scale-95"
            >
              <FileText size={18} className="text-primary" />
              <span>TXT</span>
            </button>
            <button 
              onClick={() => handleExport('csv')}
              className="group relative flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-2xl text-sm font-black text-accent hover:shadow-xl hover:shadow-black/5 transition-all active:scale-95"
            >
              <TableIcon size={18} className="text-primary" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-card rounded-[3rem] p-16 text-center shadow-sm border border-border animate-in fade-in zoom-in-95 duration-500">
             <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-8 mx-auto text-slate-300">
               <ChefHat size={40} />
             </div>
             <h2 className="text-2xl font-black text-accent mb-3">{t('empty')}</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {items.map((item) => (
              <button
                key={item.name}
                onClick={() => toggleItem(item.name)}
                className={`
                  w-full flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 text-left
                  ${checked[item.name] 
                    ? 'bg-muted border-border opacity-60' 
                    : 'bg-card border-white shadow-sm hover:shadow-xl hover:shadow-black/5 hover:scale-[1.01]'}
                `}
              >
                <div className="flex items-center gap-6">
                  <div className={`transition-all duration-300 ${checked[item.name] ? 'text-primary' : 'text-slate-300'}`}>
                    {checked[item.name] ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                  </div>
                  <div>
                    <p className={`text-xl font-black transition-all ${checked[item.name] ? 'text-muted-foreground line-through decoration-2' : 'text-accent'}`}>
                      {item.name}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      {item.unit || 'units'}
                    </p>
                  </div>
                </div>
                
                <div className={`
                  px-6 py-2 rounded-xl font-black text-lg
                  ${checked[item.name] ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}
                `}>
                  {item.total}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-12 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 text-center animate-in fade-in duration-1000">
          <p className="text-primary font-bold italic tracking-tight">"A family that shops together, eats together."</p>
        </div>

      </div>
    </main>
  );
}
