
"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { uploadFileToStorage } from "@/lib/actions";
import type { CadFile } from "@/lib/types";
import { Loader2, TestTube, FileUp, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Input } from "@/components/ui/input";

const experiments = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

export default function StudentDashboardPage() {
  const [user] = useAuthState(auth);
  const [selectedExperiment, setSelectedExperiment] = useState<string>("");
  const [submissionFile, setSubmissionFile] = useState<CadFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Mock status - in a real app, this would be fetched from a database
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'submitted' | 'processing' | 'complete'>('none');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".step") && !file.name.toLowerCase().endsWith(".stp")) {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload a .step or .stp file.",
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        setSubmissionFile({
            name: file.name,
            size: file.size,
            dataUri: e.target?.result as string,
        });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async () => {
    if (!selectedExperiment || !submissionFile || !user) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an experiment and a file to submit.",
      });
      return;
    }

    setIsUploading(true);
    startTransition(async () => {
      try {
        const path = `student-submissions/exp-${selectedExperiment}/${user.uid}/${submissionFile.name}`;
        await uploadFileToStorage(submissionFile.dataUri, path);
        toast({
          title: "Submission Successful",
          description: `Your file has been uploaded for Experiment ${selectedExperiment}.`,
        });
        setSubmissionStatus('submitted');
        setSubmissionFile(null); 
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

  const renderStatus = () => {
      switch(submissionStatus) {
          case 'submitted':
              return <div className="flex items-center text-yellow-600"><AlertCircle className="mr-2"/>Awaiting Report Generation</div>;
          case 'processing':
               return <div className="flex items-center text-blue-600"><Loader2 className="mr-2 animate-spin"/>Report is being generated...</div>;
          case 'complete':
               return <div className="flex items-center text-green-600"><CheckCircle className="mr-2"/>Report Ready</div>;
          default:
              return "Upload your submission to begin.";
      }
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Upload your work and get a detailed comparison report.</p>
      </div>

      <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
              <CardTitle>Submit Your Work</CardTitle>
              <CardDescription>Select your experiment and upload your STEP file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="experiment-select-student">Experiment Number</Label>
                <Select onValueChange={setSelectedExperiment} value={selectedExperiment}>
                    <SelectTrigger id="experiment-select-student">
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
                <Label htmlFor="submission-file">Your STEP File</Label>
                <Input id="submission-file" type="file" onChange={handleFileSelect} disabled={!selectedExperiment || isUploading} accept=".step,.stp" className="file:text-primary file:font-semibold" />
                {submissionFile && <p className="text-sm text-muted-foreground pt-1 truncate">Ready to upload: {submissionFile.name}</p>}
              </div>
              
              <Button onClick={handleFileUpload} disabled={isPending || !submissionFile || isUploading} className="w-full">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                {isUploading ? 'Submitting...' : 'Submit File'}
              </Button>

              <Card className="bg-muted/50">
                  <CardHeader>
                      <CardTitle className="text-lg">Submission Status</CardTitle>
                      <CardDescription>
                          {renderStatus()}
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button className="w-full" disabled={submissionStatus !== 'complete'}>
                          <Download className="mr-2 h-4 w-4"/>
                          Download Your Report (PDF)
                      </Button>
                  </CardContent>
              </Card>

          </CardContent>
      </Card>
    </div>
  );
}
