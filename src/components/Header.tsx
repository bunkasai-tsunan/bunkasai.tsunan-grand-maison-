import React from 'react';
import { RoleMode } from '../types/store';
import { Utensils, ChefHat, Database, Lock, Link, QrCode } from 'lucide-react';

interface HeaderProps {
  currentRole: RoleMode;
  onSelectRole: (role: RoleMode) => void;
  selectedTable: number;
  onRequestChangeTable: () => void;
  onOpenSqlModal: () => void;
  onOpenShareLinks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  selectedTable,
  onRequestChangeTable,
  onOpenSqlModal,
  onOpenShareLinks,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 text-zinc-900 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Table Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white font-black tracking-widest text-lg flex items-center justify-center shadow-md">
              津
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 uppercase">
                  グランメゾン津南
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono tracking-wider text-zinc-600 bg-zinc-100 border border-zinc-200 rounded-md font-bold">
                  {currentRole === 'customer' ? '客用タブレット' : '店員・厨房POS'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                サーバーリアルタイム通信中
              </p>
            </div>
          </div>

          {/* Table Pill */}
          {currentRole === 'customer' && (
            <button
              onClick={onRequestChangeTable}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-full text-xs font-black transition-all text-zinc-800 shadow-xs active:scale-95 group"
              title="卓番号の変更には店員用パスワードが必要です"
            >
              <Utensils className="w-3.5 h-3.5 text-zinc-600" />
              <span>{selectedTable}番卓</span>
              <Lock className="w-3 h-3 text-zinc-400 group-hover:text-zinc-700 ml-0.5" />
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          
          {/* Share Links / Split Page Helper Button */}
          <button
            onClick={onOpenShareLinks}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs"
            title="専用ページURL（リンク分けた運用案内）"
          >
            <Link className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden md:inline">専用リンク案内</span>
          </button>

          {/* SQL Button in Staff View */}
          {currentRole === 'kitchen' && (
            <button
              onClick={onOpenSqlModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Supabase SQLガイドを表示"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL</span>
            </button>
          )}

          {/* Account Role Switcher */}
          <div className="flex items-center p-1 bg-zinc-100 border border-zinc-200 rounded-2xl shadow-inner">
            <button
              onClick={() => onSelectRole('customer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                currentRole === 'customer'
                  ? 'bg-black text-white shadow-md'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">客用</span>
            </button>

            <button
              onClick={() => onSelectRole('kitchen')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all ${
                currentRole === 'kitchen'
                  ? 'bg-black text-white shadow-md'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span className="whitespace-nowrap">店員用</span>
              <Lock className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
