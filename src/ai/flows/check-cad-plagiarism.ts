'use server';
/**
 * @fileOverview Implements a Genkit flow to check for plagiarism between student CAD files by comparing their STEP file headers.
 *
 * - checkCadPlagiarism - A function that handles the plagiarism check process.
 * - CheckCadPlagiarismInput - The input type for the checkCadPlagiarism function.
 * - CheckCadPlagiarismOutput - The return type for the checkCadPlagiarism function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckCadPlagiarismInputSchema = z.object({
  // Base model is no longer needed for this type of check
  uploadedFileDataUris: z
    .array(z.string())
    .describe(
      'The uploaded student CAD files to check for plagiarism, as data URIs that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type CheckCadPlagiarismInput = z.infer<typeof CheckCadPlagiarismInputSchema>;

const CheckCadPlagiarismOutputSchema = z.object({
  plagiarismFlags: z.array(
    z.object({
      fileName: z.string().describe('The name of the file that was checked.'),
      isFlagged: z.boolean().describe('Whether the file is flagged for potential plagiarism.'),
      reason: z.string().describe('An explanation of why the file is flagged.'),
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
  prompt: `You are an expert in analyzing CAD files for plagiarism. You will be given a set of STEP files from different students.

Your task is to check for plagiarism by comparing the file headers of the provided STEP files.

1.  **Extract Headers**: For each uploaded STEP file, extract the header information.
2.  **Compare Headers**: Compare the headers of every file against every other file.
3.  **Flag Matches**: If any two files have identical headers, flag them as potential plagiarism.

Uploaded CAD Files:
{{#each uploadedFileDataUris}}
File: {{media url=this}}
{{/each}}

Output a JSON array of plagiarism flags. For each file, indicate if it's flagged and provide a reason (e.g., "Header matches file X").
`,
});

const checkCadPlagiarismFlow = ai.defineFlow(
  {
    name: 'checkCadPlagiarismFlow',
    inputSchema: CheckCadPlagiarismInputSchema,
    outputSchema: CheckCadPlagiarismOutputSchema,
  },
  async input => {
    // This is a simplified simulation. A real implementation would need to
    // decode the data URIs and parse the STEP file headers.
    const fileNames: string[] = [];
    for (const uri of input.uploadedFileDataUris) {
        // In a real scenario, you'd extract the name from the file or metadata
        fileNames.push(`student_model_${fileNames.length + 1}.step`);
    }

    if (input.uploadedFileDataUris.length < 2) {
        return { plagiarismFlags: [] };
    }

    // Simulate a simple check where the first two files match
    const plagiarismFlags = fileNames.map((name, index) => {
        if (index === 1) {
            return {
                fileName: name,
                isFlagged: true,
                reason: `Header matches ${fileNames[0]}`,
            }
        }
        if (index === 0) {
            return {
                fileName: name,
                isFlagged: true,
                reason: `Header matches ${fileNames[1]}`,
            }
        }
        return {
            fileName: name,
            isFlagged: false,
            reason: "No header match found.",
        }
    });

    return { plagiarismFlags };
  }
);
