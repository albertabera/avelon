import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GameState, Role, Alignment } from '../types';
import { ROLE_DEFINITIONS } from '../constants';

interface AssassinScreenProps {
    gameState: GameState;
    onAssassinate: (targetId: string) => void;
}

const AssassinScreen: React.FC<AssassinScreenProps> = ({ gameState, onAssassinate }) => {
    const { t } = useLanguage();
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

    // Filter for players who are aligned with Good
    const targets = gameState.players.filter(p => p.alignment === Alignment.GOOD);

    return (
        <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-[#1a0f0f] text-white overflow-hidden animate-fade-in z-50">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-blue-900/10 pointer-events-none"></div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center px-6 pt-10 pb-32 relative z-10 w-full">
                <div className="w-16 h-16 rounded-full bg-evil-red/20 border-2 border-evil-red flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,50,50,0.3)] shrink-0">
                    <span className="material-symbols-outlined text-3xl text-evil-red">gps_fixed</span>
                </div>

                <h1 className="text-3xl font-serif font-black text-evil-red uppercase tracking-widest mb-2 text-center drop-shadow-lg shrink-0">{t('assassin.title')}</h1>
                <p className="text-center text-white/70 text-sm mb-8 leading-relaxed max-w-xs shrink-0">
                    {t('assassin.desc')}
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                    {targets.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedTarget(p.id)}
                            className={`relative flex flex-col items-center p-4 rounded-xl border transition-all active:scale-95 ${selectedTarget === p.id
                                ? 'bg-evil-red/20 border-evil-red shadow-[0_0_20px_rgba(255,0,0,0.3)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden mb-2 bg-black">
                                <img src={`https://picsum.photos/seed/${p.id}/100/100`} className="w-full h-full object-cover opacity-80" />
                            </div>
                            <span className="text-sm font-bold tracking-wide">{p.name}</span>
                            {selectedTarget === p.id && (
                                <div className="absolute -top-2 -right-2 bg-evil-red text-white rounded-full p-1 shadow-lg">
                                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-[#1a0f0f]/90 backdrop-blur-xl pt-4 pb-8 px-6 border-t border-white/10 z-50">
                <div className="w-full max-w-md mx-auto">
                    <button
                        onClick={() => selectedTarget && onAssassinate(selectedTarget)}
                        disabled={!selectedTarget}
                        className={`w-full font-serif font-bold text-lg py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${selectedTarget
                            ? 'bg-evil-red hover:bg-red-600 text-white shadow-red-900/50 active:scale-95'
                            : 'bg-white/10 text-white/20 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined">skull</span>
                        {t('assassin.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssassinScreen;
