import React from 'react';
import { RoleMode } from '../types/store';
import { Utensils, ChefHat, Database, Lock, Link } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 text-slate-900 px-4 sm:px-8 py-4 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Name (No icon next to text as requested, pristine luxury typography) */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-lg sm:text-xl font-black tracking-widest text-slate-900 font-serif">
                グランメゾン津南
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-slate-400 font-semibold uppercase">
                {currentRole === 'customer' ? 'CLIENT KIOSK' : 'STAFF POS'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-serif tracking-wider">
              GRAN MAISON TSUNAN — CULINARY SELECTION
            </p>
          </div>

          {/* Table Badge for Customer */}
          {currentRole === 'customer' && (
            <button
              onClick={onRequestChangeTable}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold transition-all text-slate-800 shadow-xs active:scale-95 group ml-2"
              title="卓番号の変更には店員用パスワードが必要です"
            >
              <span>{selectedTable}番卓</span>
              <Lock className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
            </button>
          )}
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-2.5">
          
          {/* Direct Share Links */}
          <button
            onClick={onOpenShareLinks}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs"
            title="専用ページURL（リンク分けた運用案内）"
          >
            <Link className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">専用リンク案内</span>
          </button>

          {/* SQL Modal in Kitchen */}
          {currentRole === 'kitchen' && (
            <button
              onClick={onOpenSqlModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Supabase SQLガイドを表示"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>SQL</span>
            </button>
          )}

          {/* Role Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl">
            <button
              onClick={() => onSelectRole('customer')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                currentRole === 'customer'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">客用</span>
            </button>

            <button
              onClick={() => onSelectRole('kitchen')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                currentRole === 'kitchen'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-300" />
              <span className="whitespace-nowrap">店員用</span>
              <Lock className="w-3 h-3 text-slate-400" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
