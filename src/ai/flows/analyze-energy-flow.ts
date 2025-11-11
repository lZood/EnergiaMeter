'use server';
/**
 * @fileOverview Flujo de IA para analizar el consumo energético y dar recomendaciones.
 *
 * - analyzeEnergyConsumption: Analiza datos históricos y devuelve consejos.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { EnergyReading } from '@/types';

const AnalyzeEnergyInputSchema = z.object({
    readingsJSON: z.string().describe("Un string JSON de un array de lecturas de energía históricas."),
});

const prompt = ai.definePrompt({
  name: 'energyAnalystPrompt',
  input: { schema: AnalyzeEnergyInputSchema },
  output: { format: 'text' },
  prompt: `Eres un analista experto en eficiencia energética. Analiza los siguientes datos de consumo: {{{readingsJSON}}}.
Tu respuesta debe ser extremadamente concisa, en español y no superar los 500 caracteres en total.

1.  Proporciona un resumen muy breve (una sola frase) del comportamiento energético.
2.  Ofrece 1 o 2 recomendaciones prácticas y muy breves para ahorrar energía.
3.  Usa un tono directo y amigable. No uses listas, solo párrafos cortos.
`,
});

const analyzeEnergyFlow = ai.defineFlow(
  {
    name: 'analyzeEnergyFlow',
    inputSchema: z.array(
      z.object({
        created_at: z.string(),
        potencia_w: z.number(),
        corriente_a: z.number(),
        voltaje_v: z.number(),
        temperatura: z.number(),
        humedad: z.number(),
      })
    ),
    outputSchema: z.string(),
  },
  async (readings) => {
    const { output } = await prompt({ readingsJSON: JSON.stringify(readings) });
    return output!;
  }
);

export async function analyzeEnergyConsumption(readings: EnergyReading[]): Promise<string> {
  // Aseguramos que solo se envíen los campos relevantes a la IA
  const preparedReadings = readings.map(r => ({
      created_at: r.created_at,
      potencia_w: r.potencia_w,
      corriente_a: r.corriente_a,
      voltaje_v: r.voltaje_v,
      temperatura: r.temperatura,
      humedad: r.humedad
  }));
  return await analyzeEnergyFlow(preparedReadings);
}
