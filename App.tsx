
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { CharacterDashboard } from './pages/CharacterDashboard';
import { CharacterCreator } from './pages/CharacterCreator';
import { SupplementSelection } from './pages/SupplementSelection';
import { CharacterSheet } from './pages/CharacterSheet';
import { Threats } from './pages/Threats';
import { Campaigns } from './pages/Campaigns';
import { StreamOverlay } from './pages/StreamOverlay';
import { DiceRoller } from './components/DiceRoller';
import { RollResult } from './types';
import { DataService } from './services/dataService';

// Simple Context for Dice Rolling globally accessible
export const RollContext = React.createContext<{
  addLog: (log: RollResult) => void;
  logs: RollResult[];
}>({ addLog: () => {}, logs: [] });

const App: React.FC = () => {
  const [logs, setLogs] = useState<RollResult[]>([]);

  const addLog = (log: RollResult) => {
    // 1. Update local pop-up state
    setLogs(prev => [...prev, log]);

    // 2. Persist to Campaign Logs if character is part of one
    if (log.characterId) {
      let msg = `Rolou ${log.label}: ${log.total}`;
      if (log.dice.length > 0 && !log.formula) {
        msg += ` [${log.dice.join(', ')}]`;
        if (log.modifier !== 0) msg += ` ${log.modifier >= 0 ? '+' : ''}${log.modifier}`;
      } else if (log.formula) {
        msg += ` (${log.formula})`;
      }
      
      if (log.isCrit) msg += " (CRÍTICO!)";
      if (log.isFumble) msg += " (FALHA!)";

      DataService.logCampaignEvent(log.characterId, msg, log.characterName, 'roll');
    }
  };

  return (
    <RollContext.Provider value={{ addLog, logs }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/stream/:charId?" element={<StreamOverlay />} />
          
          <Route path="/app/*" element={
            <Layout>
               <Routes>
                 <Route path="dashboard" element={<CharacterDashboard />} />
                 <Route path="select-supplement" element={<SupplementSelection />} />
                 <Route path="create" element={<CharacterCreator />} />
                 <Route path="sheet/:id" element={<CharacterSheet />} />
                 <Route path="threats" element={<Threats />} />
                 <Route path="campaigns" element={<Campaigns />} />
                 <Route path="*" element={<Navigate to="dashboard" />} />
               </Routes>
               <DiceRoller logs={logs} onClear={() => setLogs([])} />
            </Layout>
          } />
        </Routes>
      </HashRouter>
    </RollContext.Provider>
  );
};

export default App;
