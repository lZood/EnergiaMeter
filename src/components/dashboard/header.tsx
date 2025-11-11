import { Zap } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center space-x-3">
        <div className="bg-primary p-2 rounded-lg shadow">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          EnergyGlimpse
        </h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Tu panel de control de consumo de energía en tiempo real.
      </p>
    </div>
  );
}
