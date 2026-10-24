import React from 'react';
import { useApp } from '../context/AppContext';
import TopBar from '../widgets/TopBar';
import diseasesData from '../data/diseases.json';
import { Camera, Image, ChevronRight, Mic, Sparkles, Headphones } from 'lucide-react';
import { INTENTS } from '../services/speech';

export default function DashboardScreen() {
  const { 
    lang, 
    t, 
    navigateTo, 
    historyList, 
    setIsVoiceSheetOpen, 
    executeIntent,
    speakText 
  } = useApp();

  // Extract unique crops from diseases dataset
  const uniqueCrops = [
    { crop: 'Paddy', crop_ta: 'நெல்', icon: '🌾', count: 3, id: 'paddy_blast' },
    { crop: 'Tomato', crop_ta: 'தக்காளி', icon: '🍅', count: 2, id: 'tomato_early_blight' },
    { crop: 'Banana', crop_ta: 'வாழை', icon: '🍌', count: 2, id: 'banana_sigatoka' },
    { crop: 'Groundnut', crop_ta: 'நிலக்கடலை', icon: '🥜', count: 2, id: 'groundnut_tikka' },
    { crop: 'Chilli', crop_ta: 'மிளகாய்', icon: '🌶️', count: 2, id: 'chilli_anthracnose' }
  ];

  const recentScans = (historyList || []).slice(0, 3);

  const handleScanClick = () => {
    navigateTo('camera');
  };

  const handleGalleryClick = () => {
    navigateTo('camera', { openGallery: true });
  };

  const handleCropCardClick = (cropItem) => {
    navigateTo('library', { selectedCrop: cropItem.crop });
  };

  const handleRecentScanClick = (scan) => {
    const fullDisease = diseasesData.find(d => d.id === scan.diseaseId) || diseasesData[0];
    navigateTo('result', {
      disease: fullDisease,
      confidence: scan.confidence || 90,
      photoUrl: null
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Mobile Top Bar with greeting & language pill */}
      <TopBar />

      {/* Hero Card: Big Friendly Camera Button (Adapts to desktop banner & mobile card) */}
      <div className="hero-scan-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '520px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary-hover)',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 'calc(0.78rem * var(--font-scale))',
            fontWeight: '700',
            marginBottom: '10px'
          }}>
            <Sparkles size={14} />
            <span>LeafTriage</span>
          </div>

          <h3 className="hero-scan-title" style={{ fontSize: 'calc(1.5rem * var(--font-scale))' }}>
            {t.heroScanTitle}
          </h3>
          <p className="hero-scan-subtitle" style={{ fontSize: 'calc(1.0rem * var(--font-scale))', marginBottom: '20px' }}>
            {t.heroScanSub}
          </p>

          <button
            className="gallery-shortcut-btn"
            onClick={handleGalleryClick}
          >
            <Image size={18} />
            <span>{t.pickGallery}</span>
          </button>
        </div>

        <button
          className="camera-pulse-btn"
          onClick={handleScanClick}
          aria-label="Scan Crop Leaf"
          title="Scan your leaf / பயிரை ஸ்கேன் செய்க"
        >
          <Camera size={48} strokeWidth={2.2} />
        </button>
      </div>

      {/* Grand Farmer Voice Doctor Card (Big, Beautiful & Ultra-Visible for Rural Farmers) */}
      <div className="farmer-voice-hero-card">
        <div className="farmer-voice-hero-left">
          <div className="voice-badge-pill">
            <Headphones size={15} />
            <span>{lang === 'ta' ? 'உழவர் வாய்ஸ் அசிஸ்டண்ட் • பேசி கட்டளையிடுங்கள்' : 'Farmer Voice Assistant • Speak & Command'}</span>
          </div>

          <h3 className="farmer-voice-title">
            {lang === 'ta' ? '🎤 வாய்ஸ் மருத்துவர்' : '🎤 Voice Crop Doctor'}
          </h3>

          <p className="farmer-voice-subtitle">
            {lang === 'ta'
              ? 'எழுத்து படிக்கத் தேவையில்லை! மைக்-ஐ தொட்டு "இலை ஸ்கேனருக்கு போ", "மருந்து காட்டு", "தக்காளி", "நெல்" என்று பேசினால் உடனே செயல்படும்.'
              : 'Designed for village farmers! Just tap the mic and say "Go to scanner", "Show remedies", "Tomato", or "Paddy".'}
          </p>

          {/* Quick Voice Trigger Pills */}
          <div className="voice-shortcut-pills">
            <button
              className="voice-pill-chip"
              onClick={() => executeIntent(INTENTS.SCAN)}
            >
              <span>📸</span>
              <span>{lang === 'ta' ? 'இலை ஸ்கேனர்' : 'Go to Scanner'}</span>
            </button>

            <button
              className="voice-pill-chip"
              onClick={() => executeIntent(INTENTS.REMEDIES)}
            >
              <span>🌿</span>
              <span>{lang === 'ta' ? 'மருந்து தீர்வுகள்' : 'Remedies'}</span>
            </button>

            <button
              className="voice-pill-chip"
              onClick={() => executeIntent(INTENTS.CROP_TOMATO)}
            >
              <span>🍅</span>
              <span>{lang === 'ta' ? 'தக்காளி' : 'Tomato'}</span>
            </button>

            <button
              className="voice-pill-chip"
              onClick={() => executeIntent(INTENTS.CROP_PADDY)}
            >
              <span>🌾</span>
              <span>{lang === 'ta' ? 'நெல்' : 'Paddy'}</span>
            </button>

            <button
              className="voice-pill-chip"
              onClick={() => executeIntent(INTENTS.HISTORY)}
            >
              <span>📜</span>
              <span>{lang === 'ta' ? 'வரலாறு' : 'History'}</span>
            </button>
          </div>
        </div>

        <div className="farmer-voice-hero-right">
          <button
            className="dashboard-voice-mic-orb"
            onClick={() => setIsVoiceSheetOpen(true)}
            aria-label="Open Voice Assistant"
            title="Tap to speak to Voice Doctor / பேச தொடவும்"
          >
            <div className="mic-ripple-ring ring-1" />
            <div className="mic-ripple-ring ring-2" />
            <Mic size={42} strokeWidth={2.5} color="#FFFFFF" />
            <span className="mic-orb-label">
              {lang === 'ta' ? 'பேச தொடவும்' : 'Tap to Speak'}
            </span>
          </button>
        </div>
      </div>

      {/* Crop Cards Area (Scroll on mobile, 5-column grid on laptop) */}
      <div className="section-header" style={{ padding: '8px 0' }}>
        <span className="section-title">
          <span>🌱</span>
          <span>{t.cropsSectionTitle}</span>
        </span>
        <button 
          className="section-action"
          onClick={() => navigateTo('library')}
        >
          {t.viewAllCrops}
        </button>
      </div>

      <div className="crops-scroll-container">
        {uniqueCrops.map((cropItem, idx) => (
          <div
            key={idx}
            className="crop-card"
            onClick={() => handleCropCardClick(cropItem)}
          >
            <div className="crop-icon-circle">
              {cropItem.icon}
            </div>
            <div className="crop-name-ta">
              {cropItem.crop_ta}
            </div>
            <div className="crop-name-en">
              {cropItem.crop}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Scans Area */}
      <div className="section-header" style={{ padding: '8px 0', marginTop: '12px' }}>
        <span className="section-title">
          <span>🕒</span>
          <span>{t.recentScansTitle}</span>
        </span>
        {recentScans.length > 0 && (
          <button 
            className="section-action"
            onClick={() => navigateTo('history')}
          >
            {t.viewAllCrops}
          </button>
        )}
      </div>

      <div className="recent-scans-strip">
        {recentScans.length > 0 ? (
          recentScans.map((scan) => (
            <div
              key={scan.id}
              className="recent-scan-item"
              onClick={() => handleRecentScanClick(scan)}
            >
              <div className="recent-scan-left">
                <div className="scan-thumb">
                  {scan.icon || '🌿'}
                </div>
                <div>
                  <div className="scan-info-title">
                    {lang === 'ta' ? scan.diseaseNameTa : scan.diseaseNameEn}
                  </div>
                  <div className="scan-info-meta">
                    {lang === 'ta' ? scan.cropTa : scan.cropEn} • {scan.confidence}% {t.matchPercent}
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </div>
          ))
        ) : (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-card-border)',
            color: 'var(--color-text-muted)',
            fontSize: 'calc(0.85rem * var(--font-scale))'
          }}>
            {t.noRecentScans}
          </div>
        )}
      </div>

    </div>
  );
}
