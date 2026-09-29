import React, { useState, useEffect } from 'react';
import { RoleMode, MenuItem, ToppingOption, Order, StoreSettings } from './types/store';
import { store } from './lib/store';
import { Header } from './components/Header';
import { PinModal } from './components/PinModal';
import { CustomerView } from './components/CustomerView';
import { KitchenView } from './components/KitchenView';
import { SupabaseSqlModal } from './components/SupabaseSqlModal';
import { ShareLinksModal } from './components/ShareLinksModal';
import { Utensils, X } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<RoleMode>('customer');
  const [selectedTable, setSelectedTable] = useState<number>(1);

  // Security & Link Modals State
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [pinPurpose, setPinPurpose] = useState<'switch_role' | 'change_table'>('switch_role');
  const [isTablePickerOpen, setIsTablePickerOpen] = useState<boolean>(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [isShareLinksOpen, setIsShareLinksOpen] = useState<boolean>(false);

  // Synchronized store states
  const [menu, setMenu] = useState<MenuItem[]>(store.getMenu());
  const [toppings, setToppings] = useState<ToppingOption[]>(store.getToppings());
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [settings, setSettings] = useState<StoreSettings>(store.getSettings());

  // Parse URL Parameters on Mount for Dedicated Customer / Kitchen Links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paramRole = params.get('role') || params.get('mode');
      const paramTable = params.get('table');

      if (paramRole === 'kitchen' || paramRole === 'staff' || window.location.pathname === '/kitchen') {
        setRole('kitchen');
      } else if (paramRole === 'customer') {
        setRole('customer');
      }

      if (paramTable) {
        const parsedT = parseInt(paramTable, 10);
        if (parsedT >= 1 && parsedT <= 10) {
          setSelectedTable(parsedT);
        }
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setMenu(store.getMenu());
      setToppings(store.getToppings());
      setOrders(store.getOrders());
      setSettings(store.getSettings());
    });
    return () => unsubscribe();
  }, []);

  const handleSelectRole = (nextRole: RoleMode) => {
    if (nextRole === 'kitchen' && role !== 'kitchen') {
      setPinPurpose('switch_role');
      setIsPinModalOpen(true);
    } else {
      setRole(nextRole);
    }
  };

  const handleRequestChangeTable = () => {
    setPinPurpose('change_table');
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    if (pinPurpose === 'switch_role') {
      setRole('kitchen');
    } else if (pinPurpose === 'change_table') {
      setIsTablePickerOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-black selection:text-white">
      
      {/* Header Navigation */}
      <Header
        currentRole={role}
        onSelectRole={handleSelectRole}
        selectedTable={selectedTable}
        onRequestChangeTable={handleRequestChangeTable}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onOpenShareLinks={() => setIsShareLinksOpen(true)}
      />

      {/* Main Active View */}
      <main>
        {role === 'customer' && (
          <CustomerView
            tableNumber={selectedTable}
            onRequestChangeTable={handleRequestChangeTable}
            menu={menu}
            toppings={toppings}
            orders={orders}
          />
        )}

        {role === 'kitchen' && (
          <KitchenView
            menu={menu}
            toppings={toppings}
            orders={orders}
            settings={settings}
            onOpenSqlModal={() => setIsSqlModalOpen(true)}
          />
        )}
      </main>

      {/* PIN Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        correctPin={settings.pinCode}
        title={pinPurpose === 'switch_role' ? '店員用画面へのログイン' : '卓番号の変更（店員認証）'}
        subtitle={
          pinPurpose === 'switch_role'
            ? '店員用（厨房・レジ）画面に入るには暗証番号を入力してください'
            : 'お客さん側での誤変更を防ぐため、店員用暗証番号を入力してください'
        }
        onSuccess={handlePinSuccess}
        onClose={() => setIsPinModalOpen(false)}
      />

      {/* Table Picker Modal */}
      {isTablePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-slate-900" />
                <h3 className="text-lg font-black text-slate-900">卓番号の選択（1〜10番卓）</h3>
              </div>
              <button
                onClick={() => setIsTablePickerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              このタブレット端末を設置する卓番号（1番卓〜10番卓）を選択してください。
            </p>

            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTable(t);
                    setIsTablePickerOpen(false);
                  }}
                  className={`py-3.5 rounded-2xl font-black text-base transition-all border ${
                    selectedTable === t
                      ? 'bg-black text-white border-black scale-105 shadow-md'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsTablePickerOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Supabase SQL Modal */}
      <SupabaseSqlModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />

      {/* Share Direct Links Modal */}
      <ShareLinksModal
        isOpen={isShareLinksOpen}
        onClose={() => setIsShareLinksOpen(false)}
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
      />

    </div>
  );
}
