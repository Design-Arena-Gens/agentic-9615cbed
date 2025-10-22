'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { CollectionEntry, Farmer, MilkShift } from '@/types';
import { formatCurrency, formatNumber, round } from '@/utils/metrics';

interface CollectionsPanelProps {
  farmers: Farmer[];
  collections: CollectionEntry[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onCreate: (entry: CollectionEntry) => void;
}

const initialCollection = (date: string) => ({
  farmerId: '',
  date,
  shift: 'Morning' as MilkShift,
  quantityLiters: 10,
  fatPercentage: 3.8,
  snfPercentage: 8.3,
  ratePerLiter: 34,
  notes: ''
});

export function CollectionsPanel({ farmers, collections, selectedDate, onDateChange, onCreate }: CollectionsPanelProps) {
  const [form, setForm] = useState(() => initialCollection(selectedDate));
  const [keyword, setKeyword] = useState('');

  const filteredEntries = useMemo(() => {
    return collections
      .filter((entry) => entry.date === selectedDate)
      .filter((entry) => {
        if (!keyword.trim()) return true;
        const farmer = farmers.find((item) => item.id === entry.farmerId);
        const haystack = [farmer?.name, farmer?.village, farmer?.contact, entry.notes]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(keyword.trim().toLowerCase());
      })
      .sort((a, b) => a.shift.localeCompare(b.shift));
  }, [collections, selectedDate, keyword, farmers]);

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => {
        acc.quantity += entry.quantityLiters;
        acc.amount += entry.amount;
        acc.fat += entry.fatPercentage;
        acc.snf += entry.snfPercentage;
        return acc;
      },
      { quantity: 0, amount: 0, fat: 0, snf: 0 }
    );
  }, [filteredEntries]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.farmerId) return;

    const farmer = farmers.find((item) => item.id === form.farmerId);
    const rate = form.ratePerLiter || farmer?.ratePerLiter || 0;
    const amount = round(form.quantityLiters * rate, 2);

    const entry: CollectionEntry = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(),
      farmerId: form.farmerId,
      date: form.date,
      shift: form.shift,
      quantityLiters: round(form.quantityLiters, 2),
      fatPercentage: round(form.fatPercentage, 2),
      snfPercentage: round(form.snfPercentage, 2),
      ratePerLiter: round(rate, 2),
      amount,
      notes: form.notes?.trim() || undefined
    };

    onCreate(entry);
    setForm(initialCollection(selectedDate));
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Milk Collection Register</h2>
        <p>Record shift-wise procurement and maintain quality traceability.</p>
      </div>

      <div className="panel" style={{ marginBottom: '2rem' }}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Collection Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => {
                setForm((prev) => ({ ...prev, date: event.target.value }));
                onDateChange(event.target.value);
              }}
            />
          </label>

          <label>
            Farmer
            <select
              required
              value={form.farmerId}
              onChange={(event) => {
                const farmerId = event.target.value;
                const farmer = farmers.find((item) => item.id === farmerId);
                setForm((prev) => ({
                  ...prev,
                  farmerId,
                  ratePerLiter: farmer?.ratePerLiter ?? prev.ratePerLiter
                }));
              }}
            >
              <option value="">Select farmer</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.name} · {farmer.village}
                </option>
              ))}
            </select>
          </label>

          <label>
            Shift
            <select
              value={form.shift}
              onChange={(event) => setForm((prev) => ({ ...prev, shift: event.target.value as MilkShift }))}
            >
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </label>

          <label>
            Quantity (L)
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.quantityLiters}
              onChange={(event) => setForm((prev) => ({ ...prev, quantityLiters: Number(event.target.value) }))}
            />
          </label>

          <label>
            Butter Fat %
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.fatPercentage}
              onChange={(event) => setForm((prev) => ({ ...prev, fatPercentage: Number(event.target.value) }))}
            />
          </label>

          <label>
            SNF %
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.snfPercentage}
              onChange={(event) => setForm((prev) => ({ ...prev, snfPercentage: Number(event.target.value) }))}
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

          <label style={{ gridColumn: '1 / -1' }}>
            Notes (optional)
            <textarea
              rows={2}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Lacto reading, chilling comments or route notes"
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
            <button className="primary" type="submit">
              Log Collection
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="flex-space" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Collection Register</h3>
            <p style={{ margin: 0, color: '#6b7a90' }}>
              {filteredEntries.length} entries for {new Date(selectedDate).toLocaleDateString()}.
            </p>
          </div>
          <div className="flex-row" style={{ alignItems: 'center' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                onDateChange(event.target.value);
                setForm((prev) => ({ ...prev, date: event.target.value }));
              }}
            />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Quick search"
            />
          </div>
        </div>

        {filteredEntries.length ? (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Shift</th>
                    <th>Liters</th>
                    <th>Fat %</th>
                    <th>SNF %</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => {
                    const farmer = farmers.find((item) => item.id === entry.farmerId);
                    return (
                      <tr key={entry.id}>
                        <td>
                          <strong>{farmer?.name ?? 'Unknown'}</strong>
                          <div style={{ color: '#6b7a90', fontSize: '0.85rem' }}>{farmer?.village ?? '—'}</div>
                        </td>
                        <td>{entry.shift}</td>
                        <td>{formatNumber(entry.quantityLiters)}</td>
                        <td>{entry.fatPercentage.toFixed(1)}</td>
                        <td>{entry.snfPercentage.toFixed(1)}</td>
                        <td>{formatCurrency(entry.ratePerLiter)}</td>
                        <td>{formatCurrency(entry.amount)}</td>
                        <td>{entry.notes ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="card-grid" style={{ marginTop: '1.5rem' }}>
              <div className="card" style={{ boxShadow: 'none', background: '#f9fbff' }}>
                <span className="metric-label">Total Liters</span>
                <span className="metric-value">{formatNumber(totals.quantity)} L</span>
              </div>
              <div className="card" style={{ boxShadow: 'none', background: '#f2fff7' }}>
                <span className="metric-label">Total Value</span>
                <span className="metric-value">{formatCurrency(totals.amount)}</span>
              </div>
              <div className="card" style={{ boxShadow: 'none', background: '#fff9f2' }}>
                <span className="metric-label">Avg Fat / SNF</span>
                <span className="metric-value">
                  {filteredEntries.length
                    ? `${round(totals.fat / filteredEntries.length, 2)}% / ${round(totals.snf / filteredEntries.length, 2)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">No collection entries recorded for this date.</div>
        )}
      </div>
    </div>
  );
}
