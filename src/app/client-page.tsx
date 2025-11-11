"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { EnergyReading } from '@/types';
import { Zap, TrendingUp, Droplets, Thermometer, Gauge, Sparkles } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { EnergyCard } from '@/components/dashboard/energy-card';
import { HistoryChart } from '@/components/dashboard/history-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Timer } from '@/components/dashboard/timer';
import { analyzeEnergyConsumption } from '@/ai/flows/analyze-energy-flow';
import { detectAnomaly } from '@/ai/flows/detect-anomaly-flow';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

const MOCK_HISTORICAL_DATA: EnergyReading[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: `mock-${i}`,
    created_at: new Date(Date.now() - (20 - i) * 60000).toISOString(),
    potencia_w: Math.floor(Math.random() * 200 + 50 + Math.sin(i / 5) * 30),
    corriente_a: Math.random() * 2,
    voltaje_v: Math.random() * 10 + 220,
    temperatura: Math.random() * 10 + 20,
    humedad: Math.random() * 20 + 50,
  })
);

const REFRESH_INTERVAL = 8000; // 8 seconds

export default function ClientPage() {
  const [currentReading, setCurrentReading] = useState<EnergyReading | null>(
    null
  );
  const [historicalData, setHistoricalData] = useState<EnergyReading[]>([]);
  const [avgPower, setAvgPower] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [time, setTime] = useState('N/A');

  const [isAnalysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleAnalysis = async () => {
    if (!historicalData || historicalData.length < 5) {
      setAnalysisResult("No hay suficientes datos para realizar un análisis. Espera a que se recopilen más lecturas.");
      setAnalysisDialogOpen(true);
      return;
    }
    setIsAnalyzing(true);
    setAnalysisDialogOpen(true);
    try {
      const result = await analyzeEnergyConsumption(historicalData);
      setAnalysisResult(result);
    } catch (error) {
      console.error("Error al analizar el consumo:", error);
      setAnalysisResult("Ha ocurrido un error al intentar analizar los datos. Por favor, inténtalo de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkForAnomalies = useCallback(async (data: EnergyReading[]) => {
    if (data.length < 10) return; // Need enough data to detect anomalies

    try {
      const anomalyResult = await detectAnomaly(data);
      if (anomalyResult.isAnomaly) {
        toast({
          variant: 'destructive',
          title: '¡Alerta de Anomalía!',
          description: anomalyResult.reason,
          duration: 9000,
        });
      }
    } catch (error) {
      console.error("Error al detectar anomalías:", error);
    }
  }, [toast]);
  

  const handleNewData = useCallback((newData: EnergyReading[]) => {
      setHistoricalData(newData);
      if (newData.length > 0) {
        const latestReading = newData[0];
        setCurrentReading(latestReading);
        setTime(new Date(latestReading.created_at).toLocaleTimeString());
      }
  }, []);


  const fetchData = useCallback(async () => {
    if (!isSupabaseConnected) return;

    const { data, error } = await supabase
      .from('lecturas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Limit to last 100 entries for performance

    if (error) {
      console.error('Error al obtener datos:', error);
      toast({
        variant: 'destructive',
        title: 'Error al obtener datos',
        description: 'No se pudieron cargar los datos de Supabase.',
      });
    } else if (data) {
        const currentDataLength = historicalData.length;
        handleNewData(data);
        // Only check for anomalies if new data has actually arrived
        if (data.length > 0 && data.length > currentDataLength) {
            checkForAnomalies(data);
        }
    }
    if (loading) setLoading(false);
  }, [isSupabaseConnected, toast, loading, handleNewData, checkForAnomalies, historicalData.length]);


  useEffect(() => {
    const checkSupabaseConnection = () => {
        return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    };

    if (!checkSupabaseConnection()) {
        toast({
            variant: 'destructive',
            title: 'Supabase no configurado',
            description: 'Por favor, configura tus credenciales de Supabase. Usando datos de prueba.',
            duration: 9000,
        });
        handleNewData(MOCK_HISTORICAL_DATA);
        setLoading(false);
        return;
    }
    
    setIsSupabaseConnected(true);
    setLoading(true);
  }, [toast, handleNewData]);
  
  useEffect(() => {
    if (isSupabaseConnected) {
      fetchData();
    }
  }, [isSupabaseConnected, fetchData]);

  useEffect(() => {
    if (historicalData.length > 0) {
      const totalPower = historicalData.reduce(
        (acc, curr) => acc + curr.potencia_w,
        0
      );
      setAvgPower(totalPower / historicalData.length);
    }
  }, [historicalData]);


  if (loading && isSupabaseConnected) {
    return (
      <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
        <DashboardHeader onAnalyzeClick={handleAnalysis} isAnalyzing={isAnalyzing}/>
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="col-span-2 lg:col-span-4 h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 relative">
       {isSupabaseConnected && <Timer duration={REFRESH_INTERVAL} onComplete={fetchData} />}
      <DashboardHeader onAnalyzeClick={handleAnalysis} isAnalyzing={isAnalyzing} />
      <main className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <EnergyCard
            title="Potencia Actual"
            value={currentReading ? currentReading.potencia_w.toFixed(0) : '0'}
            unit="W"
            icon={Zap}
            iconClassName="text-accent"
          />
          <EnergyCard
            title="Potencia Promedio"
            value={avgPower.toFixed(0)}
            unit="W"
            icon={TrendingUp}
          />
           <EnergyCard
            title="Corriente"
            value={currentReading ? currentReading.corriente_a.toFixed(2) : '0'}
            unit="A"
            icon={Zap}
            iconClassName='text-yellow-500'
          />
          <EnergyCard
            title="Voltaje"
            value={currentReading ? currentReading.voltaje_v.toFixed(1) : '0'}
            unit="V"
            icon={Gauge}
          />
          <EnergyCard
            title="Temperatura"
            value={currentReading ? currentReading.temperatura.toFixed(1) : '0'}
            unit="°C"
            icon={Thermometer}
          />
          <EnergyCard
            title="Humedad"
            value={currentReading ? currentReading.humedad.toFixed(1) : '0'}
            unit="%"
            icon={Droplets}
          />
          
          <div className="col-span-2 lg:col-span-4">
            <HistoryChart data={historicalData} />
          </div>
        </div>
      </main>

      <AlertDialog open={isAnalysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análisis Energético
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                {isAnalyzing ? (
                  <div className="space-y-4 pt-4">
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap pt-4 text-sm text-foreground">{analysisResult}</div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
