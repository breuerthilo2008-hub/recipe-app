// frontend/src/app/recipes/[recipeId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function RecipeDetailPage() {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: In real app, groupId would come from URL or session config
    // For this demonstration, we'd fetch it or have it in state
  }, [recipeId]);

  if (!recipe) return <div className="container">Loading recipe...</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{recipe.title}</h1>
        <div style={{ color: 'var(--text-light)', display: 'flex', gap: '1rem' }}>
          <span>Prep: {recipe.prep_time_min}m</span>
          <span>Cook: {recipe.cook_time_min}m</span>
          <span>Servings: {recipe.servings}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
        <aside>
          <h2 style={{ marginBottom: '1rem' }}>Ingredients</h2>
          <ul style={{ listStyle: 'none' }}>
            {recipe.ingredients.map((ing: any) => (
              <li key={ing.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{ing.quantity} {ing.unit}</strong> {ing.name}
              </li>
            ))}
          </ul>
        </aside>

        <main>
          <h2 style={{ marginBottom: '1rem' }}>Instructions</h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
            {recipe.instructions}
          </div>
        </main>
      </div>
    </div>
  );
}
