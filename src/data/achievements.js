export const ACHIEVEMENTS = [
  // Progression
  { id: 'first_steps', name: 'First Steps', desc: 'Complete Level 1', icon: '🌟', condition: (s) => Object.keys(s.stars).length >= 1 },
  { id: 'getting_started', name: 'Getting Started', desc: 'Complete 5 levels', icon: '🔦', condition: (s) => Object.keys(s.stars).length >= 5 },
  { id: 'warming_up', name: 'Warming Up', desc: 'Complete 10 levels', icon: '⚡', condition: (s) => Object.keys(s.stars).length >= 10 },
  { id: 'halfway', name: 'Halfway There', desc: 'Complete 15 levels', icon: '🔆', condition: (s) => Object.keys(s.stars).length >= 15 },
  { id: 'almost', name: 'Almost There', desc: 'Complete 25 levels', icon: '💥', condition: (s) => Object.keys(s.stars).length >= 25 },
  { id: 'champion', name: 'Champion', desc: 'Complete all 30 levels', icon: '🏆', condition: (s) => Object.keys(s.stars).length >= 30 },

  // Star mastery
  { id: 'first_star', name: 'Star Gazer', desc: 'Earn 3 stars on any level', icon: '⭐', condition: (s) => Object.values(s.stars).some(v => v === 3) },
  { id: 'five_stars', name: 'Star Collector', desc: 'Earn 3 stars on 5 levels', icon: '🌠', condition: (s) => Object.values(s.stars).filter(v => v === 3).length >= 5 },
  { id: 'ten_stars', name: 'Star Chaser', desc: 'Earn 3 stars on 10 levels', icon: '✨', condition: (s) => Object.values(s.stars).filter(v => v === 3).length >= 10 },
  { id: 'twenty_stars', name: 'Stellar', desc: 'Earn 3 stars on 20 levels', icon: '🌌', condition: (s) => Object.values(s.stars).filter(v => v === 3).length >= 20 },
  { id: 'perfect_run', name: 'Grand Master', desc: 'Earn 3 stars on all 30 levels', icon: '👑', condition: (s) => Object.values(s.stars).filter(v => v === 3).length >= 30 },

  // Streak
  { id: 'streak3', name: 'On a Roll', desc: 'Maintain a 3-day streak', icon: '🔥', condition: (s) => s.streak >= 3 },
  { id: 'streak7', name: 'Dedicated', desc: 'Maintain a 7-day streak', icon: '🏅', condition: (s) => s.streak >= 7 },
  { id: 'streak14', name: 'Committed', desc: 'Maintain a 14-day streak', icon: '💎', condition: (s) => s.streak >= 14 },
  { id: 'streak30', name: 'Obsessed', desc: 'Maintain a 30-day streak', icon: '🌙', condition: (s) => s.streak >= 30 },

  // Coins
  { id: 'coins50', name: 'Pocket Change', desc: 'Earn 50 coins total', icon: '💰', condition: (s) => s.totalCoinsEarned >= 50 },
  { id: 'coins200', name: 'Investor', desc: 'Earn 200 coins total', icon: '💳', condition: (s) => s.totalCoinsEarned >= 200 },
  { id: 'coins500', name: 'Rich in Light', desc: 'Earn 500 coins total', icon: '🏦', condition: (s) => s.totalCoinsEarned >= 500 },

  // Daily challenge
  { id: 'first_daily', name: 'Daily Devotee', desc: 'Complete your first Daily Challenge', icon: '📅', condition: (s) => Object.keys(s.dailyCompleted || {}).length >= 1 },
  { id: 'daily5', name: 'Routine', desc: 'Complete 5 Daily Challenges', icon: '📆', condition: (s) => Object.keys(s.dailyCompleted || {}).length >= 5 },
  { id: 'daily14', name: 'Habitual', desc: 'Complete 14 Daily Challenges', icon: '🗓️', condition: (s) => Object.keys(s.dailyCompleted || {}).length >= 14 },

  // Premium
  { id: 'premium', name: 'Enlightened', desc: 'Unlock Premium', icon: '✦', condition: (s) => s.isPremium },

  // Packs
  { id: 'pack_tutorial', name: 'Tutorial Graduate', desc: 'Complete the Tutorial pack', icon: '📚', condition: (s) => [1,2,3,4,5,6,7,8,9,10].every(id => s.stars[id] > 0) },
  { id: 'pack_refraction', name: 'Refractive Mind', desc: 'Complete the Refraction pack', icon: '🔬', condition: (s) => [11,12,13,14,15,16,17,18,19,20].every(id => s.stars[id] > 0) },
  { id: 'pack_prism', name: 'Prism Master', desc: 'Complete the Prism pack', icon: '🔺', condition: (s) => [21,22,23,24,25].every(id => s.stars[id] > 0) },
  { id: 'pack_singularity', name: 'Singularity Reached', desc: 'Complete the Singularity pack', icon: '🌀', condition: (s) => [26,27,28,29,30].every(id => s.stars[id] > 0) },

  // Hints
  { id: 'no_hints_5', name: 'Self-Reliant', desc: 'Complete 5 levels without using any hints', icon: '🧠', condition: (s) => (s.levelsWithoutHints || 0) >= 5 },
  { id: 'hint_user', name: 'Open Minded', desc: 'Use your first hint', icon: '💡', condition: (s) => (s.hintsUsed || 0) >= 1 },

  // Speedrun
  { id: 'speed_ten', name: 'Speed of Light', desc: 'Complete 10 levels in a single session', icon: '⚡', condition: (s) => (s.sessionLevels || 0) >= 10 },
];

export function checkNewAchievements(save, prevSave) {
  const newlyUnlocked = [];
  const alreadyUnlocked = new Set(prevSave.achievements || []);

  for (const ach of ACHIEVEMENTS) {
    if (!alreadyUnlocked.has(ach.id) && ach.condition(save)) {
      newlyUnlocked.push(ach);
    }
  }
  return newlyUnlocked;
}
