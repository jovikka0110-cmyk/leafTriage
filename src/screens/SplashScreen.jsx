import React from 'react';
import { useApp } from '../context/AppContext';
import { Check } from 'lucide-react';

export default function SplashScreen() {
  const { lang, setLanguage, completeSplash, t } = useApp();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '100%',
      padding: '40px 24px 30px 24px',
      textAlign: 'center',
      backgroundColor: 'var(--color-bg)'
    }}>
      {/* Soft Logo & Brand Animation */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: '108px',
          height: '108px',
          borderRadius: '34px',
          background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-subtle) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '20px',
          border: '2px solid rgba(111, 166, 125, 0.3)',
          animation: 'gentlePulse 3s infinite ease-in-out'
        }}>
          <svg width="68" height="68" viewBox="0 0 100 100" fill="none">
            <path
              d="M50 10 C68 28 85 48 78 72 C72 88 56 92 50 90 C44 92 28 88 22 72 C15 48 32 28 50 10 Z"
              fill="var(--color-primary)"
            />
            <path
              d="M50 18 Q50 50 50 88"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M50 42 Q64 36 72 44"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.75"
            />
            <path
              d="M50 56 Q36 50 28 58"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.75"
            />
          </svg>
        </div>

        <h1 style={{
          fontSize: 'calc(1.8rem * var(--font-scale))',
          fontWeight: '800',
          color: 'var(--color-primary-hover)',
          letterSpacing: '-0.5px',
          marginBottom: '6px'
        }}>
          LeafTriage
        </h1>

        <p style={{
          fontSize: 'calc(1.05rem * var(--font-scale))',
          color: 'var(--color-text-muted)',
          fontWeight: '600',
          maxWidth: '300px'
        }}>
          {t.splashSubtitle}
        </p>
      </div>

      {/* Language Selection: Two Large Farmer-Friendly Cards */}
      <div style={{ width: '100%', margin: '24px 0' }}>
        <p style={{
          fontSize: 'calc(0.95rem * var(--font-scale))',
          fontWeight: '700',
          color: 'var(--color-text-muted)',
          marginBottom: '16px'
        }}>
          {t.chooseLanguage}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Tamil Card */}
          <div
            onClick={() => setLanguage('ta')}
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: lang === 'ta' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              border: `2.5px solid ${lang === 'ta' ? 'var(--color-primary)' : 'var(--color-card-border)'}`,
              boxShadow: lang === 'ta' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                fontSize: 'calc(1.3rem * var(--font-scale))',
                fontWeight: '800',
                color: lang === 'ta' ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
                marginBottom: '2px'
              }}>
                🌾 தமிழ் (Tamil)
              </h3>
              <p style={{
                fontSize: 'calc(0.85rem * var(--font-scale))',
                color: 'var(--color-text-muted)'
              }}>
                இயல்பான தமிழ் வடிவம்
              </p>
            </div>
            {lang === 'ta' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check size={20} strokeWidth={3} />
              </div>
            )}
          </div>

          {/* English Card */}
          <div
            onClick={() => setLanguage('en')}
            style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: lang === 'en' ? 'var(--color-primary-light)' : 'var(--color-surface)',
              border: `2.5px solid ${lang === 'en' ? 'var(--color-primary)' : 'var(--color-card-border)'}`,
              boxShadow: lang === 'en' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                fontSize: 'calc(1.2rem * var(--font-scale))',
                fontWeight: '800',
                color: lang === 'en' ? 'var(--color-primary-hover)' : 'var(--color-text-main)',
                marginBottom: '2px'
              }}>
                🌐 English
              </h3>
              <p style={{
                fontSize: 'calc(0.85rem * var(--font-scale))',
                color: 'var(--color-text-muted)'
              }}>
                Simple & clear language
              </p>
            </div>
            {lang === 'en' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check size={20} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div style={{ width: '100%' }}>
        <button
          className="btn-primary"
          onClick={() => completeSplash(lang)}
        >
          {t.continueBtn}
        </button>
        <p style={{
          marginTop: '12px',
          fontSize: 'calc(0.78rem * var(--font-scale))',
          color: 'var(--color-text-subtle)'
        }}>
          {t.appVersion}
        </p>
      </div>
    </div>
  );
}
