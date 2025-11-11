'use server';
/**
 * @fileOverview Flujo de IA para detectar anomalías en el consumo energético.
 *
 * - detectAnomaly: Analiza datos y devuelve si hay una anomalía y por qué.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { EnergyReading } from '@/types';

const AnomalyDetectionInputSchema = z.array(
  z.object({
    created_at: z.string(),
    potencia_w: z.number(),
  })
).describe("Un array de lecturas de energía para detectar anomalías.");

const AnomalyDetectionOutputSchema = z.object({
  isAnomaly: z.boolean().describe("Indica si se detectó una anomalía en el consumo."),
  reason: z.string().describe("La explicación de por qué se considera una anomalía. Vacío si no hay anomalía."),
});
export type AnomalyDetectionOutput = z.infer<typeof AnomalyDetectionOutputSchema>;


const prompt = ai.definePrompt({
  name: 'anomalyDetectionPrompt',
  input: { schema: AnomalyDetectionInputSchema },
  output: { schema: AnomalyDetectionOutputSchema },
  prompt: `Eres un sistema de detección de anomalías para el consumo de energía. Analiza la siguiente serie temporal de lecturas de potencia (en Watts).
Una anomalía puede ser un pico de consumo repentino y extremo que no sigue el patrón general, o un consumo base (mínimo) que es significativamente más alto en las lecturas más recientes en comparación con las más antiguas.

Datos de consumo: {{{jsonStringify input}}}

Analiza los datos y determina si la lectura más reciente constituye una anomalía en comparación con el resto del historial.
- Compara la última lectura con el promedio y la desviación estándar del resto de los datos.
- Un pico es anómalo si es, por ejemplo, 3 veces superior al promedio de las lecturas.
- Un consumo base elevado es anómalo si las últimas 3 lecturas son significativamente más altas que el promedio de las 10 anteriores.

Responde únicamente con el JSON especificado. Si no hay anomalía, 'isAnomaly' debe ser 'false' y 'reason' debe ser una cadena vacía. Si hay una anomalía, 'isAnomaly' debe ser 'true' y 'reason' debe explicar brevemente la causa (ej. 'Pico de consumo inesperado detectado.' o 'El consumo base parece haber aumentado considerablemente.').
`,
});

const detectAnomalyFlow = ai.defineFlow(
  {
    name: 'detectAnomalyFlow',
    inputSchema: AnomalyDetectionInputSchema,
    outputSchema: AnomalyDetectionOutputSchema,
  },
  async (readings) => {
    const { output } = await prompt(readings);
    return output!;
  }
);

export async function detectAnomaly(readings: EnergyReading[]): Promise<AnomalyDetectionOutput> {
  // Para la detección de anomalías, solo necesitamos la potencia y la fecha.
  const preparedReadings = readings.map(r => ({
      created_at: r.created_at,
      potencia_w: r.potencia_w,
  }));
  return await detectAnomalyFlow(preparedReadings);
}
