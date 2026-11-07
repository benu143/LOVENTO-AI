import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  PhoneCall,
  Sparkles,
  Volume2,
  Copy,
  Trash2,
  RotateCcw,
  Smile,
  X,
  Sliders,
  Check,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  sendChatMessage,
  streamChatMessage,
  generateNeuralSpeech,
} from '../../services/api';
import { Mood, Personality } from '../../types';

export const ChatView: React.FC = () => {
  const {
    activeCompanion,
    activePersonality,
    setActivePersonality,
    activeMood,
    setActiveMood,
    activeLanguage,
    memories,
    messages,
    addMessage,
    appendUserAndAssistantMessages,
    updateLastMessage,
    deleteMessage,
    clearChatHistory,
    addMessageReaction,
    setIsVoiceCallActive,
    voiceSpeed,
    setVoiceSpeed,
    voiceVolume,
    setVoiceVolume,
  } = useApp();

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Keep input box above Android keyboard when it opens/closes
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const keyboardHeight = window.innerHeight - vv.height;
      setIsKeyboardOpen(keyboardHeight > 100);
      scrollToBottom();
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, []);

  // Multiline expandable input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  // Handle image attachment
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice dictation to text input
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      if (activeLanguage === 'Hindi') rec.lang = 'hi-IN';
      else rec.lang = 'en-US';

      rec.onstart = () => setIsRecording(true);
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${text}` : text));
        setIsRecording(false);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      setIsRecording(false);
    }
  };

  // Stop current generation
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    updateLastMessage((prev) => ({
      ...prev,
      isStreaming: false,
    }));
  };

  // Send message handler with streaming & atomic state update
  const handleSend = async () => {
    const textToSend = input.trim();
    const imageToSend = selectedImage;

    if ((!textToSend && !imageToSend) || isGenerating) return;

    // 1. Atomically append User message and Assistant streaming placeholder into state
    appendUserAndAssistantMessages(
      {
        companionId: activeCompanion.id,
        sender: 'user',
        text: textToSend,
        imageUrl: imageToSend || undefined,
      },
      {
        companionId: activeCompanion.id,
        sender: 'companion',
        text: '',
        isStreaming: true,
      }
    );

    // 2. Clear user input fields safely only after message is registered
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setSelectedImage(null);
    setShowEmojiPicker(false);
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Build history context from current conversation
      const historyContext = messages.slice(-10).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

      // Stream response chunk by chunk with low latency
      let accumulatedText = '';
      await streamChatMessage(
        {
          message: textToSend,
          image: imageToSend || undefined,
          history: historyContext,
          companionName: activeCompanion.name,
          companionRole: activeCompanion.role,
          personality: activePersonality,
          mood: activeMood,
          language: activeLanguage,
          memories: memories.map((m) => ({ content: m.content })),
        },
        (chunk) => {
          accumulatedText += chunk;
          updateLastMessage((prev) => ({
            ...prev,
            text: accumulatedText,
            isStreaming: true,
          }));
        },
        () => {
          setIsGenerating(false);
          abortControllerRef.current = null;
          updateLastMessage((prev) => ({
            ...prev,
            text: accumulatedText || "I'm with you! What else is on your mind?",
            isStreaming: false,
          }));
        },
        (err) => {
          console.warn('Streaming fallback triggered:', err);
          // Fallback to non-streaming request
          sendChatMessage({
            message: textToSend,
            image: imageToSend || undefined,
            history: historyContext,
            companionName: activeCompanion.name,
            companionRole: activeCompanion.role,
            personality: activePersonality,
            mood: activeMood,
            language: activeLanguage,
            memories: memories.map((m) => ({ content: m.content })),
          })
            .then((res) => {
              updateLastMessage((prev) => ({
                ...prev,
                text: res.reply || "I'm here for you! Could you try sending that once more?",
                isStreaming: false,
              }));
            })
            .catch(() => {
              updateLastMessage((prev) => ({
                ...prev,
                text: "I'm having a little trouble connecting right now, but I'm right here with you. Please try again in a moment! ❤️",
                isStreaming: false,
              }));
            })
            .finally(() => {
              setIsGenerating(false);
              abortControllerRef.current = null;
            });
        },
        abortController.signal
      );
    } catch (err: any) {
      setIsGenerating(false);
      abortControllerRef.current = null;
      updateLastMessage((prev) => ({
        ...prev,
        text: "I'm right here with you! Let's try again in a second.",
        isStreaming: false,
      }));
    }
  };

  // Play natural neural audio for a specific message
  const handlePlayVoice = async (messageId: string, text: string) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(messageId);

    try {
      const res = await generateNeuralSpeech(text, activeCompanion.voice);
      if (res.audioUrl) {
        const audio = new Audio(res.audioUrl);
        audio.playbackRate = voiceSpeed;
        audio.volume = voiceVolume;
        currentAudioRef.current = audio;
        audio.onended = () => setPlayingAudioId(null);
        audio.onerror = () => fallbackPlaySpeech(text, messageId);
        await audio.play();
        return;
      }
    } catch (e) {
      fallbackPlaySpeech(text, messageId);
    }
  };

  const fallbackPlaySpeech = (text: string, messageId: string) => {
    if (!('speechSynthesis' in window)) {
      setPlayingAudioId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    if (activeLanguage === 'Hindi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';
    utterance.onend = () => setPlayingAudioId(null);
    utterance.onerror = () => setPlayingAudioId(null);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRegenerate = async (lastUserText: string) => {
    if (!lastUserText || isGenerating) return;
    setInput(lastUserText);
  };

  const personalities: Personality[] = [
    'Friendly',
    'Funny',
    'Smart',
    'Motivational',
    'Creative',
    'Helpful',
    'Calm',
    'Supportive',
  ];

  const moods: Mood[] = [
    'Happy',
    'Calm',
    'Funny',
    'Supportive',
    'Motivational',
    'Professional',
  ];

  const quickEmojis = ['❤️', '😂', '🔥', '✨', '🙏', '🌸', '💡', '🤗'];

  return (
    <div className="flex flex-col h-[calc(100dvh-102px)] max-w-md mx-auto relative select-none">
      {/* Top Companion Bar */}
      <div className="px-4 py-2 bg-[#120524]/90 border-b border-pink-500/20 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={activeCompanion.avatar}
              alt={activeCompanion.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-pink-500/40"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#120524]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-white font-['Outfit']">
                {activeCompanion.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-medium">
                AI Companion
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <button
                onClick={() => setShowPersonalityModal(true)}
                className="hover:text-pink-300 flex items-center gap-0.5 underline decoration-pink-500/40"
              >
                <span>{activePersonality}</span>
                <ChevronDown size={10} />
              </button>
              <span>&bull;</span>
              <button
                onClick={() => setShowMoodModal(true)}
                className="hover:text-purple-300 flex items-center gap-0.5 underline decoration-purple-500/40"
              >
                <span>{activeMood}</span>
                <ChevronDown size={10} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions: Voice Speed, Voice Call button & Clear */}
        <div className="flex items-center gap-1.5">
          {/* Quick voice speed toggle */}
          <button
            onClick={() => {
              const speeds = [0.8, 1.0, 1.2];
              const nextIdx = (speeds.indexOf(voiceSpeed) + 1) % speeds.length;
              setVoiceSpeed(speeds[nextIdx]);
            }}
            className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-bold text-pink-300 border border-pink-500/20 transition"
            title="Cycle Voice Speed (0.8x / 1.0x / 1.2x)"
          >
            {voiceSpeed}x
          </button>

          <button
            onClick={() => setIsVoiceCallActive(true)}
            className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20 hover:opacity-95 active:scale-95 transition"
            title="Start Dedicated Voice Call"
          >
            <PhoneCall size={16} />
          </button>
          <button
            onClick={() => clearChatHistory()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 min-h-0">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-none shadow-[0_4px_15px_rgba(236,72,153,0.25)]'
                    : 'glass-card border border-pink-500/20 text-slate-100 rounded-bl-none shadow-md'
                }`}
              >
                {/* Uploaded Image Preview if present */}
                {msg.imageUrl && (
                  <div className="mb-2.5 overflow-hidden rounded-xl border border-white/15">
                    <img
                      src={msg.imageUrl}
                      alt="Uploaded preview"
                      className="max-h-56 w-full object-cover"
                    />
                  </div>
                )}

                {/* Message Text with cursor when streaming */}
                <p className="whitespace-pre-wrap break-words">
                  {msg.text || (msg.isStreaming ? '' : '...')}
                  {msg.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-pink-400 animate-pulse align-middle" />
                  )}
                </p>

                {/* Bottom metadata & buttons */}
                <div className="flex items-center justify-between gap-3 mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span>{msg.timestamp}</span>
                    {isUser && <CheckCheck size={12} className="text-pink-300" />}
                  </div>

                  {!isUser && !msg.isStreaming && msg.text && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePlayVoice(msg.id, msg.text)}
                        className={`p-1 rounded hover:bg-white/10 transition ${
                          playingAudioId === msg.id ? 'text-pink-400 animate-pulse' : 'text-slate-400'
                        }`}
                        title="Listen to Voice"
                      >
                        <Volume2 size={13} />
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 transition"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-rose-400 transition"
                        title="Delete message"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Reaction badge if user reacted */}
                {msg.reaction && (
                  <div className="mt-1 -mb-1 flex">
                    <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs border border-white/20">
                      {msg.reaction}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Reactions toolbar for AI replies */}
              {!isUser && !msg.isStreaming && (
                <div className="flex items-center gap-1 mt-1 pl-1">
                  {['❤️', '😂', '💡', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addMessageReaction(msg.id, emoji)}
                      className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 hover:bg-white/15 hover:scale-110 transition border border-white/5 text-slate-300"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 text-xs text-pink-300 backdrop-blur-md max-w-fit shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="animate-spin text-pink-400" />
              <span>{activeCompanion.name} is replying...</span>
            </div>
            <button
              onClick={handleStopGenerating}
              className="ml-3 px-2 py-0.5 rounded-lg bg-rose-500/25 hover:bg-rose-500/40 text-[10px] text-rose-200 border border-rose-400/30 font-semibold transition"
            >
              Stop
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area Container */}
      <div
        className={`w-full flex-shrink-0 z-20 transition-all duration-200 px-3 pt-1.5 ${
          isKeyboardOpen ? 'pb-2' : 'pb-16 sm:pb-[72px]'
        }`}
      >
        {/* Selected Image Thumbnail preview */}
        {selectedImage && (
          <div className="relative mb-2 p-2 rounded-2xl bg-[#1d0638]/95 border border-pink-500/40 shadow-lg flex items-center justify-between backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-pink-500/50 shadow-sm">
                <img
                  src={selectedImage}
                  alt="To upload"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs text-pink-300 font-semibold block">Photo Attached</span>
                <span className="text-[10px] text-slate-400">Gemini Vision will analyze this photo</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 transition"
              title="Remove photo"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Quick Emoji Picker Row */}
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2.5 mb-2 rounded-2xl bg-gradient-to-r from-[#1c0738]/95 via-[#290a4e]/95 to-[#1c0738]/95 border border-pink-500/30 backdrop-blur-2xl shadow-xl overflow-x-auto scrollbar-none"
          >
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setInput((prev) => prev + emoji);
                  if (textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
                className="text-lg p-2 rounded-xl hover:bg-white/15 hover:scale-125 transition flex-shrink-0"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}

        {/* Large Premium Dark Purple Glassmorphism Input Box */}
        <div className="relative rounded-3xl p-2 sm:p-2.5 bg-gradient-to-br from-[#1d063a]/95 via-[#290a4e]/95 to-[#180430]/98 backdrop-blur-2xl border-2 border-pink-500/50 hover:border-pink-500/70 focus-within:border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.35),inset_0_1px_2px_rgba(255,255,255,0.15)] focus-within:shadow-[0_0_35px_rgba(244,63,94,0.6),inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-300">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <div className="flex items-end gap-1.5 sm:gap-2">
            {/* Left Action Buttons: Attachment & Emoji */}
            <div className="flex items-center gap-0.5 sm:gap-1 pb-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-2xl bg-white/5 hover:bg-pink-500/20 text-slate-300 hover:text-pink-300 active:scale-95 transition flex items-center justify-center border border-white/5 hover:border-pink-500/30"
                title="Upload photo / diagram for vision"
              >
                <ImageIcon size={20} />
              </button>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 sm:p-2.5 rounded-2xl transition flex items-center justify-center border active:scale-95 ${
                  showEmojiPicker
                    ? 'bg-pink-500/30 text-pink-300 border-pink-500/60 shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                    : 'bg-white/5 hover:bg-pink-500/20 text-slate-300 hover:text-pink-300 border-white/5 hover:border-pink-500/30'
                }`}
                title="Select Emoji"
              >
                <Smile size={20} />
              </button>
            </div>

            {/* Multiline Expandable Textarea with Increased Text Size */}
            <div className="flex-1 min-w-0 py-0.5">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onFocus={() => {
                  setTimeout(scrollToBottom, 250);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message ${activeCompanion.name}...`}
                rows={1}
                className="w-full bg-transparent text-sm sm:text-base font-normal leading-relaxed text-white placeholder:text-pink-200/40 focus:outline-none resize-none px-2 py-1.5 min-h-[42px] max-h-36 overflow-y-auto"
              />
            </div>

            {/* Right Action Buttons: Mic & Large Send Button */}
            <div className="flex items-center gap-1 sm:gap-1.5 pb-1">
              {/* Voice Dictation Mic Button */}
              <button
                onClick={toggleSpeechRecognition}
                className={`p-2 sm:p-2.5 rounded-2xl transition flex items-center justify-center border active:scale-95 ${
                  isRecording
                    ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-pulse'
                    : 'bg-white/5 hover:bg-pink-500/20 text-slate-300 hover:text-pink-300 border-white/5 hover:border-pink-500/30'
                }`}
                title={isRecording ? 'Listening... Tap to stop' : 'Voice Input (Speech-to-Text)'}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Large Premium Gradient Send Button */}
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isGenerating}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  (input.trim() || selectedImage) && !isGenerating
                    ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.55)] hover:shadow-[0_0_30px_rgba(244,63,94,0.75)] hover:scale-105 active:scale-95'
                    : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed opacity-40'
                }`}
                title="Send Message"
              >
                <Send size={19} className="text-white ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personality Selector Modal */}
      <AnimatePresence>
        {showPersonalityModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs glass-card rounded-3xl p-5 border border-pink-500/30 box-glow-pink"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-['Outfit'] text-white">Select AI Personality</h3>
                <button
                  onClick={() => setShowPersonalityModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mb-3">
                Directly transforms how {activeCompanion.name} thinks and responds.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {personalities.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setActivePersonality(p);
                      setShowPersonalityModal(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-left transition ${
                      activePersonality === p
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mood Selector Modal */}
      <AnimatePresence>
        {showMoodModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs glass-card rounded-3xl p-5 border border-purple-500/30 box-glow-purple"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold font-['Outfit'] text-white">Select AI Mood</h3>
                <button
                  onClick={() => setShowMoodModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 mb-3">
                Changes the emotional tone and warmth of {activeCompanion.name}.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {moods.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setActiveMood(m);
                      setShowMoodModal(false);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-left transition ${
                      activeMood === m
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
