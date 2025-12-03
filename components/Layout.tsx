
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ScrollText, ShieldAlert, Users, LogOut, Video, User as UserIcon } from 'lucide-react';
import { DataService } from '../services/dataService';
import { User } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('veritas_session');
    if (userId) {
      const users = DataService.getUsers();
      const found = users.find(u => u.id === userId);
      if (found) setCurrentUser(found);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('veritas_session');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen text-gray-200 overflow-hidden font-sans relative">
      {/* Floating Navbar */}
      <div className="p-4 shrink-0 z-50">
        <header className="h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-between px-6 shadow-lg">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-veritas-gold to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-lg shadow-md">
                        V
                    </div>
                    <h1 className="text-lg font-bold text-veritas-gold tracking-[0.2em] hidden md:block">VERITAS</h1>
                </div>

                <nav className="flex items-center gap-2">
                    <NavLink to="/app/dashboard" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium border border-transparent ${isActive ? 'text-black bg-veritas-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'}`}>
                        <Users size={16} />
                        <span className="hidden sm:inline">Personagens</span>
                    </NavLink>
                    <NavLink to="/app/threats" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium border border-transparent ${isActive ? 'text-white bg-veritas-blood shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'}`}>
                        <ShieldAlert size={16} />
                        <span className="hidden sm:inline">Ameaças</span>
                    </NavLink>
                    <NavLink to="/app/campaigns" className={({isActive}) => `flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium border border-transparent ${isActive ? 'text-white bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'}`}>
                        <ScrollText size={16} />
                        <span className="hidden sm:inline">Campanhas</span>
                    </NavLink>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <NavLink to="/stream" target="_blank" className="text-gray-500 hover:text-veritas-gold transition-colors" title="Modo Stream">
                    <Video size={20} />
                </NavLink>
                
                <div className="h-6 w-px bg-white/10 mx-2"></div>
                
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-white">{currentUser?.username || 'Usuário'}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Conectado</div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                        <UserIcon size={14} className="text-gray-300"/>
                    </div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 ml-2 transition-colors" title="Sair">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative p-4 pt-0">
        {children}
      </main>
    </div>
  );
};
