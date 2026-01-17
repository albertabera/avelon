
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PlayerInputScreenProps {
  playerCount: number;
  onBack: () => void;
  onConfirm: (names: string[]) => void;
}

const PlayerInputScreen: React.FC<PlayerInputScreenProps> = ({ playerCount, onBack, onConfirm }) => {
  const { t } = useLanguage();
  const [names, setNames] = useState<string[]>(Array(playerCount).fill(''));

  const handleNameChange = (index: number, val: string) => {
    const next = [...names];
    next[index] = val;
    setNames(next);
  };

  const isComplete = names.every(n => n.trim().length > 0);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col max-w-md mx-auto bg-background-dark border-x border-[#333022] overflow-hidden z-20">
      <header className="relative z-10 flex-shrink-0 border-b border-white/10 bg-background-dark/95 backdrop-blur-md h-16 flex items-center px-4">
        <button onClick={onBack} className="flex items-center justify-center size-10 text-primary/80 hover:text-primary rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>
        <h2 className="text-primary text-xl font-bold tracking-tight text-center flex-1 font-news">
          {t('input.title')}
        </h2>
        <div className="size-10" />
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto pb-32 p-5">
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold leading-tight mb-2 drop-shadow-md font-serif">
            {t('input.subtitle')}
          </h1>
          <p className="text-white/60 text-base font-sans">{t('input.instruction')}</p>
        </div>

        <div className="space-y-5">
          {names.map((name, i) => (
            <div key={i} className="group relative flex items-end gap-3 animate-fade-in-up">
              <div className="flex flex-col items-center gap-1 mb-2">
                <div className={`w-10 h-12 border shield-clip flex items-center justify-center shadow-lg transition-colors ${name ? 'bg-primary/20 border-primary/40' : 'bg-surface-dark border-white/10'}`}>
                  <span className={`${name ? 'text-primary' : 'text-white/40'} font-bold text-sm font-serif`}>
                    {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i]}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <label className={`block text-xs uppercase tracking-widest font-sans font-bold mb-1.5 ml-1 ${name ? 'text-primary/80' : 'text-white/40'}`}>{t('input.player')} {i + 1}</label>
                <div className="relative flex items-center">
                  <input
                    className="w-full bg-surface-dark text-white border border-border-gold/50 rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner-dark placeholder-white/20 font-sans text-lg transition-all"
                    placeholder={t('input.placeholder')}
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                  />
                  <span className={`material-symbols-outlined absolute left-3.5 text-[20px] ${name ? 'text-primary/50' : 'text-white/20'}`}>person</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-12 pb-6 px-5">
        <button
          onClick={() => isComplete && onConfirm(names)}
          disabled={!isComplete}
          className={`group w-full relative overflow-hidden rounded-xl font-serif font-bold text-xl py-4 shadow-glow active:scale-[0.98] transition-all ${isComplete ? 'bg-primary text-background-dark' : 'bg-surface-dark text-white/20'}`}
        >
          <span className="relative z-20 flex items-center justify-center gap-3">
            {t('input.confirm')}
            <span className="material-symbols-outlined text-2xl font-bold">swords</span>
          </span>
        </button>
      </footer>
    </div>
  );
};
export default PlayerInputScreen;
