
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { EnergyReading } from '@/types';
import { CostCard } from '@/components/dashboard/cost-card';
import { ForecastCard } from '@/components/dashboard/forecast-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { forecastEnergyCost } from '@/ai/flows/forecast-energy-flow';

const MOCK_HISTORICAL_DATA: EnergyReading[] = Array.from(
  { length: 100 },
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(i / 5)); // Simulate data over several days
    date.setMinutes(date.getMinutes() - (i % 288) * 5); // 288 5-min intervals in a day
    return {
    id: `mock-${i}`,
    created_at: date.toISOString(),
    potencia_w: Math.floor(Math.random() * 200 + 50 + Math.sin(i / 20) * 30),
    corriente_a: Math.random() * 2,
    voltaje_v: Math.random() * 10 + 220,
    temperatura: Math.random() * 10 + 20,
    humedad: Math.random() * 20 + 50,
  }}
);

export default function CostsPage() {
  const [historicalData, setHistoricalData] = useState<EnergyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [rate, setRate] = useState<number>(0.803);
  
  const [forecastedCost, setForecastedCost] = useState<number>(0);
  const [isForecasting, setIsForecasting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currentMonthData = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return historicalData.filter(
      (reading) => new Date(reading.created_at) >= startOfMonth
    );
  }, [historicalData]);

  const getForecast = useCallback(async () => {
    if (currentMonthData.length < 10) {
      toast({
        title: 'Datos insuficientes para pronóstico',
        description: 'Se necesitan más lecturas del mes actual para realizar un pronóstico preciso.',
        variant: 'destructive',
      });
      return;
    }
    setIsForecasting(true);
    try {
      // Filtra para asegurar que solo se envían datos válidos
      const validReadings = currentMonthData.filter(r => typeof r.potencia_w === 'number' && !isNaN(r.potencia_w));

      const result = await forecastEnergyCost({
        readings: validReadings,
        rate: rate,
      });
      setForecastedCost(result);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error al obtener el pronóstico:", error);
      toast({
        variant: 'destructive',
        title: 'Error de Pronóstico',
        description: 'No se pudo calcular el pronóstico. La IA no pudo procesar la solicitud.',
      });
    } finally {
      setIsForecasting(false);
    }
  }, [currentMonthData, rate, toast]);

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
      setLoading(true);
      const { data, error } = await supabase
        .from('lecturas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2000); // Fetch more data for better forecasting accuracy

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
          <CostCard historicalData={currentMonthData} rate={rate} onRateChange={setRate} />
          <ForecastCard 
            cost={forecastedCost} 
            isLoading={isForecasting}
            lastUpdated={lastUpdated}
            onGetForecast={getForecast}
          />
        </div>
      </main>
    </div>
  );
}
