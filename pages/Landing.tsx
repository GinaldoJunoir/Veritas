
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataService } from '../services/dataService';
import { ChevronDown, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<'landing' | 'auth'>('landing');
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      // Login: username can be email or username
      const user = DataService.login(username, password); 
      if (user) {
        localStorage.setItem('veritas_session', user.id);
        navigate('/app/dashboard');
      } else {
        setError('Credenciais inválidas.');
      }
    } else {
      // Register
      if (password.length < 6) {
        setError('A senha deve ser forte (mínimo 6 caracteres).');
        return;
      }
      if (!email || !username) {
          setError('Preencha todos os campos.');
          return;
      }
      try {
        DataService.register({ id: crypto.randomUUID(), username, email, passwordHash: password });
        setIsLogin(true);
        setError('');
        alert('Conta criada com sucesso! Faça login.');
      } catch (err: any) {
        setError(err.message || 'Erro ao registrar.');
      }
    }
  };

  return (
    <div className="h-screen w-full bg-[#050505] flex flex-col items-center relative overflow-hidden font-sans text-gray-200">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000000] z-0 pointer-events-none"></div>
      <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-veritas-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

      {viewState === 'landing' ? (
          <div className="z-10 flex flex-col items-center justify-center h-full max-w-4xl px-6 text-center animate-in fade-in zoom-in duration-700">
              <div className="mb-8 p-10 rounded-full border border-veritas-gold/10 bg-white/5 backdrop-blur-3xl shadow-[0_0_50px_rgba(212,175,55,0.05)]">
                 <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-veritas-gold to-[#8a701e] tracking-tighter drop-shadow-2xl font-mono">
                    VERITAS
                 </h1>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-[0.2em] uppercase">
                  Seja bem-vindo ao Veritas.
              </h2>
              
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed mb-12 font-light">
                  O Veritas foi uma iniciativa criada para facilitar a criação de fichas de personagens e gestão de campanhas dos mestres, além de disponibilizar suplementos do Veritas para a criação de novos conceitos de campanhas.
              </p>

              <button 
                onClick={() => setViewState('auth')}
                className="group relative px-10 py-4 bg-transparent overflow-hidden rounded-full border border-veritas-gold/30 hover:border-veritas-gold transition-all duration-300"
              >
                  <div className="absolute inset-0 w-0 bg-veritas-gold transition-all duration-[250ms] ease-out group-hover:w-full opacity-10"></div>
                  <span className="relative flex items-center gap-3 text-veritas-gold font-bold uppercase tracking-widest text-sm group-hover:text-white transition-colors">
                      Acessar <ArrowRight size={16} />
                  </span>
              </button>
          </div>
      ) : (
          <div className="z-10 flex flex-col items-center justify-center h-full w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
              <button onClick={() => setViewState('landing')} className="absolute top-10 left-10 text-gray-500 hover:text-white flex items-center gap-2 text-xs uppercase tracking-widest">
                  Voltar
              </button>

              <div className="w-full max-w-md p-1 rounded-3xl bg-gradient-to-br from-veritas-gold/30 via-veritas-blood/20 to-blue-900/20 shadow-2xl">
                  <div className="bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[22px] p-8 border border-white/5">
                      <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Entrar no Acervo' : 'Criar Identidade'}</h3>
                          <div className="h-0.5 w-12 bg-gradient-to-r from-veritas-gold to-transparent mx-auto"></div>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-5">
                          {!isLogin && (
                              <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">E-mail</label>
                                  <input 
                                      type="email" 
                                      value={email}
                                      onChange={e => setEmail(e.target.value)}
                                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-veritas-gold outline-none transition-colors"
                                      placeholder="seu@email.com"
                                      required={!isLogin}
                                  />
                              </div>
                          )}
                          
                          <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">{isLogin ? 'Usuário ou E-mail' : 'Nome de Usuário'}</label>
                              <input 
                                  type="text" 
                                  value={username}
                                  onChange={e => setUsername(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-veritas-gold outline-none transition-colors"
                                  placeholder={isLogin ? "user ou email" : "username"}
                                  required 
                              />
                          </div>

                          <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">Senha</label>
                              <input 
                                  type="password" 
                                  value={password}
                                  onChange={e => setPassword(e.target.value)}
                                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-veritas-gold outline-none transition-colors"
                                  placeholder="••••••"
                                  required 
                              />
                          </div>
                          
                          {error && <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs text-center">{error}</div>}

                          <button type="submit" className="w-full bg-gradient-to-r from-veritas-gold to-yellow-600 text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all uppercase tracking-widest text-xs mt-4 transform hover:-translate-y-1">
                              {isLogin ? 'Conectar' : 'Registrar'}
                          </button>
                      </form>

                      <div className="mt-6 text-center pt-6 border-t border-white/5">
                          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-xs text-gray-400 hover:text-white transition-colors">
                              {isLogin ? 'Ainda não possui acesso? ' : 'Já possui uma conta? '}
                              <span className="text-veritas-gold font-bold underline decoration-1 underline-offset-4">
                                  {isLogin ? 'Registre-se.' : 'Faça login.'}
                              </span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
