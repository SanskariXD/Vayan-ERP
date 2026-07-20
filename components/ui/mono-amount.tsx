interface MonoAmountProps {
  amount: number;
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function MonoAmount({ amount, showSign = false, size = 'md' }: MonoAmountProps) {
  const isPositive = amount >= 0;
  const color = isPositive ? '#2E6F40' : '#1E2A38';

  const sizes = {
    sm: '0.8125rem',
    md: '0.9375rem',
    lg: '1.125rem',
    xl: '1.5rem',
  };

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return (
    <span
      className="font-mono-nums"
      style={{
        color,
        fontSize: sizes[size],
        fontWeight: 600,
        textAlign: 'right',
        display: 'inline-block',
      }}
    >
      {showSign && !isPositive && '−'}
      {showSign && isPositive && '+'}
      {formatted}
    </span>
  );
}
