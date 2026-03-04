import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function StatusOverview() {
  return (
    <div className="rounded-xl border border-slate-800 bg-mission-panel p-6">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-mission-accent" />
        <h3 className="text-lg font-semibold text-white">Status Overview</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mission-success/20">
            <CheckCircle className="h-5 w-5 text-mission-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-sm text-slate-400">Completed Today</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mission-warning/20">
            <Clock className="h-5 w-5 text-mission-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">5</p>
            <p className="text-sm text-slate-400">In Progress</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mission-error/20">
            <AlertCircle className="h-5 w-5 text-mission-error" />
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
