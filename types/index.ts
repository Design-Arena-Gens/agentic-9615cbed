export interface Farmer {
  id: string;
  name: string;
  village: string;
  contact: string;
  code?: string;
  ratePerLiter: number;
  isActive: boolean;
}

export type MilkShift = 'Morning' | 'Evening';

export interface CollectionEntry {
  id: string;
  farmerId: string;
  date: string; // ISO date string (yyyy-mm-dd)
  shift: MilkShift;
  quantityLiters: number;
  fatPercentage: number;
  snfPercentage: number;
  ratePerLiter: number;
  amount: number;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  farmerId: string;
  date: string;
  amount: number;
  method: 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque';
  reference?: string;
  notes?: string;
}

export interface ProcurementTarget {
  dailyLiters: number;
  butterFatGoal: number;
}
