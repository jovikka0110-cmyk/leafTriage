// LeafTriage API Client connecting React Frontend to Python FastAPI Local Backend

const getDirectUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = typeof window !== 'undefined' && window.location.origin ? '/api' : 'http://127.0.0.1:8000/api';

export const ApiService = {
  // Check backend server health
  checkHealth: async () => {
    const urls = [`${API_BASE_URL}/health`, `${getDirectUrl()}/health`];
    for (const url of urls) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          return await response.json();
        }
      } catch (_) {}
    }
    return null;
  },

  // Real-time scan leaf photo with Python backend
  scanLeaf: async (imageData, presetId = null, crop = null) => {
    const urls = [`${API_BASE_URL}/scan`, `${getDirectUrl()}/scan`];
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageData || '',
            presetId: presetId,
            crop: crop
          }),
          signal: AbortSignal.timeout(9000)
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn(`Scan attempt via ${url} failed, trying next:`, err);
      }
    }
    console.warn('All backend scan attempts failed, falling back to local client engine');
    return null;
  },

  // Get all diseases from SQLite database
  getDiseases: async () => {
    const urls = [`${API_BASE_URL}/diseases`, `${getDirectUrl()}/diseases`];
    for (const url of urls) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          return await response.json();
        }
      } catch (_) {}
    }
    return null;
  },

  // Get scan history from SQLite database
  getHistory: async () => {
    const urls = [`${API_BASE_URL}/history`, `${getDirectUrl()}/history`];
    for (const url of urls) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          return await response.json();
        }
      } catch (_) {}
    }
    return null;
  },

  // Delete single scan record from SQLite database
  deleteHistoryItem: async (id) => {
    const urls = [`${API_BASE_URL}/history/${id}`, `${getDirectUrl()}/history/${id}`];
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) return true;
      } catch (_) {}
    }
    return false;
  },

  // Clear all scan history from SQLite database
  clearAllHistory: async () => {
    const urls = [`${API_BASE_URL}/history`, `${getDirectUrl()}/history`];
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'DELETE',
          signal: AbortSignal.timeout(3000)
        });
        if (response.ok) return true;
      } catch (_) {}
    }
    return false;
  },

  // Stream Google Translate Voice TTS audio from Python backend
  getTTSAudioUrl: (text, lang = 'ta') => {
    const cleanText = encodeURIComponent(text.trim().slice(0, 180));
    return `${API_BASE_URL}/tts?text=${cleanText}&lang=${lang}`;
  }
};
