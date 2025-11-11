export type EnergyReading = {
  id: string;
  created_at: string;
  potencia_w: number; // in Watts
  corriente_a: number; // in Amps
  voltaje_v: number; // in Volts
  temperatura: number; // in Celsius
  humedad: number; // in %
};

export type Device = {
  id: string;
  name: string;
  location: string;
  icon: 'lightbulb' | 'refrigerator' | 'tv' | 'fan' | 'ac' | 'other';
  consumption: number; // Consumo promedio en Watts
  status: 'on' | 'off';
};
