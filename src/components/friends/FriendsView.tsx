import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  MessageSquareHeart,
  PhoneCall,
  Edit3,
  Sparkles,
  Check,
  ChevronRight,
  Heart,
  Sliders,
  X,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AICompanion, Mood, Personality } from '../../types';
import { ChatView } from '../chat/ChatView';

export const FriendsView: React.FC = () => {
  const {
    companions,
    activeCompanion,
    setActiveCompanion,
    updateCompanion,
    setIsVoiceCallActive,
    activeLanguage,
  } = useApp();

  const [tab, setTab] = useState<'chat' | 'directory'>('chat');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [editingCompanion, setEditingCompanion] = useState<AICompanion | null>(null);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPersonality, setEditPersonality] = useState<Personality>('Friendly');
  const [editMood, setEditMood] = useState<Mood>('Happy');
  const [editVoice, setEditVoice] = useState<AICompanion['voice']>('Kore');
  const [editAvatar, setEditAvatar] = useState('');

  const filteredCompanions = companions.filter((c) => {
    if (genderFilter === 'all') return true;
    return c.gender === genderFilter;
  });

  const handleOpenEdit = (comp: AICompanion) => {
    setEditingCompanion(comp);
    setEditName(comp.name);
    setEditBio(comp.bio);
    setEditPersonality(comp.defaultPersonality);
    setEditMood(comp.defaultMood);
    setEditVoice(comp.voice);
    setEditAvatar(comp.avatar);
  };

  const handleSaveEdit = () => {
    if (!editingCompanion) return;
    updateCompanion(editingCompanion.id, {
      name: editName,
      bio: editBio,
      defaultPersonality: editPersonality,
      defaultMood: editMood,
      voice: editVoice,
      avatar: editAvatar,
    });
    setEditingCompanion(null);
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
  ];

  return (
    <div className="flex flex-col h-full select-none">
      {/* Top Toggle: Chat View vs Companions Directory */}
      <div className="px-4 py-2 border-b border-pink-500/15 bg-[#0e031c]/90 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 w-full max-w-xs mx-auto">
          <button
            onClick={() => setTab('chat')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              tab === 'chat'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquareHeart size={14} />
            <span>Chat with {activeCompanion.name}</span>
          </button>
          <button
            onClick={() => setTab('directory')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              tab === 'directory'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>All Companions ({companions.length})</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-hidden">
        {tab === 'chat' ? (
          <ChatView />
        ) : (
          <div className="h-[calc(100vh-140px)] overflow-y-auto px-4 py-4 space-y-4 pb-24 max-w-md mx-auto">
            {/* Filter Pills */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold font-['Outfit']">
                Filter by Category
              </span>
              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                {(['all', 'female', 'male'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium capitalize transition ${
                      genderFilter === g
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {g === 'all' ? 'All Friends' : `${g} Friends`}
                  </button>
                ))}
              </div>
            </div>

            {/* Companions Cards */}
            <div className="space-y-3">
              {filteredCompanions.map((comp) => {
                const isActive = comp.id === activeCompanion.id;

                return (
                  <div
                    key={comp.id}
                    className={`rounded-3xl p-4 transition-all border ${
                      isActive
                        ? 'glass-card border-pink-500 box-glow-pink'
                        : 'bg-[#150528]/80 hover:bg-[#1a0832] border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={comp.avatar}
                        alt={comp.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500/30"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                            <span>{comp.name}</span>
                            {isActive && (
                              <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 py-0.2 rounded font-medium">
                                Active
                              </span>
                            )}
                          </h4>
                          <button
                            onClick={() => handleOpenEdit(comp)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-pink-300 transition"
                            title="Customize Companion"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>

                        <p className="text-xs text-pink-300/90 font-medium">{comp.role}</p>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                          {comp.bio}
                        </p>
                      </div>
                    </div>

                    {/* Chips for Personality, Mood, Voice */}
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/10">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        Style: {comp.defaultPersonality}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300">
                        Mood: {comp.defaultMood}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 flex items-center gap-1">
                        <Volume2 size={10} />
                        <span>Voice: {comp.voice}</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button
                        onClick={() => {
                          setActiveCompanion(comp);
                          setTab('chat');
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          isActive
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                            : 'bg-white/10 hover:bg-white/15 text-slate-200'
                        }`}
                      >
                        <MessageSquareHeart size={14} />
                        <span>{isActive ? 'Continue Chat' : 'Select & Chat'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveCompanion(comp);
                          setIsVoiceCallActive(true);
                        }}
                        className="py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <PhoneCall size={14} />
                        <span>Voice Call</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Companion Personalization Modal */}
      <AnimatePresence>
        {editingCompanion && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm glass-card rounded-3xl p-5 border border-pink-500/30 box-glow-pink max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-pink-400" />
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Customize Companion
                  </h3>
                </div>
                <button
                  onClick={() => setEditingCompanion(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Avatar Selector */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Avatar Studio
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sampleAvatars.map((av, idx) => (
                    <img
                      key={idx}
                      src={av}
                      alt="avatar"
                      onClick={() => setEditAvatar(av)}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition ${
                        editAvatar === av ? 'border-pink-500 scale-105' : 'border-transparent opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Companion Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Bio */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Bio & Role</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Personality Selector */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Personality</label>
                <select
                  value={editPersonality}
                  onChange={(e) => setEditPersonality(e.target.value as Personality)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0832] border border-white/15 text-xs text-white focus:outline-none"
                >
                  {['Friendly', 'Funny', 'Smart', 'Motivational', 'Creative', 'Helpful', 'Calm', 'Supportive'].map(
                    (p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Mood Selector */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-slate-300 mb-1">Default Mood</label>
                <select
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value as Mood)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0832] border border-white/15 text-xs text-white focus:outline-none"
                >
                  {['Happy', 'Calm', 'Funny', 'Supportive', 'Motivational', 'Professional'].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Neural Voice Selector */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-300 mb-1">AI Voice</label>
                <select
                  value={editVoice}
                  onChange={(e) => setEditVoice(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1a0832] border border-white/15 text-xs text-white focus:outline-none"
                >
                  <option value="Kore">Kore (Warm, Expressive)</option>
                  <option value="Aoede">Aoede (Clear, Articulate Mentor)</option>
                  <option value="Puck">Puck (Playful, Brotherly)</option>
                  <option value="Fenrir">Fenrir (Calm, Deep, Wise)</option>
                  <option value="Zephyr">Zephyr (Bright, Artistic)</option>
                  <option value="Charon">Charon (Witty, Confident)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCompanion(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-xs font-semibold text-white shadow-md shadow-pink-500/25"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
