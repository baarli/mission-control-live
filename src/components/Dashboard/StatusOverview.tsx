// Inline SVG icon components to replace lucide-react
const Activity = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const Clock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const AlertCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export function StatusOverview() {
  return (
    <div className="bg-mission-panel rounded-xl border border-slate-800 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="text-mission-accent h-5 w-5" />
        <h3 className="text-lg font-semibold text-white">Status Overview</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-4">
          <div className="bg-mission-success/20 flex h-10 w-10 items-center justify-center rounded-full">
            <CheckCircle className="text-mission-success h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-sm text-slate-400">Completed Today</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-4">
          <div className="bg-mission-warning/20 flex h-10 w-10 items-center justify-center rounded-full">
            <Clock className="text-mission-warning h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-sm text-slate-400">In Progress</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-4">
          <div className="bg-mission-error/20 flex h-10 w-10 items-center justify-center rounded-full">
            <AlertCircle className="text-mission-error h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-sm text-slate-400">Needs Attention</p>
          </div>
        </div>
      </div>
    </div>
  );
}
