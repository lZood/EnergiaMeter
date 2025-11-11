import { Zap } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="w-full max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="bg-primary p-2 rounded-lg shadow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Vistazo Energético
            </h1>
            <p className="mt-1 text-muted-foreground">
              Tu panel de control de consumo de energía en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
