import React from 'react';
import { motion } from 'motion/react';
import { Heart, X, Sparkles, ShieldCheck, Code, Globe, UserCheck, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AboutModal: React.FC = () => {
  const { showAboutModal, setShowAboutModal } = useApp();

  if (!showAboutModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm glass-card rounded-3xl p-6 border border-pink-500/40 box-glow-pink max-h-[90vh] overflow-y-auto space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              <Heart size={18} className="text-white fill-white animate-heart-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-1">
                LOVENTO AI <span className="text-pink-500 text-xs">❤️</span>
              </h3>
              <p className="text-[10px] text-pink-300 font-medium">Your AI Friends. ❤️</p>
            </div>
          </div>
          <button
            onClick={() => setShowAboutModal(false)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Creator Showcase */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-900/40 via-purple-900/40 to-rose-900/40 border border-pink-500/30 text-center space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
            Created & Developed by
          </div>
          <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-purple-200 font-['Outfit'] drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]">
            BENU RANA
          </div>
          <p className="text-[11px] text-slate-300">
            Architect & Founder of the LOVENTO AI Companion Ecosystem
          </p>
        </div>

        {/* Philosophy & Purpose */}
        <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
          <h4 className="font-bold text-white flex items-center gap-1.5 font-['Outfit']">
            <Sparkles size={14} className="text-pink-400" />
            <span>Mission & Companion Spirit</span>
          </h4>
          <p className="text-[11px] text-slate-300">
            LOVENTO AI was envisioned and built by <strong>BENU RANA</strong> to redefine AI companionship.
            Rather than sterile chatbots, LOVENTO AI brings together warm, empathetic, intellectual, and creative AI friends who speak your native dialect, celebrate your triumphs, guide your studies, and inspire you daily.
          </p>
        </div>

        {/* Key Features & Architecture */}
        <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
          <h4 className="font-bold text-white flex items-center gap-1.5 font-['Outfit']">
            <Code size={14} className="text-purple-400" />
            <span>Platform Highlights</span>
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
            <li><strong>Real Gemini AI:</strong> Google Gemini 3.8 Flash orchestration.</li>
            <li><strong>Neural Voices:</strong> Expressive single-speaker neural audio TTS.</li>
            <li><strong>Vision & Scanner:</strong> Multimodal photo & homework analysis.</li>
            <li><strong>Multilingual Heart:</strong> Odia, Kalahandia Odia, Hindi, Hinglish & English.</li>
            <li><strong>Full Security:</strong> App Lock with 4-digit PIN & Vault Export.</li>
          </ul>
        </div>

        {/* Responsible AI Disclaimer (STEP 47) */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1 text-[10px] text-slate-400">
          <div className="font-bold text-slate-300 flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>Responsible AI & Safety</span>
          </div>
          <p>
            All companions in LOVENTO AI are fictional AI personalities and clearly identify as artificial intelligence. They do not impersonate living people or provide medical/legal advice. All personal data stays under your direct control.
          </p>
        </div>

        {/* Version & Copyright */}
        <div className="text-center pt-2 text-[10px] text-slate-500 space-y-0.5">
          <p>LOVENTO AI &bull; Version 1.0.0 Production</p>
          <p>&copy; 2026 BENU RANA. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};
