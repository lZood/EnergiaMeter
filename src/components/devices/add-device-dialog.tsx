"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Device } from '@/types';

interface AddDeviceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddDevice: (newDevice: Omit<Device, 'id' | 'status'>) => void;
}

export function AddDeviceDialog({ isOpen, onOpenChange, onAddDevice }: AddDeviceDialogProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [icon, setIcon] = useState<Device['icon']>('other');
  const [consumption, setConsumption] = useState(0);

  const handleSubmit = () => {
    if (!name || !location || consumption <= 0) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    onAddDevice({ name, location, icon, consumption });
    onOpenChange(false);
    // Reset form
    setName('');
    setLocation('');
    setIcon('other');
    setConsumption(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Dispositivo</DialogTitle>
          <DialogDescription>
            Añade un dispositivo simulado para monitorear su consumo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="Ej. Refrigerador" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Ubicación
            </Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" placeholder="Ej. Cocina" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="consumption" className="text-right">
              Consumo (W)
            </Label>
            <Input id="consumption" type="number" value={consumption} onChange={(e) => setConsumption(Number(e.target.value))} className="col-span-3" placeholder="Ej. 150"/>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="icon" className="text-right">
              Icono
            </Label>
             <Select value={icon} onValueChange={(value) => setIcon(value as Device['icon'])}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un icono" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="lightbulb">Bombilla</SelectItem>
                    <SelectItem value="fridge">Refrigerador</SelectItem>
                    <SelectItem value="tv">Televisión</SelectItem>
                    <SelectItem value="fan">Ventilador</SelectItem>
                    <SelectItem value="ac">Aire Acondicionado</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Guardar Dispositivo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
