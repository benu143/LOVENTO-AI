export type Language = 'English' | 'Hindi' | 'Odia' | 'Kalahandia Odia' | 'Hinglish';

export type Personality =
  | 'Friendly'
  | 'Funny'
  | 'Smart'
  | 'Motivational'
  | 'Creative'
  | 'Helpful'
  | 'Calm'
  | 'Supportive';

export type Mood =
  | 'Happy'
  | 'Calm'
  | 'Funny'
  | 'Supportive'
  | 'Motivational'
  | 'Professional';

export interface AICompanion {
  id: string;
  name: string;
  gender: 'female' | 'male';
  role: string;
  bio: string;
  avatar: string; // URL or SVG identifier
  avatarBg: string;
  defaultPersonality: Personality;
  defaultMood: Mood;
  voice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon' | 'Aoede';
  speakingStyle: string;
  favoriteTopics: string[];
  greeting: Record<Language, string>;
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  companionId: string;
  sender: 'user' | 'companion';
  text: string;
  timestamp: string;
  imageUrl?: string;
  audioUrl?: string;
  reaction?: string;
  isStreaming?: boolean;
  groundingSources?: Array<{ title?: string; uri?: string }>;
}

export interface Conversation {
  id: string;
  companionId: string;
  title: string;
  lastMessage: string;
  lastTimestamp: string;
  isFavourite?: boolean;
  messages: ChatMessage[];
}

export interface UserMemory {
  id: string;
  category: 'name' | 'language' | 'hobby' | 'preference' | 'interest' | 'fact';
  content: string;
  createdAt: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  mood: string;
  title: string;
  content: string;
  aiFeedback?: string;
  isPrivate: boolean;
}

export interface GeneratedImageItem {
  id: string;
  prompt: string;
  imageUrl: string;
  aspectRatio: string;
  createdAt: string;
}

export interface SavedStory {
  id: string;
  title: string;
  genre: string;
  content: string;
  createdAt: string;
  language: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  preferredLanguage: Language;
  gender?: string;
  interests: string[];
  joinedDate: string;
  pinCode?: string; // For App Lock
  pinEnabled: boolean;
  theme: 'dark' | 'light';
  accentColor: string;
  fontScale: 'small' | 'normal' | 'large';
  soundEnabled: boolean;
  memoryEnabled: boolean;
}

export type ActiveTab = 'home' | 'friends' | 'tools' | 'explore' | 'profile';

export type ToolId =
  | 'chat'
  | 'voice_call'
  | 'image_gen'
  | 'photo_vision'
  | 'story_creator'
  | 'study_room'
  | 'creative_studio'
  | 'language_partner'
  | 'diary'
  | 'web_search'
  | 'vault'
  | 'games';
