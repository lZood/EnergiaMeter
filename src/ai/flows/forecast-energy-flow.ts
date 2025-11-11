'use server';
/**
 * @fileOverview Flujo de IA para pronosticar el consumo y costo energético mensual.
 *
 * - forecastEnergyCost: Analiza datos históricos y la tarifa para predecir el costo a 30 días.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { EnergyReading } from '@/types';

const ForecastInputSchema = z.object({
  readingsJSON: z.string().describe("Un string JSON de un array de lecturas de energía históricas."),
  rate: z.number().describe("La tarifa actual en costo por kWh."),
});

const ForecastOutputSchema = z.object({
  forecastedCost: z
    .number()
    .describe('El costo total estimado para un período de 30 días.'),
});

const prompt = ai.definePrompt({
  name: 'energyForecastPrompt',
  input: { schema: ForecastInputSchema },
  output: { schema: ForecastOutputSchema },
  prompt: `Eres un analista de datos especializado en proyecciones de consumo energético. Tu tarea es analizar una serie de lecturas de energía y una tarifa por kWh para predecir el costo total al final de un período de 30 días.

Datos de consumo histórico: {{{readingsJSON}}}
Tarifa por kWh: {{{rate}}}

1. Calcula el consumo promedio de kWh basado en los datos proporcionados.
2. Proyecta ese consumo promedio a lo largo de 30 días.
3. Calcula el costo total estimado multiplicando los kWh proyectados por la tarifa.
4. Devuelve el resultado únicamente en el formato JSON especificado.
`,
});

const forecastEnergyFlow = ai.defineFlow(
  {
    name: 'forecastEnergyFlow',
    inputSchema: z.object({
      readings: z.array(
        z.object({
          created_at: z.string(),
          potencia_w: z.number(),
        })
      ),
      rate: z.number(),
    }),
    outputSchema: ForecastOutputSchema,
  },
  async ({ readings, rate }) => {
    const { output } = await prompt({ readingsJSON: JSON.stringify(readings), rate });
    return output!;
  }
);


export async function forecastEnergyCost(data: { readings: EnergyReading[], rate: number }): Promise<number> {
  const { readings, rate } = data;
  if (readings.length < 5) return 0;

  // Preparamos los datos para que solo contengan los campos relevantes para el prompt.
  const preparedReadings = readings.map(r => ({
      created_at: r.created_at,
      potencia_w: r.potencia_w,
  }));
  
  const result = await forecastEnergyFlow({ readings: preparedReadings, rate });
  return result.forecastedCost;
}
