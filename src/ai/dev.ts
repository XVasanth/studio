import { config } from 'dotenv';
config();

// The plagiarism check flow is no longer needed.
// import '@/ai/flows/check-cad-plagiarism.ts';
import '@/ai/flows/generate-comparison-report.ts';
