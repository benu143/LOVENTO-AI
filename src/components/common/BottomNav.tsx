import React from 'react';
import { Home, Users, Wrench, Compass, User, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setActiveTool } = useApp();

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'tools', label: 'AI Tools', icon: Wrench },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    // Reset any isolated full-screen sub-tool overlay when tapping bottom nav
    setActiveTool(null);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto glass-nav pb-safe border-t border-pink-500/20">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-pink-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1.5 w-8 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-[0_0_10px_#ec4899]" />
              )}
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-pink-500/15 text-pink-400 box-glow-pink scale-105' : ''
                }`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
