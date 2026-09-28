import React, { useState } from 'react';
import { Database, Check, Copy, X } from 'lucide-react';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'sql' | 'nextjs'>('sql');

  if (!isOpen) return null;

  const sqlCode = `-- ==========================================
-- グランメゾン津南 (文化祭システム)
-- Supabase PostgreSQL データベース構築用 SQL クエリ
-- ==========================================

-- 1. メニューテーブル (menu)
CREATE TABLE public.menu (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  is_sold_out BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 50,
  category TEXT NOT NULL CHECK (category IN ('main', 'drink')),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. トッピング・オプションテーブル (toppings)
CREATE TABLE public.toppings (
  id TEXT PRIMARY KEY,
  menu_id TEXT REFERENCES public.menu(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  is_sold_out BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 80,
  category TEXT NOT NULL CHECK (category IN ('cream', 'topping'))
);

-- 3. 注文テーブル (orders)
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL, -- 例: #001
  table_number INTEGER NOT NULL CHECK (table_number BETWEEN 1 AND 10), -- 1~10番卓
  guest_count INTEGER DEFAULT 1 CHECK (guest_count BETWEEN 1 AND 8), -- 1~8人
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'cooking', 'completed', 'cancelled')),
  total_price INTEGER NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  cash_received INTEGER DEFAULT 0,
  change_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 注文詳細テーブル (order_details)
CREATE TABLE public.order_details (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_id TEXT REFERENCES public.menu(id),
  menu_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER DEFAULT 1,
  options JSONB DEFAULT '{}'::jsonb, -- { "cream": "あり", "topping": "あり" }
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Supabase Realtime の有効化
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu;
ALTER PUBLICATION supabase_realtime ADD TABLE public.toppings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 6. 初期サンプルの投入 (グランメゾン津南)
INSERT INTO public.menu (id, name, price, is_sold_out, stock, category, description)
VALUES 
  ('m1', 'カヌレ・ワッフルセット', 400, false, 50, 'main', '外はカリッと中はもちもちのカヌレと、焼きたてサクサクのワッフルセット。'),
  ('m2', '紅茶', 100, false, 100, 'drink', '香りと旨味が引き立つホット紅茶。');

INSERT INTO public.toppings (id, menu_id, name, price, is_sold_out, stock, category)
VALUES 
  ('t1', 'm1', '生クリーム', 0, false, 80, 'cream'),
  ('t2', 'm1', 'カラースプレー', 0, false, 80, 'topping');
`;

  const nextJsCode = `// app/page.tsx (Next.js App Router 例)
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BunkasaiPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 初回データ取得
    supabase.from('orders').select('*').then(({ data }) => setOrders(data || []));

    // Supabase Realtime リアルタイム購読
    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('リアルタイム更新受信:', payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-8 bg-slate-50 text-slate-900 min-h-screen font-sans">
      <h1 className="text-2xl font-bold">グランメゾン津南 注文管理システム</h1>
    </div>
  );
}
`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-900">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Supabase SQL クエリ & Next.js 実装コード
              </h3>
              <p className="text-xs text-slate-500">
                Supabase SQL Editorでそのまま実行可能なテーブル設計コード
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center px-6 pt-4 gap-2 border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setTab('sql')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition-all ${
              tab === 'sql'
                ? 'bg-white text-black border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Supabase SQL Schema
          </button>
          <button
            onClick={() => setTab('nextjs')}
            className={`px-4 py-2 font-bold text-xs rounded-t-xl transition-all ${
              tab === 'nextjs'
                ? 'bg-white text-black border-t border-x border-slate-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Next.js (App Router) 実装例
          </button>
        </div>

        {/* Code View */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs bg-slate-900 text-slate-100 relative">
          
          <button
            onClick={() => handleCopy(tab === 'sql' ? sqlCode : nextJsCode)}
            className="absolute top-8 right-8 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'コピー完了' : 'コードをコピー'}</span>
          </button>

          <pre className="text-slate-200 leading-relaxed overflow-x-auto p-2">
            {tab === 'sql' ? sqlCode : nextJsCode}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
};
