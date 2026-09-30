import { MenuItem, ToppingOption, Order, StoreSettings, OrderStatus, OrderDetailItem } from '../types/store';
import { soundEffects } from './audio';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'カヌレ・ワッフルセット',
    price: 400,
    is_sold_out: false,
    stock: 50,
    category: 'main',
    description: '外はカリッと中はもちもちのカヌレと、焼きたてサクサクのワッフルセット。',
    image_url: '/src/assets/images/canele_waffle_set_1790578009338.jpg',
    options_enabled: true,
  },
  {
    id: 'm2',
    name: '紅茶',
    price: 100,
    is_sold_out: false,
    stock: 100,
    category: 'drink',
    description: '香り豊かな味わい深いオリジナルホット紅茶。',
    image_url: '/src/assets/images/black_tea_cup_1790578023786.jpg',
    options_enabled: false,
  },
];

export const INITIAL_TOPPINGS: ToppingOption[] = [
  {
    id: 't1',
    menu_id: 'm1',
    name: '生クリーム',
    price: 0,
    is_sold_out: false,
    stock: 80,
    category: 'cream',
  },
  {
    id: 't2',
    menu_id: 'm1',
    name: 'カラースプレー',
    price: 0,
    is_sold_out: false,
    stock: 80,
    category: 'topping',
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'グランメゾン津南',
  pinCode: '1234',
  enableSound: true,
};

export class StoreManager {
  private menu: MenuItem[] = INITIAL_MENU;
  private toppings: ToppingOption[] = INITIAL_TOPPINGS;
  private orders: Order[] = [];
  private settings: StoreSettings = INITIAL_SETTINGS;
  private listeners: Set<() => void> = new Set();
  private sseSource: EventSource | null = null;

  constructor() {
    this.initServerConnection();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  getMenu(): MenuItem[] {
    return this.menu;
  }

  getToppings(): ToppingOption[] {
    return this.toppings;
  }

  getOrders(): Order[] {
    return this.orders;
  }

  getSettings(): StoreSettings {
    return this.settings;
  }

  // --- CONNECT TO REAL-TIME SERVER STREAM (SSE) ---
  private initServerConnection() {
    if (typeof window === 'undefined') return;

    fetch('/api/state')
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) this.orders = data.orders;
        if (data.menu) this.menu = data.menu;
        if (data.toppings) this.toppings = data.toppings;
        this.notify();
      })
      .catch(() => {});

    try {
      this.sseSource = new EventSource('/api/stream');

      this.sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'INIT') {
            if (data.orders) this.orders = data.orders;
            if (data.menu) this.menu = data.menu;
            if (data.toppings) this.toppings = data.toppings;
          } else if (data.type === 'NEW_ORDER') {
            if (data.orders) this.orders = data.orders;
            if (data.menu) this.menu = data.menu;
            if (this.settings.enableSound) {
              soundEffects.playNewOrderSound();
            }
          } else if (data.type === 'UPDATE_ORDER') {
            if (data.orders) this.orders = data.orders;
          } else if (data.type === 'UPDATE_INVENTORY') {
            if (data.menu) this.menu = data.menu;
            if (data.toppings) this.toppings = data.toppings;
          }

          this.notify();
        } catch {
          // Silent
        }
      };
    } catch {
      // Fallback
    }
  }

  // Edit Menu Name, Description, Price Live
  async editMenuItem(id: string, name: string, description: string, price: number) {
    try {
      await fetch('/api/menu/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, description, price }),
      });
    } catch {
      this.menu = this.menu.map((m) =>
        m.id === id ? { ...m, name, description, price } : m
      );
      this.notify();
    }
  }

  // Toggle Sold Out
  async toggleMenuSoldOut(id: string) {
    try {
      await fetch('/api/inventory/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'menu', id }),
      });
    } catch {
      this.menu = this.menu.map((item) =>
        item.id === id ? { ...item, is_sold_out: !item.is_sold_out } : item
      );
      this.notify();
    }
  }

  // Update Stock
  async updateMenuStock(id: string, delta: number) {
    try {
      await fetch('/api/inventory/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'menu', id, delta }),
      });
    } catch {
      this.menu = this.menu.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta);
          return { ...item, stock: newStock, is_sold_out: newStock === 0 ? true : item.is_sold_out };
        }
        return item;
      });
      this.notify();
    }
  }

  async toggleToppingSoldOut(id: string) {
    try {
      await fetch('/api/inventory/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'topping', id }),
      });
    } catch {
      this.toppings = this.toppings.map((t) =>
        t.id === id ? { ...t, is_sold_out: !t.is_sold_out } : t
      );
      this.notify();
    }
  }

  async updateToppingStock(id: string, delta: number) {
    try {
      await fetch('/api/inventory/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'topping', id, delta }),
      });
    } catch {
      this.toppings = this.toppings.map((t) => {
        if (t.id === id) {
          const newStock = Math.max(0, t.stock + delta);
          return { ...t, stock: newStock, is_sold_out: newStock === 0 ? true : t.is_sold_out };
        }
        return t;
      });
      this.notify();
    }
  }

  // Submit Order via REST -> Server broadcasts atomic unique ticket
  async createOrder(
    tableNumber: number,
    guestCount: number,
    items: {
      menuItem: MenuItem;
      quantity: number;
      options?: { cream: 'あり' | 'なし'; topping: 'あり' | 'なし' };
      subtotal: number;
    }[]
  ): Promise<Order> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: tableNumber,
          guest_count: guestCount,
          items,
        }),
      });

      const data = await res.json();
      if (data.order) {
        return data.order;
      }
    } catch (e) {
      console.error('Failed to create order on server:', e);
    }

    const fallbackTicket = `#${Math.floor(100 + Math.random() * 900)}`;
    const total_price = items.reduce((acc, curr) => acc + curr.subtotal, 0);

    const fallbackOrder: Order = {
      id: `ord_${Date.now()}`,
      ticket_number: fallbackTicket,
      table_number: tableNumber,
      guest_count: guestCount,
      status: 'unread',
      total_price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((i, idx) => ({
        id: `det_${Date.now()}_${idx}`,
        menu_id: i.menuItem.id,
        menu_name: i.menuItem.name,
        price: i.menuItem.price,
        quantity: i.quantity,
        options: i.options,
        subtotal: i.subtotal,
      })),
      is_paid: false,
    };

    this.orders.unshift(fallbackOrder);
    this.notify();
    return fallbackOrder;
  }

  // Update Status
  async updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      this.orders = this.orders.map((o) =>
        o.id === orderId ? { ...o, status: nextStatus } : o
      );
      this.notify();
    }
  }

  // Complete Payment
  async completePayment(orderId: string, cashReceived: number) {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paid: true, status: 'completed', cash_received: cashReceived }),
      });
    } catch {
      this.orders = this.orders.map((o) =>
        o.id === orderId
          ? { ...o, is_paid: true, status: 'completed', cash_received: cashReceived }
          : o
      );
      this.notify();
    }
  }

  updateSettings(newSettings: Partial<StoreSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.notify();
  }

  async resetAllData() {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch {
      this.orders = [];
      this.notify();
    }
  }
}

export const store = new StoreManager();
