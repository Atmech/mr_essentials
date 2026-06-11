'use client';

import React, { useState, useRef } from 'react';
import { updateProduct } from '../../actions';
import { CATEGORIES, GENDERS } from '@/lib/constants';
import type { Product } from '@/lib/types';

type FeatureRow = { title: string; description: string; image: string; file: File | null };
type ColorRow = { name: string; hex: string };

/** Format a stored date for a timezone-naive <input type="datetime-local"> in local time. */
function toLocalInputValue(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 'var(--space-2)' };

export default function EditProductClient({ product }: { product: Product }) {
  const [isSaving, setIsSaving] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>(product.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [colors, setColors] = useState<ColorRow[]>(
    product.colors && product.colors.length > 0 ? product.colors : [{ name: 'Standard', hex: '#222222' }]
  );
  const [features, setFeatures] = useState<FeatureRow[]>(
    (product.features ?? []).map((f) => ({ ...f, file: null }))
  );
  const isSubmitting = useRef(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      body: file,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      alert(`Server error during upload for ${file.name}: ${err.error || 'Unknown error'}`);
      return null;
    }
    const blob = await response.json();
    return blob.url ?? null;
  };

  const handleAction = async (formData: FormData) => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsSaving(true);

    let hasUploadError = false;

    try {
      // Surviving existing images first (in their current order), then new uploads.
      for (const url of existingImages) formData.append('imageUrls', url);
      for (const file of newFiles) {
        const url = await uploadFile(file);
        if (url) formData.append('imageUrls', url);
        else hasUploadError = true;
      }

      const featuresData: { title: string; description: string; image: string }[] = [];
      for (const feature of features) {
        let image = feature.image;
        if (feature.file) {
          const url = await uploadFile(feature.file);
          if (url) image = url;
          else hasUploadError = true;
        }
        featuresData.push({ title: feature.title, description: feature.description, image });
      }

      if (hasUploadError) return; // keep the form state so the admin can retry

      formData.append('features', JSON.stringify(featuresData));
      formData.append('colors', JSON.stringify(colors.filter((c) => c.name.trim())));

      await updateProduct(formData);
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      if (message.includes('NEXT_REDIRECT')) {
        throw e;
      }
      alert(message || 'Failed to save the product.');
    } finally {
      setIsSaving(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)' }}>
        EDIT PRODUCT
      </h1>

      <form action={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <input type="hidden" name="productId" value={product.id} />

        {/* Visibility flags */}
        <div style={{ display: 'flex', gap: 'var(--space-6)', padding: 'var(--space-4)', border: 'var(--border-thin)', backgroundColor: 'var(--color-offwhite)' }}>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
            <input type="checkbox" name="featured" defaultChecked={product.featured} />
            Featured (shown first on homepage)
          </label>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', color: 'var(--color-alert-red)' }}>
            <input type="checkbox" name="archived" defaultChecked={product.archived} />
            Archived (hidden from the store)
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="label" style={labelStyle}>Name</label>
          <input required name="name" type="text" defaultValue={product.name} style={inputStyle} />
        </div>

        {/* Slug */}
        <div>
          <label className="label" style={labelStyle}>URL Slug</label>
          <input required name="slug" type="text" defaultValue={product.slug} style={inputStyle} />
        </div>

        {/* Category & Gender */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Category</label>
            <select required name="category" defaultValue={product.category} style={inputStyle}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Gender</label>
            <select required name="gender" defaultValue={product.gender} style={inputStyle}>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Sale Price */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Price (£)</label>
            <input required name="price" type="number" step="0.01" min="0" defaultValue={(product.price / 100).toFixed(2)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Sale Price (£) — optional</label>
            <input name="salePrice" type="number" step="0.01" min="0" placeholder="Leave blank if not on sale" defaultValue={product.salePrice != null ? (product.salePrice / 100).toFixed(2) : ''} style={inputStyle} />
          </div>
        </div>

        {/* Sale window */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Sale Starts — optional</label>
            <input name="saleStartsAt" type="datetime-local" defaultValue={toLocalInputValue(product.saleStartsAt)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Sale Ends — optional</label>
            <input name="saleEndsAt" type="datetime-local" defaultValue={toLocalInputValue(product.saleEndsAt)} style={inputStyle} />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label className="label" style={labelStyle}>Stock</label>
          <input required name="inStock" type="number" min="0" defaultValue={product.inStock} style={inputStyle} />
        </div>

        {/* Images */}
        <div style={{ padding: 'var(--space-4)', border: 'var(--border-thin)', backgroundColor: 'var(--color-offwhite)' }}>
          <label className="label" style={labelStyle}>Product Images</label>
          {existingImages.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
              {existingImages.map((url) => (
                <div key={url} style={{ position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Product" style={{ width: '80px', height: '80px', objectFit: 'cover', border: 'var(--border-thin)' }} />
                  <button
                    type="button"
                    onClick={() => setExistingImages(existingImages.filter((u) => u !== url))}
                    aria-label="Remove image"
                    style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-black)', color: 'var(--color-white)', border: 'none', cursor: 'pointer', width: '20px', height: '20px', lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => { if (e.target.files) setNewFiles(Array.from(e.target.files)); }}
            style={{ width: '100%', padding: 'var(--space-2)', border: 'var(--border-thin)' }}
          />
          {newFiles.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              {newFiles.map((f, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={URL.createObjectURL(f)} alt={`Preview ${i}`} style={{ width: '80px', height: '80px', objectFit: 'cover', border: 'var(--border-thin)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="label" style={labelStyle}>Description</label>
          <textarea name="description" rows={4} defaultValue={product.description ?? ''} style={{ ...inputStyle, fontFamily: 'var(--font-body)' }}></textarea>
        </div>

        {/* Sizes */}
        <div>
          <label className="label" style={labelStyle}>Sizes (comma separated)</label>
          <input required name="sizes" type="text" defaultValue={(product.sizes ?? ['S', 'M', 'L', 'XL']).join(', ')} style={inputStyle} />
        </div>

        {/* Colours */}
        <div style={{ padding: 'var(--space-4)', border: 'var(--border-thin)', backgroundColor: 'var(--color-offwhite)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <label className="label">Colours</label>
            <button
              type="button"
              onClick={() => setColors([...colors, { name: '', hex: '#000000' }])}
              style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: 'var(--color-black)', color: 'var(--color-white)', border: 'none', cursor: 'pointer' }}
            >
              + ADD COLOUR
            </button>
          </div>
          {colors.map((color, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Colour name"
                value={color.name}
                onChange={(e) => {
                  const next = [...colors];
                  next[idx] = { ...next[idx], name: e.target.value };
                  setColors(next);
                }}
                style={{ flex: 1, padding: 'var(--space-2)', border: 'var(--border-thin)' }}
              />
              <input
                type="color"
                value={color.hex}
                onChange={(e) => {
                  const next = [...colors];
                  next[idx] = { ...next[idx], hex: e.target.value };
                  setColors(next);
                }}
                style={{ width: '48px', height: '40px', padding: 0, border: 'var(--border-thin)' }}
              />
              <button
                type="button"
                onClick={() => setColors(colors.filter((_, i) => i !== idx))}
                disabled={colors.length <= 1}
                style={{ color: 'var(--color-alert-red)', background: 'none', border: 'none', cursor: colors.length <= 1 ? 'not-allowed' : 'pointer', textDecoration: 'underline', opacity: colors.length <= 1 ? 0.4 : 1 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Fabric, Care, Fit */}
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Fabric</label>
            <input required name="fabric" type="text" defaultValue={product.fabric ?? ''} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Care</label>
            <input required name="care" type="text" defaultValue={product.care ?? ''} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label" style={labelStyle}>Fit</label>
            <input required name="fit" type="text" defaultValue={product.fit ?? ''} style={inputStyle} />
          </div>
        </div>

        {/* Story Features */}
        <div style={{ padding: 'var(--space-4)', border: 'var(--border-thin)', backgroundColor: 'var(--color-offwhite)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <label className="label">Story Features (Optional)</label>
            <button
              type="button"
              onClick={() => setFeatures([...features, { title: '', description: '', image: '', file: null }])}
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
                  const next = [...features];
                  next[idx] = { ...next[idx], title: e.target.value };
                  setFeatures(next);
                }}
                style={{ width: '100%', padding: 'var(--space-2)', marginBottom: 'var(--space-2)', border: 'var(--border-thin)' }}
              />
              <textarea
                placeholder="Feature Description"
                value={feature.description}
                onChange={(e) => {
                  const next = [...features];
                  next[idx] = { ...next[idx], description: e.target.value };
                  setFeatures(next);
                }}
                style={{ width: '100%', padding: 'var(--space-2)', marginBottom: 'var(--space-2)', border: 'var(--border-thin)', fontFamily: 'var(--font-body)' }}
              />
              {feature.image && !feature.file && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)', marginBottom: 'var(--space-2)' }}>
                  Current image kept — choose a file to replace it.
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const next = [...features];
                    next[idx] = { ...next[idx], file: e.target.files[0] };
                    setFeatures(next);
                  }
                }}
                style={{ width: '100%', padding: 'var(--space-2)', border: 'var(--border-thin)', marginBottom: 'var(--space-2)' }}
              />
              <button
                type="button"
                onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                style={{ color: 'var(--color-alert-red)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-black)',
            color: 'var(--color-white)',
            fontFamily: 'var(--font-heading)',
            border: 'none',
            fontSize: 'var(--text-lg)',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.5 : 1,
          }}
        >
          {isSaving ? 'SAVING…' : 'SAVE CHANGES'}
        </button>
      </form>
    </div>
  );
}
