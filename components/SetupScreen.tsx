
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Role } from '../types';
import { ROLE_DEFINITIONS, ALIGNMENT_DISTRIBUTION } from '../constants';

interface SetupScreenProps {
  playerCount: number;
  setPlayerCount: (n: number) => void;
  selectedRoles: Role[];
  setSelectedRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  useLady: boolean;
  setUseLady: (use: boolean) => void;
  isPremium: boolean;
  onOpenPremium: () => void;
  onBack: () => void;
  onNext: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({
  playerCount, setPlayerCount, selectedRoles, setSelectedRoles, useLady, setUseLady, isPremium, onOpenPremium, onBack, onNext
}) => {
  const { t } = useLanguage();

  const toggleRole = (role: Role) => {
    if (ROLE_DEFINITIONS[role].mustBeIncluded) return;

    if (ROLE_DEFINITIONS[role].isPremium && !isPremium) {
      onOpenPremium();
      return;
    }

    // Linked Roles Logic (Tristan & Isolde)
    let rolesToToggle = [role];
    if (role === Role.TRISTAN) rolesToToggle.push(Role.ISOLDA);
    if (role === Role.ISOLDA) rolesToToggle.push(Role.TRISTAN);

    setSelectedRoles(prev => {
      const isSelecting = !prev.includes(role);

      if (isSelecting) {
        // Validation: Check alignment limits
        const limits = ALIGNMENT_DISTRIBUTION[playerCount];
        const currentRoles = [...prev];
        const newRoles = rolesToToggle.filter(r => !prev.includes(r));

        let newGoodCount = currentRoles.filter(r => ROLE_DEFINITIONS[r].alignment === 'Good').length;
        let newEvilCount = currentRoles.filter(r => ROLE_DEFINITIONS[r].alignment === 'Evil').length;

        // Calculate impact of new roles
        let addedGood = 0;
        let addedEvil = 0;
        newRoles.forEach(r => {
          if (ROLE_DEFINITIONS[r].alignment === 'Good') addedGood++;
          else addedEvil++;
        });

        // SMART SWAP LOGIC
        if (newGoodCount + addedGood > limits.good) {
          const excess = (newGoodCount + addedGood) - limits.good;
          const servantsAvailable = currentRoles.filter(r => r === Role.SERVANT).length;

          if (servantsAvailable >= excess) {
            for (let i = 0; i < excess; i++) {
              const idx = currentRoles.findIndex(r => r === Role.SERVANT);
              if (idx !== -1) currentRoles.splice(idx, 1);
            }
            // We successfully made space
            newGoodCount -= excess;
          } else {
            alert(`Cannot add more Good roles. Max for ${playerCount} players is ${limits.good}.`);
            return prev;
          }
        }

        if (newEvilCount + addedEvil > limits.evil) {
          const excess = (newEvilCount + addedEvil) - limits.evil;
          const minionsAvailable = currentRoles.filter(r => r === Role.MINION).length;

          if (minionsAvailable >= excess) {
            for (let i = 0; i < excess; i++) {
              const idx = currentRoles.findIndex(r => r === Role.MINION);
              if (idx !== -1) currentRoles.splice(idx, 1);
            }
            newEvilCount -= excess;
          } else {
            alert(`Cannot add more Evil roles. Max for ${playerCount} players is ${limits.evil}.`);
            return prev;
          }
        }

        // Safety check
        if (currentRoles.length + newRoles.length > playerCount) {
          return prev;
        }

        return [...currentRoles, ...newRoles];
      } else {
        // Deselecting one deselects both
        return prev.filter(r => !rolesToToggle.includes(r));
      }
    });
  };

  const loyalists = Object.values(ROLE_DEFINITIONS).filter(r => r.alignment === 'Good' && r.id !== Role.SERVANT);
  const minions = Object.values(ROLE_DEFINITIONS).filter(r => r.alignment === 'Evil' && r.id !== Role.MINION);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col max-w-md mx-auto bg-background-dark border-x border-[#333022] overflow-hidden z-20">
      <div className="sticky top-0 z-20 flex items-center bg-background-dark/95 backdrop-blur-sm p-4 border-b border-[#333022]">
        <div onClick={onBack} className="text-white/80 hover:text-primary transition-colors cursor-pointer flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <h2 className="text-white text-lg font-bold leading-tight tracking-wide flex-1 text-center pr-10 uppercase font-serif">Configure Realm</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-40">
        <div className="px-4 py-4">
          <div className="bg-[#2a261a] rounded-xl p-5 border border-[#333022]">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-[#8e8870] text-xs font-semibold uppercase tracking-wider mb-1">Player Count</span>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">groups</span>
                  <span className="text-2xl font-bold text-white">{playerCount}</span>
                </div>
              </div>
              <span className="text-[#8e8870] text-sm">Recommended for balance</span>
            </div>
            <input
              type="range" min="5" max="10" step="1"
              value={playerCount}
              onChange={(e) => setPlayerCount(parseInt(e.target.value))}
              className="w-full h-2 bg-[#4a4530] rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[#5c5745] text-xs font-bold mt-2 px-1 font-mono">
              {[5, 6, 7, 8, 9, 10].map(n => <span key={n}>{n}</span>)}
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  import('../constants').then(({ RECOMMENDED_ROLES, ROLE_DEFINITIONS }) => {
                    const recRoles = RECOMMENDED_ROLES[playerCount];
                    if (recRoles) {
                      if (!isPremium) {
                        const filtered = recRoles.filter(r => !ROLE_DEFINITIONS[r].isPremium);
                        setSelectedRoles(filtered);
                      } else {
                        setSelectedRoles(recRoles);
                      }
                    }
                  });
                }}
                className="w-full bg-white/5 border border-primary/20 hover:bg-primary/10 text-primary text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-sm">smart_toy</span>
                Auto-Balance Roles
              </button>
            </div>
          </div>

          {/* Lady of the Lake Toggle */}
          <div className="flex items-center justify-between bg-[#2a261a] p-4 rounded-xl border border-[#333022] mt-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4ba3cc]">water_drop</span>
              <span className="text-white/80 font-bold uppercase text-sm tracking-wider">{t('setup.lady')}</span>
            </div>
            <button
              onClick={() => setUseLady(!useLady)}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${useLady ? 'bg-[#4ba3cc]' : 'bg-white/10'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-transform ${useLady ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
        {/* Loyalists Section */}
        <div className="pt-2 pb-6">
          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-1"></div>
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">shield</span>
              <h3 className="text-lg font-bold tracking-wide uppercase font-serif">Loyalists</h3>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-1"></div>
          </div>
          <div className="grid grid-cols-3 gap-3 px-4">
            {loyalists.map(role => (
              <div
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`relative group cursor-pointer ${!selectedRoles.includes(role.id) && selectedRoles.length >= playerCount ? 'opacity-30' : ''}`}
              >
                <div className={`relative flex flex-col items-center bg-[#232015] border-2 rounded-xl overflow-hidden pb-2 h-full transition-all ${selectedRoles.includes(role.id) ? 'border-primary' : 'border-[#4a4530]'}`}>
                  <div className="w-full aspect-[4/5] bg-cover bg-center mb-2" style={{ backgroundImage: `url('${role.image}')` }}>
                    {role.mustBeIncluded && (
                      <div className="absolute top-1 right-1 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">MUST</div>
                    )}
                    {role.isPremium && !isPremium && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 backdrop-blur-[1px]">
                        <span className="material-symbols-outlined text-[#f4d125] text-3xl drop-shadow-lg">lock</span>
                      </div>
                    )}
                  </div>
                  <p className={`font-bold text-sm leading-tight text-center px-1 ${selectedRoles.includes(role.id) ? 'text-primary' : 'text-white'}`}>{role.name}</p>
                  <div className="absolute top-2 left-2">
                    <span className={`material-symbols-outlined text-[18px] ${selectedRoles.includes(role.id) ? 'text-primary' : 'text-white/20'}`}>
                      {selectedRoles.includes(role.id) ? 'check_circle' : 'circle'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minions Section */}
        <div className="pt-2">
          <div className="flex items-center gap-3 px-4 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-evil-red/50 to-transparent flex-1"></div>
            <div className="flex items-center gap-2 text-evil-red">
              <span className="material-symbols-outlined text-[20px]">swords</span>
              <h3 className="text-lg font-bold tracking-wide uppercase font-serif">Minions</h3>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-evil-red/50 to-transparent flex-1"></div>
          </div>
          <div className="grid grid-cols-3 gap-3 px-4">
            {minions.map(role => (
              <div
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`relative group cursor-pointer ${!selectedRoles.includes(role.id) && selectedRoles.length >= playerCount ? 'opacity-30' : ''}`}
              >
                <div className={`relative flex flex-col items-center bg-[#232015] border-2 rounded-xl overflow-hidden pb-2 h-full transition-all ${selectedRoles.includes(role.id) ? 'border-evil-red' : 'border-[#4a4530]'}`}>
                  <div className="w-full aspect-[4/5] bg-cover bg-center mb-2" style={{ backgroundImage: `url('${role.image}')` }}>
                    {role.isPremium && !isPremium && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 backdrop-blur-[1px]">
                        <span className="material-symbols-outlined text-[#f4d125] text-3xl drop-shadow-lg">lock</span>
                      </div>
                    )}
                  </div>
                  <p className={`font-bold text-sm leading-tight text-center px-1 ${selectedRoles.includes(role.id) ? 'text-evil-red' : 'text-white'}`}>{role.name}</p>
                  <div className="absolute top-2 left-2">
                    <span className={`material-symbols-outlined text-[18px] ${selectedRoles.includes(role.id) ? 'text-evil-red' : 'text-white/20'}`}>
                      {selectedRoles.includes(role.id) ? 'check_circle' : 'circle'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 z-30 w-full max-w-md bg-[#1a1810]/95 backdrop-blur-md border-t border-[#333022] p-4 pb-6">
        <button onClick={onNext} className="w-full bg-primary hover:bg-[#ffe14d] text-[#2a261a] font-serif font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(244,209,37,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">swords</span>
          Start Journey
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
