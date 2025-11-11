"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TrendingUp, Sparkles, Wand2 } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ForecastCardProps {
  cost: number;
  isLoading: boolean;
  lastUpdated: string | null;
  onForecast: () => void;
}

export function ForecastCard({ cost, isLoading, lastUpdated, onForecast }: ForecastCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
            <CardTitle className="text-sm font-medium">Pronóstico Mensual</CardTitle>
            <Badge variant="outline" className="mt-2 text-xs font-normal">
              <Sparkles className="h-3 w-3 mr-1 text-primary"/>
              Hecho con IA
            </Badge>
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1">
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
              {lastUpdated ? `Última actualización: ${lastUpdated}` : 'Costo estimado para 30 días.'}
            </p>
          </>
        )}
      </CardContent>
      <CardFooter>
         <Button onClick={onForecast} disabled={isLoading} className="w-full">
            {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
            ) : (
                <Wand2 className="mr-2 h-4 w-4"/>
            )}
            {isLoading ? 'Calculando...' : 'Calcular Pronóstico'}
        </Button>
      </CardFooter>
    </Card>
  );
}
