
import React from 'react';
import { Link } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { Plus, User, Trash2 } from 'lucide-react';
import { Character } from '../types';

export const CharacterDashboard: React.FC = () => {
  const characters = DataService.getCharacters();
  const sessionUser = localStorage.getItem('veritas_session');

  // Filter for logged in user (in a real app, backend filters)
  const myChars = characters.filter(c => c.playerId === sessionUser);

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      if(confirm('Tem certeza que deseja deletar este personagem?')) {
          DataService.deleteCharacter(id);
          window.location.reload(); // Quick refresh
      }
  }

  const getBorderColor = (char: Character) => {
      if (char.supplement === 'Slasher') return 'border-red-600 group-hover:shadow-red-600/50';
      if (char.supplement === 'Naruto') return 'border-orange-500 group-hover:shadow-orange-500/50';
      return 'border-veritas-gold group-hover:shadow-veritas-gold/50'; // Base
  }

  const getTextColor = (char: Character) => {
      if (char.supplement === 'Slasher') return 'text-red-600';
      if (char.supplement === 'Naruto') return 'text-orange-500';
      return 'text-veritas-gold';
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-4xl font-light text-white tracking-tight uppercase">Dashboard</h1>
                <div className="h-1 w-12 bg-veritas-gold rounded-full mt-1"></div>
            </div>
            <Link to="/app/select-supplement" className="flex items-center gap-2 bg-veritas-gold text-black px-6 py-3 rounded-full font-bold hover:bg-yellow-500 shadow-lg shadow-yellow-900/20 transition-all hover:scale-105">
                <Plus size={20} />
                <span className="uppercase tracking-wider text-xs">Novo Personagem</span>
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {myChars.length === 0 && (
                <div className="text-gray-500 italic col-span-3 text-center py-32 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                    Nenhum personagem encontrado. Crie o seu primeiro!
                </div>
            )}
            {myChars.map(char => {
                const borderColor = getBorderColor(char);
                const textColor = getTextColor(char);
                
                return (
                    <Link key={char.id} to={`/app/sheet/${char.id}`} className="block group relative">
                        {/* Vivid Border Card */}
                        <div className={`bg-black/40 backdrop-blur-xl border-2 ${borderColor.split(' ')[0]} rounded-[2rem] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] ${borderColor.split(' ')[1]} relative overflow-hidden h-full flex flex-col`}>
                            
                            {/* Inner translucent sheen */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${textColor.replace('text', 'border')} bg-black/50 shadow-inner`}>
                                    <User size={28} className={textColor} />
                                </div>
                                <div className="flex flex-col items-end">
                                    {!char.supplement || char.supplement === 'Base' || char.supplement === 'Naruto' ? (
                                        <span className="bg-white/10 backdrop-blur text-xs px-3 py-1 rounded-full text-white font-bold border border-white/10">Lvl {char.level}</span>
                                    ) : null}
                                    <span className={`text-[10px] uppercase mt-2 tracking-[0.2em] font-bold ${textColor}`}>{char.supplement || 'Base'}</span>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex-1">
                                <h2 className="text-3xl font-bold text-white mb-1 group-hover:text-gray-200 transition-colors">{char.name}</h2>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">{char.job || 'Desconhecido'} {char.variant ? `// ${char.variant}` : ''}</p>
                                
                                <div className="mt-8 grid grid-cols-3 gap-2">
                                    <div className="bg-black/60 rounded-xl p-2 text-center border border-white/5">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">PV</div>
                                        <div className="text-red-500 font-bold">{char.hp.current}</div>
                                    </div>
                                    {char.supplement !== 'Slasher' && char.supplement !== 'Naruto' && (
                                        <div className="bg-black/60 rounded-xl p-2 text-center border border-white/5">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">SAN</div>
                                            <div className="text-blue-500 font-bold">{char.san.current}</div>
                                        </div>
                                    )}
                                    {char.supplement === 'Naruto' && (
                                        <div className="bg-black/60 rounded-xl p-2 text-center border border-white/5">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">CHA</div>
                                            <div className="text-cyan-500 font-bold">{char.pe.current}</div>
                                        </div>
                                    )}
                                    {char.supplement === 'Slasher' && (
                                        <div className="bg-black/60 rounded-xl p-2 text-center border border-white/5">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">COR</div>
                                            <div className="text-orange-500 font-bold">{char.courage?.current}</div>
                                        </div>
                                    )}
                                    {(char.supplement === 'Base' || !char.supplement) && (
                                         <div className="bg-black/60 rounded-xl p-2 text-center border border-white/5">
                                            <div className="text-[10px] text-gray-500 uppercase font-bold">PE</div>
                                            <div className="text-yellow-500 font-bold">{char.pe.current}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                             <button onClick={(e) => handleDelete(char.id, e)} className="absolute top-6 right-6 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-black/50 p-2 rounded-full hover:bg-black">
                                <Trash2 size={20} />
                             </button>
                        </div>
                    </Link>
                );
            })}
        </div>
    </div>
  );
};
