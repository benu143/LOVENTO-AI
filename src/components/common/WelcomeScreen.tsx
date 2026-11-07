import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, MessageSquareHeart, PhoneCall, Bot, ArrowRight, ShieldCheck, Globe, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { setShowWelcome, loginUser } = useApp();
  const [authMode, setAuthMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleStartGuest = () => {
    loginUser('guest@lovento.ai', 'Beloved Traveler');
    setShowWelcome(false);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }
    const finalName = username.trim() || email.split('@')[0] || 'Dear Friend';
    loginUser(email, finalName);
    setShowWelcome(false);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#090214] text-white flex flex-col justify-between overflow-y-auto px-4 py-8 select-none">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/30 via-[#0d031c] to-[#06000c]" />
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.4)]">
            <Heart size={20} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide font-['Outfit'] flex items-center gap-1">
              LOVENTO AI <span className="text-pink-500 text-xs">❤️</span>
            </h1>
            <p className="text-[10px] text-pink-300 font-medium tracking-wider">Your AI Friends. ❤️</p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
          by BENU RANA
        </span>
      </div>

      {/* Middle Content */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <AnimatePresence mode="wait">
          {authMode === 'welcome' && (
            <motion.div
              key="welcome_view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center text-center"
            >
              {/* Highlight Card */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500/20 via-purple-600/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center box-glow-pink">
                  <Bot size={50} className="text-pink-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-full shadow-lg">
                  <Sparkles size={16} className="text-white" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit'] mb-2">
                Real Companionship,{' '}
                <span className="bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
                  Powered by Heart
                </span>
              </h2>

              <p className="text-sm text-slate-300 max-w-xs leading-relaxed mb-6">
                Discover thoughtful AI friends who listen, inspire, study with you, generate art, and speak your dialect.
              </p>

              {/* Feature Chips */}
              <div className="grid grid-cols-2 gap-2.5 w-full mb-8 text-left">
                <div className="glass-card rounded-2xl p-3 border border-pink-500/20 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                    <MessageSquareHeart size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">8+ AI Friends</div>
                    <div className="text-[10px] text-slate-400">Unique styles & moods</div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-3 border border-purple-500/20 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Live Voice Call</div>
                    <div className="text-[10px] text-slate-400">Natural voice wave</div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-3 border border-blue-500/20 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Globe size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">5 Languages</div>
                    <div className="text-[10px] text-slate-400">Odia, Hindi & more</div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-3 border border-rose-500/20 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Private & Safe</div>
                    <div className="text-[10px] text-slate-400">App lock with PIN</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3">
                <button
                  onClick={handleStartGuest}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-semibold text-sm shadow-[0_0_25px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition"
                >
                  <span>Get Started Instantly</span>
                  <ArrowRight size={18} />
                </button>

                <div className="flex gap-2.5 w-full">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setError('');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setError('');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-xs font-semibold text-pink-300 transition"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {(authMode === 'login' || authMode === 'signup') && (
            <motion.div
              key="auth_form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card rounded-3xl p-6 border border-pink-500/30 box-glow-pink"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold font-['Outfit']">
                  {authMode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
                </h3>
                <button
                  onClick={() => setAuthMode('welcome')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  &larr; Back
                </button>
              </div>

              {error && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. Alex Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold text-sm text-white shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-[0.98] transition"
                >
                  {authMode === 'login' ? 'Login to LOVENTO AI' : 'Complete Sign Up'}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                </span>
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-pink-400 font-semibold hover:underline"
                >
                  {authMode === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleStartGuest}
                  className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  Or continue as Guest &rarr;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pt-2">
        <p className="text-[11px] text-slate-400 font-medium">
          LOVENTO AI &bull; Created & Developed by{' '}
          <span className="text-pink-400 font-semibold">BENU RANA</span>
        </p>
      </div>
    </div>
  );
};
