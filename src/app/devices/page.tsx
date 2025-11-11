import { Cpu } from 'lucide-react';

export default function DevicesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4 text-center">
      <Cpu className="w-24 h-24 mb-4 text-muted-foreground" />
      <h1 className="text-2xl font-bold mb-2">Sección de Dispositivos</h1>
      <p className="text-muted-foreground max-w-md">
        Esta área está en construcción. Próximamente podrás gestionar y monitorear tus dispositivos conectados desde aquí.
      </p>
    </div>
  );
}
