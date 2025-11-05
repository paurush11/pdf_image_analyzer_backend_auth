import { Request, Response } from 'express';
import { jobService } from '../services/jobService';
export const uploadFile = (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({
      message: 'No file is uploaded!!',
    });
    return;
  }
  const job = jobService.createJob({
    fileName: req.file.filename,
    originalName: req.file.originalname,
    fileSize: req.file.size,
  });

  res.status(201).json({
    message: 'file uploaded succesfully ',
    jobId: job.id,
    fileName: job.fileName,
  });
};
