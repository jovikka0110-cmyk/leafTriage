import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClassifierService } from '../services/classifier';

export default function AnalysingScreen() {
  const { lang, t, screenParams, navigateTo } = useApp();
  const [stepText, setStepText] = useState(t.analysingStep1);

  useEffect(() => {
    let timer1 = setTimeout(() => {
      setStepText(t.analysingStep2);
    }, 800);

    let timer2 = setTimeout(() => {
      setStepText(t.analysingStep3);
    }, 1500);

    async function runInference() {
      const result = await ClassifierService.analyzeLeaf(
        screenParams?.photoUrl,
        screenParams?.presetSampleId,
        screenParams?.crop
      );

      // Transition to Result Screen
      navigateTo('result', {
        ...result,
        photoUrl: result?.photoUrl || screenParams?.photoUrl || ''
      });
    }

    runInference();

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      padding: '30px 24px',
      backgroundColor: 'var(--color-bg)',
      textAlign: 'center'
    }}>
      {/* Captured Photo Container with Scanning Beam */}
      <div style={{
        position: 'relative',
        width: '260px',
        height: '320px',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '3px solid var(--color-primary-subtle)',
        marginBottom: '28px',
        backgroundColor: '#1B261E'
      }}>
        {/* Leaf Photo */}
        {screenParams?.photoUrl ? (
          <img
            src={screenParams.photoUrl}
            alt="Scanning leaf"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px'
          }}>
            🌿
          </div>
        )}

        {/* Soft Organic Laser Scan Beam */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, transparent 0%, #82BD92 50%, transparent 100%)',
          boxShadow: '0 0 16px 4px rgba(130, 189, 146, 0.75)',
          animation: 'scanLaser 2.2s infinite ease-in-out',
          zIndex: 10
        }} />

        <style>{`
          @keyframes scanLaser {
            0% { top: 6%; opacity: 0.3; }
            50% { top: 90%; opacity: 1; }
            100% { top: 6%; opacity: 0.3; }
          }
        `}</style>
      </div>

      {/* Gentle Calming Status Text */}
      <h2 style={{
        fontSize: 'calc(1.35rem * var(--font-scale))',
        fontWeight: '800',
        color: 'var(--color-text-main)',
        marginBottom: '8px'
      }}>
        {t.analysingTitle}
      </h2>

      <p style={{
        fontSize: 'calc(0.92rem * var(--font-scale))',
        color: 'var(--color-primary)',
        fontWeight: '600',
        minHeight: '26px',
        marginBottom: '16px'
      }}>
        {stepText}
      </p>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-primary-light)',
        color: 'var(--color-text-muted)',
        fontSize: 'calc(0.78rem * var(--font-scale))'
      }}>
        <span>📱 {t.analysingSub}</span>
      </div>
    </div>
  );
}
