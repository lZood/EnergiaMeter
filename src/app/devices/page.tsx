"use client";

import { useState } from 'react';
import { Lightbulb, PlusCircle } from 'lucide-react';
import { DeviceCard } from '@/components/devices/device-card';
import { AddDeviceDialog } from '@/components/devices/add-device-dialog';
import { Button } from '@/components/ui/button';
import type { Device } from '@/types';

// El dispositivo inicial que representa los datos reales que se están monitoreando.
const initialDevice: Device = {
  id: 'foco-principal-cuarto',
  name: 'Foco del Cuarto',
  location: 'Hogar',
  icon: 'lightbulb',
  consumption: 18, // Consumo promedio o actual en Watts
  status: 'on',
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([initialDevice]);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleAddDevice = (newDevice: Omit<Device, 'id' | 'status'>) => {
    const fullDevice: Device = {
      ...newDevice,
      id: `sim-${Date.now()}`,
      status: 'off', // Los nuevos dispositivos simulados empiezan apagados
    };
    setDevices((prev) => [...prev, fullDevice]);
  };

  const toggleDeviceStatus = (id: string) => {
    setDevices(
      devices.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'on' ? 'off' : 'on' }
          : d
      )
    );
  };
  
    const handleRemoveDevice = (id: string) => {
    // No permitir eliminar el dispositivo principal
    if (id === 'foco-principal-cuarto') {
      alert("No se puede eliminar el dispositivo principal monitoreado.");
      return;
    }
    setDevices(devices.filter((d) => d.id !== id));
  };


  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dispositivos</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Agregar Dispositivo
        </Button>
      </div>

      <main className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onToggleStatus={toggleDeviceStatus}
              onRemove={handleRemoveDevice}
              isRealDevice={device.id === 'foco-principal-cuarto'}
            />
          ))}
        </div>
        {devices.length === 0 && (
            <div className="text-center col-span-full py-20">
                <Lightbulb className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">No hay dispositivos</h2>
                <p className="mt-2 text-muted-foreground">Añade tu primer dispositivo para empezar a monitorear.</p>
            </div>
        )}
      </main>

      <AddDeviceDialog
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onAddDevice={handleAddDevice}
      />
    </div>
  );
}
