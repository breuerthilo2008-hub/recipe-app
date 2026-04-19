// frontend/src/app/recipes/components/ImageUpload.tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Camera, Loader2 } from 'lucide-react';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface ImageUploadProps {
  onExtracted: (ingredients: Ingredient[]) => void;
}

export default function ImageUpload({ onExtracted }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('recipeImage', file);

    try {
      const response = await api.post('/ocr/scan-recipe', formData);
      if (response.ingredients) {
        onExtracted(response.ingredients);
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setError('Failed to scan image. Please try again or enter manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: '2px dashed #e2e8f0',
      borderRadius: '0.5rem',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f8fafc',
      marginBottom: '1.5rem',
      position: 'relative'
    }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0,
          cursor: 'pointer',
          width: '100%',
          height: '100%'
        }}
        disabled={loading}
      />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        {loading ? (
          <>
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={32} color="#3b82f6" />
            <p style={{ fontWeight: 500 }}>Scanning recipe image...</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>This may take a moment</p>
          </>
        ) : (
          <>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: '#dbeafe', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <Camera size={24} color="#3b82f6" />
            </div>
            <p style={{ fontWeight: 600 }}>Scan from Photo</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Upload a picture of a recipe to auto-fill ingredients
            </p>
          </>
        )}
      </div>

      {error && (
        <p style={{ marginTop: '1rem', color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
      )}
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
