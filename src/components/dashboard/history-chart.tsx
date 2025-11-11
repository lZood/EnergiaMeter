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
  power: {
    label: 'Power (W)',
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
    <Card className="col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4">
      <CardHeader>
        <CardTitle>Consumption History</CardTitle>
        <CardDescription>
          Energy consumption over the last fetched period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formattedData.length > 1 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
                fontSize={12}
                tickFormatter={(value) => `${value}`}
                label={{ value: 'Watts', angle: -90, position: 'insideLeft', offset: 10, style: { textAnchor: 'middle' } }}
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
                    stopColor="var(--color-power)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-power)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="power"
                stroke="var(--color-power)"
                fillOpacity={1}
                fill="url(#fillPower)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center rounded-md border border-dashed bg-muted/50">
            <p className="text-muted-foreground">
              Waiting for more data to display chart...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
