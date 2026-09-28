import { MenuItem, ToppingOption, Order, StoreSettings, OrderStatus, OrderDetailItem } from '../types/store';
import { soundEffects } from './audio';
import { getSupabaseClient } from './supabaseClient';

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

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_101',
    ticket_number: '#001',
    table_number: 3,
    guest_count: 2,
    status: 'completed',
    total_price: 900,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    is_paid: true,
    cash_received: 1000,
    change_amount: 100,
    items: [
      {
        id: 'detail_1',
        menu_id: 'm1',
        menu_name: 'カヌレ・ワッフルセット',
        price: 400,
        quantity: 2,
        options: { cream: 'あり', topping: 'あり' },
        subtotal: 800,
      },
      {
        id: 'detail_2',
        menu_id: 'm2',
        menu_name: '紅茶',
        price: 100,
        quantity: 1,
        subtotal: 100,
      },
    ],
  },
  {
    id: 'ord_102',
    ticket_number: '#002',
    table_number: 5,
    guest_count: 6,
    status: 'cooking',
    total_price: 1000,
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    is_paid: false,
    items: [
      {
        id: 'detail_3',
        menu_id: 'm1',
        menu_name: 'カヌレ・ワッフルセット',
        price: 400,
        quantity: 2,
        options: { cream: 'あり', topping: 'なし' },
        subtotal: 800,
      },
      {
        id: 'detail_4',
        menu_id: 'm2',
        menu_name: '紅茶',
        price: 100,
        quantity: 2,
        subtotal: 200,
      },
    ],
  },
];

const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('gm_tsunan_sync_channel')
  : null;

export class LocalStoreManager {
  private menu: MenuItem[];
  private toppings: ToppingOption[];
  private orders: Order[];
  private settings: StoreSettings;
  private listeners: Set<() => void> = new Set();
  private ticketCounter: number;
  private isSupabaseSubscribed: boolean = false;
  public lastSupabaseError: string | null = null;

