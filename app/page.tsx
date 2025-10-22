'use client';

import { useMemo, useState } from 'react';
import { FarmersPanel } from '@/components/FarmersPanel';
import { CollectionsPanel } from '@/components/CollectionsPanel';
import { PaymentsPanel } from '@/components/PaymentsPanel';
import { StatsOverview } from '@/components/StatsOverview';
import { TabNavigation } from '@/components/TabNavigation';
import { usePersistentState } from '@/hooks/usePersistentState';
import type { CollectionEntry, Farmer, PaymentRecord } from '@/types';

const today = new Date();
const todayISO = today.toISOString().slice(0, 10);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const yesterdayISO = yesterday.toISOString().slice(0, 10);

const defaultFarmers: Farmer[] = [
  {
    id: 'farmer-01',
    name: 'Anil Kumar',
    village: 'Holenarasipur',
    contact: '98765 43210',
    code: 'F001',
    ratePerLiter: 34.5,
    isActive: true
  },
  {
    id: 'farmer-02',
    name: 'Savitri Hegde',
    village: 'Shivamogga',
    contact: '99876 54321',
    code: 'F002',
    ratePerLiter: 33.8,
    isActive: true
  },
  {
    id: 'farmer-03',
    name: 'Mahesh Patil',
    village: 'Ranebennur',
    contact: '91234 56789',
    code: 'F003',
    ratePerLiter: 35.2,
    isActive: true
  }
];

const defaultCollections: CollectionEntry[] = [
  {
    id: 'col-01',
    farmerId: 'farmer-01',
    date: todayISO,
    shift: 'Morning',
    quantityLiters: 28,
    fatPercentage: 3.9,
    snfPercentage: 8.4,
    ratePerLiter: 34.5,
    amount: 966,
    notes: 'Clean sample'
  },
  {
    id: 'col-02',
    farmerId: 'farmer-02',
    date: todayISO,
    shift: 'Evening',
    quantityLiters: 24,
    fatPercentage: 3.8,
    snfPercentage: 8.2,
    ratePerLiter: 33.8,
    amount: 811.2
  },
  {
    id: 'col-03',
    farmerId: 'farmer-03',
    date: yesterdayISO,
    shift: 'Morning',
    quantityLiters: 30,
    fatPercentage: 4.1,
    snfPercentage: 8.6,
    ratePerLiter: 35.2,
    amount: 1056
  }
];

const defaultPayments: PaymentRecord[] = [
  {
    id: 'pay-01',
    farmerId: 'farmer-01',
    date: yesterdayISO,
    amount: 1500,
    method: 'Bank Transfer',
    reference: 'NEFT2811X'
  },
  {
    id: 'pay-02',
    farmerId: 'farmer-02',
    date: yesterdayISO,
    amount: 1200,
    method: 'UPI',
    reference: 'UPI812AA'
  }
];

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Overview of daily procurement, quality metrics and payouts.'
  },
  {
    id: 'farmers',
    label: 'Farmers',
    description: 'Maintain producer directory, contracted rates and contact details.'
  },
  {
    id: 'collections',
    label: 'Collections',
    description: 'Record shift-wise milk procurement and monitor quality trends.'
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Track settlements, outstanding balances and share transparency.'
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  const [farmers, setFarmers, farmersHydrated, resetFarmers] = usePersistentState<Farmer[]>(
    'milk-farmers',
    defaultFarmers
  );
  const [collections, setCollections, collectionsHydrated, resetCollections] = usePersistentState<CollectionEntry[]>(
    'milk-collections',
    defaultCollections
  );
  const [payments, setPayments, paymentsHydrated, resetPayments] = usePersistentState<PaymentRecord[]>(
    'milk-payments',
    defaultPayments
  );

  const isHydrated = farmersHydrated && collectionsHydrated && paymentsHydrated;

  const inActiveFarmers = useMemo(() => farmers.filter((farmer) => farmer.isActive), [farmers]);

  const handleAddFarmer = (farmer: Farmer) => {
    setFarmers((prev) => [farmer, ...prev]);
  };

  const handleToggleFarmerStatus = (farmerId: string) => {
    setFarmers((prev) =>
      prev.map((farmer) => (farmer.id === farmerId ? { ...farmer, isActive: !farmer.isActive } : farmer))
    );
  };

  const handleAddCollection = (entry: CollectionEntry) => {
    setCollections((prev) => [entry, ...prev]);
  };

  const handleAddPayment = (record: PaymentRecord) => {
    setPayments((prev) => [record, ...prev]);
  };

  const resetAllData = () => {
    resetFarmers();
    resetCollections();
    resetPayments();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="flex-space">
          <div>
            <h1>Milk Collection Command Center</h1>
            <p style={{ margin: 0, opacity: 0.85 }}>
              Digitize procurement, reduce leakages and keep settlements on track.
            </p>
          </div>
          <div className="flex-row" style={{ alignItems: 'center' }}>
            <button className="secondary" type="button" onClick={resetAllData}>
              Reset Demo Data
            </button>
          </div>
        </div>
      </header>

      <main className="app-content">
        <TabNavigation tabs={tabs} activeId={activeTab} onChange={setActiveTab} />

        {!isHydrated ? (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            Loading procurement records from secure storage...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <StatsOverview
                farmers={farmers}
                collections={collections}
                payments={payments}
                selectedDate={selectedDate}
              />
            )}

            {activeTab === 'farmers' && (
              <FarmersPanel
                farmers={farmers}
                onCreate={handleAddFarmer}
                onToggleStatus={handleToggleFarmerStatus}
              />
            )}

            {activeTab === 'collections' && (
              <CollectionsPanel
                farmers={inActiveFarmers}
                collections={collections}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                onCreate={handleAddCollection}
              />
            )}

            {activeTab === 'payments' && (
              <PaymentsPanel
                farmers={farmers}
                collections={collections}
                payments={payments}
                onCreate={handleAddPayment}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
