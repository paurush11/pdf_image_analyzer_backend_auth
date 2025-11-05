import { Router } from 'express';
import { getJob, getAllJob } from '../controllers/jobController';
import { downloadFile, deleteFile } from '../controllers/fileController';
import { validateJobId } from '../middleware/validation';

const router = Router();

router.get('/', getAllJob);
router.get('/:id', validateJobId, getJob);
router.get('/:id/download', validateJobId, downloadFile);
router.delete('/:id', validateJobId, deleteFile);

export default router;
