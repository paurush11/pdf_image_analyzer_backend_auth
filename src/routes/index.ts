import { Router } from 'express';
import uploadRoutes from './uploadRoutes';
import jobRoutes from './jobRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/upload', uploadRoutes);
router.use('/jobs', jobRoutes);
router.use('/auth', authRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
