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
  prompt: `Eres un analista experto en eficiencia energética. Tu tarea es analizar los siguientes datos de consumo de energía de un hogar o pequeña empresa.

Los datos están en formato JSON y contienen las siguientes claves:
- potencia_w: Potencia consumida en Watts.
- corriente_a: Corriente en Amperios.
- voltaje_v: Voltaje en Volts.
- temperatura: Temperatura ambiente en Celsius.
- humedad: Humedad relativa.
- created_at: Fecha y hora de la lectura.

Basándote en estos datos: {{{readingsJSON}}}

1.  Identifica patrones de consumo clave (ej. picos de consumo, consumo base, horarios de mayor uso).
2.  Proporciona un resumen claro y conciso del comportamiento energético.
3.  Ofrece 2-3 recomendaciones prácticas y accionables para que el usuario pueda reducir su consumo de energía y ahorrar dinero.
4.  Tu respuesta debe ser amigable, fácil de entender para alguien sin conocimientos técnicos y estar en español.
5.  Formatea tu respuesta de forma legible, usando saltos de línea.
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
