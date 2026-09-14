export interface Warehouse {
  id: number;
  branch_id?: number | null;
  name: string;
  code: string;
  type: 'central' | 'fulfillment' | 'cold_storage' | 'transit_hub' | 'retail_backroom';
  manager_name?: string | null;
  phone?: string | null;
  email?: string | null;
  emergency_phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  total_capacity_sqft?: number | null;
  max_weight_capacity_tons?: number | null;
  operating_hours?: string | null;
  is_active: boolean;
  is_default: boolean;
  allow_negative_inventory: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: number;
  warehouse_id: number;
  product_id: number;
  quantity: number;
  reserved_quantity: number;
  alert_quantity: number;
  warehouse?: Warehouse;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

export interface StockHistoryItem {
  id: number;
  warehouse_id: number;
  product_id: number;
  type:
    | 'opening_stock'
    | 'purchase'
    | 'sale'
    | 'transfer_in'
    | 'transfer_out'
    | 'adjustment_add'
    | 'adjustment_sub'
    | 'return';
  quantity: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: number;
  created_by: number;
  created_at: string;
  warehouse?: Warehouse;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  creator?: {
    id: number;
    name: string;
  };
}

export interface StockAdjustmentPayload {
  warehouse_id: number;
  adjustment_type: 'addition' | 'subtraction';
  reason: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export interface StockTransferPayload {
  from_warehouse_id: number;
  to_warehouse_id: number;
  note?: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
}

export interface WarehousePayload {
  name: string;
  code: string;
  type: 'central' | 'fulfillment' | 'cold_storage' | 'transit_hub' | 'retail_backroom';
  branch_id?: number | null;
  manager_name?: string | null;
  phone?: string | null;
  email?: string | null;
  emergency_phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  total_capacity_sqft?: number | null;
  max_weight_capacity_tons?: number | null;
  operating_hours?: string | null;
  is_active?: boolean;
  is_default?: boolean;
  allow_negative_inventory?: boolean;
}