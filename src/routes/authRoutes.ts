import { Router } from 'express';
import {
  signUp,
  verifyEmail,
  login,
  refreshToken,
  verifyToken,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/jwtAuth';
const router = Router();

router.post('/signup', signUp);
router.post('/verify', verifyEmail);
router.post('/login', login);
router.get('/protected', authenticateToken, (req, res) => {
  const user = res.locals.user;
  res.json({
    message: "You're authenticated!",
    userId: user?.sub,
  });
});
router.post('/refresh', refreshToken);
router.post('/verify-token', verifyToken);

export default router;
