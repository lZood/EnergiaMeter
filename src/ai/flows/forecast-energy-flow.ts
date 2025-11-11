'use server';
/**
 * @fileOverview Flujo de IA para pronosticar el costo energético mensual.
 *
 * - forecastEnergyCost: Calcula el costo proyectado para 30 días.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { EnergyReading } from '@/types';

// Esquema de entrada para el prompt de la IA. Espera un string JSON.
const ForecastPromptInputSchema = z.object({
  readingsJSON: z.string().describe("Un string JSON de lecturas de energía."),
  rate: z.number().describe('La tarifa de costo por kWh en la moneda local.'),
});

// Esquema de entrada para el flujo principal, más amigable para usar desde JS.
const ForecastFlowInputSchema = z.object({
  readings: z.array(z.object({
    created_at: z.string(),
    potencia_w: z.number(),
  })),
  rate: z.number(),
});

// El prompt que se envía a la IA.
const prompt = ai.definePrompt({
  name: 'energyForecasterPrompt',
  input: { schema: ForecastPromptInputSchema },
  output: { schema: z.object({ forecastedCost: z.number() }) },
  prompt: `Eres un analista de datos especializado en consumo energético. Te proporcionaré una serie de lecturas de potencia (en vatios) de un período de tiempo parcial dentro de un mes.

Tu tarea es:
1. Analizar el patrón de consumo de los datos proporcionados.
2. Estimar el consumo total de energía en kWh para un mes completo de 30 días.
3. Calcular el costo monetario total estimado para esos 30 días, utilizando la tarifa de $/kWh que te proporciono.

Devuelve únicamente un objeto JSON con la clave "forecastedCost", que contenga el valor numérico del costo total mensual estimado. No incluyas unidades ni texto adicional.

Datos de consumo: {{{readingsJSON}}}
Tarifa: {{{rate}}} $/kWh
`,
});

// El flujo de Genkit que orquesta la llamada a la IA.
const forecastEnergyFlow = ai.defineFlow(
  {
    name: 'forecastEnergyFlow',
    inputSchema: ForecastFlowInputSchema,
    outputSchema: z.number(),
  },
  async ({ readings, rate }) => {
    // La IA es más efectiva con una cantidad razonable de datos.
    const limitedReadings = readings.slice(-1000); // Usar las últimas 1000 lecturas

    // Llamamos al prompt, convirtiendo las lecturas a un string JSON.
    const { output } = await prompt({
      readingsJSON: JSON.stringify(limitedReadings),
      rate,
    });
    
    if (!output) {
      throw new Error("La IA no generó una respuesta.");
    }
    
    // Devolvemos solo el número, que es lo que el cliente espera.
    return output.forecastedCost;
  }
);

// Función exportada que el cliente llamará.
export async function forecastEnergyCost(input: {
  readings: EnergyReading[];
  rate: number;
}): Promise<number> {
  // Preparamos los datos, enviando solo lo necesario a la IA para mantener el prompt limpio.
  const preparedReadings = input.readings.map((r) => ({
    created_at: r.created_at,
    potencia_w: r.potencia_w,
  }));

  // Llamamos al flujo con los datos preparados.
  return await forecastEnergyFlow({
    readings: preparedReadings,
    rate: input.rate,
  });
}
