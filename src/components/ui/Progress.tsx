'use client';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'blue' | 'green' | 'amber' | 'red';
  showLabel?: boolean;
}

export function Progress({ value, max = 100, className = '', color = 'blue', showLabel }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className={`relative ${className}`}>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs font-medium text-slate-500">
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
