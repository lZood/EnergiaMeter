"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { EnergyReading } from '@/types';
import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface HistoryChartProps {
  data: EnergyReading[];
}

const chartConfig = {
  potencia_w: {
    label: 'Potencia (W)',
    color: 'hsl(var(--accent))',
  },
};

export function HistoryChart({ data }: HistoryChartProps) {
  const formattedData = useMemo(() => {
    return data
      .map((reading) => ({
        ...reading,
        time: new Date(reading.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Consumo</CardTitle>
        <CardDescription>
          Consumo de energía durante el último período obtenido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formattedData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
                tickFormatter={(value) => `${value}`}
                label={{ value: 'Watts', angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle', fontSize: '10px' } }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(_, payload) => `${payload[0]?.payload.time}`}
                  />
                }
              />
              <defs>
                <linearGradient id="fillPower" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-potencia_w)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-potencia_w)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="potencia_w"
                stroke="var(--color-potencia_w)"
                fillOpacity={1}
                fill="url(#fillPower)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center rounded-md border border-dashed bg-muted/50">
            <p className="text-muted-foreground">
              Esperando más datos para mostrar el gráfico...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
