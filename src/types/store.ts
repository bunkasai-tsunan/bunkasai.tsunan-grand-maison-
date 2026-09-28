export type OrderStatus = 'unread' | 'cooking' | 'completed' | 'cancelled';

export type RoleMode = 'customer' | 'kitchen';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  is_sold_out: boolean;
  stock: number;
  category: 'main' | 'drink';
  description: string;
  image_url: string;
  options_enabled?: boolean;
}

export interface ToppingOption {
  id: string;
  menu_id: string;
  name: string;
  price: number;
  is_sold_out: boolean;
  stock: number;
  category: 'cream' | 'topping';
}

export interface OrderItemOptionSelection {
  cream: 'あり' | 'なし';
  topping: 'あり' | 'なし';
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  options?: OrderItemOptionSelection;
  subtotal: number;
}

export interface OrderDetailItem {
  id: string;
  menu_id: string;
  menu_name: string;
  price: number;
  quantity: number;
  options?: {
    cream?: string;
    topping?: string;
  };
  subtotal: number;
}

export interface Order {
  id: string;
  ticket_number: string; // e.g. #001
  table_number: number;  // 1 to 10
  guest_count: number;   // 1 to 8
  status: OrderStatus;
  total_price: number;
  created_at: string;
  updated_at: string;
  items: OrderDetailItem[];
  is_paid: boolean;
  cash_received?: number;
  change_amount?: number;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  pinCode: string;
  enableSound: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
