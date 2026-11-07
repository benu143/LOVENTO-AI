import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  BookHeart,
  Quote,
  Sparkles,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
  Lock,
  Calendar,
  Share2,
  Download,
  FolderHeart,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fetchGameQuestion, fetchDailyInspiration } from '../../services/api';
import { DiaryEntry } from '../../types';

export const ExploreView: React.FC = () => {
  const {
    diaryEntries,
    addDiaryEntry,
    deleteDiaryEntry,
    savedImages,
    savedStories,
    exportPersonalData,
    activeLanguage,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'games' | 'diary' | 'vault'>('games');

  // 1. Games States
  const [gameType, setGameType] = useState<'riddle' | 'trivia' | 'would_you_rather' | 'emoji_guess'>('riddle');
  const [gameData, setGameData] = useState<any>(null);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(120);

  // 2. Diary States
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryMood, setDiaryMood] = useState('🌟 Grateful');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);

  // Load initial game question
  const loadNewGameQuestion = async (type = gameType) => {
    setIsGameLoading(true);
    setShowAnswer(false);
    setUserGuess('');
    try {
      const data = await fetchGameQuestion(type);
      setGameData(data);
    } catch (e) {
      setGameData({
        question: 'I speak without a mouth and hear without ears. What am I?',
        answer: 'An echo',
        hint: 'You hear me in deep canyons.',
      });
    } finally {
      setIsGameLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'games' && !gameData) {
      loadNewGameQuestion();
    }
  }, [activeSubTab]);

  const handleTriviaAnswer = (chosen: string) => {
    if (!gameData || showAnswer) return;
    setShowAnswer(true);
    if (chosen === gameData.answer) {
      setScore((prev) => prev + 25);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    }
  };

  const handleSaveDiary = () => {
    if (!diaryContent.trim()) return;
    addDiaryEntry({
      date: new Date().toISOString().split('T')[0],
      mood: diaryMood,
      title: diaryTitle.trim() || 'Daily Reflection',
      content: diaryContent.trim(),
      aiFeedback:
        'Your words radiate authenticity. Remember to be proud of your steps today! ❤️',
      isPrivate,
    });
    setDiaryTitle('');
    setDiaryContent('');
    setShowNewEntryForm(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] overflow-y-auto px-4 py-3 pb-24 max-w-md mx-auto select-none space-y-4">
      {/* Sub Tabs: Games | Diary | Vault */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
        <button
          onClick={() => setActiveSubTab('games')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'games'
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 size={15} />
          <span>AI Games</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diary')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'diary'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookHeart size={15} />
          <span>AI Diary</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vault')}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'vault'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderHeart size={15} />
          <span>AI Vault</span>
        </button>
      </div>

      {/* ---------------- 1. AI GAMES TAB ---------------- */}
      {activeSubTab === 'games' && (
        <div className="space-y-4">
          {/* Top Score & Game Selector */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card border border-pink-500/20 box-glow-pink">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                <Trophy size={18} />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Fun Points</div>
                <div className="text-sm font-extrabold text-white font-['Outfit']">{score} pts</div>
              </div>
            </div>

            <button
              onClick={() => loadNewGameQuestion(gameType)}
              disabled={isGameLoading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-pink-300 text-xs font-medium flex items-center gap-1 transition"
            >
              <RefreshCw size={13} className={isGameLoading ? 'animate-spin' : ''} />
              <span>Next Game</span>
            </button>
          </div>

          {/* Game Type Pills */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'riddle', label: 'Riddles' },
              { id: 'trivia', label: 'Quiz Battle' },
              { id: 'emoji_guess', label: 'Emoji Guess' },
              { id: 'would_you_rather', label: 'Would You Rather' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setGameType(tab.id as any);
                  loadNewGameQuestion(tab.id as any);
                }}
                className={`text-[10px] py-1.5 px-1 rounded-xl font-medium transition text-center truncate ${
                  gameType === tab.id
                    ? 'bg-pink-500 text-white shadow'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Game Card */}
          <div className="glass-card rounded-3xl p-5 border border-pink-500/30 min-h-[220px] flex flex-col justify-between">
            {isGameLoading ? (
              <div className="my-auto text-center py-8">
                <Sparkles size={24} className="animate-spin text-pink-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300">Generating AI challenge...</p>
              </div>
            ) : gameData ? (
              <div className="space-y-4">
                {/* Riddle */}
                {gameType === 'riddle' && (
                  <>
                    <div className="text-xs text-pink-400 font-bold uppercase tracking-wider">
                      AI Riddle Challenge
                    </div>
                    <p className="text-sm font-medium text-white leading-relaxed">
                      "{gameData.question}"
                    </p>
                    {gameData.hint && (
                      <p className="text-xs text-slate-400 italic">💡 Hint: {gameData.hint}</p>
                    )}

                    <div className="pt-2">
                      {showAnswer ? (
                        <div className="p-3 rounded-2xl bg-pink-500/20 border border-pink-500/40 text-xs text-pink-200">
                          <span className="font-bold">Answer: </span> {gameData.answer}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setShowAnswer(true);
                            setScore((s) => s + 10);
                          }}
                          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200"
                        >
                          Reveal Answer
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Trivia Quiz */}
                {gameType === 'trivia' && (
                  <>
                    <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                      General Knowledge Battle
                    </div>
                    <p className="text-sm font-medium text-white leading-relaxed">
                      {gameData.question}
                    </p>

                    <div className="space-y-2 pt-2">
                      {gameData.options?.map((opt: string, i: number) => {
                        const isCorrect = opt === gameData.answer;
                        return (
                          <button
                            key={i}
                            onClick={() => handleTriviaAnswer(opt)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition border ${
                              showAnswer
                                ? isCorrect
                                  ? 'bg-emerald-500/30 border-emerald-500 text-white'
                                  : 'bg-white/5 border-white/5 text-slate-400'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Emoji Guess */}
                {gameType === 'emoji_guess' && (
                  <>
                    <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                      Guess the Phrase / Movie
                    </div>
                    <div className="text-4xl text-center py-3">{gameData.emojis}</div>
                    <p className="text-xs text-slate-400 text-center">Category: {gameData.category}</p>

                    <div className="pt-2">
                      {showAnswer ? (
                        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-xs text-amber-200 text-center font-bold">
                          {gameData.answer}
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200"
                        >
                          Reveal Answer
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Would You Rather */}
                {gameType === 'would_you_rather' && (
                  <>
                    <div className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                      Would You Rather...
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <button
                        onClick={() => {
                          setScore((s) => s + 10);
                          confetti({ particleCount: 30, spread: 50 });
                        }}
                        className="p-4 rounded-2xl bg-white/5 hover:bg-pink-500/20 hover:border-pink-500/40 border border-white/10 text-xs text-slate-200 leading-relaxed text-center"
                      >
                        {gameData.optionA}
                      </button>
                      <button
                        onClick={() => {
                          setScore((s) => s + 10);
                          confetti({ particleCount: 30, spread: 50 });
                        }}
                        className="p-4 rounded-2xl bg-white/5 hover:bg-purple-500/20 hover:border-purple-500/40 border border-white/10 text-xs text-slate-200 leading-relaxed text-center"
                      >
                        {gameData.optionB}
                      </button>
                    </div>
                    {gameData.twist && (
                      <p className="text-[11px] text-slate-400 italic text-center">
                        Twist: {gameData.twist}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ---------------- 2. AI DIARY TAB ---------------- */}
      {activeSubTab === 'diary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-['Outfit']">
              Personal Reflection Diary
            </h3>
            <button
              onClick={() => setShowNewEntryForm(!showNewEntryForm)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-purple-500/25"
            >
              <Plus size={14} />
              <span>{showNewEntryForm ? 'Close Form' : 'New Entry'}</span>
            </button>
          </div>

          {/* New Entry Form */}
          {showNewEntryForm && (
            <div className="glass-card rounded-3xl p-4 border border-purple-500/30 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={diaryTitle}
                  onChange={(e) => setDiaryTitle(e.target.value)}
                  placeholder="Today's Thought..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mood Tag</label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {['🌟 Grateful', '😊 Joyful', '🌿 Calm', '🔥 Driven', '💭 Reflective', '🌧️ Sensitive'].map(
                    (m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDiaryMood(m)}
                        className={`text-[11px] px-2.5 py-1 rounded-xl transition ${
                          diaryMood === m
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Content</label>
                <textarea
                  value={diaryContent}
                  onChange={(e) => setDiaryContent(e.target.value)}
                  rows={4}
                  placeholder="Write freely. Your AI companion will give thoughtful encouragement..."
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded text-purple-500"
                  />
                  <span>Mark as Private Lock</span>
                </label>

                <button
                  onClick={handleSaveDiary}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-semibold shadow"
                >
                  Save Entry
                </button>
              </div>
            </div>
          )}

          {/* List of Entries */}
          <div className="space-y-3">
            {diaryEntries.map((entry) => (
              <div
                key={entry.id}
                className="glass-card rounded-2xl p-4 border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-['Outfit']">{entry.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                      {entry.mood}
                    </span>
                    <button
                      onClick={() => deleteDiaryEntry(entry.id)}
                      className="text-slate-500 hover:text-rose-400 transition"
                      title="Delete Entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>

                {entry.aiFeedback && (
                  <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-[11px] text-pink-200 italic">
                    AI Reflection: {entry.aiFeedback}
                  </div>
                )}

                <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>{entry.date}</span>
                  {entry.isPrivate && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Lock size={10} /> Private
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- 3. AI VAULT TAB ---------------- */}
      {activeSubTab === 'vault' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">LOVENTO AI Vault</h3>
              <p className="text-[10px] text-slate-400">Your secure creations and saved stories</p>
            </div>
            <button
              onClick={exportPersonalData}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition"
            >
              <Download size={13} />
              <span>Export All</span>
            </button>
          </div>

          {/* Generated Images Gallery */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Saved Images ({savedImages.length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {savedImages.map((img) => (
                <div key={img.id} className="relative rounded-2xl overflow-hidden border border-white/10 group">
                  <img src={img.imageUrl} alt={img.prompt} className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-between">
                    <p className="text-[10px] text-white line-clamp-2">"{img.prompt}"</p>
                    <a
                      href={img.imageUrl}
                      download={`art_${img.id}.png`}
                      className="self-end p-1.5 rounded-lg bg-pink-500 text-white"
                    >
                      <Download size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Stories */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Saved Stories ({savedStories.length})
            </h4>
            <div className="space-y-2">
              {savedStories.map((story) => (
                <div key={story.id} className="glass-card rounded-2xl p-3 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">{story.title}</span>
                    <span className="text-[10px] text-slate-400">{story.genre}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {story.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
