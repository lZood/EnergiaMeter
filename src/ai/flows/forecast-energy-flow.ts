'use server';
/**
 * @fileOverview Flujo de IA para pronosticar el costo energético mensual.
 *
 * - forecastEnergyCost: Calcula el costo proyectado para 30 días.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { EnergyReading } from '@/types';

const ForecastInputSchema = z.object({
  readings: z.array(
    z.object({
      created_at: z.string(),
      potencia_w: z.number(),
    })
  ),
  rate: z.number().describe('La tarifa de costo por kWh en la moneda local.'),
});

const prompt = ai.definePrompt({
  name: 'energyForecasterPrompt',
  input: { schema: ForecastInputSchema },
  output: { format: 'json' },
  prompt: `Eres un analista de datos especializado en consumo energético. Te proporcionaré una serie de lecturas de potencia (en vatios) de un período de tiempo parcial dentro de un mes.

Tu tarea es:
1. Analizar el patrón de consumo de los datos proporcionados.
2. Estimar el consumo total de energía en kWh para un mes completo de 30 días.
3. Calcular el costo monetario total estimado para esos 30 días, utilizando la tarifa de $/kWh que te proporciono.

Devuelve únicamente un objeto JSON con la clave "forecastedCost", que contenga el valor numérico del costo total mensual estimado. No incluyas unidades ni texto adicional.

Datos de consumo: {{{jsonStringify readings}}}
Tarifa: {{{rate}}} $/kWh
`,
});

const forecastEnergyFlow = ai.defineFlow(
  {
    name: 'forecastEnergyFlow',
    inputSchema: ForecastInputSchema,
    outputSchema: z.number(),
  },
  async ({ readings, rate }) => {
    // La IA es más efectiva con una cantidad razonable de datos.
    const limitedReadings = readings.slice(-1000); // Usar las últimas 1000 lecturas

    const { output } = await prompt({
      readings: limitedReadings,
      rate,
    });
    
    if (!output) {
      throw new Error("La IA no generó una respuesta.");
    }
    
    // Asumimos que la IA devuelve un JSON como { "forecastedCost": 123.45 }
    return output.forecastedCost;
  }
);

export async function forecastEnergyCost(input: {
  readings: EnergyReading[];
  rate: number;
}): Promise<number> {
  // Preparamos los datos, enviando solo lo necesario a la IA.
  const preparedReadings = input.readings.map((r) => ({
    created_at: r.created_at,
    potencia_w: r.potencia_w,
  }));

  return await forecastEnergyFlow({
    readings: preparedReadings,
    rate: input.rate,
  });
}
