
import React, { useState } from 'react';
import { DataService } from '../services/dataService';
import { Campaign, Character, Threat } from '../types';
import { User as UserIcon, ShieldAlert, X, Search, Plus, Play, Link as LinkIcon, Check, Trash2 } from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DataService.getCampaigns());
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [newCampName, setNewCampName] = useState('');
  
  // Selection States
  const allChars = DataService.getCharacters();
  const allThreats = DataService.getThreats();
  const users = DataService.getUsers();

  // Add Player State
  const [searchUser, setSearchUser] = useState('');
  const [foundChars, setFoundChars] = useState<Character[]>([]);

  // Threat Death State
  const [dyingThreatId, setDyingThreatId] = useState<string | null>(null);

  // Link copy state
  const [linkCopied, setLinkCopied] = useState(false);

  const createCampaign = () => {
      if(!newCampName) return;
      const c: Campaign = {
          id: crypto.randomUUID(),
          gmId: localStorage.getItem('veritas_session') || '',
          name: newCampName,
          description: '',
          players: [],
          threats: [],
          logs: []
      };
      DataService.saveCampaign(c);
      setCampaigns(DataService.getCampaigns());
      setNewCampName('');
  };

  const updateCampaign = (camp: Campaign) => {
      DataService.saveCampaign(camp);
      setActiveCampaign(camp);
      setCampaigns(DataService.getCampaigns());
  };

  const deleteCampaign = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(confirm('Tem certeza que deseja apagar esta campanha permanentemente?')) {
          DataService.deleteCampaign(id);
          setCampaigns(DataService.getCampaigns());
      }
  };

  const toggleEntity = (type: 'player' | 'threat', id: string) => {
      if(!activeCampaign) return;
      const updated = { ...activeCampaign };
      if(type === 'player') {
          if(updated.players.includes(id)) updated.players = updated.players.filter(p => p !== id);
          else updated.players.push(id);
      } else {
           if(updated.threats.includes(id)) updated.threats = updated.threats.filter(t => t !== id);
          else updated.threats.push(id);
      }
      updateCampaign(updated);
  };

  const removeThreatFromCampaign = (threatId: string) => {
      if(!activeCampaign) return;
      const updated = { ...activeCampaign };
      updated.threats = updated.threats.filter(t => t !== threatId);
      updateCampaign(updated);
  };

  const handleThreatDamage = (t: Threat, amount: number) => {
      const newCurrent = Math.max(0, t.hp.current - amount);
      const updatedThreat = { ...t, hp: { ...t.hp, current: newCurrent } };
      DataService.saveThreat(updatedThreat);
      setCampaigns(DataService.getCampaigns());

      if (newCurrent === 0) {
          setDyingThreatId(t.id);
          setTimeout(() => {
              removeThreatFromCampaign(t.id);
              setDyingThreatId(null);
          }, 2000);
      }
  };

  const handlePlayerDamage = (char: Character, amount: number) => {
      char.hp.current = Math.max(0, char.hp.current - amount);
      DataService.saveCharacter(char);
      DataService.logCampaignEvent(char.id, `Sofreu ${amount} de dano (Mestre)`, char.name, 'damage');
      
      setCampaigns(DataService.getCampaigns());
      const updatedList = DataService.getCampaigns();
      const current = updatedList.find(c => c.id === activeCampaign?.id);
      if(current) setActiveCampaign(current);
  }

  const handleSearchUser = () => {
      const user = users.find(u => u.username.toLowerCase() === searchUser.toLowerCase());
      if(user) {
          const chars = allChars.filter(c => c.playerId === user.id);
          setFoundChars(chars);
      } else {
          setFoundChars([]);
      }
  };

  const copyInviteLink = () => {
      if(!activeCampaign) return;
      // Simulating an invite link structure
      const url = `${window.location.origin}/#/join/${activeCampaign.id}`;
      navigator.clipboard.writeText(url).then(() => {
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 2000);
      });
  };

  const getCampChars = () => allChars.filter(c => activeCampaign?.players.includes(c.id));
  const getCampThreats = () => allThreats.filter(t => activeCampaign?.threats.includes(t.id));

  const formatDate = (ts: number) => new Date(ts).toLocaleTimeString();

  return (
    <div className="p-4 max-w-7xl mx-auto h-full flex flex-col font-sans">
        {!activeCampaign ? (
            <div className="w-full">
                 <div className="mb-12 text-center">
                    <h1 className="text-4xl font-light text-white mb-2 uppercase tracking-widest">Campanhas</h1>
                    <div className="h-1 w-20 bg-veritas-gold mx-auto rounded-full"></div>
                 </div>

                 <div className="flex gap-4 mb-12 bg-white/5 border border-white/10 p-6 rounded-3xl shadow-lg backdrop-blur-md max-w-2xl mx-auto">
                     <input className="flex-1 bg-black/50 border border-white/10 p-4 rounded-xl text-white focus:border-veritas-gold outline-none transition-all" placeholder="Nome da Nova Campanha" value={newCampName} onChange={e => setNewCampName(e.target.value)} />
                     <button onClick={createCampaign} className="bg-veritas-gold text-black font-bold px-8 py-2 rounded-xl hover:bg-yellow-500 transition-colors uppercase tracking-wider shadow-lg">Criar</button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {campaigns.map(c => (
                         <div key={c.id} onClick={() => setActiveCampaign(c)} className="bg-gradient-to-br from-white/10 to-white/0 border border-white/10 p-8 rounded-3xl cursor-pointer hover:border-veritas-gold/50 hover:shadow-2xl hover:-translate-y-2 transition-all group backdrop-blur-sm relative">
                             <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-white group-hover:text-veritas-gold transition-colors">{c.name}</h2>
                                <Play className="text-gray-500 group-hover:text-veritas-gold transition-colors" />
                             </div>
                             <div className="flex gap-4 mt-6">
                                 <span className="bg-black/40 px-3 py-1 rounded-full text-xs font-medium text-gray-300 flex items-center gap-2 border border-white/5"><UserIcon size={14}/> {c.players.length}</span>
                                 <span className="bg-black/40 px-3 py-1 rounded-full text-xs font-medium text-gray-300 flex items-center gap-2 border border-white/5"><ShieldAlert size={14}/> {c.threats.length}</span>
                             </div>

                             <button onClick={(e) => deleteCampaign(e, c.id)} className="absolute bottom-6 right-6 text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                                <Trash2 size={18} />
                             </button>
                         </div>
                     ))}
                 </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col w-full h-full">
                <div className="flex justify-between items-center mb-6 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-veritas-gold tracking-tight ml-2">{activeCampaign.name}</h1>
                        <button 
                            onClick={copyInviteLink} 
                            className="text-xs flex items-center gap-2 bg-black/30 border border-white/10 hover:bg-veritas-gold hover:text-black hover:border-veritas-gold px-3 py-1.5 rounded-full transition-all"
                        >
                            {linkCopied ? <Check size={14}/> : <LinkIcon size={14}/>}
                            {linkCopied ? 'Copiado!' : 'Link de Convite'}
                        </button>
                    </div>
                    <button onClick={() => setActiveCampaign(null)} className="text-gray-400 hover:text-white transition-colors text-sm font-medium bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10">Voltar ao Menu</button>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden pb-2">
                    {/* Character Tracker */}
                    <div className="col-span-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-3xl p-6 overflow-y-auto backdrop-blur-md shadow-xl">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-wide border-b border-white/10 pb-4"><UserIcon size={18} className="text-veritas-gold" /> Personagens</h3>
                        
                        {/* Search & Add Player */}
                        <div className="bg-black/30 p-4 rounded-2xl mb-6 border border-white/10">
                            <label className="text-xs text-gray-500 uppercase font-bold mb-2 block tracking-wider">Adicionar Jogador</label>
                            <div className="flex gap-2 mb-2">
                                <input className="w-full bg-black/50 border border-white/10 rounded-xl text-sm p-3 text-white outline-none focus:border-veritas-gold" placeholder="Nome de usuário..." value={searchUser} onChange={e => setSearchUser(e.target.value)} />
                                <button onClick={handleSearchUser} className="bg-veritas-gold text-black px-4 rounded-xl hover:bg-yellow-500"><Search size={18}/></button>
                            </div>
                            {foundChars.length > 0 && (
                                <div className="space-y-2 mt-3">
                                    {foundChars.map(fc => (
                                        <div key={fc.id} className="flex justify-between items-center text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span>{fc.name} <span className="text-gray-500 text-xs ml-1">Lvl {fc.level}</span></span>
                                            {!activeCampaign.players.includes(fc.id) ? (
                                                <button onClick={() => toggleEntity('player', fc.id)} className="text-veritas-gold hover:scale-110 transition-transform bg-black/30 p-1 rounded-full"><Plus size={14}/></button>
                                            ) : <span className="text-green-500 text-[10px] font-bold bg-green-900/20 px-2 py-1 rounded-full border border-green-500/20">OK</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {getCampChars().map(char => (
                                <div key={char.id} className="bg-black/40 p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-veritas-gold"></div>
                                    <div className="font-bold text-white flex justify-between mb-2 items-center pl-2">
                                        <span className="text-lg">{char.name}</span>
                                        <button onClick={() => toggleEntity('player', char.id)} className="text-gray-600 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold pl-2 mb-3">
                                        <div className="bg-red-950/40 p-2 rounded-xl border border-red-500/20 text-red-500">PV {char.hp.current}</div>
                                        <div className="bg-blue-950/40 p-2 rounded-xl border border-blue-500/20 text-blue-500">SAN {char.san.current}</div>
                                        <div className="bg-yellow-950/40 p-2 rounded-xl border border-yellow-500/20 text-yellow-500">PE {char.pe.current}</div>
                                    </div>
                                    <div className="flex gap-2 pl-2">
                                        <button className="flex-1 bg-white/5 text-gray-400 text-xs py-2 rounded-lg hover:bg-red-900/50 hover:text-white transition-colors font-medium border border-white/5" onClick={() => handlePlayerDamage(char, 1)}>Dano 1</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Threat Tracker */}
                    <div className="col-span-4 bg-gradient-to-br from-red-950/10 to-black/60 border border-red-900/20 rounded-3xl p-6 overflow-y-auto backdrop-blur-md shadow-xl">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-wide border-b border-red-900/30 pb-4"><ShieldAlert size={18} className="text-veritas-blood" /> Ameaças</h3>
                        <div className="space-y-4">
                             {getCampThreats().map(t => (
                                <div key={t.id} className="bg-black/60 p-5 rounded-2xl border border-red-900/30 shadow-lg relative overflow-hidden group">
                                    {/* DEATH OVERLAY */}
                                    {dyingThreatId === t.id && (
                                        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm">
                                            <h2 className="text-3xl font-black text-red-600 tracking-widest uppercase animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,1)] transform -rotate-12 border-4 border-red-600 p-4 rounded-xl">
                                                DERROTADO
                                            </h2>
                                        </div>
                                    )}

                                    <div className="font-bold text-white flex justify-between items-center mb-2">
                                        <span className="text-lg">{t.name} <span className="text-red-500 text-[10px] ml-1 bg-red-950/50 px-2 py-0.5 rounded-full border border-red-900/50">NA-{t.level}</span></span>
                                        <button onClick={() => toggleEntity('threat', t.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={16}/></button>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-3 ml-0.5">Defesa: <span className="text-gray-300 font-bold">{t.defense}</span></div>
                                    <div className="flex items-center gap-3 mb-4">
                                         <div className="w-full bg-black h-3 rounded-full overflow-hidden border border-white/10">
                                             <div className="bg-red-600 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.6)]" style={{width: `${(t.hp.current/t.hp.max)*100}%`}}></div>
                                         </div>
                                         <span className="text-sm text-red-500 font-mono font-bold w-8 text-right">{t.hp.current}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-white/5 border border-white/5 text-gray-400 text-xs py-2 rounded-lg hover:bg-red-900 hover:text-white transition-colors font-bold" onClick={() => handleThreatDamage(t, 5)}>Dano 5</button>
                                        <button className="flex-1 bg-white/5 border border-white/5 text-gray-400 text-xs py-2 rounded-lg hover:bg-red-900 hover:text-white transition-colors font-bold" onClick={() => handleThreatDamage(t, 1)}>Dano 1</button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="mt-6 pt-4 border-t border-red-900/20">
                                <label className="text-xs text-red-400/70 uppercase font-bold mb-2 block tracking-wider">Adicionar Ameaça</label>
                                <div className="relative">
                                    <select className="w-full bg-black/50 border border-red-900/30 text-gray-300 text-sm p-3 rounded-xl outline-none appearance-none focus:border-red-500 cursor-pointer" onChange={(e) => toggleEntity('threat', e.target.value)} value="">
                                        <option value="">Selecione da lista...</option>
                                        {allThreats.filter(t => !activeCampaign.threats.includes(t.id)).map(t => (
                                            <option key={t.id} value={t.id}>{t.name} (NA-{t.level})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-3.5 pointer-events-none">
                                        <Plus size={16} className="text-red-500"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Log Area */}
                    <div className="col-span-4 bg-black/40 border border-white/10 rounded-3xl p-6 font-mono text-xs text-gray-400 overflow-y-auto flex flex-col backdrop-blur-md shadow-xl">
                        <div className="mb-4 text-veritas-gold uppercase tracking-wider font-bold border-b border-white/10 pb-4 text-center">Registro de Eventos</div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                             {(!activeCampaign.logs || activeCampaign.logs.length === 0) && (
                                 <div className="text-gray-600 italic text-center mt-10">Nenhum evento registrado.</div>
                             )}
                             {activeCampaign.logs?.map(log => (
                                 <div key={log.id} className="pb-3 border-b border-white/5 last:border-0 hover:bg-white/5 p-2 rounded transition-colors">
                                     <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                                         <span className="uppercase font-bold text-gray-400">{log.source}</span>
                                         <span>{formatDate(log.timestamp)}</span>
                                     </div>
                                     <div className={`text-sm ${log.type === 'roll' ? 'text-white' : log.type === 'damage' ? 'text-red-400' : log.type === 'heal' ? 'text-green-400' : 'text-gray-300'}`}>
                                         {log.message}
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
