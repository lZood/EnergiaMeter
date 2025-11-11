"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Refrigerator, Tv, Fan, AirVent, SlidersHorizontal, Power, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Device } from '@/types';

interface DeviceCardProps {
  device: Device;
  onToggleStatus: (id: string) => void;
  onRemove: (id: string) => void;
  isRealDevice: boolean;
}

const iconMap = {
  lightbulb: Lightbulb,
  refrigerator: Refrigerator,
  tv: Tv,
  fan: Fan,
  ac: AirVent,
  other: SlidersHorizontal,
};

export function DeviceCard({ device, onToggleStatus, onRemove, isRealDevice }: DeviceCardProps) {
  const Icon = iconMap[device.icon];
  const isOn = device.status === 'on';

  return (
    <Card className={cn("flex flex-col justify-between", isOn && "bg-accent/10")}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold">{device.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{device.location}</p>
        </div>
        <Icon className={cn("h-7 w-7", isOn ? "text-accent" : "text-muted-foreground")} />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold">
            {isOn ? device.consumption : '0'}
          </p>
          <span className="text-muted-foreground">Watts</span>
        </div>
        {isRealDevice && <Badge variant="outline" className="mt-2">Monitoreo Real</Badge>}
        {!isRealDevice && <Badge variant="secondary" className="mt-2">Simulado</Badge>}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <Power className="h-4 w-4 text-muted-foreground"/>
            <Switch
                checked={isOn}
                onCheckedChange={() => onToggleStatus(device.id)}
                aria-label={`Toggle ${device.name}`}
            />
        </div>
        {!isRealDevice && (
             <Button variant="ghost" size="icon" onClick={() => onRemove(device.id)}>
                <Trash2 className="h-4 w-4 text-destructive/70"/>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
