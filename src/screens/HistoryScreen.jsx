import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import TopBar from '../widgets/TopBar';
import diseasesData from '../data/diseases.json';
import { ApiService } from '../services/api';
import { Trash2, ChevronRight, Calendar, ArrowRight, RefreshCw, Database } from 'lucide-react';

export default function HistoryScreen() {
  const { 
    lang, 
    t, 
    historyList, 
    removeScan, 
    clearAllHistory, 
    navigateTo, 
    goBack 
  } = useApp();

  const [dbScans, setDbScans] = useState(historyList || []);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with Python SQLite Database on mount
  useEffect(() => {
    async function loadBackendHistory() {
      setIsLoading(true);
      const backendHistory = await ApiService.getHistory();
      if (backendHistory && Array.isArray(backendHistory)) {
        setDbScans(backendHistory);
      } else {
        setDbScans(historyList || []);
      }
      setIsLoading(false);
    }
    loadBackendHistory();
  }, [historyList]);

  const handleSelectHistoryItem = (scan) => {
    const fullDisease = diseasesData.find(d => d.id === scan.diseaseId) || diseasesData[0];
    navigateTo('result', {
      disease: fullDisease,
      confidence: scan.confidence || 90,
      photoUrl: null
    });
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    removeScan(id);
    await ApiService.deleteHistoryItem(id);
    setDbScans(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = async () => {
    clearAllHistory();
    await ApiService.clearAllHistory();
    setDbScans([]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%' }}>
      <TopBar 
        title={t.historyTitle} 
        showBack={true} 
        onBack={goBack} 
      />

      <div style={{ padding: '16px 0 24px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {dbScans && dbScans.length > 0 ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ 
                fontSize: 'calc(0.88rem * var(--font-scale))', 
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Database size={16} color="var(--color-primary)" />
                <span>{dbScans.length} {lang === 'ta' ? 'பதிவுகள் (SQLite)' : 'Records (SQLite)'}</span>
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-terracotta)',
                  fontSize: 'calc(0.85rem * var(--font-scale))',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {t.clearHistoryBtn}
              </button>
            </div>

            {dbScans.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-card-border)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, cursor: 'pointer' }}
                  onClick={() => handleSelectHistoryItem(item)}
                >
                  <div className="scan-thumb" style={{ width: '52px', height: '52px', fontSize: '28px' }}>
                    {item.icon || '🌿'}
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: 'calc(1.05rem * var(--font-scale))',
                      fontWeight: '800',
                      color: 'var(--color-text-main)',
                      marginBottom: '2px'
                    }}>
                      {lang === 'ta' ? item.diseaseNameTa : item.diseaseNameEn}
                    </h4>

                    <p style={{
                      fontSize: 'calc(0.82rem * var(--font-scale))',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                        {lang === 'ta' ? item.cropTa : item.cropEn}
                      </span>
                      <span>•</span>
                      <span>{item.confidence}% {t.matchPercent}</span>
                      <span>•</span>
                      <span>{formatDate(item.timestamp)}</span>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    title="Delete record from SQLite database"
                  >
                    <Trash2 size={18} color="var(--color-terracotta)" />
                  </button>

                  <button
                    type="button"
                    className="icon-btn"
                    style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                    onClick={() => handleSelectHistoryItem(item)}
                    title="View Result & Remedies"
                  >
                    <ChevronRight size={20} color="var(--color-text-muted)" />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{
            padding: '50px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--color-card-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            marginTop: '20px'
          }}>
            <span style={{ fontSize: '48px' }}>📜</span>
            <h3 style={{ fontSize: 'calc(1.2rem * var(--font-scale))', fontWeight: '800', color: 'var(--color-text-main)' }}>
              {t.noHistoryDesc}
            </h3>
            <p style={{ fontSize: 'calc(0.88rem * var(--font-scale))', color: 'var(--color-text-muted)', maxWidth: '320px' }}>
              {lang === 'ta' 
                ? 'பயிர் இலையை கேமரா மூலம் ஸ்கேன் செய்தால் முடிவுகள் உள்ளூர் SQLite தரவுத்தளத்தில் சேமிக்கப்படும்.' 
                : 'Scanned leaves are automatically analyzed and saved into your local SQLite database.'}
            </p>
            <button
              className="btn-primary"
              style={{ maxWidth: '260px', marginTop: '10px' }}
              onClick={() => navigateTo('camera')}
            >
              {t.heroScanTitle}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
