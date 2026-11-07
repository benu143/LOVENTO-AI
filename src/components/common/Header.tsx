import React, { useState } from 'react';
import { Heart, Globe, Info, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';

export const Header: React.FC = () => {
  const {
    activeLanguage,
    setActiveLanguage,
    setShowAboutModal,
    activeCompanion,
    isAdmin,
    setShowAdminModal,
  } = useApp();

  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: Language[] = ['English', 'Hindi', 'Odia', 'Kalahandia Odia', 'Hinglish'];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a0214]/90 backdrop-blur-md border-b border-pink-500/15 px-4 py-2.5 flex items-center justify-between">
      {/* Brand & Creator Attribution */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setShowAboutModal(true)}
          className="flex items-center gap-2 group text-left"
          title="About LOVENTO AI & BENU RANA"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.5)] group-hover:scale-105 transition">
              <Heart size={18} className="text-white fill-white animate-heart-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#0a0214]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-pink-300 via-white to-purple-300 bg-clip-text text-transparent font-['Outfit']">
                LOVENTO AI
              </span>
              <span className="text-[10px] text-pink-400">❤️</span>
            </div>
            <div className="text-[9px] text-slate-400 font-medium">
              by <span className="text-pink-300/90 font-semibold group-hover:text-pink-200">BENU RANA</span>
            </div>
          </div>
        </button>
      </div>

      {/* Right Controls: Language Selector, Admin pill, Info */}
      <div className="flex items-center gap-1.5">
        {isAdmin && (
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-600/20 border border-purple-500/40 text-[10px] text-purple-300 font-semibold"
          >
            <ShieldCheck size={12} />
            <span>Admin</span>
          </button>
        )}

        {/* Language Picker */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium transition"
          >
            <Globe size={13} className="text-pink-400" />
            <span className="max-w-[80px] truncate">{activeLanguage}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-[#140626] border border-pink-500/30 shadow-2xl p-1 z-40">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold text-pink-300 border-b border-white/10">
                Select AI Language
              </div>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setActiveLanguage(lang);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                    activeLanguage === lang
                      ? 'bg-pink-500/20 text-pink-300 font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{lang}</span>
                  {activeLanguage === lang && <Sparkles size={12} className="text-pink-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* About Dialog Button */}
        <button
          onClick={() => setShowAboutModal(true)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition"
          title="About & Creator"
        >
          <Info size={16} />
        </button>
      </div>
    </header>
  );
};
