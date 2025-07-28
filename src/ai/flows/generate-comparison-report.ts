
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a comparison report between two CAD models, including a deviation analysis and improvement suggestions.
 *
 * - generateComparisonReport - A function that takes two STEP file data URIs and returns a report and deviation percentage.
 * - GenerateComparisonReportInput - The input type for the generateComparisonReport function.
 * - GenerateComparisonReportOutput - The return type for the generateComparisonReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const GenerateComparisonReportInputSchema = z.object({
  baseModelDataUri: z
    .string()
    .describe(
      "The base CAD model STEP file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  modifiedModelDataUri: z
    .string()
    .describe(
      "The modified/student's CAD model STEP file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateComparisonReportInput = z.infer<
  typeof GenerateComparisonReportInputSchema
>;

const GenerateComparisonReportOutputSchema = z.object({
  report: z
    .string()
    .describe(
      'A detailed report summarizing the key geometric and property differences between the two CAD models. This should be written in markdown format. It must include actionable suggestions for the student to improve their model, framed as helpful advice.'
    ),
  deviationPercentage: z
    .number()
    .describe('The percentage of deviation of the modified model from the base model.'),
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
  model: googleAI.model('gemini-2.0-flash'),
  prompt: `You are an expert CAD model comparison tool and a helpful engineering tutor. You will analyze two STEP files to identify differences and provide constructive feedback.
  
1.  **Analyze Deviation**: Compare the student's model to the base model. Calculate a single, overall deviation percentage based on a holistic analysis of geometric differences (like Hausdorff distance, volume difference, surface area changes) and any changes in properties.
2.  **Generate Comprehensive Report**: Write a detailed report in Markdown format. Start with a summary of the findings. Then, list the key geometric and property differences you found. Conclude the report with a section titled "## Improvement Suggestions" that provides clear, actionable advice for the student to improve their model (e.g., "Consider adjusting...", "Review the dimensions of...", "Check if you have included...").

Base Model: {{media url=baseModelDataUri}}
Student's Model: {{media url=modifiedModelDataUri}}

Output a JSON object with the calculated deviation percentage and the detailed markdown report.
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
