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
import { useToast } from "@/hooks/use-toast";
import { checkCadPlagiarismAction } from "@/lib/actions";
import type { CadFile, PlagiarismReportItem, BackupFile } from "@/lib/types";
import { UploadCloud, FileText, Loader2, GitCompareArrows, CheckCircle2, XCircle, Shield, FileClock } from "lucide-react";

// Mock data for backup files
const mockBackups: BackupFile[] = [
    { id: 'bck_001', name: 'vortex-engine-v1.step', timestamp: '2023-10-27 14:30 UTC', reportUrl: '#', checkedBy: 'admin@cad.com' },
    { id: 'bck_002', name: 'suspension-assembly-rev2.step', timestamp: '2023-10-26 11:00 UTC', reportUrl: '#', checkedBy: 'admin@cad.com' },
    { id: 'bck_003', name: 'gearbox-housing-final.step', timestamp: '2023-10-25 09:15 UTC', reportUrl: '#', checkedBy: 'admin@cad.com' },
];


export default function AdminPage() {
  const [baseModel, setBaseModel] = useState<CadFile | null>(null);
  const [checkFiles, setCheckFiles] = useState<CadFile[]>([]);
  const [reports, setReports] = useState<PlagiarismReportItem[]>([]);
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
      } else {
        setter(processedFiles[0]);
      }
    };

  const runPlagiarismCheck = () => {
    if (!baseModel) {
      toast({
        variant: "destructive",
        title: "Base Model Required",
        description: "Please upload a base model to compare against.",
      });
      return;
    }
    if (checkFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Files Required",
        description: "Please upload files to check for plagiarism.",
      });
      return;
    }

    startTransition(async () => {
      const result = await checkCadPlagiarismAction({
        baseModelDataUri: baseModel.dataUri,
        uploadedFileDataUris: checkFiles.map((f) => f.dataUri),
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Plagiarism Check Failed",
          description: result.error,
        });
        setReports([]);
      } else {
        const reportItems = result.plagiarismReports.map((report, index) => ({
          ...report,
          fileName: checkFiles[index].name,
        }));
        setReports(reportItems);
        toast({
          title: "Success",
          description: "Plagiarism check completed.",
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
              Upload a base model and one or more files to check for plagiarism.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Base Model</Label>
              <Input type="file" onChange={handleFileSelect(setBaseModel, false)} className="file:text-primary file:font-semibold"/>
              {baseModel && <p className="text-sm text-muted-foreground pt-1">Loaded: {baseModel.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Files to Check</Label>
              <Input type="file" multiple onChange={handleFileSelect(setCheckFiles, true)} className="file:text-primary file:font-semibold"/>
               {checkFiles.length > 0 && <p className="text-sm text-muted-foreground pt-1">Loaded {checkFiles.length} file(s)</p>}
            </div>
            <Button onClick={runPlagiarismCheck} disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2" />}
              Run Check
            </Button>

            {reports.length > 0 && (
                 <div className="space-y-4 pt-4">
                    <h3 className="font-semibold text-lg">Plagiarism Report</h3>
                    <Accordion type="single" collapsible className="w-full">
                        {reports.map((report, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-4">
                                {report.isPlagiarized ? <XCircle className="text-destructive"/> : <CheckCircle2 className="text-green-600"/>}
                                <span className="font-mono text-sm">{report.fileName}</span>
                                <Badge variant={report.isPlagiarized ? "destructive" : "secondary"}>
                                    Similarity: {(report.similarityScore * 100).toFixed(1)}%
                                </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {report.explanation}
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
