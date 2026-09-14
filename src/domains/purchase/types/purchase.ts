export interface User {
  id: number;
  name: string;
  email?: string;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  current_balance: number;
}

export interface Warehouse {
  id: number;
  name: string;
  code?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  cost_price?: number;
  purchase_price?: number;
  unit?: string;
  stock_quantity?: number;
}

export interface PurchaseItem {
  id?: number;
  purchase_id?: number;
  product_id: number;
  product?: Product;
  ordered_quantity: number;
  received_quantity?: number;
  unit_price: number;
  discount_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  landed_cost_share?: number;
  sub_total?: number;
  batch_number?: string;
  expiry_date?: string;
}

export interface GoodsReceivedNoteItem {
  purchase_item_id: number;
  product_id: number;
  received_quantity: number;
  rejected_quantity?: number;
  batch_number?: string;
  expiry_date?: string;
}

export interface GoodsReceivedNotePayload {
  purchase_id: number;
  warehouse_id: number;
  supplier_challan_no?: string;
  received_date: string;
  remarks?: string;
  items: GoodsReceivedNoteItem[];
}

export interface Purchase {
  id: number;
  purchase_no: string;
  reference_no?: string;
  supplier_id: number;
  supplier?: Supplier;
  warehouse_id: number;
  warehouse?: Warehouse;
  created_by?: number;
  creator?: User;
  created_by_user?: User;
  received_by?: number;
  received_by_user?: User;
  purchase_date: string;
  expected_delivery_date?: string;
  payment_due_date?: string;
  currency_code: string;
  exchange_rate: number;
  sub_total: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  other_charges: number;
  grand_total: number;
  paid_amount: number;
  due_amount: number;
  status: 'draft' | 'pending_approval' | 'ordered' | 'partial_received' | 'received' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid' | 'advance';
  items: PurchaseItem[];
  created_at?: string;
}

/* Service Layer Response & Payload Types */
export interface CreatePurchasePayload {
  supplier_id: number;
  warehouse_id: number;
  purchase_date: string;
  expected_delivery_date?: string;
  payment_due_date?: string;
  currency_code?: string;
  exchange_rate?: number;
  discount_amount?: number;
  tax_amount?: number;
  shipping_cost?: number;
  other_charges?: number;
  attachment?: File | null;
  items: PurchaseItem[];
  [key: string]: any;
}

export interface PurchaseQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  supplier_id?: number;
  warehouse_id?: number;
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
}

export interface PurchaseListResponse {
  success: boolean;
  message: string;
  data: Purchase[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SinglePurchaseResponse {
  success: boolean;
  message: string;
  data: Purchase;
}