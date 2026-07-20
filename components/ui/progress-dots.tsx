interface ProgressDotsProps {
  total?: number;
  completed: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressDots({ total = 12, completed, size = 'md' }: ProgressDotsProps) {
  const dotSizes = { sm: 14, md: 20, lg: 28 };
  const dotSize = dotSizes[size];
  const gap = size === 'lg' ? 10 : 6;

  return (
    <div
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemax={total}
      aria-label={`${completed} of ${total} sarees completed`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${gap}px`,
        alignItems: 'center',
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = i < completed;
        const isCurrent = i === completed;

        return (
          <div
            key={i}
            title={
              isCompleted
                ? `Saree ${i + 1} — Completed`
                : isCurrent
                ? `Saree ${i + 1} — In Progress`
                : `Saree ${i + 1} — Remaining`
            }
            className={
              isCompleted
                ? 'saree-dot completed'
                : isCurrent
                ? 'saree-dot current'
                : 'saree-dot'
            }
            style={{
              width: dotSize,
              height: dotSize,
            }}
          />
        );
      })}
    </div>
  );
}
