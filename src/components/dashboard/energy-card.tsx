import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EnergyCardProps {
  title: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

export function EnergyCard({
  title,
  value,
  unit,
  icon: Icon,
  className,
  iconClassName,
}: EnergyCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-5 w-5 text-muted-foreground', iconClassName)} />
      </CardHeader>
      <CardContent className="flex flex-1 items-end">
        <div>
          <span className="text-4xl font-bold tracking-tight">{value}</span>
          {unit && (
            <span className="ml-2 text-xl text-muted-foreground">{unit}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
