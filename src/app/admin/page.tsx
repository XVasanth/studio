
"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { uploadFileToStorage } from "@/lib/actions";
import type { CadFile } from "@/lib/types";
import { UploadCloud, Loader2, TestTube, Download, BarChart3, Users } from "lucide-react";

// Mock data for student submissions - this would be fetched from your database
const mockSubmissions = [
  { studentId: "user_1", studentName: "Alice Johnson", fileName: "project-v1.step", deviation: 2.1, reportUrl: "#" },
  { studentId: "user_2", studentName: "Bob Williams", fileName: "design-final.step", deviation: 12.5, reportUrl: "#" },
  { studentId: "user_3", studentName: "Charlie Brown", fileName: "assembly-rev2.step", deviation: 4.8, reportUrl: "#" },
];

const experiments = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

export default function AdminPage() {
  const [selectedExperiment, setSelectedExperiment] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const [baseModelFile, setBaseModelFile] = useState<CadFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBaseModelSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setBaseModelFile({
        name: file.name,
        size: file.size,
        dataUri: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };
    
  const handleBaseModelUpload = () => {
    if (!selectedExperiment) {
        toast({ variant: "destructive", title: "Experiment Required", description: "Please select an experiment for the base model." });
        return;
    }
    if (!baseModelFile || !baseModelFile.dataUri) {
        toast({ variant: "destructive", title: "File Required", description: "Please choose a STEP file to upload." });
        return;
    }

    setIsUploading(true);
    startTransition(async () => {
        try {
            const path = `base-models/exp-${selectedExperiment}/base-model.step`;
            await uploadFileToStorage(baseModelFile.dataUri, path);
            toast({
                title: "Base Model Uploaded",
                description: `Successfully uploaded base model for Experiment ${selectedExperiment}.`,
            });
            setBaseModelFile(null); // Clear file after upload
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: (error as Error).message,
            });
        } finally {
            setIsUploading(false);
        }
    });
  };

  const handleRunChecks = () => {
    if (!selectedExperiment) {
        toast({ variant: "destructive", title: "Experiment Required", description: "Please select an experiment to run checks on." });
        return;
    }
    setIsGenerating(true);
    toast({ title: "Processing...", description: `Generating reports for Experiment ${selectedExperiment}. This may take a moment.`});
    startTransition(async() => {
        // TODO: Implement the backend action to run all comparisons
        console.log(`Running checks for experiment ${selectedExperiment}`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async work
        toast({ title: "Reports Generated", description: `All reports for Experiment ${selectedExperiment} are ready.`});
        setIsGenerating(false);
    });
  };


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold">Admin Tools</h1>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column for actions */}
        <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UploadCloud/> Upload Base Model</CardTitle>
                    <CardDescription>Upload the master STEP file for an experiment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="experiment-select-upload">Experiment Number</Label>
                        <Select onValueChange={setSelectedExperiment} value={selectedExperiment}>
                            <SelectTrigger id="experiment-select-upload">
                                <div className="flex items-center gap-2">
                                    <TestTube className="w-4 h-4 text-muted-foreground"/>
                                    <SelectValue placeholder="Select an experiment..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {experiments.map((exp) => (
                                    <SelectItem key={exp} value={exp}>Experiment {exp}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Base Model File (.step, .stp)</Label>
                        <Input type="file" onChange={handleBaseModelSelect} className="file:text-primary file:font-semibold" disabled={!selectedExperiment || isUploading} accept=".step,.stp"/>
                        {baseModelFile && <p className="text-sm text-muted-foreground pt-1 truncate">Loaded: {baseModelFile.name}</p>}
                    </div>
                    <Button onClick={handleBaseModelUpload} disabled={isPending || !selectedExperiment || !baseModelFile || isUploading} className="w-full">
                        {isUploading ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />}
                        {isUploading ? 'Uploading...' : 'Upload Base Model'}
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Right column for experiment details */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2"><Users/> Experiment Submissions</CardTitle>
              <CardDescription>
                Review student submissions and generate reports for the selected experiment.
              </CardDescription>
            </div>
            <Button onClick={handleRunChecks} disabled={isPending || !selectedExperiment || isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <BarChart3 className="mr-2" />}
                Run Checks
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedExperiment ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <p>Please select an experiment to view submissions.</p>
                </div>
            ) : (
                <>
                <div className="flex justify-end">
                    <Button variant="outline" disabled={isPending || isGenerating}>
                        <Download className="mr-2" />
                        Download Consolidated Report (PDF)
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Deviation (%)</TableHead>
                        <TableHead className="text-right">Individual Report</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockSubmissions.map((sub) => (
                        <TableRow key={sub.studentId}>
                            <TableCell className="font-medium">{sub.studentName}</TableCell>
                            <TableCell>{sub.fileName}</TableCell>
                            <TableCell className="font-mono">{sub.deviation.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" disabled={isPending}>
                                    <Download className="mr-2 h-4 w-4"/>
                                    PDF
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
