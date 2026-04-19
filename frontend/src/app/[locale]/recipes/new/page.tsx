// frontend/src/app/[locale]/recipes/new/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Camera, 
  Loader2, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  FileText,
  ChefHat,
  X,
  Sparkles,
  Users
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { api } from '@/lib/api';
import { useGroup } from '@/context/GroupContext';
import ImageUpload from '@/components/ImageUpload';

export default function NewRecipePage() {
  const t_form = useTranslations('recipe_form');
  const t_recipe = useTranslations('recipes');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // FIXED: Explicitly consume 'loading' from GroupContext to prevent the race condition
  const { groupId, loading: groupLoading } = useGroup();

  const [step, setStep] = useState<'upload' | 'processing' | 'form'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState(4);
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Handle Premature Redirection Bug
  useEffect(() => {
    // We only redirect if we are CERTAIN loading is done and no group is found
    if (!groupLoading && !groupId) {
      router.push('/groups');
    }
  }, [groupLoading, groupId, router]);

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
      setError(t_form('error_scan'));
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const resp = await api.post(`/groups/${groupId}/recipes`, { 
        title, 
        description,
        instructions, 
        servings,
        prep_time_min: prepTime,
        cook_time_min: cookTime,
        ingredients,
        image_url: imageUrl // Saving the new Vercel Blob URL
      });
      router.push(`/recipes/${resp.id}`);
    } catch (err) {
      setError('Save failed');
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    const newIngs = [...ingredients];
    newIngs.splice(index, 1);
    setIngredients(newIngs);
  };

  // While GroupContext is loading, show a neutral skeleton to prevent flickering/redirects
  if (groupLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Family Vault...</p>
      </div>
    );
  }

  // If loading is done but still no groupId, the useEffect will handle the redirect.
  // We return null here to avoid rendering the page for an unauthorized state.
  if (!groupId) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-12">

        {step === 'upload' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                 <ChefHat size={24} />
               </div>
               <h1 className="text-4xl font-black text-accent tracking-tighter uppercase">{t_form('new_title')}</h1>
             </div>
            
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="group relative bg-white border-4 border-dashed border-slate-100 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 rounded-[3.5rem] p-24 text-center cursor-pointer shadow-sm hover:border-solid hover:shadow-2xl hover:shadow-primary/5"
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/10">
                <Camera className="text-primary w-12 h-12" />
              </div>
              <h3 className="text-3xl font-black text-accent mb-4 leading-tight">{t_form('scan_prompt')}</h3>
              <p className="text-slate-400 max-w-sm mx-auto font-medium text-lg leading-relaxed">{t_form('scan_subtext')}</p>
            </div>
            
            <button 
              onClick={() => setStep('form')} 
              className="mt-12 w-full py-5 border-2 border-slate-100 rounded-3xl text-slate-400 font-black uppercase tracking-widest text-sm hover:bg-slate-50 hover:text-accent hover:border-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
            >
              <FileText size={18} />
              {t_form('skip_to_manual')}
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in-95">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="relative w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="text-primary animate-bounce" size={48} />
              </div>
            </div>
            <h2 className="text-4xl font-black text-accent mt-16 mb-4">{t_form('processing')}</h2>
            <p className="text-slate-400 font-black animate-pulse tracking-widest uppercase text-sm">Digitizing your family heritage...</p>
          </div>
        )}

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <button 
                  onClick={() => setStep('upload')}
                  className="flex items-center gap-2 text-sm font-black text-primary uppercase tracking-[0.2em] mb-4 hover:gap-3 transition-all"
                >
                  <ArrowLeft size={16} />
                  Scanner
                </button>
                <h1 className="text-5xl font-black text-accent tracking-tighter">{t_form('recipe_details')}</h1>
              </div>
              
              <button 
                onClick={handleSave} 
                disabled={loading} 
                className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                {t_form('save_button')}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-12">
                
                {/* Cloud Image Upload Section */}
                <section>
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    Kitchen Visuals
                  </h2>
                  <ImageUpload onUploadComplete={(url) => setImageUrl(url)} />
                </section>

                {/* Basic Info */}
                <section className="space-y-4">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                     <div className="w-1 h-4 bg-primary rounded-full"></div>
                     Basic Information
                  </h2>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="text-4xl font-black text-accent w-full bg-white border-none rounded-[2.5rem] p-8 shadow-sm focus:ring-2 focus:ring-primary/20 placeholder:text-slate-200 transition-all font-sans"
                    placeholder={t_recipe('title_placeholder')}
                  />
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="text-lg text-slate-500 font-medium w-full bg-white border-none rounded-[2.5rem] p-8 shadow-sm focus:ring-2 focus:ring-primary/20 h-32 transition-all leading-relaxed"
                    placeholder={t_recipe('desc_placeholder')}
                  />
                </section>

                {/* Instructions */}
                <section className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-50">
                  <h2 className="text-2xl font-black text-accent mb-8 flex items-center gap-3">
                    <FileText className="text-primary" />
                    {t_recipe('instructions')}
                  </h2>
                  <textarea 
                    value={instructions} 
                    onChange={e => setInstructions(e.target.value)}
                    className="w-full h-96 bg-slate-50 border-none rounded-3xl p-8 text-slate-600 font-medium leading-relaxed focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={t_recipe('instr_placeholder')}
                  />
                </section>
              </div>

              {/* Sidebar Column */}
              <div className="lg:col-span-4 space-y-8">
                
                {/* Meta Inputs */}
                <section className="grid grid-cols-1 gap-4">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 group hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t_recipe('servings')}</p>
                       <Users size={16} className="text-slate-300" />
                    </div>
                    <input type="number" value={servings} onChange={e => setServings(parseInt(e.target.value))} className="w-full bg-transparent font-black text-3xl text-accent" />
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 group hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t_recipe('prep_time')}</p>
                       <Loader2 size={16} className="text-slate-300" />
                    </div>
                    <div className="flex items-end gap-2">
                       <input type="number" value={prepTime} onChange={e => setPrepTime(parseInt(e.target.value))} className="w-full bg-transparent font-black text-3xl text-accent" />
                       <span className="text-slate-300 font-black uppercase text-xs mb-1 tracking-tighter">min</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 group hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t_recipe('cook_time')}</p>
                       <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div></div>
                    </div>
                    <div className="flex items-end gap-2">
                       <input type="number" value={cookTime} onChange={e => setCookTime(parseInt(e.target.value))} className="w-full bg-transparent font-black text-3xl text-accent" />
                       <span className="text-slate-300 font-black uppercase text-xs mb-1 tracking-tighter">min</span>
                    </div>
                  </div>
                </section>

                {/* Ingredients Column */}
                <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 sticky top-24">
                  <h2 className="text-2xl font-black text-accent mb-8 flex items-center gap-3">
                    <Plus className="text-primary" />
                    {t_recipe('ingredients')}
                  </h2>
                  
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex gap-2 items-center group animate-in slide-in-from-right-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                        <input 
                          className="w-16 bg-slate-50 rounded-xl p-3 text-sm font-black text-primary text-center focus:ring-2 focus:ring-primary/20" 
                          type="number" step="0.1" value={ing.quantity} 
                          onChange={e => {
                            const newIngs = [...ingredients];
                            newIngs[i].quantity = parseFloat(e.target.value) || 0;
                            setIngredients(newIngs);
                          }} 
                        />
                        <input 
                          className="flex-1 bg-slate-50 rounded-xl p-3 text-sm font-black text-accent focus:ring-2 focus:ring-primary/20" 
                          placeholder="Item Name" value={ing.name} 
                          onChange={e => {
                            const newIngs = [...ingredients];
                            newIngs[i].name = e.target.value;
                            setIngredients(newIngs);
                          }} 
                        />
                        <button onClick={() => removeIngredient(i)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                          <X size={18}/>
                        </button>
                      </div>
                    ))}
                    
                    <button 
                      onClick={addIngredient} 
                      className="w-full py-4 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-slate-300 font-bold hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <Plus size={18} />
                      {t_recipe('add_ingredient')}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
