export interface PurchaseReturnItem {
  id?: number;
  product_id: number;
  unit_price: number;
  quantity: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

export interface PurchaseReturn {
  id: number;
  return_no: string;
  purchase_id?: number;
  supplier_id: number;
  warehouse_id: number;
  return_date: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  reason?: string;
  note?: string;
  supplier?: {
    id: number;
    name: string;
  };
  warehouse?: {
    id: number;
    name: string;
  };
  items?: PurchaseReturnItem[];
  created_at: string;
}

export interface CreatePurchaseReturnPayload {
  supplier_id: number;
  warehouse_id: number;
  purchase_id?: number;
  return_date: string;
  tax_amount: number;
  discount_amount: number;
  reason?: string;
  note?: string;
  items: {
    product_id: number;
    unit_price: number;
    quantity: number;
  }[];
}