'use client';

import React, { useState, useRef } from 'react';
import { createProduct } from '../actions';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [features, setFeatures] = useState<{title: string; description: string; file: File | null}[]>([]);
  const isSubmitting = useRef(false);
  const router = useRouter();

  const handleAction = async (formData: FormData) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsUploading(true);

    let hasUploadError = false;

    if (files.length > 0) {
      try {
        for (const file of files) {
          // Upload the physical file to Vercel Blob via our API route
          const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
            method: 'POST',
            body: file,
          });
          
          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            hasUploadError = true;
            alert(`Server error during upload for ${file.name}: ${err.error || 'Unknown error'}`);
            continue;
          }
          
          const blob = await response.json();
          
          if (blob.url) {
            // Pass the generated public URL to your Neon Database
            formData.append('imageUrls', blob.url);
          } else {
            hasUploadError = true;
            alert(`Failed to process image upload for ${file.name}.`);
          }
        }
      } catch (e) {
        hasUploadError = true;
        alert('Image upload error. Please check your connection.');
      }
    }
    
    let featuresData = [];
    if (features.length > 0 && !hasUploadError) {
      try {
        for (const feature of features) {
          if (feature.file) {
            const response = await fetch(`/api/upload?filename=${encodeURIComponent(feature.file.name)}`, {
              method: 'POST',
              body: feature.file,
            });
            if (!response.ok) {
              const err = await response.json().catch(() => ({}));
              console.error(err);
              hasUploadError = true;
              alert(`Server error during upload for feature ${feature.title}: ${err.error || 'Unknown error'}`);
              continue;
            }
            const blob = await response.json();
            if (blob.url) {
              featuresData.push({ title: feature.title, description: feature.description, image: blob.url });
            }
          } else {
            featuresData.push({ title: feature.title, description: feature.description, image: '' });
          }
        }
      } catch (e) {
        console.error(e);
        hasUploadError = true;
        alert('Feature image upload error.');
      }
    }

    if (hasUploadError) {
      // Abort saving to database if there was an upload issue
      setIsUploading(false);
      isSubmitting.current = false;
      return;
    }

    formData.append('features', JSON.stringify(featuresData));
    
    try {
      // Trigger Server Action to save product to DB
      await createProduct(formData);
    } catch (e: any) {
      if (e?.message && e.message.includes('NEXT_REDIRECT')) {
        throw e;
      }
      setIsUploading(false);
      isSubmitting.current = false;
      alert('Failed to save the product. Check if the URL Slug is unique.');
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)' }}>
        NEW PRODUCT REGISTRY
      </h1>

      <form action={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Name */}
        <div>
          <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Name</label>
          <input required name="name" type="text" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
        </div>

        {/* Slug */}
        <div>
          <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>URL Slug (e.g. heavy-hoodie-black)</label>
          <input required name="slug" type="text" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
        </div>

        {/* Category & Price */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Category</label>
            <select required name="category" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }}>
              <option value="Hoodies">Hoodies</option>
              <option value="Sweatpants">Sweatpants</option>
              <option value="Jackets">Jackets</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Price (£)</label>
            <input required name="price" type="number" step="0.01" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
          </div>
        </div>

        {/* Inventory & Image */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Initial Stock</label>
            <input required name="inStock" type="number" defaultValue="0" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
          </div>
          <div style={{ flex: 2 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Product Images</label>
            <input 
              required 
              type="file" 
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setFiles(Array.from(e.target.files));
                }
              }}
              style={{ width: '100%', padding: 'var(--space-2)', border: 'var(--border-thin)' }} 
            />
            {files.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                {files.map((f, i) => (
                  <img 
                    key={i} 
                    src={URL.createObjectURL(f)} 
                    alt={`Preview ${i}`} 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', border: 'var(--border-thin)' }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Description</label>
          <textarea name="description" rows={4} style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)', fontFamily: 'var(--font-body)' }}></textarea>
        </div>

        {/* Sizes and Colors */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Sizes (comma separated)</label>
            <input required name="sizes" type="text" placeholder="S, M, L, XL" defaultValue="S, M, L, XL" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Color Name & Hex</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
               <input required name="colorName" type="text" placeholder="Beige" defaultValue="Core" style={{ width: '60%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
               <input required name="colorHex" type="color" defaultValue="#000000" style={{ width: '40%', height: '48px', padding: '0', border: 'var(--border-thin)' }} />
            </div>
          </div>
        </div>

        {/* Fabric, Care, Fit */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Fabric</label>
            <input required name="fabric" type="text" placeholder="100% Heavyweight Cotton" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Care</label>
            <input required name="care" type="text" placeholder="Machine wash cold" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Fit</label>
            <input required name="fit" type="text" placeholder="Oversized Box Fit" style={{ width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' }} />
          </div>
        </div>

        {/* Story Features */}
        <div style={{ padding: 'var(--space-4)', border: 'var(--border-thin)', backgroundColor: 'var(--color-offwhite)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <label className="label">Story Features (Optional)</label>
            <button 
              type="button" 
              onClick={() => setFeatures([...features, { title: '', description: '', file: null }])}
              style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-black)', color: 'var(--color-white)', border: 'none', cursor: 'pointer' }}
            >
              + ADD FEATURE
            </button>
          </div>
          
          {features.map((feature, idx) => (
            <div key={idx} style={{ padding: 'var(--space-4)', border: 'var(--border-thin)', backgroundColor: 'var(--color-white)', marginBottom: 'var(--space-4)' }}>
               <input 
                 type="text" 
                 placeholder="Feature Title (e.g. THE WEAVE)" 
                 value={feature.title}
                 onChange={(e) => {
                   const newF = [...features];
                   newF[idx].title = e.target.value;
                   setFeatures(newF);
                 }}
                 style={{ width: '100%', padding: 'var(--space-2)', marginBottom: 'var(--space-2)', border: 'var(--border-thin)' }}
               />
               <textarea 
                 placeholder="Feature Description" 
                 value={feature.description}
                 onChange={(e) => {
                   const newF = [...features];
                   newF[idx].description = e.target.value;
                   setFeatures(newF);
                 }}
                 style={{ width: '100%', padding: 'var(--space-2)', marginBottom: 'var(--space-2)', border: 'var(--border-thin)', fontFamily: 'var(--font-body)' }}
               />
               <input 
                 type="file" 
                 accept="image/*"
                 onChange={(e) => {
                   if (e.target.files && e.target.files[0]) {
                     const newF = [...features];
                     newF[idx].file = e.target.files[0];
                     setFeatures(newF);
                   }
                 }}
                 style={{ width: '100%', padding: 'var(--space-2)', border: 'var(--border-thin)', marginBottom: 'var(--space-2)' }} 
               />
               <button 
                 type="button" 
                 onClick={() => {
                   const newF = [...features];
                   newF.splice(idx, 1);
                   setFeatures(newF);
                 }}
                 style={{ color: 'var(--color-alert-red)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
               >
                 Remove
               </button>
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-heading)',
            border: 'none',
            fontSize: 'var(--text-lg)',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            opacity: isUploading ? 0.5 : 1
          }}
        >
          {isUploading ? 'UPLOADING ASSETS & SAVING...' : 'PUBLISH TO STORE'}
        </button>
      </form>
    </div>
  );
}
