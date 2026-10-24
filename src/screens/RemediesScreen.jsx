import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TopBar from '../widgets/TopBar';
import SafetyCard from '../widgets/SafetyCard';
import diseasesData from '../data/diseases.json';
import { Leaf, FlaskConical, Volume2, VolumeX, AlertCircle, Clock, Droplets, CheckCircle2 } from 'lucide-react';

export default function RemediesScreen() {
  const { 
    lang, 
    t, 
    screenParams, 
    goBack, 
    speakText, 
    stopSpeaking, 
    isSpeaking 
  } = useApp();

  const [activeTab, setActiveTab] = useState('traditional'); // 'traditional' | 'fertilizer'
  const disease = screenParams?.disease || diseasesData[0];

  const traditionalList = disease?.traditional_remedies || [];
  const fertilizerList = disease?.fertilizer_remedies || [];

  const handleListenAllRemedies = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    let speechText = '';
    if (activeTab === 'traditional') {
      speechText = lang === 'ta'
        ? `பாரம்பரிய இயற்கை தீர்வுகள்: ` +
          traditionalList.map((r, i) => `${i + 1}. ${r.title.ta}. அளவு: ${r.quantity.ta}. முறை: ${r.steps.ta}`).join('. ')
        : `Traditional remedies: ` +
          traditionalList.map((r, i) => `${i + 1}. ${r.title.en}. Quantity: ${r.quantity.en}. Steps: ${r.steps.en}`).join('. ');
    } else {
      speechText = lang === 'ta'
        ? `உரம் மற்றும் ரசாயன தீர்வுகள்: ` +
          fertilizerList.map((r, i) => `${i + 1}. மருந்து: ${r.name.ta}. அளவு: ${r.dose.ta}. பயன்படுத்தும் முறை: ${r.how_to_apply.ta}`).join('. ') +
          `. ${t.officerDisclaimer}`
        : `Fertilizer and chemical remedies: ` +
          fertilizerList.map((r, i) => `${i + 1}. Product: ${r.name.en}. Dosage: ${r.dose.en}. Application: ${r.how_to_apply.en}`).join('. ') +
          `. ${t.officerDisclaimer}`;
    }

    speakText(speechText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
      <TopBar 
        title={lang === 'ta' ? disease.names.ta : disease.names.en} 
        showBack={true} 
      />

      {/* Disease Summary Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--color-card-border)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>{disease.icon}</span>
          <div>
            <h3 style={{ fontSize: 'calc(1.2rem * var(--font-scale))', fontWeight: '800', color: 'var(--color-primary-hover)' }}>
              {lang === 'ta' ? disease.names.ta : disease.names.en}
            </h3>
            <p style={{ fontSize: 'calc(0.88rem * var(--font-scale))', color: 'var(--color-text-muted)' }}>
              {lang === 'ta' ? disease.crop_ta : disease.crop}
            </p>
          </div>
        </div>

        {/* Read All Button */}
        <button
          className="icon-btn"
          style={{
            backgroundColor: isSpeaking ? 'var(--color-primary-light)' : 'var(--color-surface-variant)',
            color: 'var(--color-primary)'
          }}
          onClick={handleListenAllRemedies}
          title={isSpeaking ? t.stopAudioBtn : t.readRemediesBtn}
        >
          {isSpeaking ? <VolumeX size={20} color="var(--color-terracotta)" /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Two Tabs: Traditional (Leaf) & Fertilizer (Flask/Bottle) */}
      <div className="remedies-tab-group" style={{ margin: '0 0 16px 0' }}>
        <button
          className={`remedy-tab-btn ${activeTab === 'traditional' ? 'active' : ''}`}
          onClick={() => setActiveTab('traditional')}
        >
          <Leaf size={18} color="var(--color-primary)" />
          <span>{t.traditionalTab}</span>
        </button>

        <button
          className={`remedy-tab-btn ${activeTab === 'fertilizer' ? 'active' : ''}`}
          onClick={() => setActiveTab('fertilizer')}
        >
          <FlaskConical size={18} color="var(--color-terracotta)" />
          <span>{t.fertilizerTab}</span>
        </button>
      </div>

      {/* Tab 1 Content: Traditional Remedies */}
      {activeTab === 'traditional' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="remedies-desktop-grid">
            {traditionalList.map((remedy, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-card-border)',
                  padding: '20px 22px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800'
                  }}>
                    {idx + 1}
                  </div>
                  <h4 style={{
                    fontSize: 'calc(1.15rem * var(--font-scale))',
                    fontWeight: '800',
                    color: 'var(--color-primary-hover)'
                  }}>
                    {lang === 'ta' ? remedy.title.ta : remedy.title.en}
                  </h4>
                </div>

                {/* Quantity */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'calc(0.88rem * var(--font-scale))'
                }}>
                  <Droplets size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)' }}>{t.quantityLabel}: </strong>
                    <span>{lang === 'ta' ? remedy.quantity.ta : remedy.quantity.en}</span>
                  </div>
                </div>

                {/* Frequency */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'calc(0.88rem * var(--font-scale))'
                }}>
                  <Clock size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)' }}>{t.frequencyLabel}: </strong>
                    <span>{lang === 'ta' ? remedy.frequency.ta : remedy.frequency.en}</span>
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <strong style={{
                    display: 'block',
                    fontSize: 'calc(0.88rem * var(--font-scale))',
                    color: 'var(--color-text-muted)',
                    marginBottom: '4px'
                  }}>
                    {t.stepsLabel}:
                  </strong>
                  <p style={{
                    fontSize: 'calc(0.92rem * var(--font-scale))',
                    color: 'var(--color-text-main)',
                    lineHeight: 1.55
                  }}>
                    {lang === 'ta' ? remedy.steps.ta : remedy.steps.en}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Prevention Note Card */}
          {disease.prevention && (
            <div style={{
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-primary-subtle)',
              padding: '16px 20px',
              fontSize: 'calc(0.9rem * var(--font-scale))',
              lineHeight: 1.55
            }}>
              <strong style={{ color: 'var(--color-primary-hover)', display: 'block', marginBottom: '4px' }}>
                🛡️ தடுப்பு முறைகள் / Prevention:
              </strong>
              <span>{lang === 'ta' ? disease.prevention.ta : disease.prevention.en}</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Fertilizer & Chemical Remedies */}
      {activeTab === 'fertilizer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Safety Card */}
          <SafetyCard />

          <div className="remedies-desktop-grid">
            {fertilizerList.map((chem, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-card-border)',
                  padding: '20px 22px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-terracotta-light)',
                    color: 'var(--color-terracotta)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800'
                  }}>
                    {idx + 1}
                  </div>
                  <h4 style={{
                    fontSize: 'calc(1.1rem * var(--font-scale))',
                    fontWeight: '800',
                    color: 'var(--color-terracotta)'
                  }}>
                    {lang === 'ta' ? chem.name.ta : chem.name.en}
                  </h4>
                </div>

                {/* Dose */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface-variant)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'calc(0.88rem * var(--font-scale))'
                }}>
                  <Droplets size={18} color="var(--color-terracotta)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: 'var(--color-text-muted)' }}>{t.quantityLabel}: </strong>
                    <span>{lang === 'ta' ? chem.dose.ta : chem.dose.en}</span>
                  </div>
                </div>

                {/* Application Steps */}
                <div>
                  <strong style={{
                    display: 'block',
                    fontSize: 'calc(0.88rem * var(--font-scale))',
                    color: 'var(--color-text-muted)',
                    marginBottom: '4px'
                  }}>
                    {t.stepsLabel}:
                  </strong>
                  <p style={{
                    fontSize: 'calc(0.92rem * var(--font-scale))',
                    color: 'var(--color-text-main)',
                    lineHeight: 1.55
                  }}>
                    {lang === 'ta' ? chem.how_to_apply.ta : chem.how_to_apply.en}
                  </p>
                </div>

                {/* Safety Warning */}
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-terracotta-light)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'calc(0.82rem * var(--font-scale))',
                  color: 'var(--color-terracotta)'
                }}>
                  <strong>⚠️ {t.safetyCardTitle}: </strong>
                  <span>{lang === 'ta' ? chem.safety.ta : chem.safety.en}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Read Aloud Action Button */}
      <div style={{
        padding: '16px 0 24px 0',
        marginTop: 'auto'
      }}>
        <button
          className="btn-primary"
          onClick={handleListenAllRemedies}
        >
          {isSpeaking ? (
            <>
              <VolumeX size={22} />
              <span>{t.stopAudioBtn}</span>
            </>
          ) : (
            <>
              <Volume2 size={22} />
              <span>{t.readRemediesBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
