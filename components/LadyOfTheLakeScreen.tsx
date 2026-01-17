import React, { useState } from 'react';
import { GameState, Player, Alignment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface LadyOfTheLakeScreenProps {
    gameState: GameState;
    onInvestigate: (targetId: string) => void;
}

const LadyOfTheLakeScreen: React.FC<LadyOfTheLakeScreenProps> = ({ gameState, onInvestigate }) => {
    const { t } = useLanguage();
    const [showIdentity, setShowIdentity] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [revealData, setRevealData] = useState<{ name: string, alignment: Alignment } | null>(null);

    const holder = gameState.players[gameState.ladyHolder];

    // Candidates: Anyone except self and previous lady holders
    // Rules check: Can you investigate someone who was already Lady? Yes.
    // Can you investigate someone who has been investigated? Yes.
    // Correction: "The Lady of the Lake token is passed to the player who was examind."
    // "The player who currently holds the token cannot be examined."
    // "A player who has previously held the token cannot be examined."

    const previousHoldersIds = gameState.ladyHistory.map(h => h.holderId);
    // Also exclude current holder obviously
    const invalidTargetIds = [...previousHoldersIds, holder.id];

    const candidates = gameState.players.filter(p => !invalidTargetIds.includes(p.id));

    const handleReveal = () => {
        if (!selectedTarget) return;
        const target = gameState.players.find(p => p.id === selectedTarget);
        if (target) {
            setRevealData({ name: target.name, alignment: target.alignment });
        }
    };

    const handleConfirm = () => {
        if (selectedTarget) {
            onInvestigate(selectedTarget);
        }
    };

    if (!showIdentity) {
        return (
            <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center p-6 text-center z-50 bg-background-dark animate-fade-in">
                <div className="mb-8 w-24 h-24 rounded-full bg-[#4ba3cc]/20 border-2 border-[#4ba3cc] flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-5xl text-[#4ba3cc]">water_drop</span>
                </div>
                <h1 className="text-3xl font-serif font-bold mb-4 text-[#4ba3cc]">{t('lady.title')}</h1>
                <p className="text-white/60 text-lg mb-8">{t('lady.pass')} <span className="text-white font-bold">{holder.name}</span></p>
                <button onClick={() => setShowIdentity(true)} className="w-full max-w-xs bg-[#4ba3cc] hover:bg-[#3d8eb3] text-background-dark font-serif font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(75,163,204,0.3)] transition-all">
                    {t('button.confirm')}
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-background-dark text-white overflow-hidden z-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-black pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center flex-1 p-6">
                <div className="w-12 h-12 rounded-full bg-[#4ba3cc]/20 border border-[#4ba3cc] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[#4ba3cc]">water_drop</span>
                </div>

                <h1 className="text-2xl font-serif font-bold text-[#4ba3cc] mb-2">{t('lady.title')}</h1>
                <p className="text-center text-white/70 text-sm mb-6 max-w-xs">
                    {t('lady.intro')}
                </p>

                {!revealData ? (
                    <div className="grid grid-cols-2 gap-3 w-full max-w-md overflow-y-auto pb-20">
                        {candidates.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedTarget(p.id)}
                                className={`relative flex flex-col items-center p-3 rounded-xl border transition-all ${selectedTarget === p.id
                                    ? 'bg-[#4ba3cc]/20 border-[#4ba3cc] shadow-[0_0_15px_rgba(75,163,204,0.2)]'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden mb-2 bg-black">
                                    <img src={`https://ui-avatars.com/api/?name=${p.name}&background=random`} className="w-full h-full object-cover opacity-80" />
                                </div>
                                <span className="text-xs font-bold tracking-wide">{p.name}</span>
                            </button>
                        ))}
                        {candidates.length === 0 && (
                            <div className="col-span-2 text-center text-white/40 italic text-sm py-4">
                                {t('lady.noTargets')}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full max-w-md bg-black/40 backdrop-blur-md rounded-2xl border border-[#4ba3cc]/30 p-8 shadow-2xl animate-scale-in">
                        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">{t('lady.alignment')} {revealData.name}</h3>

                        {revealData.alignment === Alignment.GOOD ? (
                            <div className="flex flex-col items-center text-primary animate-bounce-subtle">
                                <span className="material-symbols-outlined text-6xl mb-2">shield</span>
                                <span className="text-2xl font-serif font-black uppercase tracking-wide text-center">{t('lady.good')}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-evil-red animate-bounce-subtle">
                                <span className="material-symbols-outlined text-6xl mb-2">swords</span>
                                <span className="text-2xl font-serif font-black uppercase tracking-wide text-center">{t('lady.evil')}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="relative z-10 p-6 bg-background-dark/90 backdrop-blur border-t border-white/10">
                {!revealData ? (
                    <button
                        onClick={handleReveal}
                        disabled={!selectedTarget}
                        className={`w-full font-serif font-bold text-lg py-4 rounded-xl shadow-lg transition-all ${selectedTarget
                            ? 'bg-[#4ba3cc] hover:bg-[#3d8eb3] text-background-dark'
                            : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                    >
                        {t('lady.reveal')}
                    </button>
                ) : (
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-[#4ba3cc] hover:bg-[#3d8eb3] text-background-dark font-serif font-bold text-lg py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">check</span>
                        {t('lady.confirm')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default LadyOfTheLakeScreen;
