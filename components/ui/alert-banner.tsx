import { AlertTriangle } from 'lucide-react';

interface AlertBannerProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'alert' | 'critical';
}

export function AlertBanner({ title, message, action, variant = 'alert' }: AlertBannerProps) {
  const isCritical = variant === 'critical';

  return (
    <div
      className={isCritical ? 'animate-pulse-red' : 'animate-pulse-alert'}
      style={{
        backgroundColor: isCritical ? '#7A20211A' : '#D977061A',
        border: `2px solid ${isCritical ? '#7A2021' : '#D97706'}`,
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
      }}
    >
      <AlertTriangle
        size={20}
        color={isCritical ? '#7A2021' : '#D97706'}
        style={{ flexShrink: 0, marginTop: '1px' }}
      />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: isCritical ? '#7A2021' : '#B45309',
            marginBottom: '0.25rem',
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: '0.8125rem',
            color: isCritical ? '#5C1719' : '#92400E',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="btn-alert"
            style={{ marginTop: '0.75rem' }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
