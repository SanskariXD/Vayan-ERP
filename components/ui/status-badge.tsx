import type { LoomStatus } from '@/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';

interface StatusBadgeProps {
  status: LoomStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.IDLE;
  const label = STATUS_LABELS[status] ?? status;

  const padding = size === 'sm' ? '1px 8px' : '3px 10px';
  const fontSize = size === 'sm' ? '0.6875rem' : '0.75rem';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        borderRadius: '4px',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
      className={`${colors.bg} ${colors.text}`}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
