import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import TopBar from '../widgets/TopBar';
import ConfidenceMeter from '../widgets/ConfidenceMeter';
import { Volume2, VolumeX, ArrowRight, RotateCcw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function ResultScreen() {
  const { 
    lang, 
    t, 
    screenParams = {}, 
    navigateTo, 
    goBack, 
    speakText, 
    stopSpeaking, 
    isSpeaking,
    addScan
  } = useApp();

  const { isLowConfidence, confidence = 90, disease, photoUrl } = screenParams || {};

  // Auto-record to scan history if confidence >= 60% and disease is identified
  useEffect(() => {
    if (!isLowConfidence && disease && confidence >= 60) {
      addScan({
        diseaseId: disease.id,
        diseaseNameEn: disease.names?.en || 'Unknown Disease',
        diseaseNameTa: disease.names?.ta || 'அறியப்படாத நோய்',
        cropEn: disease.crop || 'Crop',
        cropTa: disease.crop_ta || 'பயிர்',
        icon: disease.icon || '🌿',
        confidence: confidence
      });
    }
  }, [disease?.id]);

  const handleListenResult = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (isLowConfidence) {
      const speech = `${t.lowConfidenceAlertTitle}. ${t.lowConfidenceAlertDesc}`;
      speakText(speech);
      return;
    }

    if (disease) {
      const cropName = lang === 'ta' ? (disease.crop_ta || disease.crop) : disease.crop;
      const diseaseName = lang === 'ta' ? (disease.names?.ta || disease.names?.en) : (disease.names?.en || disease.names?.ta);
      const symptoms = lang === 'ta' ? (disease.symptoms?.ta || disease.symptoms?.en) : (disease.symptoms?.en || disease.symptoms?.ta);
      const speech = lang === 'ta'
        ? `பயிர்: ${cropName}. கண்டறியப்பட்ட நோய்: ${diseaseName}. பொருத்த அளவு: ${confidence} சதவீதம். அறிகுறிகள்: ${symptoms}`
        : `Crop: ${cropName}. Diagnosed disease: ${diseaseName}. Match confidence: ${confidence} percent. Symptoms: ${symptoms}`;
      speakText(speech);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
      <TopBar 
        title={t.resultTitle} 
        showBack={true} 
        onBack={() => navigateTo('dashboard')} 
      />

      <div style={{ padding: '16px 0 24px 0' }}>
        <div className="result-desktop-grid">
          {/* Left Column: Leaf Photo & Confidence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '260px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: '#1E2821',
              boxShadow: 'var(--shadow-md)',
              border: '2px solid var(--color-card-border)'
            }}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Analyzed crop leaf"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '54px'
                }}>
                  {disease?.icon || '🌿'}
                </div>
              )}

              {/* Crop Badge Overlay */}
              {!isLowConfidence && disease && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span>{disease.icon}</span>
                  <span style={{ fontWeight: '700', fontSize: 'calc(0.85rem * var(--font-scale))', color: '#212C24' }}>
                    {lang === 'ta' ? disease.crop_ta : disease.crop}
                  </span>
                </div>
              )}
            </div>

            {/* Confidence Meter */}
            <ConfidenceMeter percentage={confidence || 50} />
          </div>

          {/* Right Column: Diagnosis Details or Low Confidence Alert */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {isLowConfidence ? (
              <div style={{
                padding: '24px',
                backgroundColor: 'var(--color-terracotta-light)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid rgba(200, 109, 74, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={32} color="var(--color-terracotta)" style={{ flexShrink: 0 }} />
                  <h3 style={{
                    fontSize: 'calc(1.2rem * var(--font-scale))',
                    fontWeight: '800',
                    color: 'var(--color-terracotta)'
                  }}>
                    {t.lowConfidenceAlertTitle}
                  </h3>
                </div>

                <p style={{
                  fontSize: 'calc(0.95rem * var(--font-scale))',
                  color: 'var(--color-text-main)',
                  lineHeight: 1.55
                }}>
                  {t.lowConfidenceAlertDesc}
                </p>

                <button
                  className="btn-primary"
                  style={{
                    backgroundColor: 'var(--color-terracotta)',
                    background: 'linear-gradient(135deg, var(--color-terracotta) 0%, #B85F3B 100%)',
                    marginTop: '8px'
                  }}
                  onClick={() => navigateTo('camera')}
                >
                  <RotateCcw size={20} />
                  <span>{t.retakeBtn}</span>
                </button>
              </div>
            ) : (
              <>
                {/* Disease Title Card */}
                <div style={{
                  padding: '20px 22px',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-card-border)',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <h2 style={{
                    fontSize: 'calc(1.5rem * var(--font-scale))',
                    fontWeight: '800',
                    color: 'var(--color-primary-hover)',
                    marginBottom: '4px'
                  }}>
                    {lang === 'ta' ? (disease?.names?.ta || disease?.names?.en) : (disease?.names?.en || disease?.names?.ta)}
                  </h2>

                  <p style={{
                    fontSize: 'calc(1.0rem * var(--font-scale))',
                    fontWeight: '600',
                    color: 'var(--color-text-muted)'
                  }}>
                    {lang === 'ta' ? (disease?.names?.en || disease?.names?.ta) : (disease?.names?.ta || disease?.names?.en)}
                  </p>
                </div>

                {/* Plain Explanation of Symptoms */}
                <div style={{
                  padding: '18px 20px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-card-border)',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <Info size={22} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ 
                      display: 'block', 
                      fontSize: 'calc(0.88rem * var(--font-scale))', 
                      color: 'var(--color-text-muted)',
                      marginBottom: '4px'
                    }}>
                      {t.symptomsTitle}:
                    </strong>
                    <p style={{
                      fontSize: 'calc(0.95rem * var(--font-scale))',
                      color: 'var(--color-text-main)',
                      lineHeight: 1.55
                    }}>
                      {lang === 'ta' ? (disease?.symptoms?.ta || disease?.symptoms?.en) : (disease?.symptoms?.en || disease?.symptoms?.ta)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: View Remedies & Listen */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => navigateTo('remedies', { disease })}
                  >
                    <span>🌿 {t.viewRemediesBtn}</span>
                    <ArrowRight size={20} />
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      className="btn-secondary"
                      onClick={handleListenResult}
                      style={{
                        backgroundColor: isSpeaking ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        borderColor: isSpeaking ? 'var(--color-primary)' : 'var(--color-card-border)'
                      }}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX size={20} color="var(--color-primary)" />
                          <span>{t.stopAudioBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={20} color="var(--color-primary)" />
                          <span>{t.listenResultBtn}</span>
                        </>
                      )}
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => navigateTo('camera')}
                    >
                      <RotateCcw size={18} />
                      <span>{t.retakeBtn}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
