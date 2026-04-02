import React from 'react';
import { GameProvider, useGame } from './context/GameContext.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import LevelSelectScreen from './screens/LevelSelectScreen.jsx';
import LevelScreen from './screens/LevelScreen.jsx';
import CompletionScreen from './screens/CompletionScreen.jsx';
import DailyChallengeScreen from './screens/DailyChallengeScreen.jsx';

function AppContent() {
  const { screen } = useGame();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-deep)',
    }}>
      {screen === 'home' && <HomeScreen />}
      {screen === 'level-select' && <LevelSelectScreen />}
      {screen === 'level' && <LevelScreen />}
      {screen === 'completion' && <CompletionScreen />}
      {screen === 'daily' && <DailyChallengeScreen />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
