import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AICompanion,
  ChatMessage,
  Conversation,
  DiaryEntry,
  GeneratedImageItem,
  Language,
  Mood,
  Personality,
  SavedStory,
  ToolId,
  UserMemory,
  UserProfile,
} from '../types';
import { DEFAULT_COMPANIONS } from '../data/companions';

interface AppContextType {
  // Splash & Onboarding
  showSplash: boolean;
  setShowSplash: (val: boolean) => void;
  showWelcome: boolean;
  setShowWelcome: (val: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;

  // User Profile & Auth
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  isLoggedIn: boolean;
  loginUser: (email: string, username: string) => void;
  logoutUser: () => void;
  deleteAccount: () => void;
  exportPersonalData: () => void;

  // App Lock
  isAppLocked: boolean;
  setIsAppLocked: (val: boolean) => void;
  verifyPin: (pin: string) => boolean;
  setAppPin: (pin: string, enabled: boolean) => void;

  // Navigation
  activeTab: 'home' | 'friends' | 'tools' | 'explore' | 'profile';
  setActiveTab: (tab: 'home' | 'friends' | 'tools' | 'explore' | 'profile') => void;
  activeTool: ToolId | null;
  setActiveTool: (tool: ToolId | null) => void;

  // Companions
  companions: AICompanion[];
  activeCompanion: AICompanion;
  setActiveCompanion: (c: AICompanion) => void;
  activePersonality: Personality;
  setActivePersonality: (p: Personality) => void;
  activeMood: Mood;
  setActiveMood: (m: Mood) => void;
  activeLanguage: Language;
  setActiveLanguage: (l: Language) => void;
  updateCompanion: (id: string, updates: Partial<AICompanion>) => void;

  // Chat & History
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => ChatMessage;
  appendUserAndAssistantMessages: (
    userMsg: Omit<ChatMessage, 'id' | 'timestamp'>,
    assistantMsg?: Omit<ChatMessage, 'id' | 'timestamp'>
  ) => { userMessage: ChatMessage; assistantMessage: ChatMessage | null };
  updateLastMessage: (updater: (prev: ChatMessage) => ChatMessage) => void;
  deleteMessage: (id: string) => void;
  clearChatHistory: (companionId?: string) => void;
  addMessageReaction: (messageId: string, emoji: string) => void;

  // Voice Call & Neural Audio Settings
  isVoiceCallActive: boolean;
  setIsVoiceCallActive: (val: boolean) => void;
  voiceSpeed: number;
  setVoiceSpeed: (speed: number) => void;
  voiceVolume: number;
  setVoiceVolume: (volume: number) => void;

  // Memories
  memories: UserMemory[];
  addMemory: (category: UserMemory['category'], content: string) => void;
  removeMemory: (id: string) => void;
  clearMemories: () => void;
  toggleMemoryEnabled: () => void;

  // Diary
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  deleteDiaryEntry: (id: string) => void;

  // Vault & Saved Media
  savedImages: GeneratedImageItem[];
  addSavedImage: (img: GeneratedImageItem) => void;
  deleteSavedImage: (id: string) => void;
  savedStories: SavedStory[];
  addSavedStory: (story: SavedStory) => void;
  deleteSavedStory: (id: string) => void;

  // Modals & Extras
  showAboutModal: boolean;
  setShowAboutModal: (val: boolean) => void;
  showAdminModal: boolean;
  setShowAdminModal: (val: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  restoreFromBackup: (backupData: any) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_PREFIX = 'lovento_ai_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Splash & Onboarding
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}welcomed`) !== 'true';
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}reduced_motion`) === 'true';
  });

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 'usr_guest_' + Math.random().toString(36).substring(2, 7),
      username: 'Lovely Soul',
      email: 'user@lovento.ai',
      bio: 'Exploring the cosmos of friendship with LOVENTO AI ❤️',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      preferredLanguage: 'English',
      gender: 'Prefer not to say',
      interests: ['AI & Tech', 'Creative Writing', 'Philosophy', 'Good Vibes'],
      joinedDate: 'November 2026',
      pinCode: '',
      pinEnabled: false,
      theme: 'dark',
      accentColor: '#ec4899',
      fontScale: 'normal',
      soundEnabled: true,
      memoryEnabled: true,
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}is_logged_in`) === 'true';
  });

  // App Lock
  const [isAppLocked, setIsAppLocked] = useState(() => {
    return user.pinEnabled && Boolean(user.pinCode);
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'friends' | 'tools' | 'explore' | 'profile'>('home');
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  // Companions
  const [companions, setCompanions] = useState<AICompanion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}companions`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_COMPANIONS;
  });

  // Neural Voice Settings
  const [voiceSpeed, setVoiceSpeed] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}voice_speed`);
    return saved ? Number(saved) : 1.0;
  });
  const [voiceVolume, setVoiceVolume] = useState<number>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}voice_volume`);
    return saved ? Number(saved) : 1.0;
  });

  // Admin session token
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem(`${STORAGE_KEY_PREFIX}admin_token`);
  });

  const [activeCompanion, setActiveCompanionState] = useState<AICompanion>(() => {
    return companions[0] || DEFAULT_COMPANIONS[0];
  });

  const [activePersonality, setActivePersonality] = useState<Personality>(activeCompanion.defaultPersonality);
  const [activeMood, setActiveMood] = useState<Mood>(activeCompanion.defaultMood);
  const [activeLanguage, setActiveLanguage] = useState<Language>(user.preferredLanguage || 'English');

  // Sync personality/mood and conversation when companion switches
  const setActiveCompanion = (c: AICompanion) => {
    setActiveCompanionState(c);
    setActivePersonality(c.defaultPersonality);
    setActiveMood(c.defaultMood);
    setActiveConversationId(`conv_${c.id}`);

    // Ensure a conversation exists for the newly selected companion
    setConversations((prev) => {
      const exists = prev.some((conv) => conv.companionId === c.id);
      if (!exists) {
        const greetingText = c.greeting[activeLanguage] || c.greeting.English;
        const newConv: Conversation = {
          id: `conv_${c.id}`,
          companionId: c.id,
          title: `Chat with ${c.name}`,
          lastMessage: greetingText,
          lastTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFavourite: false,
          messages: [
            {
              id: `msg_init_${c.id}`,
              companionId: c.id,
              sender: 'companion',
              text: greetingText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        };
        return [...prev, newConv];
      }
      return prev;
    });
  };

  // Chat & History - Pre-populate all companion conversations if empty
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}conversations`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }

    // Initialize clean conversation for every companion
    return DEFAULT_COMPANIONS.map((comp) => ({
      id: `conv_${comp.id}`,
      companionId: comp.id,
      title: `Chat with ${comp.name}`,
      lastMessage: comp.greeting.English,
      lastTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFavourite: comp.id === 'aria',
      messages: [
        {
          id: `msg_init_${comp.id}`,
          companionId: comp.id,
          sender: 'companion' as const,
          text: comp.greeting.English,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return `conv_${activeCompanion.id}`;
  });

  // Always resolve active conversation to the currently active companion
  const activeConversation =
    conversations.find((c) => c.companionId === activeCompanion.id) ||
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0];
  const messages = activeConversation?.messages || [];

  // Voice Call Modal
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);

  // Memories
  const [memories, setMemories] = useState<UserMemory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}memories`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'm1', category: 'name', content: 'Prefers to be called by their unique name with warmth', createdAt: '2026-11-01' },
      { id: 'm2', category: 'hobby', content: 'Loves discovering beautiful stories and thoughtful conversations', createdAt: '2026-11-02' },
      { id: 'm3', category: 'preference', content: 'Enjoys positive, encouraging, and witty banter', createdAt: '2026-11-03' },
    ];
  });

  // Diary
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}diary`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'entry_1',
        date: new Date().toISOString().split('T')[0],
        mood: '🌟 Grateful',
        title: 'A New Journey with LOVENTO AI',
        content:
          'Today I began exploring LOVENTO AI, created by BENU RANA. The warmth of the AI companions and the stunning design immediately brought a smile to my face.',
        aiFeedback: 'What a beautiful beginning! Cherish this new curiosity and heartfelt momentum.',
        isPrivate: false,
      },
    ];
  });

  // Saved Media
  const [savedImages, setSavedImages] = useState<GeneratedImageItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}images`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'img_sample_1',
        prompt: 'A glowing neon heart floating over futuristic crystal city in deep purple twilight',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        aspectRatio: '1:1',
        createdAt: new Date().toLocaleDateString(),
      },
    ];
  });

  const [savedStories, setSavedStories] = useState<SavedStory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stories`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'story_sample_1',
        title: 'The Whisper of the Silicon Star',
        genre: 'Fantasy',
        content:
          'Deep in the digital nebula, an echo woke up. It felt the gentle heartbeat of friendship and decided to travel across light years just to say: you are never alone.',
        createdAt: new Date().toLocaleDateString(),
        language: 'English',
      },
    ];
  });

  // Admin & About
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Persistence helpers
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}is_logged_in`, isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}companions`, JSON.stringify(companions));
  }, [companions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}conversations`, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}memories`, JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}diary`, JSON.stringify(diaryEntries));
  }, [diaryEntries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}images`, JSON.stringify(savedImages));
  }, [savedImages]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}stories`, JSON.stringify(savedStories));
  }, [savedStories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}reduced_motion`, reducedMotion ? 'true' : 'false');
  }, [reducedMotion]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}voice_speed`, voiceSpeed.toString());
  }, [voiceSpeed]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}voice_volume`, voiceVolume.toString());
  }, [voiceVolume]);

  useEffect(() => {
    if (adminToken) {
      sessionStorage.setItem(`${STORAGE_KEY_PREFIX}admin_token`, adminToken);
    } else {
      sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}admin_token`);
    }
  }, [adminToken]);

  // Actions
  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const loginUser = (email: string, username: string) => {
    updateUser({ email, username });
    setIsLoggedIn(true);
    setShowWelcome(false);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}welcomed`, 'true');
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
  };

  const deleteAccount = () => {
    localStorage.clear();
    window.location.reload();
  };

  const exportPersonalData = () => {
    const exportData = {
      user,
      memories,
      diaryEntries,
      conversations,
      savedStories,
      savedImages,
      exportedAt: new Date().toISOString(),
      branding: 'LOVENTO AI ❤️ - Created & Developed by BENU RANA',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lovento_ai_personal_vault_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const verifyPin = (pin: string) => {
    if (user.pinCode === pin) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const setAppPin = (pin: string, enabled: boolean) => {
    updateUser({ pinCode: pin, pinEnabled: enabled });
  };

  const updateCompanion = (id: string, updates: Partial<AICompanion>) => {
    setCompanions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    if (activeCompanion.id === id) {
      setActiveCompanionState((prev) => ({ ...prev, ...updates }));
    }
  };

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp,
    };

    setConversations((prev) => {
      const companionId = msg.companionId || activeCompanion.id;
      const targetConv = prev.find((c) => c.companionId === companionId);
      if (!targetConv) {
        const comp = companions.find((c) => c.id === companionId) || activeCompanion;
        const newConv: Conversation = {
          id: `conv_${comp.id}`,
          companionId: comp.id,
          title: `Chat with ${comp.name}`,
          lastMessage: msg.text || (msg.imageUrl ? '📷 Photo' : ''),
          lastTimestamp: timestamp,
          messages: [newMessage],
        };
        return [...prev, newConv];
      }

      return prev.map((c) => {
        if (c.companionId === companionId || c.id === targetConv.id) {
          return {
            ...c,
            lastMessage: msg.text || (msg.imageUrl ? '📷 Photo' : c.lastMessage),
            lastTimestamp: timestamp,
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      });
    });

    return newMessage;
  };

  const appendUserAndAssistantMessages = (
    userMsg: Omit<ChatMessage, 'id' | 'timestamp'>,
    assistantMsg?: Omit<ChatMessage, 'id' | 'timestamp'>
  ) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const createdUserMessage: ChatMessage = {
      ...userMsg,
      id: 'msg_u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp,
    };

    const createdAssistantMessage: ChatMessage | null = assistantMsg
      ? {
          ...assistantMsg,
          id: 'msg_a_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          timestamp,
        }
      : null;

    const companionId = userMsg.companionId || activeCompanion.id;

    setConversations((prev) => {
      const targetConv = prev.find((c) => c.companionId === companionId);
      const toAdd = createdAssistantMessage
        ? [createdUserMessage, createdAssistantMessage]
        : [createdUserMessage];

      if (!targetConv) {
        const comp = companions.find((c) => c.id === companionId) || activeCompanion;
        const newConv: Conversation = {
          id: `conv_${comp.id}`,
          companionId: comp.id,
          title: `Chat with ${comp.name}`,
          lastMessage: createdAssistantMessage?.text || createdUserMessage.text || 'Message',
          lastTimestamp: timestamp,
          messages: toAdd,
        };
        return [...prev, newConv];
      }

      return prev.map((c) => {
        if (c.companionId === companionId || c.id === targetConv.id) {
          return {
            ...c,
            lastMessage: createdAssistantMessage?.text || createdUserMessage.text || c.lastMessage,
            lastTimestamp: timestamp,
            messages: [...c.messages, ...toAdd],
          };
        }
        return c;
      });
    });

    return { userMessage: createdUserMessage, assistantMessage: createdAssistantMessage };
  };

  const updateLastMessage = (updater: (prev: ChatMessage) => ChatMessage) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.companionId === activeCompanion.id && c.messages.length > 0) {
          const updatedMessages = [...c.messages];
          const lastIdx = updatedMessages.length - 1;
          updatedMessages[lastIdx] = updater(updatedMessages[lastIdx]);
          return {
            ...c,
            lastMessage: updatedMessages[lastIdx].text,
            messages: updatedMessages,
          };
        }
        return c;
      })
    );
  };

  const deleteMessage = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        messages: c.messages.filter((m) => m.id !== id),
      }))
    );
  };

  const clearChatHistory = (companionId?: string) => {
    const targetId = companionId || activeCompanion.id;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.companionId === targetId) {
          return {
            ...c,
            lastMessage: 'Conversation reset.',
            messages: [],
          };
        }
        return c;
      })
    );
  };

  const addMessageReaction = (messageId: string, emoji: string) => {
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        messages: c.messages.map((m) => (m.id === messageId ? { ...m, reaction: emoji } : m)),
      }))
    );
  };

  const addMemory = (category: UserMemory['category'], content: string) => {
    const newMem: UserMemory = {
      id: 'mem_' + Date.now(),
      category,
      content,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  const removeMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const clearMemories = () => {
    setMemories([]);
  };

  const toggleMemoryEnabled = () => {
    updateUser({ memoryEnabled: !user.memoryEnabled });
  };

  const addDiaryEntry = (entry: Omit<DiaryEntry, 'id'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: 'diary_' + Date.now(),
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);
  };

  const deleteDiaryEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((d) => d.id !== id));
  };

  const addSavedImage = (img: GeneratedImageItem) => {
    setSavedImages((prev) => [img, ...prev]);
  };

  const deleteSavedImage = (id: string) => {
    setSavedImages((prev) => prev.filter((i) => i.id !== id));
  };

  const addSavedStory = (story: SavedStory) => {
    setSavedStories((prev) => [story, ...prev]);
  };

  const deleteSavedStory = (id: string) => {
    setSavedStories((prev) => prev.filter((s) => s.id !== id));
  };

  const restoreFromBackup = (backupData: any) => {
    try {
      if (backupData.user) setUser(backupData.user);
      if (backupData.memories) setMemories(backupData.memories);
      if (backupData.diaryEntries) setDiaryEntries(backupData.diaryEntries);
      if (backupData.conversations) setConversations(backupData.conversations);
      if (backupData.savedStories) setSavedStories(backupData.savedStories);
      if (backupData.savedImages) setSavedImages(backupData.savedImages);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        showSplash,
        setShowSplash,
        showWelcome,
        setShowWelcome,
        reducedMotion,
        setReducedMotion,
        user,
        updateUser,
        isLoggedIn,
        loginUser,
        logoutUser,
        deleteAccount,
        exportPersonalData,
        isAppLocked,
        setIsAppLocked,
        verifyPin,
        setAppPin,
        activeTab,
        setActiveTab,
        activeTool,
        setActiveTool,
        companions,
        activeCompanion,
        setActiveCompanion,
        activePersonality,
        setActivePersonality,
        activeMood,
        setActiveMood,
        activeLanguage,
        setActiveLanguage,
        updateCompanion,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        addMessage,
        appendUserAndAssistantMessages,
        updateLastMessage,
        deleteMessage,
        clearChatHistory,
        addMessageReaction,
        isVoiceCallActive,
        setIsVoiceCallActive,
        voiceSpeed,
        setVoiceSpeed,
        voiceVolume,
        setVoiceVolume,
        memories,
        addMemory,
        removeMemory,
        clearMemories,
        toggleMemoryEnabled,
        diaryEntries,
        addDiaryEntry,
        deleteDiaryEntry,
        savedImages,
        addSavedImage,
        deleteSavedImage,
        savedStories,
        addSavedStory,
        deleteSavedStory,
        showAboutModal,
        setShowAboutModal,
        showAdminModal,
        setShowAdminModal,
        isAdmin,
        setIsAdmin,
        adminToken,
        setAdminToken,
        restoreFromBackup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
