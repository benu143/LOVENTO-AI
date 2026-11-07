import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sendChatMessage, generateNeuralSpeech } from '../../services/api';

export const VoiceCallModal: React.FC = () => {
  const {
    isVoiceCallActive,
    setIsVoiceCallActive,
    activeCompanion,
    activePersonality,
    activeMood,
    activeLanguage,
    memories,
    addMessage,
    voiceSpeed,
    setVoiceSpeed,
    voiceVolume,
    setVoiceVolume,
  } = useApp();

  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'speaking' | 'listening'>('connecting');
  const [transcript, setTranscript] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState('');
  const [isAiTalking, setIsAiTalking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Call duration timer
  useEffect(() => {
    if (!isVoiceCallActive) {
      setCallDuration(0);
      return;
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isVoiceCallActive]);

  // Initial greeting upon call connect
  useEffect(() => {
    if (!isVoiceCallActive) return;

    setConnectionStatus('connecting');
    const connectTimer = setTimeout(() => {
      setConnectionStatus('speaking');
      const initialGreeting =
        activeCompanion.greeting[activeLanguage] || activeCompanion.greeting.English;
      setAiSpeechText(initialGreeting);
      playVoice(initialGreeting);
    }, 1200);

    return () => {
      clearTimeout(connectTimer);
      stopAudio();
      stopSpeechRecognition();
    };
  }, [isVoiceCallActive, activeCompanion, activeLanguage]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiTalking(false);
  };

  const playVoice = async (text: string) => {
    stopAudio();
    setIsAiTalking(true);
    setConnectionStatus('speaking');

    try {
      // Attempt neural TTS from backend with companion's voice
      const res = await generateNeuralSpeech(text, activeCompanion.voice);
      if (res.audioUrl && speakerEnabled) {
        const audio = new Audio(res.audioUrl);
        audio.playbackRate = voiceSpeed;
        audio.volume = voiceVolume;
        audioRef.current = audio;
        audio.onended = () => {
          setIsAiTalking(false);
          setConnectionStatus('listening');
          startSpeechRecognition();
        };
        audio.onerror = () => {
          fallbackBrowserSpeech(text);
        };
        await audio.play();
        return;
      }
    } catch (e) {
      // Fallback to Web Speech Synthesis
      fallbackBrowserSpeech(text);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (!('speechSynthesis' in window) || !speakerEnabled) {
      setIsAiTalking(false);
      setConnectionStatus('listening');
      startSpeechRecognition();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (activeLanguage === 'Hindi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => {
      setIsAiTalking(false);
      setConnectionStatus('listening');
      startSpeechRecognition();
    };
    utterance.onerror = () => {
      setIsAiTalking(false);
      setConnectionStatus('listening');
      startSpeechRecognition();
    };
    window.speechSynthesis.speak(utterance);
  };

  const startSpeechRecognition = () => {
    if (isMuted) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setTranscript('Speech recognition is not supported in this browser. You can speak freely.');
      return;
    }

    try {
      stopSpeechRecognition();
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      if (activeLanguage === 'Hindi') rec.lang = 'hi-IN';
      else rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        if (event.results[0].isFinal) {
          handleUserVoiceMessage(currentText);
        }
      };

      rec.onerror = () => {
        setConnectionStatus('listening');
      };

      rec.onend = () => {
        if (!isAiTalking && isVoiceCallActive) {
          setConnectionStatus('listening');
        }
      };

      rec.start();
      recognitionRef.current = rec;
      setConnectionStatus('listening');
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  const handleUserVoiceMessage = async (userText: string) => {
    if (!userText.trim()) return;
    stopSpeechRecognition();
    setConnectionStatus('connecting');

    // Add message to chat history
    addMessage({
      companionId: activeCompanion.id,
      sender: 'user',
      text: userText,
    });

    try {
      const res = await sendChatMessage({
        message: userText,
        companionName: activeCompanion.name,
        companionRole: activeCompanion.role,
        personality: activePersonality,
        mood: activeMood,
        language: activeLanguage,
        memories: memories.map((m) => ({ content: m.content })),
      });

      const reply = res.reply || 'I hear you completely!';
      setAiSpeechText(reply);

      // Add companion reply to chat history
      addMessage({
        companionId: activeCompanion.id,
        sender: 'companion',
        text: reply,
      });

      playVoice(reply);
    } catch (err: any) {
      const fallbackReply = "I'm with you! Could you say that once more?";
      setAiSpeechText(fallbackReply);
      playVoice(fallbackReply);
    }
  };

  const handleInterrupt = () => {
    stopAudio();
    setConnectionStatus('listening');
    startSpeechRecognition();
  };

  const handleEndCall = () => {
    stopAudio();
    stopSpeechRecognition();
    setIsVoiceCallActive(false);
  };

  if (!isVoiceCallActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#07010f] text-white flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/70 via-[#0a0217] to-[#04000a] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-600/20 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Bar: Connection status, voice identity & call duration */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
          <Radio
            size={14}
            className={`${
              connectionStatus === 'connected' || connectionStatus === 'speaking' || connectionStatus === 'listening'
                ? 'text-emerald-400 animate-pulse'
                : 'text-amber-400'
            }`}
          />
          <span className="capitalize font-medium text-slate-200">{connectionStatus}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const speeds = [0.8, 1.0, 1.2];
              const nextIdx = (speeds.indexOf(voiceSpeed) + 1) % speeds.length;
              setVoiceSpeed(speeds[nextIdx]);
            }}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-pink-300 border border-pink-500/30 transition"
            title="Cycle Voice Speed"
          >
            {voiceSpeed}x
          </button>

          <div className="px-3 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-xs font-semibold text-pink-300 font-['Outfit']">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>

      {/* Center AI Avatar & Voice Waves */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto flex flex-col items-center text-center">
        {/* Companion Avatar with Animated Ripple */}
        <div className="relative mb-6">
          {/* Animated concentric ripples when talking or listening */}
          {(connectionStatus === 'speaking' || connectionStatus === 'listening') && (
            <>
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-6 rounded-full bg-pink-500/20 blur-md pointer-events-none"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute -inset-10 rounded-full bg-purple-500/20 blur-lg pointer-events-none"
              />
            </>
          )}

          <div className="relative w-36 h-36 rounded-full p-1.5 bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 shadow-[0_0_40px_rgba(244,63,94,0.4)]">
            <img
              src={activeCompanion.avatar}
              alt={activeCompanion.name}
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
            <div className="absolute bottom-1 right-1 p-2 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 shadow-md">
              <Sparkles size={14} className="text-white" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold tracking-tight font-['Outfit'] text-white">
          {activeCompanion.name}
        </h2>
        <p className="text-xs text-pink-300/90 font-medium mb-4">{activeCompanion.role}</p>

        {/* Real-time Voice Waves Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-12 mb-4">
          {[...Array(9)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-1.5 rounded-full ${
                connectionStatus === 'speaking'
                  ? 'bg-gradient-to-t from-pink-500 to-rose-400'
                  : connectionStatus === 'listening'
                  ? 'bg-gradient-to-t from-purple-500 to-indigo-400'
                  : 'bg-slate-700'
              }`}
              animate={{
                height:
                  connectionStatus === 'speaking'
                    ? [8, 38 - (i % 4) * 6, 10, 42, 12]
                    : connectionStatus === 'listening'
                    ? [6, 20, 8, 24, 6]
                    : 6,
              }}
              transition={{
                duration: 0.6 + (i % 4) * 0.1,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.08,
              }}
            />
          ))}
        </div>

        {/* Live speech subtitles */}
        <div className="min-h-[50px] max-w-xs px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200">
          {isAiTalking ? (
            <p className="line-clamp-2 italic text-pink-200">"{aiSpeechText}"</p>
          ) : transcript ? (
            <p className="line-clamp-2 text-slate-300">You: "{transcript}"</p>
          ) : (
            <p className="text-slate-400 flex items-center justify-center gap-1.5">
              <span>Listening to you... speak freely</span>
            </p>
          )}
        </div>

        {/* Interrupt button if AI is speaking */}
        {isAiTalking && (
          <button
            onClick={handleInterrupt}
            className="mt-3 px-3 py-1 rounded-full bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-[11px] text-pink-300 font-medium flex items-center gap-1 transition"
          >
            <RotateCcw size={12} />
            <span>Interrupt / Speak Now</span>
          </button>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 w-full max-w-sm mx-auto pb-4">
        <div className="flex items-center justify-around px-4 py-3 rounded-3xl glass-card border border-pink-500/25 box-glow-pink">
          {/* Mute toggle */}
          <button
            onClick={() => {
              if (isMuted) {
                setIsMuted(false);
                startSpeechRecognition();
              } else {
                setIsMuted(true);
                stopSpeechRecognition();
              }
            }}
            className={`p-3.5 rounded-2xl transition ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-white/10 hover:bg-white/15 text-slate-200'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_25px_rgba(225,29,72,0.6)] active:scale-95 transition"
            title="End Call"
          >
            <PhoneOff size={26} />
          </button>

          {/* Speaker toggle */}
          <button
            onClick={() => {
              const nextVal = !speakerEnabled;
              setSpeakerEnabled(nextVal);
              if (!nextVal) stopAudio();
            }}
            className={`p-3.5 rounded-2xl transition ${
              !speakerEnabled
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-white/10 hover:bg-white/15 text-slate-200'
            }`}
            title={speakerEnabled ? 'Mute Speaker' : 'Enable Speaker'}
          >
            {speakerEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-500 mt-3">
          LOVENTO AI Real Voice Engine &bull; Created by BENU RANA
        </p>
      </div>
    </div>
  );
};
