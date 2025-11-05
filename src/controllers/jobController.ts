import { Request, Response } from 'express';
import { jobService } from '../services/jobService';

export const getJob = (req: Request, res: Response) => {
  const getId = req.params.id;
  const job = jobService.getJob(getId);
  if (!job) {
    res.status(400).json({
      message: 'No job available',
    });
    return;
  }
  res.json(job);
};

export const getAllJob = (req: Request, res: Response) => {
  const jobs = jobService.getAllJob();
  res.json(jobs);
};
