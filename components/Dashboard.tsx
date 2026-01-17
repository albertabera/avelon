
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { GameState, GamePhase, Alignment, Mission, Player, MissionResult } from '../types';
import { getHeraldNarration } from '../services/geminiService';

interface DashboardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onBack: () => void;
  onProposeTeam: (team: string[]) => void;
  onlineMyId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ gameState, setGameState, onBack, onProposeTeam, onlineMyId }) => {
  const { t } = useLanguage();
  const [selectedForTeam, setSelectedForTeam] = useState<string[]>([]);
  const [isNarrationLoading, setIsNarrationLoading] = useState(false);
  const [heraldMsg, setHeraldMsg] = useState("");
  const [missionResultToShow, setMissionResultToShow] = useState<MissionResult | null>(null);

  // Responsive Logic
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;
  const tableRadius = isMobile ? Math.min(150, windowWidth * 0.40) : 180;
  const avatarSizeClass = isMobile ? 'w-11 h-11' : 'w-16 h-16';

  const currentMission = gameState.missions[gameState.currentMissionIndex];
  // Determine if it is currently my turn to propose (Leader)
  // Assuming in local play, we always show the propose UI if we are the leader, 
  // or just show "Player X is proposing".
  const leaderPlayer = gameState.players[gameState.leaderIndex];
  const leaderName = leaderPlayer.name;

  const fetchHerald = async () => {
    setIsNarrationLoading(true);
    const msg = await getHeraldNarration(gameState);
    setHeraldMsg(msg);
    setIsNarrationLoading(false);
  };
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    setSelectedForTeam([]);
  }, [gameState.currentMissionIndex, gameState.voteTrack]);

  // --- MISSION RESULT MODAL LOGIC ---
  useEffect(() => {
    if (gameState.missionHistory.length > 0) {
      const lastResult = gameState.missionHistory[gameState.missionHistory.length - 1];
      const lastSeenIndex = parseInt(sessionStorage.getItem('avalon_last_seen_mission') || '-1');

      if (lastResult.missionIndex > lastSeenIndex) {
        setMissionResultToShow(lastResult);
      }
    }
  }, [gameState.missionHistory]);

  const handleCloseResult = () => {
    if (missionResultToShow) {
      sessionStorage.setItem('avalon_last_seen_mission', missionResultToShow.missionIndex.toString());
      setMissionResultToShow(null);
    }
  };


  const togglePlayerSelect = (id: string) => {
    if (selectedForTeam.includes(id)) {
      setSelectedForTeam(prev => prev.filter(pid => pid !== id));
    } else {
      if (selectedForTeam.length < currentMission.requiredPlayers) {
        setSelectedForTeam(prev => [...prev, id]);
      }
    }
  };

  const handlePropose = () => {
    if (selectedForTeam.length === currentMission.requiredPlayers) {
      onProposeTeam(selectedForTeam);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-background-dark text-white overflow-hidden z-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface-dark/50 via-background-dark to-black pointer-events-none"></div>
      {/* Top Bar - Compacted */}
      <header className="flex items-center justify-between p-3 pb-1 z-10 bg-background-dark border-b border-primary/10 shrink-0">
        <button onClick={() => setShowExitConfirm(true)} className="flex items-center justify-center p-1.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold tracking-tight text-white uppercase flex items-center gap-1 font-serif leading-none">
            <span className="material-symbols-outlined text-primary text-sm">swords</span>
            {t('app.title')}
          </h1>
        </div>
        <div className="w-8"></div> {/* Spacer for balance */}
      </header>

      {/* Quest Track - Ultra Compact */}
      <div className="flex flex-col w-full bg-gradient-to-b from-surface-dark to-background-dark pt-2 pb-2 px-3 shadow-lg z-10 relative shrink-0">
        <div className="flex justify-between items-center mb-1 relative">
          <div className="absolute w-full h-0.5 bg-white/10 top-1/2 -translate-y-1/2 rounded-full -z-0"></div>
          {gameState.missions.map((m, i) => (
            <div key={m.id} className={`flex flex-col items-center gap-0.5 z-10 ${i > gameState.currentMissionIndex ? 'opacity-50' : ''}`}>
              <div className={`w-8 h-8 rounded-full bg-surface-dark border-2 flex items-center justify-center shadow-lg transition-all ${m.result === 'SUCCESS' ? 'border-good-blue' :
                m.result === 'FAIL' ? 'border-evil-red' :
                  i === gameState.currentMissionIndex ? 'border-primary shadow-glow scale-110' : 'border-white/20'
                }`}>
                {m.result === 'SUCCESS' && <span className="material-symbols-outlined text-good-blue text-sm">check_circle</span>}
                {m.result === 'FAIL' && <span className="material-symbols-outlined text-evil-red text-sm">cancel</span>}
                {m.result === 'PENDING' && <span className="text-[10px] font-bold">{m.requiredPlayers}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Vote Track Compact */}
        <div className="flex justify-center items-center gap-3">
          <div className="flex gap-1 bg-white/5 rounded-full px-2 py-0.5">
            {[0, 1, 2, 3, 4].map(v => (
              <div key={v} className={`w-1.5 h-1.5 rounded-full ${gameState.voteTrack > v ? 'bg-evil-red' : 'bg-white/10'}`}></div>
            ))}
          </div>
          <span className="text-[10px] text-white/40 uppercase">{gameState.voteTrack}/5 {t('game.reject')}</span>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 relative w-full overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Table Visualizer */}
        <div className="relative w-full max-w-sm aspect-square z-0 flex items-center justify-center">
          <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center rounded-full"></div>

          {/* Central Info */}
          <div className="w-32 h-32 rounded-full border border-white/5 bg-white/5 flex flex-col items-center justify-center backdrop-blur-sm shadow-inner">
            <span className="text-primary/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t('dashboard.quest')} {currentMission.id}</span>
            <span className="text-white text-3xl font-bold font-serif">{currentMission.requiredPlayers}</span>
            <span className="text-white/40 text-[9px]">{t('dashboard.needed')}</span>
          </div>

          {/* Players Around Table */}
          {gameState.players.map((p, i) => {
            const angle = (i * (360 / gameState.players.length)) * (Math.PI / 180);
            const radius = tableRadius; // RESPONSIVE RADIUS
            const x = Math.sin(angle) * radius;
            const y = -Math.cos(angle) * radius;

            const isLeader = i === gameState.leaderIndex;
            const isSelected = selectedForTeam.includes(p.id);

            return (
              <div
                key={p.id}
                onClick={() => togglePlayerSelect(p.id)}
                className="absolute flex flex-col items-center transition-all duration-300"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <div className={`relative transition-all cursor-pointer ${isSelected ? 'scale-110' : 'hover:scale-105'}`}>
                  {/* Selection Indicator */}
                  {isSelected && <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30"></div>}

                  <div className={`${avatarSizeClass} rounded-full border-2 flex items-center justify-center font-serif font-black text-xl shadow-lg transition-all relative overflow-hidden bg-background-dark ${isSelected ? 'border-primary text-primary bg-primary/10' : 'border-white/20 text-white/40 bg-white/5'}`}>
                    {/* Placeholder Avatar - Initials */}
                    {p.name.substring(0, 2).toUpperCase()}
                    {isLeader && <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent"></div>}
                  </div>

                  {isLeader && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary drop-shadow-md">
                      <span className="material-symbols-outlined fill-1 text-2xl">crown</span>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary text-black text-[8px] font-bold px-1.5 py-0.5 rounded-sm border border-black/10">TEAM</div>
                  )}
                </div>
                <span className={`mt-1 text-[10px] font-bold px-2 rounded backdrop-blur-md shadow-md ${isSelected ? 'bg-primary text-black' : 'bg-black/40 text-white/80'}`}>
                  {p.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Drawer */}
      <div className="bg-surface-dark border-t border-primary/20 rounded-t-3xl p-5 pb-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] z-20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white text-lg font-bold leading-tight font-serif">{t('dashboard.propose')}</h3>
            <p className="text-[#cbc190] text-xs font-normal mt-1">
              <strong className="text-white">{leaderName}</strong>: {t('dashboard.choose')} <strong className="text-white">{currentMission.requiredPlayers}</strong> knights.
            </p>
          </div>
          <div className="bg-primary/20 px-3 py-1 rounded text-primary text-[10px] font-bold border border-primary/30">
            {selectedForTeam.length}/{currentMission.requiredPlayers} {t('dashboard.selected')}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {(!onlineMyId || onlineMyId === gameState.players[gameState.leaderIndex].id) ? (
            <button
              onClick={handlePropose}
              disabled={selectedForTeam.length !== currentMission.requiredPlayers}
              className={`w-full font-serif font-bold text-base py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${selectedForTeam.length === currentMission.requiredPlayers ? 'bg-primary text-background-dark' : 'bg-white/5 text-white/20 border border-white/5'
                }`}
            >
              <span className="material-symbols-outlined">how_to_reg</span>
              {t('dashboard.confirm')}
            </button>
          ) : (
            <div className="w-full py-4 text-center text-white/40 text-sm italic border border-white/5 rounded-xl">
              Waiting for {leaderName}...
            </div>
          )}
        </div>
      </div>

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowExitConfirm(false)}></div>
          <div className="bg-[#1a1810] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl animate-scale-in text-center">
            <span className="material-symbols-outlined text-4xl text-white/40 mb-4">logout</span>
            <h2 className="text-white font-bold text-xl mb-2">{t('game.exit_confirm')}</h2>
            <p className="text-white/60 text-sm mb-6">{t('game.exit_desc')}</p>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowExitConfirm(false)} className="py-3 rounded-lg bg-white/5 text-white font-bold hover:bg-white/10">{t('game.cancel')}</button>
              <button onClick={onBack} className="py-3 rounded-lg bg-evil-red text-white font-bold shadow-lg shadow-red-900/30 hover:bg-red-600">{t('game.confirm_exit')}</button>
            </div>
          </div>
        </div>
      )}

      {/* MISSION RESULT MODAL */}
      {missionResultToShow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={handleCloseResult}></div>
          <div className="bg-[#1a1810] border-2 border-primary/30 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-[0_0_50px_rgba(244,209,37,0.2)] animate-scale-in flex flex-col items-center text-center">

            <h2 className="text-primary font-serif font-bold text-xl uppercase tracking-widest mb-6">Mission Report</h2>

            <div className="flex items-center justify-center gap-8 mb-8 w-full">
              {/* Fails */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-4 border-evil-red flex items-center justify-center bg-evil-red/10 mb-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  <span className="text-4xl font-black text-evil-red">{missionResultToShow.fails}</span>
                </div>
                <span className="text-xs font-bold uppercase text-evil-red tracking-wider">Fails</span>
              </div>

              {/* Successes */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-good-blue flex items-center justify-center bg-good-blue/10 mb-2 opacity-60">
                  <span className="text-2xl font-bold text-good-blue">{missionResultToShow.successes}</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-good-blue tracking-wider">Success</span>
              </div>
            </div>

            <div className={`text-2xl font-black uppercase mb-8 ${missionResultToShow.outcome === 'SUCCESS' ? 'text-good-blue drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'text-evil-red drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]'}`}>
              {missionResultToShow.outcome === 'SUCCESS' ? 'Mission Succeeded' : 'Mission Failed'}
            </div>

            <button
              onClick={handleCloseResult}
              className="w-full bg-primary text-background-dark font-bold py-3 rounded-lg hover:bg-primary-dark transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
