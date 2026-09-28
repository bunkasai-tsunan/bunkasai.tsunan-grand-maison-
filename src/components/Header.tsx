import React from 'react';
import { RoleMode } from '../types/store';
import { Utensils, ChefHat, Database, Lock, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  currentRole: RoleMode;
  onSelectRole: (role: RoleMode) => void;
  selectedTable: number;
  onRequestChangeTable: () => void;
  onOpenSqlModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  selectedTable,
  onRequestChangeTable,
  onOpenSqlModal,
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
                オンライン同期中
              </p>
            </div>
          </div>

          {/* Table Pill (Customer View) - Click triggers PIN prompt */}
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

        {/* Right Side: Account / Role Switcher */}
        <div className="flex items-center gap-2">
          
          {/* SQL Button visible ONLY in Staff/Kitchen View! */}
          {currentRole === 'kitchen' && (
            <button
              onClick={onOpenSqlModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Supabase SQLとNext.js実装ガイドを表示"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase SQL</span>
            </button>
          )}

          {/* Account Mode Switcher */}
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
              <span className="whitespace-nowrap">客用画面</span>
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
              <span className="whitespace-nowrap">店員用画面</span>
              <Lock className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
