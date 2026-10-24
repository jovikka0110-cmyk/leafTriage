import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { speechService, INTENTS } from '../services/speech';
import { 
  Mic, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Camera, 
  BookOpen, 
  Clock, 
  Home, 
  CheckCircle,
  Headphones,
  Globe
} from 'lucide-react';

export default function VoiceAgentSheet() {
  const { 
    lang, 
    t, 
    setLanguage,
    isVoiceSheetOpen, 
    setIsVoiceSheetOpen, 
    executeIntent, 
    speakText, 
    isSpeaking, 
    stopSpeaking 
  } = useApp();

  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [micLanguage, setMicLanguage] = useState(lang === 'ta' ? 'ta' : 'en');
  const [recognizedAction, setRecognizedAction] = useState(null);
  const [micError, setMicError] = useState(null);

  const isExecutingRef = useRef(false);
  const timeoutRef = useRef(null);

  // Quick Action Command List for Illiterate/Rural Farmers
  const quickActions = [
    {
      id: INTENTS.LANG_TAMIL,
      emoji: '🇮🇳',
      titleTa: 'தமிழ் மொழி',
      titleEn: 'Tamil Language',
      commandSampleTa: '"தமிழ்" / "தமிழுக்கு"',
      commandSampleEn: '"Tamil" / "Change to Tamil"',
      bg: 'linear-gradient(135deg, #0e3b2e 0%, #1b4332 100%)',
      border: '#52B788'
    },
    {
      id: INTENTS.SCAN,
      emoji: '📸',
      titleTa: 'இலை ஸ்கேனர்',
      titleEn: 'Open Scanner',
      commandSampleTa: '"ஸ்கேனரை திற" / "ஸ்கேன்"',
      commandSampleEn: '"Open the scanner"',
      bg: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
      border: '#52B788'
    },
    {
      id: INTENTS.REMEDIES,
      emoji: '🌿',
      titleTa: 'மருந்து தீர்வுகள்',
      titleEn: 'Show Remedies',
      commandSampleTa: '"மருந்து காட்டு" / "தீர்வு"',
      commandSampleEn: '"Show remedies"',
      bg: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)',
      border: '#74C69D'
    },
    {
      id: INTENTS.CROP_TOMATO,
      emoji: '🍅',
      titleTa: 'தக்காளி',
      titleEn: 'Tomato Crop',
      commandSampleTa: '"தக்காளி பயிர்"',
      commandSampleEn: '"Tomato"',
      bg: 'linear-gradient(135deg, #9E2A2B 0%, #BA181B 100%)',
      border: '#E5383B'
    },
    {
      id: INTENTS.CROP_PADDY,
      emoji: '🌾',
      titleTa: 'நெல் பயிர்',
      titleEn: 'Paddy Crop',
      commandSampleTa: '"நெல் பயிர்"',
      commandSampleEn: '"Paddy"',
      bg: 'linear-gradient(135deg, #B08968 0%, #D4A373 100%)',
      border: '#FAEDCD'
    },
    {
      id: INTENTS.CROP_BANANA,
      emoji: '🍌',
      titleTa: 'வாழை',
      titleEn: 'Banana Crop',
      commandSampleTa: '"வாழை"',
      commandSampleEn: '"Banana"',
      bg: 'linear-gradient(135deg, #CA6702 0%, #EE9B00 100%)',
      border: '#E9D8A6'
    },
    {
      id: INTENTS.HISTORY,
      emoji: '📜',
      titleTa: 'பழைய வரலாறு',
      titleEn: 'Scan History',
      commandSampleTa: '"பழைய சோதனைகள்"',
      commandSampleEn: '"History"',
      bg: 'linear-gradient(135deg, #1D3557 0%, #457B9D 100%)',
      border: '#A8DADC'
    },
    {
      id: INTENTS.READ,
      emoji: '🔊',
      titleTa: 'படித்துக் காட்டு',
      titleEn: 'Read Aloud',
      commandSampleTa: '"படி" / "சொல்லு"',
      commandSampleEn: '"Read aloud"',
      bg: 'linear-gradient(135deg, #2B2D42 0%, #4A4E69 100%)',
      border: '#9A8C98'
    },
    {
      id: INTENTS.HOME,
      emoji: '🏠',
      titleTa: 'முகப்பு பக்கம்',
      titleEn: 'Home Screen',
      commandSampleTa: '"முகப்பு" / "ஹோம்"',
      commandSampleEn: '"Go home"',
      bg: 'linear-gradient(135deg, #606C38 0%, #283618 100%)',
      border: '#DDA15E'
    }
  ];

  // Map intents to friendly spoken confirmation and prominent titles
  const getIntentMetadata = (intent) => {
    switch (intent) {
      case INTENTS.LANG_TAMIL:
        return {
          icon: '🇮🇳',
          titleTa: 'பயன்பாட்டின் மொழி தமிழில் மாற்றப்படுகிறது...',
          titleEn: 'Switching language to Tamil...',
          spokenTa: 'பயன்பாட்டின் மொழி தமிழில் மாற்றப்பட்டது. வணக்கம் உழவரே!',
          spokenEn: 'Application language switched to Tamil.'
        };
      case INTENTS.LANG_ENGLISH:
        return {
          icon: '🇬🇧',
          titleTa: 'பயன்பாட்டின் மொழி ஆங்கிலத்தில் மாற்றப்படுகிறது...',
          titleEn: 'Switching language to English...',
          spokenTa: 'பயன்பாட்டின் மொழி ஆங்கிலத்தில் மாற்றப்பட்டது.',
          spokenEn: 'Language switched to English. Welcome farmer!'
        };
      case INTENTS.SCAN:
        return {
          icon: '📸',
          titleTa: 'இலை ஸ்கேனர் திறக்கப்படுகிறது...',
          titleEn: 'Opening Leaf Scanner Now...',
          spokenTa: 'சரி உழவரே! இலை ஸ்கேனர் திறக்கப்படுகிறது.',
          spokenEn: 'Sure! Opening leaf scanner now.'
        };
      case INTENTS.REMEDIES:
        return {
          icon: '🌿',
          titleTa: 'மருந்து தீர்வுகள் திறக்கப்படுகிறது...',
          titleEn: 'Opening Crop Remedies Now...',
          spokenTa: 'மருந்துகள் மற்றும் தீர்வுகள் பக்கம் திறக்கப்படுகிறது.',
          spokenEn: 'Opening crop remedies and treatments.'
        };
      case INTENTS.CROP_TOMATO:
        return {
          icon: '🍅',
          titleTa: 'தக்காளி பயிர் தேர்வு செய்யப்பட்டது...',
          titleEn: 'Tomato Crop Selected...',
          spokenTa: 'தக்காளி பயிர் தேர்ந்தெடுக்கப்பட்டது. இலை படம் எடுக்கவும்.',
          spokenEn: 'Tomato crop selected. Ready to scan leaf.'
        };
      case INTENTS.CROP_PADDY:
        return {
          icon: '🌾',
          titleTa: 'நெல் பயிர் தேர்வு செய்யப்பட்டது...',
          titleEn: 'Paddy Crop Selected...',
          spokenTa: 'நெல் பயிர் தேர்ந்தெடுக்கப்பட்டது. இலை படம் எடுக்கவும்.',
          spokenEn: 'Paddy crop selected. Ready to scan leaf.'
        };
      case INTENTS.CROP_BANANA:
        return {
          icon: '🍌',
          titleTa: 'வாழை பயிர் தேர்வு செய்யப்பட்டது...',
          titleEn: 'Banana Crop Selected...',
          spokenTa: 'வாழை பயிர் தேர்ந்தெடுக்கப்பட்டது. இலை படம் எடுக்கவும்.',
          spokenEn: 'Banana crop selected. Ready to scan leaf.'
        };
      case INTENTS.CROP_GROUNDNUT:
        return {
          icon: '🥜',
          titleTa: 'நிலக்கடலை பயிர் தேர்வு செய்யப்பட்டது...',
          titleEn: 'Groundnut Crop Selected...',
          spokenTa: 'நிலக்கடலை பயிர் தேர்ந்தெடுக்கப்பட்டது.',
          spokenEn: 'Groundnut crop selected.'
        };
      case INTENTS.CROP_CHILLI:
        return {
          icon: '🌶️',
          titleTa: 'மிளகாய் பயிர் தேர்வு செய்யப்பட்டது...',
          titleEn: 'Chilli Crop Selected...',
          spokenTa: 'மிளகாய் பயிர் தேர்ந்தெடுக்கப்பட்டது.',
          spokenEn: 'Chilli crop selected.'
        };
      case INTENTS.HISTORY:
        return {
          icon: '📜',
          titleTa: 'பழைய சோதனைகள் திறக்கப்படுகிறது...',
          titleEn: 'Opening Scan History...',
          spokenTa: 'முந்தைய இலை சோதனைகள் திறக்கப்படுகிறது.',
          spokenEn: 'Opening your previous scan records.'
        };
      case INTENTS.HOME:
        return {
          icon: '🏠',
          titleTa: 'முகப்புப் பக்கத்திற்கு செல்கிறோம்...',
          titleEn: 'Returning to Home Screen...',
          spokenTa: 'முகப்புப் பக்கத்திற்கு செல்கிறோம்.',
          spokenEn: 'Returning to home screen.'
        };
      case INTENTS.READ:
        return {
          icon: '🔊',
          titleTa: 'விவரங்களை படித்துக் காட்டுகிறோம்...',
          titleEn: 'Reading Advice Aloud...',
          spokenTa: 'விவரங்களை படித்துக் காட்டுகிறேன்.',
          spokenEn: 'Reading details aloud.'
        };
      default:
        return null;
    }
  };

  function triggerExecution(intent, textSpoken = '') {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    speechService.stopListening();
    setIsRecognizing(false);

    const spokenLang = speechService.detectLanguage(textSpoken || '');
    const targetLang = intent === INTENTS.LANG_TAMIL ? 'ta' : (intent === INTENTS.LANG_ENGLISH ? 'en' : spokenLang || lang);

    if (spokenLang === 'ta' && lang !== 'ta') {
      setLanguage('ta');
    }
    if (spokenLang === 'en' && lang !== 'en') {
      setLanguage('en');
    }

    const meta = getIntentMetadata(intent);
    if (meta) {
      setRecognizedAction(meta);
      const audioMsg = targetLang === 'ta' ? meta.spokenTa : meta.spokenEn;
      speechService.speak(audioMsg, targetLang);
    }

    timeoutRef.current = setTimeout(() => {
      executeIntent(intent, textSpoken);
    }, 750);
  }

  async function startListeningSession(targetLang = micLanguage) {
    if (isExecutingRef.current) return;
    stopSpeaking();
    setSpokenTranscript('');
    setRecognizedAction(null);
    setMicError(null);
    setStatusMessage(targetLang === 'ta' ? 'நான் கேட்கிறேன்... சொல்லுங்கள்!' : 'Listening... Speak now!');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (permissionError) {
      setMicError('Microphone permission is blocked. Please allow mic access for this site and tap the mic again.');
      setStatusMessage(targetLang === 'ta' ? 'மைக் அனுமதி மறுக்கப்பட்டது. அமைப்புகளில் மைக் அனுமதியை செயல்படுத்துங்கள்.' : 'Microphone permission was denied. Please enable mic access in the browser settings.');
      setIsRecognizing(false);
      return;
    }

    const started = speechService.startListening({
      lang: targetLang,
      onResult: (text, isFinal) => {
        setSpokenTranscript(text);
        const intent = speechService.parseIntent(text);
        if (intent !== INTENTS.UNKNOWN) {
          const spokenLang = speechService.detectLanguage(text);
          if (spokenLang === 'ta' && lang !== 'ta') setLanguage('ta');
          if (spokenLang === 'en' && lang !== 'en') setLanguage('en');
          triggerExecution(intent, text);
        }
      },
      onError: (err) => {
        console.warn('Speech error:', err);
        setMicError(err);
        setStatusMessage(targetLang === 'ta' ? 'மைக் கேட்கவில்லை. கீழே உள்ள பொத்தான்களை தொடவும்:' : 'Mic paused. Tap any picture button below:');
        setIsRecognizing(false);
      },
      onEnd: (lastText) => {
        setIsRecognizing(false);
        if (!isExecutingRef.current && lastText) {
          const intent = speechService.parseIntent(lastText);
          if (intent !== INTENTS.UNKNOWN) {
            triggerExecution(intent, lastText);
          }
        }
      }
    });

    setIsRecognizing(started);
  }

  useEffect(() => {
    if (isVoiceSheetOpen) {
      isExecutingRef.current = false;
      setRecognizedAction(null);
      // Start listening immediately on sheet open!
      startListeningSession(micLanguage);

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        speechService.stopListening();
        // Keep speaking response active so farmer hears confirmation
      };
    }
  }, [isVoiceSheetOpen, micLanguage]);

  // Keep micLanguage synced when app language changes
  useEffect(() => {
    setMicLanguage(lang === 'ta' ? 'ta' : 'en');
  }, [lang]);

  const handleToggleMic = () => {
    if (isRecognizing) {
      speechService.stopListening();
      setIsRecognizing(false);
      setStatusMessage(lang === 'ta' ? 'மைக் நிறுத்தப்பட்டது. பேச மீண்டும் தொடவும்.' : 'Mic paused. Tap to speak again.');
    } else {
      isExecutingRef.current = false;
      startListeningSession(micLanguage);
    }
  };

  // Test speaker functionality
  const handleTestSpeaker = () => {
    const testMsg = lang === 'ta'
      ? 'வணக்கம் உழவரே! ஸ்பீக்கர் சரியாக வேலை செய்கிறது. நீங்கள் "இலை ஸ்கேனரை திற" அல்லது "மருந்து காட்டு" என்று கட்டளையிடலாம்.'
      : 'Hello Farmer! Speaker is working properly. You can command "Open the scanner" or "Show remedies".';
    speakText(testMsg);
  };

  const handleLanguageSwitch = (newLang) => {
    setMicLanguage(newLang);
    setLanguage(newLang);
    isExecutingRef.current = false;
    startListeningSession(newLang);
  };

  if (!isVoiceSheetOpen) return null;

  return (
    <div className="voice-sheet-overlay" onClick={() => setIsVoiceSheetOpen(false)}>
      <div 
        className="farmer-voice-sheet-content" 
        onClick={e => e.stopPropagation()}
        style={{
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header Row */}
        <div style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--color-card-border)',
          paddingBottom: '12px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: isRecognizing ? 'rgba(45, 106, 79, 0.2)' : 'rgba(231, 111, 81, 0.2)',
              color: isRecognizing ? 'var(--color-primary-hover)' : 'var(--color-terracotta)'
            }}>
              <Headphones size={22} />
            </span>
            <div>
              <div style={{ 
                fontWeight: '900', 
                fontSize: 'calc(1.18rem * var(--font-scale))', 
                color: 'var(--color-text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{lang === 'ta' ? 'உழவர் வாய்ஸ் அசிஸ்டண்ட்' : 'Farmer Voice Assistant'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {micLanguage === 'ta' ? 'தமிழ் குரல் முறை (Tamil Active)' : 'English Voice Active'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Test Speaker Button */}
            <button
              className="icon-btn"
              style={{ 
                width: '42px', 
                height: '42px', 
                minHeight: '42px', 
                minWidth: '42px',
                backgroundColor: isSpeaking ? 'var(--color-primary-light)' : 'var(--color-surface-variant)' 
              }}
              onClick={handleTestSpeaker}
              title={isSpeaking ? "Speaking... Click to stop" : "Test Speaker Audio / குரல் கேட்க"}
            >
              {isSpeaking ? <VolumeX size={20} color="var(--color-terracotta)" /> : <Volume2 size={20} color="var(--color-primary)" />}
            </button>

            {/* Close Modal */}
            <button 
              className="icon-btn" 
              style={{ width: '42px', height: '42px', minHeight: '42px', minWidth: '42px' }}
              onClick={() => setIsVoiceSheetOpen(false)}
              aria-label="Close voice sheet"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Dual Language Switcher Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          margin: '4px 0 14px 0',
          width: '100%'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '700' }}>
            {lang === 'ta' ? 'பேசும் மொழி:' : 'Speech Mode:'}
          </span>
          <button
            onClick={() => handleLanguageSwitch('ta')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: micLanguage === 'ta' ? '2px solid var(--color-primary)' : '1px solid var(--color-card-border)',
              backgroundColor: micLanguage === 'ta' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: micLanguage === 'ta' ? '#FFFFFF' : 'var(--color-text-main)',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🇮🇳</span>
            <span>தமிழ் (Tamil)</span>
          </button>

          <button
            onClick={() => handleLanguageSwitch('en')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: micLanguage === 'en' ? '2px solid var(--color-primary)' : '1px solid var(--color-card-border)',
              backgroundColor: micLanguage === 'en' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: micLanguage === 'en' ? '#FFFFFF' : 'var(--color-text-main)',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
        </div>

        {/* PROMINENT RECOGNIZED RESULT BANNER (Appears immediately when user speaks command) */}
        {recognizedAction && (
          <div style={{
            width: '100%',
            backgroundColor: '#1B4332',
            border: '2.5px solid #52B788',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 8px 24px rgba(27, 67, 50, 0.4)',
            animation: 'fadeIn 0.25s ease-out',
            color: '#FFFFFF'
          }}>
            <span style={{ fontSize: '36px' }}>{recognizedAction.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '900', 
                fontSize: 'calc(1.2rem * var(--font-scale))',
                color: '#52B788'
              }}>
                {lang === 'ta' ? recognizedAction.titleTa : recognizedAction.titleEn}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#D8F3DC', opacity: 0.9 }}>
                {lang === 'ta' ? 'கட்டளை வெற்றிகரமாக நிறைவேற்றப்படுகிறது...' : 'Executing command successfully...'}
              </div>
            </div>
            <CheckCircle size={28} color="#52B788" />
          </div>
        )}

        {/* Giant Pulsing Microphone Hero Orb */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '4px 0 14px 0',
          position: 'relative',
          width: '100%'
        }}>
          <div className={`giant-mic-wrapper ${isRecognizing ? 'listening-active' : ''}`}>
            <button
              className={`giant-voice-mic-orb ${isRecognizing ? 'active-pulse' : ''} ${isSpeaking ? 'speaking-pulse' : ''}`}
              onClick={handleToggleMic}
              aria-label="Tap to speak"
              title="Tap to speak / பேச தொடவும்"
            >
              <Mic size={48} strokeWidth={2.5} color="#FFFFFF" />
            </button>
          </div>

          {/* Interactive State Prompt */}
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isRecognizing ? 'rgba(45, 106, 79, 0.16)' : 'var(--color-surface-variant)',
              border: isRecognizing ? '2px solid var(--color-primary)' : '1px solid var(--color-card-border)',
              color: isRecognizing ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
              fontWeight: '800',
              fontSize: 'calc(1.02rem * var(--font-scale))'
            }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isRecognizing ? '#2D6A4F' : isSpeaking ? '#CA6702' : 'var(--color-text-muted)',
                animation: isRecognizing ? 'gentlePulse 1s infinite' : 'none'
              }} />
              <span>
                {isRecognizing 
                  ? (micLanguage === 'ta' ? 'நான் கேட்கிறேன்... சொல்லுங்கள் உழவரே!' : 'Listening... Speak "open the scanner"')
                  : isSpeaking
                    ? (lang === 'ta' ? 'பதில் சொல்கிறேன்...' : 'Speaking confirmation...')
                    : (statusMessage || (lang === 'ta' ? 'மைக்-ஐ தொட்டுப் பேசவும்' : 'Tap microphone to speak'))
                }
              </span>
            </div>
          </div>

          {/* Audio Waveform Equalizer */}
          <div className="audio-waveform" style={{ marginTop: '10px' }}>
            <div className="waveform-bar" style={{ animationPlayState: (isRecognizing || isSpeaking) ? 'running' : 'paused', height: '24px' }} />
            <div className="waveform-bar" style={{ animationPlayState: (isRecognizing || isSpeaking) ? 'running' : 'paused', height: '38px' }} />
            <div className="waveform-bar" style={{ animationPlayState: (isRecognizing || isSpeaking) ? 'running' : 'paused', height: '30px' }} />
            <div className="waveform-bar" style={{ animationPlayState: (isRecognizing || isSpeaking) ? 'running' : 'paused', height: '48px' }} />
            <div className="waveform-bar" style={{ animationPlayState: (isRecognizing || isSpeaking) ? 'running' : 'paused', height: '32px' }} />
            <div className="waveform-bar" style={{ animationPlayState: (isRecognizing || isSpeaking) ? 'running' : 'paused', height: '40px' }} />
            <div className="waveform-bar" style={{ animationPlayState: (isRecognizing || isSpeaking) ? 'running' : 'paused', height: '22px' }} />
          </div>
        </div>

        {/* Live Spoken Transcript Bubble */}
        <div style={{
          width: '100%',
          minHeight: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '2px 0 14px 0'
        }}>
          {spokenTranscript ? (
            <div style={{
              width: '100%',
              padding: '12px 18px',
              backgroundColor: 'rgba(45, 106, 79, 0.12)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-primary-hover)', fontWeight: '700', display: 'block', marginBottom: '2px' }}>
                {lang === 'ta' ? 'நீங்கள் கூறியது:' : 'You said:'}
              </span>
              <span style={{
                fontSize: 'calc(1.3rem * var(--font-scale))',
                fontWeight: '900',
                color: 'var(--color-text-main)'
              }}>
                "{spokenTranscript}"
              </span>
            </div>
          ) : (
            <div style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: 'var(--color-surface)',
              border: '1.5px dashed var(--color-card-border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 'calc(0.9rem * var(--font-scale))'
            }}>
              🗣️ {micLanguage === 'ta' 
                ? 'இப்போது பேசலாம்: "தமிழ்", "ஸ்கேனரை திற", "மருந்து காட்டு", "தக்காளி"' 
                : 'Say clearly now: "Tamil", "Open the scanner", "Show remedies", "Tomato"'}
            </div>
          )}
        </div>

        {/* Illiterate-Friendly Action Tile Cards (Big, High-Contrast Pictograms) */}
        <div style={{ width: '100%', marginBottom: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <span style={{ 
              fontWeight: '800', 
              fontSize: 'calc(0.98rem * var(--font-scale))', 
              color: 'var(--color-text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>👆</span>
              <span>{lang === 'ta' ? 'நேரடியாக தொட்டும் கட்டளையிடலாம்:' : 'Or tap any command button directly:'}</span>
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(136px, 1fr))',
            gap: '10px',
            width: '100%'
          }}>
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => triggerExecution(action.id, action.titleEn)}
                className="farmer-action-tile"
                style={{
                  background: action.bg,
                  borderColor: action.border
                }}
              >
                <span className="tile-emoji">{action.emoji}</span>
                <span className="tile-title-ta">
                  {lang === 'ta' ? action.titleTa : action.titleEn}
                </span>
                <span className="tile-title-sub">
                  {lang === 'ta' ? action.commandSampleTa : action.commandSampleEn}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
