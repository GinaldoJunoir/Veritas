
export type AttributeKey = 'DES' | 'CON' | 'INT' | 'PRE' | 'PER' | 'FOR';

export interface Attribute {
  key: AttributeKey;
  label: string;
  value: number;
}

export interface Skill {
  name: string;
  attrPrimary: AttributeKey;
  attrSecondary: AttributeKey; // Used for bonus
  training: number; // 0, 5, 10, 15
  category?: string; // e.g., Acadêmicas, Combate (implicit in prompt list)
}

export type DamageType = 'Balístico' | 'Corte' | 'Impacto' | 'Perfuração' | 'Energia' | 'Mental' | 'Outro';

export interface Item {
  id: string;
  name: string;
  type: 'Proteção' | 'Arma' | 'Item';
  subType: 'Fogo' | 'Corpo-a-corpo' | 'Escudo' | 'Vestimenta' | 'Consumível' | 'Outro';
  damageType?: DamageType;
  damageRoll?: string;
  quality?: string; // For melee
  ammo?: number; // For firearms
  maxAmmo?: number;
  ammoCost?: number; // How much ammo per shot
  
  // New fields
  weight: number;
  quantity: number;
  description: string;
  equipped?: boolean; // If true, applies bonuses
  defenseBonus?: number; // For Protection items
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: string; // Ninjutsu, Genjutsu for Naruto
  element?: string; // For Naruto
  damage?: string;
  costPE: number;
}

export interface BloodlineAbility {
  id: string;
  name: string;
  costActivation: string;
  costUpkeep: string;
  description: string;
}

export type SupplementType = 'Base' | 'Slasher' | 'Naruto';

export interface Character {
  id: string;
  playerId: string; // User ID
  supplement: SupplementType;
  
  name: string;
  history: string;
  ideology: string;
  keyConnection: string;
  importantPeople: string;
  
  attributes: Record<AttributeKey, number>;
  skills: Skill[];
  
  level: number;
  
  // Calculated & Editable Stats
  hp: { current: number; max: number };
  san: { current: number; max: number; enabled: boolean };
  pe: { current: number; max: number; enabled: boolean }; // Also used for Chakra
  courage?: { current: number; max: number }; // For Slasher
  
  defense: { total: number; bonus: number };
  
  job: string;
  variant: string;
  powerLevel: 'Mortal' | 'Heroico' | 'Épico';
  
  inventory: Item[];
  abilities: Ability[];
  
  // Naruto Specific
  bloodlineAbilities?: BloodlineAbility[];
  bloodlineSlots?: number;
}

export interface ThreatAttack {
  id: string;
  name: string;
  costPE: number;
  hitBonus: 0 | 5 | 10 | 15;
  damageRoll: string;
  description?: string;
}

export interface Threat {
  id: string;
  name: string;
  description: string;
  level: 1 | 2 | 3 | 4 | 5;
  attributes: Record<AttributeKey, number>;
  hp: { current: number; max: number };
  pe: { current: number; max: number };
  defense: number;
  attacks: ThreatAttack[];
}

export interface CampaignLog {
  id: string;
  timestamp: number;
  message: string;
  type: 'roll' | 'system' | 'damage' | 'heal' | 'info';
  source: string; // Character Name, Threat Name, or 'Sistema'
}

export interface Campaign {
  id: string;
  gmId: string;
  name: string;
  description: string;
  players: string[]; // Character IDs
  threats: string[]; // Threat IDs
  logs: CampaignLog[];
}

export interface RollResult {
  id: string;
  characterId?: string; // Added to link roll to character in campaign
  characterName: string;
  label: string;
  dice: number[];
  kept: number; // The logic value (highest or lowest)
  modifier: number;
  total: number;
  isCrit: boolean; // Natural 20
  isFumble: boolean; // Natural 1
  timestamp: number;
  formula?: string; // e.g. "3d20 + 5"
}

export interface User {
  id: string;
  username: string;
  email: string; // Added email field
  passwordHash: string; // Simulated
}
