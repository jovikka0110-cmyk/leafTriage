// LeafTriage Local Offline Storage Service (localStorage & IndexedDB fallback)

const KEYS = {
  LANG: 'leaftriage_lang',
  THEME: 'leaftriage_theme',
  TEXT_SIZE: 'leaftriage_text_size',
  VOICE_SPEED: 'leaftriage_voice_speed',
  HISTORY: 'leaftriage_history',
  HAS_SEEN_SPLASH: 'leaftriage_seen_splash'
};

// Initial default seed history for realistic farmer preview
const INITIAL_SEED_HISTORY = [
  {
    id: 'scan_seed_1',
    diseaseId: 'paddy_blast',
    diseaseNameEn: 'Rice Blast',
    diseaseNameTa: 'நெல் குலை நோய்',
    cropEn: 'Paddy',
    cropTa: 'நெல்',
    icon: '🌾',
    confidence: 93,
    timestamp: Date.now() - (1000 * 60 * 60 * 2), // 2 hours ago
    imagePlaceholder: 'paddy'
  },
  {
    id: 'scan_seed_2',
    diseaseId: 'tomato_early_blight',
    diseaseNameEn: 'Early Blight',
    diseaseNameTa: 'ஆரம்ப இலைக்கருகல் நோய்',
    cropEn: 'Tomato',
    cropTa: 'தக்காளி',
    icon: '🍅',
    confidence: 89,
    timestamp: Date.now() - (1000 * 60 * 60 * 24), // Yesterday
    imagePlaceholder: 'tomato'
  }
];

export const StorageService = {
  getLanguage: () => {
    try {
      return localStorage.getItem(KEYS.LANG) || 'ta';
    } catch {
      return 'ta';
    }
  },

  setLanguage: (lang) => {
    try {
      localStorage.setItem(KEYS.LANG, lang);
    } catch (e) {
      console.warn('Storage failed', e);
    }
  },

  getTheme: () => {
    try {
      return localStorage.getItem(KEYS.THEME) || 'light';
    } catch {
      return 'light';
    }
  },

  setTheme: (theme) => {
    try {
      localStorage.setItem(KEYS.THEME, theme);
    } catch (e) {
      console.warn('Storage failed', e);
    }
  },

  getTextSize: () => {
    try {
      return localStorage.getItem(KEYS.TEXT_SIZE) || 'normal';
    } catch {
      return 'normal';
    }
  },

  setTextSize: (size) => {
    try {
      localStorage.setItem(KEYS.TEXT_SIZE, size);
    } catch (e) {
      console.warn('Storage failed', e);
    }
  },

  getVoiceSpeed: () => {
    try {
      const spd = localStorage.getItem(KEYS.VOICE_SPEED);
      return spd ? parseFloat(spd) : 0.95;
    } catch {
      return 0.95;
    }
  },

  setVoiceSpeed: (speed) => {
    try {
      localStorage.setItem(KEYS.VOICE_SPEED, speed.toString());
    } catch (e) {
      console.warn('Storage failed', e);
    }
  },

  getHistory: () => {
    try {
      const data = localStorage.getItem(KEYS.HISTORY);
      if (!data) {
        localStorage.setItem(KEYS.HISTORY, JSON.stringify(INITIAL_SEED_HISTORY));
        return INITIAL_SEED_HISTORY;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SEED_HISTORY;
    }
  },

  saveScanResult: (scan) => {
    try {
      const current = StorageService.getHistory();
      const timestamp = Date.now();
      const uniqueId = `scan_${timestamp}_${Math.random().toString(36).slice(2, 10)}`;
      const updated = [
        {
          id: uniqueId,
          timestamp,
          ...scan
        },
        ...current
      ].slice(0, 50); // Keep last 50 scans
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to save scan history', e);
      return [];
    }
  },

  deleteScan: (id) => {
    try {
      const current = StorageService.getHistory();
      const updated = current.filter(item => item.id !== id);
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to delete scan', e);
      return [];
    }
  },

  clearHistory: () => {
    try {
      localStorage.setItem(KEYS.HISTORY, JSON.stringify([]));
      return [];
    } catch (e) {
      console.warn('Failed to clear history', e);
      return [];
    }
  },

  hasSeenSplash: () => {
    try {
      return localStorage.getItem(KEYS.HAS_SEEN_SPLASH) === 'true';
    } catch {
      return false;
    }
  },

  setSeenSplash: (val = true) => {
    try {
      localStorage.setItem(KEYS.HAS_SEEN_SPLASH, val ? 'true' : 'false');
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }
};
