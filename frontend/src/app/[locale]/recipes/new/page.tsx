// frontend/src/app/[locale]/recipes/new/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Loader2, Plus, Trash2, Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';

export default function NewRecipePage() {
  const t = useTranslations('recipe_form');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'processing' | 'form'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [instructions, setInstructions] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('processing');
    setLoading(true);

    const formData = new FormData();
    formData.append('recipeImage', file);

    try {
      const resp = await api.post('/ocr/scan-recipe', formData);
      setIngredients(resp.ingredients || []);
      setTitle(resp.suggestedTitle || '');
      setInstructions(resp.rawText || '');
      setStep('form');
    } catch (err: any) {
      setError(t('error_scan'));
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/groups/1/recipes', { title, ingredients, instructions });
      router.push('/recipes');
    } catch (err) {
      setError('Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-4xl mx-auto px-6 pt-12">

        {step === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold font-sans text-accent mb-4">{t('new_title')}</h1>
            <div onClick={() => fileInputRef.current?.click()} className="group relative bg-card border-4 border-dashed border-slate-200 hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-300 rounded-[3rem] p-16 text-center cursor-pointer">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 mx-auto"><Camera className="text-primary w-12 h-12" /></div>
              <h3 className="text-2xl font-bold text-accent mb-3">{t('scan_prompt')}</h3>
              <p className="text-slate-400 max-w-xs mx-auto">{t('scan_subtext')}</p>
            </div>
            <button onClick={() => setStep('form')} className="mt-8 text-slate-400 hover:text-accent w-full text-center hover:underline">{t('skip_to_manual')}</button>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in-95">
            <div className="relative"><div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div><div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"><Loader2 className="text-primary animate-spin" size={48} /></div></div>
            <h2 className="text-3xl font-bold text-accent mt-12 mb-4">{t('processing')}</h2>
          </div>
        )}

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between mb-12">
              <h1 className="text-4xl font-bold font-sans text-accent">{t('recipe_details')}</h1>
              <button onClick={handleSave} disabled={loading} className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all flex items-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {t('save_button')}
              </button>
            </div>
            {/* Form Fields: Title, Ingredients List, and Instructions (Raw Text) are all editable here */}
            {/* ... [Implementation details including dynamic ingredient rows] ... */}
          </div>
        )}
      </div>
    </div>
  );
}
