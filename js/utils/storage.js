// localStorage persistence for progress tracking
window.AppStorage = {
  KEYS: {
    SETTINGS: 'woordspel_settings',
    SESSIONS: 'woordspel_sessions',
    STATS: 'woordspel_stats',
  },

  // === SETTINGS ===
  getSettings() {
    const defaults = {
      language: 'nl',
      difficulty: 'easy',
      autoAdjust: true,
      soundEnabled: true,
    };
    try {
      const saved = JSON.parse(localStorage.getItem(this.KEYS.SETTINGS));
      return { ...defaults, ...saved };
    } catch {
      return defaults;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  // === SESSION HISTORY ===
  getSessions() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SESSIONS)) || [];
    } catch {
      return [];
    }
  },

  saveSession(session) {
    // session: { date, exerciseType, score, total, difficulty, timeSpent, language }
    const sessions = this.getSessions();
    sessions.push({
      ...session,
      date: new Date().toISOString(),
    });
    // Keep last 500 sessions max
    if (sessions.length > 500) {
      sessions.splice(0, sessions.length - 500);
    }
    localStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
  },

  // === AGGREGATED STATS ===
  getStats() {
    const defaults = {
      totalExercises: 0,
      totalCorrect: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDate: null,
      rollingAccuracy: [], // last 10 results (true/false)
    };
    try {
      const saved = JSON.parse(localStorage.getItem(this.KEYS.STATS));
      return { ...defaults, ...saved };
    } catch {
      return defaults;
    }
  },

  saveStats(stats) {
    localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
  },

  recordAnswer(correct) {
    const stats = this.getStats();
    stats.totalExercises++;
    if (correct) {
      stats.totalCorrect++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      stats.currentStreak = 0;
    }
    stats.lastPlayedDate = new Date().toISOString();

    // Rolling accuracy (last 10)
    stats.rollingAccuracy.push(correct);
    if (stats.rollingAccuracy.length > 10) {
      stats.rollingAccuracy.shift();
    }

    this.saveStats(stats);
    return stats;
  },

  getRollingAccuracy() {
    const stats = this.getStats();
    if (stats.rollingAccuracy.length === 0) return 0.5;
    const correct = stats.rollingAccuracy.filter(Boolean).length;
    return correct / stats.rollingAccuracy.length;
  },

  // Get recommended difficulty based on rolling accuracy
  getRecommendedDifficulty() {
    const accuracy = this.getRollingAccuracy();
    const stats = this.getStats();
    if (stats.rollingAccuracy.length < 5) return null; // Not enough data
    if (accuracy >= 0.8) return 'up';
    if (accuracy <= 0.4) return 'down';
    return 'stay';
  },

  // === EXPORT ===
  getSessionsByDateRange(startDate, endDate) {
    const sessions = this.getSessions();
    return sessions.filter(s => {
      const d = new Date(s.date);
      return d >= startDate && d <= endDate;
    });
  },

  // Clear all data
  clearAll() {
    localStorage.removeItem(this.KEYS.SETTINGS);
    localStorage.removeItem(this.KEYS.SESSIONS);
    localStorage.removeItem(this.KEYS.STATS);
  },
};
