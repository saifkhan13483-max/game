import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { LEVELS } from '../data/levels.js';
import { getTodaysChallenge } from '../data/dailyChallenges.js';
import { checkNewAchievements } from '../data/achievements.js';
import { playAchievementUnlock, playButtonTap, startAmbientMusic, stopAmbientMusic, setMusicVolume, setSfxVolume } from '../audio/audioEngine.js';
import AchievementToast from '../components/AchievementToast.jsx';

const STORAGE_KEY = 'shadow_shift_save_v2';

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function createInitialSave() {
  return {
    stars: {},
    coins: 0,
    totalCoinsEarned: 0,
    hints: 3,
    hintsUsed: 0,
    isPremium: false,
    streak: 0,
    lastPlayDate: null,
    dailyCompleted: {},
    achievements: [],
    levelsCompletedCount: 0,
    levelsWithoutHints: 0,
    sessionLevels: 0,
    streakRewardsClaimed: {},
    settings: {
      musicVolume: 0.4,
      sfxVolume: 0.8,
      haptics: true,
      notifications: true,
      reducedMotion: false,
    },
  };
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [save, setSave] = useState(() => {
    const loaded = loadSave();
    const initial = createInitialSave();
    return loaded ? { ...initial, ...loaded, settings: { ...initial.settings, ...(loaded.settings || {}) } } : initial;
  });

  const [screen, setScreenRaw] = useState('home');
  const [currentLevelId, setCurrentLevelId] = useState(null);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);
  const [interstitialPending, setInterstitialPending] = useState(false);
  const levelsCompletedSinceAd = useRef(0);
  const prevSaveRef = useRef(save);

  const setScreen = useCallback((s) => {
    playButtonTap();
    setScreenRaw(s);
  }, []);

  // Persist save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {}
  }, [save]);

  // Audio volume sync
  useEffect(() => {
    setMusicVolume(save.settings.musicVolume);
    setSfxVolume(save.settings.sfxVolume);
  }, [save.settings.musicVolume, save.settings.sfxVolume]);

  // Ambient music
  useEffect(() => {
    if (screen === 'home' || screen === 'level-select') {
      startAmbientMusic();
    } else {
      stopAmbientMusic();
    }
  }, [screen]);

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
        sessionLevels: 0,
      }));
    }
  }, []);

  // Check achievements whenever save changes
  useEffect(() => {
    const prev = prevSaveRef.current;
    const newAchs = checkNewAchievements(save, prev);
    if (newAchs.length > 0) {
      setSave(s => ({
        ...s,
        achievements: [...new Set([...(s.achievements || []), ...newAchs.map(a => a.id)])],
      }));
      setToastQueue(q => [...q, ...newAchs]);
      newAchs.forEach(() => playAchievementUnlock());
    }
    prevSaveRef.current = save;
  }, [save.stars, save.streak, save.coins, save.isPremium, save.dailyCompleted, save.hintsUsed]);

  const updateSave = useCallback((updater) => {
    setSave(s => typeof updater === 'function' ? updater(s) : { ...s, ...updater });
  }, []);

  const openLevel = useCallback((levelId, daily = false) => {
    setCurrentLevelId(levelId);
    setIsDailyChallenge(daily);
    setScreenRaw('level');
  }, []);

  const completeLevel = useCallback((levelId, stars, moveCount, isDaily = false) => {
    const coinsEarned = stars === 3 ? 30 : stars === 2 ? 20 : 10;

    // Decide if we show interstitial BEFORE saving/navigating
    levelsCompletedSinceAd.current += 1;
    const adFrequency = 3 + Math.floor(Math.random() * 3); // 3-5
    const showAd = !save.isPremium && levelsCompletedSinceAd.current >= adFrequency;
    if (showAd) levelsCompletedSinceAd.current = 0;

    updateSave(s => {
      const prev = s.stars[levelId] || 0;
      const newStars = Math.max(prev, stars);
      const updates = {
        stars: { ...s.stars, [levelId]: newStars },
        coins: s.coins + coinsEarned,
        totalCoinsEarned: (s.totalCoinsEarned || 0) + coinsEarned,
        levelsCompletedCount: (s.levelsCompletedCount || 0) + 1,
        sessionLevels: (s.sessionLevels || 0) + 1,
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

    if (showAd) {
      // LevelScreen will intercept and show the ad, then navigate to completion
      setInterstitialPending(true);
    } else {
      setScreenRaw('completion');
    }
  }, [save.isPremium, updateSave]);

  const useHint = useCallback(() => {
    if (save.hints > 0) {
      updateSave(s => ({ ...s, hints: s.hints - 1, hintsUsed: (s.hintsUsed || 0) + 1 }));
      return true;
    }
    return false;
  }, [save.hints, updateSave]);

  const watchAdForHint = useCallback(() => {
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

  const claimStreakReward = useCallback((days) => {
    const reward = days === 3 ? 50 : days === 7 ? 100 : days === 14 ? 200 : 500;
    updateSave(s => ({
      ...s,
      coins: s.coins + reward,
      totalCoinsEarned: (s.totalCoinsEarned || 0) + reward,
      streakRewardsClaimed: { ...(s.streakRewardsClaimed || {}), [days]: true },
    }));
  }, [updateSave]);

  const popToast = useCallback(() => {
    setToastQueue(q => q.slice(1));
  }, []);

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
      claimStreakReward,
      totalStars,
      todaysChallenge: getTodaysChallenge(),
      interstitialPending, setInterstitialPending,
    }}>
      {children}
      {/* Achievement toast queue */}
      {toastQueue.length > 0 && (
        <AchievementToast achievement={toastQueue[0]} onDone={popToast} />
      )}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
