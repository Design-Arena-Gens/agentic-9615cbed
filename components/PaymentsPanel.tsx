'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { CollectionEntry, Farmer, PaymentRecord } from '@/types';
import { computeFarmerBalances, formatCurrency, formatNumber } from '@/utils/metrics';

interface PaymentsPanelProps {
  farmers: Farmer[];
  collections: CollectionEntry[];
  payments: PaymentRecord[];
  onCreate: (record: PaymentRecord) => void;
}

const blankPayment = {
  farmerId: '',
  date: new Date().toISOString().slice(0, 10),
  amount: 0,
  method: 'Cash' as PaymentRecord['method'],
  reference: '',
  notes: ''
};

export function PaymentsPanel({ farmers, collections, payments, onCreate }: PaymentsPanelProps) {
  const [form, setForm] = useState(blankPayment);
  const [filter, setFilter] = useState('');

  const balances = useMemo(() => computeFarmerBalances(farmers, collections, payments), [farmers, collections, payments]);

  const filteredBalances = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return balances;
    return balances.filter(({ farmer }) =>
      [farmer.name, farmer.village, farmer.contact, farmer.code]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q))
    );
  }, [balances, filter]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.farmerId || !form.amount) return;

    const record: PaymentRecord = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString(),
      farmerId: form.farmerId,
      date: form.date,
      amount: Number(form.amount),
      method: form.method,
      reference: form.reference.trim() || undefined,
      notes: form.notes.trim() || undefined
    };

    onCreate(record);
    setForm(blankPayment);
  };

  const totalOutstanding = balances.reduce((sum, item) => sum + Math.max(item.balance, 0), 0);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Payments & Settlement</h2>
        <p>Track payout cycles and maintain farmer trust with transparent records.</p>
      </div>

      <div className="card-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#f2fff7' }}>
          <span className="metric-label">Amount Paid</span>
          <span className="metric-value">{formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}</span>
          <span className="pill">{payments.length} transactions</span>
        </div>
        <div className="card" style={{ background: '#fff9f2' }}>
          <span className="metric-label">Outstanding Balance</span>
          <span className="metric-value">{formatCurrency(totalOutstanding)}</span>
          <span className="pill">{farmers.length} farmers</span>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: '2rem' }}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Farmer
            <select
              required
              value={form.farmerId}
              onChange={(event) => setForm((prev) => ({ ...prev, farmerId: event.target.value }))}
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
            Payment Date
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            />
          </label>

          <label>
            Amount (₹)
            <input
              type="number"
              min={0}
              step={0.5}
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))}
            />
          </label>

          <label>
            Method
            <select
              value={form.method}
              onChange={(event) => setForm((prev) => ({ ...prev, method: event.target.value as PaymentRecord['method'] }))}
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>UPI</option>
              <option>Cheque</option>
            </select>
          </label>

          <label>
            Reference
            <input
              value={form.reference}
              onChange={(event) => setForm((prev) => ({ ...prev, reference: event.target.value }))}
              placeholder="UTR / cheque no"
            />
          </label>

          <label style={{ gridColumn: '1 / -1' }}>
            Notes
            <textarea
              rows={2}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Payment remarks"
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gridColumn: '1 / -1' }}>
            <button className="primary" type="submit">
              Record Payment
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="flex-space" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Outstanding Summary</h3>
            <p style={{ margin: 0, color: '#6b7a90' }}>Sort by balance to prioritize payouts.</p>
          </div>
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Search farmer"
            style={{ maxWidth: '240px' }}
          />
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Liters</th>
                <th>Total Due</th>
                <th>Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredBalances
                .sort((a, b) => b.balance - a.balance)
                .map(({ farmer, totalLiters, totalAmount, amountPaid, balance }) => (
                  <tr key={farmer.id}>
                    <td>
                      <strong>{farmer.name}</strong>
                      <div style={{ color: '#6b7a90', fontSize: '0.85rem' }}>{farmer.village}</div>
                    </td>
                    <td>{formatNumber(totalLiters)} L</td>
                    <td>{formatCurrency(totalAmount)}</td>
                    <td className="trend-up">{formatCurrency(amountPaid)}</td>
                    <td className={balance <= 0 ? 'trend-up' : 'trend-down'}>{formatCurrency(balance)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
