
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, File, RefreshCw, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CadFile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ModelViewerProps {
  title: string;
  file: CadFile | null;
  onFileUpload?: (file: CadFile) => void;
  highlight: boolean;
  'data-ai-hint'?: string;
}

export default function ModelViewer({
  title,
  file,
  onFileUpload,
  highlight,
  'data-ai-hint': dataAiHint
}: ModelViewerProps) {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onFileUpload) return;
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.toLowerCase().endsWith(".step") || selectedFile.name.toLowerCase().endsWith(".stp")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onFileUpload({
            name: selectedFile.name,
            size: selectedFile.size,
            dataUri: e.target?.result as string,
          });
        };
        reader.readAsDataURL(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a .step or .stp file.",
        });
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    if (!onFileUpload) return;
    // This is a conceptual reset. In a real app, you might need to clear more state.
    onFileUpload({ name: '', size: 0, dataUri: ''});
    if(fileInputRef.current) fileInputRef.current.value = "";
  }


  return (
    <Card className={cn(
        "flex flex-col transition-all duration-300 w-full",
        highlight && "ring-2 ring-accent shadow-accent/50 shadow-lg"
      )}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {file && file.name && onFileUpload && <Button variant="ghost" size="icon" onClick={handleReset}><RefreshCw className="w-4 h-4"/></Button>}
        </div>
        
        {file && file.name && (
          <CardDescription className="flex items-center gap-2 pt-2">
            <File className="w-4 h-4 text-muted-foreground" />
            <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        {file && file.dataUri ? (
          <div className="w-full aspect-video bg-secondary/50 rounded-lg overflow-hidden relative border">
             <Image 
                src="https://placehold.co/600x400.png"
                alt="3D Model Placeholder"
                fill={true}
                className="transition-transform duration-300 hover:scale-105"
                data-ai-hint={dataAiHint}
              />
          </div>
        ) : (
          <div className="w-full aspect-video bg-muted/30 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".step,.stp"
              disabled={!onFileUpload}
            />
            {onFileUpload ? (
                <>
                <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                Drag & drop a STEP file here, or click to upload
                </p>
                <Button onClick={handleUploadClick}>
                Upload File
                </Button>
                </>
            ) : (
                <>
                <Info className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                    The base model is provided by your instructor.
                </p>
                </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
