import { Router } from 'express';
import authRoutes from './authRoutes';
import oauthRoutes from './oauthRoutes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/auth/oauth', oauthRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

export default router;
