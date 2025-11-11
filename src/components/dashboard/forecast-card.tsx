"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ForecastCardProps {
  cost: number;
  isLoading: boolean;
}

export function ForecastCard({ cost, isLoading }: ForecastCardProps) {
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
      <CardContent className="flex-1 pt-2">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : (
          <>
            <div className="text-4xl font-bold tracking-tight">
              ${cost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimación de costo para el mes actual.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
