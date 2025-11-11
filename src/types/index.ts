export type EnergyReading = {
  id: string;
  created_at: string;
  potencia_w: number; // in Watts
  corriente_a: number; // in Amps
  voltaje_v: number; // in Volts
  temperatura: number; // in Celsius
  humedad: number; // in %
};
