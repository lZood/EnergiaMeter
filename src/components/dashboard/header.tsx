import { Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  onAnalyzeClick: () => void;
  isAnalyzing: boolean;
}


export function DashboardHeader({ onAnalyzeClick, isAnalyzing }: DashboardHeaderProps) {
  return (
    <div className="w-full max-w-7xl mx-auto mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="bg-primary p-2 rounded-lg shadow">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              EnergyGlimpse
            </h1>
            <p className="mt-1 text-muted-foreground">
              Tu panel de control de consumo de energía en tiempo real.
            </p>
          </div>
        </div>
        <Button onClick={onAnalyzeClick} disabled={isAnalyzing}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isAnalyzing ? 'Analizando...' : 'Analizar Consumo'}
        </Button>
      </div>
    </div>
  );
}
