import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ConfidenceMeter({ percentage }) {
  const { t } = useApp();
  const isLow = percentage < 60;
  const isHigh = percentage >= 85;

  let label = t.moderateConfidence;
  if (isHigh) label = t.highConfidence;
  if (isLow) label = t.lowConfidence;

  return (
    <div className="confidence-meter-container">
      <div className="confidence-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isLow ? (
            <AlertTriangle size={18} color="var(--color-warning)" />
          ) : (
            <CheckCircle2 size={18} color="var(--color-success)" />
          )}
          {t.confidenceTitle}: <strong>{percentage}%</strong>
        </span>
        <span style={{ color: isLow ? 'var(--color-warning)' : 'var(--color-success)' }}>
          {label}
        </span>
      </div>

      <div className="confidence-bar-bg">
        <div 
          className={`confidence-bar-fill ${isLow ? 'warning' : ''}`}
          style={{ width: `${Math.min(100, Math.max(10, percentage))}%` }}
        />
      </div>
    </div>
  );
}
