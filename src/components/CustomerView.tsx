import React, { useState } from 'react';
import { MenuItem, ToppingOption, Order, CartItem } from '../types/store';
import { store } from '../lib/store';
import confetti from 'canvas-confetti';
import {
  Users,
  Utensils,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Lock,
  ChevronLeft
} from 'lucide-react';

interface CustomerViewProps {
  tableNumber: number;
  onRequestChangeTable: () => void;
  menu: MenuItem[];
  toppings: ToppingOption[];
  orders: Order[];
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  tableNumber,
  onRequestChangeTable,
  menu,
  toppings,
  orders,
}) => {
  // Step Flow: 'welcome' -> 'party_size' -> 'menu' -> 'ticket_status'
  const [step, setStep] = useState<'welcome' | 'party_size' | 'menu' | 'ticket_status'>('welcome');
  const [guestCount, setGuestCount] = useState<number>(2);
  
  // Options state
  const [selectedCream, setSelectedCream] = useState<'あり' | 'なし'>('あり');
  const [selectedTopping, setSelectedTopping] = useState<'あり' | 'なし'>('あり');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Active Ticket
  const [activeTicket, setActiveTicket] = useState<Order | null>(null);

  const tableOrders = orders.filter((o) => o.table_number === tableNumber);
  const currentActiveOrder = activeTicket || tableOrders[0] || null;

  const handleAddCaneleSet = (item: MenuItem) => {
    if (item.is_sold_out || item.stock <= 0) return;

    const existingIndex = cart.findIndex(
      (c) =>
        c.menuItem.id === item.id &&
        c.options?.cream === selectedCream &&
        c.options?.topping === selectedTopping
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * item.price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: `cart_${Date.now()}_${Math.random()}`,
          menuItem: item,
          quantity: 1,
          options: {
            cream: selectedCream,
            topping: selectedTopping,
          },
          subtotal: item.price,
        },
      ]);
    }
  };

  const handleAddDrink = (item: MenuItem) => {
    if (item.is_sold_out || item.stock <= 0) return;

    const existingIndex = cart.findIndex((c) => c.menuItem.id === item.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * item.price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: `cart_${Date.now()}_${Math.random()}`,
          menuItem: item,
          quantity: 1,
          subtotal: item.price,
        },
      ]);
    }
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id === cartId) {
            const nextQty = c.quantity + delta;
            return nextQty > 0
              ? { ...c, quantity: nextQty, subtotal: nextQty * c.menuItem.price }
              : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCartPrice = cart.reduce((sum, c) => sum + c.subtotal, 0);

  // Submit Order - Real-time unique sequential ticket generation
  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;

    const formattedItems = cart.map((c) => ({
      menuItem: c.menuItem,
      quantity: c.quantity,
      options: c.options,
      subtotal: c.subtotal,
    }));

    const newOrder = await store.createOrder(tableNumber, guestCount, formattedItems);
    setActiveTicket(newOrder);
    setCart([]);
    setStep('ticket_status');

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white text-slate-900 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto flex flex-col justify-center">
      
      {/* Table Information Banner */}
      {step !== 'welcome' && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-3xl shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-serif font-black text-lg flex items-center justify-center shadow-md">
              {tableNumber}
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">YOUR TABLE</span>
              <h2 className="text-base font-black text-slate-900 font-serif">
                {tableNumber}番卓 ご注文端末
              </h2>
            </div>
          </div>

          <button
            onClick={onRequestChangeTable}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs active:scale-95"
            title="店員用パスワードが必要です"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>卓番号変更 (店員専用)</span>
          </button>
        </div>
      )}

      {/* STEP 1: WELCOME SPLASH SCREEN (ウェルカム画面) */}
      {step === 'welcome' && (
        <div className="py-12 sm:py-20 text-center space-y-10 animate-in fade-in zoom-in-95 duration-300 my-auto">
          
          <div className="space-y-3">
            <span className="text-xs font-mono tracking-widest uppercase text-slate-400 font-extrabold">
              WELCOME TO GRAN MAISON TSUNAN
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-serif text-slate-900 tracking-tight leading-tight">
              グランメゾン津南
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-serif max-w-md mx-auto">
              文化祭限定の特別なスイーツと最高品質の紅茶でおもてなしいたします
            </p>
          </div>

          {/* Centered Large Button with Deep Prominent Shadow as requested */}
          <div className="pt-4 max-w-xl mx-auto px-4">
            <button
              onClick={() => setStep('party_size')}
              className="w-full py-6 sm:py-8 px-6 bg-slate-900 text-white hover:bg-black font-serif font-black text-lg sm:text-2xl rounded-3xl transition-all duration-300 shadow-2xl shadow-slate-900/30 hover:shadow-3xl hover:shadow-slate-900/40 active:scale-98 border border-slate-800 flex items-center justify-center gap-3 tracking-wider group"
            >
              <span>いらっしゃいませ、ようこそグランメゾン津南へ</span>
              <ArrowRight className="w-6 h-6 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-mono tracking-wider pt-8">
            画面をタッチしてご注文手続きを開始してください
          </div>
        </div>
      )}

      {/* STEP 2: PARTY SIZE SELECTION (1人〜8人) */}
      {step === 'party_size' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-xl animate-in fade-in zoom-in-95 duration-200 space-y-8 my-auto">
          
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Users className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs font-mono tracking-widest uppercase text-slate-400 font-bold">GUEST COUNT</span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 mt-1">
              ご来店人数をお選びください
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              ご来店いただいた人数を1名〜8名の中からお選びください
            </p>
          </div>

          {/* 1名 〜 8名 Selection Buttons */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3">
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setGuestCount(num)}
                  className={`py-4 rounded-2xl font-black text-lg transition-all border ${
                    guestCount === num
                      ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-md font-serif'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}人
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={() => setStep('welcome')}
              className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all"
            >
              戻る
            </button>
            <button
              onClick={() => setStep('menu')}
              className="flex-1 py-4 bg-slate-900 text-white hover:bg-black font-bold text-base rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 active:scale-98"
            >
              <span>メニューを見る</span>
              <ArrowRight className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MENU SELECTION SCREEN (説明文削除済み) */}
      {step === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
          
          {/* Main Menu List */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                  グランメゾン津南 お品書き
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ご希望の商品をお選びいただき「カートに追加」を押してください
                </p>
              </div>

              <button
                onClick={() => setStep('party_size')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{guestCount}名様</span>
                <span className="text-[10px] text-slate-400 underline ml-1">人数変更</span>
              </button>
            </div>

            {/* Main Desserts */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono">
                  MAIN DESSERT (スイーツ)
                </h3>
              </div>

              {menu
                .filter((m) => m.category === 'main')
                .map((item) => {
                  const creamOption = toppings.find((t) => t.category === 'cream');
                  const toppingOption = toppings.find((t) => t.category === 'topping');

                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 transition-all shadow-md relative overflow-hidden space-y-6"
                    >
                      {item.is_sold_out && (
                        <div className="absolute top-4 right-4 bg-rose-600 text-white font-black text-xs px-3.5 py-1 rounded-full z-10 shadow-md">
                          売り切れ (SOLD OUT)
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        <div className="sm:col-span-5 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                              item.is_sold_out ? 'grayscale opacity-50' : ''
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-7 space-y-4">
                          <div>
                            {/* Product Name & Price ONLY (Item descriptions removed per request!) */}
                            <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
                              <h4 className="text-xl sm:text-2xl font-black font-serif text-slate-900">{item.name}</h4>
                              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">¥{item.price}</span>
                            </div>
                          </div>

                          {/* Options Customization */}
                          {!item.is_sold_out && (
                            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                              
                              {/* Cream Selection */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-bold text-slate-700">
                                    生クリーム
                                  </label>
                                  {creamOption?.is_sold_out && (
                                    <span className="text-[10px] text-rose-600 font-bold">
                                      ※売り切れ中
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => setSelectedCream('あり')}
                                    disabled={creamOption?.is_sold_out}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                      selectedCream === 'あり' && !creamOption?.is_sold_out
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                                    } ${creamOption?.is_sold_out ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  >
                                    あり (+0円)
                                  </button>
                                  <button
                                    onClick={() => setSelectedCream('なし')}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                      selectedCream === 'なし'
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                                    }`}
                                  >
                                    なし
                                  </button>
                                </div>
                              </div>

                              {/* Topping Selection */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-bold text-slate-700">
                                    トッピング (カラースプレー)
                                  </label>
                                  {toppingOption?.is_sold_out && (
                                    <span className="text-[10px] text-rose-600 font-bold">
                                      ※売り切れ中
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => setSelectedTopping('あり')}
                                    disabled={toppingOption?.is_sold_out}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                      selectedTopping === 'あり' && !toppingOption?.is_sold_out
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                                    } ${toppingOption?.is_sold_out ? 'opacity-40 cursor-not-allowed' : ''}`}
                                  >
                                    あり (+0円)
                                  </button>
                                  <button
                                    onClick={() => setSelectedTopping('なし')}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                      selectedTopping === 'なし'
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                                    }`}
                                  >
                                    なし
                                  </button>
                                </div>
                              </div>

                            </div>
                          )}

                          <button
                            onClick={() => handleAddCaneleSet(item)}
                            disabled={item.is_sold_out}
                            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                              item.is_sold_out
                                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                : 'bg-slate-900 text-white hover:bg-black active:scale-98 shadow-md'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            <span>カートに追加する (¥{item.price})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Beverage Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono">
                  BEVERAGE (ドリンク)
                </h3>
              </div>

              {menu
                .filter((m) => m.category === 'drink')
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 transition-all shadow-md relative overflow-hidden"
                  >
                    {item.is_sold_out && (
                      <div className="absolute top-4 right-4 bg-rose-600 text-white font-black text-xs px-3.5 py-1 rounded-full z-10 shadow-md">
                        売り切れ (SOLD OUT)
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                      <div className="sm:col-span-4 aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                            item.is_sold_out ? 'grayscale opacity-50' : ''
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-8 space-y-3">
                        <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2">
                          <h4 className="text-xl font-black font-serif text-slate-900">{item.name}</h4>
                          <span className="text-2xl font-black font-mono text-slate-900">¥{item.price}</span>
                        </div>

                        <button
                          onClick={() => handleAddDrink(item)}
                          disabled={item.is_sold_out}
                          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                            item.is_sold_out
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-slate-900 text-white hover:bg-black active:scale-98 shadow-md'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>紅茶を追加する (¥{item.price})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {tableOrders.length > 0 && (
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{tableNumber}番卓の発行済み整理券があります</p>
                    <p className="text-[11px] text-slate-500">整理券 {tableOrders[0].ticket_number} の状況を確認できます</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep('ticket_status')}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
                >
                  調理状況を見る
                </button>
              </div>
            )}

          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-slate-900" />
                  <h3 className="text-base font-black font-serif text-slate-900">ご注文カート</h3>
                </div>
                <span className="text-xs text-slate-600 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">
                  {tableNumber}番卓
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                  <p className="font-bold">カートに商品が入っていません</p>
                  <p className="text-[11px] text-slate-400">商品を選択してカートに追加してください</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h5 className="text-xs font-black text-slate-900">{item.menuItem.name}</h5>
                          {item.options && (
                            <div className="text-[10px] text-slate-500 mt-0.5 space-x-2">
                              <span>生クリーム: {item.options.cream}</span>
                              <span>·</span>
                              <span>トッピング: {item.options.topping}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-black font-mono text-slate-900">¥{item.subtotal}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-500">数量</span>
                        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1 shadow-xs">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black px-2 font-mono">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Total & Submit */}
              <div className="border-t border-slate-200 pt-4 space-y-4">
                <div className="flex items-center justify-between text-slate-600 text-xs">
                  <span>ご来店人数</span>
                  <span className="font-bold text-slate-900">{guestCount}名様</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">合計金額 (税込)</span>
                  <span className="text-2xl font-black font-mono text-slate-900">¥{totalCartPrice}</span>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0}
                  className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    cart.length === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-slate-900 text-white hover:bg-black active:scale-98'
                  }`}
                >
                  <span>注文確定・整理券を発行</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium">
                  ※整理券番号は全体で重複なくリアルタイム連番で発行されます
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* STEP 4: UNIQUE TICKET CONFIRMATION SCREEN */}
      {step === 'ticket_status' && (
        <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 my-auto">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <span className="text-xs font-bold text-slate-500 font-serif">{tableNumber}番卓 発行整理券</span>
              <button
                onClick={() => setStep('menu')}
                className="text-xs text-slate-800 hover:text-black font-bold underline"
              >
                追加で注文する
              </button>
            </div>

            {currentActiveOrder ? (
              <div className="space-y-6 py-2">
                
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold">YOUR UNIQUE TICKET NUMBER</span>
                  {/* Sequential Guaranteed Non-Duplicate Ticket Number */}
                  <div className="text-6xl sm:text-7xl font-black tracking-widest font-mono text-slate-900 my-4">
                    {currentActiveOrder.ticket_number}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full font-black text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>厨房へ送信完了 (重複防止リアルタイム同期済み)</span>
                  </div>
                </div>

                {/* Progress Status */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-xs text-slate-600 text-left font-bold mb-1">調理ステータス:</div>
                  <div className="grid grid-cols-2 gap-3 text-center text-xs font-bold">
                    <div className={`p-3 rounded-xl border ${
                      currentActiveOrder.status === 'unread'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      1. 受付完了 (厨房通知済)
                    </div>
                    <div className={`p-3 rounded-xl border ${
                      currentActiveOrder.status === 'cooking'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm animate-pulse'
                        : currentActiveOrder.status === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      2. 調理中・提供準備
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="text-left bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 border-b border-slate-200 pb-2">
                    <span>ご注文詳細（{currentActiveOrder.items.length}点）</span>
                    <span>合計: ¥{currentActiveOrder.total_price}</span>
                  </div>
                  <div className="space-y-2">
                    {currentActiveOrder.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{i.menu_name} × {i.quantity}</p>
                          {i.options && (
                            <p className="text-[10px] text-slate-500">
                              生クリーム:{i.options.cream} / トッピング:{i.options.topping}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-slate-700 font-bold">¥{i.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-slate-400 text-xs font-bold">
                現在有効な整理券はありません
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
