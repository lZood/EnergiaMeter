"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { EnergyReading } from '@/types';
import { Zap, Clock, TrendingUp, Droplets, Thermometer, Gauge } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/header';
import { EnergyCard } from '@/components/dashboard/energy-card';
import { HistoryChart } from '@/components/dashboard/history-chart';
import { CostCard } from '@/components/dashboard/cost-card';
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

export default function ClientPage() {
  const [currentReading, setCurrentReading] = useState<EnergyReading | null>(
    null
  );
  const [historicalData, setHistoricalData] = useState<EnergyReading[]>([]);
  const [avgPower, setAvgPower] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [hasShownConnectionError, setHasShownConnectionError] = useState(false);

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
        setHistoricalData(MOCK_HISTORICAL_DATA);
        setCurrentReading(MOCK_HISTORICAL_DATA[MOCK_HISTORICAL_DATA.length - 1]);
        setLoading(false);
        return;
    }
    
    setIsSupabaseConnected(true);

    const fetchInitialData = async () => {
      setLoading(true);
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();
      const { data, error } = await supabase
        .from('lecturas')
        .select('*')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener datos iniciales:', error);
        toast({
          variant: 'destructive',
          title: 'Error al obtener datos',
          description: 'Revisa tu conexión a Supabase y el nombre de la tabla. Usando datos de prueba.',
        });
        setHistoricalData(MOCK_HISTORICAL_DATA);
        if (MOCK_HISTORICAL_DATA.length > 0) {
            setCurrentReading(MOCK_HISTORICAL_DATA[MOCK_HISTORICAL_DATA.length - 1]);
        }
      } else {
        setHistoricalData(data);
        if (data.length > 0) {
          setCurrentReading(data[0]);
        }
      }
      setLoading(false);
    };

    fetchInitialData();

    const channel = supabase
      .channel('lecturas_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'lecturas' },
        (payload) => {
          const newReading = payload.new as EnergyReading;
          setCurrentReading(newReading);
          setHistoricalData((prevData) => [newReading, ...prevData].slice(0, 1000));
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('¡Suscrito a lecturas de energía en tiempo real!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error en el canal de Supabase:', err);
          if (!hasShownConnectionError) {
             toast({
                variant: 'destructive',
                title: 'Falló la conexión en tiempo real',
                description: 'No se pudo establecer una conexión en tiempo real. Revisa tus credenciales de Supabase y las políticas RLS.',
             });
             setHasShownConnectionError(true);
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (historicalData.length > 0) {
      const totalPower = historicalData.reduce(
        (acc, curr) => acc + curr.potencia_w,
        0
      );
      setAvgPower(totalPower / historicalData.length);
    }
  }, [historicalData]);
  
  const [time, setTime] = useState('N/A');

  useEffect(() => {
      if(currentReading) {
        setTime(new Date(currentReading.created_at).toLocaleTimeString());
      }
      const interval = setInterval(() => {
          if (currentReading) {
             setTime(new Date(currentReading.created_at).toLocaleTimeString());
          }
      }, 60000);
      return () => clearInterval(interval);
  }, [currentReading]);


  if (loading && isSupabaseConnected) {
    return (
      <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
        <DashboardHeader />
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      <DashboardHeader />
      <main className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <EnergyCard
            title="Última Actualización"
            value={time}
            unit=""
            icon={Clock}
          />
          
          <CostCard historicalData={historicalData} />

          <HistoryChart data={historicalData} />
        </div>
      </main>
    </div>
  );
}
