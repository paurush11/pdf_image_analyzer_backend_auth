import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { jobService } from '../services/jobService';

export const downloadFile = (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobService.getJob(id);
  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }
  const filepath = path.resolve('uploads', job.fileName);
  res.sendFile(filepath);
};

export const deleteFile = (req: Request, res: Response) => {
  const { id } = req.params;
  const job = jobService.getJob(id);
  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }
  const filepath = path.resolve('uploads', job.fileName);
  fs.unlinkSync(filepath);
  jobService.deleteJob(id);
  res.status(200).json({
    message: 'Job deleted succesfully !!',
  });
};
