// LeafTriage Speech Service with Python Backend gTTS, Google Translate Audio & Offline Fallback

import { ApiService } from './api.js';

export const INTENTS = {
  SCAN: 'INTENT_SCAN',
  REMEDIES: 'INTENT_REMEDIES',
  FERTILIZER: 'INTENT_FERTILIZER',
  TRADITIONAL: 'INTENT_TRADITIONAL',
  READ: 'INTENT_READ',
  HISTORY: 'INTENT_HISTORY',
  BACK: 'INTENT_BACK',
  HELP: 'INTENT_HELP',
  LIBRARY: 'INTENT_LIBRARY',
  HOME: 'INTENT_HOME',
  CROP_TOMATO: 'INTENT_CROP_TOMATO',
  CROP_PADDY: 'INTENT_CROP_PADDY',
  CROP_BANANA: 'INTENT_CROP_BANANA',
  CROP_GROUNDNUT: 'INTENT_CROP_GROUNDNUT',
  CROP_CHILLI: 'INTENT_CROP_CHILLI',
  LANG_TAMIL: 'INTENT_LANG_TAMIL',
  LANG_ENGLISH: 'INTENT_LANG_ENGLISH',
  UNKNOWN: 'INTENT_UNKNOWN'
};

const TAMIL_VOWELS = {
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
  'எ': 'e', 'ஏ': 'ae', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oa', 'ஔ': 'au',
  'ஃ': 'h'
};

const TAMIL_CONSONANTS = {
  'க': 'ka', 'ங': 'nga', 'ச': 'cha', 'ஞ': 'nya', 'ட': 'ta', 'ண': 'na',
  'த': 'tha', 'ந': 'na', 'ப': 'pa', 'ம': 'ma', 'ய': 'ya', 'ர': 'ra',
  'ல': 'la', 'வ': 'va', 'ழ': 'zha', 'ள': 'la', 'ற': 'ra', 'ன': 'na',
  'ஜ': 'ja', 'ஷ': 'sha', 'ஸ': 'sa', 'ஹ': 'ha'
};

const TAMIL_SIGNS = {
  'ா': 'aa', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
  'ெ': 'e', 'ே': 'ae', 'ை': 'ai', 'ொ': 'o', 'ோ': 'oa', 'ௌ': 'au',
  '்': ''
};

