'use server';
/**
 * @fileOverview Implements a Genkit flow to check CAD files for plagiarism against a base model.
 *
 * - checkCadPlagiarism - A function that handles the plagiarism check process.
 * - CheckCadPlagiarismInput - The input type for the checkCadPlagiarism function.
 * - CheckCadPlagiarismOutput - The return type for the checkCadPlagiarism function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckCadPlagiarismInputSchema = z.object({
  baseModelDataUri: z
    .string()
    .describe(
      "The base CAD model, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  uploadedFileDataUris: z
    .array(z.string())
    .describe(
      'The uploaded CAD files to check for plagiarism, as data URIs that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'    ),
});
export type CheckCadPlagiarismInput = z.infer<typeof CheckCadPlagiarismInputSchema>;

const CheckCadPlagiarismOutputSchema = z.object({
  plagiarismReports: z.array(
    z.object({
      fileDataUri: z.string().describe('The data URI of the file that was checked.'),
      isPlagiarized: z.boolean().describe('Whether the file is plagiarized or not.'),
      similarityScore: z.number().describe('A score indicating the similarity to the base model.'),
      explanation: z.string().describe('An explanation of why the file is considered plagiarized.'),
    })
  ),
});
export type CheckCadPlagiarismOutput = z.infer<typeof CheckCadPlagiarismOutputSchema>;

export async function checkCadPlagiarism(input: CheckCadPlagiarismInput): Promise<CheckCadPlagiarismOutput> {
  return checkCadPlagiarismFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkCadPlagiarismPrompt',
  input: {schema: CheckCadPlagiarismInputSchema},
  output: {schema: CheckCadPlagiarismOutputSchema},
  prompt: `You are an expert in analyzing CAD models for plagiarism.

You are given a base CAD model and a set of uploaded CAD files.
You will analyze each uploaded file to determine if it is plagiarized from the base model.

For each uploaded file, you will provide:
- Whether the file is plagiarized or not (isPlagiarized).
- A similarity score indicating the degree of plagiarism (similarityScore).
- An explanation of why the file is considered plagiarized (explanation).

Base CAD Model: {{media url=baseModelDataUri}}

Uploaded CAD Files:
{{#each uploadedFileDataUris}}
File: {{media url=this}}
{{/each}}

Output a JSON array of plagiarism reports for each uploaded file.
`,
});

const checkCadPlagiarismFlow = ai.defineFlow(
  {
    name: 'checkCadPlagiarismFlow',
    inputSchema: CheckCadPlagiarismInputSchema,
    outputSchema: CheckCadPlagiarismOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
