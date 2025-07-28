
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
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";


export async function uploadFileToStorage(fileDataUri: string, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadString(storageRef, fileDataUri, 'data_url');
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
}


export async function generateComparisonReportAction(
  input: GenerateComparisonReportInput
): Promise<GenerateComparisonReportOutput & { error?: string }> {
  try {
    const result = await generateComparisonReport(input);
    return result;
  } catch (e: any) {
    console.error("Error generating comparison report:", e);
    return { report: "", deviationPercentage: 0, error: e.message || "An unknown error occurred." };
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
      plagiarismFlags: [],
      error: e.message || "An unknown error occurred.",
    };
  }
}
