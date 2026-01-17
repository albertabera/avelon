import React, { useState } from 'react';
import { GameState, Alignment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface GameSummaryScreenProps {
    gameState: GameState;
    onBack: () => void;
}

const GameSummaryScreen: React.FC<GameSummaryScreenProps> = ({ gameState, onBack }) => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<'missions' | 'lady'>('missions');

    const getPlayerName = (id: string) => gameState.players.find(p => p.id === id)?.name || id;

    const renderMissionTab = () => (
        <div className="space-y-6 pb-20">
            {[0, 1, 2, 3, 4].map(missionIndex => {
                const votesForMission = gameState.voteHistory.filter(v => v.missionIndex === missionIndex);
                const missionResult = gameState.missionHistory.find(m => m.missionIndex === missionIndex);

                if (votesForMission.length === 0) return null;

                return (
                    <div key={missionIndex} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                        <div className="bg-white/5 p-3 flex justify-between items-center">
                            <h3 className="font-serif font-bold text-white/90 uppercase tracking-wide">
                                {t('game.mission')} {missionIndex + 1}
                            </h3>
                            {missionResult && (
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${missionResult.outcome === 'SUCCESS' ? 'bg-primary/20 text-primary' : 'bg-evil-red/20 text-evil-red'}`}>
                                    {missionResult.outcome === 'SUCCESS' ? t('game.success') : t('game.fail')}
                                </span>
                            )}
                        </div>

                        <div className="p-3 space-y-3">
                            {votesForMission.map((vote, vIndex) => (
                                <div key={vIndex} className="relative pl-4 border-l-2 border-white/10">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-bold text-white/80">Proposal {vIndex + 1}</span>
                                        <span className={`text-[10px] uppercase font-bold ${vote.approved ? 'text-green-400' : 'text-red-400'}`}>
                                            {vote.approved ? t('game.approve') : t('game.reject')}
                                        </span>
                                    </div>

                                    {/* Team */}
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {vote.team.map(playerId => (
                                            <span key={playerId} className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] text-white/70">
                                                {getPlayerName(playerId)}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Individual Votes */}
                                    <div className="grid grid-cols-5 gap-1">
                                        {Object.entries(vote.votes).map(([pid, approved]) => (
                                            <div key={pid} className="flex flex-col items-center" title={getPlayerName(pid)}>
                                                <div className={`w-2 h-2 rounded-full ${approved ? 'bg-white' : 'bg-black border border-white/50'}`}></div>
                                                <span className="text-[8px] text-white/30 truncate w-full text-center">{getPlayerName(pid).substring(0, 3)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Mission Outcome Cards */}
                            {missionResult && (
                                <div className="mt-2 pt-2 border-t border-white/5">
                                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Played Cards</p>
                                    <div className="flex gap-2">
                                        {Array.from({ length: missionResult.successes }).map((_, i) => (
                                            <span key={`s-${i}`} className="material-symbols-outlined text-primary text-sm">shield</span>
                                        ))}
                                        {Array.from({ length: missionResult.fails }).map((_, i) => (
                                            <span key={`f-${i}`} className="material-symbols-outlined text-evil-red text-sm">swords</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderLadyTab = () => (
        <div className="space-y-4 pb-20">
            {gameState.ladyHistory.length === 0 ? (
                <p className="text-white/40 text-center text-sm py-10">No investigations yet.</p>
            ) : (
                gameState.ladyHistory.map((entry, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-black mb-1">
                                <img src={`https://picsum.photos/seed/${entry.holderId}/100/100`} className="w-full h-full object-cover opacity-80" />
                            </div>
                            <span className="text-[10px] font-bold text-white/60">{getPlayerName(entry.holderId)}</span>
                        </div>

                        <div className="flex-1 flex flex-col items-center gap-1">
                            <span className="material-symbols-outlined text-[#4ba3cc]">arrow_forward</span>
                            <span className="material-symbols-outlined text-xs text-white/40">visibility</span>
                        </div>

                        <div className="flex flex-col items-center relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-black mb-1">
                                <img src={`https://picsum.photos/seed/${entry.targetId}/100/100`} className="w-full h-full object-cover opacity-80" />
                            </div>
                            <span className="text-[10px] font-bold text-white/60">{getPlayerName(entry.targetId)}</span>

                            {entry.alignment === Alignment.GOOD ? (
                                <div className="absolute -top-1 -right-1 bg-primary text-background-dark rounded-full p-0.5 border border-background-dark">
                                    <span className="material-symbols-outlined text-[10px] block">shield</span>
                                </div>
                            ) : (
                                <div className="absolute -top-1 -right-1 bg-evil-red text-white rounded-full p-0.5 border border-background-dark">
                                    <span className="material-symbols-outlined text-[10px] block">swords</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-background-dark text-white overflow-hidden z-50 animate-fade-in">
            <header className="flex items-center p-4 border-b border-white/5 bg-background-dark/95 backdrop-blur">
                <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <h1 className="flex-1 text-center font-serif text-lg font-bold tracking-wide uppercase text-white/90">
                    {t('summary.title')}
                </h1>
                <div className="size-10"></div>
            </header>

            <div className="flex p-2 gap-2 border-b border-white/5 bg-surface-dark">
                <button
                    onClick={() => setTab('missions')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${tab === 'missions' ? 'bg-primary text-background-dark' : 'text-white/60 hover:bg-white/5'}`}
                >
                    {t('summary.missions')}
                </button>
                <button
                    onClick={() => setTab('lady')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${tab === 'lady' ? 'bg-[#4ba3cc] text-background-dark' : 'text-white/60 hover:bg-white/5'}`}
                >
                    {t('summary.bylady')}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 content-start">
                {tab === 'missions' ? renderMissionTab() : renderLadyTab()}
            </div>
        </div>
    );
};

export default GameSummaryScreen;
