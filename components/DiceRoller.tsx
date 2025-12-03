import React, { useState, useEffect } from 'react';
import { X, Dices } from 'lucide-react';
import { RollResult } from '../types';

interface DiceRollerProps {
  logs: RollResult[];
  onClear: () => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ logs, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (logs.length > 0) setIsOpen(true);
  }, [logs]);

  if (!isOpen && logs.length === 0) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <div 
        className="bg-veritas-dark border border-veritas-gold/50 rounded-lg shadow-2xl overflow-hidden w-80 cursor-pointer"
        onClick={() => setIsOpen(false)}
      >
        <div className="bg-veritas-gray p-2 border-b border-veritas-gold/30 flex justify-between items-center">
          <span className="text-veritas-gold font-bold flex items-center gap-2">
            <Dices size={16} /> Últimas Rolagens
          </span>
          <button onClick={(e) => { e.stopPropagation(); onClear(); setIsOpen(false); }} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto p-3 space-y-3">
          {[...logs].reverse().map((log) => (
            <div key={log.id} className="text-sm border-l-2 border-veritas-gold pl-2">
              <div className="text-xs text-gray-400">{log.characterName} - {log.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">{log.total}</span>
                <span className="text-gray-500 text-xs">
                  {log.formula || `[${log.dice.join(', ')}] -> ${log.kept} + ${log.modifier}`}
                </span>
              </div>
              {log.isCrit && <div className="text-green-500 text-xs font-bold">SUCESSO CRÍTICO!</div>}
              {log.isFumble && <div className="text-veritas-red text-xs font-bold">FALHA CRÍTICA!</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const rollD20Check = (attrValue: number, modifier: number, label: string, charName: string): RollResult => {
  const isDisadvantage = attrValue <= 0;
  const diceCount = isDisadvantage ? 2 : attrValue;
  const rolls: number[] = [];
  
  for (let i = 0; i < diceCount; i++) {
    rolls.push(Math.floor(Math.random() * 20) + 1);
  }

  const kept = isDisadvantage ? Math.min(...rolls) : Math.max(...rolls);
  const total = kept + modifier;

  return {
    id: crypto.randomUUID(),
    characterName: charName,
    label,
    dice: rolls,
    kept,
    modifier,
    total,
    isCrit: kept === 20,
    isFumble: kept === 1,
    timestamp: Date.now()
  };
};

export const rollGeneric = (formula: string, label: string, charName: string): RollResult => {
    // Simple parser for NdX
    const parts = formula.toLowerCase().split('d');
    const count = parseInt(parts[0]) || 1;
    const sides = parseInt(parts[1]) || 6;
    const rolls = [];
    for(let i=0; i<count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a,b) => a+b, 0);

    return {
        id: crypto.randomUUID(),
        characterName: charName,
        label,
        dice: rolls,
        kept: total,
        modifier: 0,
        total,
        isCrit: false,
        isFumble: false,
        timestamp: Date.now(),
        formula
    };
}