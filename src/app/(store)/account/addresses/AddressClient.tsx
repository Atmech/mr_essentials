'use client';

import React, { useState } from 'react';
import styles from './page.module.css';
import Button from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useToastStore } from '@/lib/store/toast';
import Badge from '@/components/ui/Badge/Badge';

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefault: number;
}

export default function AddressClient({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addressList, setAddressList] = useState<Address[]>(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newAddr = await res.json();
        setAddressList((prev) => [...prev, newAddr]);
        setShowForm(false);
        addToast({ message: 'Address saved', type: 'success' });
      }
    } catch {
      addToast({ message: 'Failed to save address', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddressList((prev) => prev.filter((a) => a.id !== id));
        addToast({ message: 'Address deleted', type: 'info' });
      }
    } catch {
      addToast({ message: 'Failed to delete address', type: 'error' });
    }
  };

  return (
    <div>
      {addressList.length === 0 && !showForm && (
        <div className={styles.empty}>
          <MapPin size={48} className={styles.emptyIcon} />
          <p className={styles.emptyText}>NO ADDRESSES SAVED</p>
          <p className={styles.emptySubtext}>Add a shipping address for faster checkout</p>
        </div>
      )}

      <div className={styles.grid}>
        {addressList.map((addr) => (
          <div key={addr.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardLabel}>{addr.label}</span>
              {addr.isDefault === 1 && <Badge variant="default">DEFAULT</Badge>}
            </div>
            <p className={styles.cardName}>{addr.fullName}</p>
            <p className={styles.cardLine}>{addr.line1}</p>
            {addr.line2 && <p className={styles.cardLine}>{addr.line2}</p>}
            <p className={styles.cardLine}>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
            <p className={styles.cardLine}>{addr.country}</p>
            {addr.phone && <p className={styles.cardPhone}>{addr.phone}</p>}
            <button className={styles.deleteBtn} onClick={() => handleDelete(addr.id)}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h2 className={styles.formTitle}>ADD NEW ADDRESS</h2>
          <div className={styles.formGrid}>
            <Input label="Label" name="label" placeholder="e.g. Home, Work" required />
            <Input label="Full Name" name="fullName" required />
            <Input label="Phone" name="phone" placeholder="Optional" />
            <Input label="Address Line 1" name="line1" required />
            <Input label="Address Line 2" name="line2" placeholder="Optional" />
            <Input label="City" name="city" required />
            <Input label="State / County" name="state" />
            <Input label="Postal Code" name="postalCode" required />
            <Input label="Country" name="country" placeholder="GB" required />
          </div>
          <div className={styles.formActions}>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? 'SAVING...' : 'SAVE ADDRESS'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              CANCEL
            </Button>
          </div>
        </form>
      ) : (
        <button className={styles.addBtn} onClick={() => setShowForm(true)}>
          <Plus size={18} /> ADD NEW ADDRESS
        </button>
      )}
    </div>
  );
}
