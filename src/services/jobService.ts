import { Ijob, JobStatus } from '../types/job.types';

export class JobService {
  private jobs = new Map<string, Ijob>();
  createJob(fileInfo: any): Ijob {
    const job: Ijob = {
      id: Date.now().toString(),
      fileName: fileInfo.fileName,
      originalName: fileInfo.originalName,
      fileSize: fileInfo.fileSize,
      status: JobStatus.PENDING,
      uploadedAt: new Date(),
    };
    this.jobs.set(job.id, job);
    return job;
  }
  getJob(id: string): Ijob | undefined {
    return this.jobs.get(id);
  }
  getAllJob(): Ijob[] {
    return Array.from(this.jobs.values());
  }
  deleteJob(id: string): boolean {
    const getJob = this.jobs.get(id);
    if (getJob) {
      this.jobs.delete(id);
      return true;
    }
    return false;
  }
}

export const jobService = new JobService();
