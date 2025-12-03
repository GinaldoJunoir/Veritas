
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { Character } from '../types';
import { RollContext } from '../App';

export const StreamOverlay: React.FC = () => {
  const { charId } = useParams();
  const [char, setChar] = useState<Character | null>(null);
  const { logs } = useContext(RollContext);

  useEffect(() => {
    // Force background to transparent for OBS
    const originalBackground = document.body.style.background;
    document.body.style.background = 'transparent';
    
    const load = () => {
         const chars = DataService.getCharacters();
         if (charId) {
             const found = chars.find(c => c.id === charId);
             if(found) setChar(found);
         } else {
             // If no ID provided, just show the most recently updated char owned by logged user or first one
             if(chars.length > 0) setChar(chars[0]);
         }
    };
    load();
    const interval = setInterval(load, 2000); // Polling simulation
    
    return () => {
        document.body.style.background = originalBackground;
    };
  }, [charId]);

  if (!char) return <div className="text-white text-xs p-2">...</div>;

  const lastRoll = logs.filter(l => l.characterName === char.name || l.characterId === char.id).slice(-1)[0];

  return (
    <div className="w-[300px] bg-veritas-dark/95 border-l-4 border-veritas-gold p-4 font-sans text-white rounded-r-lg overflow-hidden relative shadow-2xl">
        <div className="flex items-center gap-3 mb-3 border-b border-gray-700 pb-2">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border border-veritas-gold">
                <span className="text-xl font-bold">{char.name.substring(0,1)}</span>
            </div>
            <div>
                <h2 className="font-bold text-lg leading-tight">{char.name}</h2>
                <div className="text-xs text-veritas-gold">{char.job}</div>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-black/50 p-2 rounded">
                <div className="text-xs text-red-500 font-bold">PV</div>
                <div className="text-lg font-bold">{char.hp.current}</div>
            </div>
             <div className="bg-black/50 p-2 rounded">
                <div className="text-xs text-blue-500 font-bold">SAN</div>
                <div className="text-lg font-bold">{char.san.current}</div>
            </div>
             <div className="bg-black/50 p-2 rounded">
                <div className="text-xs text-yellow-500 font-bold">PE</div>
                <div className="text-lg font-bold">{char.pe.current}</div>
            </div>
        </div>

        {lastRoll && (
             <div className="bg-veritas-gray border border-gray-600 rounded p-2 animate-pulse">
                <div className="text-xs text-gray-400 mb-1">{lastRoll.label}</div>
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-veritas-gold">{lastRoll.total}</span>
                    <span className="text-xs text-gray-500">[{lastRoll.dice.join(',')}] {lastRoll.modifier !== 0 ? (lastRoll.modifier > 0 ? `+${lastRoll.modifier}` : lastRoll.modifier) : ''}</span>
                </div>
            </div>
        )}
    </div>
  );
};
