import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export default function SafetyCard() {
  const { t } = useApp();

  return (
    <div style={{
      margin: '14px 18px',
      padding: '16px 18px',
      backgroundColor: 'var(--color-terracotta-light)',
      borderRadius: 'var(--radius-md)',
      border: '1.5px solid rgba(200, 109, 74, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert size={22} color="var(--color-terracotta)" />
        <h4 style={{ 
          fontSize: 'calc(0.96rem * var(--font-scale))', 
          fontWeight: '700', 
          color: 'var(--color-terracotta)' 
        }}>
          {t.safetyCardTitle}
        </h4>
      </div>

      <ul style={{ 
        paddingLeft: '20px', 
        fontSize: 'calc(0.85rem * var(--font-scale))', 
        color: 'var(--color-text-main)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <li>{t.safetyRule1}</li>
        <li>{t.safetyRule2}</li>
        <li>{t.safetyRule3}</li>
        <li>{t.safetyRule4}</li>
      </ul>

      <div style={{
        marginTop: '6px',
        padding: '10px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        fontSize: 'calc(0.82rem * var(--font-scale))',
        color: 'var(--color-text-muted)'
      }}>
        <AlertCircle size={18} color="var(--color-terracotta)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>{t.officerDisclaimer}</span>
      </div>
    </div>
  );
}
