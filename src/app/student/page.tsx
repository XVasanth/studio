
"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateComparisonReportAction, uploadFileToStorage, getBaseModelForExperiment } from "@/lib/actions";
import { cn } from "@/lib/utils";
import ModelViewer from "@/components/ModelViewer";
import type { CadFile, ModelProperties } from "@/lib/types";
import { Highlighter, Loader2, Bot, Percent, TestTube, Info } from "lucide-react";

const initialProperties: Omit<ModelProperties, 'dimensions'> = {
  volume: 0,
  surfaceArea: 0,
  material: "N/A",
};

const instructorBaseModelProperties: Omit<ModelProperties, 'dimensions'> = {
  volume: 125000,
  surfaceArea: 15000,
  material: "Aluminum 6061",
};

const experiments = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

export default function StudentDashboardPage() {
  const [selectedExperiment, setSelectedExperiment] = useState<string>("");
  const [baseModel, setBaseModel] = useState<CadFile | null>(null);
  const [modifiedModel, setModifiedModel] = useState<CadFile | null>(null);
  const [baseProperties] = useState<Omit<ModelProperties, 'dimensions'>>(instructorBaseModelProperties);
  const [modifiedProperties, setModifiedProperties] = useState<Omit<ModelProperties, 'dimensions'>>(initialProperties);
  const [report, setReport] = useState<string | null>(null);
  const [deviation, setDeviation] = useState<number | null>(null);
  const [showDifferences, setShowDifferences] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isFetchingBaseModel, setIsFetchingBaseModel] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedExperiment) {
        // Reset dependant state when experiment changes
        setModifiedModel(null);
        setReport(null);
        setDeviation(null);
        setModifiedProperties(initialProperties);
        setBaseModel(null);
        
        setIsFetchingBaseModel(true);
        startTransition(async () => {
            const model = await getBaseModelForExperiment(selectedExperiment);
            if (model) {
                setBaseModel(model);
            } else {
                 toast({
                    variant: "destructive",
                    title: "Base Model Not Found",
                    description: `The instructor has not uploaded a base model for Experiment ${selectedExperiment} yet.`,
                });
            }
            setIsFetchingBaseModel(false);
        });
    }
  }, [selectedExperiment, toast]);


  const handleModifiedModelUpload = async (file: CadFile) => {
    setModifiedModel(file);
    // In a real app, you'd extract these properties from the file
    setModifiedProperties({
      volume: 128500,
      surfaceArea: 15500,
      material: "Aluminum 6061",
    });

    if(file.dataUri) {
        startTransition(async () => {
            try {
                const downloadUrl = await uploadFileToStorage(file.dataUri, `students/exp-${selectedExperiment}/${file.name}`);
                toast({
                    title: "File uploaded successfully",
                    description: `File ${file.name} is saved.`,
                });
                // you might want to store downloadUrl in your state
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "File upload failed",
                    description: (error as Error).message,
                });
            }
        });
    }
  };

  const handleGenerateReport = () => {
    if (!baseModel || !modifiedModel) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an experiment and upload your model to generate a report.",
      });
      return;
    }

    startTransition(async () => {
      const result = await generateComparisonReportAction({
        baseModelDataUri: baseModel.dataUri,
        modifiedModelDataUri: modifiedModel.dataUri,
      });

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Report Generation Failed",
          description: result.error,
        });
      } else {
        setReport(result.report ?? "No report was generated.");
        setDeviation(result.deviationPercentage ?? 0);
        toast({
          title: "Success",
          description: "Comparison report generated successfully.",
        });
      }
    });
  };

  const propertyDiffers = (key: keyof Omit<ModelProperties, 'dimensions' | 'material'>) => {
    return showDifferences && baseProperties[key] !== modifiedProperties[key];
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col h-full">
        <div className="mb-6 space-y-4">
            <div>
                <h1 className="text-3xl font-bold">Student Dashboard</h1>
                <p className="text-muted-foreground">Upload your work and compare it against the base model.</p>
            </div>
            <div className="max-w-md">
                <Label htmlFor="experiment-select-student">Experiment Number</Label>
                <Select onValueChange={setSelectedExperiment} value={selectedExperiment}>
                    <SelectTrigger id="experiment-select-student">
                        <div className="flex items-center gap-2">
                            <TestTube className="w-4 h-4 text-muted-foreground"/>
                            <SelectValue placeholder="Select an experiment to begin..." />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {experiments.map((exp) => (
                            <SelectItem key={exp} value={exp}>Experiment {exp}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        
      {selectedExperiment && (
        <>
            <div className="grid md:grid-cols-2 gap-8">
                <ModelViewer
                    title="Instructor's Base Model"
                    file={baseModel}
                    highlight={false}
                    data-ai-hint="cad base model"
                    isLoading={isFetchingBaseModel}
                />
                <ModelViewer
                    title="Your Model Submission"
                    onFileUpload={handleModifiedModelUpload}
                    file={modifiedModel}
                    highlight={showDifferences && !!baseModel}
                    data-ai-hint="3d model render"
                    disabled={!baseModel}
                />
            </div>

            <Card className="mt-4 md:mt-8 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Comparison Panel</CardTitle>
                <div className="flex items-center space-x-2">
                    <Highlighter className="w-5 h-5 text-accent" />
                    <Label htmlFor="diff-toggle">Highlight Differences</Label>
                    <Switch
                    id="diff-toggle"
                    checked={showDifferences}
                    onCheckedChange={setShowDifferences}
                    disabled={!baseModel || !modifiedModel}
                    />
                </div>
                </CardHeader>
                <CardContent>
                <Tabs defaultValue="properties">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="properties">Properties</TabsTrigger>
                        <TabsTrigger value="report">Comparison Report</TabsTrigger>
                    </TabsList>
                    <TabsContent value="properties" className="mt-4">
                     {!baseModel ? (
                         <div className="flex items-center justify-center p-8 text-muted-foreground">
                            <Info className="mr-2" /> Select an experiment with a base model to see properties.
                         </div>
                     ) : (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Property</TableHead>
                                <TableHead>Base Model</TableHead>
                                <TableHead>Your Model</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">Volume (mm³)</TableCell>
                                <TableCell className={cn(propertyDiffers('volume') && "bg-accent/20")}>{baseProperties.volume.toLocaleString()}</TableCell>
                                <TableCell className={cn(propertyDiffers('volume') && "bg-accent/20 text-accent-foreground font-bold")}>{modifiedModel ? modifiedProperties.volume.toLocaleString() : '---'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Surface Area (mm²)</TableCell>
                                <TableCell className={cn(propertyDiffers('surfaceArea') && "bg-accent/20")}>{baseProperties.surfaceArea.toLocaleString()}</TableCell>
                                <TableCell className={cn(propertyDiffers('surfaceArea') && "bg-accent/20 text-accent-foreground font-bold")}>{modifiedModel ? modifiedProperties.surfaceArea.toLocaleString() : '---'}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Material</TableCell>
                                <TableCell>{baseProperties.material}</TableCell>
                                <TableCell>{modifiedModel ? modifiedProperties.material : '---'}</TableCell>
                            </TableRow>
                            </TableBody>
                        </Table>
                     )}
                    </TabsContent>
                    <TabsContent value="report" className="mt-4">
                        <div className="flex flex-col space-y-4">
                            {!report && (
                                <Button onClick={handleGenerateReport} disabled={isPending || !baseModel || !modifiedModel}>
                                {isPending ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                    </>
                                ) : (
                                    "Generate Report"
                                )}
                                </Button>
                            )}
                            {report && (
                            <Card className="bg-secondary/50 p-4">
                                <CardHeader className="p-2 flex-row justify-between items-start">
                                    <div className="flex-grow">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Bot className="w-6 h-6 text-primary"/>
                                            AI Comparison Report
                                        </CardTitle>
                                    </div>
                                    {deviation !== null && (
                                        <div className="flex items-center gap-2 text-lg font-bold text-accent-foreground p-2 bg-accent/20 rounded-lg">
                                            <Percent className="w-5 h-5"/>
                                            <span>{deviation.toFixed(2)}% Deviation</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-2">
                                    <div className="prose prose-sm max-w-none text-foreground">
                                        {report.split('
').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                                    </div>
                                </CardContent>
                            </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
