import type { MetricStatus } from '@/types';

// Inline SVG icon components to replace lucide-react
const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
const TrendingDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);
const Minus = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  status: MetricStatus;
}

const statusStyles: Record<MetricStatus, string> = {
  success: 'bg-mission-success/10 text-mission-success border-mission-success/20',
  warning: 'bg-mission-warning/10 text-mission-warning border-mission-warning/20',
  error: 'bg-mission-error/10 text-mission-error border-mission-error/20',
  neutral: 'bg-slate-800/50 text-slate-400 border-slate-700',
};

export function MetricCard({ title, value, change, status }: MetricCardProps) {
  const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const changeColor = change > 0 ? 'text-mission-success' : change < 0 ? 'text-mission-error' : 'text-slate-400';

  return (
    <div className={`rounded-xl border p-6 ${statusStyles[status]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
        {change !== 0 && (
          <span className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
            <ChangeIcon className="h-4 w-4" />
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
