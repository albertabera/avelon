import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface StatsScreenProps {
    onBack: () => void;
}

interface GameStats {
    totalGames: number;
    goodWins: number;
    evilWins: number;
    merlinWins: number; // For future tracking
    assassinWins: number; // For future tracking
}

const StatsScreen: React.FC<StatsScreenProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [stats, setStats] = useState<GameStats>({ totalGames: 0, goodWins: 0, evilWins: 0, merlinWins: 0, assassinWins: 0 });

    useEffect(() => {
        const savedStats = localStorage.getItem('avalon_stats');
        if (savedStats) {
            setStats(JSON.parse(savedStats));
        }
    }, []);

    const winRate = stats.totalGames > 0 ? Math.round((stats.goodWins / stats.totalGames) * 100) : 0;

    return (
        <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-[#1a1810] text-white">
            {/* Header */}
            <div className="relative pt-12 pb-6 flex items-center justify-center px-4">
                <button
                    onClick={onBack}
                    className="absolute left-6 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-white/80">arrow_back</span>
                </button>
                <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-[#f4d125]">{t('home.stats')}</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20">

                {/* Main Stat Card */}
                <div className="w-full bg-gradient-to-br from-[#2a6666]/20 to-[#1a2e35]/40 border border-[#2a6666]/30 rounded-2xl p-6 mb-4 flex flex-col items-center text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#4dbaba] mb-1">Win Rate (Good)</span>
                    <div className="text-6xl font-black text-white font-serif mb-2">{winRate}%</div>
                    <div className="text-white/40 text-xs">{stats.totalGames} Games Played</div>
                </div>

                {/* Good vs Evil Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex flex-col items-center">
                        <span className="material-symbols-outlined text-blue-400 mb-2">shield</span>
                        <span className="text-2xl font-bold text-white">{stats.goodWins}</span>
                        <span className="text-[10px] uppercase font-bold text-blue-400/60">Good Wins</span>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center">
                        <span className="material-symbols-outlined text-red-500 mb-2">skull</span>
                        <span className="text-2xl font-bold text-white">{stats.evilWins}</span>
                        <span className="text-[10px] uppercase font-bold text-red-500/60">Evil Wins</span>
                    </div>
                </div>

                {/* Empty State / Coming Soon */}
                {stats.totalGames === 0 && (
                    <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <span className="material-symbols-outlined text-white/20 text-4xl mb-4">history_edu</span>
                        <p className="text-white/40 text-sm">Play a game to start tracking your legend.</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StatsScreen;
