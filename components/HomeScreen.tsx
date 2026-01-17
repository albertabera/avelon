import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeScreenProps {
  onSelectMode: () => void;
  onOpenPremium: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOnlineMode: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectMode, onOpenPremium, onOpenSettings, onOpenRules, onOnlineMode }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col pt-4 pb-6 px-6 bg-[#0a0a0a] overflow-hidden font-sans z-50">

      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-red-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 w-full flex items-center justify-between mb-8">
        <button onClick={onOpenSettings} className="p-2 text-white/50 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-3xl">settings</span>
        </button>

        <div className="flex flex-col items-center">
          <span className="text-white text-xl font-serif font-black tracking-widest uppercase">Secret Protocol</span>
        </div>

        <button onClick={onOpenPremium} className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/50 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          <span className="material-symbols-outlined text-xl">encrypted</span>
        </button>
      </div>

      {/* Main Title Area */}
      <div className="relative z-10 flex flex-col items-center mb-10 text-center animate-fade-in-down">
        <h1 className="text-4xl font-bold text-white tracking-tight uppercase leading-none">
          {t('home.choose')}
        </h1>
        <h1 className="text-4xl font-bold text-blue-500 tracking-tight uppercase leading-none mb-2 drop-shadow-lg">
          {t('home.destiny')}
        </h1>
        <p className="text-white/40 text-sm font-mono tracking-wide">{t('home.subtitle')}</p>
      </div>

      {/* Cards Container */}
      <div className="relative z-10 flex-1 w-full flex flex-col gap-4 overflow-y-auto no-scrollbar">

        {/* Single Mode Card - Now the ONLY option */}
        <button
          onClick={onSelectMode}
          className="relative w-full h-48 rounded-2xl overflow-hidden group border border-blue-500/30 hover:border-blue-500/80 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] text-left"
        >
          {/* Card BG */}
          <div className="absolute inset-0 bg-[url('/assets/mode_offline.png')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent"></div>

          <div className="absolute inset-0 p-6 flex flex-col justify-center items-start relative z-10">
            <div className="flex items-center gap-2 mb-3 bg-blue-500/20 px-3 py-1 rounded text-blue-400 backdrop-blur-sm border border-blue-500/10">
              <span className="material-symbols-outlined text-base">security</span>
              <span className="text-xs font-bold tracking-wider uppercase">Local Protocol</span>
            </div>

            <h2 className="text-3xl font-bold text-white uppercase mb-2 drop-shadow-md">{t('home.local')}</h2>
            <p className="text-white/70 text-sm font-mono max-w-[240px] leading-relaxed">{t('home.offline.desc')}</p>

            <div className="mt-4 flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest group-hover:text-blue-300 transition-colors">
              <span>Initiate</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </button>

      </div>

      <div className="relative z-10 w-full flex gap-4 mt-6">
        <button onClick={onOpenRules} className="w-full bg-[#252422] hover:bg-[#2d2c2a] border border-white/5 rounded-xl h-12 flex items-center justify-center gap-2 transition-all group">
          <span className="material-symbols-outlined text-white/40 group-hover:text-white transition-colors text-lg">menu_book</span>
          <span className="text-white/80 group-hover:text-white transition-colors font-bold text-sm uppercase">{t('home.rules')}</span>
        </button>
      </div>

      <div className="relative z-10 w-full text-center mt-4">
        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">{t('game.version')}</p>
      </div>

    </div>
  );
};

export default HomeScreen;
