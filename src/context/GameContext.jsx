import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LEVELS } from '../data/levels.js';
import { getTodaysChallenge } from '../data/dailyChallenges.js';

const STORAGE_KEY = 'shadow_shift_save';

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function createInitialSave() {
  return {
    stars: {},         // levelId → star count (1-3)
    coins: 0,
    hints: 3,
    isPremium: false,
    streak: 0,
    lastPlayDate: null,
    dailyCompleted: {},  // date string → true
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.8,
      haptics: true,
      notifications: true,
    },
  };
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [save, setSave] = useState(() => {
    const loaded = loadSave();
    return loaded ? { ...createInitialSave(), ...loaded } : createInitialSave();
  });

  const [screen, setScreen] = useState('home'); // home | level-select | level | completion | daily | settings
  const [currentLevelId, setCurrentLevelId] = useState(null);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  // Persist save on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {}
  }, [save]);

  // Update streak on load
  useEffect(() => {
    const today = new Date().toDateString();
    if (save.lastPlayDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = save.lastPlayDate === yesterday.toDateString();
      setSave(s => ({
        ...s,
        lastPlayDate: today,
        streak: wasYesterday ? s.streak + 1 : 1,
      }));
    }
  }, []);

  const updateSave = useCallback((updater) => {
    setSave(s => {
      const updated = typeof updater === 'function' ? updater(s) : { ...s, ...updater };
      return updated;
    });
  }, []);

  const openLevel = useCallback((levelId, daily = false) => {
    setCurrentLevelId(levelId);
    setIsDailyChallenge(daily);
    setScreen('level');
  }, []);

  const completeLevel = useCallback((levelId, stars, moveCount, isDaily = false) => {
    const coinsEarned = stars === 3 ? 30 : stars === 2 ? 20 : 10;

    updateSave(s => {
      const prev = s.stars[levelId] || 0;
      const newStars = Math.max(prev, stars);
      const updates = {
        stars: { ...s.stars, [levelId]: newStars },
        coins: s.coins + coinsEarned,
      };
      if (isDaily) {
        const today = new Date().toDateString();
        updates.dailyCompleted = { ...s.dailyCompleted, [today]: true };
      }
      return { ...s, ...updates };
    });

    setCompletionData({
      levelId, stars, moveCount, coinsEarned, isDaily,
      nextLevelId: isDaily ? null : levelId < LEVELS.length ? levelId + 1 : null,
    });
    setScreen('completion');
  }, [updateSave]);

  const useHint = useCallback(() => {
    if (save.hints > 0) {
      updateSave(s => ({ ...s, hints: s.hints - 1 }));
      return true;
    }
    return false;
  }, [save.hints, updateSave]);

  const watchAdForHint = useCallback(() => {
    // Simulated ad reward
    updateSave(s => ({ ...s, hints: s.hints + 1 }));
  }, [updateSave]);

  const purchasePremium = useCallback(() => {
    updateSave(s => ({ ...s, isPremium: true, hints: s.hints + 10 }));
  }, [updateSave]);

  const getNextUnlockedLevel = useCallback(() => {
    const completedIds = Object.keys(save.stars).map(Number);
    if (completedIds.length === 0) return 1;
    const maxCompleted = Math.max(...completedIds);
    return Math.min(maxCompleted + 1, LEVELS.length);
  }, [save.stars]);

  const isDailyCompleted = useCallback(() => {
    const today = new Date().toDateString();
    return !!save.dailyCompleted[today];
  }, [save.dailyCompleted]);

  const totalStars = Object.values(save.stars).reduce((a, b) => a + b, 0);

  return (
    <GameContext.Provider value={{
      save, updateSave,
      screen, setScreen,
      currentLevelId, setCurrentLevelId,
      isDailyChallenge,
      completionData, setCompletionData,
      openLevel, completeLevel,
      useHint, watchAdForHint, purchasePremium,
      getNextUnlockedLevel, isDailyCompleted,
      totalStars,
      todaysChallenge: getTodaysChallenge(),
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
