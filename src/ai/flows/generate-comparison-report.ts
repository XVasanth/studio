'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a comparison report between two CAD models, including a deviation analysis.
 *
 * - generateComparisonReport - A function that takes two STEP file data URIs and returns a report summarizing the key differences and a deviation percentage.
 * - GenerateComparisonReportInput - The input type for the generateComparisonReport function.
 * - GenerateComparisonReportOutput - The return type for the generateComparisonReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComparisonReportInputSchema = z.object({
  baseModelDataUri: z
    .string()
    .describe(
      'The base CAD model STEP file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  modifiedModelDataUri: z
    .string()
    .describe(
      'The modified CAD model STEP file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateComparisonReportInput = z.infer<
  typeof GenerateComparisonReportInputSchema
>;

const GenerateComparisonReportOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A report summarizing the key differences between the two CAD models, including potential explanations for the changes.'
    ),
  deviationPercentage: z.number().describe('The percentage of deviation of the modified model from the base model.'),
});
export type GenerateComparisonReportOutput = z.infer<
  typeof GenerateComparisonReportOutputSchema
>;

export async function generateComparisonReport(
  input: GenerateComparisonReportInput
): Promise<GenerateComparisonReportOutput> {
  return generateComparisonReportFlow(input);
}

const generateComparisonReportPrompt = ai.definePrompt({
  name: 'generateComparisonReportPrompt',
  input: {schema: GenerateComparisonReportInputSchema},
  output: {schema: GenerateComparisonReportOutputSchema},
  prompt: `You are an expert CAD model comparison tool. You will analyze two STEP files to identify differences.
  
1.  **Analyze Deviation**: Compare the student's model to the base model. Calculate a deviation percentage based on metrics like Hausdorff distance, volume difference, and surface area changes.
2.  **Generate Report**: Summarize the key geometric and property differences.

Base Model: {{media url=baseModelDataUri}}
Modified Model: {{media url=modifiedModelDataUri}}

Output a JSON object with the deviation percentage and a detailed report.
`,
});

const generateComparisonReportFlow = ai.defineFlow(
  {
    name: 'generateComparisonReportFlow',
    inputSchema: GenerateComparisonReportInputSchema,
    outputSchema: GenerateComparisonReportOutputSchema,
  },
  async input => {
    const {output} = await generateComparisonReportPrompt(input);
    return output!;
  }
);
