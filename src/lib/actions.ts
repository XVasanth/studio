
"use server";

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

    // This is inefficient for large files as it loads the whole file into memory on the server.
    // In a real-world scenario with large CAD files, you'd handle this differently,
    // possibly by passing the download URL directly to the AI service if it supports it,
    // or using a streaming approach.
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

// The old plagiarism check is no longer needed with the new workflow.
// We will add a new batch processing action here later.
