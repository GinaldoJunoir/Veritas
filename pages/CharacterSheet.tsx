
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Character, AttributeKey, Item, Ability, BloodlineAbility } from '../types';
import { DataService } from '../services/dataService';
import { RollContext } from '../App';
import { rollD20Check, rollGeneric } from '../components/DiceRoller';
import { Dices, Shield, Heart, Zap, Brain, Trash2, ArrowUpCircle, X, Settings, Edit3, Flame, Scale, Footprints, HandMetal, Eye, EyeOff, Crosshair, Plus } from 'lucide-react';

// Circular D20 Icon Component
const IconD20 = ({ className }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full opacity-80">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  </div>
);

export const CharacterSheet: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addLog } = useContext(RollContext);
  const [char, setChar] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTabLeft, setActiveTabLeft] = useState<'equip' | 'abilities' | 'bloodline'>('equip');

  // Creation Toggles
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isCreatingAbility, setIsCreatingAbility] = useState(false);

  // New Item States
  const [newItem, setNewItem] = useState<Partial<Item>>({ 
      type: 'Arma', 
      subType: 'Fogo', 
      name: '', 
      weight: 0, 
      quantity: 1, 
      description: '', 
      ammoCost: 1,
      defenseBonus: 0
  });
  const [newAbility, setNewAbility] = useState<Partial<Ability>>({ name: '', costPE: 0, description: '' });

  // Level Up Modal State
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false);
  const [levelUpStep, setLevelUpStep] = useState<'roll' | 'attr' | 'skills'>('roll');
  const [pendingLevelChar, setPendingLevelChar] = useState<Character | null>(null);
  const [levelRolls, setLevelRolls] = useState<{ hp: number, sanPe: number, rolled: boolean }>({ hp: 0, sanPe: 0, rolled: false });
  const [attrPointsAvailable, setAttrPointsAvailable] = useState(0);
  const [skillPointsAvailable, setSkillPointsAvailable] = useState(0);

  useEffect(() => {
    if (id) {
        const chars = DataService.getCharacters();
        const found = chars.find(c => c.id === id);
        if (found) setChar(found);
        setLoading(false);
    }
  }, [id]);

  const saveChar = (updated: Character) => {
    setChar(updated);
    DataService.saveCharacter(updated);
  };

  // Wrapper to adjust stat and log it
  const adjustStat = (stat: 'hp' | 'san' | 'pe' | 'courage', delta: number) => {
      if (!char) return;
      const updated = { ...char };
      let logMsg = '';
      let type: 'damage' | 'heal' | 'info' = delta < 0 ? 'damage' : 'heal';
      
      // Helper to clamp and set
      const applyChange = (obj: { current: number, max: number }, label: string) => {
          const old = obj.current;
          obj.current = Math.min(obj.max, Math.max(0, obj.current + delta));
          logMsg = `${delta > 0 ? 'Recuperou' : 'Perdeu'} ${Math.abs(delta)} de ${label} (${old} -> ${obj.current})`;
      };

      if (stat === 'hp') applyChange(updated.hp, 'Vida');
      if (stat === 'san') applyChange(updated.san, 'Sanidade');
      if (stat === 'pe') applyChange(updated.pe, char.supplement === 'Naruto' ? 'Chakra' : 'Energia');
      if (stat === 'courage' && updated.courage) applyChange(updated.courage, 'Coragem');

      saveChar(updated);
      DataService.logCampaignEvent(char.id, logMsg, char.name, type);
  };

  const rollAttribute = (key: AttributeKey) => {
    if (!char) return;
    const res = rollD20Check(char.attributes[key], 0, `Teste de ${key}`, char.name);
    res.characterId = char.id; 
    addLog(res);
  };

  const rollSkill = (skillIndex: number) => {
    if (!char) return;
    const skill = char.skills[skillIndex];
    const attrVal = char.attributes[skill.attrPrimary];
    const secondaryVal = char.attributes[skill.attrSecondary];
    const modifier = secondaryVal + skill.training;
    
    const res = rollD20Check(attrVal, modifier, `Perícia: ${skill.name}`, char.name);
    res.characterId = char.id;
    addLog(res);
  };

  const updateSkillAttribute = (idx: number, type: 'primary' | 'secondary', value: AttributeKey) => {
      if(!char) return;
      const newSkills = [...char.skills];
      if (type === 'primary') newSkills[idx].attrPrimary = value;
      else newSkills[idx].attrSecondary = value;
      saveChar({ ...char, skills: newSkills });
  }

  const toggleItemEquip = (item: Item) => {
      if (!char) return;
      const updatedInventory = char.inventory.map(i => i.id === item.id ? { ...i, equipped: !i.equipped } : i);
      saveChar({ ...char, inventory: updatedInventory });
  }

  const rollWeapon = (w: Item) => {
    if(!char) return;
    
    if (w.subType === 'Fogo') {
        const cost = w.ammoCost || 1;
        if(w.ammo && w.ammo >= cost) {
            // Deduct Ammo
            const updatedInventory = char.inventory.map(i => i.id === w.id ? { ...i, ammo: i.ammo! - cost } : i);
            saveChar({ ...char, inventory: updatedInventory });
            DataService.logCampaignEvent(char.id, `Disparou ${w.name} (Gastou ${cost} munição)`, char.name, 'info');

            const miraSkill = char.skills.find(s => s.name === 'Mira');
            if (miraSkill) {
                const attrVal = char.attributes[miraSkill.attrPrimary];
                const modifier = char.attributes[miraSkill.attrSecondary] + miraSkill.training;
                const hitRes = rollD20Check(attrVal, modifier, `Tiro com ${w.name} (Mira)`, char.name);
                hitRes.characterId = char.id;
                addLog(hitRes);
            }
            if(w.damageRoll) {
                const res = rollGeneric(w.damageRoll, `Dano: ${w.name}`, char.name);
                res.characterId = char.id;
                addLog(res);
            }
        } else {
            alert('Munição insuficiente ou arma vazia!');
        }
    } else {
         if(w.damageRoll) {
             const res = rollGeneric(w.damageRoll, `Dano: ${w.name}`, char.name);
             res.characterId = char.id;
             addLog(res);
         }
    }
  };

  const rollPunch = () => {
      if(!char) return;
      const base = Math.floor(Math.random() * 3) + 1;
      const forMod = char.attributes.FOR;
      const total = base + forMod;

      addLog({
          id: crypto.randomUUID(),
          characterId: char.id,
          characterName: char.name,
          label: 'Soco (1d3 + FOR)',
          dice: [base],
          kept: base,
          modifier: forMod,
          total: total,
          isCrit: false,
          isFumble: false,
          timestamp: Date.now()
      });
  };

  const calculateTotalWeight = () => {
      if (!char) return 0;
      return char.inventory.reduce((acc, item) => acc + (item.weight * item.quantity), 0);
  };

  const calculateTotalDefense = () => {
      if (!char) return 0;
      const equipBonus = char.inventory
        .filter(i => i.equipped && i.type === 'Proteção')
        .reduce((sum, i) => sum + (i.defenseBonus || 0), 0);
      return char.defense.total + equipBonus + char.defense.bonus;
  }

  const calculateMovementSpeed = () => {
      if (!char) return 0;
      const des = char.attributes.DES;
      let speed = 0;
      if (des <= 2) speed = 7;
      else if (des <= 4) speed = 8;
      else speed = 9;

      const weight = calculateTotalWeight();
      if (weight > 20) speed = speed / 2;
      return speed;
  };

  const useAbility = (ab: Ability) => {
      if (!char) return;
      if (char.pe.enabled && char.pe.current < ab.costPE) {
          alert(char.supplement === 'Naruto' ? 'Chakra Insuficiente!' : 'Pontos de Energia Insuficientes!');
          return;
      }
      
      const label = char.supplement === 'Naruto' ? 'Técnica' : 'Habilidade';
      if (ab.damage) {
        const res = rollGeneric(ab.damage, `${label}: ${ab.name}`, char.name);
        res.characterId = char.id;
        addLog(res);
      } else {
        DataService.logCampaignEvent(char.id, `Usou ${label}: ${ab.name}`, char.name, 'info');
      }

      if (char.pe.enabled) {
          adjustStat('pe', -ab.costPE);
      }
  };

  // --- Level Up Logic ---
  const startLevelUp = () => {
    if (!char) return;
    const nextLevel = char.level + 1;
    const pending = JSON.parse(JSON.stringify(char));
    pending.level = nextLevel;

    setPendingLevelChar(pending);
    setIsLevelUpOpen(true);
    setLevelUpStep('roll');
    setLevelRolls({ hp: 0, sanPe: 0, rolled: false });
    
    let attrPoints = 0;
    let skillPoints = 0; 

    if (nextLevel === 2) skillPoints = 1;
    if (nextLevel === 4) attrPoints = 1;
    if (nextLevel === 6) skillPoints = 1;
    if (nextLevel === 7) attrPoints = 2;
    if (nextLevel === 9) attrPoints = 3;
    if (nextLevel === 10) { skillPoints = 2; attrPoints = 2; }

    setAttrPointsAvailable(attrPoints);
    setSkillPointsAvailable(skillPoints);
  };

  const performLevelRolls = () => {
     if(!pendingLevelChar) return;
     const lvl = pendingLevelChar.level;
     let hpDie = 0;
     let sanPeDie = 0; 
     if ([2, 3, 5].includes(lvl)) hpDie = 3;
     if (lvl === 8) hpDie = 5;
     if ([2, 3, 7].includes(lvl)) sanPeDie = 6;
     let hpRoll = 0;
     let sanPeRoll = 0;
     if (hpDie > 0) hpRoll = Math.floor(Math.random() * hpDie) + 1;
     if (lvl === 9) {
         sanPeRoll = (Math.floor(Math.random() * 3) + 1) + (Math.floor(Math.random() * 3) + 1);
     } else if (sanPeDie > 0) {
         sanPeRoll = Math.floor(Math.random() * sanPeDie) + 1;
     }
     setLevelRolls({ hp: hpRoll, sanPe: sanPeRoll, rolled: true });
     setPendingLevelChar(prev => {
         if(!prev) return null;
         return {
             ...prev,
             hp: { ...prev.hp, max: prev.hp.max + hpRoll, current: prev.hp.current + hpRoll },
             san: { ...prev.san, max: prev.san.max + sanPeRoll, current: prev.san.current + sanPeRoll },
             pe: { ...prev.pe, max: prev.pe.max + sanPeRoll, current: prev.pe.current + sanPeRoll }
         }
     });
  };

  const nextLevelStep = () => {
      if (levelUpStep === 'roll') {
          if (attrPointsAvailable > 0) setLevelUpStep('attr');
          else if (skillPointsAvailable > 0) setLevelUpStep('skills');
          else finalizeLevelUp();
      } else if (levelUpStep === 'attr') {
           if (skillPointsAvailable > 0) setLevelUpStep('skills');
           else finalizeLevelUp();
      } else {
          finalizeLevelUp();
      }
  };

  const updatePendingAttr = (key: AttributeKey, change: number) => {
      if (!pendingLevelChar) return;
      const current = pendingLevelChar.attributes[key];
      if (change > 0 && attrPointsAvailable > 0 && current < 5) {
          setPendingLevelChar({...pendingLevelChar, attributes: {...pendingLevelChar.attributes, [key]: current + 1}});
          setAttrPointsAvailable(p => p - 1);
      } else if (change < 0 && char && current > char.attributes[key]) { 
          setPendingLevelChar({...pendingLevelChar, attributes: {...pendingLevelChar.attributes, [key]: current - 1}});
          setAttrPointsAvailable(p => p + 1);
      }
  };

  const togglePendingSkill = (idx: number) => {
      if (!pendingLevelChar) return;
      const skills = [...pendingLevelChar.skills];
      const skill = skills[idx];
      const levels = [0, 5, 10, 15];
      const currentIdx = levels.indexOf(skill.training);

      if (currentIdx < levels.length - 1 && skillPointsAvailable > 0) {
          skills[idx].training = levels[currentIdx + 1];
          setPendingLevelChar({...pendingLevelChar, skills});
          setSkillPointsAvailable(p => p - 1);
      }
  };

  const finalizeLevelUp = () => {
      if (pendingLevelChar) {
          saveChar(pendingLevelChar);
          setIsLevelUpOpen(false);
          addLog({
              id: crypto.randomUUID(),
              characterId: pendingLevelChar.id,
              characterName: pendingLevelChar.name,
              label: `Subiu para o Nível ${pendingLevelChar.level}`,
              dice: [], kept: 0, modifier: 0, total: 0, isCrit: false, isFumble: false, timestamp: Date.now()
          });
          setPendingLevelChar(null);
      }
  };

  if (loading || !char) return <div className="text-white p-10">Carregando...</div>;

  const ATTR_KEYS: AttributeKey[] = ['DES', 'CON', 'INT', 'PRE', 'PER', 'FOR'];
  const totalWeight = calculateTotalWeight();
  const moveSpeed = calculateMovementSpeed();
  const finalDefense = calculateTotalDefense();

  return (
    <div className="h-full flex flex-col overflow-hidden font-sans text-gray-300">
      
      {/* Header Info - Glass Card */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center shadow-lg mb-4 mx-2">
          <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white bg-black/20 p-2 rounded-full"><X /></button>
               <div>
                   <h1 className="text-2xl font-bold text-white leading-none tracking-tight">{char.name}</h1>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-veritas-gold uppercase tracking-wider font-bold">{char.job}</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-xs text-gray-400">{char.variant}</span>
                      <span className="text-gray-600">|</span>
                      <span className="text-xs text-gray-500">{char.supplement || 'Base'}</span>
                   </div>
               </div>
          </div>
          
          <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Deslocamento</span>
                   <span className={`text-lg font-bold ${totalWeight > 20 ? 'text-red-500' : 'text-white'}`}>
                       <Footprints className="inline w-3 h-3 mr-1"/>
                       {moveSpeed}m
                   </span>
               </div>
               
               {char.supplement !== 'Slasher' && (
                   <div className="flex items-center gap-3 bg-black/40 px-5 py-2 rounded-full border border-white/10">
                       <div className="text-right">
                           <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Nível</div>
                           <div className="text-2xl font-bold text-white leading-none">{char.level}</div>
                       </div>
                       <button onClick={startLevelUp} className="bg-veritas-gold text-black rounded-full p-1 hover:scale-110 transition-transform">
                           <ArrowUpCircle size={20} />
                       </button>
                   </div>
               )}
          </div>
      </div>

      {/* Main Layout - 3 Glass Columns */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden px-2 pb-2">
        
        {/* LEFT COLUMN: Inventory & Abilities */}
        <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-md rounded-3xl flex flex-col overflow-y-auto shadow-xl">
            <div className="flex border-b border-white/10 bg-black/20">
                <button onClick={() => setActiveTabLeft('equip')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTabLeft === 'equip' ? 'text-veritas-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Inventário</button>
                <button onClick={() => setActiveTabLeft('abilities')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTabLeft === 'abilities' ? 'text-veritas-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>{char.supplement === 'Naruto' ? 'Técnicas' : 'Habilidades'}</button>
                {char.supplement === 'Naruto' && (
                    <button onClick={() => setActiveTabLeft('bloodline')} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors ${activeTabLeft === 'bloodline' ? 'text-veritas-gold bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Kekkei Genkai</button>
                )}
            </div>

            <div className="p-4 space-y-4">
                {activeTabLeft === 'equip' && (
                    <>
                        <div className="flex gap-2">
                             <div className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-xs border ${totalWeight > 20 ? 'bg-red-950/20 border-red-800 text-red-400' : 'bg-black/40 border-white/10 text-gray-400'}`}>
                                <Scale size={14} />
                                <span className="font-bold">{totalWeight.toFixed(1)} / 20.0 kg</span>
                            </div>
                            <button onClick={rollPunch} className="flex-1 bg-white/5 hover:bg-veritas-gold hover:text-black border border-white/10 text-gray-300 rounded-xl p-3 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2">
                                <HandMetal size={14} /> Soco (1d3+{char.attributes.FOR})
                            </button>
                        </div>

                        {/* Add Item Form Toggle */}
                        {!isCreatingItem ? (
                             <button onClick={() => setIsCreatingItem(true)} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-2xl text-gray-400 hover:text-white text-xs uppercase font-bold flex items-center justify-center gap-2">
                                 <Plus size={16} /> Adicionar Item
                             </button>
                        ) : (
                            <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2 animate-in fade-in slide-in-from-top-2">
                                 <h4 className="text-xs uppercase font-bold text-veritas-gold mb-2">Novo Item</h4>
                                 <input placeholder="Nome do Item" className="w-full bg-black/50 border border-white/10 p-2 rounded-xl text-sm text-white focus:border-veritas-gold outline-none" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                                 <div className="flex gap-2">
                                    <select className="bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white flex-1 outline-none" value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})}>
                                        <option value="Arma">Arma</option>
                                        <option value="Proteção">Proteção</option>
                                        <option value="Item">Item</option>
                                    </select>
                                    <select className="bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white flex-1 outline-none" value={newItem.subType} onChange={e => setNewItem({...newItem, subType: e.target.value as any})}>
                                        <option value="Fogo">Fogo</option>
                                        <option value="Corpo-a-corpo">Corpo-a-corpo</option>
                                        <option value="Vestimenta">Vestimenta</option>
                                        <option value="Consumível">Consumível</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                 </div>
                                 <div className="flex gap-2">
                                     <input type="number" step="0.1" placeholder="Kg" className="w-1/3 bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newItem.weight || ''} onChange={e => setNewItem({...newItem, weight: Number(e.target.value)})} />
                                     <input type="number" placeholder="Qtd" className="w-1/3 bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newItem.quantity || ''} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} />
                                 </div>
                                 
                                 {newItem.type === 'Arma' && (
                                     <div className="space-y-2 pt-2 border-t border-white/10">
                                         <input placeholder="Dano (ex: 2d6)" className="w-full bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newItem.damageRoll || ''} onChange={e => setNewItem({...newItem, damageRoll: e.target.value})} />
                                         <input placeholder="Qualidade" className="w-full bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newItem.quality || ''} onChange={e => setNewItem({...newItem, quality: e.target.value})} />
                                         {newItem.subType === 'Fogo' && (
                                             <div className="flex gap-2">
                                                 <input type="number" placeholder="Munição Total" className="w-1/2 bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newItem.ammo || ''} onChange={e => setNewItem({...newItem, ammo: Number(e.target.value)})} />
                                                 <input type="number" placeholder="Gasto/Tiro" className="w-1/2 bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newItem.ammoCost || ''} onChange={e => setNewItem({...newItem, ammoCost: Number(e.target.value)})} />
                                             </div>
                                         )}
                                     </div>
                                 )}
                                 {newItem.type === 'Proteção' && (
                                     <div className="pt-2 border-t border-white/10">
                                         <input type="number" placeholder="Bônus de Defesa" className="w-full bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newItem.defenseBonus || ''} onChange={e => setNewItem({...newItem, defenseBonus: Number(e.target.value)})} />
                                     </div>
                                 )}
                                 <div className="flex gap-2 mt-2">
                                     <button className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-3 rounded-xl text-xs uppercase transition-colors"
                                        onClick={() => setIsCreatingItem(false)}
                                     >Cancelar</button>
                                     <button className="flex-1 bg-veritas-gold hover:bg-yellow-400 text-black font-bold py-3 rounded-xl text-xs uppercase transition-colors"
                                        onClick={() => {
                                            if(newItem.name) {
                                                saveChar({...char, inventory: [...char.inventory, { ...newItem, id: crypto.randomUUID(), equipped: false } as Item]});
                                                setNewItem({ type: 'Arma', subType: 'Fogo', name: '', weight: 0, quantity: 1, description: '', ammoCost: 1, defenseBonus: 0 });
                                                setIsCreatingItem(false);
                                            }
                                        }}
                                     >Salvar</button>
                                 </div>
                            </div>
                        )}

                        {/* Inventory List */}
                        <div className="space-y-2">
                            {char.inventory.map((item, idx) => (
                                <div key={item.id} className={`p-3 rounded-2xl border flex flex-col gap-2 transition-colors ${item.equipped ? 'bg-veritas-gold/10 border-veritas-gold/40' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-bold text-gray-200 flex items-center gap-2">
                                                {item.type === 'Proteção' && (
                                                    <input type="checkbox" checked={item.equipped} onChange={() => toggleItemEquip(item)} className="accent-veritas-gold w-4 h-4 rounded" title="Equipar" />
                                                )}
                                                {item.name}
                                                <span className="text-[10px] bg-black/50 px-2 py-0.5 rounded-full text-gray-500">x{item.quantity}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 flex gap-2 mt-1">
                                                <span>{item.subType}</span>
                                                {item.type === 'Proteção' && <span className="text-blue-400 font-bold">DEF +{item.defenseBonus}</span>}
                                                {item.type === 'Arma' && <span className="text-red-400 font-bold">Dano: {item.damageRoll}</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => saveChar({...char, inventory: char.inventory.filter(i => i.id !== item.id)})} className="text-gray-600 hover:text-red-900"><Trash2 size={14} /></button>
                                    </div>
                                    {item.type === 'Arma' && (
                                        <div className="flex items-center gap-2 mt-1 bg-black/40 p-1.5 rounded-xl">
                                            {item.subType === 'Fogo' && (
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 px-2 border-r border-gray-700 pr-2">
                                                    <input 
                                                        type="number" 
                                                        className="w-8 bg-transparent text-white font-mono text-right outline-none" 
                                                        value={item.ammo} 
                                                        onChange={(e) => {
                                                            const newInv = [...char.inventory];
                                                            newInv[idx].ammo = Number(e.target.value);
                                                            saveChar({...char, inventory: newInv});
                                                        }}
                                                    />
                                                    <span className="text-gray-600">/ {item.ammoCost}</span>
                                                </div>
                                            )}
                                            <button onClick={() => rollWeapon(item)} className="flex-1 flex items-center justify-center gap-1 bg-white/10 hover:bg-veritas-gold hover:text-black text-gray-200 text-[10px] font-bold py-1.5 rounded-lg transition-colors uppercase">
                                                {item.subType === 'Fogo' ? <Crosshair size={12}/> : <Dices size={12}/>}
                                                {item.subType === 'Fogo' ? 'Disparar' : 'Atacar'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
                
                {/* Abilities Content */}
                {activeTabLeft === 'abilities' && (
                    <div className="space-y-4">
                        {!isCreatingAbility ? (
                             <button onClick={() => setIsCreatingAbility(true)} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-2xl text-gray-400 hover:text-white text-xs uppercase font-bold flex items-center justify-center gap-2">
                                 <Plus size={16} /> Adicionar {char.supplement === 'Naruto' ? 'Técnica' : 'Habilidade'}
                             </button>
                        ) : (
                            <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2 animate-in fade-in slide-in-from-top-2">
                                 <h4 className="text-xs uppercase font-bold text-veritas-gold mb-2">Nova {char.supplement === 'Naruto' ? 'Técnica' : 'Habilidade'}</h4>
                                 <input placeholder="Nome" className="w-full bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newAbility.name} onChange={e => setNewAbility({...newAbility, name: e.target.value})} />
                                 <div className="flex gap-2">
                                     <input type="number" placeholder={char.supplement==='Naruto' ? 'Custo CHA' : 'Custo PE'} className="w-1/3 bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newAbility.costPE || ''} onChange={e => setNewAbility({...newAbility, costPE: Number(e.target.value)})} />
                                     <input placeholder="Dano" className="flex-1 bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white outline-none" value={newAbility.damage || ''} onChange={e => setNewAbility({...newAbility, damage: e.target.value})} />
                                 </div>
                                 <textarea placeholder="Descrição" className="w-full bg-black/50 border border-white/10 p-2 rounded-xl text-xs text-white h-16 outline-none" value={newAbility.description || ''} onChange={e => setNewAbility({...newAbility, description: e.target.value})} />
                                 
                                 <div className="flex gap-2 mt-2">
                                     <button className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-2 rounded-xl text-xs uppercase"
                                        onClick={() => setIsCreatingAbility(false)}
                                     >Cancelar</button>
                                     <button className="flex-1 bg-veritas-gold hover:bg-yellow-400 text-black font-bold py-2 rounded-xl text-xs uppercase"
                                        onClick={() => {
                                            if(newAbility.name) {
                                                saveChar({...char, abilities: [...char.abilities, { ...newAbility, id: crypto.randomUUID() } as Ability]});
                                                setNewAbility({ name: '', costPE: 0, description: '' });
                                                setIsCreatingAbility(false);
                                            }
                                        }}
                                     >Salvar</button>
                                 </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            {char.abilities.map(ab => (
                                <div key={ab.id} className="bg-black/20 p-3 rounded-2xl border border-white/5 group relative hover:border-white/20 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="font-bold text-white">{ab.name}</div>
                                        <div className="text-xs text-veritas-gold font-mono font-bold bg-black/40 px-2 py-0.5 rounded-full">{ab.costPE} {char.supplement === 'Naruto' ? 'CHA' : 'PE'}</div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-2 leading-relaxed">{ab.description}</div>
                                    <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-2">
                                         <span className="text-[10px] text-red-400 font-bold">{ab.damage && `Dano: ${ab.damage}`}</span>
                                         <div className="flex gap-2">
                                            <button onClick={() => useAbility(ab)} className="p-1.5 bg-white/5 hover:bg-veritas-gold hover:text-black rounded-full text-veritas-gold"><Zap size={14}/></button>
                                            <button onClick={() => saveChar({...char, abilities: char.abilities.filter(a => a.id !== ab.id)})} className="p-1.5 text-gray-600 hover:text-red-500"><Trash2 size={14}/></button>
                                         </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* CENTER COLUMN: Stats & Attributes */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6 overflow-y-auto pb-4">
            
            {/* Vitals Container */}
            <div className="flex flex-col gap-4 relative">
                <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="absolute top-0 right-0 text-gray-500 hover:text-white bg-black/40 p-2 rounded-full z-10"><Settings size={14}/></button>
                
                {isSettingsOpen && (
                    <div className="bg-black/90 border border-white/10 p-4 rounded-2xl mb-4 text-xs space-y-3 shadow-2xl backdrop-blur-xl absolute top-8 right-0 z-20 w-64">
                        <h4 className="font-bold text-gray-400 uppercase">Configurações</h4>
                        <div className="flex items-center justify-between">
                            <span>Exibir Sanidade</span>
                            <button onClick={() => saveChar({...char, san: {...char.san, enabled: !char.san.enabled}})}>{char.san.enabled ? <Eye size={16} className="text-green-500"/> : <EyeOff size={16} className="text-red-500"/>}</button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Exibir Energia/Chakra</span>
                            <button onClick={() => saveChar({...char, pe: {...char.pe, enabled: !char.pe.enabled}})}>{char.pe.enabled ? <Eye size={16} className="text-green-500"/> : <EyeOff size={16} className="text-red-500"/>}</button>
                        </div>
                        <div className="border-t border-gray-800 pt-2 space-y-2">
                             <div className="flex justify-between items-center">
                                <span>PV Max</span>
                                <input type="number" className="w-12 bg-gray-900 text-white px-1 rounded" value={char.hp.max} onChange={e => saveChar({...char, hp: {...char.hp, max: Number(e.target.value)}})} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>PE Max</span>
                                <input type="number" className="w-12 bg-gray-900 text-white px-1 rounded" value={char.pe.max} onChange={e => saveChar({...char, pe: {...char.pe, max: Number(e.target.value)}})} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span>SAN Max</span>
                                <input type="number" className="w-12 bg-gray-900 text-white px-1 rounded" value={char.san.max} onChange={e => saveChar({...char, san: {...char.san, max: Number(e.target.value)}})} />
                            </div>
                        </div>
                    </div>
                )}

                {/* HP */}
                <div className="bg-gradient-to-r from-red-950/40 to-black/40 p-5 rounded-3xl border border-red-900/30 shadow-[0_0_20px_rgba(220,38,38,0.1)] backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="flex items-center gap-2 font-bold text-veritas-blood uppercase tracking-widest text-sm"><Heart size={16} className="fill-current"/> Vida</span>
                        <span className="text-2xl font-mono text-veritas-blood font-bold">{char.hp.current} / {char.hp.max}</span>
                    </div>
                    <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-veritas-blood transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${(char.hp.current / char.hp.max) * 100}%` }}></div>
                    </div>
                     <div className="flex gap-2 mt-4 justify-center">
                        <button onClick={() => adjustStat('hp', -1)} className="bg-red-950/50 w-10 h-10 rounded-full hover:bg-red-900 text-red-500 font-bold border border-red-900/30">-1</button>
                        <button onClick={() => adjustStat('hp', -5)} className="bg-red-950/50 w-10 h-10 rounded-full hover:bg-red-900 text-red-500 font-bold border border-red-900/30">-5</button>
                        <div className="w-4"></div>
                        <button onClick={() => adjustStat('hp', 1)} className="bg-red-950/50 w-10 h-10 rounded-full hover:bg-red-900 text-red-500 font-bold border border-red-900/30">+1</button>
                         <button onClick={() => adjustStat('hp', 5)} className="bg-red-950/50 w-10 h-10 rounded-full hover:bg-red-900 text-red-500 font-bold border border-red-900/30">+5</button>
                    </div>
                </div>
                
                {/* SAN */}
                {char.supplement === 'Base' && char.san.enabled && (
                     <div className="bg-gradient-to-r from-blue-950/40 to-black/40 p-4 rounded-3xl border border-blue-900/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-1">
                            <span className="flex items-center gap-2 font-bold text-veritas-blue uppercase text-xs tracking-widest"><Brain size={14}/> Sanidade</span>
                            <span className="font-mono text-veritas-blue font-bold">{char.san.current} / {char.san.max}</span>
                        </div>
                        <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-veritas-blue transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: `${(char.san.current / char.san.max) * 100}%` }}></div>
                        </div>
                         <div className="flex gap-2 mt-3 justify-end">
                            <button onClick={() => adjustStat('san', -1)} className="w-8 h-8 flex items-center justify-center bg-blue-900/20 rounded-full hover:bg-blue-900 text-blue-500 border border-blue-900/20">-</button>
                            <button onClick={() => adjustStat('san', 1)} className="w-8 h-8 flex items-center justify-center bg-blue-900/20 rounded-full hover:bg-blue-900 text-blue-500 border border-blue-900/20">+</button>
                        </div>
                    </div>
                )}

                {/* PE / Chakra */}
                {(char.supplement === 'Base' || char.supplement === 'Naruto') && char.pe.enabled && (
                    <div className={`p-4 rounded-3xl border backdrop-blur-sm ${char.supplement === 'Naruto' ? 'bg-gradient-to-r from-cyan-950/40 to-black/40 border-cyan-900/30' : 'bg-gradient-to-r from-yellow-950/40 to-black/40 border-yellow-900/30'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`flex items-center gap-2 font-bold uppercase text-xs tracking-widest ${char.supplement === 'Naruto' ? 'text-cyan-400' : 'text-yellow-500'}`}><Zap size={14}/> {char.supplement === 'Naruto' ? 'Chakra' : 'Energia'}</span>
                            <span className={`font-mono font-bold ${char.supplement === 'Naruto' ? 'text-cyan-400' : 'text-yellow-500'}`}>{char.pe.current} / {char.pe.max}</span>
                        </div>
                        <div className={`h-2 bg-black/50 rounded-full overflow-hidden border border-white/5`}>
                            <div className={`h-full transition-all duration-300 ${char.supplement === 'Naruto' ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'}`} style={{ width: `${(char.pe.current / char.pe.max) * 100}%` }}></div>
                        </div>
                        <div className="flex gap-2 mt-3 justify-end">
                            <button onClick={() => adjustStat('pe', -1)} className={`w-8 h-8 flex items-center justify-center rounded-full border bg-opacity-20 hover:bg-opacity-100 ${char.supplement === 'Naruto' ? 'bg-cyan-900 border-cyan-900/20 text-cyan-500 hover:text-white' : 'bg-yellow-900 border-yellow-900/20 text-yellow-500 hover:text-white'}`}>-</button>
                             <button onClick={() => adjustStat('pe', 1)} className={`w-8 h-8 flex items-center justify-center rounded-full border bg-opacity-20 hover:bg-opacity-100 ${char.supplement === 'Naruto' ? 'bg-cyan-900 border-cyan-900/20 text-cyan-500 hover:text-white' : 'bg-yellow-900 border-yellow-900/20 text-yellow-500 hover:text-white'}`}>+</button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Defense Block */}
            <div className="bg-gradient-to-br from-white/10 to-white/0 border border-white/10 rounded-3xl p-6 flex items-center justify-between shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                        <Shield size={24} className="text-gray-300" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest">Defesa Total</h3>
                        <p className="text-[10px] text-gray-500">Base + Atributo + Equip</p>
                    </div>
                </div>
                <div className="text-5xl font-mono font-bold text-white tracking-tighter drop-shadow-lg">{finalDefense}</div>
            </div>

            {/* Attributes CIRCULAR Area */}
            <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
                    {ATTR_KEYS.map((key) => (
                         <div key={key} onClick={() => rollAttribute(key)} className="aspect-square flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-black border border-white/10 rounded-full hover:border-veritas-gold cursor-pointer group transition-all relative overflow-hidden shadow-xl hover:scale-105 active:scale-95">
                             <div className="absolute inset-0 bg-veritas-gold opacity-0 group-hover:opacity-10 transition-opacity rounded-full"></div>
                             
                             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1 z-10">{key}</span>
                             <span className="text-4xl font-bold text-white font-mono z-10">{char.attributes[key]}</span>
                             
                             <div className="absolute bottom-3 opacity-0 group-hover:opacity-100 transition-opacity text-veritas-gold">
                                <Dices size={14}/>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Skills */}
        {char.supplement !== 'Slasher' && (
            <div className="col-span-12 md:col-span-4 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-md rounded-3xl overflow-y-auto shadow-xl">
                 <div className="p-4 bg-white/5 border-b border-white/10 font-bold text-gray-400 uppercase text-xs tracking-wider text-center sticky top-0 backdrop-blur-md z-10">
                     Lista de Perícias
                 </div>
                 <div className="p-2">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-gray-500 text-[10px] uppercase tracking-wider">
                            <tr>
                                <th className="p-2 w-10 text-center"></th>
                                <th className="p-2">Nome</th>
                                <th className="p-2 text-center">Attr</th>
                                <th className="p-2 text-center">Treino</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {char.skills.map((skill, idx) => {
                                const colorClass = 
                                    skill.training === 15 ? 'text-veritas-training-15' :
                                    skill.training === 10 ? 'text-veritas-training-10' :
                                    skill.training === 5 ? 'text-veritas-training-5' : 'text-gray-500';
                                
                                return (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group rounded-lg">
                                        <td className="p-2 text-center">
                                            <button onClick={() => rollSkill(idx)} className={`opacity-40 group-hover:opacity-100 hover:scale-110 transition-all ${colorClass}`}>
                                                <Dices className="w-4 h-4" />
                                            </button>
                                        </td>
                                        <td className="p-2 font-medium text-gray-300">{skill.name}</td>
                                        <td className={`p-2 text-center text-[10px] font-bold ${colorClass}`}>
                                            <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 bg-black/20 rounded-full px-2 py-1">
                                                <select 
                                                    value={skill.attrPrimary} 
                                                    onChange={(e) => updateSkillAttribute(idx, 'primary', e.target.value as AttributeKey)}
                                                    className="bg-transparent appearance-none outline-none cursor-pointer text-right w-6 hover:text-white"
                                                >
                                                    {ATTR_KEYS.map(k => <option key={k} value={k} className="bg-gray-900 text-gray-300">{k}</option>)}
                                                </select>
                                                <span className="text-gray-600">/</span>
                                                <select 
                                                    value={skill.attrSecondary} 
                                                    onChange={(e) => updateSkillAttribute(idx, 'secondary', e.target.value as AttributeKey)}
                                                    className="bg-transparent appearance-none outline-none cursor-pointer w-6 hover:text-white"
                                                >
                                                    {ATTR_KEYS.map(k => <option key={k} value={k} className="bg-gray-900 text-gray-300">{k}</option>)}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => {
                                                const levels = [0, 5, 10, 15];
                                                const currentIdx = levels.indexOf(skill.training);
                                                const next = levels[(currentIdx + 1) % levels.length];
                                                const newSkills = [...char.skills];
                                                newSkills[idx].training = next;
                                                saveChar({...char, skills: newSkills});
                                            }} className={`${colorClass} font-bold text-xs bg-black/30 w-8 h-6 rounded-full flex items-center justify-center mx-auto hover:bg-white/10 transition-colors border border-white/5`}>
                                                {skill.training > 0 ? skill.training : '-'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>
            </div>
        )}

      </div>
      
      {/* Level Up Modal */}
      {isLevelUpOpen && pendingLevelChar && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#181818] border border-veritas-gold/30 rounded-3xl shadow-2xl w-full max-w-lg p-8 flex flex-col gap-6 relative">
                     <div className="absolute inset-0 bg-gradient-to-b from-veritas-gold/5 to-transparent rounded-3xl pointer-events-none"></div>
                    
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 z-10">
                        <h2 className="text-3xl font-bold text-veritas-gold">Nível {pendingLevelChar.level}</h2>
                        <button onClick={() => setIsLevelUpOpen(false)} className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10"><X /></button>
                    </div>

                    <div className="z-10">
                    {levelUpStep === 'roll' && (
                        <div className="text-center py-4">
                            {!levelRolls.rolled ? (
                                <button onClick={performLevelRolls} className="bg-veritas-gold text-black px-8 py-4 rounded-full font-bold text-xl hover:bg-yellow-400 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-transform hover:scale-105">
                                    ROLAR DADOS
                                </button>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-center gap-6">
                                        <div className="bg-red-950/30 p-6 rounded-2xl border border-red-500/30 w-32">
                                            <div className="text-xs text-red-400 uppercase font-bold mb-1">Vida</div>
                                            <div className="text-4xl font-bold text-red-500">+{levelRolls.hp}</div>
                                        </div>
                                        {char.supplement !== 'Slasher' && (
                                            <div className="bg-blue-950/30 p-6 rounded-2xl border border-blue-500/30 w-32">
                                                <div className="text-xs text-blue-400 uppercase font-bold mb-1">{char.supplement === 'Naruto' ? 'Chakra' : 'SAN / PE'}</div>
                                                <div className="text-4xl font-bold text-blue-500">+{levelRolls.sanPe}</div>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={nextLevelStep} className="bg-white/10 hover:bg-white hover:text-black text-white px-6 py-3 rounded-full font-bold w-full transition-colors">
                                        CONTINUAR
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {levelUpStep === 'attr' && (
                        <div>
                             <p className="mb-6 text-center text-lg">Distribua <span className="text-veritas-gold font-bold text-2xl">{attrPointsAvailable}</span> pontos.</p>
                             <div className="grid grid-cols-3 gap-4">
                                {(Object.keys(pendingLevelChar.attributes) as AttributeKey[]).map(key => (
                                    <div key={key} className="bg-black/40 p-3 rounded-2xl flex flex-col items-center border border-white/10">
                                        <span className="text-xs text-gray-500 font-bold mb-1">{key}</span>
                                        <span className="text-2xl font-bold text-white mb-2">{pendingLevelChar.attributes[key]}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => updatePendingAttr(key, -1)} className="w-8 h-8 bg-white/5 rounded-full hover:bg-white/20 flex items-center justify-center text-lg">-</button>
                                            <button onClick={() => updatePendingAttr(key, 1)} className="w-8 h-8 bg-white/5 rounded-full hover:bg-white/20 flex items-center justify-center text-lg" disabled={attrPointsAvailable === 0}>+</button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                             <button onClick={nextLevelStep} disabled={attrPointsAvailable > 0} className="mt-6 w-full bg-veritas-gold text-black font-bold py-3 rounded-full disabled:opacity-50 hover:bg-yellow-400">Continuar</button>
                        </div>
                    )}
                    {levelUpStep === 'skills' && (
                        <div className="flex flex-col h-[400px]">
                            <p className="mb-4 text-center text-lg">Treine <span className="text-veritas-gold font-bold text-2xl">{skillPointsAvailable}</span> perícias.</p>
                            <div className="flex-1 overflow-y-auto bg-black/20 rounded-2xl p-2 space-y-2 border border-white/5 pr-2">
                                {pendingLevelChar.skills.map((s, idx) => {
                                    const levels = [0, 5, 10, 15];
                                    const currentIdx = levels.indexOf(s.training);
                                    const canUpgrade = currentIdx < levels.length - 1 && skillPointsAvailable > 0;
                                    return (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <span className="font-medium text-gray-300">{s.name} <span className={`text-xs font-bold ${s.training>0 ? 'text-veritas-gold':'text-gray-500'}`}>({s.training})</span></span>
                                            {canUpgrade && (
                                                <button onClick={() => togglePendingSkill(idx)} className="bg-veritas-gold/20 text-veritas-gold hover:bg-veritas-gold hover:text-black px-3 py-1 rounded-full text-xs font-bold transition-colors">
                                                    Melhorar
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={finalizeLevelUp} disabled={skillPointsAvailable > 0} className="mt-4 w-full bg-veritas-gold text-black font-bold py-3 rounded-full disabled:opacity-50 hover:bg-yellow-400">Concluir</button>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
