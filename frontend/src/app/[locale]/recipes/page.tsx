// frontend/src/app/recipes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function RecipeListPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null); // In a real app, this might come from context or a selector
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // First get user profile to find their group
        const profile = await api.get('/auth/me');
        // For simplicity, we assume the user has at least one group and we use it
        // In a real app, we'd have a group selector
        const groupRes = await api.get('/groups/default'); // Simplified concept or fetching list
        // Real logic: get group list, pick first
      } catch (e) {
        // If not logged in redirect
        window.location.href = '/login';
      }
    }
    // loadData();
  }, []);

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Recipes</h1>
        <Link href="/recipes/new" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>+ New Recipe</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {recipes.map(recipe => (
          <Link href={`/recipes/${recipe.id}`} key={recipe.id}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{recipe.title}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                {recipe.prep_time_min + recipe.cook_time_min} mins • {recipe.servings} portions
              </p>
            </div>
          </Link>
        ))}
        {recipes.length === 0 && <p>No recipes found in your family group yet.</p>}
      </div>
    </div>
  );
}
