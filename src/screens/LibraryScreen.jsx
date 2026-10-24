import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TopBar from '../widgets/TopBar';
import diseasesData from '../data/diseases.json';
import { Search, ChevronRight, Volume2, ArrowRight } from 'lucide-react';

export default function LibraryScreen() {
  const { lang, t, screenParams, navigateTo, goBack, speakText } = useApp();

  const [selectedCrop, setSelectedCrop] = useState(screenParams?.selectedCrop || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Unique crop list for filter chips
  const cropsList = [
    { key: 'all', labelEn: 'All Crops', labelTa: 'அனைத்துப் பயிர்கள்', icon: '🌱' },
    { key: 'Paddy', labelEn: 'Paddy', labelTa: 'நெல்', icon: '🌾' },
    { key: 'Tomato', labelEn: 'Tomato', labelTa: 'தக்காளி', icon: '🍅' },
    { key: 'Banana', labelEn: 'Banana', labelTa: 'வாழை', icon: '🍌' },
    { key: 'Groundnut', labelEn: 'Groundnut', labelTa: 'நிலக்கடலை', icon: '🥜' },
    { key: 'Chilli', labelEn: 'Chilli', labelTa: 'மிளகாய்', icon: '🌶️' }
  ];

  // Filtered diseases
  const filteredDiseases = diseasesData.filter(d => {
    const matchesCrop = selectedCrop === 'all' || d.crop.toLowerCase() === selectedCrop.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCrop;

    const matchesName = 
      d.names.en.toLowerCase().includes(query) ||
      d.names.ta.toLowerCase().includes(query) ||
      d.crop.toLowerCase().includes(query) ||
      d.crop_ta.toLowerCase().includes(query) ||
      d.symptoms.en.toLowerCase().includes(query) ||
      d.symptoms.ta.toLowerCase().includes(query);

    return matchesCrop && matchesName;
  });

  const handleOpenDisease = (disease) => {
    navigateTo('remedies', { disease });
  };

  const handleSpeakDisease = (e, disease) => {
    e.stopPropagation();
    const speech = lang === 'ta'
      ? `பயிர்: ${disease.crop_ta}. நோய்: ${disease.names.ta}. அறிகுறிகள்: ${disease.symptoms.ta}`
      : `Crop: ${disease.crop}. Disease: ${disease.names.en}. Symptoms: ${disease.symptoms.en}`;
    speakText(speech);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
      <TopBar 
        title={t.libraryTitle} 
        showBack={true} 
        onBack={goBack} 
      />

      {/* Search Input Bar */}
      <div style={{ padding: '8px 0 12px 0' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--color-surface)',
          border: '1.5px solid var(--color-card-border)',
          borderRadius: 'var(--radius-full)',
          padding: '10px 18px',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '600px'
        }}>
          <Search size={20} color="var(--color-text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: 'calc(0.95rem * var(--font-scale))',
              color: 'var(--color-text-main)',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button
          className="btn-secondary"
          onClick={() => navigateTo('cropCatalog')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            fontWeight: '700'
          }}
        >
          <span>🌿</span>
          <span>{lang === 'ta' ? 'பயிர் வழிகாட்டி' : 'Plant Guide'}</span>
        </button>
      </div>

      {/* Horizontal Crop Filter Chips */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        padding: '0 0 18px 0',
        scrollbarWidth: 'none'
      }}>
        {cropsList.map(c => (
          <button
            key={c.key}
            onClick={() => setSelectedCrop(c.key)}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-full)',
              border: selectedCrop === c.key ? '1.5px solid var(--color-primary)' : '1px solid var(--color-card-border)',
              backgroundColor: selectedCrop === c.key ? 'var(--color-primary-light)' : 'var(--color-surface)',
              color: selectedCrop === c.key ? 'var(--color-primary-hover)' : 'var(--color-text-muted)',
              fontSize: 'calc(0.85rem * var(--font-scale))',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span>{c.icon}</span>
            <span>{lang === 'ta' ? c.labelTa : c.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Disease Cards List (2-column on laptop, stacked on mobile) */}
      <div className="library-desktop-grid" style={{ padding: '0 0 24px 0' }}>
        {filteredDiseases.length > 0 ? (
          filteredDiseases.map(disease => (
            <div
              key={disease.id}
              onClick={() => handleOpenDisease(disease)}
              style={{
                backgroundColor: 'var(--color-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--color-card-border)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'border-color var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '30px' }}>{disease.icon}</span>
                  <div>
                    <span style={{ 
                      fontSize: 'calc(0.82rem * var(--font-scale))', 
                      fontWeight: '700', 
                      color: 'var(--color-primary)' 
                    }}>
                      {lang === 'ta' ? disease.crop_ta : disease.crop}
                    </span>
                    <h3 style={{
                      fontSize: 'calc(1.15rem * var(--font-scale))',
                      fontWeight: '800',
                      color: 'var(--color-text-main)',
                      lineHeight: 1.25
                    }}>
                      {lang === 'ta' ? disease.names.ta : disease.names.en}
                    </h3>
                  </div>
                </div>

                <button
                  className="icon-btn"
                  style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                  onClick={(e) => handleSpeakDisease(e, disease)}
                  title={lang === 'ta' ? "குரலில் கேட்க" : "Listen aloud"}
                >
                  <Volume2 size={20} color="var(--color-primary)" />
                </button>
              </div>

              <p style={{
                fontSize: 'calc(0.88rem * var(--font-scale))',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {lang === 'ta' ? disease.symptoms.ta : disease.symptoms.en}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'calc(0.88rem * var(--font-scale))',
                fontWeight: '700',
                color: 'var(--color-primary)',
                marginTop: '6px'
              }}>
                <span>{t.viewRemediesBtn}</span>
                <ChevronRight size={18} />
              </div>
            </div>
          ))
        ) : (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'calc(0.9rem * var(--font-scale))',
            gridColumn: '1 / -1'
          }}>
            பொருத்தமான நோய்கள் எதுவும் கிடைக்கவில்லை.
          </div>
        )}
      </div>
    </div>
  );
}
