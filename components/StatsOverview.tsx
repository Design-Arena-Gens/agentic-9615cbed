import type { Farmer, CollectionEntry, PaymentRecord } from '@/types';
import { computeDashboardTotals, formatCurrency, formatNumber, getTopPerformingFarmers } from '@/utils/metrics';

interface StatsOverviewProps {
  farmers: Farmer[];
  collections: CollectionEntry[];
  payments: PaymentRecord[];
  selectedDate: string;
}

export function StatsOverview({ farmers, collections, payments, selectedDate }: StatsOverviewProps) {
  const totals = computeDashboardTotals(farmers, collections, payments, selectedDate);
  const topFarmers = getTopPerformingFarmers(farmers, collections, 3);

  return (
    <div className="section">
      <div className="section-header">
        <h2>Daily Procurement Snapshot</h2>
        <p>
          Summary for <strong>{new Date(selectedDate).toLocaleDateString()}</strong>. Keep an eye on
          collection volumes, cash flow and quality parameters.
        </p>
      </div>

      <div className="card-grid">
        <div className="card">
          <span className="metric-label">Total Farmers</span>
          <span className="metric-value">{totals.totalFarmers}</span>
          <span className="pill">Active: {totals.activeFarmers}</span>
        </div>

        <div className="card">
          <span className="metric-label">Milk Collected Today</span>
          <span className="metric-value">{formatNumber(totals.daily.totalLiters)} L</span>
          <span className="pill">{formatCurrency(totals.daily.totalAmount)}</span>
        </div>

        <div className="card">
          <span className="metric-label">Quality Averages</span>
          <span className="metric-value">{totals.daily.averageFat}% Fat</span>
          <span className="pill">SNF {totals.daily.averageSNF}%</span>
        </div>

        <div className="card">
          <span className="metric-label">Financial Health</span>
          <span className="metric-value">{formatCurrency(totals.totalOutstanding)}</span>
          <span className="pill">Paid {formatCurrency(totals.totalPaid)}</span>
        </div>
      </div>

      <div className="section" style={{ marginTop: '2rem' }}>
        <div className="panel">
          <div className="flex-space" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Shift Breakdown</h3>
              <p style={{ margin: 0, color: '#6b7a90' }}>Monitor morning vs evening procurement mix.</p>
            </div>
          </div>
          <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="card" style={{ boxShadow: 'none', background: '#f9fbff' }}>
              <span className="metric-label">Morning Shift</span>
              <span className="metric-value">{formatNumber(totals.daily.shiftBreakdown.Morning)} L</span>
            </div>
            <div className="card" style={{ boxShadow: 'none', background: '#fff9f2' }}>
              <span className="metric-label">Evening Shift</span>
              <span className="metric-value">{formatNumber(totals.daily.shiftBreakdown.Evening)} L</span>
            </div>
            <div className="card" style={{ boxShadow: 'none', background: '#f2fff7' }}>
              <span className="metric-label">Overall Monthly</span>
              <span className="metric-value">{formatNumber(totals.overallLiters)} L</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section" style={{ marginTop: '2rem' }}>
        <div className="panel">
          <div className="flex-space" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Top Supplying Farmers</h3>
              <p style={{ margin: 0, color: '#6b7a90' }}>
                Recognize consistent performers and plan route optimization.
              </p>
            </div>
          </div>

          {topFarmers.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Village</th>
                    <th>Volume</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topFarmers.map(({ farmer, totalLiters, totalAmount }) => (
                    <tr key={farmer.id}>
                      <td>
                        <strong>{farmer.name}</strong>
                        <div style={{ color: '#6b7a90', fontSize: '0.85rem' }}>
                          Farmer #{farmer.code ?? farmer.id.substring(0, 6)}
                        </div>
                      </td>
                      <td>{farmer.village}</td>
                      <td>{formatNumber(totalLiters)} L</td>
                      <td>{formatCurrency(totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No collection entries yet. Record a collection to see insights.</div>
          )}
        </div>
      </div>
    </div>
  );
}
