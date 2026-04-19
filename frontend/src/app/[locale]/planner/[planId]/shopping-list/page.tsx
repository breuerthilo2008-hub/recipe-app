// frontend/src/app/planner/[planId]/shopping-list/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function ShoppingListPage() {
  const { planId } = useParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In real app, groupId from context
  const groupId = 'YOUR_GROUP_ID';

  useEffect(() => {
    async function fetchList() {
      try {
        const data = await api.get(`/groups/${groupId}/meal-plans/${planId}/shopping-list`);
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, [planId]);

  const handleExport = (format: string) => {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/groups/${groupId}/meal-plans/${planId}/shopping-list/export?format=${format}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Shopping List</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => handleExport('csv')} style={{ fontSize: '0.875rem', color: 'var(--primary)', padding: '0.5rem' }}>Export CSV</button>
          <button onClick={() => handleExport('txt')} style={{ fontSize: '0.875rem', color: 'var(--primary)', padding: '0.5rem' }}>Export TXT</button>
        </div>
      </header>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
        {items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <ul style={{ listStyle: 'none' }}>
            {items.map((item, idx) => (
              <li key={idx} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: '600' }}>{item.total} {item.unit}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
