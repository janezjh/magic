export enum GamePhase {
  START = 'START',
  SETTINGS = 'SETTINGS', // New phase for settings
  SETUP = 'SETUP', // Defining role and goals
  PLAYING = 'PLAYING'
}

export interface PlayerStats {
  level: number;
  inspiration: number; // Max 50
  money: number;
  int: number;
  str: number;
  cha: number;
  fatigue: number; // Max 100
  role: string;
  currentGoal: string;
  avatarUrl?: string; // New field for user avatar
}

export interface InventoryItem {
  name: string;
  count: number;
}

export interface StatChanges {
  int: number;
  str: number;
  cha: number;
  fatigue: number;
  money: number;
  inspiration: number;
}

export interface InventoryUpdate {
  name: string;
  quantity_change: number;
}

export interface TurnResponse {
  system_feedback: string;
  stat_changes: StatChanges;
  inventory_updates: InventoryUpdate[];
  is_level_up: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  // Optional detailed view for system messages
  details?: {
    statChanges?: StatChanges;
    inventoryUpdates?: InventoryUpdate[];
  };
}