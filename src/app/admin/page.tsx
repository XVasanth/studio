
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
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { checkCadPlagiarismAction, uploadFileToStorage } from "@/lib/actions";
import type { CadFile, PlagiarismFlag, BackupFile } from "@/lib/types";
import { UploadCloud, FileText, Loader2, GitCompareArrows, CheckCircle2, XCircle, Shield, FileClock, TestTube } from "lucide-react";

// Mock data for backup files
const mockBackups: BackupFile[] = [
    { id: 'bck_001', name: 'vortex-engine-v1.step', timestamp: '2023-10-27 14:30 UTC', reportUrl: '#', checkedBy: 'admin@cad.com' },
    { id: 'bck_002', name: 'suspension-assembly-rev2.step', timestamp: '2023-10-26 11:00 UTC', reportUrl: '#', checkedBy: 'admin@cad.com' },
    { id: 'bck_003', name: 'gearbox-housing-final.step', timestamp: '2023-10-25 09:15 UTC', reportUrl: '#', checkedBy: 'admin@cad.com' },
];

const experiments = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

export default function AdminPage() {
  const [checkFiles, setCheckFiles] = useState<CadFile[]>([]);
  const [flags, setFlags] = useState<PlagiarismFlag[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileSelect =
    (setter: React.Dispatch<React.SetStateAction<any>>, isMultiple: boolean) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const fileList = Array.from(files);
      const processedFiles: CadFile[] = await Promise.all(
        fileList.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  name: file.name,
                  size: file.size,
                  dataUri: e.target?.result as string,
                });
              };
              reader.readAsDataURL(file);
            })
        )
      );

      if (isMultiple) {
        setter((prev: CadFile[]) => [...prev, ...processedFiles]);
        startTransition(async () => {
          for (const file of processedFiles) {
            try {
              const downloadUrl = await uploadFileToStorage(file.dataUri, `admins/exp-${selectedExperiment}/${file.name}`);
              toast({
                  title: "File uploaded successfully",
                  description: `File ${file.name} is saved.`,
              });
            } catch (error) {
               toast({
                    variant: "destructive",
                    title: "File upload failed",
                    description: (error as Error).message,
                });
            }
          }
        });
      } else {
        setter(processedFiles[0]);
      }
    };

  const runPlagiarismCheck = () => {
    if (!selectedExperiment) {
        toast({
            variant: "destructive",
            title: "Experiment Required",
            description: "Please select an experiment before running the check.",
        });
        return;
    }
    if (checkFiles.length < 2) {
      toast({
        variant: "destructive",
        title: "Files Required",
        description: "Please upload at least two files to check for plagiarism.",
      });
      return;
    }

    startTransition(async () => {
      const result = await checkCadPlagiarismAction({
        uploadedFileDataUris: checkFiles.map((f) => f.dataUri),
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Plagiarism Check Failed",
          description: result.error,
        });
        setFlags([]);
      } else {
        // The file names now come from the backend to ensure consistency
        setFlags(result.plagiarismFlags);
        toast({
          title: "Success",
          description: `Plagiarism check completed for Experiment ${selectedExperiment}.`,
        });
      }
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GitCompareArrows/> Plagiarism Checker</CardTitle>
            <CardDescription>
              Select an experiment and upload multiple student STEP files to check for header plagiarism.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="experiment-select-admin">Experiment Number</Label>
                <Select onValueChange={setSelectedExperiment} value={selectedExperiment}>
                    <SelectTrigger id="experiment-select-admin">
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
              <Label>Student Files</Label>
              <Input type="file" multiple onChange={handleFileSelect(setCheckFiles, true)} className="file:text-primary file:font-semibold" disabled={!selectedExperiment}/>
               {checkFiles.length > 0 && <p className="text-sm text-muted-foreground pt-1">Loaded {checkFiles.length} file(s)</p>}
            </div>
            <Button onClick={runPlagiarismCheck} disabled={isPending || !selectedExperiment} className="w-full">
              {isPending ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2" />}
              Run Check
            </Button>

            {flags.length > 0 && (
                 <div className="space-y-4 pt-4">
                    <h3 className="font-semibold text-lg">Plagiarism Report for Experiment {selectedExperiment}</h3>
                    <Accordion type="single" collapsible className="w-full">
                        {flags.map((flag, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                {flag.isFlagged ? <XCircle className="text-destructive"/> : <CheckCircle2 className="text-green-600"/>}
                                <span className="font-mono text-sm">{flag.fileName}</span>
                                <Badge variant={flag.isFlagged ? "destructive" : "secondary"}>
                                    {flag.isFlagged ? "Flagged" : "Clear"}
                                </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {flag.reason}
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileClock/> Admin File Backup</CardTitle>
                <CardDescription>
                A log of all files that have been processed and backed up.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Checked By</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockBackups.map((backup) => (
                        <TableRow key={backup.id}>
                            <TableCell className="font-medium">{backup.name}</TableCell>
                            <TableCell>{backup.timestamp}</TableCell>
                            <TableCell>{backup.checkedBy}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
