import type { CollectionEntry, Farmer, PaymentRecord } from '@/types';

export interface DailyMetrics {
  date: string;
  totalLiters: number;
  totalAmount: number;
  averageFat: number;
  averageSNF: number;
  uniqueFarmers: number;
  shiftBreakdown: Record<'Morning' | 'Evening', number>;
}

export interface FarmerBalance {
  farmer: Farmer;
  totalLiters: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
}

export const round = (value: number, precision = 2) => {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
};

export function calculateDailyMetrics(
  date: string,
  collections: CollectionEntry[]
): DailyMetrics {
  const entries = collections.filter((entry) => entry.date === date);

  const totals = entries.reduce(
    (acc, entry) => {
      acc.totalLiters += entry.quantityLiters;
      acc.totalAmount += entry.amount;
      acc.totalFat += entry.fatPercentage;
      acc.totalSnf += entry.snfPercentage;
      acc.farmerIds.add(entry.farmerId);
      acc.shiftBreakdown[entry.shift] += entry.quantityLiters;
      return acc;
    },
    {
      totalLiters: 0,
      totalAmount: 0,
      totalFat: 0,
      totalSnf: 0,
      farmerIds: new Set<string>(),
      shiftBreakdown: { Morning: 0, Evening: 0 } as Record<'Morning' | 'Evening', number>
    }
  );

  const length = entries.length || 1;

  return {
    date,
    totalLiters: round(totals.totalLiters, 2),
    totalAmount: round(totals.totalAmount, 2),
    averageFat: round(totals.totalFat / length, 2),
    averageSNF: round(totals.totalSnf / length, 2),
    uniqueFarmers: totals.farmerIds.size,
    shiftBreakdown: totals.shiftBreakdown
  };
}

export function computeFarmerBalances(
  farmers: Farmer[],
  collections: CollectionEntry[],
  payments: PaymentRecord[]
): FarmerBalance[] {
  return farmers.map((farmer) => {
    const farmerCollections = collections.filter((entry) => entry.farmerId === farmer.id);
    const farmerPayments = payments.filter((payment) => payment.farmerId === farmer.id);

    const totalLiters = farmerCollections.reduce((sum, entry) => sum + entry.quantityLiters, 0);
    const totalAmount = farmerCollections.reduce((sum, entry) => sum + entry.amount, 0);
    const amountPaid = farmerPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      farmer,
      totalLiters: round(totalLiters, 2),
      totalAmount: round(totalAmount, 2),
      amountPaid: round(amountPaid, 2),
      balance: round(totalAmount - amountPaid, 2)
    };
  });
}

export function computeDashboardTotals(
  farmers: Farmer[],
  collections: CollectionEntry[],
  payments: PaymentRecord[],
  selectedDate: string
) {
  const daily = calculateDailyMetrics(selectedDate, collections);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const overall = collections.reduce(
    (acc, entry) => {
      acc.liters += entry.quantityLiters;
      acc.amount += entry.amount;
      acc.fat += entry.fatPercentage;
      acc.snf += entry.snfPercentage;
      return acc;
    },
    { liters: 0, amount: 0, fat: 0, snf: 0 }
  );

  const count = collections.length || 1;

  return {
    totalFarmers: farmers.length,
    activeFarmers: farmers.filter((farmer) => farmer.isActive).length,
    totalCollections: collections.length,
    overallLiters: round(overall.liters, 2),
    overallAmount: round(overall.amount, 2),
    overallAverageFat: round(overall.fat / count, 2),
    overallAverageSNF: round(overall.snf / count, 2),
    totalPaid: round(totalPaid, 2),
    totalOutstanding: round(overall.amount - totalPaid, 2),
    daily
  };
}

export function getTopPerformingFarmers(
  farmers: Farmer[],
  collections: CollectionEntry[],
  limit = 3
) {
  const balanceMap = computeFarmerBalances(farmers, collections, []).map(({ farmer, totalLiters, totalAmount }) => ({
    farmer,
    totalLiters,
    totalAmount
  }));

  return balanceMap
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, limit);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2
  }).format(value);
}
