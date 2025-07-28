
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

export async function getBaseModelForExperiment(experiment: string): Promise<{ dataUri: string; name: string; size: number } | null> {
  try {
    const path = `base-models/exp-${experiment}/base-model.step`;
    const storageRef = ref(storage, path);
    const downloadUrl = await getDownloadURL(storageRef);

    // Fetch the file from the URL
    const response = await fetch(downloadUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch base model from ${downloadUrl}`);
    }
    const blob = await response.blob();
    const size = blob.size;
    const name = `base-model-experiment-${experiment}.step`;

    // Convert blob to data URI
    const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    return { dataUri, name, size };
  } catch (error: any) {
    // If the file doesn't exist, it will throw an error. We can treat this as "no base model".
    if (error.code === 'storage/object-not-found') {
        console.log(`No base model found for experiment ${experiment}.`);
        return null;
    }
    console.error("Error getting base model:", error);
    return null;
  }
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
