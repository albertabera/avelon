
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Player, Role, Alignment } from '../types';
import { ROLE_DEFINITIONS } from '../constants';

interface RoleRevealScreenProps {
  players: Player[];
  currentIndex: number;
  onlineMyId?: string;
  showIdentity: boolean;
  onShow: () => void;
  onNext: () => void;
}

const RoleRevealScreen: React.FC<RoleRevealScreenProps> = ({
  players, currentIndex, onlineMyId, showIdentity, onShow, onNext
}) => {
  const { t } = useLanguage();

  // Logic: In Online Mode, ignore currentIndex, show My Card
  const myOnlinePlayer = onlineMyId ? players.find(p => p.id === onlineMyId) : null;
  // Debug: If I am online, but I can't find myself in the player list, show error
  if (onlineMyId && !myOnlinePlayer) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center p-6 text-center z-20 bg-background-dark text-white">
        <span className="material-symbols-outlined text-4xl text-primary mb-4">error</span>
        <h2 className="text-xl font-bold mb-2">Connection Error</h2>
        <p className="text-white/60 mb-6">You are connected to the lobby, but not found in the game configuration.</p>

        <div className="bg-black/20 p-4 rounded text-xs text-left font-mono w-full max-w-sm overflow-auto mb-6">
          <p className="text-primary mb-1">My ID: {onlineMyId}</p>
          <p className="text-white/50">Game Players:</p>
          {players.map(p => (
            <div key={p.id}>{p.name}: {p.id}</div>
          ))}
        </div>

        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white/10 rounded-full font-bold">
          Refresh App
        </button>
      </div>
    );
  }
  const currentPlayer = myOnlinePlayer || players[currentIndex];

  // In Online Mode, we always show identity immediately (no pass device)
  const isIdentityVisible = onlineMyId ? true : showIdentity;

  const roleInfo = ROLE_DEFINITIONS[currentPlayer.role];

  // Helper to find who this player can see
  const getVisions = () => {
    const visions: { name: string, role?: string }[] = [];

    if (currentPlayer.role === Role.MERLIN) {
      players.forEach(p => {
        if (p.alignment === Alignment.EVIL && p.role !== Role.MORDRED) {
          visions.push({ name: p.name, role: t('reveal.role.evil') });
        }
      });
    } else if (currentPlayer.role === Role.PERCIVAL) {
      players.forEach(p => {
        if (p.role === Role.MERLIN || p.role === Role.MORGANA) {
          visions.push({ name: p.name, role: t('reveal.role.merlin_check') });
        }
      });
    } else if (currentPlayer.alignment === Alignment.EVIL && currentPlayer.role !== Role.OBERON && currentPlayer.role !== Role.LANCELOT) {
      players.forEach(p => {
        if (p.alignment === Alignment.EVIL && p.role !== Role.OBERON && p.role !== Role.LANCELOT && p.id !== currentPlayer.id) {
          visions.push({ name: p.name, role: t(`role.${p.role.toLowerCase()}.name`) });
        }
      });
    } else if (currentPlayer.role === Role.TRISTAN) {
      const isolde = players.find(p => p.role === Role.ISOLDA);
      if (isolde) visions.push({ name: isolde.name, role: t('role.lover') });
    } else if (currentPlayer.role === Role.ISOLDA) {
      const tristan = players.find(p => p.role === Role.TRISTAN);
      if (tristan) visions.push({ name: tristan.name, role: t('role.lover') });
    } else if (currentPlayer.role === Role.GUINEVERE) {
      players.forEach(p => {
        if (p.role === Role.LANCELOT) {
          visions.push({ name: p.name, role: t('reveal.role.lancelot') });
        }
      });
    }

    return visions;
  };

  if (!isIdentityVisible) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] flex flex-col items-center justify-center p-6 text-center z-20 bg-background-dark">
        <div className="mb-8 w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-5xl text-primary">person</span>
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">{t('reveal.pass')}</h1>
        <p className="text-white/60 text-lg mb-8">{t('reveal.passDesc')} <span className="text-white font-bold">{currentPlayer.name}</span></p>
        <button onClick={onShow} className="w-full max-w-xs bg-primary text-background-dark font-serif font-bold py-4 rounded-xl shadow-lg">
          {t('reveal.iAm').replace('{0}', currentPlayer.name)}
        </button>
      </div>
    );
  }

  const visions = getVisions();

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col overflow-y-auto no-scrollbar z-20">
      <header className="sticky top-0 z-50 flex items-center bg-background-dark/95 backdrop-blur-md p-4 border-b border-white/5 shadow-sm">
        <div className="flex flex-col items-center mx-auto">
          <h2 className="text-white/50 text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5">{t('reveal.header')}</h2>
          <span className="text-primary text-sm font-serif font-bold tracking-wider">{currentPlayer.name}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-6 pb-28 w-full max-w-md mx-auto relative">
        <div className="text-center mb-6 space-y-2 animate-fade-in">
          <h1 className="text-white text-3xl font-serif font-bold tracking-wide leading-tight drop-shadow-sm">{t('reveal.identity')}</h1>
          <p className="text-white/50 text-xs font-medium uppercase tracking-widest">{t('reveal.eyesOnly')}</p>
        </div>

        <div className="w-full relative">
          <div className="relative flex flex-col overflow-hidden rounded-2xl bg-[#2c2820] border border-white/10 shadow-glow ring-1 ring-white/5 animate-flip-in">
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-surface-dark border-b border-white/5">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${roleInfo.image}')` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c2820] via-transparent to-transparent opacity-90"></div>
              </div>
              <div className="absolute top-3 right-3 flex items-center justify-center size-10 rounded-full bg-black/80 backdrop-blur border border-primary/40 shadow-lg z-10">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  {currentPlayer.alignment === Alignment.GOOD ? 'shield' : 'swords'}
                </span>
              </div>
            </div>

            <div className="flex flex-col px-5 pt-2 pb-6 relative z-10">
              <div className="flex flex-col items-center text-center -mt-8 mb-5">
                <h3 className={`text-4xl font-serif font-black uppercase tracking-widest drop-shadow-md mb-1 ${currentPlayer.alignment === Alignment.GOOD ? 'text-primary' : 'text-evil-red'}`}>
                  {t(`role.${currentPlayer.role.toLowerCase()}.name`)}
                </h3>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
                  {currentPlayer.alignment === Alignment.GOOD ? t('reveal.loyal') : t('reveal.minion')}
                </span>
              </div>

              <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-lg border border-white/5 mb-6">
                <span className="material-symbols-outlined text-primary/80 text-[20px] shrink-0 mt-0.5">auto_awesome</span>
                <p className="text-white/90 text-sm leading-relaxed font-light">{t(`role.${currentPlayer.role.toLowerCase()}.desc`)}</p>
              </div>

              {visions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t('reveal.knowledge')}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {visions.map((v, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{v.name}</span>
                          <span className="text-[10px] text-white/40">{v.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-background-dark/90 backdrop-blur-xl pt-4 pb-8 px-6 border-t border-white/10 z-40">
        <div className="w-full max-w-md mx-auto">
          {onlineMyId ? (
            /* Online Mode Button */
            <button disabled={!onlineMyId} onClick={onNext} className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl h-14 bg-gradient-to-r from-primary-dark to-primary shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale">
              <span className="relative flex items-center gap-3 text-background-dark text-lg font-bold tracking-wide font-serif">
                <span>{t('reveal.startGame')}</span>
                <span className="material-symbols-outlined text-[24px] font-bold group-hover:translate-x-1 transition-transform">swords</span>
              </span>
            </button>
          ) : (
            /* Local Mode Button */
            <button onClick={onNext} className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl h-14 bg-gradient-to-r from-primary-dark to-primary shadow-lg shadow-primary/20 active:scale-[0.98]">
              <span className="relative flex items-center gap-3 text-background-dark text-lg font-bold tracking-wide font-serif">
                <span>{t('reveal.hide')}</span>
                <span className="material-symbols-outlined text-[24px] font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleRevealScreen;
