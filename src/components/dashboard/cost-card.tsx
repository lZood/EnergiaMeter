"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EnergyReading } from '@/types';
import { DollarSign } from 'lucide-react';
import { useState, useMemo } from 'react';

interface CostCardProps {
  historicalData: EnergyReading[];
}

export function CostCard({ historicalData }: CostCardProps) {
  const [rate, setRate] = useState<number>(0.15); // Tarifa por defecto, ej. $0.15/kWh

  const { totalKWh, estimatedCost } = useMemo(() => {
    if (historicalData.length < 2) {
      return { totalKWh: 0, estimatedCost: 0 };
    }

    let totalWattSeconds = 0;
    const sortedData = [...historicalData].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (let i = 1; i < sortedData.length; i++) {
      const prev = sortedData[i - 1];
      const curr = sortedData[i];
      const timeDiffSeconds =
        (new Date(curr.created_at).getTime() -
          new Date(prev.created_at).getTime()) /
        1000;
      const avgPower = (prev.potencia_w + curr.potencia_w) / 2;
      totalWattSeconds += avgPower * timeDiffSeconds;
    }

    const totalKWh = totalWattSeconds / (3600 * 1000);
    const estimatedCost = totalKWh * rate;

    return { totalKWh, estimatedCost };
  }, [historicalData, rate]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Costo Estimado</CardTitle>
        <DollarSign className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold tracking-tight">
          ${estimatedCost.toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground">
          Basado en {totalKWh.toFixed(3)} kWh consumidos
        </p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="kwh-rate" className="text-xs">
            Tarifa ($/kWh)
          </Label>
          <Input
            id="kwh-rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            step="0.01"
            className="h-8"
          />
        </div>
      </CardContent>
    </Card>
  );
}
