import React, { useState } from 'react';
import { Lock, Delete, X, AlertCircle } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  correctPin: string;
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  correctPin,
  title = '店員用アクセス認証',
  subtitle = '店員用画面に入るには暗証番号を入力してください',
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onSuccess();
          setPin('');
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl text-zinc-900">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-zinc-900">{title}</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {subtitle}<br />
            <span className="text-zinc-400 font-mono text-[11px]">(初期暗証番号: {correctPin})</span>
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center items-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                error
                  ? 'bg-rose-500 border-rose-600 animate-bounce'
                  : idx < pin.length
                  ? 'bg-black border-black scale-110 shadow-md'
                  : 'bg-zinc-100 border-zinc-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-bold mb-4 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span>暗証番号が違います。もう一度お入力ください</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-2xl bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 border border-zinc-200 text-2xl font-black text-zinc-900 transition-all active:scale-95 flex items-center justify-center shadow-xs"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-2xl bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 border border-zinc-200 text-2xl font-black text-zinc-900 transition-all active:scale-95 flex items-center justify-center shadow-xs"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-zinc-200/80 hover:bg-zinc-300 active:bg-zinc-400 border border-zinc-300 text-zinc-700 transition-all active:scale-95 flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
