import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import SplashScreen from './screens/SplashScreen';
import DashboardScreen from './screens/DashboardScreen';
import CameraScreen from './screens/CameraScreen';
import AnalysingScreen from './screens/AnalysingScreen';
import ResultScreen from './screens/ResultScreen';
import RemediesScreen from './screens/RemediesScreen';
import HistoryScreen from './screens/HistoryScreen';
import LibraryScreen from './screens/LibraryScreen';
import CropCatalogScreen from './screens/CropCatalogScreen';
import SettingsScreen from './screens/SettingsScreen';
import VoiceAgentSheet from './widgets/VoiceAgentSheet';
import DesktopNavbar from './widgets/DesktopNavbar';
import { Wifi, BatteryMedium, Signal, Home, BookOpen, Clock, Settings, Mic, VolumeX, Volume2, Leaf } from 'lucide-react';
import './theme/theme.css';

function AppContent() {
  const { currentScreen, navigateTo, setIsVoiceSheetOpen, isSpeaking, stopSpeaking, lang, t } = useApp();
  const [currentTime, setCurrentTime] = useState('10:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'camera':
        return <CameraScreen />;
      case 'analysing':
        return <AnalysingScreen />;
      case 'result':
        return <ResultScreen />;
      case 'remedies':
        return <RemediesScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'library':
        return <LibraryScreen />;
      case 'cropCatalog':
        return <CropCatalogScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const isFullscreenCamera = currentScreen === 'camera';
  const isSplash = currentScreen === 'splash';

  return (
    <div className="responsive-app-container">
      {/* Desktop Website Navigation Header (Visible only on Laptop/Desktop) */}
      {!isSplash && <DesktopNavbar />}

      {/* Main App Layout:
          - On Laptop: Wide responsive website view with max-width container
          - On Mobile: Android smartphone app view with status bar and bottom nav */}
      <div className="adaptive-viewport-shell">
        {/* Android Status Bar (Shown ONLY on mobile screens, hidden on laptop/desktop) */}
        {!isFullscreenCamera && (
          <div className="mobile-only-status-bar">
            <span>{currentTime}</span>
            <div className="status-bar-icons">
              <Signal size={14} />
              <Wifi size={14} />
              <BatteryMedium size={16} />
            </div>
          </div>
        )}

        {/* Dynamic Screen Viewport */}
        <main className={`app-screen-container ${isFullscreenCamera ? 'camera-view' : ''} ${isSplash ? 'splash-view' : ''}`}>
          {renderScreen()}
        </main>

        {/* Global Bottom Navigation Bar (Visible ONLY on mobile devices) */}
        {!isSplash && !isFullscreenCamera && (
          <nav className="mobile-bottom-nav">
            <button
              onClick={() => navigateTo('dashboard')}
              className={`mobile-nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
            >
              <Home size={22} strokeWidth={currentScreen === 'dashboard' ? 2.5 : 2} />
              <span>{lang === 'ta' ? 'முகப்பு' : 'Home'}</span>
            </button>

            <button
              onClick={() => navigateTo('library')}
              className={`mobile-nav-item ${currentScreen === 'library' ? 'active' : ''}`}
            >
              <BookOpen size={22} strokeWidth={currentScreen === 'library' ? 2.5 : 2} />
              <span>{lang === 'ta' ? 'நூலகம்' : 'Library'}</span>
            </button>

            <button
              onClick={() => navigateTo('cropCatalog')}
              className={`mobile-nav-item ${currentScreen === 'cropCatalog' ? 'active' : ''}`}
            >
              <Leaf size={22} strokeWidth={currentScreen === 'cropCatalog' ? 2.5 : 2} />
              <span>{lang === 'ta' ? 'பயிர்' : 'Plant'}</span>
            </button>

            {/* Empty Center Spacer for Floating Mic */}
            <div style={{ width: '56px' }} />

            <button
              onClick={() => navigateTo('history')}
              className={`mobile-nav-item ${currentScreen === 'history' ? 'active' : ''}`}
            >
              <Clock size={22} strokeWidth={currentScreen === 'history' ? 2.5 : 2} />
              <span>{lang === 'ta' ? 'வரலாறு' : 'History'}</span>
            </button>

            <button
              onClick={() => navigateTo('settings')}
              className={`mobile-nav-item ${currentScreen === 'settings' ? 'active' : ''}`}
            >
              <Settings size={22} strokeWidth={currentScreen === 'settings' ? 2.5 : 2} />
              <span>{lang === 'ta' ? 'அமைப்புகள்' : 'Settings'}</span>
            </button>
          </nav>
        )}

        {/* Omnipresent Voice Assistant Bottom Sheet Modal */}
        <VoiceAgentSheet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
