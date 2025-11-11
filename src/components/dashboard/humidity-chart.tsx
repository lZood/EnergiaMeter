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

interface HumidityChartProps {
  data: EnergyReading[];
}

const chartConfig = {
  humedad: {
    label: 'Humedad (%)',
    color: 'hsl(var(--chart-1))',
  },
};

export function HumidityChart({ data }: HumidityChartProps) {
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
        <CardTitle>Historial de Humedad</CardTitle>
        <CardDescription>
          Humedad relativa registrada durante el último período.
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
                domain={['dataMin - 5', 'dataMax + 5']}
                label={{ value: '%', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle', fontSize: '10px' } }}
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
                <linearGradient id="fillHumidity" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-humedad)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-humedad)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="humedad"
                stroke="var(--color-humedad)"
                fillOpacity={1}
                fill="url(#fillHumidity)"
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
