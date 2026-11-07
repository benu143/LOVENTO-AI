import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Shield,
  Key,
  Globe,
  Brain,
  Download,
  Trash2,
  LogOut,
  Sparkles,
  Heart,
  Sliders,
  Check,
  Plus,
  Lock,
  Unlock,
  ShieldAlert,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { adminLogin } from '../../services/api';
import { Language, UserMemory } from '../../types';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUser,
    logoutUser,
    deleteAccount,
    exportPersonalData,
    memories,
    addMemory,
    removeMemory,
    clearMemories,
    toggleMemoryEnabled,
    activeLanguage,
    setActiveLanguage,
    setAppPin,
    setShowAboutModal,
    setShowAdminModal,
    setIsAdmin,
    setAdminToken,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [gender, setGender] = useState(user.gender || 'Prefer not to say');

  // App Lock PIN setup
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  // New Memory prompt
  const [showAddMem, setShowAddMem] = useState(false);
  const [memCategory, setMemCategory] = useState<UserMemory['category']>('hobby');
  const [memContent, setMemContent] = useState('');

  // Admin access unlock
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSaveProfile = () => {
    updateUser({
      username: username.trim() || user.username,
      bio: bio.trim() || user.bio,
      gender,
    });
    setIsEditing(false);
  };

  const handleSavePin = () => {
    if (newPin.length === 4) {
      setAppPin(newPin, true);
      setPinSuccess(true);
      setTimeout(() => {
        setPinSuccess(false);
        setShowPinSetup(false);
        setNewPin('');
      }, 1200);
    }
  };

  const handleDisablePin = () => {
    setAppPin('', false);
  };

  const handleCreateMemory = () => {
    if (!memContent.trim()) return;
    addMemory(memCategory, memContent.trim());
    setMemContent('');
    setShowAddMem(false);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = adminPass.trim();
    if (!key) return;

    setIsAuthenticating(true);
    setAdminError('');

    try {
      const res = await adminLogin(key);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setIsAdmin(true);
        setShowAdminPrompt(false);
        setShowAdminModal(true);
        setAdminPass('');
        setAdminError('');
      } else {
        setAdminError(res.error || 'Access Denied! Invalid Admin Key.');
      }
    } catch (err: any) {
      setAdminError(err.message || 'Access Denied! Invalid Admin Key.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] overflow-y-auto px-4 py-3 pb-24 max-w-md mx-auto select-none space-y-4">
      {/* User Identity Card */}
      <div className="glass-card rounded-3xl p-5 border border-pink-500/25 box-glow-pink">
        <div className="flex items-center gap-3.5 mb-3">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-500/50 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white font-['Outfit'] truncate">
              {user.username}
            </h3>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-medium">
              Member since {user.joinedDate}
            </span>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-pink-300 transition"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-[#14062a] border border-white/15 text-xs text-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 font-semibold text-xs text-white shadow-md shadow-pink-500/20"
            >
              Save Profile
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-300 leading-relaxed italic pt-2 border-t border-white/10">
            "{user.bio}"
          </p>
        )}
      </div>

      {/* AI Memory Manager (STEP 11) */}
      <div className="glass-card rounded-3xl p-4 border border-purple-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-400">
            <Brain size={18} />
            <h4 className="text-sm font-bold text-white font-['Outfit']">Advanced AI Memory</h4>
          </div>
          <button
            onClick={toggleMemoryEnabled}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
              user.memoryEnabled
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'bg-white/5 text-slate-400'
            }`}
          >
            {user.memoryEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <p className="text-[11px] text-slate-300">
          Your AI friends recall these approved preferences across chats to personalize discussions.
        </p>

        {/* Memory List */}
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {memories.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs text-slate-200"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[9px] uppercase tracking-wide bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                  {m.category}
                </span>
                <span className="truncate">{m.content}</span>
              </div>
              <button
                onClick={() => removeMemory(m.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Memory row */}
        {showAddMem ? (
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex gap-2">
              <select
                value={memCategory}
                onChange={(e) => setMemCategory(e.target.value as any)}
                className="px-2 py-1 rounded-lg bg-[#14062a] text-xs text-white"
              >
                <option value="name">Name</option>
                <option value="hobby">Hobby</option>
                <option value="preference">Preference</option>
                <option value="interest">Interest</option>
                <option value="fact">Fact</option>
              </select>
              <input
                type="text"
                value={memContent}
                onChange={(e) => setMemContent(e.target.value)}
                placeholder="e.g. Loves stargazing on weekends"
                className="flex-1 px-2.5 py-1 rounded-lg bg-black/50 text-xs text-white border border-white/10 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddMem(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMemory}
                className="px-3 py-1 rounded-lg bg-purple-600 text-xs font-semibold text-white"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMem(true)}
            className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-purple-300 font-medium flex items-center justify-center gap-1 transition"
          >
            <Plus size={14} />
            <span>Add Custom Memory Fact</span>
          </button>
        )}
      </div>

      {/* Security & App Lock (STEP 31 & 48) */}
      <div className="glass-card rounded-3xl p-4 border border-rose-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400">
            <Shield size={18} />
            <h4 className="text-sm font-bold text-white font-['Outfit']">Security & App Lock</h4>
          </div>
          <span className="text-[10px] text-slate-400">
            {user.pinEnabled ? 'PIN Active' : 'Off'}
          </span>
        </div>

        <p className="text-[11px] text-slate-300">
          Lock LOVENTO AI with a 4-digit PIN code to keep your conversations completely private.
        </p>

        {user.pinEnabled ? (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Lock size={12} /> App Lock Protected
            </span>
            <button
              onClick={handleDisablePin}
              className="text-xs text-rose-400 hover:underline"
            >
              Disable PIN
            </button>
          </div>
        ) : (
          <div>
            {showPinSetup ? (
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <label className="block text-xs text-slate-300">Enter new 4-digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-center tracking-widest text-lg text-white focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPinSetup(false)}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePin}
                    disabled={newPin.length !== 4}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Set PIN
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowPinSetup(true)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-rose-300 font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Key size={14} />
                <span>Configure 4-Digit Security PIN</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Language Preferences */}
      <div className="glass-card rounded-3xl p-4 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-pink-400">
          <Globe size={18} />
          <div>
            <div className="text-xs font-bold text-white font-['Outfit']">Default Language</div>
            <div className="text-[10px] text-slate-400">Used for companions and responses</div>
          </div>
        </div>

        <select
          value={activeLanguage}
          onChange={(e) => setActiveLanguage(e.target.value as Language)}
          className="px-2.5 py-1.5 rounded-xl bg-[#14062a] border border-white/15 text-xs text-white focus:outline-none"
        >
          {['English', 'Hindi', 'Odia', 'Kalahandia Odia', 'Hinglish'].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Export Personal Data (STEP 6) */}
      <button
        onClick={exportPersonalData}
        className="w-full p-3.5 rounded-2xl glass-card hover:bg-white/10 border border-white/10 flex items-center justify-between transition text-xs font-semibold text-slate-200"
      >
        <div className="flex items-center gap-2 text-emerald-400">
          <Download size={16} />
          <span>Export All Personal Vault Data (JSON)</span>
        </div>
        <span className="text-[10px] text-slate-500">Full Backup</span>
      </button>

      {/* Admin Dashboard Access (STEP 45) */}
      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Developer & Admin Dashboard</span>
          <button
            onClick={() => setShowAdminPrompt(true)}
            className="text-[10px] text-purple-400 hover:underline"
          >
            Access Portal
          </button>
        </div>

        {showAdminPrompt && (
          <form onSubmit={handleAdminLogin} className="space-y-2 pt-1">
            <input
              type="password"
              placeholder="Enter secure admin access key"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none"
              autoFocus
            />
            {adminError && <div className="text-[10px] text-rose-400 font-medium">{adminError}</div>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAdminPrompt(false);
                  setAdminError('');
                  setAdminPass('');
                }}
                className="text-xs text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAuthenticating || !adminPass.trim()}
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition disabled:opacity-50"
              >
                {isAuthenticating ? 'Verifying...' : 'Authenticate'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Official Creator Credit & About */}
      <div
        onClick={() => setShowAboutModal(true)}
        className="p-4 rounded-3xl bg-gradient-to-tr from-pink-950/40 via-[#180629] to-purple-950/40 border border-pink-500/30 text-center cursor-pointer hover:border-pink-500/60 transition group"
      >
        <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold text-pink-300 font-['Outfit'] mb-1">
          <span>LOVENTO AI ❤️</span>
          <span className="text-[10px] text-slate-400 font-normal">&bull; v1.0 Production</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Created & Developed with heart by{' '}
          <span className="text-white font-bold group-hover:text-pink-300 transition">
            BENU RANA
          </span>
        </p>
        <p className="text-[9px] text-slate-500 mt-1">Tap to view official credits and philosophy</p>
      </div>

      {/* Logout & Delete Account */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={logoutUser}
          className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to completely delete your local account and all vault data?')) {
              deleteAccount();
            }
          }}
          className="flex-1 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition flex items-center justify-center gap-1.5"
        >
          <Trash2 size={14} />
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
};
