import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Delete, ShieldAlert, Fingerprint } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AppLockModal: React.FC = () => {
  const { isAppLocked, verifyPin, user } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isAppLocked) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        const success = verifyPin(nextPin);
        if (!success) {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleBiometric = () => {
    // If user has PIN configured, biometric simulates authentication
    if (user.pinCode) {
      verifyPin(user.pinCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#06010d]/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 text-white select-none">
      <div className="pt-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center mb-4 box-glow-pink">
          <Lock size={32} className="text-white" />
        </div>
        <h2 className="text-xl font-bold font-['Outfit']">LOVENTO AI App Lock</h2>
        <p className="text-xs text-slate-400 mt-1">Enter your 4-digit security PIN to unlock</p>
      </div>

      {/* PIN Dots */}
      <div className="my-auto flex flex-col items-center">
        <motion.div
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4 mb-4"
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border transition-all duration-200 ${
                  error
                    ? 'border-rose-500 bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                    : isFilled
                    ? 'border-pink-500 bg-pink-500 shadow-[0_0_12px_#ec4899]'
                    : 'border-slate-600 bg-white/5'
                }`}
              />
            );
          })}
        </motion.div>

        {error && (
          <span className="text-xs text-rose-400 flex items-center gap-1">
            <ShieldAlert size={14} /> Incorrect PIN. Try again.
          </span>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs pb-6">
        <div className="grid grid-cols-3 gap-3 mb-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-pink-500/20 active:scale-95 transition text-xl font-semibold text-white border border-white/10 flex items-center justify-center font-['Outfit']"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleBiometric}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-pink-500/20 active:scale-95 transition text-pink-400 border border-white/10 flex items-center justify-center"
            title="Biometric Unlock"
          >
            <Fingerprint size={24} />
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-pink-500/20 active:scale-95 transition text-xl font-semibold text-white border border-white/10 flex items-center justify-center font-['Outfit']"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-pink-500/20 active:scale-95 transition text-slate-300 border border-white/10 flex items-center justify-center"
          >
            <Delete size={22} />
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-500">
          Secured by LOVENTO AI &bull; Created by BENU RANA
        </p>
      </div>
    </div>
  );
};
