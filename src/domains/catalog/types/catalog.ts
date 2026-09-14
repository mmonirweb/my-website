export interface TaxRate {
  id: number;
  name: string;
  rate: number;
  code?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Unit {
  id: number;
  name: string;
  short_name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type TaxRateInput = Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>;
export type UnitInput = Omit<Unit, 'id' | 'created_at' | 'updated_at'>;