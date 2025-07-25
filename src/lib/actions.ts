"use server";

import {
  checkCadPlagiarism,
  type CheckCadPlagiarismInput,
  type CheckCadPlagiarismOutput,
} from "@/ai/flows/check-cad-plagiarism";
import {
  generateComparisonReport,
  type GenerateComparisonReportInput,
  type GenerateComparisonReportOutput,
} from "@/ai/flows/generate-comparison-report";

export async function generateComparisonReportAction(
  input: GenerateComparisonReportInput
): Promise<GenerateComparisonReportOutput & { error?: string }> {
  try {
    const result = await generateComparisonReport(input);
    return result;
  } catch (e: any) {
    console.error("Error generating comparison report:", e);
    return { report: "", error: e.message || "An unknown error occurred." };
  }
}

export async function checkCadPlagiarismAction(
  input: CheckCadPlagiarismInput
): Promise<CheckCadPlagiarismOutput & { error?: string }> {
  try {
    const result = await checkCadPlagiarism(input);
    return result;
  } catch (e: any) {
    console.error("Error checking for plagiarism:", e);
    return {
      plagiarismReports: [],
      error: e.message || "An unknown error occurred.",
    };
  }
}
