import React from 'react';
import { useApp } from '../context/AppContext';
import TopBar from '../widgets/TopBar';
import { Globe, Type, Sun, Moon, Volume2, HelpCircle, Check, Info } from 'lucide-react';

export default function SettingsScreen() {
  const { 
    lang, 
    setLanguage, 
    textSize, 
    setTextSize, 
    theme, 
    toggleTheme, 
    voiceSpeed, 
    setVoiceSpeed, 
    t, 
    goBack,
    speakText 
  } = useApp();

  const handleTestTamilVoice = () => {
    speakText('வணக்கம் உழவரே! லீஃப் ட்ரையஜ் பயன்பாட்டிற்கு உங்களை வரவேற்கிறோம். இது தமிழ் குரல் சோதனை.', () => {});
  };

  const handleTestEnglishVoice = () => {
    speakText('Hello Farmer! Welcome to LeafTriage crop assistant. This is an English voice test.', () => {});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
      <TopBar 
        title={t.settingsTitle} 
        showBack={true} 
        onBack={goBack} 
      />

      <div style={{ padding: '16px 0 32px 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Language Section: Explicit buttons for Tamil and English */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-card-border)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Globe size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 'calc(1.1rem * var(--font-scale))', fontWeight: '800' }}>
                {t.settingsLangSection}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                style={{
                  minHeight: '52px',
                  borderRadius: 'var(--radius-md)',
                  border: lang === 'ta' ? '2.5px solid var(--color-primary)' : '1px solid var(--color-card-border)',
                  backgroundColor: lang === 'ta' ? 'var(--color-primary-light)' : 'var(--color-surface-variant)',
                  color: lang === 'ta' ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
                  fontSize: 'calc(0.96rem * var(--font-scale))',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {lang === 'ta' && <Check size={18} strokeWidth={3} />}
                <span>🌾 தமிழ் (Tamil)</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                style={{
                  minHeight: '52px',
                  borderRadius: 'var(--radius-md)',
                  border: lang === 'en' ? '2.5px solid var(--color-primary)' : '1px solid var(--color-card-border)',
                  backgroundColor: lang === 'en' ? 'var(--color-primary-light)' : 'var(--color-surface-variant)',
                  color: lang === 'en' ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
                  fontSize: 'calc(0.96rem * var(--font-scale))',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {lang === 'en' && <Check size={18} strokeWidth={3} />}
                <span>🌐 English</span>
              </button>
            </div>
          </div>

          {/* Voice Speech Test Cards (Tamil & English) */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-card-border)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Volume2 size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 'calc(1.1rem * var(--font-scale))', fontWeight: '800' }}>
                {lang === 'ta' ? 'குரல் ஒலி சோதனை (Voice Test)' : 'Audio Voice Test'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-secondary"
                onClick={handleTestTamilVoice}
                style={{ minHeight: '48px', justifyContent: 'flex-start', padding: '10px 16px' }}
              >
                <Volume2 size={18} color="var(--color-primary)" />
                <span>🔊 தமிழ் குரல் சோதனை (Speak in Tamil)</span>
              </button>

              <button
                className="btn-secondary"
                onClick={handleTestEnglishVoice}
                style={{ minHeight: '48px', justifyContent: 'flex-start', padding: '10px 16px' }}
              >
                <Volume2 size={18} color="var(--color-primary)" />
                <span>🔊 Test English Voice (Speak in English)</span>
              </button>
            </div>
          </div>

          {/* Text Size Section (Large / Extra Large for Farmers) */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-card-border)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Type size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 'calc(1.1rem * var(--font-scale))', fontWeight: '800' }}>
                {t.settingsTextSizeSection}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'normal', label: t.textSizeNormal, sizeDemo: '16px' },
                { id: 'large', label: t.textSizeLarge, sizeDemo: '18px' },
                { id: 'extra-large', label: t.textSizeExtraLarge, sizeDemo: '21px' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setTextSize(item.id)}
                  style={{
                    minHeight: '56px',
                    borderRadius: 'var(--radius-md)',
                    border: textSize === item.id ? '2px solid var(--color-primary)' : '1px solid var(--color-card-border)',
                    backgroundColor: textSize === item.id ? 'var(--color-primary-light)' : 'var(--color-surface-variant)',
                    color: textSize === item.id ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px'
                  }}
                >
                  <span style={{ fontSize: item.sizeDemo, fontWeight: '800' }}>அ</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Section (Dark mode / Light mode) */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-card-border)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              {theme === 'dark' ? <Moon size={20} color="var(--color-primary)" /> : <Sun size={20} color="var(--color-primary)" />}
              <h3 style={{ fontSize: 'calc(1.1rem * var(--font-scale))', fontWeight: '800' }}>
                {t.settingsThemeSection}
              </h3>
            </div>

            <button
              className="btn-secondary"
              onClick={toggleTheme}
              style={{ justifyContent: 'space-between', padding: '14px 18px', minHeight: '52px' }}
            >
              <span>{theme === 'dark' ? t.themeDark : t.themeLight}</span>
              <div style={{
                width: '46px',
                height: '26px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-card-border)',
                position: 'relative',
                transition: 'background-color 0.2s'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  top: '3px',
                  left: theme === 'dark' ? '23px' : '3px',
                  transition: 'left 0.2s'
                }} />
              </div>
            </button>
          </div>

          {/* Voice Speed Section */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-card-border)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Volume2 size={20} color="var(--color-primary)" />
              <h3 style={{ fontSize: 'calc(1.1rem * var(--font-scale))', fontWeight: '800' }}>
                {t.settingsVoiceSpeedSection}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { speed: 0.82, label: t.speedSlow },
                { speed: 0.98, label: t.speedNormal },
                { speed: 1.15, label: t.speedFast }
              ].map(item => (
                <button
                  key={item.speed}
                  onClick={() => {
                    setVoiceSpeed(item.speed);
                    speakText(lang === 'ta' ? 'குரல் வேகம் மாற்றப்பட்டது.' : 'Voice rate adjusted.');
                  }}
                  style={{
                    minHeight: '52px',
                    borderRadius: 'var(--radius-md)',
                    border: voiceSpeed === item.speed ? '2px solid var(--color-primary)' : '1px solid var(--color-card-border)',
                    backgroundColor: voiceSpeed === item.speed ? 'var(--color-primary-light)' : 'var(--color-surface-variant)',
                    color: voiceSpeed === item.speed ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
                    fontSize: 'calc(0.88rem * var(--font-scale))',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Offline Tamil Voice Installation Guide */}
          <div style={{
            backgroundColor: 'var(--color-surface-variant)',
            borderRadius: 'var(--radius-lg)',
            border: '1.5px solid var(--color-card-border)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={22} color="var(--color-primary)" />
              <h4 style={{
                fontSize: 'calc(1.0rem * var(--font-scale))',
                fontWeight: '800',
                color: 'var(--color-primary-hover)'
              }}>
                {t.offlineVoiceGuideTitle}
              </h4>
            </div>

            <p style={{ fontSize: 'calc(0.85rem * var(--font-scale))', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
              {t.offlineVoiceGuideStep1}
            </p>
            <p style={{ fontSize: 'calc(0.85rem * var(--font-scale))', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
              {t.offlineVoiceGuideStep2}
            </p>
            <p style={{ fontSize: 'calc(0.85rem * var(--font-scale))', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
              {t.offlineVoiceGuideStep3}
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 'calc(0.82rem * var(--font-scale))', marginTop: '28px' }}>
          {t.appVersion}
        </div>
      </div>
    </div>
  );
}
