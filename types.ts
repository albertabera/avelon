
export enum Role {
  MERLIN = 'Merlin',
  PERCIVAL = 'Percival',
  SERVANT = 'Servant',
  ASSASSIN = 'Assassin',
  MORGANA = 'Morgana',
  MORDRED = 'Mordred',
  OBERON = 'Oberon',
  MINION = 'Minion',
  TRISTAN = 'Tristan',
  ISOLDA = 'Isolda',
  LANCELOT = 'Lancelot',
  GUINEVERE = 'Guinevere'
}

export enum Alignment {
  GOOD = 'Good',
  EVIL = 'Evil'
}

export enum GamePhase {
  HOME = 'HOME',
  LOBBY = 'LOBBY',
  SETUP_CONFIG = 'SETUP_CONFIG',
  PLAYER_INPUT = 'PLAYER_INPUT',
  ROLE_REVEAL_PASS = 'ROLE_REVEAL_PASS',
  ROLE_REVEAL_SHOW = 'ROLE_REVEAL_SHOW',
  GAME_DASHBOARD = 'GAME_DASHBOARD',
  VOTING_TEAM = 'VOTING_TEAM',
  VOTING_TEAM_RESULT = 'VOTING_TEAM_RESULT',
  VOTING_MISSION = 'VOTING_MISSION', // Who goes on mission
  VOTING_MISSION_PERFORM = 'VOTING_MISSION_PERFORM', // Success/Fail choice
  MISSION_RESULT = 'MISSION_RESULT',
  LADY_OF_LAKE = 'LADY_OF_LAKE',
  ASSASSIN_PHASE = 'ASSASSIN_PHASE', // Good wins, Assassin needs to kill Merlin
  PREMIUM = 'PREMIUM',
  SETTINGS = 'SETTINGS',
  SUMMARY = 'SUMMARY',
  RULES = 'RULES',
  STATS = 'STATS',
  END_GAME = 'END_GAME'
}

export interface Player {
  id: string;
  name: string;
  role: Role;
  alignment: Alignment;
}

export interface Mission {
  id: number;
  requiredPlayers: number;
  result: 'SUCCESS' | 'FAIL' | 'PENDING';
  requiredFails: number; // Usually 1, but for some counts mission 4 needs 2 fails
}

export interface GameState {
  players: Player[];
  currentMissionIndex: number;
  missions: Mission[];
  voteTrack: number; // 0-4, 5 is game over or forced mission
  leaderIndex: number;
  logs: string[];
  proposedTeam: string[]; // Player IDs
  teamVotes: Record<string, boolean>; // Current round votes
  missionHistory: MissionResult[];
  voteHistory: VoteResult[];
  winner: Alignment | null;
  assassinTarget: string | null; // Player ID
  // Lady of the Lake
  ladyEnabled: boolean;
  ladyHolder: number; // Index of player holding the token
  ladyHistory: { holderId: string, targetId: string, alignment: Alignment }[];
  phase?: GamePhase;
}

export interface RoleConfig {
  id: Role;
  name: string;
  alignment: Alignment;
  description: string;
  isExpansion: boolean;
  mustBeIncluded: boolean;
  image: string;
  isPremium?: boolean;
}

export interface VoteResult {
  missionIndex: number;
  team: string[]; // Player IDs
  votes: Record<string, boolean>; // playerID -> approved?
  approved: boolean;
}

export interface MissionResult {
  missionIndex: number;
  fails: number;
  successes: number;
  outcome: 'SUCCESS' | 'FAIL';
  playedCards: Record<string, 'SUCCESS' | 'FAIL'>; // Anonymized results usually, but we store ID for logic (display will hide it)
}
