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

// This type is for the student-to-student check
export type PlagiarismFlag = {
  fileName: string;
  isFlagged: boolean;
  reason: string;
};

export type BackupFile = {
  id: string;
  name:string;
  timestamp: string;
  reportUrl: string; // link to a detailed report
  checkedBy: string;
};
