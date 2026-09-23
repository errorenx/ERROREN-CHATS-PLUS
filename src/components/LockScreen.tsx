import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck } from 'lucide-react';

interface LockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111b21] text-white p-6 select-none">
      <div className="w-16 h-16 rounded-full bg-[#00a884]/20 flex items-center justify-center mb-6 text-[#00a884]">
        {pin.length === 4 && pin === correctPin ? <Unlock className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">ERROREN CHATS</h1>
      <p className="text-sm text-slate-400 mb-8 flex items-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-[#00a884]" /> End-to-end encrypted · Enter 4-digit PIN
      </p>

      {/* PIN dots */}
      <div className={`flex gap-4 mb-8 ${error ? 'animate-bounce text-red-500' : ''}`}>
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              pin.length > idx
                ? error
                  ? 'bg-red-500 scale-110'
                  : 'bg-[#00a884] scale-110'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-400 mb-4 font-medium">Incorrect PIN. Try again.</p>}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 max-w-[280px] w-full">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] active:scale-95 text-xl font-semibold flex items-center justify-center transition-colors mx-auto shadow"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => setPin('')}
          className="w-16 h-16 rounded-full text-xs font-medium text-slate-400 hover:text-white flex items-center justify-center mx-auto"
        >
          Clear
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] active:scale-95 text-xl font-semibold flex items-center justify-center transition-colors mx-auto shadow"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full text-sm font-medium text-slate-400 hover:text-white flex items-center justify-center mx-auto"
        >
          ⌫
        </button>
      </div>
    </div>
  );
};
