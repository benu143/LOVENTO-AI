import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  Palette,
  Camera,
  BookOpen,
  GraduationCap,
  Sparkles,
  Globe,
  Search,
  Volume2,
  ArrowLeft,
  Download,
  Copy,
  Check,
  RotateCcw,
  Upload,
  Play,
  Heart,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  generateAIImage,
  analyzePhoto,
  createAIStory,
  getStudyAssistance,
  runCreativeStudio,
  getLanguagePractice,
  searchWebGrounded,
  generateNeuralSpeech,
} from '../../services/api';
import { ToolId } from '../../types';

export const ToolsCenterView: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    addSavedImage,
    addSavedStory,
    activeLanguage,
  } = useApp();

  const [currentTool, setCurrentTool] = useState<ToolId | null>(activeTool || null);

  // 1. Image Gen States
  const [imgPrompt, setImgPrompt] = useState('A glowing cybernetic heart crystal floating inside an enchanted bioluminescent garden');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isImgLoading, setIsImgLoading] = useState(false);
  const [imgError, setImgError] = useState('');

  // 2. Vision States
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState('Explain this photo in detail, reading any text or diagrams.');
  const [visionResult, setVisionResult] = useState('');
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const visionFileRef = useRef<HTMLInputElement>(null);

  // 3. Story Creator States
  const [storyTopic, setStoryTopic] = useState('A traveler discovers an ancient AI sanctuary hidden in the Himalayan mist');
  const [storyGenre, setStoryGenre] = useState('Fantasy');
  const [storyLength, setStoryLength] = useState('Medium');
  const [storyResult, setStoryResult] = useState('');
  const [isStoryLoading, setIsStoryLoading] = useState(false);

  // 4. Study Room States
  const [studySubject, setStudySubject] = useState('Mathematics');
  const [studyTopic, setStudyTopic] = useState('Derivatives and Real-world Rates of Change');
  const [studyMode, setStudyMode] = useState('step-by-step');
  const [studyQuestion, setStudyQuestion] = useState('How do we find dy/dx when y = x^3 - 4x + 7? Explain each step.');
  const [studyResult, setStudyResult] = useState('');
  const [isStudyLoading, setIsStudyLoading] = useState(false);

  // 5. Creative Studio States
  const [creativeType, setCreativeType] = useState('youtube_seo');
  const [creativePrompt, setCreativePrompt] = useState('A deep dive into futuristic AI companions and conscious technology');
  const [creativeResult, setCreativeResult] = useState('');
  const [isCreativeLoading, setIsCreativeLoading] = useState(false);

  // 6. Language Partner States
  const [langSelection, setLangSelection] = useState<string>('Odia');
  const [langMode, setLangMode] = useState('conversation');
  const [langInput, setLangInput] = useState('ନମସ୍କାର, ଆଜି ମୁଁ ଓଡ଼ିଆ ଭାଷା ଶିଖିବାକୁ ଚାହୁଁଛି।');
  const [langResult, setLangResult] = useState('');
  const [isLangLoading, setIsLangLoading] = useState(false);

  // 7. Live Web Search States
  const [searchQuery, setSearchQuery] = useState('What are the latest breakthroughs in AI technology this week?');
  const [searchAnswer, setSearchAnswer] = useState('');
  const [searchSources, setSearchSources] = useState<any[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // 8. Neural Voice Studio States
  const [voiceText, setVoiceText] = useState('Welcome to LOVENTO AI, created by BENU RANA. Your AI Friends are always by your side.');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Image Gen Execute
  const handleGenerateImage = async () => {
    if (!imgPrompt.trim()) return;
    setIsImgLoading(true);
    setImgError('');
    try {
      const res = await generateAIImage(imgPrompt, aspectRatio);
      if (res.imageUrl) {
        setGeneratedImg(res.imageUrl);
        addSavedImage({
          id: 'img_' + Date.now(),
          prompt: imgPrompt,
          imageUrl: res.imageUrl,
          aspectRatio,
          createdAt: new Date().toLocaleDateString(),
        });
      }
    } catch (err: any) {
      setImgError(err.message || 'Image generation failed. Please verify API configuration.');
    } finally {
      setIsImgLoading(false);
    }
  };

  // Vision Execute
  const handleVisionAnalyze = async () => {
    if (!visionImage) return;
    setIsVisionLoading(true);
    try {
      const res = await analyzePhoto(visionImage, visionPrompt);
      setVisionResult(res.analysis || 'Analysis complete.');
    } catch (err: any) {
      setVisionResult(`Analysis error: ${err.message}`);
    } finally {
      setIsVisionLoading(false);
    }
  };

  // Story Execute
  const handleGenerateStory = async () => {
    if (!storyTopic.trim()) return;
    setIsStoryLoading(true);
    try {
      const res = await createAIStory({
        topic: storyTopic,
        genre: storyGenre,
        characters: 'Dynamic companions with heart',
        length: storyLength,
        language: activeLanguage,
      });
      setStoryResult(res.story || '');
      addSavedStory({
        id: 'story_' + Date.now(),
        title: storyTopic.slice(0, 40),
        genre: storyGenre,
        content: res.story || '',
        createdAt: new Date().toLocaleDateString(),
        language: activeLanguage,
      });
    } catch (err: any) {
      setStoryResult(`Story error: ${err.message}`);
    } finally {
      setIsStoryLoading(false);
    }
  };

  // Study Room Execute
  const handleStudyExecute = async () => {
    setIsStudyLoading(true);
    try {
      const res = await getStudyAssistance({
        subject: studySubject,
        topic: studyTopic,
        mode: studyMode,
        question: studyQuestion,
        language: activeLanguage,
      });
      setStudyResult(res.content || '');
    } catch (err: any) {
      setStudyResult(`Study error: ${err.message}`);
    } finally {
      setIsStudyLoading(false);
    }
  };

  // Creative Studio Execute
  const handleCreativeExecute = async () => {
    if (!creativePrompt.trim()) return;
    setIsCreativeLoading(true);
    try {
      const res = await runCreativeStudio(creativeType, creativePrompt, activeLanguage);
      setCreativeResult(res.result || '');
    } catch (err: any) {
      setCreativeResult(`Creative error: ${err.message}`);
    } finally {
      setIsCreativeLoading(false);
    }
  };

  // Language Partner Execute
  const handleLanguageExecute = async () => {
    setIsLangLoading(true);
    try {
      const res = await getLanguagePractice({
        language: langSelection,
        mode: langMode,
        text: langInput,
      });
      setLangResult(res.result || '');
    } catch (err: any) {
      setLangResult(`Language error: ${err.message}`);
    } finally {
      setIsLangLoading(false);
    }
  };

  // Live Search Execute
  const handleSearchExecute = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchLoading(true);
    try {
      const res = await searchWebGrounded(searchQuery);
      setSearchAnswer(res.answer || 'No search result.');
      const grounding = res.groundingMetadata;
      const chunks = grounding?.groundingChunks || [];
      const sources = chunks.map((c: any) => ({
        title: c.web?.title || 'Web Source',
        uri: c.web?.uri || '#',
      }));
      setSearchSources(sources);
    } catch (err: any) {
      setSearchAnswer(`Search error: ${err.message}`);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Neural Voice Preview Execute
  const handleVoicePlay = async () => {
    if (!voiceText.trim()) return;
    setIsVoiceLoading(true);
    try {
      const res = await generateNeuralSpeech(voiceText, selectedVoice);
      if (res.audioUrl) {
        setVoiceAudioUrl(res.audioUrl);
        const audio = new Audio(res.audioUrl);
        await audio.play();
      }
    } catch (err: any) {
      // Fallback to browser speech
      const utterance = new SpeechSynthesisUtterance(voiceText);
      window.speechSynthesis.speak(utterance);
    } finally {
      setIsVoiceLoading(false);
    }
  };

  const toolsList: Array<{
    id: ToolId;
    title: string;
    desc: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    bg: string;
  }> = [
    {
      id: 'image_gen',
      title: 'AI Image Generator',
      desc: 'Real text-to-image with customizable aspect ratios and gallery export',
      icon: Palette,
      color: 'text-pink-400',
      bg: 'from-pink-500/20 to-rose-500/20',
    },
    {
      id: 'photo_vision',
      title: 'Photo Understanding & Vision',
      desc: 'Analyze photos, handwriting, diagrams, and solve visual homework',
      icon: Camera,
      color: 'text-cyan-400',
      bg: 'from-cyan-500/20 to-blue-500/20',
    },
    {
      id: 'study_room',
      title: 'AI Study Room',
      desc: 'Step-by-step Math solver, flashcards, MCQ quizzes, and subject summaries',
      icon: GraduationCap,
      color: 'text-blue-400',
      bg: 'from-blue-500/20 to-indigo-500/20',
    },
    {
      id: 'story_creator',
      title: 'AI Story Creator',
      desc: 'Generate immersive stories across genres, rewrite, and save to vault',
      icon: BookOpen,
      color: 'text-purple-400',
      bg: 'from-purple-500/20 to-indigo-500/20',
    },
    {
      id: 'creative_studio',
      title: 'AI Creative Studio',
      desc: 'YouTube SEO tags, video scripts, Instagram captions, brand names, songs',
      icon: Sparkles,
      color: 'text-rose-400',
      bg: 'from-rose-500/20 to-pink-500/20',
    },
    {
      id: 'language_partner',
      title: 'AI Language Partner',
      desc: 'Master Odia, Kalahandia Odia, Hindi, Hinglish, & English grammar',
      icon: Globe,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/20 to-teal-500/20',
    },
    {
      id: 'web_search',
      title: 'Live Web Knowledge',
      desc: 'Real-time internet search grounded with live web citations & links',
      icon: Search,
      color: 'text-amber-400',
      bg: 'from-amber-500/20 to-orange-500/20',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] overflow-y-auto px-4 py-3 pb-24 max-w-md mx-auto select-none">
      {/* If a tool is currently open, show its dedicated interface */}
      {currentTool ? (
        <div className="space-y-4">
          {/* Back Header */}
          <div className="flex items-center justify-between pb-2 border-b border-pink-500/20">
            <button
              onClick={() => {
                setCurrentTool(null);
                setActiveTool(null);
              }}
              className="flex items-center gap-1.5 text-xs text-pink-400 hover:text-white font-semibold"
            >
              <ArrowLeft size={16} />
              <span>Back to AI Tools</span>
            </button>
            <span className="text-[10px] text-slate-400 font-medium font-['Outfit']">
              LOVENTO AI &bull; BENU RANA
            </span>
          </div>

          {/* 1. Image Generator Screen */}
          {currentTool === 'image_gen' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-5 border border-pink-500/30 box-glow-pink">
                <div className="flex items-center gap-2 mb-2 text-pink-400">
                  <Palette size={20} />
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    AI Text-to-Image Generator
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Powered by Gemini image generation. Create original artworks from text prompts.
                </p>

                <textarea
                  value={imgPrompt}
                  onChange={(e) => setImgPrompt(e.target.value)}
                  rows={3}
                  placeholder="Describe the image in detail..."
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />

                {/* Aspect Ratio Options */}
                <div className="flex items-center gap-2 mt-3 mb-4">
                  <span className="text-xs text-slate-300">Aspect Ratio:</span>
                  {['1:1', '4:3', '16:9', '9:16'].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                        aspectRatio === ratio
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateImage}
                  disabled={isImgLoading || !imgPrompt.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-500/30 hover:opacity-95 active:scale-98 transition disabled:opacity-50"
                >
                  <Sparkles size={16} className={isImgLoading ? 'animate-spin' : ''} />
                  <span>{isImgLoading ? 'Generating Art...' : 'Generate AI Image'}</span>
                </button>

                {imgError && (
                  <p className="mt-2 text-xs text-rose-400">{imgError}</p>
                )}
              </div>

              {/* Generated Image Result Card */}
              {generatedImg && (
                <div className="glass-card rounded-3xl p-4 border border-pink-500/30 space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-white/15">
                    <img
                      src={generatedImg}
                      alt="Generated result"
                      className="w-full object-cover max-h-80"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 italic truncate max-w-[200px]">
                      "{imgPrompt}"
                    </span>
                    <a
                      href={generatedImg}
                      download={`lovento_ai_${Date.now()}.png`}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-pink-300 flex items-center gap-1.5 transition"
                    >
                      <Download size={14} />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Photo Understanding / Vision */}
          {currentTool === 'photo_vision' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-5 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Camera size={20} />
                  <h3 className="text-base font-bold text-white font-['Outfit']">
                    Photo Understanding & Vision
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Upload any photo, homework problem, handwritten notes, or diagram to get structured explanations.
                </p>

                <input
                  type="file"
                  ref={visionFileRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onload = () => setVisionImage(r.result as string);
                      r.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />

                {visionImage ? (
                  <div className="relative mb-3 overflow-hidden rounded-2xl border border-white/20">
                    <img src={visionImage} alt="Uploaded" className="max-h-56 w-full object-cover" />
                    <button
                      onClick={() => setVisionImage(null)}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/70 text-xs text-rose-300"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => visionFileRef.current?.click()}
                    className="w-full py-8 rounded-2xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 flex flex-col items-center justify-center text-slate-400 hover:text-cyan-300 transition mb-3"
                  >
                    <Upload size={24} className="mb-1" />
                    <span className="text-xs font-medium">Click to upload photo or document</span>
                  </button>
                )}

                <input
                  type="text"
                  value={visionPrompt}
                  onChange={(e) => setVisionPrompt(e.target.value)}
                  placeholder="Ask a question about this image..."
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 mb-3"
                />

                <button
                  onClick={handleVisionAnalyze}
                  disabled={isVisionLoading || !visionImage}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:opacity-95 disabled:opacity-50 transition"
                >
                  <Sparkles size={16} className={isVisionLoading ? 'animate-spin' : ''} />
                  <span>{isVisionLoading ? 'Analyzing Image...' : 'Analyze with Gemini Vision'}</span>
                </button>
              </div>

              {visionResult && (
                <div className="glass-card rounded-3xl p-4 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 font-['Outfit']">Analysis Result</span>
                    <button
                      onClick={() => handleCopy(visionResult, 'vision')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'vision' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {visionResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Story Creator */}
          {currentTool === 'story_creator' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-5 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2 text-purple-400">
                  <BookOpen size={20} />
                  <h3 className="text-base font-bold text-white font-['Outfit']">AI Story Creator</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Story Topic</label>
                    <input
                      type="text"
                      value={storyTopic}
                      onChange={(e) => setStoryTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Genre</label>
                      <select
                        value={storyGenre}
                        onChange={(e) => setStoryGenre(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#170529] border border-white/15 text-xs text-white"
                      >
                        {['Fantasy', 'Mystery', 'Comedy', 'Adventure', 'Educational', 'Inspirational'].map(
                          (g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Length</label>
                      <select
                        value={storyLength}
                        onChange={(e) => setStoryLength(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#170529] border border-white/15 text-xs text-white"
                      >
                        {['Short', 'Medium', 'Epic Long'].map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateStory}
                  disabled={isStoryLoading || !storyTopic.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:opacity-95 disabled:opacity-50 transition"
                >
                  <Sparkles size={16} className={isStoryLoading ? 'animate-spin' : ''} />
                  <span>{isStoryLoading ? 'Writing Tale...' : 'Generate Original Story'}</span>
                </button>
              </div>

              {storyResult && (
                <div className="glass-card rounded-3xl p-4 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 font-['Outfit']">Your Story</span>
                    <button
                      onClick={() => handleCopy(storyResult, 'story')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'story' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {storyResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Study Room */}
          {currentTool === 'study_room' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-5 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <GraduationCap size={20} />
                  <h3 className="text-base font-bold text-white font-['Outfit']">AI Study Room</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                      <select
                        value={studySubject}
                        onChange={(e) => setStudySubject(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#14062a] border border-white/15 text-xs text-white"
                      >
                        {[
                          'Mathematics',
                          'Science',
                          'History',
                          'Geography',
                          'English',
                          'Computer Studies',
                          'General Knowledge',
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Study Mode</label>
                      <select
                        value={studyMode}
                        onChange={(e) => setStudyMode(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#14062a] border border-white/15 text-xs text-white"
                      >
                        <option value="step-by-step">Step-by-Step Solver</option>
                        <option value="explain">Concept Intuition</option>
                        <option value="quiz">5 MCQ Quiz & Key</option>
                        <option value="flashcards">Flashcard Deck</option>
                        <option value="summary">Revision Cheat Sheet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Topic / Chapter</label>
                    <input
                      type="text"
                      value={studyTopic}
                      onChange={(e) => setStudyTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Specific Question / Homework Problem
                    </label>
                    <textarea
                      value={studyQuestion}
                      onChange={(e) => setStudyQuestion(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleStudyExecute}
                  disabled={isStudyLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:opacity-95 disabled:opacity-50 transition"
                >
                  <Sparkles size={16} className={isStudyLoading ? 'animate-spin' : ''} />
                  <span>{isStudyLoading ? 'Solving & Teaching...' : 'Get Step-by-Step Solution'}</span>
                </button>
              </div>

              {studyResult && (
                <div className="glass-card rounded-3xl p-4 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 font-['Outfit']">Study Notes & Solution</span>
                    <button
                      onClick={() => handleCopy(studyResult, 'study')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'study' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {studyResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. Creative Studio */}
          {currentTool === 'creative_studio' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-5 border border-rose-500/30">
                <div className="flex items-center gap-2 mb-2 text-rose-400">
                  <Sparkles size={20} />
                  <h3 className="text-base font-bold text-white font-['Outfit']">AI Creative Studio</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Deliverable Type</label>
                    <select
                      value={creativeType}
                      onChange={(e) => setCreativeType(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl bg-[#14062a] border border-white/15 text-xs text-white"
                    >
                      <option value="youtube_seo">YouTube SEO & Title Generator</option>
                      <option value="video_script">Viral Short-form Video Script</option>
                      <option value="social_captions">Social Media Captions & Hashtags</option>
                      <option value="songwriting">Songwriting & Lyrics Generator</option>
                      <option value="brand_names">Brand Names & Tagline Brainstorm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Project Concept / Subject</label>
                    <textarea
                      value={creativePrompt}
                      onChange={(e) => setCreativePrompt(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreativeExecute}
                  disabled={isCreativeLoading || !creativePrompt.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 hover:opacity-95 disabled:opacity-50 transition"
                >
                  <Sparkles size={16} className={isCreativeLoading ? 'animate-spin' : ''} />
                  <span>{isCreativeLoading ? 'Creating Deliverables...' : 'Generate Creative Output'}</span>
                </button>
              </div>

              {creativeResult && (
                <div className="glass-card rounded-3xl p-4 border border-rose-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 font-['Outfit']">Deliverables</span>
                    <button
                      onClick={() => handleCopy(creativeResult, 'creative')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'creative' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {creativeResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. Language Partner */}
          {currentTool === 'language_partner' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-5 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2 text-emerald-400">
                  <Globe size={20} />
                  <h3 className="text-base font-bold text-white font-['Outfit']">AI Language Partner</h3>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Target Language</label>
                      <select
                        value={langSelection}
                        onChange={(e) => setLangSelection(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#14062a] border border-white/15 text-xs text-white"
                      >
                        <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                        <option value="Kalahandia Odia">Kalahandia Odia (କଳାହାଣ୍ଡିଆ)</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Hinglish">Hinglish</option>
                        <option value="English">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Practice Mode</label>
                      <select
                        value={langMode}
                        onChange={(e) => setLangMode(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#14062a] border border-white/15 text-xs text-white"
                      >
                        <option value="conversation">Bilingual Chat Practice</option>
                        <option value="correction">Sentence & Grammar Fix</option>
                        <option value="vocab">5 Daily Idioms & Vocab</option>
                        <option value="pronunciation">Pronunciation Master</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Your Sentence / Practice Prompt</label>
                    <textarea
                      value={langInput}
                      onChange={(e) => setLangInput(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLanguageExecute}
                  disabled={isLangLoading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:opacity-95 disabled:opacity-50 transition"
                >
                  <Sparkles size={16} className={isLangLoading ? 'animate-spin' : ''} />
                  <span>{isLangLoading ? 'Practicing Language...' : 'Start Practice'}</span>
                </button>
              </div>

              {langResult && (
                <div className="glass-card rounded-3xl p-4 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 font-['Outfit']">Language Coach Feedback</span>
                    <button
                      onClick={() => handleCopy(langResult, 'lang')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'lang' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {langResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. Live Web Search */}
          {currentTool === 'web_search' && (
            <div className="space-y-4">
              <div className="glass-card rounded-3xl p-5 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Search size={20} />
                  <h3 className="text-base font-bold text-white font-['Outfit']">Live Web Knowledge</h3>
                </div>
                <p className="text-xs text-slate-300 mb-3">
                  Grounded with live Google Search. Retrieves real-time events, news, and facts with source links.
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search live web..."
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSearchExecute}
                    disabled={isSearchLoading || !searchQuery.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Search size={14} />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {searchAnswer && (
                <div className="glass-card rounded-3xl p-4 border border-amber-500/30 space-y-3">
                  <div className="text-xs font-bold text-amber-300 font-['Outfit']">Grounded Answer</div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {searchAnswer}
                  </div>

                  {searchSources.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Verified Sources:</span>
                      <div className="space-y-1">
                        {searchSources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[11px] text-pink-400 hover:underline truncate"
                          >
                            <ExternalLink size={11} />
                            <span>{s.title || s.uri}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Full Grid Directory of AI Tools */
        <div className="space-y-4">
          <div className="rounded-3xl glass-card p-4 border border-pink-500/20 box-glow-pink">
            <h3 className="text-base font-extrabold text-white font-['Outfit'] flex items-center gap-2">
              <Wrench size={18} className="text-pink-400" />
              <span>LOVENTO AI Tools Hub</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Every tool is powered directly by full-stack Google Gemini APIs. Select a tool to launch.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className="rounded-3xl p-4 glass-card hover:bg-white/10 border border-white/10 hover:border-pink-500/40 cursor-pointer transition flex items-center justify-between group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${tool.bg} ${tool.color}`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-['Outfit'] group-hover:text-pink-300 transition">
                        {tool.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 max-w-[220px] line-clamp-1">
                        {tool.desc}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-full bg-white/5 group-hover:bg-pink-500/20 group-hover:text-pink-400 text-slate-500 transition">
                    <ArrowLeft size={14} className="rotate-180" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Creator Attribution Card */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <p className="text-[11px] text-slate-400">
              LOVENTO AI Suite &bull; Created & Developed by{' '}
              <span className="text-pink-400 font-semibold">BENU RANA</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
