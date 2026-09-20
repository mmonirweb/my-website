export type ReturnActionType = 'REFUND' | 'DUE_ADJUSTMENT' | 'EXCHANGE';

export interface ReturnItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ExchangeItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface CreateSalesReturnPayload {
  sale_id?: number | null;
  customer_id: number;
  warehouse_id: number;
  return_date: string;
  action_type: ReturnActionType;
  payment_method: string;
  reason?: string;
  items: ReturnItem[];
  exchange_items?: ExchangeItem[];
  exchange_paid_amount?: number;
}

export interface SalesReturnRecord {
  id: number;
  return_no: string;
  customer: {
    id: number;
    name: string;
    phone: string;
  };
  creator: {
    id: number;
    name: string;
  };
  total_return_amount: string;
  action_type: ReturnActionType;
  return_date: string;
  created_at: string;
}