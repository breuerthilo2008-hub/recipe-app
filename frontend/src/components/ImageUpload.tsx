// frontend/src/components/ImageUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { Camera, Image as ImageIcon, Loader2, X, UploadCloud } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  initialValue?: string;
}

export default function ImageUpload({ onUploadComplete, initialValue }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialValue || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
       alert('Please upload an image file');
       return;
    }

    setUploading(true);
    // Create immediate local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setPreview(newBlob.url);
      onUploadComplete(newBlob.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please check your connection or Vercel Token.');
      setPreview(initialValue || null);
    } finally {
      setUploading(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative group cursor-pointer overflow-hidden transition-all duration-500
          aspect-video rounded-[3rem] border-4 border-dashed flex flex-col items-center justify-center
          ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border bg-muted hover:border-primary/30'}
          ${preview ? 'border-none' : ''}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Recipe Preview" 
              className={`w-full h-full object-cover transition-all duration-700 ${uploading ? 'opacity-40 grayscale' : 'group-hover:scale-105'}`} 
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <div className="bg-card/90 backdrop-blur p-4 rounded-2xl flex items-center gap-2 text-accent font-black shadow-xl">
                 <Camera size={20} />
                 Change Photo
               </div>
            </div>
            
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="bg-card/80 backdrop-blur p-6 rounded-full shadow-2xl">
                  <Loader2 className="text-primary animate-spin" size={32} />
                </div>
                <p className="text-white font-black drop-shadow-md uppercase tracking-[0.2em] text-sm">Uploading...</p>
              </div>
            )}
            
            {!uploading && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setPreview(null); onUploadComplete(''); }}
                  className="absolute top-4 right-4 p-3 bg-card/90 backdrop-blur text-red-500 rounded-2xl shadow-lg hover:bg-card transition-all"
                >
                    <X size={20} />
                </button>
            )}
          </>
        ) : (
          <div className="text-center p-12">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/5">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-2xl font-black text-accent mb-2">Add a Cover Photo</h3>
            <p className="text-muted-foreground font-medium max-w-[200px] mx-auto text-sm">Drag and drop or click to upload your recipe's masterpiece.</p>
          </div>
        )}
      </div>
      
      <p className="mt-4 text-[10px] uppercase font-black text-muted-foreground tracking-widest text-center">
        Maximum file size: 5MB • Supported formats: JPG, PNG, WEBP
      </p>
    </div>
  );
}
