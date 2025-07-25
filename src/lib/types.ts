export type CadFile = {
  name: string;
  size: number; // in bytes
  dataUri: string;
};

export type ModelProperties = {
  volume: number; // in cubic mm
  surfaceArea: number; // in square mm
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  material: string;
};

export type PlagiarismReportItem = {
  fileDataUri: string;
  fileName: string; // I'll add this for UI
  isPlagiarized: boolean;
  similarityScore: number;
  explanation: string;
};

export type BackupFile = {
  id: string;
  name:string;
  timestamp: string;
  reportUrl: string; // link to a detailed report
  checkedBy: string;
};
