
import { Character, Threat, Campaign, User, CampaignLog } from '../types';

const KEYS = {
  USERS: 'veritas_users',
  CHARACTERS: 'veritas_characters',
  THREATS: 'veritas_threats',
  CAMPAIGNS: 'veritas_campaigns',
  SESSION: 'veritas_session'
};

export const DataService = {
  // --- Auth ---
  register: (user: User) => {
    const users = DataService.getUsers();
    if (users.find(u => u.username === user.username)) throw new Error('Nome de usuário já existe');
    if (users.find(u => u.email === user.email)) throw new Error('E-mail já cadastrado');
    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  login: (identifier: string, passwordHash: string): User | null => {
    const users = DataService.getUsers();
    // Allow login by Username OR Email
    return users.find(u => (u.username === identifier || u.email === identifier) && u.passwordHash === passwordHash) || null;
  },
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  },
  
  // --- Characters ---
  saveCharacter: (char: Character) => {
    const chars = DataService.getCharacters();
    const idx = chars.findIndex(c => c.id === char.id);
    if (idx >= 0) chars[idx] = char;
    else chars.push(char);
    localStorage.setItem(KEYS.CHARACTERS, JSON.stringify(chars));
  },
  getCharacters: (): Character[] => {
    return JSON.parse(localStorage.getItem(KEYS.CHARACTERS) || '[]');
  },
  deleteCharacter: (id: string) => {
    const chars = DataService.getCharacters().filter(c => c.id !== id);
    localStorage.setItem(KEYS.CHARACTERS, JSON.stringify(chars));
  },

  // --- Threats ---
  saveThreat: (threat: Threat) => {
    const items = DataService.getThreats();
    const idx = items.findIndex(t => t.id === threat.id);
    if (idx >= 0) items[idx] = threat;
    else items.push(threat);
    localStorage.setItem(KEYS.THREATS, JSON.stringify(items));
  },
  getThreats: (): Threat[] => {
    return JSON.parse(localStorage.getItem(KEYS.THREATS) || '[]');
  },
   deleteThreat: (id: string) => {
    const items = DataService.getThreats().filter(t => t.id !== id);
    localStorage.setItem(KEYS.THREATS, JSON.stringify(items));
  },

  // --- Campaigns ---
  saveCampaign: (camp: Campaign) => {
    const items = DataService.getCampaigns();
    const idx = items.findIndex(c => c.id === camp.id);
    if (idx >= 0) items[idx] = camp;
    else items.push(camp);
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(items));
  },
  getCampaigns: (): Campaign[] => {
    return JSON.parse(localStorage.getItem(KEYS.CAMPAIGNS) || '[]');
  },
  deleteCampaign: (id: string) => {
    const items = DataService.getCampaigns().filter(c => c.id !== id);
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(items));
  },
  
  // --- Logging Helper ---
  logCampaignEvent: (characterId: string | null, message: string, source: string, type: CampaignLog['type'] = 'info') => {
    const campaigns = DataService.getCampaigns();
    // Find campaign containing this character or just active ones (simulated by finding char)
    // If characterId is null (e.g. GM action not bound to char, strictly we would need campaign ID, 
    // but for simplicity we'll assume we pass charId if possible, or skip if purely global context without ID)
    
    // Simplification: We search for the campaign that holds this character ID.
    if (!characterId) return;

    const idx = campaigns.findIndex(c => c.players.includes(characterId));
    if (idx >= 0) {
        const camp = campaigns[idx];
        if (!camp.logs) camp.logs = [];
        
        const newLog: CampaignLog = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            message,
            type,
            source
        };
        
        // Add to top
        camp.logs.unshift(newLog);
        
        // Limit log size
        if (camp.logs.length > 100) camp.logs = camp.logs.slice(0, 100);
        
        campaigns[idx] = camp;
        localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    }
  }
};
