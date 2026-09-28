import React, { useState } from 'react';
import { MenuItem, ToppingOption, Order, OrderStatus, StoreSettings } from '../types/store';
import { store } from '../lib/store';
import { getSupabaseUrlAndKey, saveSupabaseConfig } from '../lib/supabaseClient';
import {
  ChefHat,
  Receipt,
  Package,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  Settings,
  RefreshCw,
  Sliders,
  Database,
  Users,
  Key,
  Check,
  Link,
  ShieldAlert,
  Activity
} from 'lucide-react';

interface KitchenViewProps {
  menu: MenuItem[];
  toppings: ToppingOption[];
  orders: Order[];
  settings: StoreSettings;
  onOpenSqlModal: () => void;
}

export const KitchenView: React.FC<KitchenViewProps> = ({
  menu,
  toppings,
  orders,
  settings,
  onOpenSqlModal,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'pos' | 'settings'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'unread' | 'cooking' | 'completed'>('active');

  // POS Cashier State
  const [selectedPosOrderId, setSelectedPosOrderId] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState<number>(1000);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  // Settings State
  const [pinInput, setPinInput] = useState<string>(settings.pinCode);

  // Supabase Config
  const initialSupabaseConfig = getSupabaseUrlAndKey();
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(initialSupabaseConfig.url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(initialSupabaseConfig.key);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const activeOrders = orders.filter((o) => {
    if (orderFilter === 'active') return o.status !== 'completed';
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  const selectedPosOrder = orders.find((o) => o.id === selectedPosOrderId) || orders.find((o) => !o.is_paid) || null;

  const calculateChange = (total: number, cash: number) => {
    return Math.max(0, cash - total);
  };

  const handleUpdateStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = 'cooking';
    if (currentStatus === 'unread') nextStatus = 'cooking';
    else if (currentStatus === 'cooking') nextStatus = 'completed';

    store.updateOrderStatus(orderId, nextStatus);
  };

  const handleCompletePos = (order: Order) => {
    store.completePayment(order.id, cashReceived);
    setShowReceipt(true);
  };

  const handleSaveAndTestSupabase = async () => {
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setIsTesting(true);
    setTestResult(null);

    const res = await store.testSupabaseConnection();
    setIsTesting(false);
    setTestResult(res);

    store.updateSettings({});
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Diagnostics Alert Bar if Supabase Error occurs */}
      {store.lastSupabaseError && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 flex items-start justify-between gap-3 text-rose-900 text-xs shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-black">Supabase 接続警告</p>
              <p className="mt-0.5">{store.lastSupabaseError}</p>
            </div>
          </div>
          <button
            onClick={onOpenSqlModal}
            className="px-3 py-1.5 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-700 whitespace-nowrap shadow-xs"
          >
            解決用SQLを見る
          </button>
        </div>
      )}

      {/* Top Admin Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-black text-white font-black flex items-center justify-center shadow-md">
            <ChefHat className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                厨房・レジ管理コンソール (店員用)
              </h2>
              <button
                onClick={onOpenSqlModal}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                title="Supabase SQLとNext.jsコードガイド"
              >
                <Database className="w-3 h-3 text-emerald-600" />
                <span>SQLガイド</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">リアルタイム注文受信 / 在庫・トッピング管理 / POSレジ</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-2xl">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'orders'
                ? 'bg-black text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>注文一覧</span>
            {orders.filter((o) => o.status === 'unread' || o.status === 'cooking').length > 0 && (
              <span className="w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center">
                {orders.filter((o) => o.status === 'unread' || o.status === 'cooking').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'inventory'
                ? 'bg-black text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>在庫・トッピング</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'pos'
                ? 'bg-black text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>POSレジ会計</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'settings'
                ? 'bg-black text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>設定・DB接続</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'active', label: '進行中' },
                { id: 'unread', label: '未調理 (新着)' },
                { id: 'cooking', label: '調理中' },
                { id: 'completed', label: '提供済み / 完了' },
                { id: 'all', label: '全注文' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setOrderFilter(filter.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    orderFilter === filter.id
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-mono font-bold">
              表示件数: <span className="text-slate-900">{activeOrders.length}件</span>
            </div>
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl py-16 text-center text-slate-400 space-y-2 shadow-xs">
              <Clock className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">該当する注文はありません</p>
              <p className="text-xs text-slate-400">客用タブレットから新規注文が入るとここに表示されます</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-white border rounded-3xl p-5 space-y-4 relative shadow-sm transition-all ${
                    order.status === 'unread'
                      ? 'border-rose-400 ring-2 ring-rose-500/20 bg-rose-50/10'
                      : order.status === 'cooking'
                      ? 'border-blue-400 ring-2 ring-blue-500/20 bg-blue-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black font-mono text-slate-900">
                          {order.ticket_number}
                        </span>
                        <span className="px-2.5 py-1 bg-black text-white font-black text-xs rounded-lg">
                          {order.table_number}番卓
                        </span>
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-0.5">
                          <Users className="w-3 h-3 text-slate-400" />
                          {order.guest_count}名
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        受付日時: {new Date(order.created_at).toLocaleTimeString('ja-JP')}
                      </p>
                    </div>

                    <div>
                      {order.status === 'unread' && (
                        <span className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-full shadow-xs animate-pulse">
                          未調理
                        </span>
                      )}
                      {order.status === 'cooking' && (
                        <span className="px-3 py-1 bg-blue-600 text-white font-black text-xs rounded-full shadow-xs">
                          調理中
                        </span>
                      )}
                      {order.status === 'completed' && (
                        <span className="px-3 py-1 bg-slate-200 text-slate-600 font-bold text-xs rounded-full">
                          提供完了
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="space-y-0.5 text-xs">
                        <div className="flex justify-between items-baseline font-black text-slate-900">
                          <span>{item.menu_name} × {item.quantity}</span>
                          <span className="font-mono text-slate-700">¥{item.subtotal}</span>
                        </div>
                        {item.options && (
                          <div className="text-[11px] text-slate-500 pl-2 border-l-2 border-slate-300">
                            <span>生クリーム: {item.options.cream}</span> / <span>トッピング: {item.options.topping}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">TOTAL</span>
                      <span className="text-lg font-black font-mono text-slate-900">¥{order.total_price}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, order.status)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-xs ${
                            order.status === 'unread'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {order.status === 'unread' && <span>「調理中」にする</span>}
                          {order.status === 'cooking' && <span>「提供完了」にする</span>}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedPosOrderId(order.id);
                          setActiveTab('pos');
                        }}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all"
                      >
                        レジ会計
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-900" />
                <span>メイン商品・ドリンクの在庫切り替え</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                「売り切れ」に切り替えると、客用タブレットで即座に選択不可（売り切れ表示）になります。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <h4 className="text-base font-black text-slate-900">{item.name}</h4>
                        <span className="text-xs font-mono font-bold text-slate-600">¥{item.price}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => store.toggleMenuSoldOut(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                        item.is_sold_out
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      }`}
                    >
                      {item.is_sold_out ? '売り切れ中' : '販売中 (在庫あり)'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                    <span className="text-slate-600 font-bold">残数カウント:</span>
                    <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1 shadow-xs">
                      <button
                        onClick={() => store.updateMenuStock(item.id, -5)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-700 font-bold text-xs"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => store.updateMenuStock(item.id, -1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-mono font-black text-slate-900">{item.stock}</span>
                      <button
                        onClick={() => store.updateMenuStock(item.id, 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => store.updateMenuStock(item.id, 5)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-700 font-bold text-xs"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-slate-900" />
                <span>トッピング・オプションの在庫切り替え</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                生クリームやカラースプレーが切れた場合、トッピング単体で「売り切れ」に設定できます。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {toppings.map((top) => (
                <div
                  key={top.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-black text-slate-900">{top.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">対象: カヌレ・ワッフルセット</p>
                    </div>

                    <button
                      onClick={() => store.toggleToppingSoldOut(top.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                        top.is_sold_out
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      }`}
                    >
                      {top.is_sold_out ? '売り切れ中' : '提供可能'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                    <span className="text-slate-600 font-bold">残数カウント:</span>
                    <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1 shadow-xs">
                      <button
                        onClick={() => store.updateToppingStock(top.id, -1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-mono font-black text-slate-900">{top.stock}</span>
                      <button
                        onClick={() => store.updateToppingStock(top.id, 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: POS CASHIER */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center justify-between">
              <span>未会計の注文一覧</span>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                {orders.filter((o) => !o.is_paid).length}件
              </span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {orders.filter((o) => !o.is_paid).length === 0 ? (
                <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 text-xs font-bold">
                  未会計の注文はありません
                </div>
              ) : (
                orders
                  .filter((o) => !o.is_paid)
                  .map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedPosOrderId(order.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedPosOrder?.id === order.id
                          ? 'bg-black text-white border-black shadow-lg scale-[1.01]'
                          : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-lg">{order.ticket_number}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-black ${
                            selectedPosOrder?.id === order.id ? 'bg-white text-black' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {order.table_number}番卓
                          </span>
                        </div>
                        <span className="font-mono font-black text-base">¥{order.total_price}</span>
                      </div>
                      <p className={`text-[11px] ${
                        selectedPosOrder?.id === order.id ? 'text-zinc-300' : 'text-slate-500'
                      }`}>
                        {order.items.map((i) => i.menu_name).join(', ')}
                      </p>
                    </button>
                  ))
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedPosOrder ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase font-bold">POS CHECKOUT</span>
                    <h3 className="text-xl font-black text-slate-900">
                      {selectedPosOrder.ticket_number} ({selectedPosOrder.table_number}番卓) のお会計
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-black text-xs">
                    未お支払い
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  {selectedPosOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900">{item.menu_name} × {item.quantity}</span>
                        {item.options && (
                          <span className="text-[10px] text-slate-500 block">
                            生クリーム:{item.options.cream} / トッピング:{item.options.topping}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900">¥{item.subtotal}</span>
                    </div>
                  ))}
                  
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-700">お請求合計 (税込)</span>
                    <span className="text-3xl font-black font-mono text-slate-900">¥{selectedPosOrder.total_price}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    お預かり金額 (受け取り金額)
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-mono text-slate-400 font-black">¥</span>
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-2xl font-mono font-black text-slate-900 focus:ring-2 focus:ring-black outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[selectedPosOrder.total_price, 500, 1000, 5000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCashReceived(amt)}
                        className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-mono font-bold transition-all border border-slate-200"
                      >
                        ¥{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-500 uppercase font-bold">CHANGE AMOUNT</span>
                    <h4 className="text-sm font-bold text-slate-800">お釣り計算表示</h4>
                  </div>
                  <span className={`text-3xl font-black font-mono ${
                    cashReceived >= selectedPosOrder.total_price ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    ¥{calculateChange(selectedPosOrder.total_price, cashReceived)}
                  </span>
                </div>

                <button
                  onClick={() => handleCompletePos(selectedPosOrder)}
                  disabled={cashReceived < selectedPosOrder.total_price}
                  className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                    cashReceived >= selectedPosOrder.total_price
                      ? 'bg-black text-white hover:bg-slate-800 active:scale-98'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>会計を完了する (提供完了処理)</span>
                </button>

              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl py-20 text-center text-slate-400 text-xs font-bold">
                左の一覧からお会計する注文を選択してください
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: SETTINGS & SUPABASE CONFIG WITH DIAGNOSTICS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white border border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Supabase データベース接続設定＆テスト</h3>
                  <p className="text-xs text-slate-500">ステップ2で取得したURLとAnon Keyを貼り付けて接続テストできます</p>
                </div>
              </div>
              <button
                onClick={onOpenSqlModal}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline font-bold"
              >
                SQLを見る
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Supabase Anon API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleSaveAndTestSupabase}
                  disabled={isTesting}
                  className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>{isTesting ? '接続テスト中...' : '設定を保存して接続テストを実行'}</span>
                </button>
              </div>

              {/* Test Result Display */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs font-bold space-y-1 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  <p className="font-black text-sm">
                    {testResult.success ? '🟢 接続成功！' : '🔴 接続エラー発生'}
                  </p>
                  <p className="text-xs leading-relaxed">{testResult.message}</p>

                  {!testResult.success && testResult.message?.includes('RLS') && (
                    <div className="mt-2 pt-2 border-t border-rose-200">
                      <p className="font-black">💡 解決方法:</p>
                      <p className="font-normal mt-0.5">
                        Supabase SQL Editorで付属のSQLを全選択して「Run」を実行してください（RLS無効化処理が含まれています）。
                      </p>
                      <button
                        onClick={onOpenSqlModal}
                        className="mt-2 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold"
                      >
                        SQLを表示してコピーする
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-4">
              <Settings className="w-5 h-5 text-slate-900" />
              <span>グランメゾン津南 システム設定</span>
            </h3>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                店員用画面・卓変更アクセス用 暗証番号 (PIN)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 font-mono font-black rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none w-32 text-center tracking-widest"
                />
                <button
                  onClick={() => store.updateSettings({ pinCode: pinInput })}
                  className="px-4 py-2.5 bg-black text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition-all"
                >
                  保存する
                </button>
              </div>
              <p className="text-[11px] text-slate-400">※初期暗証番号: 1234</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div>
                <span className="text-sm font-bold text-slate-900 block">注文受信チャイム音</span>
                <span className="text-xs text-slate-500">新規注文を受信した時に音を鳴らす</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableSound}
                onChange={(e) => store.updateSettings({ enableSound: e.target.checked })}
                className="w-5 h-5 accent-black cursor-pointer"
              />
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-2">
              <span className="text-xs font-bold text-rose-600 block">データの初期化</span>
              <p className="text-xs text-slate-500">
                注文履歴や在庫数を初期状態にリセットします。
              </p>
              <button
                onClick={() => {
                  if (confirm('すべての注文データを初期状態にリセットしますか？')) {
                    store.resetAllData();
                    alert('データを初期化しました');
                  }
                }}
                className="px-4 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>データ初期化を実行</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* POS Receipt Modal Simulation */}
      {showReceipt && selectedPosOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl font-mono">
            <div className="text-center space-y-1">
              <h3 className="font-black text-xl tracking-tight">グランメゾン津南</h3>
              <p className="text-xs text-slate-500">文化祭 レジお買上領収書</p>
              <p className="text-[10px] text-slate-400 mt-2">
                {new Date().toLocaleString('ja-JP')}
              </p>
            </div>

            <div className="border-t border-b border-slate-200 py-3 space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>整理券番号: {selectedPosOrder.ticket_number}</span>
                <span>{selectedPosOrder.table_number}番卓</span>
              </div>
              {selectedPosOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.menu_name} × {item.quantity}</span>
                  <span>¥{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs font-bold">
              <div className="flex justify-between text-sm text-slate-900">
                <span>合計金額:</span>
                <span>¥{selectedPosOrder.total_price}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>お預かり:</span>
                <span>¥{selectedPosOrder.cash_received}</span>
              </div>
              <div className="flex justify-between text-emerald-800 text-sm pt-1 border-t border-slate-200">
                <span>お釣り:</span>
                <span>¥{selectedPosOrder.change_amount}</span>
              </div>
            </div>

            <button
              onClick={() => setShowReceipt(false)}
              className="w-full py-3 bg-black text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
