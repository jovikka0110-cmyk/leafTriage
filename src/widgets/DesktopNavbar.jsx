import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { 
  Home, 
  Camera, 
  BookOpen, 
  Clock, 
  Settings, 
  Sun, 
  Moon, 
  Mic, 
  Languages,
  Server,
  Leaf
} from 'lucide-react';

export default function DesktopNavbar() {
  const { 
    lang, 
    setLanguage, 
    currentScreen, 
    navigateTo, 
    theme, 
    toggleTheme, 
    setIsVoiceSheetOpen
  } = useApp();

  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'checking' | 'offline'

  useEffect(() => {
    let mounted = true;
    async function checkBackend() {
      const res = await ApiService.checkHealth();
      if (mounted) {
        setBackendStatus(res?.status === 'healthy' ? 'connected' : 'offline');
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { 
      id: 'dashboard', 
      labelTa: 'முகப்பு', 
      labelEn: 'Home', 
      icon: Home 
    },
    { 
      id: 'camera', 
      labelTa: 'பயிர் ஸ்கேன்', 
      labelEn: 'Scan Leaf', 
      icon: Camera,
      badge: 'AI'
    },
    { 
      id: 'library', 
      labelTa: 'பயிர் நூலகம்', 
      labelEn: 'Crop Library', 
      icon: BookOpen 
    },
    {
      id: 'cropCatalog',
      labelTa: 'பயிர் வழிகாட்டி',
      labelEn: 'Plant Guide',
      icon: Leaf
    },
    { 
      id: 'history', 
      labelTa: 'ஸ்கேன் வரலாறு', 
      labelEn: 'Scan History', 
      icon: Clock 
    },
    { 
      id: 'settings', 
      labelTa: 'அமைப்புகள்', 
      labelEn: 'Settings', 
      icon: Settings 
    },
  ];

  const toggleLanguage = () => {
    setLanguage(lang === 'ta' ? 'en' : 'ta');
  };

  return (
    <aside className="neat-sidebar">
      {/* 1. Brand Logo & Title (Top of the same line) */}
      <div 
        className="neat-sidebar-brand" 
        onClick={() => navigateTo('dashboard')} 
        role="button" 
        tabIndex={0}
      >
        <div className="neat-sidebar-brand-icon">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="26" fill="var(--color-primary)" />
            <path
              d="M50 16 C68 32 82 50 75 72 C70 86 55 90 50 88 C45 90 30 86 25 72 C18 50 32 32 50 16 Z"
              fill="#FFFFFF"
            />
            <path d="M50 24 Q50 50 50 84" stroke="var(--color-primary)" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="neat-sidebar-brand-text">
          <h1 className="neat-sidebar-brand-title">LeafTriage</h1>
          <span className="neat-sidebar-brand-sub">
            {lang === 'ta' ? 'LeafTriage' : 'LeafTriage'}
          </span>
        </div>
      </div>

      <div className="neat-sidebar-divider" />

      {/* 2. Main Navigation Items (Strictly same vertical line) */}
      <nav className="neat-sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`neat-sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
            >
              <div className="neat-sidebar-icon-cell">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="neat-sidebar-label">
                {lang === 'ta' ? item.labelTa : item.labelEn}
              </span>
              {item.badge && (
                <span className="neat-sidebar-badge">{item.badge}</span>
              )}
            </button>
          );
        })}

      </nav>

      {/* 4. Bottom Controls - in the exact same side line */}
      <div className="neat-sidebar-bottom">
        <div className="neat-sidebar-divider" />

        {/* Language switch item */}
        <button
          type="button"
          className="neat-sidebar-item"
          onClick={toggleLanguage}
          title="Switch Language / மொழியை மாற்றுக"
        >
          <div className="neat-sidebar-icon-cell">
            <Languages size={22} strokeWidth={2} />
          </div>
          <span className="neat-sidebar-label">
            {lang === 'ta' ? 'English (ஆங்கிலம்)' : 'தமிழ் (Tamil)'}
          </span>
        </button>

        {/* Theme toggle item */}
        <button
          type="button"
          className="neat-sidebar-item"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          <div className="neat-sidebar-icon-cell">
            {theme === 'dark' ? <Sun size={22} color="#FFD166" /> : <Moon size={22} />}
          </div>
          <span className="neat-sidebar-label">
            {theme === 'dark' ? (lang === 'ta' ? 'வெளிச்ச முறை' : 'Light Mode') : (lang === 'ta' ? 'இரவு முறை' : 'Dark Mode')}
          </span>
        </button>

        {/* Live Backend Connection Status item */}
        <div 
          className="neat-sidebar-item status-item"
          title={backendStatus === 'connected' ? 'FastAPI Local Backend & SQLite Database Active' : 'Connecting to local backend...'}
        >
          <div className="neat-sidebar-icon-cell">
            <Server 
              size={22} 
              color={backendStatus === 'connected' ? 'var(--color-primary)' : 'var(--color-terracotta)'} 
              strokeWidth={2} 
            />
          </div>
          <div className="neat-sidebar-status-wrap">
            <span 
              className="neat-sidebar-status-indicator" 
              style={{ backgroundColor: backendStatus === 'connected' ? '#558B64' : '#C86D4A' }}
            />
            <span className="neat-sidebar-label status-label">
              {backendStatus === 'connected' 
                ? (lang === 'ta' ? 'AI சர்வர்: தயார்' : 'Python AI: Connected') 
                : (lang === 'ta' ? 'இணைக்கிறது...' : 'Connecting AI...')}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
