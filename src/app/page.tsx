"use client";

import React, { useState, useTransition } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { generateComparisonReportAction } from "@/lib/actions";
import { cn } from "@/lib/utils";
import ModelViewer from "@/components/ModelViewer";
import type { CadFile, ModelProperties } from "@/lib/types";
import { Highlighter, Loader2, Bot, Percent } from "lucide-react";

const initialProperties: ModelProperties = {
  volume: 0,
  surfaceArea: 0,
  dimensions: { x: 0, y: 0, z: 0 },
  material: "N/A",
};

export default function DashboardPage() {
  const [baseModel, setBaseModel] = useState<CadFile | null>(null);
  const [modifiedModel, setModifiedModel] = useState<CadFile | null>(null);
  const [baseProperties, setBaseProperties] = useState<ModelProperties>(initialProperties);
  const [modifiedProperties, setModifiedProperties] = useState<ModelProperties>(initialProperties);
  const [report, setReport] = useState<string | null>(null);
  const [deviation, setDeviation] = useState<number | null>(null);
  const [showDifferences, setShowDifferences] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleBaseModelUpload = (file: CadFile) => {
    setBaseModel(file);
    // In a real app, you'd extract these properties from the file
    setBaseProperties({
      volume: 125000,
      surfaceArea: 15000,
      dimensions: { x: 50, y: 50, z: 50 },
      material: "Aluminum 6061",
    });
  };

  const handleModifiedModelUpload = (file: CadFile) => {
    setModifiedModel(file);
    // In a real app, you'd extract these properties from the file
    setModifiedProperties({
      volume: 128500,
      surfaceArea: 15500,
      dimensions: { x: 50, y: 52, z: 50 },
      material: "Aluminum 6061",
    });
  };

  const handleGenerateReport = () => {
    if (!baseModel || !modifiedModel) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload both a base and a modified model.",
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
  
  const dimensionDiffers = (axis: 'x' | 'y' | 'z') => {
    return showDifferences && baseProperties.dimensions[axis] !== modifiedProperties.dimensions[axis];
  }

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col h-full">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <ModelViewer
          title="Base Model"
          onFileUpload={handleBaseModelUpload}
          file={baseModel}
          highlight={showDifferences && !!modifiedModel}
          data-ai-hint="technical drawing blueprint"
        />
        <ModelViewer
          title="Modified Model"
          onFileUpload={handleModifiedModelUpload}
          file={modifiedModel}
          highlight={showDifferences && !!baseModel}
          data-ai-hint="3d model render"
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
            <TabsList>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="report">Comparison Report</TabsTrigger>
            </TabsList>
            <TabsContent value="properties" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Base Model</TableHead>
                    <TableHead>Modified Model</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Volume (mm³)</TableCell>
                    <TableCell className={cn(propertyDiffers('volume') && "bg-accent/20")}>{baseProperties.volume.toLocaleString()}</TableCell>
                    <TableCell className={cn(propertyDiffers('volume') && "bg-accent/20 text-accent-foreground font-bold")}>{modifiedProperties.volume.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Surface Area (mm²)</TableCell>
                    <TableCell className={cn(propertyDiffers('surfaceArea') && "bg-accent/20")}>{baseProperties.surfaceArea.toLocaleString()}</TableCell>
                    <TableCell className={cn(propertyDiffers('surfaceArea') && "bg-accent/20 text-accent-foreground font-bold")}>{modifiedProperties.surfaceArea.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Dimensions (mm)</TableCell>
                    <TableCell className={cn(dimensionDiffers('x') || dimensionDiffers('y') || dimensionDiffers('z') ? "bg-accent/20" : "")}>
                      {`X:${baseProperties.dimensions.x}, Y:${baseProperties.dimensions.y}, Z:${baseProperties.dimensions.z}`}
                    </TableCell>
                    <TableCell className={cn(dimensionDiffers('x') || dimensionDiffers('y') || dimensionDiffers('z') ? "bg-accent/20 text-accent-foreground font-bold" : "")}>
                      {`X:${modifiedProperties.dimensions.x}, Y:${modifiedProperties.dimensions.y}, Z:${modifiedProperties.dimensions.z}`}
                    </TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-medium">Material</TableCell>
                    <TableCell>{baseProperties.material}</TableCell>
                    <TableCell>{modifiedProperties.material}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="report" className="mt-4">
              <div className="flex flex-col space-y-4">
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
                            {report.split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                        </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
