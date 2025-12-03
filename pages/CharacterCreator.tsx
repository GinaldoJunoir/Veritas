
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { INITIAL_ATTRIBUTES, JOBS_DATA, SKILL_LIST_TEMPLATE } from '../constants';
import { AttributeKey, Character, Skill, SupplementType } from '../types';
import { DataService } from '../services/dataService';

export const CharacterCreator: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const supplement: SupplementType = location.state?.supplement || 'Base';

  const [step, setStep] = useState(1);
  const [points, setPoints] = useState(3);
  
  // State for Character Data
  const [charData, setCharData] = useState<Partial<Character>>({
    attributes: { ...INITIAL_ATTRIBUTES },
    name: '',
    history: '',
    ideology: '',
    keyConnection: '',
    importantPeople: '',
    job: '',
    variant: '',
    powerLevel: 'Mortal'
  });

  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  // If Slasher, we strictly limit what's needed.
  const isSlasher = supplement === 'Slasher';

  const updateAttr = (key: AttributeKey, delta: number) => {
    const current = charData.attributes![key];
    if (delta > 0 && points > 0 && current < 5) {
      setCharData(prev => ({ ...prev, attributes: { ...prev.attributes!, [key]: current + 1 } }));
      setPoints(p => p - 1);
    } else if (delta < 0 && current > 0) { // Can go to 0
      setCharData(prev => ({ ...prev, attributes: { ...prev.attributes!, [key]: current - 1 } }));
      setPoints(p => p + 1);
    }
  };

  const handleJobSelect = (job: string) => {
    setSelectedJob(job);
    setSelectedVariant('');
  };

  const handleVariantSelect = (variant: string) => {
    setSelectedVariant(variant);
  };

  const calculateStats = (finalChar: Character) => {
    const { attributes: attr, powerLevel } = finalChar;
    const con = attr.CON;
    const pre = attr.PRE;
    const force = attr.FOR;

    let hpBase = 0;
    let sanBase = 0;
    let peBase = 0;
    let defBase = 0;

    switch(powerLevel) {
      case 'Mortal':
        hpBase = (con * 2) + 10;
        sanBase = (pre * 2) + 18;
        peBase = (pre * 2) + 10;
        defBase = (force * 2) + 6;
        break;
      case 'Heroico':
        hpBase = (con * 2) + 20;
        sanBase = (pre * 2) + 30;
        peBase = (pre * 2) + 20;
        defBase = (force * 2) + 8;
        break;
      case 'Épico':
        hpBase = (con * 3) + 30;
        sanBase = (pre * 3) + 50;
        peBase = (pre * 3) + 30;
        defBase = (force * 3) + 10;
        break;
    }

    finalChar.hp = { current: hpBase, max: hpBase };
    finalChar.san = { current: sanBase, max: sanBase, enabled: supplement === 'Base' };
    finalChar.pe = { current: peBase, max: peBase, enabled: supplement !== 'Slasher' };
    finalChar.defense = { total: defBase, bonus: 0 };
    
    // Supplement Specifics
    if (supplement === 'Slasher') {
        // Courage replaces derived stats conceptually, lets initialize it
        // Formula not specified, giving base 10 + PRE
        const courage = 10 + pre;
        finalChar.courage = { current: courage, max: courage };
    }
  };

  const finishCreation = () => {
    // Generate Skills
    const skills: Skill[] = SKILL_LIST_TEMPLATE.map(s => ({
        ...s,
        training: 0
    }));

    // Apply Job Trainings (Skip for Slasher as per instruction "only attributes")
    if (!isSlasher) {
        // @ts-ignore
        const jobData = JOBS_DATA[selectedJob];
        if (jobData) {
            jobData.base.forEach((sName: string) => {
                const sk = skills.find(s => s.name.includes(sName) || sName.includes(s.name));
                if (sk) sk.training = 5;
            });
            // @ts-ignore
            const variantSkills = jobData.variants[selectedVariant];
            if (variantSkills) {
                variantSkills.forEach((sName: string) => {
                    if (sName === '__ANY__') return;
                    const sk = skills.find(s => s.name.includes(sName) || sName.includes(s.name));
                    if (sk) sk.training = 5;
                });
            }
        }
    }

    const newChar: Character = {
        id: crypto.randomUUID(),
        supplement: supplement,
        playerId: localStorage.getItem('veritas_session') || 'anon',
        name: charData.name!,
        history: charData.history!,
        ideology: charData.ideology!,
        keyConnection: charData.keyConnection!,
        importantPeople: charData.importantPeople!,
        attributes: charData.attributes!,
        skills: skills,
        level: 1,
        job: isSlasher ? 'Sobrevivente' : selectedJob,
        variant: isSlasher ? 'N/A' : selectedVariant,
        powerLevel: charData.powerLevel as any,
        inventory: [],
        abilities: [],
        hp: { current: 1, max: 1 }, // placeholders
        san: { current: 1, max: 1, enabled: true },
        pe: { current: 1, max: 1, enabled: true },
        defense: { total: 10, bonus: 0 },
        // Naruto init
        bloodlineAbilities: [],
        bloodlineSlots: 3,
    };

    calculateStats(newChar);
    DataService.saveCharacter(newChar);
    navigate(`/app/sheet/${newChar.id}`);
  };

  const nextStep = () => {
      if (isSlasher && step === 1) {
          setStep(3); // Skip Job selection for Slasher
      } else {
          setStep(s => s + 1);
      }
  };

  const prevStep = () => {
      if (isSlasher && step === 3) {
          setStep(1);
      } else {
          setStep(s => s - 1);
      }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between mb-8 items-center">
        <div>
            <span className="text-xs text-gray-500 uppercase tracking-widest">{supplement} MODE</span>
            <h1 className="text-3xl font-bold text-veritas-gold">Criação de Personagem</h1>
        </div>
        <div className="flex gap-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full ${(step >= i || (isSlasher && i===2 && step===3)) ? 'bg-veritas-gold' : 'bg-gray-700'}`} />
            ))}
        </div>
      </div>

      {step === 1 && (
        <div className="bg-veritas-gray p-8 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">1. Distribuição de Atributos</h2>
            <p className="text-gray-400 mb-6">Você tem <span className="text-veritas-gold font-bold text-xl">{points}</span> pontos para distribuir. Todos começam com 1.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {(Object.keys(charData.attributes!) as AttributeKey[]).map((key) => (
                    <div key={key} className="bg-black/40 p-6 rounded border border-gray-700 flex flex-col items-center">
                        <span className="text-4xl font-bold text-veritas-gold mb-2">{charData.attributes![key]}</span>
                        <span className="text-lg font-bold text-gray-300">{key}</span>
                        <div className="flex gap-4 mt-4">
                            <button onClick={() => updateAttr(key, -1)} className="w-8 h-8 rounded bg-gray-700 hover:bg-red-900 text-white">-</button>
                            <button onClick={() => updateAttr(key, 1)} className="w-8 h-8 rounded bg-gray-700 hover:bg-green-900 text-white">+</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 flex justify-end">
                <button 
                    onClick={nextStep} 
                    disabled={points !== 0}
                    className="bg-veritas-gold text-black font-bold px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Próximo
                </button>
            </div>
        </div>
      )}

      {step === 2 && !isSlasher && (
        <div className="bg-veritas-gray p-8 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">2. Ofício e Variante</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="block text-gray-400 mb-2">Ofício</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {Object.keys(JOBS_DATA).map(job => (
                            <button 
                                key={job}
                                onClick={() => handleJobSelect(job)}
                                className={`w-full text-left p-3 rounded border ${selectedJob === job ? 'bg-veritas-gold text-black border-veritas-gold' : 'bg-black/30 border-gray-700 hover:bg-gray-700'}`}
                            >
                                {job}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-gray-400 mb-2">Variante</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {selectedJob && Object.keys((JOBS_DATA as any)[selectedJob].variants).map(v => (
                            <button 
                                key={v}
                                onClick={() => handleVariantSelect(v)}
                                className={`w-full text-left p-3 rounded border ${selectedVariant === v ? 'bg-veritas-gold text-black border-veritas-gold' : 'bg-black/30 border-gray-700 hover:bg-gray-700'}`}
                            >
                                {v}
                            </button>
                        ))}
                        {!selectedJob && <p className="text-gray-500 italic">Selecione um ofício primeiro.</p>}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className="text-gray-400 hover:text-white">Voltar</button>
                <button 
                    onClick={nextStep} 
                    disabled={!selectedJob || !selectedVariant}
                    className="bg-veritas-gold text-black font-bold px-6 py-2 rounded disabled:opacity-50"
                >
                    Próximo
                </button>
            </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-veritas-gray p-8 rounded-lg shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">3. Identidade</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-gray-400 mb-1">Nome do Personagem</label>
                    <input type="text" className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white" 
                        value={charData.name} onChange={e => setCharData({...charData, name: e.target.value})} />
                </div>
                 <div className="col-span-2">
                    <label className="block text-gray-400 mb-1">Nível da Campanha (Define status iniciais)</label>
                    <select className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white"
                        value={charData.powerLevel} 
                        onChange={e => setCharData({...charData, powerLevel: e.target.value as any})}>
                        <option value="Mortal">Mortal</option>
                        <option value="Heroico">Heroico</option>
                        <option value="Épico">Épico</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-gray-400 mb-1">Ideologia</label>
                    <input type="text" className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white" 
                        value={charData.ideology} onChange={e => setCharData({...charData, ideology: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className="block text-gray-400 mb-1">Conexão-Chave</label>
                    <input type="text" className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white" 
                        value={charData.keyConnection} onChange={e => setCharData({...charData, keyConnection: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className="block text-gray-400 mb-1">Pessoas Importantes</label>
                    <textarea className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white h-20" 
                        value={charData.importantPeople} onChange={e => setCharData({...charData, importantPeople: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className="block text-gray-400 mb-1">História</label>
                    <textarea className="w-full bg-black/40 border border-gray-600 rounded p-2 text-white h-32" 
                        value={charData.history} onChange={e => setCharData({...charData, history: e.target.value})} />
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className="text-gray-400 hover:text-white">Voltar</button>
                <button 
                    onClick={finishCreation} 
                    disabled={!charData.name}
                    className="bg-veritas-gold text-black font-bold px-6 py-2 rounded disabled:opacity-50"
                >
                    Criar Ficha
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
