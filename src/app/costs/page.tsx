"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { EnergyReading } from '@/types';
import { CostCard } from '@/components/dashboard/cost-card';
import { ForecastCard } from '@/components/dashboard/forecast-card';
import { forecastEnergyCost } from '@/ai/flows/forecast-energy-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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

export default function CostsPage() {
  const [historicalData, setHistoricalData] = useState<EnergyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [rate, setRate] = useState<number>(0.803);
  
  const [forecastedCost, setForecastedCost] = useState<number>(0);
  const [isForecasting, setIsForecasting] = useState(false);
  const [lastForecastUpdate, setLastForecastUpdate] = useState<string | null>(null);

  const getForecast = useCallback(async () => {
    if (historicalData.length < 10) {
        toast({
            variant: 'destructive',
            title: 'Datos insuficientes',
            description: 'Se necesitan más lecturas para realizar un pronóstico preciso.',
        });
        return;
    }
    setIsForecasting(true);
    try {
      const cost = await forecastEnergyCost(historicalData, rate);
      setForecastedCost(cost);
      setLastForecastUpdate(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    } catch (error) {
      console.error("Error al obtener el pronóstico:", error);
      toast({
            variant: 'destructive',
            title: 'Error de Pronóstico',
            description: 'No se pudo calcular el pronóstico. Inténtalo de nuevo.',
      });
    } finally {
      setIsForecasting(false);
    }
  }, [historicalData, rate, toast]);

  useEffect(() => {
    const checkSupabaseConnection = () => {
      return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    };

    if (!checkSupabaseConnection()) {
      setHistoricalData(MOCK_HISTORICAL_DATA);
      setLoading(false);
      return;
    }
    
    setIsSupabaseConnected(true);

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('lecturas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500); // Fetch more data for better forecasting

      if (error) {
        console.error('Error al obtener datos:', error);
        toast({
          variant: 'destructive',
          title: 'Error al obtener datos',
          description: 'No se pudieron cargar los datos de Supabase.',
        });
      } else if (data) {
        setHistoricalData(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [toast]);
  

  if (loading) {
    return (
      <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
        <h1 className="text-3xl font-bold">Costos y Pronóstico</h1>
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Costos y Pronóstico</h1>
      <main className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CostCard historicalData={historicalData} rate={rate} onRateChange={setRate} />
          <ForecastCard 
            cost={forecastedCost} 
            isLoading={isForecasting} 
            lastUpdated={lastForecastUpdate}
            onForecast={getForecast}
          />
        </div>
      </main>
    </div>
  );
}
