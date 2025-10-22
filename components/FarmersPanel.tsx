'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { Farmer } from '@/types';

interface FarmersPanelProps {
  farmers: Farmer[];
  onCreate: (farmer: Farmer) => void;
  onToggleStatus: (farmerId: string) => void;
}

const blankForm = {
  name: '',
  village: '',
  contact: '',
  code: '',
  ratePerLiter: 34
};

export function FarmersPanel({ farmers, onCreate, onToggleStatus }: FarmersPanelProps) {
  const [form, setForm] = useState(blankForm);
  const [query, setQuery] = useState('');

  const filteredFarmers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return farmers;
    return farmers.filter((farmer) =>
      [farmer.name, farmer.village, farmer.contact, farmer.code]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [farmers, query]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.village) return;

    const farmer: Farmer = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(),
      name: form.name.trim(),
      village: form.village.trim(),
      contact: form.contact.trim(),
      code: form.code.trim() || undefined,
      ratePerLiter: Number(form.ratePerLiter) || 0,
      isActive: true
    };

    onCreate(farmer);
    setForm(blankForm);
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Farmer Directory</h2>
        <p>Maintain up-to-date producer profiles and negotiated milk rates.</p>
      </div>

      <div className="panel" style={{ marginBottom: '2rem' }}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Farmer Name
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="e.g. Ramesh Gowda"
            />
          </label>

          <label>
            Village / Route
            <input
              required
              value={form.village}
              onChange={(event) => setForm((prev) => ({ ...prev, village: event.target.value }))}
              placeholder="e.g. Hosanagara"
            />
          </label>

          <label>
            Mobile / WhatsApp
            <input
              value={form.contact}
              onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
              placeholder="98765 43210"
            />
          </label>

          <label>
            Farmer Code
            <input
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              placeholder="Optional short code"
            />
          </label>

          <label>
            Rate per Liter (₹)
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.ratePerLiter}
              onChange={(event) => setForm((prev) => ({ ...prev, ratePerLiter: Number(event.target.value) }))}
            />
          </label>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <button className="primary" type="submit">
              Save Farmer
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="flex-space" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Active Producers</h3>
            <p style={{ margin: 0, color: '#6b7a90' }}>Search by name, village or contact.</p>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search farmer"
            style={{ maxWidth: '240px' }}
          />
        </div>

        {filteredFarmers.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Village</th>
                  <th>Contact</th>
                  <th>Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFarmers.map((farmer) => (
                  <tr key={farmer.id}>
                    <td>
                      <strong>{farmer.name}</strong>
                      <div style={{ color: '#6b7a90', fontSize: '0.85rem' }}>
                        #{farmer.code ?? farmer.id.slice(0, 6)}
                      </div>
                    </td>
                    <td>{farmer.village}</td>
                    <td>{farmer.contact || '—'}</td>
                    <td>₹ {farmer.ratePerLiter.toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className={`status-pill ${farmer.isActive ? 'success' : 'pending'}`}
                        onClick={() => onToggleStatus(farmer.id)}
                      >
                        {farmer.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No matching farmers found.</div>
        )}
      </div>
    </div>
  );
}
