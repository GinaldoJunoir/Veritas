
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Waves } from 'lucide-react';
import { SupplementType } from '../types';

export const SupplementSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleSelect = (supp: SupplementType) => {
    if (supp !== 'Base') return; // Blocked logic
    navigate('/app/create', { state: { supplement: supp } });
  };

  return (
    <div className="p-10 h-full flex flex-col items-center justify-center bg-[#121212]">
      <h1 className="text-4xl font-bold text-veritas-gold mb-2 text-center uppercase tracking-widest">Escolha seu Suplemento</h1>
      <p className="text-gray-400 mb-10 text-center max-w-xl">Defina as regras e a atmosfera da sua campanha.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Veritas Base */}
        <div 
          onClick={() => handleSelect('Base')}
          className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-8 rounded-xl cursor-pointer hover:border-veritas-gold hover:-translate-y-2 transition-all group flex flex-col items-center text-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-veritas-gold/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="w-20 h-20 rounded-full bg-black/50 border border-veritas-gold/30 flex items-center justify-center text-veritas-gold mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                <path d="M12 22L1 3H5L12 16L19 3H23L12 22Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-widest">VERITAS</h2>
          <div className="h-px w-10 bg-veritas-gold mb-4"></div>
          <p className="text-gray-400 text-sm leading-relaxed">
            O sistema original. Mistério, investigação e combate tático.
            <br/>Equilíbrio perfeito entre narrativa e regras.
          </p>
        </div>

        {/* Samhain (Previously Slasher) - BLOCKED */}
        <div 
          className="bg-gradient-to-br from-[#1a0505] to-black border border-white/10 p-8 rounded-xl opacity-70 cursor-not-allowed group flex flex-col items-center text-center relative overflow-hidden grayscale-[0.5]"
        >
           <div className="absolute top-4 right-4 bg-red-900/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-red-500/50">
              EM BREVE!
          </div>

          <div className="w-20 h-20 rounded-full bg-black/50 border border-red-900/30 flex items-center justify-center text-red-600 mb-6 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
            <Waves size={40} className="stroke-current"/>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2 tracking-widest">SAMHAIN</h2>
          <div className="h-px w-10 bg-red-800 mb-4"></div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Águas vermelhas e mistérios profundos.
            <br/>Focado na adrenalina e na <span className="text-red-800 font-bold">Coragem</span>.
          </p>
        </div>

        {/* Naruto (Mundo Shinobi) - BLOCKED */}
        <div 
          className="bg-gradient-to-br from-[#1a0f05] to-black border border-white/10 p-8 rounded-xl opacity-70 cursor-not-allowed group flex flex-col items-center text-center relative overflow-hidden grayscale-[0.5]"
        >
          <div className="absolute top-4 right-4 bg-orange-900/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-orange-500/50">
              EM BREVE!
          </div>

          <div className="w-20 h-20 rounded-full bg-black/50 border border-orange-900/30 flex items-center justify-center text-orange-500 mb-6 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <Flame size={40} className="fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-orange-500 mb-2 tracking-widest">MUNDO SHINOBI</h2>
          <div className="h-px w-10 bg-orange-600 mb-4"></div>
          <p className="text-gray-500 text-sm leading-relaxed">
            A ascensão do Chakra. Jutsus, clãs e poderes oculares.
            <br/>Uma camada extra de poder para suas lendas.
          </p>
        </div>
      </div>
    </div>
  );
};
