// frontend/src/app/[locale]/recipes/[recipeId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  ChefHat, 
  Clock, 
  Users, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  ChevronRight,
  Calculator,
  ImageIcon
} from 'lucide-react';
import { api } from '@/lib/api';
import { useGroup } from '@/context/GroupContext';
import ImageUpload from '@/components/ImageUpload';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('recipes');
  const { groupId, loading: groupLoading } = useGroup();

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editData, setEditData] = useState<any>({
    title: '',
    description: '',
    instructions: '',
    servings: 1,
    prep_time_min: 0,
    cook_time_min: 0,
    ingredients: [],
    image_url: ''
  });

  const fetchRecipe = async () => {
    if (!groupId) return;
    try {
      const data = await api.get(`/groups/${groupId}/recipes/${params.recipeId}`);
      setRecipe(data);
      setEditData(data);
      setScale(data.servings || 1);
    } catch (err) {
      setError(t('no_recipe'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!groupLoading && groupId) fetchRecipe();
  }, [groupId, groupLoading]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/groups/${groupId}/recipes/${params.recipeId}`, editData);
      setIsEditing(false);
      await fetchRecipe();
    } catch (err) {
      setError('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('delete_confirm'))) return;
    setLoading(true);
    try {
      await api.delete(`/groups/${groupId}/recipes/${params.recipeId}`);
      router.push('/');
    } catch (err) {
      setError('Delete failed');
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setEditData({
      ...editData,
      ingredients: [...editData.ingredients, { name: '', quantity: 0, unit: '' }]
    });
  };

  const removeIngredient = (index: number) => {
    const newIngs = [...editData.ingredients];
    newIngs.splice(index, 1);
    setEditData({ ...editData, ingredients: newIngs });
  };

  if (loading || groupLoading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground font-black animate-pulse">Gathering Recipe...</p>
    </div>
  );

  if (!recipe) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-black text-accent mb-4">{t('no_recipe')}</h1>
      <button onClick={() => router.push('/')} className="px-8 py-3 bg-primary text-white rounded-2xl font-bold">{t('back')}</button>
    </div>
  );

  const multiplier = scale / (recipe.servings || 1);

  return (
    <main className="min-h-screen bg-background pb-24">
      
      {/* Recipe Hero Photo */}
      {!isEditing && recipe.image_url && (
         <div className="w-full h-[40vh] relative overflow-hidden group">
            <img 
              src={recipe.image_url} 
              alt={recipe.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/5 to-transparent"></div>
         </div>
      )}

      <div className={`max-w-5xl mx-auto px-6 ${recipe.image_url && !isEditing ? '-mt-24 relative z-10' : 'pt-12'}`}>
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <button 
            onClick={() => router.back()}
            className={`flex items-center gap-2 text-sm font-black uppercase tracking-[0.1em] hover:gap-3 transition-all ${recipe.image_url && !isEditing ? 'text-white drop-shadow-md' : 'text-primary'}`}
          >
            <ArrowLeft size={16} />
            {t('back')}
          </button>
          
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="p-4 bg-card text-accent hover:bg-accent hover:text-white rounded-2xl shadow-xl border border-border transition-all active:scale-95">
                  <Edit3 size={20} />
                </button>
                <button onClick={handleDelete} className="p-4 bg-card text-red-500 hover:bg-red-500 hover:text-white rounded-2xl shadow-xl border border-border transition-all active:scale-95">
                  <Trash2 size={20} />
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSave} className="px-8 py-4 bg-primary text-white rounded-2xl font-black flex items-center gap-2 shadow-2xl shadow-primary/20 transition-all active:scale-95">
                  <Save size={20} />
                  {t('save')}
                </button>
                <button onClick={() => { setIsEditing(false); setEditData(recipe); }} className="px-6 py-4 bg-card text-muted-foreground rounded-2xl font-black border border-border hover:bg-muted transition-all active:scale-95">
                  {t('cancel')}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Info Column */}
          <div className="lg:col-span-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isEditing && (
               <section className="animate-in zoom-in-95 duration-500">
                  <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <ImageIcon size={14} className="text-primary"/> Update Cover Photo
                  </h2>
                  <ImageUpload initialValue={editData.image_url} onUploadComplete={(url) => setEditData({...editData, image_url: url})} />
               </section>
            )}

            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-12 bg-primary rounded-full"></div>
                  <h1 className="text-5xl md:text-7xl font-black text-accent tracking-tighter leading-none">{recipe.title}</h1>
                </div>
                <p className="text-2xl text-muted-foreground font-medium max-w-3xl leading-relaxed italic">{recipe.description || 'A timeless family heirloom shared through generations.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={editData.title} 
                  onChange={e => setEditData({...editData, title: e.target.value})}
                  className="text-5xl md:text-7xl font-black text-accent tracking-tighter leading-none w-full bg-muted border-none rounded-[2rem] p-8 focus:ring-2 focus:ring-primary/20 transition-all transition-all"
                  placeholder={t('title_placeholder')}
                />
                <textarea 
                  value={editData.description}
                  onChange={e => setEditData({...editData, description: e.target.value})}
                  className="text-xl text-muted-foreground font-medium w-full bg-muted border-none rounded-[2rem] p-8 focus:ring-2 focus:ring-primary/20 h-32 transition-all"
                  placeholder={t('desc_placeholder')}
                />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-card rounded-[3rem] shadow-xl shadow-black/5 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Clock size={24} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t('prep_time')}</p>
                  {isEditing ? (
                    <input type="number" value={editData.prep_time_min} onChange={e => setEditData({...editData, prep_time_min: parseInt(e.target.value)})} className="w-16 bg-transparent font-black text-lg" />
                  ) : (
                    <p className="font-black text-xl text-accent">{recipe.prep_time_min} {t('min')}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Clock size={24} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t('cook_time')}</p>
                  {isEditing ? (
                    <input type="number" value={editData.cook_time_min} onChange={e => setEditData({...editData, cook_time_min: parseInt(e.target.value)})} className="w-16 bg-transparent font-black text-lg" />
                  ) : (
                    <p className="font-black text-xl text-accent">{recipe.cook_time_min} {t('min')}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2 md:col-span-2">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent"><Users size={24} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t('servings')}</p>
                  {isEditing ? (
                    <input type="number" value={editData.servings} onChange={e => setEditData({...editData, servings: parseInt(e.target.value)})} className="w-16 bg-transparent font-black text-lg" />
                  ) : (
                    <div className="flex items-center gap-4 bg-muted px-4 py-2 rounded-xl border border-border">
                      <p className="font-black text-xl text-accent">{recipe.servings}</p>
                      <div className="w-px h-6 bg-slate-200"></div>
                      <div className="flex items-center gap-2 text-primary font-black text-sm">
                        <Calculator size={18} />
                        <input 
                          type="number" 
                          value={scale} 
                          onChange={e => setScale(parseFloat(e.target.value) || 1)}
                          className="w-14 bg-transparent text-primary hover:bg-card transition-colors text-center font-black"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-100">
            <div className="bg-card p-10 rounded-[3.5rem] shadow-xl shadow-black/5 border border-border">
              <h2 className="text-2xl font-black text-accent mb-10 flex items-center gap-3">
                <ChefHat className="text-primary" />
                {t('ingredients')}
              </h2>
              
              <div className="space-y-6">
                {!isEditing ? (
                  recipe.ingredients.map((ing: any, i: number) => (
                    <div key={i} className="flex items-end gap-3 pb-6 border-b border-border last:border-0 hover:translate-x-2 transition-transform group">
                      <div className="flex-1">
                        <p className="text-xl font-black text-accent leading-none mb-1 group-hover:text-primary transition-colors">{ing.name}</p>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{ing.unit || 'units'}</p>
                      </div>
                      <div className="text-3xl font-black text-primary/30 group-hover:text-primary transition-colors">
                        {ing.quantity ? (ing.quantity * multiplier).toFixed(1).replace('.0', '') : ''}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    {editData.ingredients.map((ing: any, i: number) => (
                      <div key={i} className="flex gap-2 items-center group">
                        <input className="w-16 bg-muted rounded-xl p-3 text-sm font-black text-primary text-center" type="number" step="0.1" value={ing.quantity} onChange={e => {
                          const newIngs = [...editData.ingredients];
                          newIngs[i].quantity = parseFloat(e.target.value) || 0;
                          setEditData({...editData, ingredients: newIngs});
                        }} />
                        <input className="w-20 bg-muted rounded-xl p-3 text-sm font-bold text-muted-foreground" placeholder="Unit" value={ing.unit} onChange={e => {
                          const newIngs = [...editData.ingredients];
                          newIngs[i].unit = e.target.value;
                          setEditData({...editData, ingredients: newIngs});
                        }} />
                        <input className="flex-1 bg-muted rounded-xl p-3 text-sm font-black text-accent" placeholder="Name" value={ing.name} onChange={e => {
                          const newIngs = [...editData.ingredients];
                          newIngs[i].name = e.target.value;
                          setEditData({...editData, ingredients: newIngs});
                        }} />
                        <button onClick={() => removeIngredient(i)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><X size={18}/></button>
                      </div>
                    ))}
                    <button onClick={addIngredient} className="w-full py-4 border-2 border-dashed border-border rounded-[2rem] text-slate-300 font-bold hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2 mt-4 shadow-sm">
                      <Plus size={18} />
                      {t('add_ingredient')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div className="bg-card p-10 md:p-16 rounded-[4rem] shadow-xl shadow-black/5 border border-border h-full">
              <h2 className="text-3xl font-black text-accent mb-12 flex items-center gap-4">
                <div className="w-2 h-8 bg-primary rounded-full"></div>
                {t('instructions')}
              </h2>

              {!isEditing ? (
                <div className="prose prose-slate max-w-none">
                  {recipe.instructions.split('\n').map((para: string, i: number) => (
                    para.trim() && (
                      <div key={i} className="flex gap-8 mb-12 group">
                         <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all shadow-sm">
                           {(i + 1).toString().padStart(2, '0')}
                         </div>
                         <p className="text-card-foreground text-lg leading-relaxed font-medium pt-1.5">{para}</p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <textarea 
                  value={editData.instructions} 
                  onChange={e => setEditData({...editData, instructions: e.target.value})}
                  className="w-full h-[600px] bg-muted border-none rounded-[2.5rem] p-10 text-card-foreground font-medium leading-relaxed focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                  placeholder={t('instr_placeholder')}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
