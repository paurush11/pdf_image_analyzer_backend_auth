import { Router } from 'express';
import { uploadFile } from '../controllers/uploadController';
import { upload } from '../config/multerConfig';
import { validateUpload } from '../middleware/validation';

const router = Router();
router.post('/', upload.single('file'), validateUpload, uploadFile);
export default router;
