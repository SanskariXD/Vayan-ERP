import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon?: ReactNode;
  color?: string;
  alert?: boolean;
  sublabel?: string;
}

export function KpiCard({ label, value, unit, icon, color, alert, sublabel }: KpiCardProps) {
  const borderColor = alert ? '#D97706' : '#E7E5E4';
  const valueColor = alert ? '#D97706' : color ?? '#1E2A38';

  return (
    <div
      className="card-surface animate-fade-in"
      style={{
        padding: '1.25rem 1.5rem',
        borderColor,
        transition: 'border-color 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background accent */}
      {alert && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '4px',
            height: '100%',
            backgroundColor: '#D97706',
            borderRadius: '0 8px 8px 0',
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#78716C',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
        {icon && (
          <div style={{ color: valueColor, opacity: 0.7 }}>{icon}</div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <span
          className="font-mono-nums animate-count"
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: valueColor,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.875rem', color: '#78716C', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {sublabel && (
        <p style={{ fontSize: '0.75rem', color: '#78716C', marginTop: '0.375rem' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
