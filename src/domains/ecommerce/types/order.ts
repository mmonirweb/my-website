export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    main_image?: string;
  };
}

export interface Order {
  id: number;
  company_id?: number;
  branch_id?: number;
  order_number: string;
  customer_name: string;
  phone: string;
  shipping_address: string;
  notes?: string;
  total_amount: number;
  shipping_fee: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  payment_status: 'unpaid' | 'paid';
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}