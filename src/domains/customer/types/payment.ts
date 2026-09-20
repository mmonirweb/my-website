export interface CustomerPaymentPayload {
  customer_id: number;
  payment_date: string;
  amount: number;
  payment_method: 'CASH' | 'CARD' | 'MOBILE_BANKING' | 'BANK_TRANSFER' | 'CHEQUE';
  reference_no?: string;
  notes?: string;
}