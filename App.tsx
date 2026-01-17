import React, { useState } from 'react';
import { GamePhase, GameState, Player, Role, Alignment, Mission, VoteResult, MissionResult } from './types';
import { ROLE_DEFINITIONS, MISSION_MAP, ALIGNMENT_DISTRIBUTION } from './constants';
import HomeScreen from './components/HomeScreen';
import SetupScreen from './components/SetupScreen';
import PlayerInputScreen from './components/PlayerInputScreen';
import RoleRevealScreen from './components/RoleRevealScreen';
import Dashboard from './components/Dashboard';
import PremiumScreen from './components/PremiumScreen';
import VotingScreen from './components/VotingScreen';
import AssassinScreen from './components/AssassinScreen';
import SettingsScreen from './components/SettingsScreen';
import LadyOfTheLakeScreen from './components/LadyOfTheLakeScreen';
import GameSummaryScreen from './components/GameSummaryScreen';
import RulesScreen from './components/RulesScreen';
import StatsScreen from './components/StatsScreen';
import { useLanguage, LanguageProvider } from './contexts/LanguageContext';

type View = 'HOME' | 'SETUP' | 'ROLE_REVEAL' | 'DASHBOARD' | 'VOTING' | 'ASSASSIN' | 'END_GAME' | 'LADY_OF_LAKE' | 'SUMMARY' | 'RULES' | 'STATS' | 'PREMIUM' | 'SETTINGS';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [playerCount, setPlayerCount] = useState(5);
  const [useLady, setUseLady] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([Role.MERLIN, Role.ASSASSIN]);

  // Check Premium Status
  React.useEffect(() => {
    // 1. Check URL for Stripe success callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setIsPremium(true);
      localStorage.setItem('avalon_is_premium', 'true');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      alert("Purchase Successful! Premium Unlocked.");
      return;
    }

    // 2. Local Persistence (Legacy/Dev)
    const localPremium = localStorage.getItem('avalon_is_premium');
    if (localPremium === 'true') {
      setIsPremium(true);
    }
  }, []);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [revealIndex, setRevealIndex] = useState(0);

  // --- Game Logic ---

  const startGame = (playersInput?: { id?: string, name: string }[]) => {
    const currentPlayers = playerNames.map((name, i) => ({ id: `p-${i}`, name }));

    const count = currentPlayers.length;
    const dist = ALIGNMENT_DISTRIBUTION[count];
    const rolesToAssign: Role[] = [...selectedRoles];

    let currentGood = rolesToAssign.filter(r => ROLE_DEFINITIONS[r].alignment === Alignment.GOOD).length;
    let currentEvil = rolesToAssign.filter(r => ROLE_DEFINITIONS[r].alignment === Alignment.EVIL).length;

    while (rolesToAssign.length < count) {
      if (currentEvil < dist.evil) {
        rolesToAssign.push(Role.MINION);
        currentEvil++;
      } else {
        rolesToAssign.push(Role.SERVANT);
        currentGood++;
      }
    }

    const shuffledRoles = [...rolesToAssign].sort(() => Math.random() - 0.5);

    const players: Player[] = currentPlayers.map((p, i) => ({
      id: `p-${i}`,
      name: p.name,
      role: shuffledRoles[i],
      alignment: ROLE_DEFINITIONS[shuffledRoles[i]].alignment
    }));

    const missions: Mission[] = MISSION_MAP[count].players.map((pCount, i) => ({
      id: i + 1,
      requiredPlayers: pCount,
      result: 'PENDING',
      requiredFails: MISSION_MAP[count].failsRequired[i]
    }));

    const newGameState: GameState = {
      players,
      currentMissionIndex: 0,
      missions,
      voteTrack: 0,
      leaderIndex: Math.floor(Math.random() * count),
      logs: [t('log.game_start')],
      proposedTeam: [],
      teamVotes: {},
      missionHistory: [],
      voteHistory: [],
      winner: null,
      assassinTarget: null,
      ladyEnabled: useLady,
      ladyHolder: count - 1,
      ladyHistory: [],
      phase: GamePhase.ROLE_REVEAL_PASS
    };

    setGameState(newGameState);
    setRevealIndex(0);
    setCurrentView(GamePhase.ROLE_REVEAL_PASS);
  };

  const handleNextReveal = () => {
    // Local Play: Cycle through players
    if (revealIndex + 1 < playerCount) {
      setRevealIndex(prev => prev + 1);
      setCurrentView(GamePhase.ROLE_REVEAL_PASS);
    } else {
      setCurrentView(GamePhase.GAME_DASHBOARD);
    }
  };

  const handleProposal = (team: string[]) => {
    if (!gameState) return;
    const newState = { ...gameState, proposedTeam: team, phase: GamePhase.VOTING_TEAM, teamVotes: {} }; // Reset votes
    setGameState(newState);
    setCurrentView(GamePhase.VOTING_TEAM);
  };

  const processTeamVoteResult = (votes: Record<string, boolean>) => {
    if (!gameState) return;

    const rejects = Object.values(votes).filter(v => !v).length;
    const approv = Object.values(votes).filter(v => v).length;
    const isApproved = approv > rejects;

    const newVoteResult: VoteResult = {
      missionIndex: gameState.currentMissionIndex,
      team: gameState.proposedTeam,
      votes,
      approved: isApproved
    };

    let newState: GameState;

    if (isApproved) {
      newState = {
        ...gameState,
        logs: [...gameState.logs, t('log.mission_approved').replace('{0}', (gameState.currentMissionIndex + 1).toString())],
        voteHistory: [...gameState.voteHistory, newVoteResult],
        phase: GamePhase.VOTING_MISSION_PERFORM,
      };
      setGameState(newState);
      setCurrentView(GamePhase.VOTING_MISSION_PERFORM);
    } else {
      const newTrack = gameState.voteTrack + 1;
      if (newTrack >= 5) {
        // Evil Wins by stalling
        newState = {
          ...gameState,
          voteTrack: newTrack,
          winner: Alignment.EVIL,
          logs: [...gameState.logs, t('log.evil_wins_stall')],
          phase: GamePhase.END_GAME
        };
        setGameState(newState);
        setCurrentView(GamePhase.END_GAME);
      } else {
        newState = {
          ...gameState,
          voteTrack: newTrack,
          leaderIndex: (gameState.leaderIndex + 1) % gameState.players.length,
          logs: [...gameState.logs, t('log.team_rejected').replace('{0}', approv.toString()).replace('{1}', rejects.toString())],
          voteHistory: [...gameState.voteHistory, newVoteResult],
          teamVotes: {}, // Reset for next
          proposedTeam: [], // Reset proposed team
          phase: GamePhase.GAME_DASHBOARD
        };
        setGameState(newState);
        setCurrentView(GamePhase.GAME_DASHBOARD);
      }
    }
  };

  const handleMissionVote = (votes: Record<string, 'SUCCESS' | 'FAIL'>) => {
    if (!gameState) return;

    const currentMission = gameState.missions[gameState.currentMissionIndex];
    const failCount = Object.values(votes).filter(v => v === 'FAIL').length;
    const successCount = Object.values(votes).filter(v => v === 'SUCCESS').length;

    const isFail = failCount >= currentMission.requiredFails;
    const outcome = isFail ? 'FAIL' : 'SUCCESS';

    const newMissions = [...gameState.missions];
    newMissions[gameState.currentMissionIndex].result = outcome;

    const newMissionResult: MissionResult = {
      missionIndex: gameState.currentMissionIndex,
      fails: failCount,
      successes: successCount,
      outcome,
      playedCards: votes
    };

    const successes = newMissions.filter(m => m.result === 'SUCCESS').length;
    const fails = newMissions.filter(m => m.result === 'FAIL').length;

    let newState: GameState;

    if (fails >= 3) {
      newState = {
        ...gameState,
        missions: newMissions,
        missionHistory: [...gameState.missionHistory, newMissionResult],
        winner: Alignment.EVIL,
        logs: [...gameState.logs, t('log.mission_failed').replace('{0}', currentMission.id.toString())],
        phase: GamePhase.END_GAME
      };
      setGameState(newState);
      saveStats(Alignment.EVIL);
      setCurrentView(GamePhase.END_GAME);
    } else if (successes >= 3) {
      newState = {
        ...gameState,
        missions: newMissions,
        missionHistory: [...gameState.missionHistory, newMissionResult],
        logs: [...gameState.logs, t('log.mission_success').replace('{0}', currentMission.id.toString())],
        phase: GamePhase.ASSASSIN_PHASE
      };
      setGameState(newState);
      setCurrentView(GamePhase.ASSASSIN_PHASE);
    } else {
      const finishedMissionCount = gameState.missionHistory.length + 1;
      const isLadyTrigger = gameState.ladyEnabled && (finishedMissionCount === 2 || finishedMissionCount === 3 || finishedMissionCount === 4);

      if (isLadyTrigger) {
        newState = {
          ...gameState,
          missions: newMissions,
          currentMissionIndex: gameState.currentMissionIndex + 1,
          leaderIndex: (gameState.leaderIndex + 1) % gameState.players.length,
          missionHistory: [...gameState.missionHistory, newMissionResult],
          logs: [...gameState.logs, `${t('log.mission_result').replace('{0}', currentMission.id.toString()).replace('{1}', outcome === 'SUCCESS' ? t('game.success') : t('game.fail'))} ${t('log.lady_awakens')}`],
          phase: GamePhase.LADY_OF_LAKE
        };
        setGameState(newState);
        setCurrentView(GamePhase.LADY_OF_LAKE);
      } else {
        newState = {
          ...gameState,
          missions: newMissions,
          currentMissionIndex: gameState.currentMissionIndex + 1,
          leaderIndex: (gameState.leaderIndex + 1) % gameState.players.length,
          missionHistory: [...gameState.missionHistory, newMissionResult],
          logs: [...gameState.logs, t('log.mission_result').replace('{0}', currentMission.id.toString()).replace('{1}', outcome === 'SUCCESS' ? t('game.success') : t('game.fail'))],
          teamVotes: {}, // Reset
          phase: GamePhase.GAME_DASHBOARD
        };
        setGameState(newState);
        setCurrentView(GamePhase.GAME_DASHBOARD);
      }
    }
  };

  const handleLadyInvestigation = (targetId: string) => {
    if (!gameState) return;
    const target = gameState.players.find(p => p.id === targetId);
    if (!target) return;

    const targetIndex = gameState.players.findIndex(p => p.id === targetId);

    const newState = {
      ...gameState,
      ladyHistory: [...gameState.ladyHistory, { holderId: gameState.players[gameState.ladyHolder].id, targetId, alignment: target.alignment }],
      ladyHolder: targetIndex, // Pass token
      logs: [...gameState.logs, t('log.investigated').replace('{0}', gameState.players[gameState.ladyHolder].name).replace('{1}', target.name)],
      phase: GamePhase.GAME_DASHBOARD
    };
    setGameState(newState);
    setCurrentView(GamePhase.GAME_DASHBOARD);
  };

  const handleAssassination = (targetId: string) => {
    if (!gameState) return;
    const target = gameState.players.find(p => p.id === targetId);
    let winner: Alignment;

    if (target?.role === Role.MERLIN) {
      winner = Alignment.EVIL;
    } else {
      winner = Alignment.GOOD;
    }

    const newState = { ...gameState, assassinTarget: targetId, winner, phase: GamePhase.END_GAME };
    setGameState(newState);
    saveStats(winner);
    setCurrentView(GamePhase.END_GAME);
  };

  const saveStats = (winner: Alignment) => {
    const saved = localStorage.getItem('avalon_stats');
    const stats = saved ? JSON.parse(saved) : { totalGames: 0, goodWins: 0, evilWins: 0, merlinWins: 0, assassinWins: 0 };

    stats.totalGames += 1;
    if (winner === Alignment.GOOD) stats.goodWins += 1;
    else stats.evilWins += 1;

    localStorage.setItem('avalon_stats', JSON.stringify(stats));
  };

  return (
    <div className="h-full min-h-screen bg-background-dark text-white font-display overflow-hidden relative">
      {currentView === 'HOME' && (
        <HomeScreen
          onSelectMode={() => setCurrentView('SETUP')}
          onOpenPremium={() => setCurrentView('PREMIUM')}
          onOpenSettings={() => setCurrentView('SETTINGS')}
          onOpenRules={() => setCurrentView('RULES')}
          onOnlineMode={() => { }}
          onOpenStats={() => setCurrentView('STATS')}
        />
      )}

      {currentView === 'RULES' && (
        <RulesScreen
          onBack={() => setCurrentView('HOME')}
        />
      )}

      {currentView === 'STATS' && (
        <StatsScreen
          onBack={() => setCurrentView('HOME')}
        />
      )}

      {currentView === 'SETUP' && (
        <SetupScreen
          playerCount={playerCount}
          setPlayerCount={setPlayerCount}
          selectedRoles={selectedRoles}
          setSelectedRoles={setSelectedRoles}
          useLady={useLady}
          setUseLady={setUseLady}
          isPremium={isPremium}
          onOpenPremium={() => setCurrentView('PREMIUM')}
          onBack={() => setCurrentView('HOME')}
          onNext={() => setCurrentView(GamePhase.PLAYER_INPUT)}
        />
      )}

      {currentView === GamePhase.PLAYER_INPUT && (
        <PlayerInputScreen
          playerCount={playerCount}
          onBack={() => setCurrentView('SETUP')}
          onConfirm={(names) => {
            setPlayerNames(names);
            startGame(names.map((n, i) => ({ id: `p-${i}`, name: n })));
          }}
        />
      )}

      {(currentView === GamePhase.ROLE_REVEAL_PASS || currentView === GamePhase.ROLE_REVEAL_SHOW) && gameState && (
        <RoleRevealScreen
          players={gameState.players}
          currentIndex={revealIndex}
          onlineMyId={undefined}
          showIdentity={currentView === GamePhase.ROLE_REVEAL_SHOW}
          onShow={() => setCurrentView(GamePhase.ROLE_REVEAL_SHOW)}
          onNext={handleNextReveal}
        />
      )}

      {currentView === GamePhase.GAME_DASHBOARD && gameState && (
        <Dashboard
          gameState={gameState}
          setGameState={setGameState}
          onBack={() => setCurrentView('HOME')}
          onProposeTeam={(team) => {
            handleProposal(team);
          }}
          onlineMyId={undefined}
        />
      )}

      {(currentView === GamePhase.VOTING_TEAM || currentView === GamePhase.VOTING_MISSION_PERFORM) && gameState && (
        <VotingScreen
          key={currentView}
          gameState={gameState}
          phase={currentView}
          onlineMyId={undefined}
          onVoteSubmit={(votes) => {
            if (currentView === GamePhase.VOTING_TEAM) processTeamVoteResult(votes as Record<string, boolean>);
            else handleMissionVote(votes as Record<string, 'SUCCESS' | 'FAIL'>);
          }}
        />
      )}

      {currentView === GamePhase.LADY_OF_LAKE && gameState && (
        <LadyOfTheLakeScreen
          gameState={gameState}
          onInvestigate={handleLadyInvestigation}
        />
      )}

      {currentView === GamePhase.ASSASSIN_PHASE && gameState && (
        <AssassinScreen
          gameState={gameState}
          onAssassinate={handleAssassination}
        />
      )}

      {currentView === GamePhase.END_GAME && gameState && (
        <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center p-6 bg-background-dark text-center overflow-y-auto no-scrollbar z-50">
          <div className="max-w-md w-full flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${gameState.winner === Alignment.GOOD ? 'bg-primary/20 shadow-primary/40' : 'bg-evil-red/20 shadow-evil-red/40'}`}>
              <span className="material-symbols-outlined text-6xl">
                {gameState.winner === Alignment.GOOD ? 'shield' : 'skull'}
              </span>
            </div>

            <h1 className={`text-4xl font-serif font-black mb-4 uppercase leading-none ${gameState.winner === Alignment.GOOD ? 'text-primary' : 'text-evil-red'}`}>
              {gameState.winner === Alignment.GOOD ? t('end.good_win') : t('end.evil_win')}
            </h1>

            <p className="text-white/60 mb-10 max-w-xs mx-auto leading-relaxed">
              {gameState.winner === Alignment.GOOD && t('end.good_desc')}
              {gameState.winner === Alignment.EVIL && gameState.assassinTarget && t('end.evil_merlin')}
              {gameState.winner === Alignment.EVIL && !gameState.assassinTarget && t('end.evil_quests')}
            </p>

            <div className="flex flex-col gap-3 w-full">
              <button onClick={() => startGame()} className="w-full bg-primary text-background-dark font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(244,209,37,0.3)] hover:bg-[#ffe14d] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">restart_alt</span>
                {t('end.play_again')}
              </button>

              <button onClick={() => setCurrentView(GamePhase.SUMMARY)} className="w-full bg-white/10 text-white font-bold py-4 rounded-xl border border-white/10 hover:bg-white/15 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">description</span>
                {t('home.stats')}
              </button>

              <button onClick={() => setCurrentView('HOME')} className="w-full text-white/40 font-bold py-4 rounded-xl hover:text-white transition-all text-sm uppercase tracking-widest">
                {t('end.menu')}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === GamePhase.SUMMARY && gameState && (
        <GameSummaryScreen
          gameState={gameState}
          onBack={() => setCurrentView(GamePhase.END_GAME)}
        />
      )}

      {currentView === GamePhase.PREMIUM && (
        <PremiumScreen
          onClose={() => setCurrentView('HOME')}
          onUnlock={() => {
            setIsPremium(true);
            localStorage.setItem('avalon_is_premium', 'true');
            setCurrentView('HOME');
          }}
        />
      )}

      {currentView === GamePhase.SETTINGS && (
        <SettingsScreen onBack={() => setCurrentView('HOME')} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
