import React from 'react';
import { useApp } from '../context/AppContext';
import { Settings, ArrowLeft, Volume2, VolumeX } from 'lucide-react';

export default function TopBar({ title, showBack = false, onBack }) {
  const { 
    lang, 
    setLanguage, 
    navigateTo, 
    goBack, 
    t, 
    isSpeaking, 
    stopSpeaking, 
    speakText 
  } = useApp();

  const handleTestSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const msg = lang === 'ta'
        ? 'வணக்கம் உழவரே! நான் உங்கள் பயிர் உதவியாளர்.'
        : 'Hello Farmer! I am your crop doctor assistant.';
      speakText(msg);
    }
  };

  return (
    <div className={`page-top-bar ${showBack ? 'has-back-button' : 'home-top-bar'}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {showBack && (
          <button 
            type="button"
            className="icon-btn back-btn" 
            onClick={onBack || goBack} 
            aria-label="Go back"
            title={lang === 'ta' ? 'பின்னே செல்ல' : 'Go back'}
          >
            <ArrowLeft size={22} />
          </button>
        )}

        <div className="greeting-text-group">
          {title ? (
            <h2 className="top-bar-title">{title}</h2>
          ) : (
            <>
              <h2>{t.greeting}</h2>
              <p>{t.greetingSub}</p>
            </>
          )}
        </div>
      </div>

      <div className="top-bar-actions">
        {/* Stable Language Toggle Pill:
            Clicking 'த' explicitly keeps language in Tamil.
            Clicking 'A' explicitly sets language to English.
            Never toggles automatically or unexpectedly! */}
        <div 
          className="lang-toggle-pill"
          role="group"
          aria-label="Language selection"
        >
          <button 
            type="button"
            className={`lang-pill-item ${lang === 'ta' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setLanguage('ta');
            }}
            title="தமிழ் (Tamil)"
          >
            த
          </button>
          <button 
            type="button"
            className={`lang-pill-item ${lang === 'en' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setLanguage('en');
            }}
            title="English"
          >
            A
          </button>
        </div>

        {/* Quick Audio Test Button */}
        <button
          type="button"
          className="icon-btn"
          onClick={handleTestSpeech}
          style={{ 
            backgroundColor: isSpeaking ? 'var(--color-primary-light)' : 'var(--color-surface)',
            color: isSpeaking ? 'var(--color-primary-hover)' : 'var(--color-text-main)'
          }}
          title={isSpeaking ? "Stop Voice / குரலை நிறுத்து" : "Listen Voice / குரல் கேட்க"}
          aria-label="Audio voice test"
        >
          {isSpeaking ? <VolumeX size={20} color="var(--color-terracotta)" /> : <Volume2 size={20} />}
        </button>

        {/* Settings button */}
        <button 
          type="button"
          className="icon-btn" 
          onClick={() => navigateTo('settings')}
          aria-label="Settings"
          title="Settings / அமைப்புகள்"
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}
