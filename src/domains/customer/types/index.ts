export type CustomerType = 'INDIVIDUAL' | 'CORPORATE';
export type CustomerGroup = 'RETAIL' | 'WHOLESALE' | 'VIP';
export type CustomerSource = 'ECOMMERCE' | 'POS' | 'ERP';
export type AddressType = 'SHIPPING' | 'BILLING' | 'BOTH';

export interface CustomerAddress {
  id?: number;
  type: AddressType;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  email?: string;
  phone: string;
  tax_number?: string;
  type: CustomerType;
  customer_group: CustomerGroup;
  source: CustomerSource;
  credit_limit: number;
  opening_balance: number;
  current_balance: number;
  is_active: boolean;
  addresses?: CustomerAddress[];
  created_at: string;
}

export interface CustomerPayload {
  name: string;
  phone: string;
  email?: string;
  tax_number?: string;
  type: CustomerType;
  customer_group: CustomerGroup;
  source: CustomerSource;
  credit_limit: number;
  opening_balance?: number;
  is_active: boolean;
  addresses?: CustomerAddress[];
}

export interface CustomerLedgerItem {
  id: number;
  transaction_no: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  running_balance: number;
  description: string;
  created_at: string;
}