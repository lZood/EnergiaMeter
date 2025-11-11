"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { EnergyReading } from '@/types';
import { Zap, Clock, TrendingUp } from 'lucide-react';
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
    power: Math.floor(Math.random() * 200 + 50 + Math.sin(i / 5) * 30),
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

  useEffect(() => {
    const checkSupabaseConnection = () => {
        return process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    };

    if (!checkSupabaseConnection()) {
        toast({
            variant: 'destructive',
            title: 'Supabase Not Configured',
            description: 'Please set up your Supabase credentials. Using mock data.',
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
        .from('energy_readings')
        .select('*')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching initial data:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to fetch data',
          description: 'Check your Supabase connection and table name. Using mock data.',
        });
        setHistoricalData(MOCK_HISTORICAL_DATA);
        setCurrentReading(MOCK_HISTORICAL_DATA[MOCK_HISTORICAL_DATA.length - 1]);
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
      .channel('energy_readings_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'energy_readings' },
        (payload) => {
          const newReading = payload.new as EnergyReading;
          setCurrentReading(newReading);
          setHistoricalData((prevData) => [newReading, ...prevData].slice(0, 1000)); // Keep last 1000 points
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to real-time energy readings!');
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          // It might fail silently if creds are wrong.
          // Let's check if we have received any data. If not, show a toast.
          setTimeout(() => {
            if (historicalData.length === 0 && !currentReading) {
                 toast({
                    variant: 'destructive',
                    title: 'Real-time connection failed',
                    description: 'Could not establish a real-time connection. Check your Supabase credentials and RLS policies.',
                 });
            }
          }, 3000)
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast, isSupabaseConnected, historicalData.length, currentReading]);

  useEffect(() => {
    if (historicalData.length > 0) {
      const totalPower = historicalData.reduce(
        (acc, curr) => acc + curr.power,
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
            title="Current Power"
            value={currentReading ? currentReading.power.toFixed(0) : '0'}
            unit="W"
            icon={Zap}
            iconClassName="text-accent"
          />
          <EnergyCard
            title="Average Power"
            value={avgPower.toFixed(0)}
            unit="W"
            icon={TrendingUp}
          />
          <EnergyCard
            title="Last Updated"
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
