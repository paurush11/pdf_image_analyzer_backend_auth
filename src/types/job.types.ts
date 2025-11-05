export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Ijob {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  status: JobStatus;
  uploadedAt: Date;
}
