
import { Role, Alignment, RoleConfig } from './types';

export const ROLE_DEFINITIONS: Record<Role, RoleConfig> = {
  [Role.MERLIN]: {
    id: Role.MERLIN,
    name: 'The Director',
    alignment: Alignment.GOOD,
    description: 'Intel Chief. Knows the enemy agents. Must survive.',
    isExpansion: false,
    mustBeIncluded: true,
    image: '/assets/role_director.png'
  },
  [Role.ASSASSIN]: {
    id: Role.ASSASSIN,
    name: 'The Sniper',
    alignment: Alignment.EVIL,
    description: 'If the Agency wins, gets one shot to eliminate the Director.',
    isExpansion: false,
    mustBeIncluded: true,
    image: '/assets/role_sniper.png'
  },
  [Role.PERCIVAL]: {
    id: Role.PERCIVAL,
    name: 'Bodyguard',
    alignment: Alignment.GOOD,
    description: 'Knows the Director (and Decoy). Protects the VIP.',
    isExpansion: false,
    mustBeIncluded: false,
    image: '/assets/role_bodyguard.png'
  },
  [Role.MORGANA]: {
    id: Role.MORGANA,
    name: 'The Decoy',
    alignment: Alignment.EVIL,
    description: 'Impersonates the Director to confuse the Bodyguard.',
    isExpansion: false,
    mustBeIncluded: false,
    image: '/assets/role_decoy.png'
  },
  [Role.MORDRED]: {
    id: Role.MORDRED,
    name: 'Mastermind',
    alignment: Alignment.EVIL,
    description: 'Unknown to the Director. The leader of the insurgency.',
    isExpansion: false,
    mustBeIncluded: false,
    image: '/assets/role_mastermind.png',
    isPremium: true
  },
  [Role.OBERON]: {
    id: Role.OBERON,
    name: 'The Rogue',
    alignment: Alignment.EVIL,
    description: 'Unknown to other Moles. A chaotic element.',
    isExpansion: true,
    mustBeIncluded: false,
    image: '/assets/role_rogue.png',
    isPremium: true
  },
  [Role.SERVANT]: {
    id: Role.SERVANT,
    name: 'Field Agent',
    alignment: Alignment.GOOD,
    description: 'loyal Field Agent of the Agency.',
    isExpansion: false,
    mustBeIncluded: false,
    image: '/assets/role_agent.png'
  },
  [Role.MINION]: {
    id: Role.MINION,
    name: 'Double Agent',
    alignment: Alignment.EVIL,
    description: 'Standard mole working for the enemy.',
    isExpansion: false,
    mustBeIncluded: false,
    image: '/assets/role_double_agent.png'
  },
  [Role.TRISTAN]: {
    id: Role.TRISTAN,
    name: 'Agent X',
    alignment: Alignment.GOOD,
    description: 'Knows Agent Y. Part of a secret duo.',
    isExpansion: true,
    mustBeIncluded: false,
    image: '/assets/role_agent_x.png',
    isPremium: true
  },
  [Role.ISOLDA]: {
    id: Role.ISOLDA,
    name: 'Agent Y',
    alignment: Alignment.GOOD,
    description: 'Knows Agent X. Part of a secret duo.',
    isExpansion: true,
    mustBeIncluded: false,
    image: '/assets/role_agent_y.png',
    isPremium: true
  },
  [Role.LANCELOT]: {
    id: Role.LANCELOT,
    name: 'The Mole',
    alignment: Alignment.EVIL,
    description: 'Deep cover agent. Unknown to other Moles.',
    isExpansion: true,
    mustBeIncluded: false,
    image: '/assets/role_mole.png',
    isPremium: true
  },
  [Role.GUINEVERE]: {
    id: Role.GUINEVERE,
    name: 'The Analyst',
    alignment: Alignment.GOOD,
    description: 'Knows The Mole. Can identify the deep cover threat.',
    isExpansion: true,
    mustBeIncluded: false,
    image: '/assets/role_analyst.png',
    isPremium: true
  },
};

export const MISSION_MAP: Record<number, { players: number[], failsRequired: number[] }> = {
  5: { players: [2, 3, 2, 3, 3], failsRequired: [1, 1, 1, 1, 1] },
  6: { players: [2, 3, 4, 3, 4], failsRequired: [1, 1, 1, 1, 1] },
  7: { players: [2, 3, 3, 4, 4], failsRequired: [1, 1, 1, 2, 1] },
  8: { players: [3, 4, 4, 5, 5], failsRequired: [1, 1, 1, 2, 1] },
  9: { players: [3, 4, 4, 5, 5], failsRequired: [1, 1, 1, 2, 1] },
  10: { players: [3, 4, 4, 5, 5], failsRequired: [1, 1, 1, 2, 1] },
};

export const RECOMMENDED_ROLES: Record<number, Role[]> = {
  5: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.MORGANA, Role.ASSASSIN],
  6: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN],
  7: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.OBERON],
  8: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORGANA, Role.ASSASSIN, Role.MINION],
  9: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORDRED, Role.MORGANA, Role.ASSASSIN],
  10: [Role.MERLIN, Role.PERCIVAL, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.SERVANT, Role.MORDRED, Role.MORGANA, Role.ASSASSIN, Role.OBERON],
};

export const ALIGNMENT_DISTRIBUTION: Record<number, { good: number, evil: number }> = {
  5: { good: 3, evil: 2 },
  6: { good: 4, evil: 2 },
  7: { good: 4, evil: 3 },
  8: { good: 5, evil: 3 },
  9: { good: 6, evil: 3 },
  10: { good: 6, evil: 4 },
};
