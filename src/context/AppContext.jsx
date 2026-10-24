// LeafTriage Global Application Context

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../l10n/translations';
import { StorageService } from '../services/storage';
import { speechService, INTENTS } from '../services/speech';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => StorageService.getLanguage());
  const [theme, setTheme] = useState(() => StorageService.getTheme());
  const [textSize, setTextSizeState] = useState(() => StorageService.getTextSize());
  const [voiceSpeed, setVoiceSpeedState] = useState(() => StorageService.getVoiceSpeed());
  const [historyList, setHistoryList] = useState(() => StorageService.getHistory());
  
  // Navigation stack
  const [currentScreen, setCurrentScreen] = useState(() => {
    return StorageService.hasSeenSplash() ? 'dashboard' : 'splash';
  });
  const [navHistory, setNavHistory] = useState(['dashboard']);
  const [screenParams, setScreenParams] = useState({});

  // Voice Agent State
  const [isVoiceSheetOpen, setIsVoiceSheetOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync theme with DOM attributes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    StorageService.setTheme(theme);
  }, [theme]);

  // Sync text size with DOM attributes
  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', textSize);
    StorageService.setTextSize(textSize);
  }, [textSize]);

  // Navigation handlers
  const navigateTo = (screen, params = {}) => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setScreenParams(params);
    setNavHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    if (navHistory.length > 1) {
      const nextStack = [...navHistory];
      nextStack.pop();
      const previousScreen = nextStack[nextStack.length - 1];
      setNavHistory(nextStack);
      setCurrentScreen(previousScreen);
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const setLanguage = (newLang) => {
    if (newLang !== 'ta' && newLang !== 'en') return;
    setLang(newLang);
    StorageService.setLanguage(newLang);
  };

  const toggleLanguage = () => {
    const next = lang === 'ta' ? 'en' : 'ta';
    setLanguage(next);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTextSize = (size) => {
    setTextSizeState(size);
  };

  const setVoiceSpeed = (spd) => {
    setVoiceSpeedState(spd);
    StorageService.setVoiceSpeed(spd);
  };

  const completeSplash = (chosenLang) => {
    if (chosenLang) {
      setLanguage(chosenLang);
    }
    StorageService.setSeenSplash(true);
    setCurrentScreen('dashboard');
    setNavHistory(['dashboard']);
  };

  const addScan = (scanData) => {
    const updated = StorageService.saveScanResult(scanData);
    setHistoryList(updated);
  };

  const removeScan = (id) => {
    const updated = StorageService.deleteScan(id);
    setHistoryList(updated);
  };

  const clearAllHistory = () => {
    const updated = StorageService.clearHistory();
    setHistoryList(updated);
  };

  const speakText = (text, onEnd) => {
    setIsSpeaking(true);
    speechService.speak(text, lang, voiceSpeed, () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    });
  };

  const stopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  // Handle Intent from Voice Agent with Immediate Spoken Confirmation
  const executeIntent = (intent, text = '') => {
    switch (intent) {
      case INTENTS.LANG_TAMIL:
        setLanguage('ta');
        setIsVoiceSheetOpen(false);
        speechService.speak('பயன்பாட்டின் மொழி தமிழில் மாற்றப்பட்டது. வணக்கம் உழவரே!', 'ta', voiceSpeed);
        break;

      case INTENTS.LANG_ENGLISH:
        setLanguage('en');
        setIsVoiceSheetOpen(false);
        speechService.speak('The application language has been changed to English. Welcome farmer!', 'en', voiceSpeed);
        break;

      case INTENTS.SCAN:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'சரி உழவரே! இலை ஸ்கேனர் திறக்கப்படுகிறது.' : 'Opening leaf scanner now.');
        navigateTo('camera');
        break;

      case INTENTS.CROP_TOMATO:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'தக்காளி பயிர் தேர்வு செய்யப்பட்டது. இலை படம் எடுக்கவும்.' : 'Tomato selected. Ready to scan leaf.');
        navigateTo('camera', { selectedCrop: 'Tomato' });
        break;

      case INTENTS.CROP_PADDY:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'நெல் பயிர் தேர்வு செய்யப்பட்டது. இலை படம் எடுக்கவும்.' : 'Paddy selected. Ready to scan leaf.');
        navigateTo('camera', { selectedCrop: 'Paddy' });
        break;

      case INTENTS.CROP_BANANA:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'வாழை பயிர் தேர்வு செய்யப்பட்டது. இலை படம் எடுக்கவும்.' : 'Banana selected. Ready to scan leaf.');
        navigateTo('camera', { selectedCrop: 'Banana' });
        break;

      case INTENTS.CROP_GROUNDNUT:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'நிலக்கடலை பயிர் தேர்வு செய்யப்பட்டது. இலை படம் எடுக்கவும்.' : 'Groundnut selected. Ready to scan leaf.');
        navigateTo('camera', { selectedCrop: 'Groundnut' });
        break;

      case INTENTS.CROP_CHILLI:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'மிளகாய் பயிர் தேர்வு செய்யப்பட்டது. இலை படம் எடுக்கவும்.' : 'Chilli selected. Ready to scan leaf.');
        navigateTo('camera', { selectedCrop: 'Chilli' });
        break;

      case INTENTS.HOME:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'முகப்புப் பக்கத்திற்கு செல்கிறோம்.' : 'Returning to home screen.');
        navigateTo('dashboard');
        break;

      case INTENTS.REMEDIES:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'நிவாரண தீர்வுகள் பக்கம் திறக்கப்படுகிறது.' : 'Opening crop remedies.');
        if (screenParams?.disease) {
          navigateTo('remedies', screenParams);
        } else {
          navigateTo('library');
        }
        break;

      case INTENTS.HISTORY:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'முந்தைய இலை சோதனைகள் திறக்கப்படுகிறது.' : 'Opening your scan history.');
        navigateTo('history');
        break;

      case INTENTS.LIBRARY:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'பயிர் மருத்துவ நூலகம் திறக்கப்படுகிறது.' : 'Opening crop disease library.');
        navigateTo('library');
        break;

      case INTENTS.BACK:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'பின் செல்கிறோம்.' : 'Going back.');
        goBack();
        break;

      case INTENTS.HELP:
        setIsVoiceSheetOpen(false);
        speakText(lang === 'ta' ? 'உதவி மற்றும் அமைப்புகள் பக்கம்.' : 'Opening help and settings.');
        navigateTo('settings');
        break;

      case INTENTS.READ:
        if (currentScreen === 'result' && screenParams?.disease) {
          const d = screenParams.disease;
          const speechMsg = lang === 'ta'
            ? `பயிர்: ${d.crop_ta}. நோய்: ${d.names.ta}. அறிகுறிகள்: ${d.symptoms.ta}`
            : `Crop: ${d.crop}. Disease: ${d.names.en}. Symptoms: ${d.symptoms.en}`;
          speakText(speechMsg);
        } else {
          const generalMsg = lang === 'ta'
            ? 'வணக்கம் உழவரே! பயிரை ஸ்கேன் செய்ய ஸ்கேனருக்கு போ என்று கூறலாம்.'
            : 'Welcome farmer! You can say go to scanner or show remedies anytime.';
          speakText(generalMsg);
        }
        break;

      default:
        break;
    }
  };

  const t = translations[lang] || translations.ta;

  return (
    <AppContext.Provider
      value={{
        lang,
        t,
        toggleLanguage,
        setLanguage,
        theme,
        toggleTheme,
        textSize,
        setTextSize,
        voiceSpeed,
        setVoiceSpeed,
        currentScreen,
        screenParams,
        navigateTo,
        goBack,
        completeSplash,
        historyList,
        addScan,
        removeScan,
        clearAllHistory,
        isVoiceSheetOpen,
        setIsVoiceSheetOpen,
        isSpeaking,
        speakText,
        stopSpeaking,
        executeIntent
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
