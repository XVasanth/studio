'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a comparison report between two CAD models.
 *
 * - generateComparisonReport - A function that takes two STEP file data URIs and returns a report summarizing the key differences.
 * - GenerateComparisonReportInput - The input type for the generateComparisonReport function.
 * - GenerateComparisonReportOutput - The return type for the generateComparisonReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComparisonReportInputSchema = z.object({
  baseModelDataUri: z
    .string()
    .describe(
      'The base CAD model STEP file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
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
  prompt: `You are an expert CAD model comparison tool. You will generate a report summarizing the key differences between two CAD models. Consider possible reasons for design choices and changes.

Base Model: {{media url=baseModelDataUri}}
Modified Model: {{media url=modifiedModelDataUri}}

Report:
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