  constructor() {
    this.menu = this.load('gm_menu', INITIAL_MENU);
    this.toppings = this.load('gm_toppings', INITIAL_TOPPINGS);
    this.orders = this.load('gm_orders', INITIAL_ORDERS);
    this.settings = this.load('gm_settings', INITIAL_SETTINGS);
    this.ticketCounter = this.load('gm_ticket_counter', 4);

    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC') {
          this.menu = this.load('gm_menu', INITIAL_MENU);
          this.toppings = this.load('gm_toppings', INITIAL_TOPPINGS);
          this.orders = this.load('gm_orders', INITIAL_ORDERS);
          this.settings = this.load('gm_settings', INITIAL_SETTINGS);
          this.notify();
        }
      };
    }

    this.initSupabaseSync();
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private save(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (syncChannel) {
        syncChannel.postMessage({ type: 'SYNC' });
      }
    } catch {
      // Ignore
    }
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

  toggleMenuSoldOut(id: string) {
    this.menu = this.menu.map((item) =>
      item.id === id ? { ...item, is_sold_out: !item.is_sold_out } : item
    );
    this.save('gm_menu', this.menu);
    this.notify();
  }

  updateMenuStock(id: string, delta: number) {
    this.menu = this.menu.map((item) => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + delta);
        return {
          ...item,
          stock: newStock,
          is_sold_out: newStock === 0 ? true : item.is_sold_out,
        };
      }
      return item;
    });
    this.save('gm_menu', this.menu);
    this.notify();
  }

  toggleToppingSoldOut(id: string) {
    this.toppings = this.toppings.map((t) =>
      t.id === id ? { ...t, is_sold_out: !t.is_sold_out } : t
    );
    this.save('gm_toppings', this.toppings);
    this.notify();
  }

  updateToppingStock(id: string, delta: number) {
    this.toppings = this.toppings.map((t) => {
      if (t.id === id) {
        const newStock = Math.max(0, t.stock + delta);
        return {
          ...t,
          stock: newStock,
          is_sold_out: newStock === 0 ? true : t.is_sold_out,
        };
      }
      return t;
    });
    this.save('gm_toppings', this.toppings);
    this.notify();
  }

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
    const formattedTicket = `#${String(this.ticketCounter).padStart(3, '0')}`;
    this.ticketCounter += 1;
    this.save('gm_ticket_counter', this.ticketCounter);

    const total_price = items.reduce((acc, curr) => acc + curr.subtotal, 0);

    const detailItems: OrderDetailItem[] = items.map((i, idx) => ({
      id: `det_${Date.now()}_${idx}`,
      menu_id: i.menuItem.id,
      menu_name: i.menuItem.name,
      price: i.menuItem.price,
      quantity: i.quantity,
      options: i.options,
      subtotal: i.subtotal,
    }));

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      ticket_number: formattedTicket,
      table_number: tableNumber,
      guest_count: guestCount,
      status: 'unread',
      total_price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: detailItems,
      is_paid: false,
    };

    this.orders = [newOrder, ...this.orders];
    this.save('gm_orders', this.orders);

    items.forEach((item) => {
      this.updateMenuStock(item.menuItem.id, -item.quantity);
    });

    if (this.settings.enableSound) {
      soundEffects.playNewOrderSound();
    }

    // Insert into Supabase if connected
    await this.syncOrderToSupabase(newOrder);

    this.notify();
    return newOrder;
  }

  async updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
    this.orders = this.orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: nextStatus,
          updated_at: new Date().toISOString(),
        };
      }
      return o;
    });

    this.save('gm_orders', this.orders);
    await this.updateOrderStatusInSupabase(orderId, nextStatus);
    this.notify();
  }

  async completePayment(orderId: string, cashReceived: number) {
    this.orders = this.orders.map((o) => {
      if (o.id === orderId) {
        const change = Math.max(0, cashReceived - o.total_price);
        return {
          ...o,
          is_paid: true,
          status: 'completed',
          cash_received: cashReceived,
          change_amount: change,
          updated_at: new Date().toISOString(),
        };
      }
      return o;
    });

    this.save('gm_orders', this.orders);
    await this.updateOrderStatusInSupabase(orderId, 'completed', true, cashReceived);
    this.notify();
  }

  updateSettings(newSettings: Partial<StoreSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.save('gm_settings', this.settings);
    this.isSupabaseSubscribed = false;
    this.initSupabaseSync();
    this.notify();
  }

  resetAllData() {
    this.menu = INITIAL_MENU;
    this.toppings = INITIAL_TOPPINGS;
    this.orders = INITIAL_ORDERS;
    this.settings = INITIAL_SETTINGS;
    this.ticketCounter = 4;

    this.save('gm_menu', this.menu);
    this.save('gm_toppings', this.toppings);
    this.save('gm_orders', this.orders);
    this.save('gm_settings', this.settings);
    this.save('gm_ticket_counter', this.ticketCounter);
    this.notify();
  }

  // --- SUPABASE REALTIME SYNC ENGINE ---
  public async initSupabaseSync() {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      this.lastSupabaseError = null;

      // Initial fetch from Supabase
      const { data: dbOrders, error: fetchError } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        this.lastSupabaseError = `Supabase 取得エラー: ${fetchError.message} (${fetchError.code})`;
        console.error(this.lastSupabaseError);
        this.notify();
        return;
      }

      if (dbOrders && dbOrders.length > 0) {
        const formattedOrders: Order[] = dbOrders.map((o) => {
          let parsedItems: OrderDetailItem[] = [];
          if (o.items_json && Array.isArray(o.items_json)) {
            parsedItems = o.items_json;
          } else {
            parsedItems = [
              {
                id: `det_${o.id}`,
                menu_id: 'm1',
                menu_name: 'カヌレ・ワッフルセット',
                price: o.total_price || 400,
                quantity: 1,
                subtotal: o.total_price || 400,
              },
            ];
          }

          return {
            id: o.id,
            ticket_number: o.ticket_number,
            table_number: o.table_number,
            guest_count: o.guest_count || 1,
            status: o.status,
            total_price: o.total_price,
            is_paid: o.is_paid || false,
            created_at: o.created_at,
            updated_at: o.updated_at || o.created_at,
            items: parsedItems,
          };
        });

        this.orders = formattedOrders;
        this.save('gm_orders', this.orders);
        this.notify();
      }

      if (!this.isSupabaseSubscribed) {
        client
          .channel('public:orders')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newRecord = payload.new;
                if (!this.orders.some((o) => o.id === newRecord.id)) {
                  let parsedItems: OrderDetailItem[] = [];
                  if (newRecord.items_json && Array.isArray(newRecord.items_json)) {
                    parsedItems = newRecord.items_json;
                  } else {
                    parsedItems = [
                      {
                        id: `det_${newRecord.id}`,
                        menu_id: 'm1',
                        menu_name: 'カヌレ・ワッフルセット',
                        price: newRecord.total_price || 400,
                        quantity: 1,
                        subtotal: newRecord.total_price || 400,
                      },
                    ];
                  }

                  const newOrder: Order = {
                    id: newRecord.id,
                    ticket_number: newRecord.ticket_number,
                    table_number: newRecord.table_number,
                    guest_count: newRecord.guest_count || 1,
                    status: newRecord.status,
                    total_price: newRecord.total_price,
                    is_paid: newRecord.is_paid || false,
                    created_at: newRecord.created_at,
                    updated_at: newRecord.updated_at || newRecord.created_at,
                    items: parsedItems,
                  };

                  this.orders = [newOrder, ...this.orders];
                  this.save('gm_orders', this.orders);

                  if (this.settings.enableSound) {
                    soundEffects.playNewOrderSound();
                  }

                  this.notify();
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedRecord = payload.new;
                this.orders = this.orders.map((o) =>
                  o.id === updatedRecord.id
                    ? {
                        ...o,
                        status: updatedRecord.status,
                        is_paid: updatedRecord.is_paid,
                      }
                    : o
                );
                this.save('gm_orders', this.orders);
                this.notify();
              }
            }
          )
          .subscribe();

        this.isSupabaseSubscribed = true;
      }
    } catch (e: any) {
      this.lastSupabaseError = `接続例外: ${e.message || e}`;
      console.error('Supabase Realtime Sync Error:', e);
      this.notify();
    }
  }

  private async syncOrderToSupabase(order: Order) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const { error } = await client.from('orders').insert({
          id: order.id,
          ticket_number: order.ticket_number,
          table_number: order.table_number,
          guest_count: order.guest_count,
          status: order.status,
          total_price: order.total_price,
          is_paid: order.is_paid,
          items_json: order.items,
          created_at: order.created_at,
        });

        if (error) {
          this.lastSupabaseError = `注文送信エラー: ${error.message} (コード:${error.code})`;
          console.error(this.lastSupabaseError);
          this.notify();
        } else {
          this.lastSupabaseError = null;
        }
      }
    } catch (e: any) {
      this.lastSupabaseError = `注文送信例外: ${e.message || e}`;
      console.error('Failed to sync order to Supabase:', e);
      this.notify();
    }
  }

  private async updateOrderStatusInSupabase(
    orderId: string,
    status: OrderStatus,
    isPaid?: boolean,
    cashReceived?: number
  ) {
    try {
      const client = getSupabaseClient();
      if (client) {
        const payload: Record<string, any> = { status };
        if (isPaid !== undefined) payload.is_paid = isPaid;
        if (cashReceived !== undefined) payload.cash_received = cashReceived;

        const { error } = await client.from('orders').update(payload).eq('id', orderId);
        if (error) {
          this.lastSupabaseError = `ステータス更新エラー: ${error.message}`;
          console.error(this.lastSupabaseError);
          this.notify();
        }
      }
    } catch (e: any) {
      this.lastSupabaseError = `ステータス更新例外: ${e.message || e}`;
      console.error('Failed to update order status in Supabase:', e);
      this.notify();
    }
  }

  public async testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        message: 'SupabaseのURLまたはKeyが設定されていません。',
      };
    }

    try {
      // Test read query
      const { data, error } = await client.from('orders').select('id').limit(1);

      if (error) {
        if (error.code === '42P01') {
          return {
            success: false,
            message: 'ordersテーブルが存在しません。付属のSQLをSupabase SQL Editorで実行してください。',
          };
        } else if (error.code === '42501' || error.message.includes('row-level security')) {
          return {
            success: false,
            message: 'RLS (アクセス権限) によりブロックされています。SQLの 「ALTER TABLE orders DISABLE ROW LEVEL SECURITY;」 を実行してください。',
          };
        }
        return {
          success: false,
          message: `エラー (${error.code}): ${error.message}`,
        };
      }

      return {
        success: true,
        message: `接続成功！データベース (ordersテーブル) に正常にアクセスできます。(データ件数: ${data?.length || 0}件)`,
      };
    } catch (e: any) {
      return {
        success: false,
        message: `通信エラー: ${e.message || e}`,
      };
    }
  }
}

export const store = new LocalStoreManager();
