import React, { useState } from 'react';
import { Link, Copy, Check, X, QrCode, ExternalLink, ChefHat, Utensils } from 'lucide-react';

interface ShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseUrl: string;
}

export const ShareLinksModal: React.FC<ShareLinksModalProps> = ({
  isOpen,
  onClose,
  baseUrl,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : baseUrl;

  const customerBaseUrl = `${currentOrigin}/?role=customer`;
  const kitchenUrl = `${currentOrigin}/?role=kitchen`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-900">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-black">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">専用ページURL（リンク分けた運用案内）</h3>
              <p className="text-xs text-slate-500">各タブレット・スマホ用の専用リンクを分けてコピー・ブックマークできます</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Kitchen Link Box */}
          <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-black text-amber-950">店員用画面（厨房・レジ用リンク）</h4>
              </div>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">要パスワード (1234)</span>
            </div>
            <p className="text-xs text-amber-800">
              厨房やレジに置くiPad・タブレットはこのリンクを開いて運用してください。
            </p>

            <div className="flex items-center gap-2 bg-white border border-amber-300 p-2.5 rounded-xl">
              <input
                type="text"
                readOnly
                value={kitchenUrl}
                className="w-full text-xs font-mono font-bold bg-transparent border-none text-slate-800 outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(kitchenUrl, 'kitchen')}
                className="px-3 py-1.5 bg-black text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 hover:bg-slate-800"
              >
                {copiedIndex === 'kitchen' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 'kitchen' ? 'コピー完了' : 'リンクをコピー'}</span>
              </button>
            </div>
          </div>

          {/* Table-specific Direct Customer Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-slate-800" />
                <h4 className="text-sm font-black text-slate-900">客用タブレット専用リンク（1〜10番卓直通）</h4>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              各卓に設置する端末ごとに対応するリンクを開いておくと、卓番号が固定された状態で客用注文画面になります！
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => {
                const tableUrl = `${currentOrigin}/?role=customer&table=${t}`;
                return (
                  <div key={t} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <span className="font-black text-xs text-slate-900">{t}番卓 専用リンク</span>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">?table={t}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(tableUrl, `table_${t}`)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-lg flex items-center gap-1 shrink-0"
                    >
                      {copiedIndex === `table_${t}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === `table_${t}` ? 'コピー済' : 'コピー'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

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
