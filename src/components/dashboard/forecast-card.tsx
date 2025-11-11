"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';

interface ForecastCardProps {
  cost: number;
  isLoading: boolean;
  lastUpdated: string | null;
}

export function ForecastCard({ cost, isLoading, lastUpdated }: ForecastCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pronóstico Mensual</CardTitle>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2 pt-2">
            <Skeleton className="h-8 w-2/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <>
            <div className="text-4xl font-bold tracking-tight">
              ${cost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastUpdated ? `Actualizado a las ${lastUpdated}` : 'Costo estimado para 30 días.'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