export function transliterateTamilToLatin(text) {
  if (!text) return '';
  let result = '';
  const len = text.length;
  
  for (let i = 0; i < len; i++) {
    const char = text[i];
    const nextChar = i + 1 < len ? text[i + 1] : '';

    if (TAMIL_VOWELS[char]) {
      result += TAMIL_VOWELS[char];
    } else if (TAMIL_CONSONANTS[char]) {
      const baseConsonant = TAMIL_CONSONANTS[char].slice(0, -1);
      if (nextChar === '்') {
        result += baseConsonant;
        i++;
      } else if (TAMIL_SIGNS[nextChar]) {
        result += baseConsonant + TAMIL_SIGNS[nextChar];
        i++;
      } else {
        result += TAMIL_CONSONANTS[char];
      }
    } else {
      result += char;
    }
  }

  return result
    .replace(/ththa/g, 'tha')
    .replace(/kka/g, 'ka')
    .replace(/ppa/g, 'pa')
    .replace(/mma/g, 'ma')
    .replace(/lla/g, 'la');
}

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentAudio = null;
    this.recognition = null;
    this.isListening = false;
    this.isSpeaking = false;
    this.voices = [];
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.voices = this.synth.getVoices() || [];
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  getBestVoice(lang = 'ta') {
    if (!this.synth) return null;
    this.voices = this.synth.getVoices() || [];
    
    if (lang === 'ta') {
      const nativeTamil = this.voices.find(v => 
        (v.lang && v.lang.toLowerCase().startsWith('ta')) || 
        (v.name && (v.name.toLowerCase().includes('tamil') || v.name.includes('தமிழ்')))
      );
      if (nativeTamil) return { voice: nativeTamil, isNative: true };

      const indianEnglish = this.voices.find(v => 
        v.lang && (v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en_in'))
      );
      if (indianEnglish) return { voice: indianEnglish, isNative: false };

      const defaultVoice = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) || this.voices[0];
      return { voice: defaultVoice, isNative: false };
    } else {
      const indianEnglish = this.voices.find(v => 
        v.lang && (v.lang.toLowerCase().includes('en-in') || v.lang.toLowerCase().includes('en_in'))
      );
      if (indianEnglish) return { voice: indianEnglish, isNative: true };

      const defaultVoice = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en')) || this.voices[0];
      return { voice: defaultVoice, isNative: true };
    }
  }

  // Play audio stream from URL
  playAudioUrl(url) {
    return new Promise((resolve, reject) => {
      this.stopSpeaking();
      this.isSpeaking = true;
      const audio = new Audio(url);
      this.currentAudio = audio;

      const timeout = setTimeout(() => {
        try { audio.pause(); } catch (_) {}
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.isSpeaking = false;
        }
        resolve();
      }, 7000);

      audio.onended = () => {
        clearTimeout(timeout);
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.isSpeaking = false;
        }
        resolve();
      };

      audio.onerror = (e) => {
        clearTimeout(timeout);
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.isSpeaking = false;
        }
        reject(e);
      };

      const p = audio.play();
      if (p !== undefined) {
        p.catch(err => {
          clearTimeout(timeout);
          if (this.currentAudio === audio) {
            this.currentAudio = null;
            this.isSpeaking = false;
          }
          reject(err);
        });
      }
    });
  }

  // Speak function with multi-tier Google Translate Voice
  async speak(text, lang = 'ta', rate = 0.95, onEndCallback = null) {
    this.stopSpeaking();
    this.isSpeaking = true;

    // Clean text chunk (crisp response)
    const cleanChunk = text.replace(/[\n\r]/g, ' ').trim().slice(0, 160);

    // Tier 1: Python Backend gTTS endpoint (authentic Google Translate Voice)
    try {
      const backendUrl = ApiService.getTTSAudioUrl(cleanChunk, lang);
      await this.playAudioUrl(backendUrl);
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
      return;
    } catch (backendTtsError) {
      console.log('Backend TTS unavailable, attempting direct Google Voice:', backendTtsError);
    }

    // Tier 2: Direct Google Translate TTS endpoint
    try {
      const targetLang = lang === 'ta' ? 'ta' : 'en';
      const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodeURIComponent(cleanChunk)}`;
      await this.playAudioUrl(directUrl);
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
      return;
    } catch (directTtsError) {
      console.log('Direct Google TTS unavailable, falling back to on-device SpeechSynthesis:', directTtsError);
    }

    // Tier 3: Local on-device SpeechSynthesis
    if (!this.synth) {
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      if (this.synth.paused) {
        this.synth.resume();
      }

      const voiceData = this.getBestVoice(lang);
      const isNative = voiceData?.isNative;
      const voice = voiceData?.voice;

      let spokenText = text;
      let targetLocale = lang === 'ta' ? 'ta-IN' : 'en-IN';

      if (lang === 'ta' && !isNative) {
        spokenText = transliterateTamilToLatin(text);
        targetLocale = 'en-IN';
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = targetLocale;
      utterance.rate = lang === 'ta' && !isNative ? Math.min(rate, 0.88) : rate;
      utterance.pitch = 1.0;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        if (onEndCallback) onEndCallback();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('All TTS speech failed:', e);
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
    }
  }

  stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeaking = false;
  }

  detectLanguage(text) {
    if (!text || typeof text !== 'string') return 'en';
    const normalized = text.toLowerCase().trim();
    const hasTamilChars = /[\u0B80-\u0BFF]/.test(text);
    const hasTamilWords = /(தமிழ்|தமிழ்|தமிழ்|tamil|tamizh|சேர்|ஸ்கேன்|மருந்து|முகப்பு|படி|தேர்வு|கேமரா)/i.test(normalized) || hasTamilChars;
    if (hasTamilWords && !/(english|en\b)/i.test(normalized)) return 'ta';
    return 'en';
  }

  parseIntent(text) {
    if (!text || typeof text !== 'string') return INTENTS.UNKNOWN;
    const normalized = text.toLowerCase().trim();

    // 0. Language Switch to Tamil ("tamil", "தமிழ்", "தமிழில்", "change to tamil", etc.)
    if (
      normalized === 'tamil' ||
      normalized.includes('tamil') ||
      normalized.includes('tamizh') ||
      normalized.includes('தமி') ||
      normalized.includes('தமில்')
    ) {
      const hasScanKeyword = normalized.includes('scanner') || normalized.includes('camera') || normalized.includes('photo') || normalized.includes('ஸ்கேன') || normalized.includes('கேமரா');
      const hasExplicitLanguageKeyword = normalized.includes('language') || normalized.includes('மொழி') || normalized.includes('change') || normalized.includes('switch') || normalized.includes('மாற்று') || normalized.includes('மாத்து') || normalized.includes('set') || normalized.includes('speak') || normalized.includes('பேசு');
      
      if (hasScanKeyword && !hasExplicitLanguageKeyword) {
        return INTENTS.SCAN;
      }
      return INTENTS.LANG_TAMIL;
    }

    // 0.1 Language Switch to English
    if (
      normalized === 'english' ||
      normalized === 'ஆங்கிலம்' ||
      normalized === 'இங்கிலீஷ்' ||
      normalized.includes('english') ||
      normalized.includes('ஆங்கில') ||
      normalized.includes('இங்கிலீ') ||
      normalized.includes('இங்கிலி')
    ) {
      const hasScanKeyword = normalized.includes('scanner') || normalized.includes('camera') || normalized.includes('photo') || normalized.includes('ஸ்கேன') || normalized.includes('கேமரா');
      const hasExplicitLanguageKeyword = normalized.includes('language') || normalized.includes('மொழி') || normalized.includes('change') || normalized.includes('switch') || normalized.includes('மாற்று') || normalized.includes('மாத்து') || normalized.includes('set') || normalized.includes('speak') || normalized.includes('பேசு');

      if (hasScanKeyword && !hasExplicitLanguageKeyword) {
        return INTENTS.SCAN;
      }
      return INTENTS.LANG_ENGLISH;
    }

    // 1. Remedies & Medicines (Evaluate before general keywords)
    if (
      normalized.includes('remedy') ||
      normalized.includes('remedies') ||
      normalized.includes('cure') ||
      normalized.includes('treatment') ||
      normalized.includes('medicine') ||
      normalized.includes('doctor') ||
      normalized.includes('தீர்வு') ||
      normalized.includes('மருந்து') ||
      normalized.includes('வைத்தியம்') ||
      normalized.includes('குணம்') ||
      normalized.includes('நிவாரணம்')
    ) {
      return INTENTS.REMEDIES;
    }

    // 2. Specific Crops (Voice Crop Selector)
    if (
      normalized.includes('tomato') || 
      normalized.includes('தக்காளி') || 
      normalized.includes('thakkali')
    ) {
      return INTENTS.CROP_TOMATO;
    }

    if (
      normalized.includes('paddy') || 
      normalized.includes('rice') || 
      normalized.includes('நெல்') || 
      normalized.includes('nel')
    ) {
      return INTENTS.CROP_PADDY;
    }

    if (
      normalized.includes('banana') || 
      normalized.includes('வாழை') || 
      normalized.includes('vaazhai')
    ) {
      return INTENTS.CROP_BANANA;
    }

    if (
      normalized.includes('groundnut') || 
      normalized.includes('peanut') || 
      normalized.includes('நிலக்கடலை') || 
      normalized.includes('கடலை') || 
      normalized.includes('nilakkadalai')
    ) {
      return INTENTS.CROP_GROUNDNUT;
    }

    if (
      normalized.includes('chilli') || 
      normalized.includes('chili') || 
      normalized.includes('pepper') || 
      normalized.includes('மிளகாய்') || 
      normalized.includes('milagai')
    ) {
      return INTENTS.CROP_CHILLI;
    }

    // 3. Scanner / Camera / "Open the scanner"
    // English: "open the scanner", "open scanner", "scanner", "camera", "scan", "take photo", "photo", "picture", "leaf photo"
    // Tamil: "இலை ஸ்கேனர்", "ஸ்கேனர்", "கேமரா", "ஸ்கேன்", "படம் எடு", "புகைப்படம்", "இலை", "திற"
    const goToScanIntent =
      (normalized.includes('go') || normalized.includes('goto') || normalized.includes('take me') || normalized.includes('navigate') || normalized.includes('open')) &&
      (normalized.includes('scan') || normalized.includes('scanner') || normalized.includes('camera') || normalized.includes('photo') || normalized.includes('picture') || normalized.includes('leaf') || normalized.includes('diagnose'));

    const goToScanTamilIntent =
      (normalized.includes('போ') || normalized.includes('செல்') || normalized.includes('திற') || normalized.includes('காட்டு') || normalized.includes('தெரி')) &&
      (normalized.includes('ஸ்கேன்') || normalized.includes('ஸ்கேன') || normalized.includes('கேமரா') || normalized.includes('படம்') || normalized.includes('இலை') || normalized.includes('சோதனை'));

    if (
      goToScanIntent ||
      goToScanTamilIntent ||
      normalized.includes('scanner') ||
      normalized.includes('scan') ||
      normalized.includes('camera') ||
      normalized.includes('photo') ||
      normalized.includes('picture') ||
      normalized.includes('image') ||
      normalized.includes('capture') ||
      normalized.includes('leaf') ||
      normalized.includes('ஸ்கேன') ||
      normalized.includes('ஸ்கேன்') ||
      normalized.includes('கேமரா') ||
      normalized.includes('படம்') ||
      normalized.includes('புகைப்படம்') ||
      normalized.includes('இலை') ||
      (normalized.includes('open') && (normalized.includes('scan') || normalized.includes('cam') || normalized.includes('leaf'))) ||
      (normalized.includes('திற') && (normalized.includes('ஸ்கேன்') || normalized.includes('கேமரா') || normalized.includes('இலை') || normalized.includes('ஸ்கேன')))
    ) {
      return INTENTS.SCAN;
    }

    // 4. Fertilizers & Sprays
    if (
      normalized.includes('fertilizer') ||
      normalized.includes('chemical') ||
      normalized.includes('spray') ||
      normalized.includes('dose') ||
      normalized.includes('உரம்') ||
      normalized.includes('தெளிப்பு') ||
      normalized.includes('யூரியா')
    ) {
      return INTENTS.FERTILIZER;
    }

    // 5. Traditional & Organic
    if (
      normalized.includes('traditional') ||
      normalized.includes('organic') ||
      normalized.includes('panchagavya') ||
      normalized.includes('ayush') ||
      normalized.includes('பாரம்பரிய') ||
      normalized.includes('இயற்கை') ||
      normalized.includes('பஞ்சகாவ்யா') ||
      normalized.includes('மோர்')
    ) {
      return INTENTS.TRADITIONAL;
    }

    // 6. Read Aloud / Speak
    if (
      normalized.includes('read') ||
      normalized.includes('speak') ||
      normalized.includes('listen') ||
      normalized.includes('tell') ||
      normalized.includes('voice') ||
      normalized.includes('படி') ||
      normalized.includes('வாசி') ||
      normalized.includes('சொல்லு') ||
      normalized.includes('கேள்') ||
      normalized.includes('படித்துக் காட்டு')
    ) {
      return INTENTS.READ;
    }

    // 7. History & Previous Scans
    if (
      normalized.includes('history') ||
      normalized.includes('recent') ||
      normalized.includes('past') ||
      normalized.includes('record') ||
      normalized.includes('old') ||
      normalized.includes('வரலாறு') ||
      normalized.includes('பழைய') ||
      normalized.includes('முந்தைய') ||
      normalized.includes('முன்னாள்')
    ) {
      return INTENTS.HISTORY;
    }

    // 8. Home / Dashboard
    if (
      normalized.includes('home') ||
      normalized.includes('dashboard') ||
      normalized.includes('main') ||
      normalized.includes('start') ||
      normalized.includes('முகப்பு') ||
      normalized.includes('ஆரம்பம்') ||
      normalized.includes('ஹோம்') ||
      normalized.includes('வீடு')
    ) {
      return INTENTS.HOME;
    }

    // 9. Library
    if (
      normalized.includes('library') ||
      normalized.includes('crop') ||
      normalized.includes('diseases') ||
      normalized.includes('all') ||
      normalized.includes('நூலகம்') ||
      normalized.includes('பயிர்') ||
      normalized.includes('அனைத்தும்')
    ) {
      return INTENTS.LIBRARY;
    }

    // 10. Back / Return
    if (
      normalized.includes('back') ||
      normalized.includes('return') ||
      normalized.includes('பின்') ||
      normalized.includes('பின்னே') ||
      normalized.includes('வெளியே')
    ) {
      return INTENTS.BACK;
    }

    // 11. Help
    if (
      normalized.includes('help') ||
      normalized.includes('guide') ||
      normalized.includes('how') ||
      normalized.includes('உதவி') ||
      normalized.includes('வழிகாட்டி')
    ) {
      return INTENTS.HELP;
    }

    return INTENTS.UNKNOWN;
  }

  startListening({ lang = 'ta', onResult, onError, onEnd }) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return false;
    }

    try {
      this.stopListening();
      this.stopSpeaking(); // Immediately clear any playing audio so microphone hears the user cleanly

      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 3;

      let accumulated = '';

      recognition.onstart = () => {
        this.isListening = true;
      };

      recognition.onresult = (event) => {
        let currentFull = '';
        for (let i = 0; i < event.results.length; i++) {
          currentFull += event.results[i][0].transcript + ' ';
        }
        currentFull = currentFull.trim();
        accumulated = currentFull;
        const isFinal = event.results[event.results.length - 1]?.isFinal || false;

        if (onResult && currentFull) {
          onResult(currentFull, isFinal);
        }
      };

      recognition.onerror = (e) => {
        console.warn('SpeechRecognition error:', e);
        if (e.error !== 'no-speech') {
          this.isListening = false;
          if (onError) onError(e.error || 'Mic error');
        }
      };

      recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd(accumulated);
      };

      recognition.start();
      this.recognition = recognition;
      return true;
    } catch (err) {
      console.warn('Start listening failed:', err);
      this.isListening = false;
      if (onError) onError(err.message || 'Error initializing mic');
      return false;
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.isListening = false;
  }
}

export const speechService = new SpeechService();
