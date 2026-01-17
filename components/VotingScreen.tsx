import React, { useState } from 'react';
import { GameState, GamePhase, Player, Role, Alignment } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface VotingScreenProps {
    gameState: GameState;
    phase: GamePhase;
    onlineMyId?: string;
    onVoteSubmit: (votes: Record<string, boolean> | Record<string, 'SUCCESS' | 'FAIL'>) => void;
}

const VotingScreen: React.FC<VotingScreenProps> = ({ gameState, phase, onlineMyId, onVoteSubmit }) => {
    const { t } = useLanguage();

    // --- LOCAL STATE ---
    // For Sequential Voting (Mission Perform)
    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const [showPrompt, setShowPrompt] = useState(true);
    const [missionVotes, setMissionVotes] = useState<Record<string, 'SUCCESS' | 'FAIL'>>({});

    // For Bulk Voting (Team Approval)
    const [teamVotes, setTeamVotes] = useState<Record<string, boolean | null>>({});

    // --- COMPUTED ---
    const isMission = phase === GamePhase.VOTING_MISSION_PERFORM;
    const isTeamVote = phase === GamePhase.VOTING_TEAM;
    const isLocal = !onlineMyId;

    // Initialize team votes state if empty
    React.useEffect(() => {
        if (isTeamVote && isLocal && Object.keys(teamVotes).length === 0) {
            const initial: Record<string, boolean | null> = {};
            gameState.players.forEach(p => initial[p.id] = null); // null = no vote yet
            setTeamVotes(initial);
        }
    }, [isTeamVote, isLocal, gameState.players]);


    // --- 1. ONLINE MODE ---
    if (onlineMyId) {
        const hasVotedOnline = onlineMyId && gameState.teamVotes && gameState.teamVotes[onlineMyId] !== undefined;

        if (hasVotedOnline) {
            return (
                <div className="fixed inset-0 h-[100dvh] w-full flex flex-col items-center justify-center bg-background-dark p-6 text-center animate-fade-in z-50">
                    <div className="mb-6 w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-4xl text-white/40">hourglass_top</span>
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-white mb-2">{t('voting.waiting')}</h2>
                    <p className="text-white/60">Waiting for other players...</p>
                    <div className="mt-8 flex gap-1">
                        {gameState.players.map(p => (
                            <div key={p.id} className={`w-3 h-3 rounded-full ${gameState.teamVotes && gameState.teamVotes[p.id] !== undefined ? 'bg-primary' : 'bg-white/10'}`}></div>
                        ))}
                    </div>
                </div>
            );
        }

        // Online Voting Logic (Single Player)
        const currentVoter = gameState.players.find(p => p.id === onlineMyId);
        if (!currentVoter) return <div>Error: Player not found</div>;

        // Render Single Vote Card (Reused below)
        return renderSingleVoteCard(
            currentVoter,
            isMission,
            (val) => onVoteSubmit({ [onlineMyId]: val }),
            t,
            gameState
        );
    }

    // --- 2. LOCAL BULK VOTING (TEAM APPROVAL) ---
    if (isTeamVote && isLocal) {
        const handleTeamVoteToggle = (playerId: string, value: boolean) => {
            setTeamVotes(prev => ({ ...prev, [playerId]: value }));
        };

        const handleSubmitAll = () => {
            // Validate all voted
            const allVoted = gameState.players.every(p => teamVotes[p.id] !== null && teamVotes[p.id] !== undefined);
            if (!allVoted) return; // Should be disabled anyway

            // Convert state to clean record
            const finalVotes: Record<string, boolean> = {};
            gameState.players.forEach(p => {
                finalVotes[p.id] = teamVotes[p.id] === true;
            });
            onVoteSubmit(finalVotes);
        };

        const allVoted = gameState.players.every(p => teamVotes[p.id] !== null && teamVotes[p.id] !== undefined);

        return (
            <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-[#0f172a] animate-fade-in overflow-hidden z-20">
                <div className="p-4 border-b border-white/10 bg-[#0f172a] z-10 shadow-md">
                    <h2 className="text-xl font-bold text-white text-center uppercase tracking-wide flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-primary">how_to_vote</span>
                        {t('voting.title.council')}
                    </h2>
                    <p className="text-white/60 text-xs text-center mt-1 max-w-xs mx-auto">
                        {t('voting.subtitle.council')}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-32">
                    <div className="bg-white/5 rounded-lg p-3 mb-2 border border-blue-500/20">
                        <p className="text-white/80 text-sm text-center">
                            Proposed Team: <strong className="text-primary">{gameState.proposedTeam.map(id => gameState.players.find(p => p.id === id)?.name).join(", ")}</strong>
                        </p>
                    </div>

                    {gameState.players.map(p => {
                        const vote = teamVotes[p.id];
                        const isApprove = vote === true;
                        const isReject = vote === false;

                        return (
                            <div key={p.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center font-serif font-bold text-white/50 text-sm">
                                        {p.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-white font-bold text-sm w-24 truncate">{p.name}</span>
                                </div>

                                <div className="flex bg-black/40 rounded-lg p-1 gap-1">
                                    <button
                                        onClick={() => handleTeamVoteToggle(p.id, false)}
                                        className={`px-3 py-2 rounded-md transition-all flex items-center gap-1 ${isReject ? 'bg-red-900/80 text-red-200 shadow-sm' : 'text-white/30 hover:bg-white/5'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">cancel</span>
                                        {/* <span className="text-xs font-bold">Reject</span> */}
                                    </button>
                                    <button
                                        onClick={() => handleTeamVoteToggle(p.id, true)}
                                        className={`px-3 py-2 rounded-md transition-all flex items-center gap-1 ${isApprove ? 'bg-green-900/80 text-green-200 shadow-sm' : 'text-white/30 hover:bg-white/5'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        {/* <span className="text-xs font-bold">Approve</span> */}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent z-20">
                    <button
                        onClick={handleSubmitAll}
                        disabled={!allVoted}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${allVoted
                            ? 'bg-primary text-background-dark hover:bg-primary-dark cursor-pointer'
                            : 'bg-white/10 text-white/20 cursor-not-allowed'
                            }`}
                    >
                        {allVoted ? "Submit All Votes" : "Vote for All Players"}
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        );
    }

    // --- 3. LOCAL SEQUENTIAL VOTING (MISSION PERFORM) ---
    // (Existing Logic for Pass-to-Player)

    const playersToVote = gameState.players.filter(p => gameState.proposedTeam.includes(p.id));
    const currentVoter = playersToVote[currentVoterIndex]; // Use derived array

    // Safety check in case empty
    if (!currentVoter) return <div>Error: No voter found</div>;

    const handleNextSequential = (voteValue: any) => {
        const newVotes = { ...missionVotes, [currentVoter.id]: voteValue };
        setMissionVotes(newVotes);

        if (currentVoterIndex + 1 < playersToVote.length) {
            setCurrentVoterIndex(prev => prev + 1);
            setShowPrompt(true);
        } else {
            onVoteSubmit(newVotes);
        }
    };

    if (showPrompt) {
        return (
            <div className="fixed inset-0 h-[100dvh] w-full flex flex-col items-center justify-center bg-background-dark p-6 text-center animate-fade-in z-50">
                <div className="mb-6 w-20 h-20 rounded-full bg-white/10 border-2 border-primary/50 flex items-center justify-center animate-pulse">
                    <span className="material-symbols-outlined text-4xl text-primary">how_to_vote</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-white mb-2">{t('voting.next')}</h2>
                <p className="text-white/60 mb-8">{t('voting.pass')} <strong className="text-primary text-xl block mt-2">{currentVoter.name}</strong></p>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="w-full max-w-xs bg-primary hover:bg-primary-dark text-background-dark font-bold py-4 rounded-xl shadow-lg transition-all"
                >
                    {t('voting.iam')} {currentVoter.name}
                </button>
            </div>
        );
    }

    // Render Single Vote Card for Local Sequential
    return renderSingleVoteCard(
        currentVoter,
        true, // isMission is always true here because we filtered above
        handleNextSequential,
        t,
        gameState
    );
};

// --- HELPER COMPONENT FOR SINGLE VOTE ---
const renderSingleVoteCard = (currentVoter: Player, isMission: boolean, onVote: (val: any) => void, t: any, gameState: GameState) => {
    const isEvil = currentVoter.alignment === Alignment.EVIL;

    const theme = isMission ? {
        bg: 'bg-[#1a1810]',
        header: 'text-primary font-serif tracking-widest',
        title: t('voting.title.mission'),
        subtitle: t('voting.subtitle.mission'),
        accent: 'border-primary/20',
        icon: 'lock'
    } : {
        bg: 'bg-[#0f172a]',
        header: 'text-white font-sans tracking-wide',
        title: t('voting.title.council'),
        subtitle: t('voting.subtitle.council'),
        accent: 'border-blue-500/20',
        icon: 'groups'
    };

    return (
        <div className={`fixed inset-0 w-full h-[100dvh] flex flex-col ${theme.bg} p-6 animate-fade-in overflow-hidden z-20`}>
            <div className="absolute top-4 left-0 w-full flex justify-center opacity-20 pointer-events-none">
                <span className="material-symbols-outlined text-9xl">{theme.icon}</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative z-10">
                <div className={`flex flex-col items-center mb-8 pb-8 border-b ${theme.accent} w-full`}>
                    <h2 className={`text-3xl font-bold mb-2 uppercase text-center ${theme.header}`}>
                        {theme.title}
                    </h2>
                    <p className="text-white/60 text-sm text-center px-4 max-w-xs leading-relaxed">
                        {isMission
                            ? t('voting.secret')
                            : `${t('voting.proposal')} ${gameState.proposedTeam.map(id => gameState.players.find(p => p.id === id)?.name).join(", ")}`}
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full px-2">
                    <button
                        onClick={() => onVote(isMission ? 'SUCCESS' : true)}
                        className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a4a4a] to-[#0f2e2e] border border-[#2a6666] p-6 transition-all active:scale-[0.98] hover:shadow-[0_0_20px_rgba(42,102,102,0.4)]"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <span className="text-2xl font-serif font-bold text-[#4dbaba]">
                                {isMission ? t('voting.success') : t('voting.approve')}
                            </span>
                            <span className="material-symbols-outlined text-4xl text-[#4dbaba]">check_circle</span>
                        </div>
                    </button>

                    {(!isMission || isEvil) && (
                        <button
                            onClick={() => onVote(isMission ? 'FAIL' : false)}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#4a1a1a] to-[#2e0f0f] border border-[#662a2a] p-6 transition-all active:scale-[0.98] hover:shadow-[0_0_20px_rgba(102,42,42,0.4)]"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-2xl font-serif font-bold text-[#ba4d4d]">
                                    {isMission ? t('voting.fail') : t('voting.reject')}
                                </span>
                                <span className="material-symbols-outlined text-4xl text-[#ba4d4d]">cancel</span>
                            </div>
                        </button>
                    )}

                    {isMission && !isEvil && (
                        <div className="opacity-30 grayscale relative overflow-hidden rounded-xl bg-gradient-to-br from-[#4a1a1a] to-[#2e0f0f] border border-[#662a2a] p-6 cursor-not-allowed">
                            <div className="flex items-center justify-between relative z-10">
                                <span className="text-2xl font-serif font-bold text-[#ba4d4d]">{t('voting.fail')}</span>
                                <span className="material-symbols-outlined text-4xl text-[#ba4d4d]">cancel</span>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                <span className="text-xs font-bold uppercase tracking-widest text-white/80">{t('voting.fail.disabled')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VotingScreen;
