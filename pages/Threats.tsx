
import React, { useState, useContext } from 'react';
import { DataService } from '../services/dataService';
import { Threat, AttributeKey, ThreatAttack } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Sword, Dices, Skull } from 'lucide-react';
import { rollD20Check, rollGeneric } from '../components/DiceRoller';
import { RollContext } from '../App';

// More detailed Inverted Pentagram
const PentagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="50" cy="50" r="48" strokeWidth="1.5" />
    <path d="M50 95 L20 35 L80 35 L50 95 Z" opacity="0.1"/>
    <path d="M50 90 L21 35 L98 62 L2 62 L79 35 Z" strokeWidth="1.5" fill="none"/>
    <circle cx="50" cy="50" r="10" strokeWidth="1" opacity="0.5"/>
  </svg>
);

// INT removed from this list for Threats
const THREAT_ATTR_KEYS: AttributeKey[] = ['DES', 'CON', 'PRE', 'PER', 'FOR'];

const POINTS_BY_LEVEL = {
    1: 3,
    2: 5,
    3: 8,
    4: 12,
    5: 16
};

export const Threats: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>(DataService.getThreats());
  const [isCreating, setIsCreating] = useState(false);
  const { addLog } = useContext(RollContext);
  
  // Creation State
  const [newThreat, setNewThreat] = useState<Partial<Threat>>({
    name: '',
    description: '',
    level: 1,
    // Start with 1 in everything. INT is stored for type compatibility but ignored in UI.
    attributes: { DES: 1, CON: 1, INT: 1, PRE: 1, PER: 1, FOR: 1 },
    attacks: []
  });

  const [isAddingAttack, setIsAddingAttack] = useState<string | null>(null); // Threat ID
  const [newAttack, setNewAttack] = useState<Partial<ThreatAttack>>({ hitBonus: 5, costPE: 0, name: '', damageRoll: '' });

  // Point Buy Logic
  const getPointsUsed = () => {
      if (!newThreat.attributes) return 0;
      let used = 0;
      THREAT_ATTR_KEYS.forEach(key => {
          used += (newThreat.attributes![key] - 1); // Cost is value - base(1)
      });
      return used;
  };

  const pointsBudget = POINTS_BY_LEVEL[newThreat.level as 1|2|3|4|5] || 3;
  const pointsUsed = getPointsUsed();
  const pointsRemaining = pointsBudget - pointsUsed;

  const updateAttribute = (key: AttributeKey, value: number) => {
      const currentVal = newThreat.attributes![key];
      const diff = value - currentVal;
      
      // Validation: Can't go below 1, Can't go above 5
      if (value < 1 || value > 5) return;

      // Validation: Can't spend more than budget
      if (diff > 0 && pointsRemaining < diff) return;

      setNewThreat({
          ...newThreat,
          attributes: { ...newThreat.attributes!, [key]: value }
      });
  };

  const calculateThreatStats = (t: Partial<Threat>) => {
      const con = t.attributes!.CON;
      const pre = t.attributes!.PRE;
      const lvl = t.level!;
      
      let hp = 0;
      let def = 0;
      let pe = 0;

      if(lvl === 1) { hp = con + 10; def = 16; pe = pre + 4; }
      if(lvl === 2) { hp = (con * 2) + 16; def = 14; pe = (pre * 2) + 6; }
      if(lvl === 3) { hp = (con * 3) + 25; def = 12; pe = (pre * 3) + 10; }
      if(lvl === 4) { hp = (con * 4) + 50; def = 10; pe = (pre * 4) + 14; }
      if(lvl === 5) { hp = (con * 5) + 80; def = 8; pe = (pre * 5) + 16; }

      return {
          hp: { current: hp, max: hp },
          defense: def,
          pe: { current: pe, max: pe }
      };
  };

  const handleSave = () => {
      const stats = calculateThreatStats(newThreat);
      const threat: Threat = {
          id: crypto.randomUUID(),
          name: newThreat.name!,
          description: newThreat.description!,
          level: newThreat.level!,
          attributes: newThreat.attributes!,
          attacks: [],
          ...stats
      };
      DataService.saveThreat(threat);
      setThreats(DataService.getThreats());
      setIsCreating(false);
      setNewThreat({
        name: '', description: '', level: 1,
        attributes: { DES: 1, CON: 1, INT: 1, PRE: 1, PER: 1, FOR: 1 },
        attacks: []
      });
  };

  const saveAttack = (threatId: string) => {
      if(!newAttack.name) return;
      const threat = threats.find(t => t.id === threatId);
      if(!threat) return;

      const attack: ThreatAttack = {
          id: crypto.randomUUID(),
          name: newAttack.name!,
          costPE: newAttack.costPE || 0,
          hitBonus: newAttack.hitBonus as any,
          damageRoll: newAttack.damageRoll || '',
          description: newAttack.description
      };
      
      const updated = { ...threat, attacks: [...(threat.attacks || []), attack] };
      DataService.saveThreat(updated);
      setThreats(DataService.getThreats());
      setIsAddingAttack(null);
      setNewAttack({ hitBonus: 5, costPE: 0, name: '', damageRoll: '' });
  };

  const rollAttack = (threat: Threat, attack: ThreatAttack) => {
      // 1. Deduct PE
      if (threat.pe.current < attack.costPE) {
          alert("PE Insuficiente!");
          return;
      }
      const newPe = threat.pe.current - attack.costPE;
      const updatedThreat = { ...threat, pe: { ...threat.pe, current: newPe } };
      DataService.saveThreat(updatedThreat);
      setThreats(DataService.getThreats());
      
      const mod = attack.hitBonus === 0 ? 0 : attack.hitBonus;
      const label = mod === 0 ? `Ataque: ${attack.name} (Sem mod)` : `Ataque: ${attack.name}`;
      
      const res = rollD20Check(1, mod, label, threat.name);
      addLog(res);
  };

  const rollDamage = (threatName: string, attack: ThreatAttack) => {
      if(attack.damageRoll) {
          const res = rollGeneric(attack.damageRoll, `Dano: ${attack.name}`, threatName);
          addLog(res);
      }
  };

  const rollThreatAttribute = (t: Threat, key: AttributeKey) => {
      const val = t.attributes[key];
      const res = rollD20Check(val, 0, `Teste de ${key} (Ameaça)`, t.name);
      addLog(res);
  };

  // Chart data excludes INT
  const chartData = (attr: Record<AttributeKey, number>) => [
      { subject: 'DES', A: attr.DES, fullMark: 5 },
      { subject: 'CON', A: attr.CON, fullMark: 5 },
      { subject: 'PRE', A: attr.PRE, fullMark: 5 },
      { subject: 'PER', A: attr.PER, fullMark: 5 },
      { subject: 'FOR', A: attr.FOR, fullMark: 5 },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto min-h-screen text-red-100 font-sans">
        <div className="flex justify-between items-center mb-8 pb-4">
            <div>
                <h1 className="text-4xl font-light text-white flex items-center gap-3">
                    <PentagramIcon className="w-10 h-10 text-veritas-blood" />
                    Registro de <span className="text-veritas-blood font-bold">Ameaças</span>
                </h1>
            </div>
            <button onClick={() => setIsCreating(!isCreating)} className="flex items-center gap-2 bg-veritas-blood text-black px-6 py-3 rounded-full font-bold hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <Plus size={20} />
                Nova Ameaça
            </button>
        </div>

        {isCreating && (
            <div className="bg-gradient-to-br from-red-950/20 to-black border border-veritas-blood/30 p-8 rounded-3xl mb-8 shadow-2xl backdrop-blur-md">
                <h3 className="text-2xl font-bold text-veritas-blood mb-6 flex items-center gap-2"><Skull /> Criar Nova Ameaça</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <input placeholder="Nome da Abominação" className="w-full bg-black/50 border border-red-900/50 p-4 rounded-xl text-white focus:border-veritas-blood outline-none transition-colors" value={newThreat.name} onChange={e => setNewThreat({...newThreat, name: e.target.value})} />
                        <textarea placeholder="Descrição Sombria" className="w-full bg-black/50 border border-red-900/50 p-4 rounded-xl text-white focus:border-veritas-blood outline-none h-32 transition-colors" value={newThreat.description} onChange={e => setNewThreat({...newThreat, description: e.target.value})} />
                        
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-red-500 text-xs font-bold uppercase mb-2 block tracking-widest">Nível de Ameaça (NA-{newThreat.level})</label>
                                <div className="flex items-center gap-4 bg-black/30 p-3 rounded-xl border border-red-900/30">
                                    <input type="range" min="1" max="5" className="w-full accent-veritas-blood h-2 bg-red-900/50 rounded-lg appearance-none cursor-pointer" 
                                        value={newThreat.level} 
                                        onChange={e => {
                                            // Reset attributes to 1 when changing level to avoid budget issues
                                            setNewThreat({
                                                ...newThreat, 
                                                level: Number(e.target.value) as any,
                                                attributes: { DES: 1, CON: 1, INT: 1, PRE: 1, PER: 1, FOR: 1 }
                                            });
                                        }} 
                                    />
                                    <span className="text-veritas-blood font-bold text-3xl w-8 text-center">{newThreat.level}</span>
                                </div>
                            </div>
                            <div className="flex-1 bg-black/30 p-3 rounded-xl border border-red-900/30 flex flex-col items-center justify-center">
                                <label className="text-red-500 text-xs font-bold uppercase mb-1 tracking-widest">Pontos</label>
                                <div className={`text-2xl font-bold ${pointsRemaining === 0 ? 'text-green-500' : 'text-white'}`}>
                                    {pointsRemaining} / {pointsBudget}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {THREAT_ATTR_KEYS.map(key => (
                                <div key={key} className="bg-black/30 p-2 rounded-2xl border border-red-900/30 text-center relative overflow-hidden group">
                                    <label className="text-[10px] text-red-500 font-bold block mb-1">{key}</label>
                                    <div className="flex items-center justify-center gap-1">
                                        <button onClick={() => updateAttribute(key, newThreat.attributes![key] - 1)} className="text-red-500 hover:text-white">-</button>
                                        <span className="text-white font-bold text-lg w-4">{newThreat.attributes![key]}</span>
                                        <button 
                                            onClick={() => updateAttribute(key, newThreat.attributes![key] + 1)} 
                                            disabled={pointsRemaining <= 0 || newThreat.attributes![key] >= 5}
                                            className="text-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSave} className="w-full bg-veritas-blood text-black font-bold py-4 rounded-xl mt-4 hover:bg-red-500 uppercase tracking-widest transition-all shadow-lg hover:shadow-red-900/40">Invocar Ameaça</button>
                    </div>
                    <div className="h-80 flex items-center justify-center bg-black/40 rounded-3xl border border-red-900/20 relative">
                        <PentagramIcon className="absolute w-64 h-64 text-red-900/10" />
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData(newThreat.attributes!)}>
                                <PolarGrid stroke="#450a0a" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#ef4444', fontSize: 12, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                <Radar name="Atributos" dataKey="A" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {threats.map(t => (
                <div key={t.id} className="bg-gradient-to-br from-red-950/10 to-black/80 border border-red-900/30 backdrop-blur-md rounded-3xl p-6 relative group hover:border-veritas-blood transition-all shadow-xl hover:shadow-2xl overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-900/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="absolute top-4 right-4 text-veritas-blood font-bold text-sm border border-veritas-blood rounded-full px-3 py-1 flex items-center justify-center bg-black shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                        NA-{t.level}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 relative z-10">{t.name}</h2>
                    <p className="text-red-300/60 text-sm mb-6 h-12 overflow-hidden text-ellipsis italic relative z-10">"{t.description}"</p>
                    
                    <div className="grid grid-cols-3 gap-2 mb-6 text-center text-xs relative z-10">
                        <div className="bg-black/50 p-2 rounded-xl border border-red-900/30"><span className="text-red-500 font-bold block mb-1">PV</span>{t.hp.current}/{t.hp.max}</div>
                        <div className="bg-black/50 p-2 rounded-xl border border-red-900/30"><span className="text-red-500 font-bold block mb-1">DEF</span>{t.defense}</div>
                        <div className="bg-black/50 p-2 rounded-xl border border-red-900/30"><span className="text-veritas-blood font-bold block mb-1">PE</span>{t.pe.current}/{t.pe.max}</div>
                    </div>

                    {/* Attributes Click-to-Roll - Circular (Without INT) */}
                    <div className="flex justify-between gap-1 mb-6 relative z-10 px-2">
                        {THREAT_ATTR_KEYS.map((key) => {
                            const val = t.attributes[key];
                            return (
                                <button 
                                    key={key} 
                                    onClick={() => rollThreatAttribute(t, key)}
                                    title={`Rolar ${key}`}
                                    className="w-10 h-10 rounded-full bg-black/40 hover:bg-veritas-blood hover:text-black border border-red-900/50 flex flex-col items-center justify-center transition-all group/attr hover:scale-110"
                                >
                                    <span className="text-[6px] text-red-500 font-bold group-hover/attr:text-black">{key}</span>
                                    <span className="text-sm font-bold text-white group-hover/attr:text-black">{val}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Attacks Section */}
                    <div className="mb-4 bg-black/30 rounded-2xl p-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-red-900 border border-red-900/20 relative z-10">
                        <div className="flex justify-between items-center mb-3 border-b border-red-900/30 pb-2">
                             <span className="text-xs font-bold text-red-500 uppercase flex items-center gap-1 tracking-wider"><Sword size={12}/> Ataques</span>
                             <button onClick={() => setIsAddingAttack(t.id)} className="text-veritas-blood hover:text-white bg-red-900/20 p-1 rounded-full"><Plus size={14}/></button>
                        </div>
                        
                        {(t.attacks || []).map(atk => (
                            <div key={atk.id} className="mb-2 bg-red-950/10 p-3 rounded-xl border border-red-900/20 flex justify-between items-center group/atk hover:bg-red-900/20 transition-colors">
                                <div>
                                    <div className="font-bold text-sm text-red-100">{atk.name} <span className="text-veritas-blood text-[10px]">({atk.costPE} PE)</span></div>
                                    <div className="text-[10px] text-red-400">
                                        {atk.hitBonus === 0 ? 'Sem modificador' : `Hit +${atk.hitBonus}`} | Dano {atk.damageRoll}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => rollAttack(t, atk)} title="Rolar Ataque" className="w-7 h-7 flex items-center justify-center bg-red-900/30 hover:bg-veritas-blood hover:text-black rounded-full text-red-300 transition-colors">
                                        <Sword size={12}/>
                                    </button>
                                     <button onClick={() => rollDamage(t.name, atk)} title="Rolar Dano" className="w-7 h-7 flex items-center justify-center bg-red-900/30 hover:bg-white hover:text-red-900 rounded-full text-red-300 transition-colors">
                                        <Dices size={12}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* New Attack Form */}
                    {isAddingAttack === t.id && (
                        <div className="absolute inset-0 bg-[#0a0000]/95 backdrop-blur-sm z-20 p-6 rounded-3xl flex flex-col gap-3 justify-center border border-veritas-blood shadow-2xl">
                            <h4 className="text-veritas-blood font-bold text-sm uppercase text-center mb-2">Novo Ataque</h4>
                            <input className="bg-white/5 p-3 rounded-xl text-xs text-white border border-red-900/50 outline-none focus:border-red-500" placeholder="Nome do Ataque" value={newAttack.name} onChange={e => setNewAttack({...newAttack, name: e.target.value})} />
                            <div className="flex gap-2">
                                <input type="number" className="bg-white/5 p-3 rounded-xl text-xs text-white w-1/2 border border-red-900/50 outline-none" placeholder="Custo PE" value={newAttack.costPE || ''} onChange={e => setNewAttack({...newAttack, costPE: Number(e.target.value)})} />
                                <select className="bg-white/5 p-3 rounded-xl text-xs text-white w-1/2 border border-red-900/50 outline-none" value={newAttack.hitBonus} onChange={e => setNewAttack({...newAttack, hitBonus: Number(e.target.value) as any})}>
                                    <option value={0} className="bg-black text-white">Sem modificador (0)</option>
                                    <option value={5} className="bg-black text-white">+5</option>
                                    <option value={10} className="bg-black text-white">+10</option>
                                    <option value={15} className="bg-black text-white">+15</option>
                                </select>
                            </div>
                            <input className="bg-white/5 p-3 rounded-xl text-xs text-white border border-red-900/50 outline-none" placeholder="Dano (ex: 2d6+2)" value={newAttack.damageRoll} onChange={e => setNewAttack({...newAttack, damageRoll: e.target.value})} />
                            <div className="flex gap-2 mt-4">
                                <button onClick={() => setIsAddingAttack(null)} className="flex-1 bg-transparent text-red-300 text-xs py-3 rounded-full border border-red-900 hover:bg-red-900/20">Cancelar</button>
                                <button onClick={() => saveAttack(t.id)} className="flex-1 bg-veritas-blood text-black text-xs py-3 rounded-full font-bold hover:bg-red-500 shadow-lg">Adicionar</button>
                            </div>
                        </div>
                    )}

                    <button onClick={() => { DataService.deleteThreat(t.id); setThreats(DataService.getThreats()); }} className="absolute bottom-6 right-6 text-red-900 hover:text-red-500 transition-colors z-10">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
        </div>
    </div>
  );
};
