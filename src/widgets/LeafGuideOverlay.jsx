import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Sun } from 'lucide-react';

export default function LeafGuideOverlay() {
  const { t } = useApp();

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '70px 20px 140px 20px',
      zIndex: 20
    }}>
      {/* Top Banner Guide */}
      <div style={{
        backgroundColor: 'rgba(21, 29, 23, 0.72)',
        backdropFilter: 'blur(6px)',
        color: '#FFFFFF',
        padding: '10px 18px',
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: 'calc(0.85rem * var(--font-scale))',
        fontWeight: '600',
        textAlign: 'center',
        maxWidth: '90%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.25)'
      }}>
        <Sun size={18} color="#FFD166" style={{ flexShrink: 0 }} />
        <span>{t.leafGuideTip}</span>
      </div>

      {/* Soft Leaf Silhouette Guide Wireframe */}
      <div style={{
        position: 'relative',
        width: '260px',
        height: '340px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg 
          viewBox="0 0 260 340" 
          width="100%" 
          height="100%" 
          style={{ overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(111, 166, 125, 0.4))' }}
        >
          {/* Outer leaf guide path */}
          <path 
            d="M130,20 C200,70 240,160 200,260 C175,300 140,320 130,320 C120,320 85,300 60,260 C20,160 60,70 130,20 Z" 
            fill="none" 
            stroke="#76B487" 
            strokeWidth="3" 
            strokeDasharray="8 6"
            strokeLinecap="round"
          />
          {/* Vein guide */}
          <path 
            d="M130,30 Q131,160 130,310" 
            fill="none" 
            stroke="#76B487" 
            strokeWidth="2" 
            strokeDasharray="4 4"
            opacity="0.6"
          />
        </svg>

        {/* Framing corner markers */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          color: '#FAF7F0',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: 'calc(0.78rem * var(--font-scale))',
          fontWeight: '500'
        }}>
          {t.leafGuideSub}
        </div>
      </div>

      {/* Empty space for bottom camera controls */}
      <div style={{ height: '10px' }} />
    </div>
  );
}
