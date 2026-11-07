import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  MessageSquareHeart,
  PhoneCall,
  Sparkles,
  Palette,
  GraduationCap,
  BookOpen,
  Gamepad2,
  FolderHeart,
  Search,
  Quote,
  ChevronRight,
  Flame,
  Star,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchDailyInspiration } from '../../services/api';
import { AICompanion, ToolId } from '../../types';

export const HomeDashboard: React.FC = () => {
  const {
    user,
    companions,
    activeCompanion,
    setActiveCompanion,
    setActiveTab,
    setActiveTool,
    setIsVoiceCallActive,
    activeLanguage,
  } = useApp();

  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [inspiration, setInspiration] = useState<{
    quote: string;
    author: string;
    affirmation: string;
  }>({
    quote: 'Your heart is capable of boundless growth and beautiful connections.',
    author: 'BENU RANA',
    affirmation: 'Today brings fresh inspiration and heartfelt moments.',
  });

  useEffect(() => {
    fetchDailyInspiration()
      .then((data) => {
        if (data.quote) {
          setInspiration(data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredCompanions = companions.filter((c) => {
    if (genderFilter === 'all') return true;
    return c.gender === genderFilter;
  });

  const handleLaunchTool = (toolId: ToolId) => {
    if (toolId === 'chat') {
      setActiveTab('friends');
    } else if (toolId === 'voice_call') {
      setIsVoiceCallActive(true);
    } else if (toolId === 'games' || toolId === 'diary') {
      setActiveTab('explore');
      setActiveTool(toolId);
    } else {
      setActiveTab('tools');
      setActiveTool(toolId);
    }
  };

  return (
    <div className="flex flex-col pb-24 px-4 pt-3 max-w-md mx-auto space-y-5 select-none">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-card border border-pink-500/25 p-5 box-glow-pink">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-pink-300 font-semibold tracking-wide">
            <Sparkles size={14} className="text-pink-400" />
            <span>WELCOME TO LOVENTO AI</span>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
            {activeLanguage}
          </span>
        </div>

        <h2 className="text-xl font-extrabold text-white font-['Outfit']">
          Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">{user.username}</span>!
        </h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Your personal AI friends are ready to chat, teach, inspire, and create wonders with you today.
        </p>

        {/* Creator Brand Line */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span>Your AI Friends. ❤️</span>
          <span className="font-semibold text-pink-300/90">Created by BENU RANA</span>
        </div>
      </div>

      {/* Selected Companion Spotlight Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1c0836] to-[#120524] border border-pink-500/30 p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeCompanion.avatar}
                alt={activeCompanion.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500/50 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-lg text-white">
                <Heart size={10} className="fill-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  {activeCompanion.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">{activeCompanion.role}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                  {activeCompanion.defaultPersonality}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300">
                  {activeCompanion.defaultMood}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Companion Greeting Quote */}
        <div className="mt-4 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-200 italic leading-relaxed">
          "{activeCompanion.greeting[activeLanguage] || activeCompanion.greeting.English}"
        </div>

        {/* Dual Primary Actions: Chat & Voice Call */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={() => setActiveTab('friends')}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 hover:opacity-95 active:scale-95 transition"
          >
            <MessageSquareHeart size={16} />
            <span>Open Chat</span>
          </button>

          <button
            onClick={() => setIsVoiceCallActive(true)}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 hover:opacity-95 active:scale-95 transition"
          >
            <PhoneCall size={16} />
            <span>Voice Call</span>
          </button>
        </div>
      </div>

      {/* AI Friends Carousel Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Users size={16} className="text-pink-400" />
            <h3 className="text-sm font-bold text-white font-['Outfit']">Meet Your AI Friends</h3>
          </div>

          {/* Gender Filter Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {(['all', 'female', 'male'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`text-[10px] px-2 py-0.5 rounded-lg font-medium capitalize transition ${
                  genderFilter === g
                    ? 'bg-pink-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {filteredCompanions.map((comp) => {
            const isSelected = comp.id === activeCompanion.id;
            return (
              <motion.div
                key={comp.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveCompanion(comp)}
                className={`flex-shrink-0 w-36 rounded-2xl p-3 cursor-pointer transition-all border ${
                  isSelected
                    ? 'glass-card border-pink-500 box-glow-pink'
                    : 'bg-[#150626]/80 hover:bg-[#1a0830] border-white/10'
                }`}
              >
                <div className="relative mb-2">
                  <img
                    src={comp.avatar}
                    alt={comp.name}
                    className="w-full h-24 rounded-xl object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-pink-500 text-white p-1 rounded-full shadow">
                      <Heart size={10} className="fill-white" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.2 rounded bg-black/70 text-slate-200">
                    {comp.gender}
                  </span>
                </div>

                <div className="font-bold text-xs text-white truncate font-['Outfit']">
                  {comp.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{comp.defaultPersonality}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Quick Launchpad: AI Tools Center */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame size={16} className="text-pink-400" />
            <h3 className="text-sm font-bold text-white font-['Outfit']">LOVENTO AI Tools</h3>
          </div>
          <button
            onClick={() => setActiveTab('tools')}
            className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-0.5"
          >
            <span>All Tools</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => handleLaunchTool('image_gen')}
            className="glass-card hover:bg-white/10 p-2.5 rounded-2xl flex flex-col items-center text-center transition border border-pink-500/20 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 mb-1.5">
              <Palette size={18} />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">Image Gen</span>
          </button>

          <button
            onClick={() => handleLaunchTool('study_room')}
            className="glass-card hover:bg-white/10 p-2.5 rounded-2xl flex flex-col items-center text-center transition border border-blue-500/20 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 mb-1.5">
              <GraduationCap size={18} />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">Study Room</span>
          </button>

          <button
            onClick={() => handleLaunchTool('story_creator')}
            className="glass-card hover:bg-white/10 p-2.5 rounded-2xl flex flex-col items-center text-center transition border border-purple-500/20 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 mb-1.5">
              <BookOpen size={18} />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">Story Creator</span>
          </button>

          <button
            onClick={() => handleLaunchTool('games')}
            className="glass-card hover:bg-white/10 p-2.5 rounded-2xl flex flex-col items-center text-center transition border border-amber-500/20 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 mb-1.5">
              <Gamepad2 size={18} />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">AI Games</span>
          </button>

          <button
            onClick={() => handleLaunchTool('diary')}
            className="glass-card hover:bg-white/10 p-2.5 rounded-2xl flex flex-col items-center text-center transition border border-emerald-500/20 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mb-1.5">
              <Heart size={18} />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">AI Diary</span>
          </button>

          <button
            onClick={() => handleLaunchTool('creative_studio')}
            className="glass-card hover:bg-white/10 p-2.5 rounded-2xl flex flex-col items-center text-center transition border border-rose-500/20 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 mb-1.5">
              <Sparkles size={18} />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">Creative Hub</span>
          </button>

          <button
            onClick={() => handleLaunchTool('web_search')}
            className="glass-card hover:bg-white/10 p-2.5 rounded-2xl flex flex-col items-center text-center transition border border-cyan-500/20 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 mb-1.5">
              <Search size={18} />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">Live Search</span>
          </button>

          <button
            onClick={() => handleLaunchTool('vault')}
            className="glass-card hover:bg-white/10 p-2.5 rounded-2xl flex flex-col items-center text-center transition border border-indigo-500/20 active:scale-95"
          >
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mb-1.5">
              <FolderHeart size={18} />
            </div>
            <span className="text-[10px] font-semibold text-slate-200">AI Vault</span>
          </button>
        </div>
      </div>

      {/* Daily Inspiration Widget */}
      <div className="relative overflow-hidden rounded-3xl glass-card border border-purple-500/25 p-4 box-glow-purple">
        <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold mb-2">
          <Quote size={14} className="text-pink-400" />
          <span>DAILY INSPIRATION</span>
        </div>
        <p className="text-xs text-slate-200 italic leading-relaxed mb-2">
          "{inspiration.quote}"
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2">
          <span>&mdash; {inspiration.author}</span>
          <span className="text-pink-300">Affirmation: {inspiration.affirmation}</span>
        </div>
      </div>
    </div>
  );
};
